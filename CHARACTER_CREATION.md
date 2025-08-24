# Character Creation Interface

The SRD Grid system now includes a comprehensive character creation interface that allows users to create custom D&D 3.5 characters with proper stat allocation, equipment selection, and validation.

## Features

### 🎭 6-Step Character Creation Process

1. **Race Selection** - Choose from available D&D 3.5 races with proper ability adjustments
2. **Class Selection** - Select character class with appropriate skill points and hit dice
3. **Ability Scores** - Point-buy system (27 points) with visual feedback
4. **Skills** - (Currently auto-assigned, full implementation planned)
5. **Equipment** - Select starting weapons and armor
6. **Review** - Validate character and finalize creation

### 🎮 How to Access

#### Via Keyboard Shortcut
- Press **N** to open the character creation interface
- Press **Escape** to close any open interface

#### Via Toolbar
- Click the **"New Character"** button in the top-right toolbar
- Use the **Character (C)** button to view created characters
- Use the **Spells (S)** button to view spell books

### 🏗️ Character Creation Steps

#### Step 1: Race Selection
- Enter character name in the text field
- Click on a race card to select it
- Race bonuses are shown with green/red color coding
- Each race displays:
  - Size and movement speed
  - Ability score adjustments
  - Special abilities
  - Bonus skill points and feats

#### Step 2: Class Selection
- Click on a class card to select it
- Each class shows:
  - Hit die (d4, d6, d8, d10, d12)
  - Skill points per level
  - Class description

#### Step 3: Ability Score Allocation
- Uses standard D&D 3.5 point-buy system
- 27 points to distribute (base scores start at 8)
- Point costs:
  - 8 = 0 points
  - 9 = 1 point
  - 10 = 2 points
  - 11 = 3 points
  - 12 = 4 points
  - 13 = 5 points
  - 14 = 6 points
  - 15 = 8 points
- Click **+** / **−** buttons to adjust scores
- Real-time display of ability modifiers
- Remaining points displayed at the top

#### Step 4: Skills
- Currently uses automatic skill assignment
- Future implementation will include:
  - Class skill lists
  - Rank allocation
  - Cross-class skills

#### Step 5: Equipment Selection
- **Weapons**: Multi-select starting weapons
- **Armor**: Single-select starting armor
- Equipment shows:
  - Damage and damage type
  - Critical threat range and multiplier
  - AC bonuses and penalties
  - Armor check penalties and spell failure

#### Step 6: Review & Validation
- Complete character summary
- Validation checks for:
  - Minimum ability score requirements
  - Point allocation accuracy
  - Equipment proficiency
- **Green checkmark** = Character ready
- **Red warning** = Issues to resolve

### 🎯 Integration Features

#### Auto-Integration
When a character is created, it automatically:
- Loads into the character sheet (press **C** to view)
- Appears in the combat log with a success message
- Integrates with the ECS system for combat simulation
- Validates against D&D 3.5 SRD rules

#### Character Sheet Display
Created characters show in the main character sheet with:
- Complete ability scores and modifiers
- Calculated saving throws and AC
- Hit points and BAB
- Equipment and weapons
- Spell lists (for spellcasters)

### 🔧 Technical Details

#### Point-Buy Validation
- Enforces standard 15-point maximum per ability
- Prevents negative point allocation
- Real-time cost calculation
- Racial bonuses applied after point allocation

#### Equipment Proficiency
- Validates weapon and armor proficiency by class
- Shows proficiency warnings in review step
- Applies proper armor class calculations

#### Character Validation
The system validates:
- All required fields completed
- Point allocation within limits
- Equipment proficiency requirements
- Minimum ability scores for classes

### 🎨 User Interface

#### Visual Design
- Dark theme matching the main application
- Step-by-step progress indicator
- Color-coded feedback (green=good, red=warning, blue=info)
- Responsive layout for different screen sizes

#### Accessibility
- Clear visual hierarchy
- Keyboard navigation support
- Color coding with text labels
- Consistent button styling

### 🚀 Usage Example

1. Start the application (`npm run dev`)
2. Press **N** or click **"New Character"**
3. Enter character name: "Gandalf the Grey"
4. Select **Human** race
5. Select **Wizard** class
6. Allocate ability scores (high INT for wizard)
7. Skip skills (auto-assigned)
8. Select **Quarterstaff** and **Robes**
9. Review and click **"Create Character"**
10. Character appears in sheet (press **C**)

### 🔮 Future Enhancements

#### Planned Features
- Complete skill system with rank allocation
- Feat selection interface
- Starting gold and equipment purchase
- Multi-class character support
- Character templates and presets
- Import/export character data
- Random character generation
- Advanced race/class options

#### Integration Roadmap
- Combat system integration for created characters
- Spell preparation interface for casters
- Equipment upgrade and shopping system
- Character advancement and leveling
- Party management for multiple characters

### 📝 Notes

- Character creation follows D&D 3.5 SRD rules strictly
- Point-buy system uses standard 27-point allocation
- All created characters are fully functional in combat
- Equipment selection affects calculated statistics
- Validation prevents invalid character builds

The character creation interface provides a complete, user-friendly way to create custom D&D 3.5 characters that integrate seamlessly with the grid combat system.
