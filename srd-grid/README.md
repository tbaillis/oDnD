# SRD Grid (3.5e)

Browser-based 2D grid tactics demo that implements core D&D 3.5e SRD combat movement, attacks, cover/concealment, and attacks of opportunity. Built with Vite + TypeScript and PixiJS.

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+ (comes with Node)
- A modern browser (Chromium/Chrome, Edge, or Firefox)

## Install

```bash
git clone https://github.com/<your-org-or-user>/<your-repo>.git
cd <your-repo>
npm install
```

## Run (Dev)

```bash
npm run dev
```

- Open the printed local URL (default http://localhost:5173/).
- Hot-reloads on save.

## Build & Preview

```bash
npm run build
npm run preview
```

## Game instructions

### Goal
Move and attack with the active token to reduce the opponent to 0 HP. The game alternates turns (A then B) via the End Turn button.

### Turn flow
- Each turn provides a simple budget: one Standard action, one Move action, and one Five‑Foot Step (5 ft, no difficult terrain).
- Actions no longer auto-end your turn. Click End Turn to pass to the next combatant.

### Movement
- Click a destination square to plan and commit movement for the active token.
- 5–10–5 diagonal rule is used: first diagonal costs 5 ft, second costs 10 ft, then repeats.
- Difficult terrain doubles the cost of entering that square.
- A valid 5‑ft step (exactly 5 ft and not into difficult terrain) consumes the five‑foot step budget; otherwise movement consumes the Move action.
- Toggle “Safest path” to prefer routes that avoid threatened squares when planning.

### Attacks
- Click Attack Mode, then click the enemy to attack. Attacking consumes your Standard action.
- Touch toggle: resolves attacks against Touch AC (ignores armor, shield, and natural; keeps deflection and misc).
- Flat‑Footed toggle: removes dodge from AC and disables making Attacks of Opportunity (for demo/testing).

### Cover & Concealment
- The engine applies cover (+4 or +8) if obstacles lie between attacker and target, and concealment (20%/50%) from terrain flags where applicable.

### Attacks of Opportunity (AoO)
- Moving out of a threatened square provokes.
- Making a ranged attack while in a threatened square provokes before the attack resolves.
- In this demo, each defender can make one AoO per round.
- If Flat‑Footed is toggled on, creatures cannot make AoOs.

### UI controls (top panel)
- Safest Path: plan a route that avoids threatened squares when possible.
- End Turn: end the current turn and advance initiative/round.
- Attack Mode: switch clicks to attack the enemy instead of moving.
- Ranged: attacks are treated as ranged; ranged in melee provokes an AoO.
- Edit Terrain: click to toggle Difficult terrain; Shift+click cycles Cover for the square (0 → +4 → +8 → 0).
- Touch AC: resolve attacks vs Touch AC.
- Flat‑Footed: remove dodge to AC and disable AoOs (testing aid).
- Seed + Apply: set a deterministic RNG seed; all rolls become reproducible.
- Save / Load: persist and restore grid, pawns, toggles, round/active, AoO usage, and RNG seed via localStorage.
- Reset: reset to the starting scenario.

### Visuals
- Red tinted cells show threatened squares from the red token.
- HP bars render near each token; a winner banner appears when an opponent reaches 0 HP.

## Notes

- Dev server default: http://localhost:5173/
- Movement costs use the 5–10–5 diagonal rule.
- Difficult terrain doubles the entering step cost.
- Save data is stored in the browser’s localStorage under `srd-grid-save`.

## Troubleshooting

- If the page doesn’t load after `npm run dev`, ensure Node 18+ is installed and no other process is bound to port 5173.
- If TypeScript errors occur, run `npm install` to ensure dependencies are present.
- Clearing the browser’s localStorage will remove saved scenarios.

## Legal

This project aims to follow the Open Game License (OGL) 1.0a. Replace the placeholders in `LICENSES/` with the correct license text and Section 15 entries before distribution.
