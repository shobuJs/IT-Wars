import stats from './stats.js';
import moves from './moves.js';
import dialogs from './dialogs.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'kratos',
  name: 'KRATOS',
  role: 'GOD OF WAR',
  palette: { accent: '#ff3030', title: '#ff8b6b', panel: ['#3a0d0d', '#141414'] },
  blurb: ['Slow tank, huge damage', 'Special: Leviathan Throw 🪓', 'Rage: Spartan Rage'],
  stats,
  moves,
  dialogs,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#dfc7a6' },
};
