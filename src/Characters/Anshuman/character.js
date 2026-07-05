import stats from './stats.js';
import moves from './moves.js';
import dialogs from './dialogs.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'anshuman',
  name: 'THE ANSHUMAN',
  role: 'SALES EXECUTIVE',
  palette: { accent: '#e8a33d', title: '#ffcf80', panel: ['#332618', '#120c08'] },
  blurb: ['Big laugh, bigger deals', 'Special: Grand Laughter 😂', 'Rage: Target Achieved!'],
  stats,
  moves,
  dialogs,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#c9915f', idle: { flag: 'gaming', after: 2 } },
};
