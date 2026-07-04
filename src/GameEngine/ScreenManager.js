// Tiny screen manager. Screens are plain objects:
// { enter(app, params), exit(app), update(app, dt), render(app, g), onPointer(app, x, y, type) }
export function createScreenManager() {
  const screens = Object.create(null);
  let current = null;
  let currentName = null;

  return {
    register(name, screen) { screens[name] = screen; },
    goto(app, name, params) {
      if (!screens[name]) throw new Error(`Unknown screen: ${name}`);
      if (current && current.exit) current.exit(app);
      current = screens[name];
      currentName = name;
      if (current.enter) current.enter(app, params || {});
    },
    update(app, dt) { if (current && current.update) current.update(app, dt); },
    render(app, g) { if (current && current.render) current.render(app, g); },
    onPointer(app, x, y, type) { if (current && current.onPointer) current.onPointer(app, x, y, type); },
    get name() { return currentName; },
  };
}
