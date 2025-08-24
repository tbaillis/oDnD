# oDnD - Digital D&D 3.5e Experience

A comprehensive browser-based implementation of D&D 3.5e SRD featuring tactical combat, character creation, and AI-powered dungeon mastering. Built with modern web technologies for an immersive tabletop gaming experience.

## Features

### Core Game Systems
- **D&D 3.5e SRD Implementation**: Complete ruleset including combat, movement, and character mechanics
- **Tactical Combat Grid**: Interactive 2D battlefield with PixiJS-powered graphics
- **Character Creation**: Multi-step wizard with three ability generation methods:
  - **Point Buy System**: 27 points to distribute across abilities
  - **Elite Array**: Standard array (15, 14, 13, 12, 10, 8) for balanced characters
  - **4d6 Rolling**: Traditional dice rolling with drop lowest mechanic
- **Race & Class Selection**: Human, Elf, Dwarf, Halfling races with Fighter, Rogue, Wizard, Cleric classes
- **Skills & Feats**: Comprehensive skill system and feat selection for character customization

### Combat & Movement
- **5-10-5 Diagonal Movement**: Authentic D&D 3.5e movement costs
- **Difficult Terrain**: Dynamic terrain effects that modify movement costs
- **Cover & Concealment**: Advanced line-of-sight and cover mechanics
- **Attack Rolls & Damage**: Full combat resolution with modifiers and critical hits

### AI Dungeon Master
- **4 AI Personalities**: 
  - Experienced Wise Mentor (patient, educational)
  - Dramatic Storyteller (theatrical, immersive)
  - Tactical Strategist (combat-focused, optimization)
  - Mysterious Guide (enigmatic, discovery-focused)
- **17 Specialized Tools**: Combat management, environment control, story elements, dice rolling
- **Real-time Integration**: AI has full access to game state and character data
- **Sliding Chat Panel**: Accessible interface with keyboard shortcuts

### Technical Features
- **Save System**: Persistent game state stored in browser localStorage
- **Responsive Design**: Works on desktop and tablet devices
- **Modern Architecture**: TypeScript, Vite, and PixiJS for performance and maintainability

## Quick Start

> **Note**: The main application code is located in the `srd-grid/` directory within this repository.

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+ (comes with Node)  
- A modern browser (Chromium/Chrome, Edge, or Firefox)
- **For AI Features**: OpenAI API key (optional but recommended)

### Installation

```bash
git clone https://github.com/tbaillis/oDnD.git
cd oDnD
npm install  # This will automatically install dependencies in srd-grid/ with --legacy-peer-deps
```

Alternatively, if you prefer to work directly in the srd-grid directory:

```bash
cd srd-grid
npm install --legacy-peer-deps
```

## Run (Dev)

```bash
npm run dev  # Starts the development server
```

- Open the printed local URL (default http://localhost:5173/).
- Hot-reloads on save.

Alternatively, you can work directly in the srd-grid directory:

```bash
cd srd-grid
npm run dev
```

### Full Development (Client + AI DM Server)
For AI features, start both the frontend and MCP server:

```bash
npm run dev:full  # or: cd srd-grid && npm run dev:full
```
This starts both:
- **Frontend**: http://localhost:5173/ (with hot-reload)
- **AI DM Server**: http://localhost:3001/ (MCP server for AI features)

## Build & Preview

```bash
npm run build  # Build the application
npm run preview  # Preview the built application
```

## AI Setup

### Enable AI Dungeon Master Features
1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Create Environment File**:
   ```bash
   cd srd-grid
   cp .env.example .env
   ```
3. **Add Your API Key** to `srd-grid/.env`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. **Start Full Development Server**:
   ```bash
   npm run dev:full
   ```

The AI features are completely optional - the tactical combat system works perfectly without them!

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

### Character Management
- **New Character**: Click the button or press **N** to open the character creation interface with full D&D 3.5 point-buy system.
- **Character Sheet**: Press **C** to view detailed character stats, equipment, and abilities.
- **Spell Book**: Press **S** to view available spells and casting information.
- **Close UI**: Press **Escape** to close any open interface.

### AI Dungeon Master (Optional)
- **DM Chat Panel**: Click "DM" button (bottom-right) or press **Ctrl+D** to open AI assistant
- **4 AI Personalities**: Choose from Experienced Mentor, Dramatic Storyteller, Tactical Strategist, or Mysterious Guide
- **17 Specialized Tools**: AI has access to combat management, environment control, story elements, and game mechanics
- **Real-time Integration**: AI is aware of your current campaign state and can assist with gameplay

**Status Indicators**:
- 🟢 **Green**: AI configured and ready
- 🟡 **Orange**: Initializing connection  
- 🔴 **Red**: OpenAI API key needed (see [AI Setup](#ai-setup))

See [srd-grid/CHARACTER_CREATION.md](srd-grid/CHARACTER_CREATION.md) for detailed character creation instructions.
See [srd-grid/AI_DUNGEON_MASTER.md](srd-grid/AI_DUNGEON_MASTER.md) for complete AI setup and usage guide.

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
