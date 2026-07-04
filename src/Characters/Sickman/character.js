import stats from './stats.js';
import moves from './moves.js';
import dialogs from './dialogs.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'sickman',
  name: 'SICKMAN',
  role: 'IT NERD',
  palette: { accent: '#f5a623', title: '#ffce6b', panel: ['#3a2a10', '#16100a'] },
  blurb: ['Fast & fragile rushdown', 'Special: Bottle Toss 🍺', 'Rage: Meltdown'],
  stats,
  moves,
  dialogs,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#e8b88a' },
};
