---
name: add-content
description: Add or create new IT Wars content - a new character/fighter/colleague, arena/stage, special or rage ability, dialogs/taunts, moves, or idle quirk. Use when asked to add a character, create an arena, give someone new dialogs or abilities, or rebalance moves.
---

# Adding IT Wars Content

The engine, screens, and AI never reference content by name — everything
flows through registries and standard-shaped objects. Adding content =
new files + one registry import line. **Never edit `src/Combat/engine.js`
or any `src/Screens/` file to add content.** Paths relative to repo root.

After ANY content change, verify with the run-it-wars skill:
`node .claude/skills/run-it-wars/smoke.mjs` must end in PASS
(⚠ if you added/reordered a character or arena, first update the arrow-key
navigation counts in that smoke.mjs — see its Gotchas), then screenshot via
deep link (`?screen=match&p1=<newid>` / `?screen=characterSelect`).

## New character (fighter)

1. Copy the closest existing folder, e.g. `src/Characters/Yadav/` →
   `src/Characters/NewGuy/`. Six files:
   - `character.js` — assembles everything:
     ```js
     export default {
       id: 'newguy',                 // lowercase, unique
       name: 'NEW GUY', role: 'QA ENGINEER',
       palette: { accent: '#7ee787', title: '#9fe8ff', panel: ['#26343f', '#10151a'] },
       blurb: ['One-line style', 'Special: … 🐛', 'Rage: …'],   // 3 lines on select panel
       stats, moves, dialogs,
       abilities: { special, rage },
       sprite: { draw: drawBody, w: 22, h: 30, skin: '#c98f5f',
                 idle: { flag: 'listening', after: 2 } },       // optional idle quirk
     };
     ```
   - `stats.js` — `{ maxHealth, walkSpeed, jumpVy, strength, defense, ai: { preferredDist, aggroBias } }`.
     Balance envelope in the roster: hp 85–120, walkSpeed 165–260,
     strength 0.85–1.25, defense 0.85–1.15 (lower = tankier). `ai` shapes the
     opponent brain: mrb keeps away (`preferredDist: 320, aggroBias: -0.15`),
     kratos crowds (`90, +0.15`).
   - `moves.js` — five normals, pure data (see "Move fields" below).
   - `abilities.js` — `special` + `rage` objects (see "Ability contract").
   - `dialogs.js` — typed pools (see "Dialogs").
   - `sprite.js` — `export function drawBody(g, p, clock)` drawing a 22×30
     pixel body with canvas rects. `p` gives `{x, y, w, h, face(±1), vx,
     anim, onGround, big, raging, …customFlags}`. Walk cycle idiom:
     `const step = Math.abs(p.vx) > 10 && p.onGround ? Math.sin(p.anim * 1.2) : 0`
     then legs at `y+20` offset by `±step*2`. Mirror facing-dependent bits
     with `p.face > 0 ? … : …`.
2. Register: one import line + array entry in `src/Characters/index.js`.
3. Update the smoke test's roster list/taps, run it, screenshot
   `?screen=characterSelect` (panels auto-layout from `CHARACTERS.length`).

## New arena (stage)

1. Create `src/Arenas/<Name>/index.js`:
   ```js
   export default {
     id: 'server-room', name: 'SERVER ROOM', locked: false,
     width: 1200,                      // arena is wider than the 960 viewport
     floorY: 470,                      // fighters' feet line (540-tall space)
     bounds: { left: 30, right: 1170 },
     drawBackground(g, clock) { /* full scene in world coords, 0..width × 0..540 */ },
     drawForeground(g, clock) {},      // optional, drawn over fighters
   };
   ```
