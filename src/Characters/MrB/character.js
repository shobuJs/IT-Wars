import stats from './stats.js';
import moves from './moves.js';
import dialogs from './dialogs.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'mrb',
  name: 'MR.B',
  role: 'TECH ENTHUSIAST',
  palette: { accent: '#ff8fb3', title: '#ffc0d5', panel: ['#3f2030', '#160a10'] },
  blurb: ['Zoner — keep away', 'Special: Coffee Splash ☕', 'Rage: Coffee Tsunami'],
  stats,
  moves,
  dialogs,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#f2d4b0' },
};
