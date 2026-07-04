// Coffee Splash: lobbed cup; the spill leaves a scalding puddle that
// chips anyone standing in it. Zoner bread-and-butter.
export const special = {
  id: 'coffeeSplash', name: 'COFFEE SPLASH', icon: '☕',
  kind: 'special', cooldown: 3.0,
  onActivate(f, api) {
    api.sfx('cup');
    api.spawnProjectile(f, {
      x: f.face > 0 ? f.x + f.w : f.x - 12, y: f.y + 12,
      w: 12, h: 12, vx: f.face * 340, vy: -260, gravity: 1100,
      dmg: 7, hitstun: 0.28, blockstun: 0.14, knockback: 130, chip: 0.25,
      spin: 8, hitSfx: 'scald',
      draw(g, pr) {
        g.save();
        g.translate(pr.x + pr.w / 2, pr.y + pr.h / 2);
        g.rotate(pr.rot || 0);
        g.fillStyle = '#fff'; g.fillRect(-5, -5, 10, 10);
        g.fillStyle = '#6b4226'; g.fillRect(-4, -4, 8, 3);
        g.restore();
      },
      onLand(pr, api2) {
        api2.sfx('splash');
        api2.sparks(pr.x + pr.w / 2, pr.y + pr.h, '#6b4226', 8);
        pr.owner.sp.puddles = pr.owner.sp.puddles || [];
        pr.owner.sp.puddles.push({ x: pr.x - 30, w: 72, t: 2.2, tick: 0 });
      },
      onHit(pr, api2) {
        pr.owner.sp.puddles = pr.owner.sp.puddles || [];
        pr.owner.sp.puddles.push({ x: pr.x - 30, w: 72, t: 1.5, tick: 0 });
      },
    });
  },
  onUpdate(f, api, dt) {
    const ps = f.sp.puddles;
    if (!ps || !ps.length) return;
    const foe = api.opponentOf(f);
    for (const p of ps) {
      p.t -= dt; p.tick -= dt;
      const fy = api.arena.floorY;
      if (p.tick <= 0 && foe.onGround &&
          foe.x + foe.w > p.x && foe.x < p.x + p.w && foe.y + foe.h >= fy - 4) {
        p.tick = 0.3;
        api.tryHit(f, { x: p.x, y: fy - 20, w: p.w, h: 20 },
          { dmg: 2, hitstun: 0.12, blockstun: 0.08, knockback: 30, chip: 0.5, sfx: 'scald' });
      }
    }
    f.sp.puddles = ps.filter(p => p.t > 0);
  },
  onDraw(f, api, g) {
    const ps = f.sp.puddles;
    if (!ps) return;
    const fy = api.arena.floorY;
    for (const p of ps) {
      const a = Math.min(0.75, p.t);
      g.fillStyle = `rgba(107,66,38,${a})`;
      g.beginPath();
      g.ellipse(p.x + p.w / 2, fy - 2, p.w / 2, 6, 0, 0, 7);
      g.fill();
      // steam
      g.fillStyle = `rgba(255,255,255,${a * 0.5})`;
      for (let i = 0; i < 3; i++) {
        g.fillRect(p.x + 12 + i * 22, fy - 14 - Math.sin(p.t * 6 + i) * 4, 2, 8);
      }
    }
  },
};

// Coffee Tsunami: a full-height wave of dark roast sweeps the arena.
export const rage = {
  id: 'coffeeTsunami', name: 'COFFEE TSUNAMI', icon: '🌊',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    f.sp.tsunami = {
      x: f.face > 0 ? f.x - 40 : f.x + f.w + 40,
      dir: f.face, hit: false, t: 0,
    };
    api.sfx('wave');
  },
  onUpdate(f, api, dt) {
    const w = f.sp.tsunami;
    if (!w) return;
    w.t += dt;
    w.x += w.dir * 420 * dt;
    if (!w.hit && api.tryHit(f, { x: w.x - 30, y: 0, w: 90, h: api.arena.floorY },
        { dmg: 28, hitstun: 0.6, knockback: 380, knockdown: true, chip: 0.3, sfx: 'gore' })) {
      w.hit = true;
      api.shake(12);
    }
    if (w.x < api.arena.bounds.left - 120 || w.x > api.arena.bounds.right + 120) {
      f.sp.tsunami = null; f.rageActive = false;
    }
  },
  onDraw(f, api, g) {
    const w = f.sp.tsunami;
    if (!w) return;
    const fy = api.arena.floorY;
    const H = fy * 0.85;
    g.save();
    // wave body
    const grad = g.createLinearGradient(w.x - 60, 0, w.x + 60, 0);
    grad.addColorStop(0, 'rgba(60,36,20,0.2)');
    grad.addColorStop(0.6, 'rgba(107,66,38,0.9)');
    grad.addColorStop(1, 'rgba(140,90,50,0.95)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(w.x - 90 * w.dir, fy);
    g.quadraticCurveTo(w.x, fy - H * 1.15, w.x + 55 * w.dir, fy - H);
    g.quadraticCurveTo(w.x + 30 * w.dir, fy - H * 0.5, w.x + 70 * w.dir, fy);
    g.closePath();
    g.fill();
    // foam crest
    g.fillStyle = 'rgba(240,225,205,0.9)';
    for (let i = 0; i < 5; i++) {
      const fx = w.x + 55 * w.dir - i * 14 * w.dir;
      g.beginPath();
      g.arc(fx, fy - H + Math.sin(w.t * 10 + i) * 6, 7 - i, 0, 7);
      g.fill();
    }
    g.restore();
  },
};
