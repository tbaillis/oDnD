
# Development Task Checklist (Step-by-Step)



- [ ] Step 1: Project skeleton and folder layout
	- [ ] src/engine (render loop, ECS world, time, RNG)
	- [ ] src/game (rules modules: combat, skills, magic, conditions, economy)
	- [ ] src/data (schemas via Zod + seed JSON for skills/feats/spells/equipment)
	- [ ] src/ui (panels: character sheet, log, inventory, tooltips)
	- [ ] src/tests (unit specs for dice, stacking, checks)
	- [ ] e2e/ (Playwright specs: start game, move, attack, skill check)
	- [ ] public/assets (tiles, icons, UI sprites)
	- [ ] LICENSES/ (OGL 1.0a text + Section 15)

- [ ] Step 2: Core foundation
	- [ ] Dice and RNG
		- [ ] Implement deterministic RNG with seed support (Mersenne or mulberry32)
		- [ ] Dice helpers: d20, d%, advantage/disadvantage-like rolls for internal tests (not SRD)
		- [ ] Unit tests for distributions and min/max bounds
	- [ ] Typed bonus system and stacking rules
		- [ ] Model bonus types: enhancement, competence, morale, dodge, sacred/profane, luck, circumstance, unnamed
		- [ ] Resolver that computes final modifier from a set of typed sources per SRD stacking rules (only highest typed; dodge/circumstance stack; unnamed stack)
		- [ ] Tests: opposing typed bonuses, multiple unnamed, dodge stacking, synergy vs competence interactions
	- [ ] Units/time
		- [ ] Standard time slices: rounds (6s), rounds/level, minutes/level, hours/level; concentration; durations with concentration checks
		- [ ] Action economy: standard, move, full, 5-ft step, free, swift/immediate (if you include)
		- [ ] Tests for action sequencing and mutual exclusivity (e.g., full attack vs move>5ft)

- [ ] Step 3: ECS and render loop
	- [ ] Create bitECS world with time component (delta, elapsed)
	- [ ] PixiJS Application setup; single root container, camera container
	- [ ] Systems: timeSystem, inputSystem, renderSystem, animationSystem
	- [ ] Component sets (SoA arrays):
				- GridPosition { x:int, y:int, layer:int }
				- Sprite { spriteRef, z }
				- Team/Faction { id }
				- Size { category: fine..colossal, reach }
				- Vision { sight, darkvision, blindsense? }
				- Stats { STR, DEX, CON, INT, WIS, CHA; BAB; saves base }
				- HP { current, max, temp }
				- ACBreakdown { base, armor, shield, natural, deflection, dodge, miscTyped[] }
				- Movement { speed, encumberedSpeed }
				- ConditionsBitset (stunned, prone, flat-footed, invisible, etc.)
				- Effects[] (active spell/feat effects with durations/typed bonuses)
	- [ ] Camera + grid layers: background, terrain, tokens, overlays
	- [ ] Unit tests: component add/remove, query correctness, system order

- [ ] Step 4: Tile grid, LoS/LoE, diagonals, terrain
	- [ ] Grid model: width/height, cell size (e.g., 50 px)
	- [ ] Diagonal movement cost: 5-10-5 pattern for 3.5e (alternating 1 and 2 cells)
	- [ ] Terrain flags: blocking LoS, blocking LoE, difficult terrain, cover value
	- [ ] Implement LoS (Bresenham with blockers) and LoE (separate mask to allow e.g., fog effects)
	- [ ] Cover/concealment calculators:
				- Cover degrees ( +4 AC for standard cover; improved cover +8 and +4 Reflex) per intersection rules
				- Concealment (20%/50%) for fog/darkness/invisibility; roll d% for miss chance
	- [ ] Tests: diagonal counting, LoS through corners, cover across corners, concealment stacking with invisibility

- [ ] Step 5: Pathfinding and threatened areas
	- [ ] Wire PathFinding.js with grid: walkable map + costs (difficult terrain cost 2)
	- [ ] AllowDiagonal=true with dontCrossCorners to respect tight spaces
	- [ ] Threat map system:
				- Compute threatened squares per creature size/reach and weapon (reach weapons)
				- Mark AoO-triggering moves (leaving a threatened square without 5-ft step or Tumble success)
	- [ ] Path planner that can:
				- Avoid AoOs by preferring non-threat paths
				- Optionally allow risk-taking with toggles (accept AoOs to shorten path)
	- [ ] Tests: threatened overlay, 5-ft step immunity, Tumble DC scaling (DC 15 + 2 per additional threatened)

- [ ] Step 6: Initiative, turns, and actions
	- [ ] Initiative flow: roll d20 + Dex + modifiers; flat-footed before first turn
	- [ ] Turn manager: action points per round (standard/move/free/5ft), readied and delayed actions
	- [ ] Attacks of Opportunity triggers:
				- Movement out of threatened square (except 5-ft step)
				- Ranged attack, casting, drinking potion, etc. without defensive measures
				- Casting defensively Concentration check to avoid AoO
	- [ ] Tests: ready/delay ordering; flat-footed AC; AoO trigger matrix

