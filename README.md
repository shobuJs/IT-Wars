# IT WARS

A bloody, over-the-top arcade game duo set entirely in the IT industry. Every
fighter is an office colleague with exaggerated abilities based on their role
and personality.

Two games in one:

- **Office Adventure** — the classic Mario-style platform massacre (the original game, untouched).
- **Office Combat** — a new Tekken/Mortal Kombat-style 1v1 arcade fighter. Single player vs AI, best of 3 rounds, 60-second timer.

Zero dependencies. Plain HTML5 Canvas + vanilla JavaScript ES modules. No build step.

## Run it

ES modules don't load from `file://` — serve the folder with any static server
and open the root page:

```
npx serve .            # or:
python -m http.server 8000
```

…or just use the VS Code **Live Server** extension. Then open `http://localhost:<port>/`.

To play on your phone, open `http://<your-pc-ip>:<port>/` from the same network —
touch controls (virtual joystick + buttons) appear automatically.

## Controls — Office Combat

| Key | Action |
|-----|--------|
| A / D | Move (double-tap to dash) |
| W | Jump |
| S | Crouch (ducks under high projectiles) |
| J / K | Punch / Kick (chain them: J→J→U, K→K→I) |
| U / I | Heavy Punch / Heavy Kick (knockdown / launcher) |
| L | Block (chip damage only) |
| O | Special ability (cooldown) |
| P | Rage attack (needs a full rage meter) |
| H | Toggle hitbox debug overlay |
| ESC | Exit the match |

Cheat: type **SUDO** during a fight for unlimited rage. Type it again to revoke
your root access.

## The roster

| Fighter | Role | Style | Special | Rage |
|---------|------|-------|---------|------|
| MARIO | The Plumber | Balanced | Plumber's Burst 🔫 | Massacre Mode |
| KRATOS | God of War | Slow tank | Leviathan Throw 🪓 | Spartan Rage |
| YADAV JI | DevOps Engineer | Mid-range bruiser | Milk-Can Mortar 🥛 | Buffalo Stampede |
| SICKMAN | IT Nerd | Fast & fragile | Bottle Toss 🍺 | Meltdown |
| MR.B | Tech Enthusiast | Zoner | Coffee Splash ☕ | Coffee Tsunami |

## Project structure

```
├── index.html               IT Wars shell (main menu entry point)
├── styles.css               Letterboxing + touch-control styles
├── OfficeAdventure/         The legacy platformer, wrapped as-is
└── src/
    ├── main.js              Boot, shared app context, the one rAF loop
    ├── GameEngine/          ScreenManager, action-mapped Input
    ├── Shared/              audio synth, math, constants
    ├── Screens/             Start → MainMenu → ModeSelect → ArenaSelect → CharacterSelect → Match → Result
    ├── UI/                  widgets, match HUD, touch controls
    ├── Effects/             particles (blood/gibs/sparks/text), screen shake/flash/hitstop
    ├── Characters/          one folder per fighter + registry (index.js)
    │   └── <Name>/          character.js, stats.js, moves.js, abilities.js, dialogs.js, sprite.js
    ├── Arenas/              one folder per arena + registry (index.js)
    └── Combat/              engine.js (state machine, hits, combos), ai.js, dialogs.js
```

## Adding content

The combat engine, screens, and AI never reference a character or arena by
name — everything flows through the registries.

**New fighter:** copy any folder under `src/Characters/`, tweak the five files
(stats, moves, abilities, sprite, character), then add one import line in
`src/Characters/index.js`. Done — selection screen, HUD, engine, and AI pick
it up automatically.

**New arena:** create `src/Arenas/<Name>/index.js` exporting
`{ id, name, locked: false, width, floorY, bounds, drawBackground(g, clock) }`,
then swap its "COMING SOON" stub in `src/Arenas/index.js` for the import.

**New ability:** abilities are plug-in objects (`onActivate`, `onUpdate`,
`onDraw`) driven by a stable combat API (`spawnProjectile`, `tryHit`, particles,
shake, freeze, sfx…). See any `abilities.js` for the pattern.

**New dialogs:** each fighter's trash talk lives in their own `dialogs.js`
with typed pools — `onHurt` (what opponents shout when they land a hit on this
character, mocking their job role) and `onVictory` (round-win one-liners).
Add lines to the arrays; the dialog engine (`src/Combat/dialogs.js`) shows
them as speech bubbles with cooldowns so combos don't become stand-up sets.

## Roadmap

Multiplayer, story mode, tournaments, more arenas (Server Room, Data Center,
Meeting Room, Cafeteria, Rooftop, HR Department), unlockable fighters,
achievements — the architecture is ready for all of it.
