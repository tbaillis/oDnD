# Testing Gold Box Character Integration

## How to Test the Integration

1. **Start the Application**
   - Run `npm run dev`
   - Open http://localhost:5173/

2. **Test Default Character Assignment**
   - Press **Ctrl+G** to open the Gold Box Interface
   - The first character (BARONESS BELLA) should be connected to Pawn A
   - Verify that the character stats match between the interface and the game

3. **Test Character Creation**
   - Press **N** in the main game to create a new character
   - Complete the character creation process
   - The new character should automatically replace the first character in Gold Box
   - The character should be applied to Pawn A on the battlefield

4. **Test HP Synchronization**
   - In the main game, damage Pawn A (right-click and choose attack)
   - Press **Ctrl+G** to check the Gold Box Interface
   - The HP should be synchronized between the battlefield and the party panel
   - Condition badges should appear when HP gets low

5. **Test Combat State**
   - Use the **(C)OMBAT** command in Gold Box Interface
   - The first character should be highlighted as having the active turn
   - Command buttons should change to combat context

## Console Commands for Testing

Open the browser developer console and try these commands:

```javascript
// Show the Gold Box Interface
goldBox.show()

// Get current Pawn A character
goldBoxAdapter.getPawnACharacter()

// Force sync Pawn A changes
goldBoxAdapter.syncPawnAChanges()

// Check current party status
goldBoxAdapter.characters

// Test character creation event
const testChar = {
  name: "Test Hero",
  race: "Human",
  classes: [{ class: "fighter", level: 1, hitPointsRolled: 15, skillPointsSpent: {}, featsGained: [] }],
  abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 12, WIS: 13, CHA: 11 },
  hitPoints: { current: 15, max: 15, temporary: 0 },
  armorClass: { base: 10, total: 16, touch: 12, flatFooted: 14 },
  savingThrows: { fortitude: 4, reflex: 2, will: 1 },
  skills: {},
  feats: [],
  equipment: { weapons: [], items: [] }
}

document.dispatchEvent(new CustomEvent('goldbox-character-created', { detail: testChar }))
```

## Expected Behavior

### Character Assignment
- ✅ First character in Gold Box list is Pawn A
- ✅ Character stats are applied to battlefield pawn
- ✅ HP changes sync bidirectionally
- ✅ Conditions reflect actual battle status

### Character Creation
- ✅ New characters automatically become Pawn A
- ✅ Old first character stays in the party list
- ✅ Character creator integration works seamlessly

### Combat Integration  
- ✅ Gold Box commands affect actual game state
- ✅ Combat state changes party display
- ✅ Turn indicators work correctly

## Integration Points Verified

1. **`applyCharacterToPawnA`** - Enhanced to notify Gold Box
2. **Character Creation Modal** - Events trigger Gold Box updates  
3. **HP Synchronization** - Bidirectional sync between systems
4. **Battle Conditions** - Real game state reflected in UI
5. **Turn Management** - Active character highlighting

The Gold Box Interface now serves as both a nostalgic UI overlay AND a functional character management system that's fully integrated with the existing D&D 3.5e engine.