- [ ] Step 7: Combat resolution
	- [ ] Attack rolls: 1d20 + attack bonus vs target AC; touch and flat-footed AC handling
	- [ ] Critical: weapon threat range confirmation; damage multipliers by type; non-multiplying adders
	- [ ] Damage: STR scaling (melee/thrown), 2H 1.5x STR to damage, offhand 0.5x; minimum 1 damage on hit
	- [ ] DR/ER/regeneration/hardness interactions: order of operations; typed damage (slashing/piercing/bludgeoning; energy)
	- [ ] Size/reach: weapon size adjustment to damage dice; space/reach per size
	- [ ] Conditions from combat: dying, disabled, massive damage
	- [ ] Tests: crit confirm, DR bypass with special materials, energy resistance application, regen suppression by damage type

- [ ] Step 8: Skills engine
	- [ ] Skill schema (Zod): key ability, trained-only, ACP, action/time, retries, special, synergy, untrained behavior
	- [ ] Skill check: d20 + ranks + key ability + misc typed bonuses + synergy
	- [ ] Take 10 / Take 20 rules (no stress; 20 implies time and failure consequences)
	- [ ] Aid Another mechanics (+2 on DC 10)
	- [ ] Tumble, Balance, Hide/Move Silently, Spot/Listen, Concentration specifics
	- [ ] Tests: untrained usage limits, take10/20 eligibility, Aid Another stacking, armor check penalty application

- [ ] Step 9: Magic & spellcasting core
	- [ ] Spell schema (Zod): school/subschool, descriptors, components (V/S/M/F/DF/XP), casting time, range, target/effect/area/LoE, duration, save, SR, text
	- [ ] Casting flow:
				- Components & ASF; concentration checks (damage, vigorous motion)
				- Casting defensively; AoO trigger; interruption resolution and spell loss
				- Save DCs: 10 + spell level + ability mod + typed bonuses; partial/negates
				- SR checks (d20 + CL vs SR)
	- [ ] Areas: burst/cone/line templates snapped to grid; LoS/LoE constraints
	- [ ] Initial spell set for MVP: Magic Missile, Cure Light Wounds, Fireball, Invisibility, Fog Cloud, Protection from Evil
	- [ ] Tests: save/partial outcomes, SR success/failure, concentration DCs, area grid coverage

- [ ] Step 10: Effects system
	- [ ] Unified effect application with typed bonuses and durations (rounds/minutes/hours/level)
	- [ ] Stacking/overlap rules: only highest typed; same-spell non-stacking; different sources interplay
	- [ ] Persistent auras and environmental effects (fog, darkness) as map-layer effects
	- [ ] Tests: overlapping buffs, dispel interactions (basic), visibility changes and concealment

- [ ] Step 11: Equipment, proficiency, and encumbrance
	- [ ] Weapon schema: category, proficiency, handedness, damage by size, crit, range inc, weight, type, properties, special materials
	- [ ] Armor/shield schema: AC bonus, max Dex, ACP, ASF, speed, don/doff
	- [ ] Proficiency penalties and improvised weapon rules
	- [ ] Encumbrance: carry thresholds by STR & size; speed/max Dex/ACP adjustments; lifting/dragging
	- [ ] Special materials: adamantine, cold iron, mithral, alchemical silver — DR/hardness/ASF/ACP impacts
	- [ ] Tests: ACP flow to skills, ASF on arcane spells with somatic, size scaling for weapon damage and armor fit

- [ ] Step 12: Economy and inventory
	- [ ] Currency model: cp/sp/gp/pp with conversions; coin weight (50 coins/lb)
	- [ ] Trade goods pricing; standard resale at 50% list (exception: trade goods at value)
	- [ ] Inventory UI: weight tallies; auto-encumbrance updates; equip/unequip pipeline
	- [ ] Tests: buy/sell, coin weight effects, price calculations

- [ ] Step 13: Character builder (MVP)

	- [ ] Ability scores, race/size, class level with BAB/save progressions
	- [ ] Feats schema and prerequisite engine (ability, BAB, level, feats, skill ranks)
	- [ ] Auto-calc derived stats: HP, AC breakdown, initiative, skills (class vs cross-class ranks caps)
	- [ ] Tests: prereq gating, ranks caps (level+3 vs half), auto totals and caps

- [ ] Step 14: UI/UX essentials
	- [ ] Grid interaction: select, move preview with path & AoO highlights; measure tool
	- [ ] Overlays: threatened squares, reach, cover lines, LoS cones, AoE templates
	- [ ] Panels: turn tracker, combat log (including dice breakdown), character sheet, inventory
	- [ ] Tooltips with SRD rule snippets for actions/effects (avoid PI text)
	- [ ] Accessibility: colorblind-friendly overlays; zoom/pan; keyboard binds

