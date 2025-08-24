# D&D Dungeon Master MCP Server

This is a Model Context Protocol (MCP) server designed specifically for assisting Dungeon Masters in running D&D 3.5e sessions. It provides a comprehensive set of tools for managing combat, story progression, environment, and game mechanics.

## Features

### Combat Management
- **Start Encounter**: Initialize combat encounters with monsters and environment
- **Roll Initiative**: Automatically roll and sort initiative for all participants
- **Apply Damage/Healing**: Track hit points and damage for characters and monsters
- **Condition Management**: Apply and remove status conditions (poisoned, stunned, etc.)

### Environment & Scene Control
- **Environment Settings**: Control lighting, weather, terrain, and visibility
- **Scene Description**: Provide rich, multi-sensory descriptions to players
- **Story Context**: Track ongoing narrative, goals, and secrets

### Game Mechanics
- **Ability Checks**: Make ability checks with proper modifiers and difficulty classes
- **Saving Throws**: Roll saving throws for characters
- **Dice Rolling**: Flexible dice notation support (2d6+3, etc.)
- **Character Movement**: Validate and track character positions

### NPC & Relationship Management
- **NPC Relationships**: Track and modify relationship scores between NPCs and players
- **Story Progression**: Maintain context of previous events and future goals

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage

The MCP server can be integrated with AI assistants that support the Model Context Protocol. It exposes tools, prompts, and resources for comprehensive D&D session management.

### Available Tools

#### Combat Tools
- `start_encounter` - Initialize a new combat encounter
- `roll_initiative` - Roll initiative for all participants
- `apply_damage` - Apply damage to a target
- `apply_healing` - Heal a target
- `apply_condition` - Add a status condition
- `remove_condition` - Remove a status condition
- `end_turn` - Advance to the next character in initiative

#### Environment Tools
- `set_environment` - Configure lighting, weather, terrain
- `describe_scene` - Provide scene descriptions to players
- `move_character` - Change character positions

#### Story Tools
- `update_story_context` - Update narrative context and goals
- `manage_npc_relationship` - Modify NPC relationship scores

#### Mechanics Tools
- `make_ability_check` - Roll ability checks
- `make_saving_throw` - Roll saving throws
- `roll_dice` - Generic dice rolling
- `get_game_state` - Retrieve current game state

### Available Prompts

#### DM Assistant
Provides contextual guidance and suggestions based on current game state and player actions.

```json
{
  "name": "dm_assistant",
  "arguments": {
    "scenario": "Current scenario or situation",
    "player_action": "Player action to respond to"
  }
}
```

#### Combat Narrator
Generates vivid, engaging narration for combat actions and outcomes.

```json
{
  "name": "combat_narrator",
  "arguments": {
    "action_type": "attack",
    "result": "critical hit for 15 damage"
  }
}
```

### Available Resources

#### Game State
Access to the complete current game state including encounter, players, initiative, environment, and story context.

- `game://state` - Complete game state
- `game://players` - Player character information
- `game://encounter` - Current encounter details

## Integration with the D&D Game Client

The MCP server is designed to work alongside the web-based D&D game client. The client features a DM chat panel that can be connected to an AI assistant using this MCP server for seamless Dungeon Master assistance.

### DM Chat Panel Features

- **Slide-out Interface**: Appears from the right side of the screen
- **Real-time Communication**: Chat interface for interacting with the DM assistant
- **Keyboard Shortcuts**: 
  - `Ctrl+D` to toggle the DM chat panel
  - `Escape` to close all panels
- **System Integration**: Automatically notifies the DM about game events (character creation, combat actions, etc.)

### Usage Tips

1. **Start a Session**: Use `start_encounter` to begin combat encounters
2. **Track Everything**: The server maintains complete game state including HP, conditions, and story context
3. **Rich Narration**: Use the combat narrator prompt for engaging descriptions
4. **Story Continuity**: Update story context regularly to maintain narrative flow
5. **Flexible Dice**: Use standard dice notation for any rolls (1d20+5, 3d6+2, etc.)

## Development

The server is built with TypeScript and uses the official MCP SDK. The game state is maintained in memory and provides real-time updates to connected clients.

### Architecture

- **Server Core**: Handles MCP protocol communication
- **Game State**: Maintains complete D&D session state
- **Tool Handlers**: Implement specific D&D mechanics
- **Prompt System**: Provides contextual AI assistance

### Future Enhancements

- [ ] Persistent game state storage
- [ ] Campaign management across multiple sessions
- [ ] Integration with D&D Beyond API
- [ ] Custom monster and spell databases
- [ ] Automated encounter balancing
- [ ] Battle map integration
- [ ] Voice command support

## Contributing

This is part of a larger D&D 3.5e digital tabletop project. Contributions are welcome for additional tools, improved AI prompts, and enhanced game mechanics support.
