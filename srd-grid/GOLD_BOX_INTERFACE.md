# Gold Box Interface

A faithful recreation of the classic D&D Gold Box game interface, overlaid on the existing SRD Grid application.

## Features

### Layout
- **Viewport Window**: Displays scene images, dungeon views, or event graphics
- **Party Panel**: Shows character names, AC, HP, and condition status badges
- **Message Log**: Scrollable text log for narration, combat, and system messages  
- **Command Bar**: Context-sensitive action buttons with keyboard hotkeys

### Visual Style
- Classic monospace font (Courier New)
- CGA/EGA color palette with cyan text on black background
- Gold Box-style bordered panels
- Condition badges with tooltips showing SRD 3.5e descriptions

### Controls
- **Ctrl+G**: Toggle Gold Box Interface on/off
- **Hotkeys**: C (Combat), W (Wait), F (Flee), A (Advance), T (Talk), U (Use), S (Search), P (Camp)
- **Mouse**: Click command buttons
- **Escape**: Close interface

## Implementation

### Core Components

1. **GoldBoxInterface** (`src/ui/goldBoxInterface.ts`)
   - Main UI component with viewport, party panel, message log, command bar
   - Handles rendering, input, and state management
   - Provides API for updating party status, adding messages, changing scenes

2. **GoldBoxAdapter** (`src/ui/goldBoxAdapter.ts`) 
   - Adapter layer integrating Gold Box UI with existing game systems
   - Demo party with sample D&D 3.5e characters (matching the reference image)
   - Command handling and game state management
   - Conversion utilities for existing character data

3. **Condition System**
   - Complete mapping of D&D 3.5e SRD conditions to display codes
   - Priority-based badge display (most critical conditions first)
   - Tooltip descriptions from official SRD text
   - Color-coded status indicators

### Integration Points

The Gold Box Interface integrates with the existing game engine through:
- Character data conversion from the existing Character type
- ECS world state synchronization (hookpoints ready)
- UI Manager integration for keyboard shortcuts
- Existing asset loading (background images, etc.)

### Sample Party

The demo includes a 6-character party based on the reference Gold Box screenshot:
- **BARONESS BELLA** - Human Fighter 6 (Tank/Leader)
- **BANT BLACKSMITH** - Dwarf Cleric 5 (Healer/Support) 
- **BROTHER GALTOR** - Human Monk 4 (Scout/DPS)
- **BUFFY BURROWS** - Halfling Rogue 5 (Skills/Stealth)
- **DRAGJA BLEEKBOW** - Elf Ranger 4 (Ranged DPS)
- **BRIM BRIGHTSTAR** - Human Wizard 5 (Magic/Utility)

## Usage

1. Launch the application (`npm run dev`)
2. Press **Ctrl+G** to open the Gold Box Interface
3. Use hotkeys or click buttons to issue commands
4. Party status automatically updates based on character conditions
5. Messages appear in the log for all actions and events

## Commands

- **(C)OMBAT**: Initiate combat encounter
- **(W)AIT**: Wait and observe surroundings  
- **(F)LEE**: Escape from combat or backtrack
- **(A)DVANCE**: Move forward (chance for random encounters)
- **(T)ALK**: Attempt conversation (context-dependent)
- **(U)SE**: Use items or abilities (context-dependent)
- **(S)EARCH**: Search current area for secrets/items
- **(P)CAMP**: Rest and recover (prompts for confirmation)

## Condition Codes

Common status conditions displayed as badges:

| Code | Condition | Description |
|------|-----------|-------------|
| DEAD | Dead | Character is dead |
| DYG | Dying | Losing HP each round |
| UNC | Unconscious | Helpless and unaware |
| STBL | Stable | Unconscious but not dying |
| DIS | Disabled | At exactly 0 HP |
| STAG | Staggered | One action per turn only |
| PRN | Prone | Lying on ground |
| STUN | Stunned | Cannot act |
| DAZ | Dazed | Limited actions |
| FTF | Flat-Footed | No Dex to AC |

## Architecture

The interface follows the original Gold Box design principles:
- 320x200 logical resolution (scaled up)
- Modal interface approach (full screen overlay)
- Keyboard-first interaction model
- Immediate visual feedback
- Context-sensitive command availability

## Future Enhancements

- Tile-based dungeon viewport rendering
- Animation for movement and combat
- Sound effects and music integration  
- Save/load game state
- Character inventory management
- Spell book interface
- Shop and conversation systems

## Files Modified

- `src/main.ts` - Added Gold Box integration
- `src/ui/goldBoxInterface.ts` - Core interface component (new)
- `src/ui/goldBoxAdapter.ts` - Game integration adapter (new)
- Updated imports and initialization in main application

The implementation is fully modular and can be toggled on/off without affecting the existing game functionality.
