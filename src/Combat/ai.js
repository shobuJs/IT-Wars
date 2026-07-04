// Single-player opponent: a readable, tunable decision loop. The AI exposes
// the exact same controller interface as the keyboard (isDown/justPressed),
// so the combat engine can't tell the difference. No character names —
// personality comes from stats.ai on the character definition.
export const DIFFICULTY = {
  easy:   { reaction: 0.45, aggression: 0.35, blockSkill: 0.15, comboSkill: 0.25, specialIQ: 0.3,  mistake: 0.12 },
  normal: { reaction: 0.28, aggression: 0.55, blockSkill: 0.4,  comboSkill: 0.5,  specialIQ: 0.5,  mistake: 0.05 },
  hard:   { reaction: 0.16, aggression: 0.75, blockSkill: 0.7,  comboSkill: 0.8,  specialIQ: 0.75, mistake: 0.01 },
};

export function createAI(me, foe, difficulty = 'normal') {
  const P = { ...(DIFFICULTY[difficulty] || DIFFICULTY.normal) };
  const bias = me.stats.ai || {};
  P.aggression = Math.max(0.1, Math.min(0.95, P.aggression + (bias.aggroBias || 0)));
  const preferred = bias.preferredDist ?? 160;

  const held = Object.create(null);
  let pressed = Object.create(null);
  let decideT = 0;
  let plan = 'approach';
  let planT = 0;
  let blockT = 0;
  let dashTap = null;    // {dir, t} — second tap of the double-tap, pending

  function clear() { for (const k in held) held[k] = false; }
  function tap(action) { pressed[action] = true; }
  const roll = (p) => Math.random() < p;
  const pick = (options) => {
    let total = 0;
    for (const [, w] of options) total += w;
    let r = Math.random() * total;
    for (const [name, w] of options) { r -= w; if (r <= 0) return name; }
    return options[0][0];
  };

  function gapTo() {
    return Math.abs((foe.x + foe.w / 2) - (me.x + me.w / 2)) - me.w;
  }

  function decide() {
    const gap = gapTo();
    const towards = foe.x + foe.w / 2 > me.x + me.w / 2 ? 'right' : 'left';
    const away = towards === 'right' ? 'left' : 'right';

    // rage the moment it's up and we're in business range
    if (me.rage >= 100 && gap < 350 && roll(P.aggression)) { tap('rage'); plan = 'idle'; planT = 0.3; return; }

    // deliberate mistakes keep easy mode human
    if (roll(P.mistake)) { tap(roll(0.5) ? 'punch' : 'kick'); plan = 'idle'; planT = 0.3; return; }

    const wantFarther = gap < preferred - 80;

    if (gap > 280) {
      plan = pick([
        ['approach', 0.5],
        ['dashin', 0.25 * P.aggression],
        ['special', 0.35 * P.specialIQ],
        ['jumpin', 0.1],
      ]);
    } else if (gap > 120) {
      plan = pick([
        ['approach', gap > preferred + 60 ? 0.5 : 0.25],
        ['dashin', 0.25 * P.aggression],
        ['special', 0.3 * P.specialIQ],
        ['retreat', (wantFarther ? 0.5 : 0.15) * (1 - P.aggression)],
        ['idle', 0.1],
      ]);
    } else {
      plan = pick([
        ['attackLight', 0.5],
        ['attackHeavy', 0.3 * P.aggression],
        ['block', 0.25 * (1 - P.aggression)],
        ['retreat', wantFarther ? 0.35 : 0.1],
        ['jumpout', me.hp < me.maxHp * 0.25 ? 0.25 : 0.05],
      ]);
    }

    planT = 0.15 + Math.random() * 0.25;
    clear();
    switch (plan) {
      case 'approach': held[towards] = true; break;
      case 'retreat': held[away] = true; break;
      case 'dashin': tap(towards); dashTap = { dir: towards, t: 0.08 }; break;
      case 'jumpin': held[towards] = true; tap('up'); break;
      case 'jumpout': held[away] = true; tap('up'); break;
      case 'special': tap('special'); break;
      case 'attackLight': tap(roll(0.5) ? 'punch' : 'kick'); break;
      case 'attackHeavy': tap(roll(0.5) ? 'heavyPunch' : 'heavyKick'); break;
      case 'block': held.block = true; blockT = 0.35; break;
      case 'idle': break;
    }
  }

  return {
    isDown: (a) => !!held[a],
    justPressed: (a) => !!pressed[a],

    update(dt) {
      pressed = Object.create(null);
      planT -= dt;
      decideT -= dt;
      blockT -= dt;
      if (blockT <= 0) held.block = false;

      // second tap of a dash double-tap
      if (dashTap) {
        dashTap.t -= dt;
        if (dashTap.t <= 0) { tap(dashTap.dir); held[dashTap.dir] = true; dashTap = null; }
      }

      // no inputs while stunned/down/raging
      if (['hitstun', 'blockstun', 'knockdown', 'getup', 'launched', 'ko', 'rage', 'victory'].includes(me.state)) {
        clear();
        return;
      }

      // threat reaction (not gated on the decision timer): block incoming attacks
      if (foe.state === 'attack' && foe.move && foe.stateT < foe.move.startup) {
        if (gapTo() < 140 && Math.random() < P.blockSkill * dt * 30) {
          clear();
          if (Math.random() < 0.15) tap('up');
          else { held.block = true; blockT = 0.3 + P.reaction; }
          return;
        }
      }

      // combo follow-up: chain while the hit is confirmed
      if (me.state === 'attack' && me.hasHit && me.move && me.move.chain &&
          me.stateT > me.move.startup + me.move.active && Math.random() < P.comboSkill * dt * 40) {
        tap(Math.random() < 0.6
          ? (me.moveName === 'kick' ? 'kick' : 'punch')
          : (me.moveName === 'kick' ? 'heavyKick' : 'heavyPunch'));
      }

      if (decideT <= 0) {
        decideT = P.reaction * (0.8 + Math.random() * 0.4);
        decide();
      }
    },
  };
}