- [ ] Step 15: Game states and saves
	- [ ] Deterministic replay log (seed + input stream); enable undo/redo per turn
	- [ ] Save/load to JSON; schema validation via Zod on load
	- [ ] Tests: replay determinism, schema migration guard

- [ ] Step 16: Content ingestion
	- [ ] Create seed JSONs for a minimal set of skills, feats, weapons/armor, and the MVP spells
	- [ ] Validate with Zod; fail-fast on startup with error surfaces
	- [ ] Add data QA tests (e.g., feats reference skills/feats that exist; spell components valid)

- [ ] Step 17: Testing and tooling
	- [ ] Vitest unit tests: dice, stacking, checks, AoO triggers, cover, concealment, SR/saves
				pwsh
				npm run test
	- [ ] Coverage with v8 and thresholds for critical modules
				pwsh
				npm run coverage
	- [ ] Playwright E2E: start game, move without provoking, cast defensively, sell loot 50%, take 10 on unthreatened skill
				pwsh
				npx playwright install
				npx playwright test --headed --project=chromium
	- [ ] CI matrix (optional): Node 20/22; run unit + E2E on push/PR

- [ ] Step 18: Performance passes
	- [ ] ECS profiling: query sizes, system order; avoid per-frame allocations
	- [ ] Rendering: object pooling; chunked grid rendering; cull offscreen tokens
	- [ ] Pathfinding: clone grid reuse; precompute threat maps; cache last path with invalidation
	- [ ] Playtest with 100+ tokens; target 60fps on mid-tier laptop

- [ ] Step 19: Packaging and deploy
	- [ ] Vite build and static hosting
				pwsh
				npm run build
				npm run preview
	- [ ] Include LICENSES/OGL.txt and Section 15; README with scope and attributions
	- [ ] Optional: GitHub Pages/Static Web App deploy

- [ ] Step 20: Stretch systems (post-MVP)
	- [ ] Grapple/trip/disarm/bull rush/sunder
	- [ ] Polymorph/wild shape framework
	- [ ] Summoning and minion control
	- [ ] Counterspells/ready action interrupts
	- [ ] Magic items and crafting
	- [ ] Monsters and special abilities (Ex/Su/Sp)

# oDnD Unified Game Engine Feature Roadmap

This document outlines the features required to create a unified game engine for the oDnD project. The list is broken into manageable sections for clarity and ongoing expansion.

## Implemented features not previously listed

These capabilities exist in the current codebase but were not explicitly called out in the roadmap. They complement the items below and help guide verification and next steps.

- Gold Box-style overlay and adapter
	- Full-screen overlay with party/status/log/commands and hotkeys
	- Adapter syncs 6 party slots with pawn stats and updates in real time
	- Global utilities for HP sync between pawns and character sheets
- Character creation modal (multi-step)
	- Ability generation: point buy, array, and 4d6 (drop lowest) workflows
	- Skills/feats/equipment selection; name suggestions; non-blocking validation
- Token management and assets
	- Auto-discovery of token images via Vite glob; per-pawn token selection UI
	- Default token assignment and quick rescan controls
- Battlefield settings and backgrounds
	- Preset backgrounds (e.g., Dungeon) and custom upload/URL support
	- Persistent settings via localStorage; border and layout tuning
	- App-level background sync with settings
- Initiative tracker and HUD
	- Side panel showing order, active turn, health colors, reach indicators
	- Action HUD text with budget indicators (Std/Move/5ft)
- Grid/LoS/cover/concealment
	- Bresenham-based LoS; independent LoE mask via effects (e.g., fog)
	- Corner-rule cover toggle; cover bonuses applied to attack resolution
	- Concealment computation including fog cloud (20%/50%) with miss handling
- Movement and path planning
	- 3.5e diagonals (5-10-5), difficult terrain, 5-foot step detection
	- A* pathfinding with allow-diagonal + don’t-cross-corners
	- Threat-aware planner with “safe path” and “prefer easy terrain” toggles
	- Path trim-by-speed and post-plan movement analysis (feet, provokes, difficulty)
- Attacks of Opportunity matrix
	- Triggers: movement out of threatened, ranged-in-melee, casting, potions
	- Prevention checks: corner cover and fog; flat-footed disables AoO
	- Per-creature AoO usage tracking per round
- Combat resolution details
	- Ranged-into-melee penalty (-4) with Precise Shot toggle
	- Cover bonus integration; concealment miss; crit multiplier handling
	- Damage application with DR/ER/regeneration and vulnerability bonuses
- Spells and effects
	- Magic Missile (auto-hit with LoS) and Fog Cloud (radius, duration, LoS block)
	- Defensive casting and damage-while-casting concentration checks
	- EffectManager with serialize/deserialize and round-based expiration
