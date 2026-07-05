import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { pointInRect } from '../Shared/math.js';
import { CHARACTERS } from '../Characters/index.js';
import { drawBackdrop, drawTitle, drawSubtitle, drawFooterHint } from '../UI/widgets.js';

const rects = [];
let sel = 0;

(function layout() {
  const n = CHARACTERS.length;
  const w = 170, h = 300, gap = 14;
  const x0 = (DESIGN_W - (n * w + (n - 1) * gap)) / 2;
  const y = 150;
  for (let i = 0; i < n; i++) rects.push({ x: x0 + i * (w + gap), y, w, h });
})();

function choose(app, i) {
  app.audio.SFX.menuGo();
  app.session.playerCharId = CHARACTERS[i].id;
  // opponent: random pick from the rest of the roster
  const others = CHARACTERS.filter(c => c.id !== CHARACTERS[i].id);
  app.session.aiCharId = others[Math.floor(Math.random() * others.length)].id;
  app.screens.goto(app, 'match');
}

export default {
  enter() { sel = 0; },

  update(app) {
    const inp = app.input;
    if (inp.justPressed('left')) { sel = (sel + CHARACTERS.length - 1) % CHARACTERS.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('right')) { sel = (sel + 1) % CHARACTERS.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('confirm')) choose(app, sel);
    if (inp.justPressed('back')) app.screens.goto(app, 'arenaSelect');
  },

  onPointer(app, x, y, type) {
    for (let i = 0; i < rects.length; i++) {
      if (pointInRect(x, y, rects[i])) {
        if (type === 'move' && sel !== i) { sel = i; app.audio.SFX.menuMove(); }
        if (type === 'down') { sel = i; choose(app, i); }
      }
    }
  },

  render(app, g) {
    drawBackdrop(g, app.clock);
    drawTitle(g, 'CHOOSE YOUR WARRIOR', 92, 40);
    drawSubtitle(g, 'EVERY TICKET ENDS IN BLOOD', 120);

    for (let i = 0; i < CHARACTERS.length; i++) {
      const c = CHARACTERS[i], r = rects[i];
      const selected = sel === i;
      const pulse = selected ? Math.abs(Math.sin(app.clock / 280)) : 0;

      // gradient panel in the character's colors (legacy drawCharPanel style)
      g.save();
      if (selected) {
        g.shadowColor = c.palette.accent;
        g.shadowBlur = 18 + pulse * 14;
      }
      const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      grad.addColorStop(0, c.palette.panel[0]);
      grad.addColorStop(1, c.palette.panel[1]);
      g.fillStyle = grad;
      g.fillRect(r.x, r.y, r.w, r.h);
      g.restore();
      g.lineWidth = selected ? 4 : 2;
      g.strokeStyle = selected ? c.palette.accent : 'rgba(255,255,255,0.25)';
      g.strokeRect(r.x, r.y, r.w, r.h);

      // live preview: idle breathing normally; the hovered/selected fighter
      // performs a showcase loop — walk cycle, then their signature quirk
      const bob = Math.sin(app.clock / 420 + i * 2) * 2;
      const pose = {
        x: 0, y: 0, w: c.sprite.w, h: c.sprite.h, vx: 0, face: 1, anim: 0,
        onGround: true, big: false, axeOut: false, raging: 0, fireCd: 0,
      };
      let scale = 3;
      if (selected) {
        scale = 3.35 + Math.sin(app.clock / 300) * 0.05;
        const phase = (app.clock / 1000) % 3.2;
        if (phase < 1.4) {
          // strut in place
          pose.vx = 60;
          pose.anim = app.clock / 100;
          pose.face = Math.floor(app.clock / 1600) % 2 ? -1 : 1;
        } else {
          // signature move: idle quirk, rage aura, or a muzzle flash
          if (c.sprite.idle) pose[c.sprite.idle.flag] = true;
          else if (c.id === 'kratos') pose.raging = 1;
          else pose.fireCd = 0.3;
        }
      } else {
        g.globalAlpha = 0.75;
      }
      g.save();
      g.beginPath();
      g.rect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      g.clip();
      g.translate(r.x + r.w / 2 - c.sprite.w * scale / 2, r.y + 42 + bob - (scale - 3) * c.sprite.h);
      g.scale(scale, scale);
      c.sprite.draw(g, pose, app.clock);
      g.restore();
      g.globalAlpha = 1;

      g.textAlign = 'center';
      g.font = `bold 21px ${FONT}`;
      g.fillStyle = '#fff';
      g.fillText(c.name, r.x + r.w / 2, r.y + 156);
      g.font = `bold 12px ${FONT}`;
      g.fillStyle = c.palette.title;
      g.fillText(c.role, r.x + r.w / 2, r.y + 174);
      g.font = `11px ${FONT}`;
      g.fillStyle = 'rgba(255,255,255,0.9)';
      c.blurb.forEach((ln, k) => g.fillText(ln, r.x + r.w / 2, r.y + 198 + k * 17));

      // mini stat bars: HP / SPEED / POWER
      const st = c.stats;
      const bars = [
        ['HP', st.maxHealth / 120, '#e23b3b'],
        ['SPD', st.walkSpeed / 260, '#7ee787'],
        ['PWR', st.strength / 1.25, '#ffd93d'],
      ];
      bars.forEach(([label, v, color], k) => {
        const by = r.y + 252 + k * 14;
        g.font = `bold 9px ${FONT}`;
        g.textAlign = 'left';
        g.fillStyle = 'rgba(255,255,255,0.7)';
        g.fillText(label, r.x + 12, by + 7);
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.fillRect(r.x + 42, by, r.w - 56, 8);
        g.fillStyle = color;
        g.fillRect(r.x + 42, by, (r.w - 56) * Math.min(1, v), 8);
      });
    }

    // detail bar for the highlighted fighter
    const c = CHARACTERS[sel];
    const st = c.stats;
    const barY = 468;
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(60, barY, DESIGN_W - 120, 38);
    g.strokeStyle = c.palette.accent;
    g.lineWidth = 1;
    g.strokeRect(60.5, barY + 0.5, DESIGN_W - 121, 37);
    g.textAlign = 'center';
    g.font = `bold 13px ${FONT}`;
    g.fillStyle = COLORS.text;
    g.fillText(
      `HP ${st.maxHealth}   ·   SPEED ${st.walkSpeed}   ·   POWER ×${st.strength}   ·   DEFENSE ×${st.defense}`,
      DESIGN_W / 2, barY + 15,
    );
    g.font = `12px ${FONT}`;
    g.fillStyle = c.palette.title;
    g.fillText(
      `SPECIAL: ${c.abilities.special.name} (${c.abilities.special.cooldown}s)   ·   RAGE: ${c.abilities.rage.name}`,
      DESIGN_W / 2, barY + 31,
    );

    // pulsing call to action under the selected panel
    const r = rects[sel];
    const pulse = 0.5 + 0.5 * Math.sin(app.clock / 200);
    g.save();
    g.globalAlpha = 0.5 + 0.5 * pulse;
    g.font = `900 13px ${FONT}`;
    g.fillStyle = c.palette.accent;
    g.fillText('▶ PRESS ENTER TO FIGHT ◀', r.x + r.w / 2, r.y - 10);
    g.restore();

    drawFooterHint(g, '← → select   ·   ENTER fight   ·   ESC back');
  },
};
