// Arena registry — the ONLY file to touch when adding an arena:
// build Arenas/<Name>/index.js and swap its locked stub for an import.
import office from './OfficeArena/index.js';
import awesome from './AwesomeArea/index.js';
import scrum from './ScrumRoom/index.js';

export const ARENAS = [
  office,
  awesome,
  { id: 'server-room', name: 'SERVER ROOM', locked: true, icon: '🖥️' },
  { id: 'data-center', name: 'DATA CENTER', locked: true, icon: '💾' },
  scrum,
  { id: 'cafeteria', name: 'CAFETERIA', locked: true, icon: '🍔' },
  { id: 'rooftop', name: 'ROOFTOP', locked: true, icon: '🌆' },
  { id: 'hr-department', name: 'HR DEPARTMENT', locked: true, icon: '📋' },
];

export const arenaById = Object.fromEntries(ARENAS.map(a => [a.id, a]));