- RNG and determinism
	- Seeded mulberry32 RNG with UI reseed; seed captured in SaveData
	- Undo/redo stacks with bounded history
- Save/Load and portability
	- Zod-validated SaveData; localStorage Save/Load with UI
	- File-based Export/Import of save JSON (download/upload) integrated
- Monster systems and AI
	- Monster database integration; selection modal and random selector
	- MonsterTurnManager executes AI turns (move/attack/special/end), with visuals
	- Personality-driven AI facade with enable/disable toggles and test hooks
- DM/AI server and chat
	- Express server with CORS; /api/dm/chat and /api/dm/config endpoints
	- OpenAI handler composes prompts from personalities and game context
	- DM chat panel wiring and config persistence
- Debugging tools and UX
	- Floating debug log panel with toggles (AI calls, detailed logging)
	- Collapsible/pinnable control panel with idle auto-collapse
	- Keyboard shortcuts and global window exports for quick inspection

## 1. Core Game Engine Features

### 1.1. Game State Management
- Centralized state store for all game entities (players, monsters, items, map, etc.)
- Turn order and initiative tracking
- Persistent and restorable game sessions
 - Encounters must support up to 20 monsters concurrently without degrading turn flow or UI usability

### 1.2. Entity & Component System
- Modular entity system for characters, monsters, NPCs, and objects
- Component-based architecture for extensibility (e.g., stats, inventory, abilities, AI)

### 1.3. Rules Engine
- Implementation of SRD rules for combat, movement, skills, spells, feats, magic items, and conditions
- Support for rule overrides and homebrew content
- Automated resolution of actions, effects, and triggers

### 1.4. Data Models
- Unified schema for characters, monsters, spells, feats, magic items, equipment, items, and inventory containers
- Serialization/deserialization for save/load
- Validation and type safety for all data (TypeScript interfaces/types)

### 1.5. Map & Grid System
- 2D/3D grid-based battlefield representation
- Pathfinding and movement logic (including difficult terrain, obstacles, etc.)
- Line of sight, fog of war, and area effects

---


## 1A. Detailed Character Creation (Party of 6)

### 1A.1. Multi-Character Party Support
- Support for creating and managing up to 6 player characters per party
- Individual character slots with unique names, classes, races, and backgrounds
- Party composition validation (e.g., no duplicate names, class/race restrictions if any)

### 1A.2. Character Creation Workflow
- Step-by-step guided character creation for each slot (race, class, ability scores, background, etc.)
- Ability score assignment (point buy, standard array, or rolling)
- Selection of feats, skills, spells, and equipment per character
- Visual preview and summary for each character before finalizing

### 1A.3. Character Sheet & Management
- Editable character sheets for all 6 party members
- Quick switch between character sheets in the UI
- Persistent storage and loading of full party data
- Support for importing/exporting party configurations


### 1A.4. Integration
- Seamless integration with game state, combat, and UI systems
- Party-based initiative and turn management
- Support for AI or DM-controlled party members (optional)

---

## 1B. Game State Save/Load (Download & Upload)

### 1B.1. Downloadable Save Feature
- Ability to export the entire game state (story progress, party, characters, inventory, map, etc.) as a downloadable file (e.g., JSON)
- User-initiated save action from the UI
- Option to name or timestamp save files for easy identification

### 1B.2. Upload/Restore Feature
- Ability to upload a previously downloaded save file to restore game progress
- Full restoration of story, party, character data, and all relevant state
- Validation and error handling for corrupted or incompatible save files

### 1B.3. Integration & Security
- Seamless integration with game state management and UI
- Secure handling of uploaded files (no code execution, data validation)
- Support for versioned save formats to allow future compatibility

---
## Next Steps

## 2. Artificial Intelligence (AI) Features

### 2.1. Monster & NPC AI
- Turn management for monsters and AI-controlled pawns
- Tactical combat decision-making (movement, attack, spell use)
- Monster dialogue and roleplay logic
- Configurable personalities and behavior profiles
- Test harnesses for AI movement and combat

### 2.2. Dungeon Master (DM) AI
- Automated DM agent for running encounters and story events
- AI-driven narrative and quest generation
- Integration with player chat and DM chat panels

---

## 3. User Interface (UI) Features


### 3.1. Gold Box-Style Interface
- Classic D&D Gold Box full-screen overlay
- Party panel, character sheets, and status displays
- Command and message system for player input and feedback
- Viewport scene management (battlefield, menus, etc.)

#### 3.1.a. Unified Character Storage Requirement
- The Gold Box interface must use the same unified character memory/storage as all other engine systems
- No separate or duplicate character storage/engine is permitted
- All character data must be reflected in real time across UI, engine, and save/load systems

