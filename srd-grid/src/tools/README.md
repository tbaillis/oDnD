Story linking tools

This small utility provides a central StoryManager and two helper linkers:

- StoryManager: manage chapters and emit events
- BattleLinker: link battle lifecycle to the story
- DungeonLinker: link dungeon exploration to the story

Usage: import from `srd-grid/src/tools` and register a listener on the manager to react to story events.
