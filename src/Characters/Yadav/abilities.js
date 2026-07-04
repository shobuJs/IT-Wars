// Milk-Can Mortar: lobbed churn, explodes into an AoE splash on landing.
export const special = {
  id: 'milkMortar', name: 'MILK-CAN MORTAR', icon: '🥛',
  kind: 'special', cooldown: 5.0,
  onActivate(f, api) {
    api.sfx('lob');
    api.spawnProjectile(f, {
      x: f.face > 0 ? f.x + f.w : f.x - 16, y: f.y + 10,
      w: 16, h: 20, vx: f.face * 260, vy: -520, gravity: 1300,
      dmg: 12, hitstun: 0.4, blockstun: 0.2, knockback: 260, knockdown: true, chip: 0.25,
      spin: 6,
      draw(g, pr, clock) {
        g.save();
        g.translate(pr.x + pr.w / 2, pr.y + pr.h / 2);
        g.rotate(pr.rot || 0);
        g.fillStyle = '#b8c0c8'; g.fillRect(-6, -9, 12, 16);
        g.fillStyle = '#8a949c'; g.fillRect(-6, -9, 12, 4);
        g.fillStyle = '#d8dee4'; g.fillRect(-3.5, -12, 7, 3);
        g.restore();
      },
      onLand(pr, api2) {
        api2.sfx('splat');
        api2.sparks(pr.x + pr.w / 2, pr.y + pr.h, '#f4f9ff', 14);
        api2.text(pr.x + pr.w / 2, pr.y - 10, 'SPLASH!', '#d8ecff', 16);
        api2.tryHit(pr.owner, { x: pr.x + pr.w / 2 - 56, y: pr.y - 30, w: 112, h: 60 },
          { dmg: 12, hitstun: 0.4, blockstun: 0.2, knockback: 260, knockdown: true, chip: 0.25, sfx: 'thunk' });
      },
    });
  },
};

// Buffalo Stampede: three buffaloes thunder across the whole arena.
// Unblockable but jumpable — telegraphed by the dust and the moo.
export const rage = {
  id: 'buffaloStampede', name: 'BUFFALO STAMPEDE', icon: '🐃',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    const fromLeft = f.face > 0;
    f.sp.stampede = {
      dir: fromLeft ? 1 : -1,
      buffaloes: [0, 1, 2].map(i => ({
        x: fromLeft ? api.arena.bounds.left - 120 - i * 140 : api.arena.bounds.right + 120 + i * 140,
        hit: false,
      })),
      t: 0,
    };
    api.sfx('moo');
    setTimeout(() => api.sfx('stampede'), 400);
  },
  onUpdate(f, api, dt) {
    const s = f.sp.stampede;
    if (!s) return;
    s.t += dt;
    if (s.t < 0.8) return;   // telegraph window — time to jump
    let alive = false;
    for (const b of s.buffaloes) {
      b.x += s.dir * 560 * dt;
      const on = s.dir > 0 ? b.x < api.arena.bounds.right + 200 : b.x > api.arena.bounds.left - 200;
      if (on) alive = true;
      if (!b.hit && api.tryHit(f, { x: b.x, y: api.arena.floorY - 52, w: 84, h: 52 },
          { dmg: 10, hitstun: 0.45, knockback: 340, knockdown: true, unblockable: true, sfx: 'gore' })) {
        b.hit = true;
        api.shake(9);
      }
    }
    if (!alive) { f.sp.stampede = null; f.rageActive = false; }
  },
  onDraw(f, api, g) {
    const s = f.sp.stampede;
    if (!s) return;
    const fy = api.arena.floorY;
    if (s.t < 0.8) {
      // dust telegraph at the arena edge
      g.fillStyle = `rgba(160,130,90,${0.3 + 0.3 * Math.sin(s.t * 20)})`;
      const ex = s.dir > 0 ? api.arena.bounds.left : api.arena.bounds.right - 60;
      g.fillRect(ex, fy - 60, 60, 60);
      return;
    }
    for (const b of s.buffaloes) {
      const x = b.x, flip = s.dir < 0;
      g.save();
      if (flip) { g.translate(x + 84, 0); g.scale(-1, 1); g.translate(-x, 0); }
      const bob = Math.sin((x + s.t * 800) / 30) * 3;
      // body
      g.fillStyle = '#2b2320'; g.fillRect(x, fy - 46 + bob, 74, 32);
      // hump + head
      g.fillStyle = '#211a18'; g.fillRect(x + 48, fy - 58 + bob, 26, 22);
      g.fillStyle = '#2b2320'; g.fillRect(x + 66, fy - 50 + bob, 18, 20);
      // horns
      g.fillStyle = '#d8cfc0';
      g.fillRect(x + 70, fy - 56 + bob, 10, 3);
      g.fillRect(x + 78, fy - 62 + bob, 3, 8);
      // eye
      g.fillStyle = '#ff3020'; g.fillRect(x + 76, fy - 46 + bob, 3, 3);
      // legs
      g.fillStyle = '#1a1412';
      const stride = Math.sin((x + s.t * 800) / 14) * 5;
      g.fillRect(x + 6, fy - 16, 7, 16 + stride);
      g.fillRect(x + 24, fy - 16, 7, 16 - stride);
      g.fillRect(x + 44, fy - 16, 7, 16 + stride);
      g.fillRect(x + 60, fy - 16, 7, 16 - stride);
      g.restore();
      // dust trail
      g.fillStyle = 'rgba(160,130,90,0.35)';
      g.fillRect(flip ? x + 84 : x - 26, fy - 18, 26, 16);
    }
  },
};
