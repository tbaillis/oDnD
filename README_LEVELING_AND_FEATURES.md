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
