// Action-mapped input: keyboard + touch write into the same action state.
// Combat/screens consume abstract actions, never raw key codes.
import { resumeAudio } from '../Shared/audio.js';

const KEY_MAP = {
  a: 'left', d: 'right', w: 'up', s: 'down',
  j: 'punch', k: 'kick', u: 'heavyPunch', i: 'heavyKick',
  l: 'block', o: 'special', p: 'rage',
  arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down',
  enter: 'confirm', ' ': 'confirm',
  escape: 'back',
  h: 'debug',   // toggle hitbox overlay in a match
};

export function createInput() {
  const held = Object.create(null);
  const pressed = Object.create(null);   // edge: set on keydown, cleared in endFrame
  let cheatBuf = '';
  let cheatRage = false;

  function press(action) {
    if (!held[action]) pressed[action] = true;
    held[action] = true;
  }
  function release(action) {
    held[action] = false;
  }

  addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    resumeAudio();
    if (e.repeat) return;
    // cheat: type "sudo" → infinite rage meter (same gag as the platformer)
    if (/^[a-z]$/i.test(e.key)) {
      cheatBuf = (cheatBuf + e.key.toLowerCase()).slice(-8);
      if (cheatBuf.endsWith('sudo')) { cheatRage = !cheatRage; cheatBuf = ''; }
    }
    const action = KEY_MAP[e.key.toLowerCase()];
    if (action) press(action);
  });
  addEventListener('keyup', (e) => {
    const action = KEY_MAP[e.key.toLowerCase()];
    if (action) release(action);
  });

  return {
    isDown: (action) => !!held[action],
    justPressed: (action) => !!pressed[action],
    setTouchAction(action, down) { down ? press(action) : release(action); },
    endFrame() { for (const k in pressed) pressed[k] = false; },
    clearAll() {
      for (const k in held) held[k] = false;
      for (const k in pressed) pressed[k] = false;
    },
    get cheatRage() { return cheatRage; },
  };
}
