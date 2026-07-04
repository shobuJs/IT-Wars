import { drawAxeSprite } from './sprite.js';

// Leviathan Throw: axe flies out, boomerangs back, hits both ways.
// Kratos can't attack again until it returns (axeOut gates re-activation
// and the sprite shows the empty raised hand).
export const special = {
  id: 'leviathanThrow', name: 'LEVIATHAN THROW', icon: '🪓',
  kind: 'special', cooldown: 5.0,
  canActivate(f) { return !f.sp.axe; },
  onActivate(f, api) {
    f.sp.axe = {
      x: f.face > 0 ? f.x + f.w : f.x, y: f.y + 22,
      dir: f.face, dist: 0, phase: 'out', spin: 0, hitOut: false, hitBack: false,
    };
    api.sfx('whoosh');
  },
  onUpdate(f, api, dt) {
    const a = f.sp.axe;
    if (!a) return;
    a.spin += dt * 18;
    if (a.phase === 'out') {
      const step = 620 * dt;
      a.x += a.dir * step; a.dist += step;
      if (!a.hitOut && api.tryHit(f, { x: a.x - 14, y: a.y - 12, w: 28, h: 24 },
          { dmg: 14, hitstun: 0.4, blockstun: 0.2, knockback: 240, chip: 0.25, sfx: 'thunk' })) {
        a.hitOut = true;
      }
      if (a.dist >= 420 || a.x < api.arena.bounds.left || a.x > api.arena.bounds.right) {
        a.phase = 'back'; api.sfx('recall');
      }
    } else {
      // home back to kratos's hand
      const hx = f.x + f.w / 2, hy = f.y + 22;
      const dx = hx - a.x, dy = hy - a.y;
      const d = Math.hypot(dx, dy) || 1;
      a.x += (dx / d) * 950 * dt; a.y += (dy / d) * 950 * dt;
      if (!a.hitBack && api.tryHit(f, { x: a.x - 14, y: a.y - 12, w: 28, h: 24 },
          { dmg: 8, hitstun: 0.3, blockstun: 0.15, knockback: 180, chip: 0.25, sfx: 'thunk' })) {
        a.hitBack = true;
      }
      if (d < 24) { f.sp.axe = null; api.sfx('catchAxe'); }
    }
  },
  onDraw(f, api, g) {
    const a = f.sp.axe;
    if (!a) return;
    g.save();
    g.translate(a.x, a.y);
    g.rotate(a.spin);
    g.scale(1.6, 1.6);
    drawAxeSprite(g, a.dir < 0);
    g.restore();
  },
};

// Spartan Rage: lunge across the arena into a 4-hit flurry.
export const rage = {
  id: 'spartanRage', name: 'SPARTAN RAGE', icon: '😡',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    f.sp.spartan = { phase: 'lunge', t: 0.28, hits: 4, hitT: 0 };
    api.sfx('roar');
    api.flash('rgba(255,32,16,0.35)', 0.4);
  },
  onUpdate(f, api, dt) {
    const s = f.sp.spartan;
    if (!s) return;
    const foe = api.opponentOf(f);
    if (s.phase === 'lunge') {
      s.t -= dt;
      const dir = foe.x + foe.w / 2 > f.x + f.w / 2 ? 1 : -1;
      f.face = dir;
      const gap = Math.abs((foe.x + foe.w / 2) - (f.x + f.w / 2));
      if (gap > 70) f.x += dir * 1100 * dt;
      if (s.t <= 0 || gap <= 70) { s.phase = 'flurry'; s.hitT = 0; }
    } else {
      s.hitT -= dt;
      if (s.hitT <= 0 && s.hits > 0) {
        s.hits--; s.hitT = 0.18;
        const last = s.hits === 0;
        api.tryHit(f, { x: f.face > 0 ? f.x + f.w - 6 : f.x - 64, y: f.y + 6, w: 70, h: 60 },
          { dmg: 8, hitstun: 0.32, blockstun: 0.16, knockback: last ? 380 : 60,
            knockdown: last, chip: 0.3, sfx: last ? 'gore' : 'thunk' });
        api.shake(6);
      }
      if (s.hits <= 0 && s.hitT <= 0) { f.sp.spartan = null; f.rageActive = false; }
    }
  },
};
