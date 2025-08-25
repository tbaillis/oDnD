# oDnD - Digital D&D 3.5e Experience

A comprehensive browser-based implementation of D&D 3.5e SRD featuring tactical combat, character creation, and AI-powered dungeon mastering. Built with modern web technolo### Attacks
- Click Attack Mode, then click the enemy to attack. Attacking consumes your Standard action.
- **Reach Distance Enforcement**: Melee attacks are now limited by weapon reach:
  - Standard weapons: 1 square (5 feet) adjacent only
  - Reach weapons: 2 squares (10 feet) - can attack at distance but not adjacent
  - Ranged attacks have unlimited range (with line of sight requirements)
- Touch toggle: resolves attacks against Touch AC (ignores armor, shield, and natural; keeps deflection and misc).
- Flat‑Footed toggle: removes dodge from AC and disables making Attacks of Opportunity (for demo/testing).

### Cover & Concealment
- The engine applies cover (+4 or +8) if obstacles lie between attacker and target, and concealment (20%/50%) from terrain flags where applicable.

### Attacks of Opportunity (AoO)
- Moving out of a threatened square provokes.
- Making a ranged attack while in a threatened square provokes before the attack resolves.
- In this demo, each defender can make one AoO per round.
- If Flat‑Footed is toggled on, creatures cannot make AoOs.mmersive tabletop gaming experience.

## F- Dev server default: http://localhost:5176/
- Movement costs use the 5–10–5 diagonal rule.
- Difficult terrain doubles the entering step cost.
- Save data is stored in the browser's localStorage under `srd-grid-save`.re- If the page doesn't load after `npm run dev`, ensure Node 18+ is installed and no other process is bound to port 5176.
- If TypeScript errors occur, run `npm install` to ensure dependencies are present.
- Clearing the browser's localStorage will remove saved scenarios.
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

### Monster AI System
- **Automated Monster Control**: AI can take control of monster pawns during combat
- **6 Monster Personalities**: Savage Beast, Cunning Predator, Ancient Guardian, Chaotic Trickster, Mindless Construct, Vengeful Spirit
- **Tactical Decision Making**: AI analyzes battlefield conditions and makes strategic moves
- **Dynamic Dialogue**: Monsters speak and taunt during combat based on their personality
- **Toggle Control**: Players can enable/disable AI control with a simple button
- **Personality-Driven Behavior**: Each monster type has unique combat patterns and dialogue styles

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

### Development Servers

```bash
# Standard development (tactical grid only)
npm run dev

# Full development (with AI features)
npm run dev:full
```

### AI Setup (Optional)