#### 3.1.b. Map Navigation & 3D Map Designer
- Support for overland map navigation (party movement across a world or region map)
- 3D dungeon navigation: first-person or isometric movement through dungeon environments
- 3D map designer tool for creating 100x100 dungeon sections, specifying walls and doors for rendering
- Maps must be saved in a format compatible with the unified engine and 3D renderer
- Ability to link collections of overland and dungeon maps to form a complete adventure
- Adventures (collections of maps and links) can be uploaded and downloaded, just like save game files
- Adventure upload/download must preserve all map data, links, and designer metadata

### 3.2. Interactive Panels & Chat
- DM chat panel and message history
- Configurable modals and toolbars
- Visual effects and notifications (toasts, overlays)
- Character creation and management UI

### 3.3. Synchronization & State Reflection
- Real-time sync between UI and game state (Gold Box adapter)
- Pawn and character data synchronization
- Exposed utilities for debugging and manual sync

---

## 4. Multiplayer & Networking Features

### 4.1. Session & State Sync
- Multiplayer session management
- Real-time or turn-based state synchronization
- Support for remote DM and player clients

### 4.2. API & Server
- API endpoints for game state, actions, and chat
- End-to-end (e2e) test coverage for multiplayer scenarios

---

## Next Steps

## 5. Extensibility, Modding, and Content Pipeline Features

### 5.1. Modding Support
- Modular plugin system for custom rules, content, and UI
- Scripting support for custom events, AI, and encounters
- Safe sandboxing for user-generated code

### 5.2. Content Pipeline
- Import/export tools for SRD and homebrew data (spells, monsters, items, etc.)
- Data validation and migration utilities
- Automated content deduplication and normalization

### 5.3. Asset Management
- Asset pipeline for images, tokens, maps, and audio
- Versioning and dependency tracking for assets
- Integration with public and private asset repositories

---

## 6. Testing, Debugging, and Developer Tools

### 6.1. Automated Testing
- Unit, integration, and end-to-end (e2e) test suites
- Test harnesses for AI, combat, and UI flows
- Continuous integration (CI) support

### 6.2. Debugging Tools
- In-game debug panels and logging utilities
- State inspection and hot-reload for game logic
- Error reporting and diagnostics

### 6.3. Developer Documentation
- Comprehensive API and data model documentation
- Modding and extension guides
- Example modules and test scenarios

---

## Roadmap Expansion

---

## 7. Classic TTRPG & Virtual Tabletop (VTT) Essentials

### 7.1. Dice Roller
- Customizable dice roller supporting all standard dice (d4, d6, d8, d10, d12, d20, d100)
- Support for modifiers, advantage/disadvantage, and roll macros
- Visible roll history for all players and GM

### 7.2. Handouts & Shared Notes
- Upload and share handouts (images, PDFs, text) with players
- Shared and private notes for lore, maps, and session info
- Player journals and quest logs

### 7.3. Initiative Tracker
- Visual initiative tracker for combat and encounters
- Support for custom order, delays, and conditions
- Integration with combat and turn management systems

### 7.4. Encounter Builder & Manager
- Tools for GMs to prep, save, and run encounters
- Monster/NPC selection, stat blocks, and quick actions
- Encounter scaling and XP calculation
 - Support up to 20 monsters per encounter, with batch add/remove and group initiative options; UI should remain readable (token labels, turn tracker paging/scroll)

---

## 8. SRD Systems: Magic Items, Feats, Spells, and Inventory (Compliance Requirements)

These requirements elevate SRD content systems to first-class, testable features. All SRD-referenced data must produce the correct in-game effects and be validated by automated tests.

### 8.1. Magic Items (SRD)
- Data schema covers categories (weapons, armor/shields, potions, scrolls, wands, staves, rings, rods, wondrous items, etc.), caster level, activation (use-activated, command word, spell trigger), charges, and slot/body placement rules.
- Effects integrate with typed bonus system (enhancement, deflection, resistance, etc.) and do not illegally stack per SRD.
- Charged/consumable behavior (charges decrement, single-use consumes) and on-hit/on-equip effects.
- Identification and detection hooks (if enabled), crafting hooks (optional), and market price/weight.
- Inventory UI supports equipping to the correct slot, showing active effects and remaining charges.

### 8.2. Feats (SRD)
- Feat schema includes prerequisites (ability scores, BAB, level, other feats, skill ranks), benefit text, and machine-readable effects (typed bonuses, new actions, reroll rules, etc.).
- Prerequisite engine enforces selection rules; retraining/respec policies optional.
- Level-based acquisition schedule (e.g., 1, 3, 6, 9, 12, 15, 18) and class bonus feats where applicable.
- Effects hook into combat/skills/defense pipelines and stacking rules; tests cover common cornerstone feats.

