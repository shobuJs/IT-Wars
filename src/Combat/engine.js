// Office Combat core: fighter state machine, hit resolution, combos,
// projectiles, ability API. 100% character-agnostic — everything flows in
// from the character definitions and the arena.
import { aabb, clamp } from '../Shared/math.js';
import { SFX } from '../Shared/audio.js';
import { createDialogs } from './dialogs.js';

const GRAV = 1500;
const MAXFALL = 1000;
export const FIGHT_SCALE = 3.0;
const BODY_W = 22 * FIGHT_SCALE;
const BODY_H = 30 * FIGHT_SCALE;
// move hitboxes are authored against a 2.5× body — rescale with the sprite
const HB = FIGHT_SCALE / 2.5;
const COMBO_SCALE = [1, 0.85, 0.7, 0.55];
const CHAIN_NEXT = {
  punch: ['punch', 'kick', 'heavyPunch'],
  kick: ['kick', 'heavyKick'],
};
const ATTACK_ACTIONS = ['punch', 'kick', 'heavyPunch', 'heavyKick'];

function createFighter(char, controller, side) {
  return {
    char, controller, side,
    kit: char.moves,
    stats: char.stats,
    x: 0, y: 0, w: BODY_W, h: BODY_H,
    vx: 0, vy: 0, onGround: true, face: side === 'left' ? 1 : -1,
    hp: char.stats.maxHealth, maxHp: char.stats.maxHealth,
    rage: 0, rageActive: false,
    state: 'idle', stateT: 0, stunT: 0,
    move: null, moveName: null, hasHit: false, chainDepth: 0,
    comboHits: 0, comboDmg: 0, juggleHits: 0,
    airAttackUsed: false,
    specialCd: 0,
    lastTapDir: 0, lastTapT: 99,
    anim: 0, idleT: 0,
    sp: {},          // ability scratch space
    roundWins: 0,
  };
}

function cx(f) { return f.x + f.w / 2; }
function hurtbox(f) {
  if (f.state === 'crouch') return { x: f.x, y: f.y + f.h * 0.4, w: f.w, h: f.h * 0.6 };
  return { x: f.x, y: f.y, w: f.w, h: f.h };
}
function invulnerable(f) {
  return f.state === 'knockdown' || f.state === 'getup' || f.state === 'ko' || f.state === 'victory';
}
function neutralGround(f) {
  return f.onGround && (f.state === 'idle' || f.state === 'walk' || f.state === 'crouch' || f.state === 'block');
}

