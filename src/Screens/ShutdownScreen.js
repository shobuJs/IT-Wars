// Full quit: asks the launcher's server to shut down (freeing the port),
// then tries to close the tab. If the game is being served by a different
// static server (Live Server, npx serve…), the shutdown call just no-ops
// and the player closes the tab themselves.
import { DESIGN_W, DESIGN_H, FONT, COLORS } from '../Shared/constants.js';

let closedAt = 0;

export default {
  enter(app) {
    closedAt = app.clock;
    fetch('/shutdown', { method: 'POST' }).catch(() => {});
    setTimeout(() => { try { window.close(); } catch (e) {} }, 900);
  },

  update() {},

  render(app, g) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, DESIGN_W, DESIGN_H);
    g.textAlign = 'center';
    g.font = `900 54px ${FONT}`;
    g.fillStyle = COLORS.bloodBright;
    g.fillText('GAME CLOSED', DESIGN_W / 2, 230);
    g.font = `16px ${FONT}`;
    g.fillStyle = COLORS.dim;
    g.fillText('Server stopped and port released.', DESIGN_W / 2, 272);
    if (app.clock - closedAt > 1200) {
      g.fillStyle = 'rgba(242,233,228,0.7)';
      g.fillText('You can close this tab now. Ticket resolved. 🎟️', DESIGN_W / 2, 300);
    }
  },
};