### 8.3. Spells (SRD)
- Spell schema (already present) must be fully adhered to: school/subschool, descriptors, components, casting time, range, target/effect/area, duration, saves, SR, and text notes (non-PI paraphrase).
- Casting flow covers concentration, defensive casting, AoO, SR checks, save DCs, partial/negates outcomes, and area templates respecting LoS/LoE.
- All included SRD spells must apply their in-game effects correctly via the effects system; unit tests validate representative spell families (buffs, blasts, debuffs, summons, utility, concealment).

### 8.4. Inventory & Equipment
- Item inventory supports stacks, weight, coin weight (50 coins/lb), containers, and encumbrance updates.
- Equipment slots (head, neck, shoulders, body, torso, belt, wrists, hands, rings, feet, weapon main/offhand, shield, ammo/quiver) with SRD slot rules.
- Equip/unequip pipeline updates derived stats immediately; consumables decrement or disappear; thrown/ammo tracking optional.
- Loot, buy/sell, and appraisal hooks integrate with economy model.

### 8.5. SRD Data Fidelity (Global Requirement)
- All SRD data (spells, feats, magic items) included in the project must have the correct in-game effect when used, per SRD rules and stacking/interaction constraints.
- Add automated data QA and behavior tests to verify schema validity and runtime effect correctness for a representative coverage set. Fail-fast on invalid/malformed SRD entries.

### 7.5. Fog of War & Dynamic Lighting
- Map masking and reveal tools for GMs
- Dynamic lighting and vision settings for immersive play
- Integration with map/grid and 3D renderer

### 7.6. Audio & Music Integration
- Background music and ambient sound controls
- Sound effect triggers for events and actions
- Playlist and volume management

### 7.7. In-Game Calendar & Time Tracking
- Campaign calendar with custom events, moon phases, etc.
- Time-of-day and session tracking
- Integration with story and event triggers

### 7.8. GM Tools & Privacy Controls
- GM screen for private notes, secret rolls, and quick rules lookup
- Player/GM permissions for handouts, notes, and map visibility
- Private and public chat channels

### 7.9. Marketplace & Module Import
- Import/export of adventure modules, maps, tokens, and assets
- Marketplace integration for community and official content
- Support for module dependencies and versioning

---
This roadmap will be updated as new features and requirements are discovered during ongoing development and codebase analysis.

# oDnD — Unified Features and Leveling System

A consolidated overview of implemented/planned engine features plus a complete, SRD-aligned character leveling system (XP awards, thresholds, and level-based progression). This document complements the more granular tracker in `UNIFIED_ENGINE_FEATURES.md` and focuses on structure, data shapes, and implementation steps.

Note on Open Content: Leveling rules herein derive from the d20 System Reference Document (v3.5) and are used under the Open Game License. See `OPEN_GAME_LICENSE.md` and project Section 15 notices.

## Goals
- Reorganize the feature list into a skimmable, lifecycle-oriented map.
- Specify an end-to-end leveling system: XP awards from encounters, thresholds, class progressions, level-up UI, and validation.
- Provide concrete data models, integration points, and tests to enable incremental implementation.

---

## Feature Map (Reorganized)

- Core Engine & State
  - Deterministic RNG; time/turn systems; Zod-validated `SaveData`; undo/redo; serialization.
  - ECS-like world, components for stats/position/vision/effects, initiative and turn manager.
- Grid, Movement, Threats
  - 2D grid, 3.5e diagonal costs, LoS/LoE, cover, concealment, difficult terrain.
  - A* pathfinding with threat-aware planning and AoO rules.
- Combat & Effects
  - Attack resolution (hit/crit/touch/flat-footed), DR/ER/regeneration, vulnerability.
  - Effects system with durations, stacking rules, environmental effects (e.g., fog).
- Magic (SRD subset, growing)
  - Spell schemas and casting flow (components, defensive casting, concentration, SR, saves).
  - AoE templates snapped to grid; example spells implemented (e.g., Magic Missile, Fog Cloud).
- Monsters & AI
  - Monster data, turn execution (move/attack/special/end) and personalities.
- UI & UX
  - Gold Box-style overlay and adapter (6-party UI), character creation modal, initiative panel.
  - Battlefield customization, token manager, debug log panel, DM chat.
- Persistence
  - Local save/load (validated) and file-based export/import of JSON saves.
- Navigation & Designer (Planned)
  - Overland navigation, 3D dungeon navigation, 100x100 map designer, adventure IO.
- Multiplayer & Modding (Planned)
  - Session sync, plugin system, content pipeline, asset management.
- Tooling & Quality
  - Vitest/Playwright, coverage, CI hooks; profiling guidance; deploy via Vite static hosting.

For a detailed, task-by-task checklist and stretch features, see `UNIFIED_ENGINE_FEATURES.md`.

---

## SRD-Aligned Leveling System

A complete system to award XP from encounters and advance characters through levels, applying class progressions (HD, BAB, saves), skill ranks, feats, ability score increases, and spellcasting updates.