export function createFight({ arena, leftChar, rightChar, leftController, rightController, particles, fx }) {
  const left = createFighter(leftChar, leftController, 'left');
  const right = createFighter(rightChar, rightController, 'right');
  const fighters = [left, right];
  let projectiles = [];
  let enabled = false;
  let cinematic = null;          // {t, name, color, after}
  let debug = false;
  const dialogs = createDialogs();

  const api = {
    arena,
    aabb,
    opponentOf: (f) => (f === left ? right : left),
    sfx: (name) => SFX[name] && SFX[name](),
    text: (x, y, txt, color, size) => particles.text(x, y, txt, color, size),
    sparks: (x, y, color, n) => particles.sparks(x, y, color, n),
    blood: (x, y, dir, n) => particles.blood(x, y, dir, n),
    gibs: (x, y, dir) => particles.gibs(x, y, dir),
    shake: (n) => fx.shake(n),
    flash: (color, dur) => fx.flash(color, dur),
    freeze: (sec) => fx.freeze(sec),
    spawnProjectile(owner, def) {
      projectiles.push({ ...def, owner, rot: 0, t: 0 });
    },
    tryHit(attacker, rect, hitDef) {
      const victim = api.opponentOf(attacker);
      if (invulnerable(victim)) return false;
      if (!aabb(rect, hurtbox(victim))) return false;
      resolveHit(attacker, victim, hitDef, rect.x + rect.w / 2, rect.y + rect.h / 2);
      return true;
    },
  };

  function positionForRound() {
    const mid = (arena.bounds.left + arena.bounds.right) / 2;
    left.x = mid - 220 - BODY_W / 2;
    right.x = mid + 220 - BODY_W / 2;
    for (const f of fighters) {
      f.y = arena.floorY - BODY_H;
      f.vx = 0; f.vy = 0; f.onGround = true;
      f.state = 'idle'; f.stateT = 0;
      f.move = null; f.hasHit = false; f.chainDepth = 0;
      f.comboHits = 0; f.comboDmg = 0; f.juggleHits = 0;
      f.airAttackUsed = false;
      f.rageActive = false;
      f.sp = {};
      f.face = f === left ? 1 : -1;
    }
    left.hp = left.maxHp;
    right.hp = right.maxHp;
    projectiles = [];
    cinematic = null;
  }
  positionForRound();

  function startAttack(f, name, chainDepth = 0, fromDash = false) {
    const m = f.onGround ? f.kit[name] : f.kit.air;
    if (!m) return;
    f.state = 'attack';
    f.stateT = 0;
    f.move = m;
    f.moveName = f.onGround ? name : 'air';
    f.hasHit = false;
    f.chainDepth = chainDepth;
    if (f.onGround) f.vx = fromDash ? f.vx * 0.5 : 0;
    else f.airAttackUsed = true;
  }

  function resolveHit(attacker, victim, hit, hx, hy) {
    const dir = cx(victim) >= cx(attacker) ? 1 : -1;
    const blocking = (victim.state === 'block' || victim.state === 'blockstun') && victim.onGround;

    if (blocking && !hit.unblockable) {
      const raw = hit.dmg * (attacker.stats.strength || 1) * (victim.stats.defense || 1);
      const chip = raw * (hit.chip ?? 0.15);
      victim.hp = Math.max(1, victim.hp - chip);           // chip can't KO
      victim.state = 'blockstun';
      victim.stunT = hit.blockstun ?? 0.15;
      victim.stateT = 0;
      victim.vx = dir * (hit.knockback ?? 100) * 0.35;
      attacker.rage = clamp(attacker.rage + raw * 0.2, 0, 100);
      victim.rage = clamp(victim.rage + raw * 0.15, 0, 100);
      if (attacker.onGround && attacker.state === 'attack') attacker.vx = -dir * (hit.knockback ?? 100) * 0.2;
      particles.sparks(hx, hy, '#bfe8ff', 6);
      SFX.block();
      fx.freeze(0.03);
      return;
    }

    const scale = COMBO_SCALE[Math.min(attacker.comboHits, 3)] ?? 0.4;
    const dmg = hit.dmg * (attacker.stats.strength || 1) * (victim.stats.defense || 1) * Math.max(0.4, scale);
    victim.hp -= dmg;
    attacker.rage = clamp(attacker.rage + dmg * 0.45, 0, 100);
    victim.rage = clamp(victim.rage + dmg * 0.35, 0, 100);
    attacker.comboHits++;
    attacker.comboDmg += dmg;

    // juice — scaled to the weight of the hit
    const heavy = hit.dmg >= 10;
    fx.freeze(heavy ? 0.11 : 0.05);
    fx.shake(heavy ? 6 : 2);
    particles.sparks(hx, hy, heavy ? '#ffd93d' : '#fff', heavy ? 10 : 6);
    if (dmg >= 10) particles.blood(hx, hy, dir, 16);
    else if (dmg >= 5) particles.blood(hx, hy, dir, 6);
    if (hit.sfx && SFX[hit.sfx]) SFX[hit.sfx]();
    else heavy ? SFX.thunk() : SFX.hitLight();

    if (victim.hp <= 0) {
      victim.hp = 0;
      victim.state = 'ko';
      victim.stateT = 0;
      victim.vx = dir * 260;
      victim.vy = -340;
      victim.onGround = false;
      particles.blood(hx, hy, dir, 40);
      if (heavy) particles.gibs(cx(victim), victim.y + victim.h / 2, dir);
      SFX.gore();
      fx.shake(16);
      fx.flash('rgba(255,0,0,0.35)', 0.5);
      return;
    }

    // office trash talk — attacker mocks the victim's job role
    dialogs.onHit(attacker, victim, heavy);

    if (hit.launch && victim.juggleHits < 1) {
      victim.state = 'launched';
      victim.stateT = 0;
      victim.vy = -hit.launch;
      victim.vx = dir * (hit.knockback ?? 200) * 0.6;
      victim.onGround = false;
      victim.juggleHits++;
    } else if (hit.knockdown || (!victim.onGround && victim.juggleHits >= 1)) {
      victim.state = 'launched';   // falls into knockdown on landing
      victim.stateT = 0;
      victim.vy = Math.min(victim.vy, -180);
      victim.vx = dir * (hit.knockback ?? 240) * 0.8;
      victim.onGround = false;
    } else {
      victim.state = 'hitstun';
      victim.stunT = hit.hitstun ?? 0.25;
      victim.stateT = 0;
      victim.vx = dir * (hit.knockback ?? 100);
      if (!victim.onGround) victim.vy = Math.min(victim.vy, -120);
    }
    // getting hit cancels whatever the victim was doing
    victim.move = null;
  }

  function tryStartRage(f) {
    const ability = f.char.abilities.rage;
    if (!ability || f.rage < (ability.cost ?? 100)) return false;
    if (!neutralGround(f) && f.state !== 'jump') return false;
    if (ability.canActivate && !ability.canActivate(f, api)) return false;
    f.rage = 0;
    f.rageActive = true;
    f.state = 'rage';
    f.stateT = 0;
    f.vx = 0;
    cinematic = {
      t: 0.6, name: ability.name, color: f.char.palette.accent,
      after: () => ability.onActivate && ability.onActivate(f, api),
    };
    fx.flash('rgba(255,255,255,0.5)', 0.3);
    SFX.power();
    return true;
  }

  function trySpecial(f) {
    const ability = f.char.abilities.special;
    if (!ability || f.specialCd > 0) return false;
    if (ability.canActivate && !ability.canActivate(f, api)) return false;
    f.specialCd = ability.cooldown ?? 4;
    f.state = 'cast';
    f.stateT = 0;
    f.vx = 0;
    ability.onActivate && ability.onActivate(f, api);
    return true;
  }

  function updateFighter(f, dt) {
    const c = f.controller;
    const foe = api.opponentOf(f);
    f.stateT += dt;
    f.specialCd = Math.max(0, f.specialCd - dt);
    f.lastTapT += dt;

    // face the opponent (neutral states only — never mid-attack or in stun)
    if (neutralGround(f)) f.face = cx(foe) >= cx(f) ? 1 : -1;

    const dirHeld = (c.isDown('right') ? 1 : 0) - (c.isDown('left') ? 1 : 0);

    switch (f.state) {
      case 'idle':
      case 'walk': {
        f.idleT = Math.abs(f.vx) < 5 ? f.idleT + dt : 0;
        // dash: double-tap
        for (const [act, d] of [['left', -1], ['right', 1]]) {
          if (c.justPressed(act)) {
            if (f.lastTapDir === d && f.lastTapT < 0.25) {
              f.state = 'dash'; f.stateT = 0; f.vx = d * f.stats.walkSpeed * 2.4;
              SFX.whoosh();
            }
            f.lastTapDir = d; f.lastTapT = 0;
          }
        }
        if (f.state === 'dash') break;

        if (dirHeld !== 0) {
          const backpedal = dirHeld !== f.face;
          f.vx = dirHeld * f.stats.walkSpeed * (backpedal ? 0.75 : 1);
          f.state = 'walk';
          f.anim += dt * 10;
        } else {
          f.vx = 0;
          f.state = 'idle';
        }
        if (c.isDown('down')) { f.state = 'crouch'; f.vx = 0; break; }
        if (c.isDown('block')) { f.state = 'block'; f.vx = 0; break; }
        if (c.justPressed('up')) {
          f.vy = -f.stats.jumpVy; f.onGround = false; f.state = 'jump'; SFX.jump();
          break;
        }
        for (const act of ATTACK_ACTIONS) {
          if (c.justPressed(act)) { startAttack(f, act); break; }
        }
        if (f.state !== 'attack') {
          if (c.justPressed('special')) trySpecial(f);
          else if (c.justPressed('rage')) tryStartRage(f);
        }
        break;
      }

      case 'crouch': {
        f.vx = 0;
        if (!c.isDown('down')) { f.state = 'idle'; break; }
        for (const act of ATTACK_ACTIONS) {
          if (c.justPressed(act)) { startAttack(f, act); break; }
        }
        break;
      }

      case 'block': {
        f.vx = 0;
        if (!c.isDown('block')) f.state = 'idle';
        break;
      }

      case 'dash': {
        if (f.stateT > 0.10) {
          for (const act of ATTACK_ACTIONS) {
            if (c.justPressed(act)) { startAttack(f, act, 0, true); break; }
          }
        }
        if (f.state === 'dash' && f.stateT >= 0.22) { f.state = 'idle'; f.vx = 0; }
        break;
      }

      case 'jump': {
        if (dirHeld !== 0) f.vx = dirHeld * f.stats.walkSpeed * 0.6;
        if (!f.airAttackUsed) {
          for (const act of ATTACK_ACTIONS) {
            if (c.justPressed(act)) { startAttack(f, act); break; }
          }
        }
        break;
      }

      case 'attack': {
        const m = f.move;
        if (!m) { f.state = f.onGround ? 'idle' : 'jump'; break; }
        const total = m.startup + m.active + m.recovery;
        const phase = f.stateT < m.startup ? 'startup'
          : f.stateT < m.startup + m.active ? 'active' : 'recovery';
        if (phase === 'active' && !f.hasHit) {
          const hb = m.hitbox;
          const rect = {
            x: cx(f) + f.face * hb.ox * HB - hb.w * HB / 2,
            y: f.y + hb.oy * HB,
            w: hb.w * HB, h: hb.h * HB,
          };
          if (api.tryHit(f, rect, m)) f.hasHit = true;
        }
        // chain cancel: first 0.15s of recovery, on hit only, lights only
        if (phase === 'recovery' && f.hasHit && m.chain && f.chainDepth < 2 &&
            f.stateT - (m.startup + m.active) <= 0.15 && f.onGround) {
          for (const next of CHAIN_NEXT[f.moveName] || []) {
            if (c.justPressed(next)) { startAttack(f, next, f.chainDepth + 1); break; }
          }
        }
        if (f.state === 'attack' && f.stateT >= total) {
          f.state = f.onGround ? 'idle' : 'jump';
          f.move = null;
        }
        break;
      }

      case 'cast': {
        if (f.stateT >= 0.3) f.state = 'idle';
        break;
      }

      case 'rage': {
        // ability's onUpdate drives everything; safety valve if it stalls
        if (!f.rageActive || f.stateT > 8) { f.rageActive = false; f.state = 'idle'; }
        break;
      }

      case 'hitstun':
      case 'blockstun': {
        f.vx *= Math.max(0, 1 - 6 * dt);
        if (f.stateT >= f.stunT) f.state = f.onGround ? (f.state === 'blockstun' && c.isDown('block') ? 'block' : 'idle') : 'jump';
        break;
      }

      case 'launched': {
        // airborne ragdoll — lands into knockdown (handled on landing)
        break;
      }

      case 'knockdown': {
        f.vx = 0;
        if (f.stateT >= 0.7) { f.state = 'getup'; f.stateT = 0; }
        break;
      }

      case 'getup': {
        if (f.stateT >= 0.3) { f.state = 'idle'; f.juggleHits = 0; }
        break;
      }

      case 'ko':
      case 'victory':
        break;
    }

    // ---- physics
    if (!f.onGround) {
      f.vy = Math.min(MAXFALL, f.vy + GRAV * dt);
      f.y += f.vy * dt;
      if (f.y + f.h >= arena.floorY && f.vy > 0) {
        f.y = arena.floorY - f.h;
        f.vy = 0;
        f.onGround = true;
        f.airAttackUsed = false;
        if (f.state === 'launched') { f.state = 'knockdown'; f.stateT = 0; particles.blood(cx(f), arena.floorY - 6, f.vx > 0 ? 1 : -1, 8); SFX.splat(); fx.shake(4); }
        else if (f.state === 'ko') { f.vx *= 0.4; }
        else if (f.state === 'jump' || f.state === 'attack') { if (f.state === 'jump') f.state = 'idle'; }
      }
    }
    f.x += f.vx * dt;
    f.x = clamp(f.x, arena.bounds.left, arena.bounds.right - f.w);
  }

  function pushApart() {
    if (invulnerable(left) || invulnerable(right)) return;
    if (left.state === 'launched' || right.state === 'launched') return;
    const a = left, b = right;
    if (!aabb(a, b)) return;
    const overlap = (a.x + a.w / 2 < b.x + b.w / 2)
      ? (a.x + a.w) - b.x
      : (b.x + b.w) - a.x;
    const dir = a.x + a.w / 2 < b.x + b.w / 2 ? 1 : -1;
    const aAtWall = a.x <= arena.bounds.left + 1 || a.x + a.w >= arena.bounds.right - 1;
    const bAtWall = b.x <= arena.bounds.left + 1 || b.x + b.w >= arena.bounds.right - 1;
    if (aAtWall && !bAtWall) b.x += dir * overlap;
    else if (bAtWall && !aAtWall) a.x -= dir * overlap;
    else { a.x -= dir * overlap / 2; b.x += dir * overlap / 2; }
    a.x = clamp(a.x, arena.bounds.left, arena.bounds.right - a.w);
    b.x = clamp(b.x, arena.bounds.left, arena.bounds.right - b.w);
  }

  function updateProjectiles(dt) {
    for (const pr of projectiles) {
      pr.t += dt;
      if (pr.gravity) pr.vy = (pr.vy || 0) + pr.gravity * dt;
      pr.x += pr.vx * dt;
      pr.y += (pr.vy || 0) * dt;
      if (pr.spin) pr.rot += pr.spin * dt;

      const foe = api.opponentOf(pr.owner);
      if (!pr.dead && !invulnerable(foe) && aabb(pr, hurtbox(foe))) {
        resolveHit(pr.owner, foe, { ...pr, sfx: pr.hitSfx }, pr.x + pr.w / 2, pr.y + pr.h / 2);
        pr.onHit && pr.onHit(pr, api);
        if (!pr.pierce) pr.dead = true;
      }
      if (!pr.dead && pr.y + pr.h >= arena.floorY) {
        pr.onLand && pr.onLand(pr, api);
        pr.dead = true;
      }
      if (pr.x < arena.bounds.left - 200 || pr.x > arena.bounds.right + 200 || pr.t > 6) pr.dead = true;
    }
    projectiles = projectiles.filter(pr => !pr.dead);
  }

  return {
    left, right, api,
    get cinematic() { return cinematic; },
    get debug() { return debug; },
    toggleDebug() { debug = !debug; },
    setEnabled(v) { enabled = v; },
    resetRound() { positionForRound(); dialogs.clear(); },   // rage meters persist by design

    update(dt) {
      if (cinematic) {
        cinematic.t -= dt;
        if (cinematic.t <= 0) { const after = cinematic.after; cinematic = null; after && after(); }
        return;
      }
      if (fx.hitstop > 0) { particles.update(dt * 0.3); return; }
      if (enabled) {
        for (const f of fighters) updateFighter(f, dt);
        pushApart();
        updateProjectiles(dt);
        for (const f of fighters) {
          for (const kind of ['special', 'rage']) {
            const ab = f.char.abilities[kind];
            ab && ab.onUpdate && ab.onUpdate(f, api, dt);
          }
          // combo drops once the victim is back in a neutral state
          const foe = api.opponentOf(f);
          if (f.comboHits > 0 && !['hitstun', 'launched', 'blockstun', 'ko'].includes(foe.state)) {
            f.comboHits = 0; f.comboDmg = 0;
          }
        }
      }
      particles.update(dt);
      dialogs.update(dt, fighters);
    },

    sayVictory(side) {
      dialogs.onVictory(side === 'left' ? left : right);
    },

    snapshot() {
      const side = (f) => ({
        name: f.char.name, hp: f.hp, maxHp: f.maxHp, rage: f.rage,
        combo: f.comboHits, comboDmg: f.comboDmg,
        specialCd: f.specialCd, specialMax: f.char.abilities.special?.cooldown ?? 1,
        specialIcon: f.char.abilities.special?.icon ?? '⚡',
        accent: f.char.palette.accent,
      });
      const over = left.state === 'ko' || right.state === 'ko';
      return {
        left: side(left), right: side(right), over,
        winner: left.state === 'ko' ? 'right' : right.state === 'ko' ? 'left' : null,
      };
    },

    render(g, clock) {
      for (const f of fighters) drawFighter(g, f, clock);
      for (const pr of projectiles) pr.draw && pr.draw(g, pr, clock);
      for (const f of fighters) {
        for (const kind of ['special', 'rage']) {
          const ab = f.char.abilities[kind];
          ab && ab.onDraw && ab.onDraw(f, api, g);
        }
      }
      particles.render(g);
      particles.renderTexts(g);
      dialogs.render(g);
      if (debug) renderDebug(g);
    },
  };

  function renderDebug(g) {
    for (const f of fighters) {
      const hb = hurtbox(f);
      g.strokeStyle = 'rgba(60,255,60,0.8)'; g.lineWidth = 1;
      g.strokeRect(hb.x, hb.y, hb.w, hb.h);
      if (f.state === 'attack' && f.move) {
        const m = f.move;
        const phase = f.stateT < m.startup ? 0 : f.stateT < m.startup + m.active ? 1 : 2;
        if (phase === 1) {
          const r = { x: cx(f) + f.face * m.hitbox.ox * HB - m.hitbox.w * HB / 2, y: f.y + m.hitbox.oy * HB, w: m.hitbox.w * HB, h: m.hitbox.h * HB };
          g.strokeStyle = 'rgba(255,60,60,0.9)';
          g.strokeRect(r.x, r.y, r.w, r.h);
        }
      }
      g.fillStyle = '#fff'; g.font = '10px monospace'; g.textAlign = 'center';
      g.fillText(f.state, cx(f), f.y - 6);
    }
    for (const pr of projectiles) {
      g.strokeStyle = 'rgba(255,180,60,0.9)';
      g.strokeRect(pr.x, pr.y, pr.w, pr.h);
    }
  }

  // ---- fighter rendering: legacy body sprites at fight scale + pose overlays
  function drawFighter(g, f, clock) {
    const foe = api.opponentOf(f);
    const S = FIGHT_SCALE;
    g.save();
    g.translate(f.x, f.y);

    // state transforms (about the feet: sprite feet at y=30 in sprite space)
    g.scale(S, S);
    const feetY = 30;
    if (f.state === 'crouch') {
      g.translate(0, feetY); g.scale(1, 0.65); g.translate(0, -feetY);
    } else if (f.state === 'hitstun') {
      g.translate((Math.random() - 0.5) * 1.5, 0);
      g.translate(11, feetY); g.rotate(-f.face * 0.14); g.translate(-11, -feetY);
    } else if (f.state === 'launched') {
      g.translate(11, feetY); g.rotate(-f.face * 0.55); g.translate(-11, -feetY);
    } else if (f.state === 'knockdown' || f.state === 'ko') {
      g.translate(11, feetY); g.rotate(f.face * -1.5); g.translate(-11, -feetY);
      g.translate(0, 4);
    } else if (f.state === 'getup') {
      const k = 1 - f.stateT / 0.3;
      g.translate(11, feetY); g.rotate(f.face * -1.5 * k); g.translate(-11, -feetY);
    } else if (f.state === 'victory') {
      g.translate(0, -Math.abs(Math.sin(f.stateT * 5)) * 3);
    }

    const pose = {
      x: 0, y: 0, w: 22, h: 30,
      face: f.face,
      vx: f.state === 'walk' || f.state === 'dash' ? f.vx : 0,
      anim: f.anim,
      onGround: f.onGround,
      big: false,
      raging: f.rageActive ? 1 : 0,
      axeOut: !!f.sp.axe,
      fireCd: 0,
      smoking: f.idleT > 3 && f.char.id === 'sickman',
      thinking: f.idleT > 3 && f.char.id === 'mrb',
    };
    f.char.sprite.draw(g, pose, clock);

    // ---- pose overlays (sprite space, 22×30)
    const skin = f.char.sprite.skin || '#c98f5f';
    if (f.state === 'attack' && f.move) {
      const m = f.move;
      const ext = f.stateT < m.startup ? (f.stateT / m.startup) * 0.4
        : f.stateT < m.startup + m.active ? 1
        : Math.max(0, 1 - (f.stateT - m.startup - m.active) / m.recovery);
      const reach = (m.hitbox.ox + m.hitbox.w / 2) / 2.5 - 10;   // hitboxes authored at 2.5×
      const isPunch = f.moveName === 'punch' || f.moveName === 'heavyPunch';
      const isAir = f.moveName === 'air';
      const heavy = f.moveName === 'heavyPunch' || f.moveName === 'heavyKick';
      if (isAir) {
        // flying kick
        const L = ext * (reach + 4);
        g.fillStyle = '#333';
        if (f.face > 0) { g.fillRect(20, 22, L, 3.5); g.fillRect(18 + L, 21, 5, 5); }
        else { g.fillRect(2 - L, 22, L, 3.5); g.fillRect(-1 - L, 21, 5, 5); }
      } else if (isPunch) {
        const ay = heavy ? 12 : 14;
        const L = ext * reach;
        g.fillStyle = skin;
        if (f.face > 0) { g.fillRect(20, ay, L, heavy ? 3.5 : 2.5); g.fillRect(19 + L, ay - 1, 4.5, heavy ? 5.5 : 4.5); }
        else { g.fillRect(2 - L, ay, L, heavy ? 3.5 : 2.5); g.fillRect(-1.5 - L, ay - 1, 4.5, heavy ? 5.5 : 4.5); }
      } else {
        const ly = heavy ? 20 : 23;
        const L = ext * reach;
        g.fillStyle = f.char.id === 'kratos' ? '#4a3826' : '#3a3f4a';
        if (f.face > 0) { g.fillRect(19, ly, L, heavy ? 4 : 3); } else { g.fillRect(3 - L, ly, L, heavy ? 4 : 3); }
        g.fillStyle = '#333';
        if (f.face > 0) g.fillRect(17 + L, ly - 1, 5.5, heavy ? 5.5 : 4.5);
        else g.fillRect(-2.5 - L, ly - 1, 5.5, heavy ? 5.5 : 4.5);
      }
    } else if (f.state === 'block' || f.state === 'blockstun') {
      // crossed guard arms
      g.fillStyle = skin;
      const bx = f.face > 0 ? 16 : -2;
      g.fillRect(bx, 10, 8, 3);
      g.fillRect(bx + 1, 14, 8, 3);
      g.strokeStyle = 'rgba(191,232,255,0.5)'; g.lineWidth = 1;
      g.strokeRect(bx - 1, 8, 11, 11);
    } else if (f.state === 'victory') {
      g.fillStyle = skin;
      g.fillRect(f.face > 0 ? 19 : 0, 2, 3, 11);
      g.fillRect(f.face > 0 ? 18.5 : -0.5, 0, 4, 3);
    }

    // hit tint
    if (f.state === 'hitstun' || f.state === 'launched') {
      g.globalAlpha = 0.3;
      g.fillStyle = '#ff2020';
      g.fillRect(-2, -3, 26, 35);
      g.globalAlpha = 1;
    }
    g.restore();

    // blood pool under KO'd fighter
    if (f.state === 'ko' && f.onGround) {
      const grow = Math.min(1, f.stateT / 1.4);
      g.fillStyle = 'rgba(122,8,8,0.7)';
      g.beginPath();
      g.ellipse(cx(f), arena.floorY - 2, 50 * grow + 12, 8 * grow + 2, 0, 0, 7);
      g.fill();
    }
  }
}
