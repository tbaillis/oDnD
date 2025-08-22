# SRD Grid (3.5e)

Browser-based 2D grid game engine implementing core 3.5e SRD mechanics.

## Dev

- Start dev server:
  - `npm run dev`
- Build and preview:
  - `npm run build`
  - `npm run preview`

## How to play

- Toggle "Safest path" to avoid AoO when planning movement.
- Click on the grid to move the active token (A then B). Movement ends the turn.
- Click "Attack Mode" then click the enemy to attack; ends the turn.
- Red-tinted cells show threatened squares from the red token.
- HP bars are drawn near token bottoms; a simple winner banner appears at 0 HP.

## Notes

- The dev server runs at http://localhost:5173/.
- Movement costs use the 5–10–5 diagonal rule, and difficult terrain doubles the entering step cost.

## Legal

This project aims to follow the Open Game License (OGL) 1.0a. Replace the placeholders in `LICENSES/` with the correct license text and Section 15 entries before distribution.