### 1) Experience (XP) Sources and Awards
- Encounter XP
  - Calculate Average Party Level (APL) from active PCs; use SRD XP awards by CR vs character level.
  - For multi-monster encounters, sum per-monster XP. Divide total XP evenly across party members who meaningfully participated (table-configurable policy).
  - Party-size adjustment: optionally scale awards for parties significantly larger/smaller than the standard (SRD guidance; configurable).
  - Fractional XP is tracked precisely; display rounded values in UI.
- Quests/Milestones (optional)
  - Support non-combat XP grants and/or milestone levelling mode in campaign settings.
- Crafting/Item Creation (optional)
  - If crafting systems are enabled, support SRD XP costs as negative XP grants.

Implementation notes
- Store an `ExperienceEvent` log with source, amount, recipients, and encounter metadata.
- Provide an `EncounterXP` service that accepts monsters (with CR), PCs, and campaign settings, returning a per-PC award map.

### 2) XP Progression and Level Thresholds
- Use the SRD 3.5 “standard” XP progression (Level 2 at 1,000 XP; Level 3 at 3,000 XP; … Level 20 at 190,000 XP). Exact per-level thresholds are stored in data and may be overridden by campaign settings.
- Support optional alternative progressions (fast/slow/homebrew) via a JSON/TS table.
- On XP change, recompute character level deterministically; trigger level-up flow when crossing a threshold.

Data
- `xpProgression`: ordered map of level -> cumulative XP.
- `campaign.progressionId`: key selecting a progression table.

### 3) Level-Up Flow (Per Character)
- Trigger: when `xp >= threshold(level+1)`.
- Wizard steps (order may be class-configurable):
  1. Choose class for the new level (with multiclass and prerequisites checks).
  2. Hit Points: roll or fixed (per campaign setting); apply Con modifier; minimum 1 per level; handle favored class or traits if enabled.
  3. Base Attack Bonus and Saves: apply per-class increments; compute extra iterative attacks at BAB +6/+11/+16.
  4. Skill Ranks: allocate ranks up to caps; apply cross-class costs; validate ACP and synergy.
  5. Feats: offer new feat selections at appropriate levels (e.g., 1, 3, 6, 9, 12, 15, 18) and class bonus feats as applicable.
  6. Ability Score Increase: at levels 4, 8, 12, 16, 20 choose one ability to increase by +1 (cumulative).
  7. Spellcasting: update spell slots/spells known/prepared as per class progression (and ability score changes affecting DCs/bonus slots).
  8. Derived Stats: refresh max HP, initiative, skill totals, carrying capacity, save DCs, and any resource caps.
- Confirm: show summary diff; persist changes; add a LevelUp entry to the character history log.

Validation
- Enforce prerequisites (feats, ability scores, BAB, skill ranks, class features).
- Ensure skill rank caps: class max = level + 3; cross-class max = floor((level + 3) / 2).
- Ensure no double-dipping of stacking or same-source rules.

### 4) Class Progressions (Data-Driven)
- Each class defines:
  - Hit Die (e.g., d10), skill points per level (with Int modifier; minimum 1), class skill list.
  - BAB progression: Full (1/level), 3/4, or 1/2.
  - Save progressions: Good or Poor for Fort/Ref/Will (apply +2 base at level 1 for Good; scaling thereafter as SRD).
  - Level features at specific levels (e.g., bonus feats, rage/day, wild shape, sneak attack dice, turning, etc.).
  - Spellcasting: caster level progression, spell slots and spells known tables per level if applicable.
- Multiclassing
  - Levels stack per class for BAB, saves, features, and spellcasting as per class rules.
  - Optional XP penalties for multiclass (3.5e) and favored class rules can be toggled in campaign settings.

### 5) Data Shapes (Type Hints)

These are indicative TypeScript-style shapes for implementation; real code should live under `src/data` and `src/game` and use Zod for validation.

- `ExperienceEvent`
  - id, timestamp, source: 'encounter'|'quest'|'crafting'|'misc'
  - amount: number (total or per-recipient depending on mode)
  - recipients: string[] (character ids)
  - metadata: { encounterId?, monsters?: { id, cr }[], notes? }

- `XPProgression`
  - id: 'standard' | 'fast' | 'slow' | string
  - thresholds: { level: number, cumulativeXP: number }[]

- `ClassProgression`
  - id: string; name: string; hitDie: 'd4'|'d6'|'d8'|'d10'|'d12'
  - bab: 'full'|'threeQuarters'|'half'
  - saves: { fort: 'good'|'poor', ref: 'good'|'poor', will: 'good'|'poor' }
  - skillPointsPerLevel: number; classSkills: string[]
  - featuresByLevel: Record<number, string[]> // identifiers to feature/effect handlers
  - spellcasting?: { slotsByLevel: number[][], knownByLevel?: number[][], castingStat?: 'INT'|'WIS'|'CHA' }

