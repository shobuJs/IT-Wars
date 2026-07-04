// Mobile combat controls: virtual joystick (left) + action buttons (right).
// Writes into the same action-mapped Input the keyboard uses. Shown only on
// the match screen, and only for coarse pointers.
export function createTouchControls(input) {
  const root = document.getElementById('touch');
  const joyBase = document.getElementById('joyBase');
  const joyThumb = document.getElementById('joyThumb');
  const coarse = matchMedia('(pointer: coarse)').matches;

  // ---- joystick
  let joyId = null;
  const DEAD = 0.2;
  let joyDir = { left: false, right: false, up: false, down: false };

  function setJoy(dx, dy) {
    const r = joyBase.getBoundingClientRect();
    const max = r.width / 2 - 26;
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(len, max);
    const nx = (dx / len) * cl, ny = (dy / len) * cl;
    joyThumb.style.left = `${r.width / 2 - 26 + nx}px`;
    joyThumb.style.top = `${r.height / 2 - 26 + ny}px`;
    const fx = nx / max, fy = ny / max;
    const next = {
      left: fx < -DEAD, right: fx > DEAD,
      up: fy < -0.5, down: fy > 0.5,
    };
    for (const k of ['left', 'right', 'up', 'down']) {
      if (next[k] !== joyDir[k]) input.setTouchAction(k, next[k]);
    }
    joyDir = next;
  }
  function resetJoy() {
    joyThumb.style.left = '32px';
    joyThumb.style.top = '32px';
    for (const k of ['left', 'right', 'up', 'down']) {
      if (joyDir[k]) input.setTouchAction(k, false);
    }
    joyDir = { left: false, right: false, up: false, down: false };
  }

  joyBase.addEventListener('pointerdown', (e) => {
    joyId = e.pointerId;
    joyBase.setPointerCapture(joyId);
    const r = joyBase.getBoundingClientRect();
    setJoy(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
  });
  joyBase.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyId) return;
    const r = joyBase.getBoundingClientRect();
    setJoy(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
  });
  for (const ev of ['pointerup', 'pointercancel']) {
    joyBase.addEventListener(ev, (e) => {
      if (e.pointerId !== joyId) return;
      joyId = null;
      resetJoy();
    });
  }

  // ---- action buttons
  for (const btn of root.querySelectorAll('.cbtn')) {
    const action = btn.dataset.action;
    const down = (e) => { e.preventDefault(); btn.classList.add('down'); input.setTouchAction(action, true); };
    const up = () => { btn.classList.remove('down'); input.setTouchAction(action, false); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }

  return {
    show() { if (coarse) root.classList.add('active'); },
    hide() { root.classList.remove('active'); resetJoy(); },
  };
}
