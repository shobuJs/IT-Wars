import stats from './stats.js';
import moves from './moves.js';
import dialogs from './dialogs.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'yadav',
  name: 'YADAV JI',
  role: 'DEVOPS ENGINEER',
  palette: { accent: '#7ee787', title: '#9fe8ff', panel: ['#26343f', '#10151a'] },
  blurb: ['Mid-range bruiser', 'Special: Milk-Can Mortar 🥛', 'Rage: Buffalo Stampede'],
  stats,
  moves,
  dialogs,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#c98f5f' },
};
