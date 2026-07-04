// Bottle Toss: fast, flat, weak — spammy on purpose (short cooldown).
export const special = {
  id: 'bottleToss', name: 'BOTTLE TOSS', icon: '🍺',
  kind: 'special', cooldown: 2.5,
  onActivate(f, api) {
    api.sfx('bottle');
    api.spawnProjectile(f, {
      x: f.face > 0 ? f.x + f.w : f.x - 12, y: f.y + 20,
      w: 12, h: 18, vx: f.face * 640, vy: -40, gravity: 220,
      dmg: 8, hitstun: 0.28, blockstun: 0.14, knockback: 140, chip: 0.25,
      spin: 10, hitSfx: 'glass',
      draw(g, pr) {
        g.save();
        g.translate(pr.x + pr.w / 2, pr.y + pr.h / 2);
        g.rotate(pr.rot || 0);
        g.fillStyle = '#7a4a12';
        g.fillRect(-3, -8, 6, 13);
        g.fillRect(-1.5, -12, 3, 4);
        g.fillStyle = '#e8e0d0';
        g.fillRect(-3, -4, 6, 4);
        g.restore();
      },
    });
  },
};

// Meltdown: expanding censored-swearing shockwaves. HR has been notified.
const SWEARS = ['#$%@!', '&%$#!', '@!#$%'];
export const rage = {
  id: 'meltdown', name: 'MELTDOWN', icon: '🤬',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    f.sp.meltdown = { waves: [], next: 0, spawned: 0 };
    api.sfx('swear');
  },
  onUpdate(f, api, dt) {
    const m = f.sp.meltdown;
    if (!m) return;
    m.next -= dt;
    if (m.spawned < 3 && m.next <= 0) {
      m.waves.push({ r: 30, hit: false, i: m.spawned });
      m.spawned++; m.next = 0.35;
      api.sfx('swear');
      api.shake(7);
    }
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    for (const w of m.waves) {
      w.r += 480 * dt;
      if (!w.hit && api.tryHit(f, { x: cx - w.r, y: cy - w.r * 0.7, w: w.r * 2, h: w.r * 1.4 },
          { dmg: 9, hitstun: 0.34, blockstun: 0.17, knockback: 260, chip: 0.3, sfx: 'thunk' })) {
        w.hit = true;
      }
    }
    m.waves = m.waves.filter(w => w.r < 560);
    if (m.spawned >= 3 && m.waves.length === 0) { f.sp.meltdown = null; f.rageActive = false; }
  },
  onDraw(f, api, g) {
    const m = f.sp.meltdown;
    if (!m) return;
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    for (const w of m.waves) {
      const a = Math.max(0, 1 - w.r / 560);
      g.save();
      g.strokeStyle = `rgba(255,60,30,${a * 0.8})`;
      g.lineWidth = 5;
      g.beginPath();
      g.ellipse(cx, cy, w.r, w.r * 0.7, 0, 0, 7);
      g.stroke();
      g.fillStyle = `rgba(255,220,80,${a})`;
      g.font = 'bold 16px "Trebuchet MS", sans-serif';
      g.textAlign = 'center';
      g.fillText(SWEARS[w.i % SWEARS.length], cx, cy - w.r * 0.7);
      g.fillText(SWEARS[(w.i + 1) % SWEARS.length], cx + w.r, cy);
      g.fillText(SWEARS[(w.i + 2) % SWEARS.length], cx - w.r, cy);
      g.restore();
    }
  },
};