- `CharacterLevelState`
  - xp: number; level: number; classLevels: { classId: string, level: number }[]
  - abilityIncreases: { level: number, ability: 'STR'|'DEX'|'CON'|'INT'|'WIS'|'CHA' }[]
  - feats: string[]; skillRanks: Record<string, number>
  - history: { type: 'levelUp'|'respec'|'xp', at: number, notes?: string }[]

### 6) Integration Points
- Engine
  - Recompute derived stats after level-up; expose hooks for initiative recalculation, attack bonuses, save DCs, and resource caps.
- UI
  - Gold Box overlay: show Level and XP (current/next); add “Level Up” prompt/icon when available.
  - Level-Up Modal: multi-step wizard as above; validation and summaries.
  - Character Sheet: display class breakdown, BAB/saves breakdown, skills with caps, feats, spell slots.
- Persistence
  - Extend `SaveData` to include XP, class levels, ability increases, and experience event log.
  - Include versioning for migrations across progression table changes.
- Content
  - `data/xpProgression.ts` (or `.json`) for thresholds.
  - `data/classes/*.ts` for class progressions and features.
  - `data/feats.ts` and `data/skills.ts` already exist; ensure prerequisite engine alignment.

### 7) Encounter XP Calculator (Details)
- Inputs: party (levels), monsters (CRs), party size, settings.
- Steps:
  1. Compute APL (rounded as configured; default: round down traditional APL rules).
  2. For each monster, look up base XP award using SRD XP table indexed by PC level vs CR.
  3. Sum awards; apply party-size adjustment if enabled; divide among eligible PCs.
  4. Emit `ExperienceEvent` and update XP totals.
- Notes: store the SRD XP award matrix in data; include OGL attribution.

### 8) Testing & Validation
- Unit tests
  - XP threshold boundary: just below/above next level; multi-level gains in one grant.
  - BAB/save progressions across 1/2, 3/4, full; good vs poor saves.
  - Skill rank caps and cross-class costs; synergy at 5 ranks.
  - Feat award levels and prerequisite enforcement.
  - Spell slot growth and bonus slots from casting stat.
- Integration tests
  - Encounter XP distribution for mixed-CR fights and odd party sizes.
  - Level-up wizard end-to-end including confirmation and persistence.
  - Derived stat recalculation visible in UI and affects combat rolls.
- Migration tests
  - Save/load across progression table changes; schema version bump and compatibility.

### 9) Implementation Plan (Incremental)
1. Data
   - Add `data/xpProgression.ts` with the SRD standard track (plus optional variants) and `data/xpAwards.ts` matrix; include OGL attribution comments.
   - Add `data/classes/` with per-class progressions (HD, BAB, saves, features, spellcasting tables as needed).
2. Game Logic
   - Create `src/game/leveling.ts`: helpers to compute level from XP, apply class increments, and produce a `LevelUpPlan` diff.
   - Create `src/game/encounterXp.ts`: award calculator + event emission.
   - Extend character model to include XP, classLevels, abilityIncreases, skillRanks with caps, and feats.
3. UI
   - Add `src/ui/levelUpModal.tsx` (or TS): multi-step wizard; integrate with Gold Box overlay prompts.
   - Update character sheet to show Level/XP and class breakdown; add “Next Level in … XP”.
4. Persistence
   - Update `SaveDataSchema`; include migrations for existing saves (default XP=0, infer level from classLevels if present).
5. Tests
   - Add unit tests for thresholds and progressions; add integration tests covering XP awards and level-up flow.

### 10) Configuration & Options
- Campaign Settings
  - Progression track id; milestone leveling toggle; fixed vs rolled HP; party-size XP scaling.
  - Multiclass XP penalty and favored class rules (on/off).
- Accessibility
  - Auto-calc/auto-assign defaults for quick level-up; manual advanced mode for full control.

### 11) OGL & Attribution
- The XP thresholds, award matrix, class progressions, and spellcasting tables are derived from the d20 SRD (v3.5) and are Open Game Content.
- Maintain attribution headers in each data file and ensure `OPEN_GAME_LICENSE.md` includes appropriate Section 15 entries.

---

## Quick Status and Pointers
- Implemented Today (high level): Gold Box overlay/adapter, character creation modal, initiative HUD, grid/LoS/cover/concealment, movement/path/AoO, combat/DR/ER/regeneration, example spells & effects, RNG/undo, Save/Load and Export/Import, monster AI turn manager, DM chat, debug panel.
- Where to start for leveling
  - Data: `src/data` and `src/game` for new modules
  - UI: `src/ui` and overlay integration
  - Schema: `src/data/schemas.ts` and `SaveDataSchema`

For the exhaustive checklist and future roadmap (navigation, designer, multiplayer, modding), continue to track `UNIFIED_ENGINE_FEATURES.md`.
