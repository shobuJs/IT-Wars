import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { pointInRect } from '../Shared/math.js';
import { drawBackdrop, drawTitle, drawSubtitle, drawPanel, drawLabel, drawBadge, drawFooterHint } from '../UI/widgets.js';

const MODES = [
  { id: 'single', title: 'SINGLE PLAYER', sub: 'You vs the machine', icon: '🤖', disabled: false },
  { id: 'multi', title: 'MULTIPLAYER', sub: 'Settle it with a colleague', icon: '👥', disabled: true },
];

const rects = [];
let sel = 0;

(function layout() {
  const w = 420, h = 96, gap = 28;
  const x = DESIGN_W / 2 - w / 2;
  let y = 210;
  for (let i = 0; i < MODES.length; i++) {
    rects.push({ x, y, w, h });
    y += h + gap;
  }
})();

function choose(app, i) {
  const m = MODES[i];
  if (m.disabled) { app.audio.SFX.denied(); return; }
  app.audio.SFX.menuGo();
  app.session.mode = m.id;
  app.screens.goto(app, 'arenaSelect');
}

export default {
  enter() { sel = 0; },

  update(app) {
    const inp = app.input;
    if (inp.justPressed('up')) { sel = (sel + MODES.length - 1) % MODES.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('down')) { sel = (sel + 1) % MODES.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('confirm')) choose(app, sel);
    if (inp.justPressed('back')) app.screens.goto(app, 'mainMenu');
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
    drawTitle(g, 'OFFICE COMBAT', 100, 48);
    drawSubtitle(g, 'SELECT GAME MODE', 132);

    for (let i = 0; i < MODES.length; i++) {
      const m = MODES[i], r = rects[i];
      const selected = sel === i;
      drawPanel(g, r, { selected, disabled: m.disabled });
      g.save();
      g.textAlign = 'left';
      g.font = `40px ${FONT}`;
      g.globalAlpha = m.disabled ? 0.4 : 1;
      g.fillText(m.icon, r.x + 24, r.y + 60);
      g.restore();
      const color = m.disabled ? COLORS.locked : (selected ? COLORS.bloodBright : COLORS.text);
      drawLabel(g, m.title, r.x + 96, r.y + 44, { size: 24, color, align: 'left' });
      drawLabel(g, m.sub, r.x + 96, r.y + 68, { size: 13, color: m.disabled ? COLORS.locked : COLORS.dim, align: 'left', weight: 'normal' });
      if (m.disabled) drawBadge(g, 'COMING SOON', r.x + r.w - 70, r.y + r.h / 2, COLORS.gold);
    }

    drawFooterHint(g, '↑ ↓ select   ·   ENTER confirm   ·   ESC back');
  },
};