For AI Dungeon Master features:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create `.env` file in `srd-grid/` directory:
   ```bash
   cd srd-grid
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. Start with AI features:
   ```bash
   npm run dev:full
   ```

## Usage

### Basic Combat
1. Open http://localhost:5176/ in your browser
2. Create characters using the "Create Character" button
3. Place characters on the grid by clicking
4. Right-click for movement and attack options
5. Use the combat controls to manage initiative and turns

### Character Creation
1. Click "Create Character" to open the creation wizard
2. Choose a generation method for ability scores:
   - **Point Buy**: Distribute 27 points across abilities (costs vary by score)
   - **Elite Array**: Use the standard array (15,14,13,12,10,8)
   - **4d6 Rolling**: Roll 4d6, drop lowest, for each ability
3. Select race and class for your character
4. Assign ability scores to STR, DEX, CON, INT, WIS, CHA
5. Choose skills and feats (optional steps)
6. Review and finalize your character

### AI Dungeon Master
1. Ensure AI setup is complete (see above)
2. Click the "DM" button in bottom-right corner or press `Ctrl+D`
3. Choose an AI personality from the settings (⚙️ icon)
4. Chat with the AI for game assistance, rule clarifications, and story elements
5. AI has full access to your campaign and character data

## Architecture

### Frontend
- **Vite + TypeScript**: Fast development and type safety
- **PixiJS**: Hardware-accelerated 2D graphics for the tactical grid
- **CSS Grid & Flexbox**: Responsive layout system
- **LocalStorage**: Persistent game state management

### Backend (AI Features)
- **Express.js Server**: RESTful API for AI integration
- **OpenAI GPT Models**: Natural language processing for DM responses  
- **MCP Protocol**: Model Context Protocol for structured tool usage
- **17 Specialized Tools**: Game mechanics, combat, environment, and story management

### File Structure
```
├── srd-grid/                 # Main application
│   ├── src/
│   │   ├── ai/              # AI integration and personalities  
│   │   ├── core/            # Game engine and mechanics
│   │   ├── ui/              # User interface components
│   │   └── types/           # TypeScript definitions
│   ├── tests/               # Unit and integration tests
│   └── public/              # Static assets
├── AI_DUNGEON_MASTER.md     # AI setup guide
├── CHARACTER_CREATION.md    # Character creation documentation
└── README.md                # This file
```

## Troubleshooting

### General Issues
- If the page doesn't load after `npm run dev`, ensure Node 18+ is installed and no other process is bound to port 5176
- If TypeScript errors occur, run `npm install --legacy-peer-deps` to ensure dependencies are present
- Clearing the browser's localStorage will remove saved scenarios

### AI Features Issues
- **"Configuration needed" Error**: Ensure `srd-grid/.env` file exists with valid `OPENAI_API_KEY`, then restart server with `npm run dev:full`
- **API Connection Issues**: Verify your OpenAI API key is active and has available credits
- **DM Panel Not Appearing**: Check browser console for JavaScript errors and verify both servers are running
- **Port Conflicts**: AI server uses port 3001 - ensure it's not in use by another process

### Performance
- **Grid Rendering Issues**: Try disabling browser hardware acceleration if visual artifacts appear
- **Memory Usage**: Clear localStorage periodically to prevent excessive save data buildup
- **Browser Compatibility**: Use Chrome, Edge, or Firefox for best performance; Safari may have WebGL limitations

## Development Notes

- **Movement costs** use the 5–10–5 diagonal rule per D&D 3.5e SRD
- **Difficult terrain** doubles the entering step cost  
- **Save data** is stored in the browser's localStorage under `srd-grid-save`
- **Default URLs**: 
  - Tactical grid: http://localhost:5176/
  - AI DM server: http://localhost:3001/

### Testing
```bash
cd srd-grid
npm test        # Run unit tests
npm run test:e2e # Run end-to-end tests (requires Playwright)
```

Current test status: 9/10 unit tests passing, 1 E2E test with known issue.

## Game Instructions

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

### Monster AI System (NEW!)
- **Automated Combat**: AI can control monster pawns automatically during their turns
- **Toggle Control**: Enable/disable with the "AI: ON/OFF" button that appears during monster turns
- **6 Personalities**: Each monster type has unique behavior patterns and combat strategies
- **Dynamic Dialogue**: Monsters speak during combat with personality-appropriate taunts and thoughts
- **Smart Tactics**: AI analyzes battlefield conditions and makes strategic decisions
- **Easy Testing**: Use browser console commands `testMonsterAI()` and `toggleMonsterAI()` for testing

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

## Legal & Licensing

This project is built using content from the **D&D 3.5e System Reference Document (SRD)** under the Open Game License (OGL) 1.0a.

**Open Game Content**: All game mechanics, rules, and systems derived from the D&D 3.5e SRD are considered Open Game Content and are available under the OGL.

**Product Identity**: This project does not use any Product Identity from Wizards of the Coast. All original content, code, and implementations are the work of the project contributors.

### License Information

- **Source Code**: This project's original code and implementations are available under standard open-source licensing
- **Game Content**: D&D 3.5e rules and mechanics are used under the [Open Game License 1.0a](OPEN_GAME_LICENSE.md)
- **Attribution**: System Reference Document content is used with proper attribution as required by Section 15 of the OGL

For the complete Open Game License text and copyright notices, see [OPEN_GAME_LICENSE.md](OPEN_GAME_LICENSE.md).

### Open Game Content Declaration

The following portions of this work are designated as Open Game Content:
- All game mechanics, rules, and statistical information derived from the D&D 3.5e SRD
- Character creation systems including ability scores, races, classes, skills, and feats
- Combat mechanics including movement, attacks, damage, and tactical positioning
- All numerical values, formulas, and game calculations based on the SRD

The following are specifically excluded as Product Identity and are not Open Game Content:
- The application's source code, user interface, and technical implementation
- Original AI personality descriptions and responses not directly derived from the SRD
- Custom user interface elements, graphics, and presentation layer
- Project name, branding, and original documentation
