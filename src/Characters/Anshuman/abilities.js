// Grand Laughter (special): a point-blank belly laugh that shocks the air
// around him — quick, omnidirectional, moderate damage.
export const special = {
  id: 'grandLaughter', name: 'GRAND LAUGHTER', icon: '😂',
  kind: 'special', cooldown: 4.5,
  onActivate(f, api) {
    f.sp.laugh = { t: 0, hit: false };
    api.sfx('roar');
  },
  onUpdate(f, api, dt) {
    const l = f.sp.laugh;
    if (!l) return;
    l.t += dt;
    if (!l.hit && l.t > 0.12) {
      const cx = f.x + f.w / 2, cy = f.y + f.h / 2, r = 72;
      const rect = { x: cx - r, y: cy - r * 0.6, w: r * 2, h: r * 1.2 };
      if (api.tryHit(f, rect, { dmg: 11, hitstun: 0.3, blockstun: 0.16, knockback: 220, chip: 0.25, sfx: 'thunk' })) {
        l.hit = true;
      }
    }
    if (l.t > 0.4) f.sp.laugh = null;
  },
  onDraw(f, api, g) {
    const l = f.sp.laugh;
    if (!l) return;
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    const r = 20 + l.t * 220;
    const a = Math.max(0, 1 - l.t / 0.4);
    g.save();
    g.globalAlpha = a;
    g.strokeStyle = '#ffd93d'; g.lineWidth = 4;
    g.beginPath(); g.ellipse(cx, cy, r, r * 0.6, 0, 0, 7); g.stroke();
    g.font = 'bold 20px "Trebuchet MS", sans-serif';
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    g.fillText('HA HA HA!', cx, cy - r * 0.6 - 6);
    g.restore();
  },
};

// Target Achieved!: cracks a beer, unleashes a room-shaking mega-laugh
// that hits both directions at once — the deal is closed.
export const rage = {
  id: 'targetAchieved', name: 'TARGET ACHIEVED!', icon: '🍺',
  kind: 'rage', cost: 100,
  onActivate(f, api) {
    f.sp.mega = { t: 0, hit: false };
    api.sfx('roar');
    api.flash('rgba(255,217,61,0.35)', 0.4);
  },
  onUpdate(f, api, dt) {
    const m = f.sp.mega;
    if (!m) return;
    m.t += dt;
    if (!m.hit && m.t > 0.3) {
      const cx = f.x + f.w / 2, cy = f.y + f.h / 2, r = 260;
      const rect = { x: cx - r, y: cy - r * 0.6, w: r * 2, h: r * 1.2 };
      if (api.tryHit(f, rect, { dmg: 26, hitstun: 0.5, knockback: 340, knockdown: true, chip: 0.3, sfx: 'gore' })) {
        m.hit = true;
      }
      api.shake(12);
    }
    if (m.t > 1.0) { f.sp.mega = null; f.rageActive = false; }
  },
  onDraw(f, api, g) {
    const m = f.sp.mega;
    if (!m) return;
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    const a = Math.max(0, 1 - m.t / 1.0);
    const r = 40 + m.t * 280;
    g.save();
    g.globalAlpha = a;
    g.strokeStyle = '#ffcf40'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(cx, cy, r, r * 0.6, 0, 0, 7); g.stroke();
    g.font = 'bold 30px "Trebuchet MS", sans-serif';
    g.fillStyle = '#ffd93d';
    g.textAlign = 'center';
    g.fillText('TARGET ACHIEVED!! 😂', cx, cy - r * 0.55 - 10);
    g.restore();
  },
};