2. In `src/Arenas/index.js`, replace the matching `{ id, name, locked: true }`
   stub with the import (or append if it's brand new).
3. Animate with `clock` (ms) — flickering monitors, drifting steam; see
   `AwesomeArea/index.js` for fairy lights, 3D wall text, animated TT ball.
   The arena-select screen renders `drawBackground` as a live miniature
   automatically. Camera shows the middle ~960px by default — put must-see
   props near the center, ambience at the edges.

## Ability contract (special / rage)

Plug-in objects in the character's `abilities.js`; engine calls the hooks:

```js
export const special = {
  id: 'bugSwarm', name: 'BUG SWARM', icon: '🐛',
  kind: 'special', cooldown: 4.0,          // rage: kind: 'rage', cost: 100
  canActivate(f, api) { return true; },     // optional gate
  onActivate(f, api) { /* fire once on cast */ },
  onUpdate(f, api, dt) { /* every frame, both idle & active — guard on f.sp */ },
  onDraw(f, api, g) { /* world-space custom visuals */ },
};
```

- Per-fighter scratch state goes on `f.sp.<yourKey>` (cleared each round).
- **Rage abilities must set `f.rageActive = false` when the script ends** —
  otherwise the fighter stays locked until the engine's 8s safety valve.
- `api` surface (from `engine.js`): `spawnProjectile(f, def)`,
  `tryHit(f, rect, hitDef) → bool`, `opponentOf(f)`, `sfx(name)`
  (names in `src/Shared/audio.js` SFX table), `text/sparks/blood/gibs`,
  `shake(n)`, `flash(color, dur)`, `freeze(sec)`, `arena{floorY,bounds}`, `aabb`.
- Projectile `def`: `{x, y, w, h, vx, vy?, gravity?, dmg, hitstun, blockstun?,
  knockback, chip?, launch?, knockdown?, pierce?, spin?, hitSfx?,
  draw(g, pr, clock), onLand?(pr, api), onHit?(pr, api)}`.
- `tryHit` hitDef: `{dmg, hitstun, blockstun?, knockback, launch?, knockdown?,
  unblockable?, chip?, sfx?}` — one call per intended hit (track your own
  `hit` flags for once-only hits).

## Move fields (moves.js)

`punch, kick, heavyPunch, heavyKick, air` — seconds-based frame-data:

```js
punch: { startup: 0.07, active: 0.06, recovery: 0.16, dmg: 5, hitstun: 0.26,
         blockstun: 0.14, knockback: 90, hitbox: { ox: 42, oy: 16, w: 38, h: 20 },
         chain: true },
```

- `hitbox`: **authored against a 2.5× body** (engine rescales via
  `HB = FIGHT_SCALE/2.5`) — `ox` forward from fighter center, `oy` from top;
  punches `oy≈16`, kicks `oy≈46`, reach `ox` 38–55 by archetype.
- Lights get `chain: true` (routes are the `CHAIN_NEXT` table in engine.js:
  punch→punch/kick/heavyPunch, kick→kick/heavyKick, max 3 hits).
- Heavies: `knockdown: true` (heavyPunch) or `launch: 420–440` px/s (heavyKick).
- Balance idiom: `recovery ≈ startup × 1.4 + 0.06`; fast chars hit weak
  (sickman lp: 4 dmg / .05s), tanks hit slow and huge (kratos hk: 18 / .30s).

## Dialogs (dialogs.js)

Typed pools; the dialog engine (`src/Combat/dialogs.js`) handles bubbles,
cooldowns, and no-repeat cycling — just add strings:

```js
export default {
  onHurt:    ['taunt shouted BY OPPONENTS when they hit this character'],
  onVictory: ['this character's own round-win one-liner'],
};
```

Roman-Hindi office humor is the house style ("deployment fat gaya").
New dialog *types* = new pool here + a hook in `src/Combat/dialogs.js`.

## Idle quirk (character does something after standing still)

`sprite: { …, idle: { flag: 'vibing', after: 2 } }` — after 2s idle the
engine sets `pose.vibing = true`; draw the gag inside `drawBody` under
`if (p.vibing) { … }`. Existing: yadav `listening` (headphones + notes),
sickman `smoking`, mrb `thinking`. The character-select showcase and start
screen pick these up automatically via `c.sprite.idle`.
