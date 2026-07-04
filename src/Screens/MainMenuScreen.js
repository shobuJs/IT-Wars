import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { pointInRect } from '../Shared/math.js';
import { drawBackdrop, drawTitle, drawSubtitle, drawPanel, drawLabel, drawBadge, drawFooterHint } from '../UI/widgets.js';

const CARDS = [
  {
    id: 'adventure',
    title: 'OFFICE ADVENTURE',
    sub: 'Side-scrolling massacre',
    desc: ['Run. Jump. Deploy to prod.', 'The classic platform carnage.'],
    icon: '🏃',
    accent: '#ff8b3d',
  },
  {
    id: 'combat',
    title: 'OFFICE COMBAT',
    sub: '1v1 arcade fighter',
    desc: ['Settle the sprint review', 'with your fists.'],
    icon: '🥊',
    accent: COLORS.bloodBright,
  },
];

const rects = [];
let sel = 0;

function layout() {
  rects.length = 0;
  const w = 340, h = 240, gap = 60;
  const x0 = DESIGN_W / 2 - w - gap / 2;
  const y = 180;
  rects.push({ x: x0, y, w, h });
  rects.push({ x: DESIGN_W / 2 + gap / 2, y, w, h });
}
layout();

function choose(app, i) {
  app.audio.SFX.menuGo();
  if (CARDS[i].id === 'adventure') {
    location.href = 'OfficeAdventure/index.html';
  } else {
    app.screens.goto(app, 'modeSelect');
  }
}

export default {
  enter() { sel = 1; },

  update(app) {
    const inp = app.input;
    if (inp.justPressed('left')) { sel = (sel + CARDS.length - 1) % CARDS.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('right')) { sel = (sel + 1) % CARDS.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('confirm')) choose(app, sel);
    if (inp.justPressed('back')) app.screens.goto(app, 'start');
  },

  onPointer(app, x, y, type) {
    for (let i = 0; i < rects.length; i++) {
      if (pointInRect(x, y, rects[i])) {
        if (type === 'move' && sel !== i) { sel = i; }
        if (type === 'down') { sel = i; choose(app, i); }
      }
    }
  },

  render(app, g) {
    drawBackdrop(g, app.clock);
    drawTitle(g, 'IT WARS', 92, 64);
    drawSubtitle(g, 'AN OFFICE SAGA — CHOOSE YOUR BATTLEFIELD', 122);

    for (let i = 0; i < CARDS.length; i++) {
      const c = CARDS[i], r = rects[i];
      const selected = sel === i;
      drawPanel(g, r, { selected, accent: c.accent });
      g.save();
      g.textAlign = 'center';
      g.font = `64px ${FONT}`;
      g.fillText(c.icon, r.x + r.w / 2, r.y + 92);
      g.restore();
      drawLabel(g, c.title, r.x + r.w / 2, r.y + 138, { size: 22, color: selected ? c.accent : COLORS.text });
      drawLabel(g, c.sub, r.x + r.w / 2, r.y + 162, { size: 13, color: COLORS.dim, weight: 'normal' });
      c.desc.forEach((line, li) => {
        drawLabel(g, line, r.x + r.w / 2, r.y + 192 + li * 18, { size: 13, color: 'rgba(242,233,228,0.7)', weight: 'normal' });
      });
      if (selected) {
        const pulse = 0.5 + 0.5 * Math.sin(app.clock / 200);
        g.save();
        g.globalAlpha = 0.4 + 0.4 * pulse;
        drawBadge(g, 'PRESS ENTER', r.x + r.w / 2, r.y + r.h + 24, c.accent);
        g.restore();
      }
    }

    drawFooterHint(g, '← → select   ·   ENTER confirm   ·   or click a card');
  },
};
