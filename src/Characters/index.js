// Character registry — the ONLY file to touch when adding a fighter:
// create Characters/<Name>/ (copy an existing folder) and import it here.
import mario from './Mario/character.js';
import kratos from './Kratos/character.js';
import yadav from './Yadav/character.js';
import sickman from './Sickman/character.js';
import mrb from './MrB/character.js';

export const CHARACTERS = [mario, kratos, yadav, sickman, mrb];
export const characterById = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
