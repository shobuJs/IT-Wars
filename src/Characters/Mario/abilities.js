// Plumber's Burst (special) / Massacre Mode (rage) — hooks per the ability
// contract; the combat engine drives these generically.
export const special = {
  id: 'plumberBurst', name: "PLUMBER'S BURST", icon: '🔫',
  kind: 'special', cooldown: 4.0,
  onActivate(f, api) {
    f.sp.burst = { left: 3, t: 0 };
    api.sfx('shoot');
  },
  onUpdate(f, api, dt) {
    const b = f.sp.burst;
    if (!b || b.left <= 0) return;
    b.t -= dt;
    if (b.t <= 0) {
      b.left--; b.t = 0.09;
      api.sfx('shoot');
      api.spawnProjectile(f, {
        x: f.face > 0 ? f.x + f.w : f.x - 14, y: f.y + 24,
        w: 12, h: 5, vx: f.face * 520, vy: 0,
        dmg: 5, hitstun: 0.18, blockstun: 0.10, knockback: 60, chip: 0.25,
        draw(g, pr) {
          g.fillStyle = '#ffd93d'; g.fillRect(pr.x, pr.y, pr.w, pr.h);
          g.fillStyle = '#ff8b3d'; g.fillRect(pr.vx > 0 ? pr.x : pr.x + pr.w - 4, pr.y + 1, 4, 3);
        },
      });
    }
  },
};

export const rage = {
  id: 'massacreMode', name: 'MASSACRE MODE', icon: '💀',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    f.sp.storm = { left: 10, t: 0 };
    api.sfx('roar');
  },
  onUpdate(f, api, dt) {
    const s = f.sp.storm;
    if (!s || s.left <= 0) return;
    s.t -= dt;
    if (s.t <= 0) {
      s.left--; s.t = 0.12;
      api.sfx('shoot');
      const spread = (s.left % 3 - 1) * 60;   // fan: -60 / 0 / +60 px/s vertical
      api.spawnProjectile(f, {
        x: f.face > 0 ? f.x + f.w : f.x - 16, y: f.y + 18 + (s.left % 3) * 10,
        w: 14, h: 6, vx: f.face * 620, vy: spread,
        dmg: 3, hitstun: 0.22, blockstun: 0.12, knockback: 90, chip: 0.3,
        launch: s.left === 1 ? 380 : 0,     // last bullet pops them up
        draw(g, pr) {
          g.fillStyle = '#ff5030'; g.fillRect(pr.x, pr.y, pr.w, pr.h);
          g.fillStyle = '#ffd93d'; g.fillRect(pr.vx > 0 ? pr.x : pr.x + pr.w - 5, pr.y + 1, 5, 4);
        },
      });
    }
    if (s.left <= 0) f.rageActive = false;
  },
};
