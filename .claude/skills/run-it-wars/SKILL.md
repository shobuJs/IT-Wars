---
name: run-it-wars
description: Run, start, serve, smoke-test, or screenshot the IT Wars game (Office Combat fighter + Office Adventure platformer). Use when asked to run the game, verify a change works, take a screenshot of any screen, or launch the local server.
---

# Run IT Wars

IT Wars is a zero-dependency browser game (vanilla JS ES modules + Canvas).
All paths below are relative to the repo root (the folder containing
`index.html` and `src/`). Three drivers live in this skill directory —
**smoke test** (no browser), **static server**, and **headless screenshots**.

## Prerequisites

- Node.js (any modern version; verified on v20) — no npm install, zero deps.
- Microsoft Edge (preinstalled on Windows 10/11) — only for screenshots.

## Verify a change (agent path — run this FIRST)

Headless full-game test: stubs the browser, imports the real `src/main.js`,
navigates start → menus → arena → character select, then plays **6 full
best-of-3 matches vs the AI covering every playable character**, rematch,
quit path, ESC handling. ~30s, no server or browser needed.

```powershell
node .claude/skills/run-it-wars/smoke.mjs
```

Last line must be `PASS: 6 full matches played ... zero uncaught errors.`
Any `FAIL (...)` line names the screen/step that broke. This catches almost
all runtime errors (menus, combat engine, AI, abilities, dialogs) but NOT
visual regressions — canvas calls are no-ops here. For visuals, screenshot.

## Serve + screenshot (visual verification)

ES modules refuse to load from `file://` — always serve:

```powershell
# terminal 1 (or Start-Process/run_in_background); default port 8321
node .claude/skills/run-it-wars/serve.mjs 8321
```

Screenshot any screen headlessly (writes a PNG you can Read):

```powershell
powershell -File .claude\skills\run-it-wars\screenshot.ps1 -Url "http://localhost:8321/index.html?screen=characterSelect" -Out shot.png
```

**Deep links** (dev feature in `src/main.js`) jump straight to any screen:

- `?screen=mainMenu` / `arenaSelect` / `characterSelect` / `result`
- `?screen=match&p1=kratos&ai=mrb&arena=awesome` — fighter ids: `mario kratos yadav sickman mrb`; arena ids: `office awesome`
- No query → start screen.

The legacy platformer is a separate page: `http://localhost:8321/OfficeAdventure/index.html`.

## Run (human path)

Double-click `..\PLAY IT WARS.bat` (parent folder of the repo) — starts a
server on port 8484 and opens the browser. QUIT GAME in the main menu stops
it and frees the port. In-game keys are on the match intro panel; `H`
toggles hitbox debug; typing `SUDO` grants unlimited rage.

## Gotchas

- **Screenshots can't get past the round intro.** Edge's
  `--virtual-time-budget` throttles rAF, so `?screen=match` shots always show
  the "ROUND 1" intro (~1.5s in), never mid-fight. Fight *logic* is covered
  by smoke.mjs instead; fighters are still visible behind the intro panel.
- **`window.ITWARS`** (set in `src/main.js`) exposes the live app object —
  `ITWARS.screens.name`, `ITWARS.session` — in DevTools and in smoke.mjs.
- **smoke.mjs expectations are position-sensitive.** It navigates menus by
  arrow-key counts (e.g. locked-arena check assumes arena index 2 is locked;
  roster order `mario kratos yadav sickman mrb`). Adding a character/arena
  or reordering registries requires updating the corresponding taps in it.
- **Port 8321 may already be in use** (a dev server from an earlier session).
  `serve.mjs` takes the port as its first arg — pass another (e.g. `8399`).
- **PowerShell 5.1**: no `&&` chaining; don't `cd` — run everything from repo
  root with the relative paths shown above.

## Troubleshooting

- `ReferenceError: addEventListener is not defined` from smoke.mjs → you're
  on Node < 15 or the stub section was edited; the file defines its own
  window-event plumbing near the top — keep it above the game import.
- Blank/black screenshot → the URL was `file://` or the server isn't
  running; check `Invoke-WebRequest http://localhost:<port>/index.html`
  returns 200 first.
- `FAIL (...): match never resolved` → combat logic changed so neither AI
  nor scripted inputs can win in sim-time; run with a real browser and `H`
  hitbox overlay to see what's stuck.
