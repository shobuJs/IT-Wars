// Start / title screen: the full gaming field (office arena) with the whole
// roster idling on the floor, slow attract-mode camera pan, big title.
import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';
import { CHARACTERS } from '../Characters/index.js';
import { arenaById } from '../Arenas/index.js';

const SCALE = 3;   // same fighter scale as a real match

export default {
  enter() {},

  update(app) {
    if (app.input.justPressed('confirm')) {
      app.audio.SFX.menuGo();
      app.screens.goto(app, 'mainMenu');
    }
  },

  onPointer(app, x, y, type) {
    if (type === 'down') {
      app.audio.SFX.menuGo();
      app.screens.goto(app, 'mainMenu');
    }
  },

  render(app, g) {
    const arena = arenaById.office;
    const t = app.clock / 1000;

    // slow pan back and forth across the whole field
    const camX = (arena.width - DESIGN_W) / 2 + Math.sin(t * 0.15) * (arena.width - DESIGN_W) / 2;

    g.fillStyle = '#000';
    g.fillRect(0, 0, DESIGN_W, DESIGN_H);
    g.save();
    g.translate(-camX, 0);
    arena.drawBackground(g, app.clock);

    // the whole roster hanging out on the arena floor
    const n = CHARACTERS.length;
    const spacing = (arena.width - 240) / (n - 1);
    CHARACTERS.forEach((c, i) => {
      const fx = 120 + i * spacing - (c.sprite.w * SCALE) / 2;
      const fy = arena.floorY - c.sprite.h * SCALE;
      const bob = Math.sin(t * 2 + i * 1.7) * 2;
      g.save();
      g.translate(fx, fy + bob);
      g.scale(SCALE, SCALE);
      c.sprite.draw(g, {
        x: 0, y: 0, w: c.sprite.w, h: c.sprite.h, vx: 0,
        face: i < n / 2 ? 1 : -1, anim: 0, onGround: true,
        big: false, axeOut: false, raging: 0, fireCd: 0,
        smoking: c.id === 'sickman', thinking: c.id === 'mrb' && Math.sin(t * 0.4) > 0.2,
        listening: c.id === 'yadav',
      }, app.clock);
      g.restore();
      // name tag
      g.font = `bold 12px ${FONT}`;
      g.textAlign = 'center';
      g.fillStyle = 'rgba(0,0,0,0.6)';
      const cxx = fx + (c.sprite.w * SCALE) / 2;
      g.fillText(c.name, cxx + 1, arena.floorY + 18 + 1);
      g.fillStyle = c.palette.accent;
      g.fillText(c.name, cxx, arena.floorY + 18);
    });
    g.restore();

    // dark band + title
    const grad = g.createLinearGradient(0, 40, 0, 240);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, DESIGN_W, 240);

    g.textAlign = 'center';
    g.font = `900 92px ${FONT}`;
    g.fillStyle = '#000';
    g.fillText('IT WARS', DESIGN_W / 2 + 5, 135 + 5);
    g.fillStyle = COLORS.bloodBright;
    g.fillText('IT WARS', DESIGN_W / 2, 135);
    g.font = `bold 17px ${FONT}`;
    g.fillStyle = COLORS.gold;
    g.fillText('EVERY  TICKET  ENDS  IN  BLOOD', DESIGN_W / 2, 168);

    // pulsing prompt
    const pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * 2.2));
    g.globalAlpha = pulse;
    g.font = `900 24px ${FONT}`;
    g.fillStyle = '#f2e9e4';
    g.fillText('PRESS ENTER TO START', DESIGN_W / 2, 250);
    g.globalAlpha = 1;

    g.font = `11px ${FONT}`;
    g.fillStyle = 'rgba(242,233,228,0.5)';
    g.fillText('⚠ EXTREME PIXEL VIOLENCE, DISMEMBERMENT & OFFICE POLITICS — ADULTS ONLY', DESIGN_W / 2, DESIGN_H - 12);
  },
};
