import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { pointInRect } from '../Shared/math.js';
import { ARENAS } from '../Arenas/index.js';
import { drawBackdrop, drawTitle, drawSubtitle, drawPanel, drawLabel, drawBadge, drawFooterHint } from '../UI/widgets.js';

const COLS = 4;
const rects = [];
let sel = 0;

(function layout() {
  const w = 205, h = 130, gapX = 20, gapY = 26;
  const x0 = (DESIGN_W - (COLS * w + (COLS - 1) * gapX)) / 2;
  const y0 = 176;
  for (let i = 0; i < ARENAS.length; i++) {
    const col = i % COLS, row = Math.floor(i / COLS);
    rects.push({ x: x0 + col * (w + gapX), y: y0 + row * (h + gapY), w, h });
  }
})();

function choose(app, i) {
  const a = ARENAS[i];
  if (a.locked) { app.audio.SFX.denied(); return; }
  app.audio.SFX.menuGo();
  app.session.arenaId = a.id;
  app.screens.goto(app, 'characterSelect');
}

export default {
  enter() { sel = 0; },

  update(app) {
    const inp = app.input;
    const move = (d) => { sel = (sel + d + ARENAS.length) % ARENAS.length; app.audio.SFX.menuMove(); };
    if (inp.justPressed('left')) move(-1);
    if (inp.justPressed('right')) move(1);
    if (inp.justPressed('up')) move(-COLS);
    if (inp.justPressed('down')) move(COLS);
    if (inp.justPressed('confirm')) choose(app, sel);
    if (inp.justPressed('back')) app.screens.goto(app, 'modeSelect');
  },

  onPointer(app, x, y, type) {
    for (let i = 0; i < rects.length; i++) {
      if (pointInRect(x, y, rects[i])) {
        if (type === 'move') sel = i;
        if (type === 'down') { sel = i; choose(app, i); }
      }
    }
  },

  render(app, g) {
    drawBackdrop(g, app.clock);
    drawTitle(g, 'SELECT ARENA', 96, 44);
    drawSubtitle(g, 'WHERE WILL THE STAND-UP TURN VIOLENT?', 126);

    for (let i = 0; i < ARENAS.length; i++) {
      const a = ARENAS[i], r = rects[i];
      const selected = sel === i;
      drawPanel(g, r, { selected, disabled: a.locked });

      if (!a.locked && a.drawBackground) {
        // live miniature of the arena
        g.save();
        g.beginPath();
        g.rect(r.x + 4, r.y + 4, r.w - 8, r.h - 36);
        g.clip();
        const s = (r.w - 8) / a.width;
        g.translate(r.x + 4, r.y + 4 + (r.h - 36 - 540 * s) / 2);
        g.scale(s, s);
        a.drawBackground(g, app.clock);
        g.restore();
      } else {
        g.save();
        g.textAlign = 'center';
        g.font = `44px ${FONT}`;
        g.globalAlpha = 0.28;
        g.fillText(a.icon || '🔒', r.x + r.w / 2, r.y + 66);
        g.restore();
        drawBadge(g, 'COMING SOON', r.x + r.w / 2, r.y + 92, COLORS.gold);
      }

      drawLabel(g, a.name, r.x + r.w / 2, r.y + r.h - 12, {
        size: 15,
        color: a.locked ? COLORS.locked : (selected ? COLORS.bloodBright : COLORS.text),
      });
    }

    drawFooterHint(g, '← → ↑ ↓ select   ·   ENTER confirm   ·   ESC back');
  },
};
