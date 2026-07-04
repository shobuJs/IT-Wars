import stats from './stats.js';
import moves from './moves.js';
import { special, rage } from './abilities.js';
import { drawBody } from './sprite.js';

export default {
  id: 'mario',
  name: 'MARIO',
  role: 'THE PLUMBER',
  palette: { accent: '#ffd93d', title: '#ffe28a', panel: ['#5c94fc', '#2a52be'] },
  blurb: ['Balanced all-rounder', "Special: Plumber's Burst 🔫", 'Rage: Massacre Mode'],
  stats,
  moves,
  abilities: { special, rage },
  sprite: { draw: drawBody, w: 22, h: 30, skin: '#ffc89b' },
};
