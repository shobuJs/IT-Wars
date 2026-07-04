import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { pointInRect } from '../Shared/math.js';
import { characterById, CHARACTERS } from '../Characters/index.js';
import { drawBackdrop, drawTitle, drawSubtitle, drawPanel, drawLabel, drawFooterHint } from '../UI/widgets.js';

const OPTIONS = [
  { id: 'rematch', label: 'REMATCH' },
  { id: 'charSelect', label: 'CHANGE FIGHTER' },
  { id: 'mainMenu', label: 'MAIN MENU' },
];

const rects = [];
let sel = 0;

(function layout() {
  const w = 300, h = 54, gap = 16;
  const x = DESIGN_W / 2 - w / 2;
  let y = 330;
  for (let i = 0; i < OPTIONS.length; i++) { rects.push({ x, y, w, h }); y += h + gap; }
})();

function choose(app, i) {
  app.audio.SFX.menuGo();
  const id = OPTIONS[i].id;
  if (id === 'rematch') {
    // same fighters, same arena — but re-roll if the user wants variety later
    app.screens.goto(app, 'match');
  } else if (id === 'charSelect') {
    app.screens.goto(app, 'characterSelect');
  } else {
    app.session.playerCharId = null;
    app.session.aiCharId = null;
    app.screens.goto(app, 'mainMenu');
  }
}

export default {
  enter() { sel = 0; },

  update(app) {
    const inp = app.input;
    if (inp.justPressed('up')) { sel = (sel + OPTIONS.length - 1) % OPTIONS.length; app.audio.SFX.menuMove(); }
    if (inp.justPressed('down')) { sel = (sel + 1) % OPTIONS.length; app.audio.SFX.menuMove(); }
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
    const res = app.session.lastResult;
    if (!res) { app.screens.goto(app, 'mainMenu'); return; }
    const champ = characterById[res.winnerId] || CHARACTERS[0];

    drawTitle(g, res.playerWon ? 'VICTORY' : 'DEFEATED', 90, 56, res.playerWon ? COLORS.gold : COLORS.bloodBright);
    drawSubtitle(g, res.playerWon
      ? 'THE SPRINT REVIEW IS SETTLED. TICKETS: CLOSED.'
      : `${res.loserName} HAS BEEN DEPLOYED TO PROD... PERMANENTLY.`, 122);

    // champion showcase — breathing sprite in their colors
    const bob = Math.sin(app.clock / 380) * 3;
    g.save();
    g.shadowColor = champ.palette.accent;
    g.shadowBlur = 26;
    g.translate(DESIGN_W / 2 - champ.sprite.w * 2, 158 + bob);
    g.scale(4, 4);
    champ.sprite.draw(g, {
      x: 0, y: 0, w: champ.sprite.w, h: champ.sprite.h, vx: 0, face: 1, anim: 0,
      onGround: true, big: false, axeOut: false, raging: res.playerWon ? 0 : 1, fireCd: 0,
    }, app.clock);
    g.restore();

    drawLabel(g, `${res.winnerName} WINS  ${res.score}`, DESIGN_W / 2, 296, { size: 24, color: champ.palette.accent });
    if (res.flawless) drawLabel(g, 'PERFORMANCE REVIEW: EXCEEDS EXPECTATIONS', DESIGN_W / 2, 318, { size: 13, color: COLORS.gold });

    for (let i = 0; i < OPTIONS.length; i++) {
      const r = rects[i];
      const selected = sel === i;
      drawPanel(g, r, { selected });
      drawLabel(g, OPTIONS[i].label, r.x + r.w / 2, r.y + 34, {
        size: 20, color: selected ? COLORS.bloodBright : COLORS.text,
      });
    }

    drawFooterHint(g, '↑ ↓ select   ·   ENTER confirm   ·   ESC main menu');
  },
};
