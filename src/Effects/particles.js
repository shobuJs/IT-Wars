// Instance-based particle systems, ported/generalized from the legacy game
// (blood, gibs, stains, sparks, floating combat text). A system settles
// particles on a flat floorY instead of the platformer's solids.
const GRAV = 1500;

export function createParticles(floorY) {
  let blood = [];    // flying droplets
  let stains = [];   // splatter on the floor (persist all round — gore buildup)
  let gibs = [];
  let sparks = [];
  let texts = [];

  return {
    blood(x, y, dir, count = 22) {
      for (let i = 0; i < count; i++) {
        const a = (Math.random() - 0.5) * Math.PI;
        const spd = 80 + Math.random() * 260;
        blood.push({
          x, y,
          vx: Math.cos(a) * spd * dir + dir * 120,
          vy: Math.sin(a) * spd - 120 - Math.random() * 120,
          r: 1.5 + Math.random() * 3,
          t: 0, life: 0.7 + Math.random() * 0.6,
        });
      }
    },

    gibs(cx, cy, dir) {
      const types = ['head', 'chunk', 'meat', 'chunk', 'meat', 'bone', 'meat', 'chunk'];
      for (const type of types) {
        gibs.push({
          x: cx, y: cy,
          vx: dir * (60 + Math.random() * 240) + (Math.random() - 0.5) * 160,
          vy: -120 - Math.random() * 280,
          rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 22,
          t: 0, life: 2.4 + Math.random(),
          s: 3 + Math.random() * 4,
          type, resting: false,
        });
      }
    },

    sparks(x, y, color = '#ffd93d', count = 8) {
      for (let i = 0; i < count; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 320,
          vy: -Math.random() * 240 - 40,
          t: 0, life: 0.35 + Math.random() * 0.2,
          color,
        });
      }
    },

    text(x, y, txt, color = '#fff', size = 16) {
      texts.push({ x, y, txt, color, size, t: 0, life: 1.1 });
    },

    clear() { blood = []; stains = []; gibs = []; sparks = []; texts = []; },
    clearStains() { stains = []; },

    update(dt) {
      for (const d of blood) {
        d.t += dt;
        d.vy += GRAV * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.y >= floorY && d.vy > 0) {
          d.t = d.life;   // landed → leave a stain
          stains.push({ x: d.x, y: floorY, r: d.r * 1.4, col: d.col });
        }
      }
      blood = blood.filter(d => d.t < d.life);

      for (const g of gibs) {
        g.t += dt;
        if (g.resting) continue;
        g.vy += GRAV * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.rot += g.vr * dt;
        if (g.y >= floorY - 2 && g.vy > 0) {
          stains.push({ x: g.x, y: floorY, r: g.s * 0.9 });
          if (Math.abs(g.vy) < 160) { g.resting = true; g.y = floorY - 2; g.vy = 0; g.vx = 0; }
          else { g.vy *= -0.38; g.vx *= 0.6; g.vr *= 0.5; g.y = floorY - 2; }
        }
      }
      gibs = gibs.filter(g => g.t < g.life);

      for (const s of sparks) {
        s.t += dt;
        s.vy += GRAV * 0.6 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      sparks = sparks.filter(s => s.t < s.life);

      for (const t of texts) { t.t += dt; t.y -= 36 * dt; }
      texts = texts.filter(t => t.t < t.life);
    },

    // world-space layer (under/around fighters)
    render(g) {
      // stains first — soaked into the carpet
      for (const s of stains) {
        g.fillStyle = `rgba(${s.col || '122,8,8'},0.55)`;
        g.beginPath();
        g.ellipse(s.x, s.y, s.r * 1.6, s.r * 0.6, 0, 0, 7);
        g.fill();
      }
      for (const d of blood) {
        g.fillStyle = `rgba(${d.col || '186,12,12'},0.9)`;
        g.beginPath();
        g.arc(d.x, d.y, d.r, 0, 7);
        g.fill();
      }
      for (const gb of gibs) {
        const a = Math.max(0, Math.min(1, (gb.life - gb.t) / 0.5));
        g.save();
        g.translate(gb.x, gb.y);
        g.rotate(gb.rot);
        g.globalAlpha = a;
        if (gb.type === 'head') {
          g.fillStyle = '#c98f5f'; g.fillRect(-3.5, -3.5, 7, 7);
          g.fillStyle = '#7a0808'; g.fillRect(-3.5, 2, 7, 2);
        } else if (gb.type === 'bone') {
          g.fillStyle = '#e8e0d0'; g.fillRect(-gb.s / 2, -1.2, gb.s, 2.4);
        } else {
          g.fillStyle = gb.type === 'meat' ? '#9c1414' : '#701010';
          g.fillRect(-gb.s / 2, -gb.s / 2, gb.s, gb.s);
        }
        g.restore();
      }
      for (const s of sparks) {
        g.globalAlpha = Math.max(0, 1 - s.t / s.life);
        g.fillStyle = s.color;
        g.fillRect(s.x - 2, s.y - 2, 4, 4);
      }
      g.globalAlpha = 1;
    },

    // text layer (above fighters)
    renderTexts(g) {
      for (const t of texts) {
        const a = Math.max(0, 1 - t.t / t.life);
        g.save();
        g.globalAlpha = a;
        g.font = `900 ${t.size}px "Trebuchet MS", sans-serif`;
        g.textAlign = 'center';
        g.fillStyle = '#000';
        g.fillText(t.txt, t.x + 2, t.y + 2);
        g.fillStyle = t.color;
        g.fillText(t.txt, t.x, t.y);
        g.restore();
      }
    },
  };
}
