/**
 * Unified Character Interface
 * Combines character creation and editing into a single interface with tab-based navigation
 * Supports both creation mode (new characters) and edit mode (existing characters)
 */

import { FantasyNameGenerator } from './nameGenerator.js'
import { type CharacterCreationData, convertCreationDataToCharacter, convertCharacterToCreationData } from '../game/characterManager'
import type { Character } from '../game/character'

interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
}

type Tab = 'basics' | 'race' | 'class' | 'abilities' | 'skills' | 'feats' | 'equipment' | 'review' | 'stats' | 'inventory' | 'combat'

interface TabConfig {
  id: Tab
  title: string
  description: string
  isRequired: boolean
  category: 'creation' | 'sheet' | 'both'
}

export class UnifiedCharacterInterface {
  private modal: HTMLElement | null = null
  private currentTab: Tab = 'basics'
  private characterData: Partial<CharacterCreationData> = {}
  private character: Character | null = null
  private characterId: string | null = null
  private isCreationMode: boolean = true
  private onComplete?: (character: Character) => void
  private onCancel?: () => void

  private readonly tabs: TabConfig[] = [
    // Creation/Basic tabs (always available)
    { id: 'basics', title: 'Basics', description: 'Name and basic information', isRequired: true, category: 'both' },
    { id: 'race', title: 'Race', description: 'Character race and traits', isRequired: true, category: 'both' },
    { id: 'class', title: 'Class', description: 'Character class and abilities', isRequired: true, category: 'both' },
    { id: 'abilities', title: 'Abilities', description: 'Ability scores and modifiers', isRequired: true, category: 'both' },
    { id: 'skills', title: 'Skills', description: 'Skills and proficiencies', isRequired: false, category: 'both' },
    { id: 'feats', title: 'Feats', description: 'Feats and special abilities', isRequired: false, category: 'both' },
    { id: 'equipment', title: 'Equipment', description: 'Weapons, armor, and gear', isRequired: false, category: 'both' },
    
    // Sheet-specific tabs (only in edit mode)
    { id: 'stats', title: 'Combat Stats', description: 'HP, AC, saves, and combat stats', isRequired: false, category: 'sheet' },
    { id: 'inventory', title: 'Inventory', description: 'Detailed inventory management', isRequired: false, category: 'sheet' },
    { id: 'combat', title: 'Combat', description: 'Combat options and conditions', isRequired: false, category: 'sheet' },
    
    // Review tab (always last)
    { id: 'review', title: 'Review', description: 'Review and finalize character', isRequired: true, category: 'both' }
  ]

  private readonly raceData = [
    {
      id: 'human',
      name: 'Human',
      description: 'Versatile and ambitious, humans are the most common race in most worlds.',
      traits: ['+1 to any ability score', 'Extra feat at 1st level', 'Extra skill points'],
      size: 'Medium',
      speed: 30,
      abilityAdjustments: { any: 1 },
      bonusFeats: 1,
      bonusSkillPoints: 1
    },
    {
      id: 'elf',
      name: 'Elf',
      description: 'Graceful and long-lived, elves are known for their connection to magic and nature.',
      traits: ['+2 Dexterity, -2 Constitution', 'Darkvision 60 ft', 'Keen Senses', 'Elven Magic'],
      size: 'Medium',
      speed: 30,
      abilityAdjustments: { dexterity: 2, constitution: -2 },
      bonusFeats: 0,
      bonusSkillPoints: 0
    },
    {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Hardy and resilient, dwarves are known for their craftsmanship and combat prowess.',
      traits: ['+2 Constitution, -2 Charisma', 'Darkvision 60 ft', 'Stonecunning', 'Weapon Familiarity'],
      size: 'Medium',
      speed: 20,
      abilityAdjustments: { constitution: 2, charisma: -2 },
      bonusFeats: 0,
      bonusSkillPoints: 0
    },
    {
      id: 'halfling',
      name: 'Halfling',
      description: 'Small and nimble, halflings are known for their luck and stealth.',
      traits: ['+2 Dexterity, -2 Strength', 'Small size', 'Lucky', 'Halfling Stealth'],
      size: 'Small',
      speed: 20,
      abilityAdjustments: { dexterity: 2, strength: -2 },
      bonusFeats: 0,
      bonusSkillPoints: 0
    }
  ]

  private readonly classData = [
    {
      id: 'fighter',
      name: 'Fighter',
      description: 'Masters of weapons and armor, fighters excel in combat.',
      hitDie: 'd10',
      skillPoints: 2,
      baseAttackBonus: 'High',
      saves: { fortitude: 'High', reflex: 'Low', will: 'Low' }
    },
    {
      id: 'wizard',
      name: 'Wizard',
      description: 'Arcane spellcasters who study magic through books and practice.',
      hitDie: 'd4',
      skillPoints: 2,
      baseAttackBonus: 'Low',
      saves: { fortitude: 'Low', reflex: 'Low', will: 'High' }
    },
    {
      id: 'rogue',
      name: 'Rogue',
      description: 'Skilled at stealth, traps, and precision attacks.',
      hitDie: 'd6',
      skillPoints: 8,
      baseAttackBonus: 'Medium',
      saves: { fortitude: 'Low', reflex: 'High', will: 'Low' }
    },
    {
      id: 'cleric',
      name: 'Cleric',
      description: 'Divine spellcasters who serve deities and can heal or harm.',
      hitDie: 'd8',
      skillPoints: 2,
      baseAttackBonus: 'Medium',
      saves: { fortitude: 'High', reflex: 'Low', will: 'High' }
    }
  ]

  private readonly featData = [
    {
      id: 'combat-reflexes',
      name: 'Combat Reflexes',
      description: 'You can make additional attacks of opportunity equal to your Dex modifier.',
      prerequisites: [],
      type: 'General'
    },
    {
      id: 'dodge',
      name: 'Dodge',
      description: '+1 dodge bonus to AC against attacks from one opponent you designate.',
      prerequisites: ['Dex 13'],
      type: 'General'
    },
    {
      id: 'power-attack',
      name: 'Power Attack',
      description: 'Trade attack bonus for damage on melee attacks.',
      prerequisites: ['Str 13'],
      type: 'General'
    },
    {
      id: 'cleave',
      name: 'Cleave',
      description: 'Make an additional attack against adjacent foe when you drop an enemy.',
      prerequisites: ['Power Attack'],
      type: 'General'
    }
  ]

  constructor(options: { 
    onComplete?: (character: Character) => void
    onCancel?: () => void 
  } = {}) {
    this.onComplete = options.onComplete
    this.onCancel = options.onCancel
    this.initializeCharacterData()
  }

  /**
   * Show interface in creation mode for new character
   */
  public showForCreation(): void {
    this.isCreationMode = true
    this.character = null
    this.characterId = null
    this.currentTab = 'basics'
    this.initializeCharacterData()
    this.show()
  }

  /**
   * Show interface in edit mode for existing character
   */
  public showForEdit(character: Character, characterId?: string): void {
    this.isCreationMode = false
    this.character = character
    this.characterId = characterId || null
    this.currentTab = 'basics'
    
    // Convert existing character to creation data format for editing
    this.characterData = convertCharacterToCreationData(character)
    this.show()
  }

  private initializeCharacterData(): void {
    this.characterData = {
      name: '',
      race: '',
      characterClass: '',
      abilityGenerationMethod: 'pointBuy',
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      hitPoints: 0,
      skills: [],
      feats: [],
      equipment: []
    }
  }

  private show(): void {
    if (this.modal) {
      this.hide()
    }

    this.createModal()
    this.setupEventListeners()
    this.focusModal()
  }

  private createModal(): void {
    this.modal = document.createElement('div')
    this.modal.className = 'unified-character-interface'
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 21000;
      font-family: 'Times New Roman', serif;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: #1b1b1b;
      border: 6px solid #c59b45;
      border-radius: 12px;
      padding: 0;
      width: 95%;
      max-width: 1200px;
      height: 90%;
      max-height: 800px;
      overflow: hidden;
      color: #ffd966;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
    `

    content.innerHTML = this.getModalHTML()
    this.modal.appendChild(content)
    document.body.appendChild(this.modal)
  }

  private getModalHTML(): string {
    const availableTabs = this.getAvailableTabs()
    const modeTitle = this.isCreationMode ? 'Create Character' : `Edit: ${this.character?.name || 'Character'}`
    
    return `
      <!-- Modal Header -->
      <div class="character-interface-header" style="
        background: #1b1b1b;
        border-bottom: 2px solid #c59b45;
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <h1 style="
            color: #ffd966; 
            margin: 0 0 4px 0; 
            font-size: 28px; 
            font-weight: 800;
            letter-spacing: 2px;
          ">
            ${modeTitle}
          </h1>
          <div style="
            color: #cfc09a;
            font-size: 14px;
          ">
            ${this.isCreationMode ? 'Create your adventurer' : 'Manage your character'}
          </div>
        </div>
        <button id="close-character-interface" style="
          background: transparent;
          border: 2px solid #c59b45;
          color: #ffd966;
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        "
        onmouseover="
          this.style.background = '#c59b45';
          this.style.color = '#1b1b1b';
        "
        onmouseout="
          this.style.background = 'transparent';
          this.style.color = '#ffd966';
        "
        >&times;</button>
      </div>

      <!-- Tab Navigation -->
      <div class="character-interface-tabs" style="
        background: linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%);
        border-bottom: 3px solid #c59b45;
        padding: 8px 32px 0 32px;
        display: flex;
        overflow-x: auto;
        gap: 2px;
        min-height: 80px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #c59b45 20%, #ffd966 50%, #c59b45 80%, transparent 100%);
        "></div>
        ${availableTabs.map((tab, index) => {
          const isActive = tab.id === this.currentTab
          return `
            <button 
              class="tab-button ${isActive ? 'active' : ''}" 
              data-tab="${tab.id}"
              onclick="window.switchCharacterTab && window.switchCharacterTab('${tab.id}')"
              style="
                background: ${isActive ? '#c59b45' : '#2a2a2a'};
                color: ${isActive ? '#1b1b1b' : '#ffd966'};
                border: none;
                border-top: 3px solid ${isActive ? '#ffd966' : 'transparent'};
                border-left: ${index === 0 ? 'none' : '1px solid #444'};
                padding: 16px 16px 12px 16px;
                cursor: pointer;
                font-size: 12px;
                font-weight: ${isActive ? '600' : '400'};
                white-space: nowrap;
                position: relative;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Times New Roman', serif;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                min-width: 84px;
                min-height: 60px;
                text-align: center;
                box-shadow: ${isActive ? '0 -2px 8px rgba(197, 155, 69, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.2)'};
                display: flex;
                align-items: center;
                justify-content: center;
              "
              onmouseover="
                if (this.dataset.tab !== '${this.currentTab}') {
                  this.style.background = '#3a3a3a';
                  this.style.color = '#ffd966';
                  this.style.borderTop = '3px solid #c59b45';
                  this.style.transform = 'translateY(-2px)';
                  this.style.boxShadow = '0 2px 12px rgba(197, 155, 69, 0.2)';
                }
              "
              onmouseout="
                if (this.dataset.tab !== '${this.currentTab}') {
                  this.style.background = '#2a2a2a';
                  this.style.color = '#ffd966';
                  this.style.borderTop = '3px solid transparent';
                  this.style.transform = 'translateY(0)';
                  this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
                }
              "
            >
              <span style="
                font-size: 12px;
                font-weight: ${isActive ? '600' : '400'};
                pointer-events: none;
              ">
                ${tab.title}
                ${tab.isRequired ? '<span style="color: #b8891e; margin-left: 4px;">●</span>' : ''}
              </span>
            </button>
          `
        }).join('')}
      </div>

      <!-- Content Area -->
      <div class="character-interface-content" style="
        flex: 1;
        padding: 32px;
        overflow-y: auto;
        background: linear-gradient(135deg, #1b1b1b 0%, #2a2a2a 100%);
        min-height: 500px;
        border: 2px solid #c59b45;
        border-radius: 12px;
        margin: 24px 32px 16px 32px;
        box-shadow: 
          inset 0 1px 0 rgba(255, 217, 102, 0.1),
          0 4px 20px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(197, 155, 69, 0.2);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c59b45 20%, #ffd966 50%, #c59b45 80%, transparent 100%);
          border-radius: 12px 12px 0 0;
        "></div>
        <div id="tab-content" style="
          position: relative;
          z-index: 1;
        ">
          ${this.getTabContent(this.currentTab)}
        </div>
      </div>

      <!-- Footer -->
      <div class="character-interface-footer" style="
        background: #1b1b1b;
        border-top: 1px solid #555;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div class="navigation-buttons">
          <button id="prev-tab" style="
            background: #2a2a2a;
            color: #ffd966;
            border: 2px solid #444;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 12px;
            transition: all 0.2s ease;
          "
          onmouseover="
            this.style.borderColor = '#c59b45';
            this.style.color = '#c59b45';
          "
          onmouseout="
            this.style.borderColor = '#444';
            this.style.color = '#ffd966';
          "
          >
            ← Previous
          </button>
          <button id="next-tab" style="
            background: #2a2a2a;
            color: #ffd966;
            border: 2px solid #444;
            padding: 10px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
          "
          onmouseover="
            this.style.borderColor = '#c59b45';
            this.style.color = '#c59b45';
          "
          onmouseout="
            this.style.borderColor = '#444';
            this.style.color = '#ffd966';
          "
          >
            Next →
          </button>
        </div>
        
        <div class="step-indicator" style="
          color: #cfc09a;
          font-size: 12px;
        ">
          Step ${availableTabs.findIndex(tab => tab.id === this.currentTab) + 1} of ${availableTabs.length}
        </div>
        
        <div class="action-buttons">
          <button id="save-character" style="
            background: linear-gradient(135deg, #c59b45, #b8891e);
            color: #1b1b1b;
            border: 1px solid #c59b45;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(197, 155, 69, 0.3);
          "
          onmouseover="this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 8px rgba(197, 155, 69, 0.5)'; this.style.background = 'linear-gradient(135deg, #d4a952, #c59b45)'"
          onmouseout="this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 2px 4px rgba(197, 155, 69, 0.3)'; this.style.background = 'linear-gradient(135deg, #c59b45, #b8891e)'"
          >
            ${this.isCreationMode ? '✓ Create Character' : '✓ Save Changes'}
          </button>
        </div>
      </div>
    `
  }

  private getAvailableTabs(): TabConfig[] {
    return this.tabs.filter(tab => 
      tab.category === 'both' || 
      (this.isCreationMode && tab.category === 'creation') ||
      (!this.isCreationMode && tab.category === 'sheet')
    )
  }

  private getTabContent(tabId: Tab): string {
    switch (tabId) {
      case 'basics':
        return this.getBasicsTabContent()
      case 'race':
        return this.getRaceTabContent()
      case 'class':
        return this.getClassTabContent()
      case 'abilities':
        return this.getAbilitiesTabContent()
      case 'skills':
        return this.getSkillsTabContent()
      case 'feats':
        return this.getFeatsTabContent()
      case 'equipment':
        return this.getEquipmentTabContent()
      case 'stats':
        return this.getStatsTabContent()
      case 'inventory':
        return this.getInventoryTabContent()
      case 'combat':
        return this.getCombatTabContent()
      case 'review':
        return this.getReviewTabContent()
      default:
        return '<p>Tab content not implemented yet.</p>'
    }
  }

  private getBasicsTabContent(): string {
    return `
      <div class="basics-tab">
        <h2 style="color: #ffd966; margin-bottom: 20px; font-family: 'Times New Roman', serif;">Character Basics</h2>
        
        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; color: #ffd966; margin-bottom: 8px; font-weight: bold; font-family: 'Times New Roman', serif;">
            Character Name *
          </label>
          <input 
            type="text" 
            id="character-name" 
            value="${this.characterData.name || ''}"
            placeholder="Enter character name"
            style="
              width: 100%;
              padding: 10px;
              background: #2a2a2a;
              border: 2px solid #c59b45;
              border-radius: 4px;
              color: #ffd966;
              font-family: 'Times New Roman', serif;
              font-size: 14px;
            "
          />
          <button id="generate-name" style="
            margin-top: 8px;
            background: linear-gradient(135deg, #c59b45, #b8891e);
            color: #1b1b1b;
            border: 1px solid #c59b45;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Times New Roman', serif;
            font-size: 11px;
            font-weight: 600;
          ">
            Generate Random Name
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label style="display: block; color: #ffd966; margin-bottom: 8px; font-weight: bold; font-family: 'Times New Roman', serif;">
            Current Level
          </label>
          <input 
            type="number" 
            id="character-level" 
            value="${this.character?.classes[0]?.level || 1}"
            min="1" 
            max="20"
            ${this.isCreationMode ? 'disabled' : ''}
            style="
              width: 100px;
              padding: 10px;
              background: ${this.isCreationMode ? '#333' : '#2a2a2a'};
              border: 2px solid #c59b45;
              border-radius: 4px;
              color: #ffd966;
              font-family: 'Times New Roman', serif;
              font-size: 14px;
            "
          />
          ${this.isCreationMode ? '<p style="color: #cfc09a; font-size: 11px; margin: 5px 0 0 0; font-family: \'Times New Roman\', serif;">Level is set to 1 for new characters</p>' : ''}
        </div>

        <div class="form-group">
          <label style="display: block; color: #ffd966; margin-bottom: 8px; font-weight: bold; font-family: 'Times New Roman', serif;">
            Character Description
          </label>
          <textarea 
            id="character-description" 
            placeholder="Describe your character's appearance, personality, background..."
            rows="4"
            style="
              width: 100%;
              padding: 10px;
              background: #2a2a2a;
              border: 2px solid #c59b45;
              border-radius: 4px;
              color: #ffd966;
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              resize: vertical;
            "
          ></textarea>
        </div>
      </div>
    `
  }

  private getRaceTabContent(): string {
    return `
      <div class="race-tab" style="max-width: 1000px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
            font-family: 'Times New Roman', serif;
          ">Choose Your Race</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
            font-family: 'Times New Roman', serif;
          ">
            Select a character race that defines your heritage and natural abilities
          </p>
        </div>
        
        <div class="race-selection" style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 20px;
        ">
          ${this.raceData.map(race => {
            const isSelected = this.characterData.race === race.id
            return `
              <div 
                class="race-card ${isSelected ? 'selected' : ''}" 
                data-race="${race.id}"
                style="
                  background: ${isSelected ? '#333' : '#2a2a2a'};
                  border: 2px solid ${isSelected ? '#ffd966' : '#c59b45'};
                  border-radius: 12px;
                  padding: 24px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  box-shadow: ${isSelected ? '0 4px 12px rgba(197, 155, 69, 0.3)' : '0 1px 3px rgba(197, 155, 69, 0.1)'};
                "
                onmouseover="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#d4a952';
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
                  }
                "
                onmouseout="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#c59b45';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }
                "
              >
                <!-- Race Header -->
                <div class="race-header" style="margin-bottom: 16px;">
                  <h3 style="
                    color: ${isSelected ? '#ffd966' : '#ffd966'}; 
                    margin: 0 0 8px 0; 
                    font-size: 20px; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${race.name}
                    ${isSelected ? '<span style="color: #c59b45; font-size: 18px;">✓</span>' : ''}
                  </h3>
                  <p style="
                    color: #cfc09a; 
                    margin: 0; 
                    font-size: 14px; 
                    line-height: 1.4;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${race.description}
                  </p>
                </div>

                <!-- Race Stats -->
                <div class="race-stats" style="
                  background: ${isSelected ? '#444' : '#333'};
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 16px;
                  border: 1px solid #c59b45;
                ">
                  <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    font-size: 13px;
                  ">
                    <div>
                      <span style="color: #cfc09a; font-weight: 500; font-family: 'Times New Roman', serif;">Size:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-family: 'Times New Roman', serif;">${race.size}</span>
                    </div>
                    <div>
                      <span style="color: #cfc09a; font-weight: 500; font-family: 'Times New Roman', serif;">Speed:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-family: 'Times New Roman', serif;">${race.speed} ft</span>
                    </div>
                  </div>
                </div>

                <!-- Race Traits -->
                <div class="race-traits">
                  <h4 style="
                    color: #ffd966; 
                    margin: 0 0 12px 0; 
                    font-size: 14px; 
                    font-weight: 600;
                    font-family: 'Times New Roman', serif;
                  ">Racial Traits</h4>
                  <div class="traits-list">
                    ${race.traits.map(trait => `
                      <div style="
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 8px;
                        font-size: 13px;
                        line-height: 1.4;
                      ">
                        <span style="
                          color: #c59b45;
                          margin-right: 8px;
                          margin-top: 2px;
                          font-size: 10px;
                        ">●</span>
                        <span style="color: #cfc09a; font-family: 'Times New Roman', serif;">${trait}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  private getClassTabContent(): string {
    return `
      <div class="class-tab" style="max-width: 1000px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
            font-family: 'Times New Roman', serif;
          ">Choose Your Class</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
            font-family: 'Times New Roman', serif;
          ">
            Select a character class that determines your abilities, skills, and role in the party
          </p>
        </div>
        
        <div class="class-selection" style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 20px;
        ">
          ${this.classData.map(charClass => {
            const isSelected = this.characterData.characterClass === charClass.id
            return `
              <div 
                class="class-card ${isSelected ? 'selected' : ''}" 
                data-class="${charClass.id}"
                style="
                  background: ${isSelected ? '#444' : '#2a2a2a'};
                  border: 2px solid ${isSelected ? '#ffd966' : '#c59b45'};
                  border-radius: 12px;
                  padding: 24px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  box-shadow: ${isSelected ? '0 4px 12px rgba(197, 155, 69, 0.3)' : '0 1px 3px rgba(197, 155, 69, 0.1)'};
                "
                onmouseover="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#d4a952';
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 8px rgba(197, 155, 69, 0.2)';
                  }
                "
                onmouseout="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#c59b45';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 1px 3px rgba(197, 155, 69, 0.1)';
                  }
                "
              >
                <!-- Class Header -->
                <div class="class-header" style="margin-bottom: 16px;">
                  <h3 style="
                    color: ${isSelected ? '#ffd966' : '#ffd966'}; 
                    margin: 0 0 8px 0; 
                    font-size: 20px; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${charClass.name}
                    ${isSelected ? '<span style="color: #c59b45; font-size: 18px;">✓</span>' : ''}
                  </h3>
                  <p style="
                    color: #cfc09a; 
                    margin: 0; 
                    font-size: 14px; 
                    line-height: 1.4;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${charClass.description}
                  </p>
                </div>

                <!-- Class Stats -->
                <div class="class-stats" style="
                  background: ${isSelected ? '#444' : '#333'};
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 16px;
                  border: 1px solid #c59b45;
                ">
                  <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    font-size: 13px;
                    margin-bottom: 12px;
                  ">
                    <div>
                      <span style="color: #cfc09a; font-weight: 500; font-family: 'Times New Roman', serif;">Hit Die:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-family: 'Times New Roman', serif;">d${charClass.hitDie}</span>
                    </div>
                    <div>
                      <span style="color: #cfc09a; font-weight: 500; font-family: 'Times New Roman', serif;">Skill Points:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-family: 'Times New Roman', serif;">${charClass.skillPoints}/level</span>
                    </div>
                  </div>
                  
                  <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    font-size: 13px;
                  ">
                    <div>
                      <span style="color: #cfc09a; font-weight: 500; font-family: 'Times New Roman', serif;">Base Attack:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-family: 'Times New Roman', serif;">${charClass.baseAttackBonus}</span>
                    </div>
                    <div>
                      <span style="color: #cfc09a; font-weight: 500;">Saves:</span>
                      <span style="color: #ffd966; margin-left: 4px; font-size: 11px;">
                        F+${charClass.saves.fortitude} R+${charClass.saves.reflex} W+${charClass.saves.will}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  private getAbilitiesTabContent(): string {
    const abilities = this.characterData.abilities || {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    }
    
    const currentMethod = this.characterData.abilityGenerationMethod || 'pointBuy'
    const pointBuy = this.calculatePointBuyCost()
    
    return `
      <div class="abilities-tab" style="max-width: 800px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Ability Scores</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Choose your method for generating ability scores
          </p>
        </div>
        
        <!-- Method Selection -->
        <div class="method-selection" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <h3 style="
            color: #ffd966; 
            margin: 0 0 16px 0; 
            font-size: 18px; 
            font-weight: 600;
            text-align: center;
          ">Generation Method</h3>
          
          <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 16px;
          ">
            <button 
              id="method-pointbuy" 
              data-method="pointBuy"
              style="
                background: ${currentMethod === 'pointBuy' ? '#c59b45' : '#333'};
                color: ${currentMethod === 'pointBuy' ? '#1b1b1b' : '#ffd966'};
                border: 2px solid #c59b45;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
            >Point Buy</button>
            
            <button 
              id="method-roll" 
              data-method="roll4d6"
              style="
                background: ${currentMethod === 'roll4d6' ? '#c59b45' : '#333'};
                color: ${currentMethod === 'roll4d6' ? '#1b1b1b' : '#ffd966'};
                border: 2px solid #c59b45;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
            >Roll Dice</button>
            
            <button 
              id="method-manual" 
              data-method="eliteArray"
              style="
                background: ${currentMethod === 'eliteArray' ? '#c59b45' : '#333'};
                color: ${currentMethod === 'eliteArray' ? '#1b1b1b' : '#ffd966'};
                border: 2px solid #c59b45;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
            >Elite Array</button>
            
            <button 
              id="auto-pointbuy" 
              style="
                background: #10b981;
                color: white;
                border: 2px solid #10b981;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background = '#059669'"
              onmouseout="this.style.background = '#10b981'"
            >Auto Point Buy</button>
          </div>
          
          <div id="method-description" style="
            color: #cfc09a;
            font-size: 14px;
            text-align: center;
            line-height: 1.5;
          ">
            ${this.getMethodDescription(currentMethod)}
          </div>
        </div>

        <!-- Point Buy Info (only shown for point buy method) -->
        <div id="point-buy-info" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: ${currentMethod === 'pointBuy' ? 'block' : 'none'};
        ">
          <h3 style="
            color: #ffd966; 
            margin: 0 0 12px 0; 
            font-size: 18px; 
            font-weight: 600;
          ">Point Buy System</h3>
          <p style="
            color: #cfc09a; 
            margin: 0 0 16px 0; 
            font-size: 14px; 
            line-height: 1.5;
          ">
            Each ability starts at 8. Use your 27 points to increase scores (higher scores cost more points).
          </p>
          <div style="
            background: ${pointBuy.remaining > 0 ? '#dbeafe' : '#dcfce7'};
            border: 2px solid ${pointBuy.remaining > 0 ? '#ffd966' : '#10b981'};
            border-radius: 8px;
            padding: 12px;
            display: inline-block;
          ">
            <span style="
              color: ${pointBuy.remaining > 0 ? '#1e40af' : '#c59b45'};
              font-size: 16px; 
              font-weight: 600;
            ">
              Points Remaining: <span id="points-remaining">${pointBuy.remaining}</span> / 27
            </span>
          </div>
        </div>

        <!-- Roll Controls (only shown for roll method) -->
        <div id="roll-controls" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: ${currentMethod === 'roll4d6' ? 'block' : 'none'};
        ">
          <h3 style="
            color: #ffd966; 
            margin: 0 0 12px 0; 
            font-size: 18px; 
            font-weight: 600;
          ">Roll for Ability Scores</h3>
          <p style="
            color: #cfc09a; 
            margin: 0 0 16px 0; 
            font-size: 14px; 
            line-height: 1.5;
          ">
            Roll 4d6, drop the lowest die for each ability score.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button 
              id="roll-all-abilities"
              style="
                background: #f59e0b;
                color: white;
                border: 2px solid #f59e0b;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background = '#d97706'"
              onmouseout="this.style.background = '#f59e0b'"
            >Roll All Abilities</button>
            
            <button 
              id="roll-individual"
              style="
                background: #8b5cf6;
                color: white;
                border: 2px solid #8b5cf6;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background = '#7c3aed'"
              onmouseout="this.style.background = '#8b5cf6'"
            >Roll Individual</button>
          </div>
        </div>

        <!-- Elite Array Controls (only shown for elite array method) -->
        <div id="elite-array-controls" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: ${currentMethod === 'eliteArray' ? 'block' : 'none'};
        ">
          <h3 style="
            color: #ffd966; 
            margin: 0 0 12px 0; 
            font-size: 18px; 
            font-weight: 600;
          ">Elite Array</h3>
          <p style="
            color: #cfc09a; 
            margin: 0 0 16px 0; 
            font-size: 14px; 
            line-height: 1.5;
          ">
            Use the standard elite array: 15, 14, 13, 12, 10, 8. Assign them as you wish by editing the values below.
          </p>
          <button 
            id="apply-elite-array"
            style="
              background: #8b5cf6;
              color: white;
              border: 2px solid #8b5cf6;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s ease;
            "
            onmouseover="this.style.background = '#7c3aed'"
            onmouseout="this.style.background = '#8b5cf6'"
          >Apply Elite Array</button>
        </div>

        <!-- Abilities Grid -->
        <div class="abilities-grid" style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 20px;
        ">
          ${Object.entries(abilities).map(([ability, score]) => {
            const modifier = this.getModifier(score)
            const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`
            
            return `
              <div class="ability-block" style="
                background: #2a2a2a;
                border: 2px solid #c59b45;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              "
              onmouseover="
                this.style.borderColor = '#d4a952';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
              "
              onmouseout="
                this.style.borderColor = '#c59b45';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              "
              >
                <!-- Ability Name -->
                <h4 style="
                  color: #ffd966; 
                  margin: 0 0 16px 0; 
                  font-size: 16px; 
                  font-weight: 600;
                  text-transform: capitalize;
                  letter-spacing: 0.025em;
                ">
                  ${ability}
                </h4>
                
                <!-- Score Display -->
                <div style="
                  background: #333;
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 16px;
                ">
                  ${currentMethod === 'eliteArray' ? `
                    <input 
                      type="number"
                      id="ability-${ability}"
                      value="${score}"
                      min="3"
                      max="18"
                      style="
                        background: transparent;
                        border: none;
                        color: #ffd966;
                        font-size: 32px;
                        font-weight: 700;
                        line-height: 1;
                        text-align: center;
                        width: 100%;
                        margin-bottom: 4px;
                      "
                    />
                  ` : `
                    <div class="ability-score" style="
                      color: #ffd966;
                      font-size: 32px;
                      font-weight: 700;
                      line-height: 1;
                      margin-bottom: 4px;
                    ">${score}</div>
                  `}
                  <div class="ability-modifier" style="
                    color: #cfc09a; 
                    font-size: 14px; 
                    font-weight: 500;
                  ">
                    Modifier: ${modifierStr}
                  </div>
                </div>
                
                <!-- Controls -->
                <div class="ability-controls" style="
                  display: ${currentMethod === 'pointBuy' ? 'flex' : currentMethod === 'roll4d6' ? 'flex' : 'none'}; 
                  align-items: center; 
                  justify-content: center; 
                  gap: 12px;
                ">
                  ${currentMethod === 'pointBuy' ? `
                    <button 
                      class="ability-decrease" 
                      data-ability="${ability}"
                      style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: background-color 0.2s ease;
                      "
                      onmouseover="this.style.background = '#dc2626'"
                      onmouseout="this.style.background = '#ef4444'"
                    >−</button>
                    
                    <button 
                      class="ability-increase" 
                      data-ability="${ability}"
                      style="
                        background: #10b981;
                        color: white;
                        border: none;
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: background-color 0.2s ease;
                      "
                      onmouseover="this.style.background = '#059669'"
                      onmouseout="this.style.background = '#10b981'"
                    >+</button>
                  ` : currentMethod === 'roll4d6' ? `
                    <button 
                      class="ability-roll" 
                      data-ability="${ability}"
                      style="
                        background: #f59e0b;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 600;
                        transition: background-color 0.2s ease;
                      "
                      onmouseover="this.style.background = '#d97706'"
                      onmouseout="this.style.background = '#f59e0b'"
                    >Roll</button>
                  ` : ''}
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  private getMethodDescription(method: string): string {
    switch (method) {
      case 'pointBuy':
        return 'Distribute 27 points among your ability scores. Costs increase as scores get higher.'
      case 'roll4d6':
        return 'Roll 4d6 and drop the lowest die for each ability score. Results may vary!'
      case 'eliteArray':
        return 'Use the standard elite array: 15, 14, 13, 12, 10, 8. Assign them as you wish.'
      default:
        return 'Choose how you want to generate your ability scores.'
    }
  }

  private getSkillsTabContent(): string {
    return `
      <div class="skills-tab" style="max-width: 600px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Skills</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Develop your character's expertise and talents
          </p>
        </div>
        
        <div class="skills-placeholder" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <!-- Icon -->
          <div style="
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          ">
            <span style="
              font-size: 28px;
              color: #cfc09a;
            ">⚡</span>
          </div>
          
          <!-- Content -->
          <h3 style="
            color: #ffd966;
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
          ">Skills Coming Soon</h3>
          <p style="
            color: #cfc09a;
            margin: 0 0 16px 0;
            font-size: 14px;
            line-height: 1.5;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          ">
            The skill system is being developed to provide detailed character customization. 
            Currently, skills are automatically assigned based on your chosen class.
          </p>
          
          <!-- Status Badge -->
          <div style="
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
          ">
            🚧 In Development
          </div>
        </div>
      </div>
    `
  }

  private getFeatsTabContent(): string {
    return `
      <div class="feats-tab" style="max-width: 1000px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Choose Feats</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Select special abilities and enhancements for your character
          </p>
        </div>
        
        <div class="feat-selection" style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 20px;
        ">
          ${this.featData.map(feat => {
            const isSelected = this.characterData.feats?.includes(feat.id) || false
            
            return `
              <div 
                class="feat-card ${isSelected ? 'selected' : ''}" 
                data-feat="${feat.id}"
                style="
                  background: ${isSelected ? '#444' : '#2a2a2a'};
                  border: 2px solid ${isSelected ? '#ffd966' : '#c59b45'};
                  border-radius: 12px;
                  padding: 24px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  box-shadow: ${isSelected ? '0 4px 12px rgba(197, 155, 69, 0.3)' : '0 1px 3px rgba(197, 155, 69, 0.1)'};
                "
                onmouseover="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#d4a952';
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 8px rgba(197, 155, 69, 0.2)';
                  }
                "
                onmouseout="
                  if (!this.classList.contains('selected')) {
                    this.style.borderColor = '#c59b45';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 1px 3px rgba(197, 155, 69, 0.1)';
                  }
                "
              >
                <!-- Feat Header -->
                <div class="feat-header" style="margin-bottom: 16px;">
                  <h3 style="
                    color: ${isSelected ? '#1e40af' : '#1e293b'}; 
                    margin: 0 0 8px 0; 
                    font-size: 18px; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                  ">
                    ${feat.name}
                    ${isSelected ? '<span style="color: #c59b45; font-size: 16px;">✓</span>' : ''}
                  </h3>
                  
                  <!-- Feat Type Badge -->
                  <div style="
                    background: ${isSelected ? '#bfdbfe' : '#f1f5f9'};
                    color: #cfc09a;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 11px;
                    font-weight: 500;
                    display: inline-block;
                    margin-bottom: 12px;
                  ">
                    ${feat.type}
                  </div>
                </div>

                <!-- Description -->
                <p style="
                  color: #cfc09a; 
                  margin: 0 0 16px 0; 
                  font-size: 14px; 
                  line-height: 1.5;
                ">
                  ${feat.description}
                </p>

                <!-- Prerequisites -->
                ${feat.prerequisites.length > 0 ? `
                  <div class="prerequisites" style="
                    background: ${isSelected ? '#fee2e2' : '#fef2f2'};
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 16px;
                  ">
                    <div style="
                      color: #dc2626; 
                      font-size: 12px; 
                      font-weight: 600;
                      margin-bottom: 4px;
                    ">
                      Prerequisites:
                    </div>
                    <div style="
                      color: #b8891e;
                      font-size: 12px;
                      line-height: 1.4;
                    ">
                      ${feat.prerequisites.join(', ')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  private getEquipmentTabContent(): string {
    return `
      <div class="equipment-tab" style="max-width: 600px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Starting Equipment</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Equip your character for adventure
          </p>
        </div>
        
        <div class="equipment-placeholder" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <!-- Icon -->
          <div style="
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          ">
            <span style="
              font-size: 28px;
              color: #cfc09a;
            ">⚔️</span>
          </div>
          
          <!-- Content -->
          <h3 style="
            color: #ffd966;
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
          ">Equipment Coming Soon</h3>
          <p style="
            color: #cfc09a;
            margin: 0 0 16px 0;
            font-size: 14px;
            line-height: 1.5;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          ">
            The equipment system is being developed for comprehensive gear management. 
            Currently, characters receive basic starting equipment based on their class.
          </p>
          
          <!-- Status Badge -->
          <div style="
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
          ">
            🚧 In Development
          </div>
        </div>
      </div>
    `
  }

  private getStatsTabContent(): string {
    if (!this.character) return '<p>No character data available.</p>'
    
    return `
      <div class="stats-tab" style="max-width: 900px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Combat Statistics</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Manage your character's vital combat statistics
          </p>
        </div>
        
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 24px;
        ">
          <!-- Hit Points -->
          <div class="stat-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #ef4444;">❤️</span> Hit Points
            </h3>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Current HP</label>
              <input type="number" id="current-hp" value="${this.character.hitPoints.current}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Max HP</label>
              <input type="number" id="max-hp" value="${this.character.hitPoints.max}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Temporary HP</label>
              <input type="number" id="temp-hp" value="${this.character.hitPoints.temporary}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
          </div>

          <!-- Armor Class -->
          <div class="stat-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #cfc09a;">🛡️</span> Armor Class
            </h3>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Total AC</label>
              <input type="number" id="total-ac" value="${this.character.armorClass.total}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Touch AC</label>
              <input type="number" id="touch-ac" value="${this.character.armorClass.touch}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Flat-Footed AC</label>
              <input type="number" id="flatfooted-ac" value="${this.character.armorClass.flatFooted}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
          </div>

          <!-- Saving Throws -->
          <div class="stat-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #c59b45;">✨</span> Saving Throws
            </h3>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Fortitude</label>
              <input type="number" id="fort-save" value="${this.character.savingThrows.fortitude}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Reflex</label>
              <input type="number" id="ref-save" value="${this.character.savingThrows.reflex}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
            
            <div class="form-group">
              <label style="
                color: #cfc09a; 
                display: block; 
                margin-bottom: 6px;
                font-size: 14px;
                font-weight: 500;
              ">Will</label>
              <input type="number" id="will-save" value="${this.character.savingThrows.will}" 
                     style="
                       width: 100%;
                       padding: 12px;
                       background: #333;
                       border: 2px solid #c59b45;
                       border-radius: 8px;
                       color: #ffd966;
                       font-size: 16px;
                       font-weight: 600;
                       transition: border-color 0.2s ease;
                     "
                     onfocus="this.style.borderColor = '#ffd966'"
                     onblur="this.style.borderColor = '#c59b45'"
              />
            </div>
          </div>
        </div>
      </div>
    `
  }

  private getInventoryTabContent(): string {
    return `
      <div class="inventory-tab" style="max-width: 600px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Inventory</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Manage your character's possessions and equipment
          </p>
        </div>
        
        <div class="inventory-placeholder" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <!-- Icon -->
          <div style="
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          ">
            <span style="
              font-size: 28px;
              color: #cfc09a;
            ">🎒</span>
          </div>
          
          <!-- Content -->
          <h3 style="
            color: #ffd966;
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
          ">Inventory System Coming Soon</h3>
          <p style="
            color: #cfc09a;
            margin: 0 0 16px 0;
            font-size: 14px;
            line-height: 1.5;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          ">
            Detailed inventory management with drag-and-drop functionality, item categories, 
            and weight calculations is being developed.
          </p>
          
          <!-- Status Badge -->
          <div style="
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
          ">
            🚧 In Development
          </div>
        </div>
      </div>
    `
  }

  private getCombatTabContent(): string {
    return `
      <div class="combat-tab" style="max-width: 600px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Combat Options</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Track combat conditions, buffs, and special abilities
          </p>
        </div>
        
        <div class="combat-placeholder" style="
          background: #2a2a2a;
          border: 2px solid #c59b45;
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        ">
          <!-- Icon -->
          <div style="
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
          ">
            <span style="
              font-size: 28px;
              color: #cfc09a;
            ">⚔️</span>
          </div>
          
          <!-- Content -->
          <h3 style="
            color: #ffd966;
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
          ">Combat Tracking Coming Soon</h3>
          <p style="
            color: #cfc09a;
            margin: 0 0 16px 0;
            font-size: 14px;
            line-height: 1.5;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          ">
            Advanced combat tracking with condition management, buff/debuff timers, 
            and special ability usage tracking is being developed.
          </p>
          
          <!-- Status Badge -->
          <div style="
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
          ">
            🚧 In Development
          </div>
        </div>
      </div>
    `
  }

  private getReviewTabContent(): string {
    const character = this.isCreationMode ? this.characterData : this.character
    const validation = this.validateCurrentStep()
    
    return `
      <div class="review-tab" style="max-width: 1000px; margin: 0 auto;">
        <div class="tab-header" style="margin-bottom: 32px; text-align: center;">
          <h2 style="
            color: #ffd966; 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            font-weight: 700;
            letter-spacing: -0.025em;
          ">Character Review</h2>
          <p style="
            color: #cfc09a; 
            margin: 0; 
            font-size: 16px; 
            line-height: 1.5;
          ">
            Review your character details before finalizing
          </p>
        </div>
        
        <!-- Validation Status -->
        <div class="validation-banner" style="
          background: ${validation.isValid ? '#dcfce7' : '#fef2f2'};
          border: 2px solid ${validation.isValid ? '#10b981' : '#ef4444'};
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
          text-align: center;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: ${validation.isValid ? '0' : '12px'};
          ">
            <span style="font-size: 24px;">
              ${validation.isValid ? '✅' : '⚠️'}
            </span>
            <h3 style="
              color: ${validation.isValid ? '#c59b45' : '#b8891e'};
              margin: 0;
              font-size: 18px;
              font-weight: 600;
            ">
              ${validation.isValid ? 'Character Ready!' : 'Issues Found'}
            </h3>
          </div>
          
          ${!validation.isValid ? `
            <div style="
              background: ${validation.isValid ? '#bbf7d0' : '#fecaca'};
              border-radius: 8px;
              padding: 16px;
              margin-top: 12px;
            ">
              <div style="
                color: #b8891e;
                font-size: 14px;
                line-height: 1.5;
                text-align: left;
              ">
                ${Object.values(validation.errors).map(error => `
                  <div style="
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 8px;
                    gap: 8px;
                  ">
                    <span style="color: #dc2626; margin-top: 2px;">•</span>
                    <span>${error}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Character Summary -->
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 24px;
        ">
          <!-- Basic Information -->
          <div class="review-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #ffd966;">👤</span> Basic Information
            </h3>
            <div style="
              color: #cfc09a; 
              line-height: 1.6;
              font-size: 14px;
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
              ">
                <span style="font-weight: 500; color: #ffd966;">Name:</span>
                <span style="color: #ffd966; font-weight: 600;">${character?.name || 'Not set'}</span>
              </div>
              <div style="
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
              ">
                <span style="font-weight: 500; color: #ffd966;">Race:</span>
                <span style="color: #ffd966; font-weight: 600;">${this.characterData.race || 'Not selected'}</span>
              </div>
              <div style="
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
              ">
                <span style="font-weight: 500; color: #ffd966;">Class:</span>
                <span style="color: #ffd966; font-weight: 600;">${this.characterData.characterClass || 'Not selected'}</span>
              </div>
              ${!this.isCreationMode && this.character ? `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                ">
                  <span style="font-weight: 500; color: #ffd966;">Level:</span>
                  <span style="color: #ffd966; font-weight: 600;">${this.character.classes[0]?.level || 1}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Ability Scores -->
          <div class="review-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #c59b45;">💪</span> Ability Scores
            </h3>
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              font-size: 14px;
            ">
              ${Object.entries(this.characterData.abilities || {}).map(([ability, score]) => {
                const modifier = this.getModifier(score)
                const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`
                return `
                  <div style="
                    background: #333;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                  ">
                    <div style="
                      color: #cfc09a;
                      font-size: 12px;
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.025em;
                      margin-bottom: 4px;
                    ">${ability.slice(0, 3)}</div>
                    <div style="
                      color: #ffd966;
                      font-size: 18px;
                      font-weight: 700;
                      margin-bottom: 2px;
                    ">${score}</div>
                    <div style="
                      color: #cfc09a;
                      font-size: 11px;
                    ">(${modifierStr})</div>
                  </div>
                `
              }).join('')}
            </div>
          </div>

          <!-- Selected Features -->
          <div class="review-section" style="
            background: #2a2a2a;
            border: 2px solid #c59b45;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            grid-column: 1 / -1;
          ">
            <h3 style="
              color: #ffd966; 
              margin: 0 0 20px 0; 
              font-size: 18px; 
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="color: #f59e0b;">⭐</span> Selected Features
            </h3>
            
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            ">
              <!-- Feats -->
              <div style="
                background: #333;
                border-radius: 8px;
                padding: 16px;
              ">
                <h4 style="
                  color: #ffd966;
                  margin: 0 0 12px 0;
                  font-size: 14px;
                  font-weight: 600;
                ">Feats</h4>
                ${this.characterData.feats && this.characterData.feats.length > 0 ? 
                  this.characterData.feats.map(featId => {
                    const feat = this.featData.find(f => f.id === featId)
                    return `
                      <div style="
                        background: #444;
                        color: #1e40af;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 500;
                        margin-bottom: 4px;
                        display: inline-block;
                        margin-right: 4px;
                      ">${feat?.name || featId}</div>
                    `
                  }).join('')
                  : '<span style="color: #cfc09a; font-size: 12px; font-style: italic;">No feats selected</span>'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private setupEventListeners(): void {
    if (!this.modal) {
      return
    }

    // Create a global function for tab switching that the onclick handlers can use
    (window as any).switchCharacterTab = (tabId: string) => {
      this.switchTab(tabId as Tab)
    }

    // Close button
    const closeBtn = this.modal.querySelector('#close-character-interface')
    closeBtn?.addEventListener('click', () => {
      if (this.onCancel) {
        this.onCancel()
      }
      this.hide()
    })

    // Tab navigation
    const tabButtons = this.modal.querySelectorAll('.tab-button')
    
    tabButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Get the tab ID from the button or its parent
        let target = e.target as HTMLElement
        let tabId = target.dataset.tab
        
        // If the clicked element doesn't have data-tab, check its parent button
        if (!tabId && target.closest('.tab-button')) {
          const parentButton = target.closest('.tab-button') as HTMLElement
          tabId = parentButton.dataset.tab
        }
        
        if (tabId) {
          this.switchTab(tabId as Tab)
        }
      })
    })

    // Navigation buttons
    const prevBtn = this.modal.querySelector('#prev-tab')
    const nextBtn = this.modal.querySelector('#next-tab')
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPreviousTab())
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToNextTab())
    }

    // Save button
    const saveBtn = this.modal.querySelector('#save-character')
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveCharacter())
    }

    // Tab-specific event listeners
    this.setupTabEventListeners()
  }

  private setupTabEventListeners(): void {
    if (!this.modal) return

    // Generate name button
    const generateNameBtn = this.modal.querySelector('#generate-name')
    generateNameBtn?.addEventListener('click', () => {
      const nameInput = this.modal?.querySelector('#character-name') as HTMLInputElement
      if (nameInput) {
        const race = this.characterData.race || 'human'
        nameInput.value = FantasyNameGenerator.generateFullName(race)
        this.characterData.name = nameInput.value
      }
    })

    // Character name input
    const nameInput = this.modal.querySelector('#character-name') as HTMLInputElement
    nameInput?.addEventListener('input', (e) => {
      this.characterData.name = (e.target as HTMLInputElement).value
    })

    // Race selection
    const raceCards = this.modal.querySelectorAll('.race-card')
    raceCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const raceId = (e.currentTarget as HTMLElement).dataset.race
        if (raceId) {
          this.characterData.race = raceId
          this.updateTabContent('race')
        }
      })
    })

    // Class selection
    const classCards = this.modal.querySelectorAll('.class-card')
    classCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const classId = (e.currentTarget as HTMLElement).dataset.class
        if (classId) {
          this.characterData.characterClass = classId
          this.updateTabContent('class')
        }
      })
    })

    // Ability score controls
    const abilityButtons = this.modal.querySelectorAll('.ability-increase, .ability-decrease')
    abilityButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const ability = (e.target as HTMLElement).dataset.ability as keyof CharacterCreationData['abilities']
        const isIncrease = (e.target as HTMLElement).classList.contains('ability-increase')
        
        if (ability && this.characterData.abilities) {
          const currentScore = this.characterData.abilities[ability]
          const newScore = isIncrease ? currentScore + 1 : currentScore - 1
          
          // Validate point buy limits
          if (newScore >= 8 && newScore <= 15) {
            const oldCost = this.getAbilityCost(currentScore)
            const newCost = this.getAbilityCost(newScore)
            const costDiff = newCost - oldCost
            const currentTotal = this.calculatePointBuyCost().total
            
            if (currentTotal + costDiff <= 27) {
              this.characterData.abilities[ability] = newScore
              this.updateTabContent('abilities')
            }
          }
        }
      })
    })

    // Ability generation method buttons
    const methodButtons = this.modal.querySelectorAll('[data-method]')
    methodButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const method = (e.target as HTMLElement).dataset.method as 'pointBuy' | 'roll4d6' | 'eliteArray'
        if (method) {
          this.characterData.abilityGenerationMethod = method
          this.updateTabContent('abilities')
        }
      })
    })

    // Auto point buy button
    const autoPointBuyBtn = this.modal.querySelector('#auto-point-buy')
    autoPointBuyBtn?.addEventListener('click', () => {
      this.autoDistributePointBuy()
      this.updateTabContent('abilities')
    })

    // Roll abilities buttons
    const rollButtons = this.modal.querySelectorAll('.ability-roll')
    rollButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const ability = (e.target as HTMLElement).dataset.ability as keyof CharacterCreationData['abilities']
        if (ability && this.characterData.abilities) {
          this.characterData.abilities[ability] = this.rollAbilityScore()
          this.updateTabContent('abilities')
        }
      })
    })

    // Roll all abilities button
    const rollAllBtn = this.modal.querySelector('#roll-all-abilities')
    rollAllBtn?.addEventListener('click', () => {
      if (this.characterData.abilities) {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
        abilities.forEach(ability => {
          this.characterData.abilities![ability] = this.rollAbilityScore()
        })
        this.updateTabContent('abilities')
      }
    })

    // Roll individual button (same as individual roll buttons, but for UI consistency)
    const rollIndividualBtn = this.modal.querySelector('#roll-individual')
    rollIndividualBtn?.addEventListener('click', () => {
      // This just shows a message or highlights the individual roll buttons
      console.log('Click individual roll buttons for each ability')
    })

    // Apply elite array button
    const applyEliteArrayBtn = this.modal.querySelector('#apply-elite-array')
    applyEliteArrayBtn?.addEventListener('click', () => {
      this.applyEliteArray()
      this.updateTabContent('abilities')
    })

    // Manual ability score inputs (elite array method)
    const abilityInputs = this.modal.querySelectorAll('input[type="number"][id^="ability-"]')
    abilityInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const inputElement = e.target as HTMLInputElement
        const inputId = inputElement.id
        const ability = inputId.replace('ability-', '') as keyof CharacterCreationData['abilities']
        const value = parseInt(inputElement.value)
        if (ability && this.characterData.abilities && value >= 3 && value <= 18) {
          this.characterData.abilities[ability] = value
          this.updateTabContent('abilities')
        }
      })
    })

    // Feat selection
    const featCards = this.modal.querySelectorAll('.feat-card')
    featCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const featId = (e.currentTarget as HTMLElement).dataset.feat
        if (featId) {
          if (!this.characterData.feats) {
            this.characterData.feats = []
          }
          
          const index = this.characterData.feats.indexOf(featId)
          if (index > -1) {
            this.characterData.feats.splice(index, 1)
          } else {
            this.characterData.feats.push(featId)
          }
          
          this.updateTabContent('feats')
        }
      })
    })

    // Combat stats inputs (edit mode only)
    if (!this.isCreationMode && this.character) {
      const statInputs = this.modal.querySelectorAll('#current-hp, #max-hp, #temp-hp, #total-ac, #touch-ac, #flatfooted-ac, #fort-save, #ref-save, #will-save')
      statInputs.forEach(input => {
        input.addEventListener('change', () => this.updateCharacterFromForm())
      })
    }
  }

  private switchTab(tabId: Tab): void {
    this.currentTab = tabId
    this.updateTabContent(tabId)
    this.updateTabButtons()
    this.updateNavigationButtons()
  }

  private updateTabContent(tabId: Tab): void {
    const contentDiv = this.modal?.querySelector('#tab-content')
    if (contentDiv) {
      contentDiv.innerHTML = this.getTabContent(tabId)
      this.setupTabEventListeners()
    }
  }

  private updateTabButtons(): void {
    const tabButtons = this.modal?.querySelectorAll('.tab-button')
    
    tabButtons?.forEach((button) => {
      const tabElement = button as HTMLElement
      const tabId = tabElement.dataset.tab
      const isActive = tabId === this.currentTab
      
      if (isActive) {
        tabElement.classList.add('active')
        tabElement.style.background = 'linear-gradient(135deg, #c59b45 0%, #ffd966 50%, #c59b45 100%)'
        tabElement.style.color = '#1b1b1b'
        tabElement.style.borderTop = '3px solid #ffd966'
        tabElement.style.fontWeight = '700'
        tabElement.style.boxShadow = '0 -2px 8px rgba(197, 155, 69, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        
        // Add the active arrow indicator
        const existingArrow = tabElement.querySelector('.active-arrow')
        if (!existingArrow) {
          const arrow = document.createElement('div')
          arrow.className = 'active-arrow'
          arrow.style.cssText = `
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid #c59b45;
          `
          tabElement.appendChild(arrow)
        }
      } else {
        tabElement.classList.remove('active')
        tabElement.style.background = 'linear-gradient(135deg, #2a2a2a 0%, #333 100%)'
        tabElement.style.color = '#ffd966'
        tabElement.style.borderTop = '3px solid transparent'
        tabElement.style.fontWeight = '500'
        tabElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)'
        
        // Remove the active arrow indicator
        const existingArrow = tabElement.querySelector('.active-arrow')
        if (existingArrow) {
          existingArrow.remove()
        }
      }
    })
  }

  private updateNavigationButtons(): void {
    const availableTabs = this.getAvailableTabs()
    const currentIndex = availableTabs.findIndex(tab => tab.id === this.currentTab)
    
    const prevBtn = this.modal?.querySelector('#prev-tab') as HTMLButtonElement
    const nextBtn = this.modal?.querySelector('#next-tab') as HTMLButtonElement
    
    if (prevBtn) {
      prevBtn.disabled = currentIndex <= 0
      prevBtn.style.opacity = currentIndex <= 0 ? '0.5' : '1'
    }
    
    if (nextBtn) {
      nextBtn.disabled = currentIndex >= availableTabs.length - 1
      nextBtn.style.opacity = currentIndex >= availableTabs.length - 1 ? '0.5' : '1'
    }
  }

  private goToPreviousTab(): void {
    const availableTabs = this.getAvailableTabs()
    const currentIndex = availableTabs.findIndex(tab => tab.id === this.currentTab)
    if (currentIndex > 0) {
      this.switchTab(availableTabs[currentIndex - 1].id)
    }
  }

  private goToNextTab(): void {
    const availableTabs = this.getAvailableTabs()
    const currentIndex = availableTabs.findIndex(tab => tab.id === this.currentTab)
    if (currentIndex < availableTabs.length - 1) {
      this.switchTab(availableTabs[currentIndex + 1].id)
    }
  }

  private saveCharacter(): void {
    if (this.isCreationMode) {
      this.createCharacter()
    } else {
      this.updateExistingCharacter()
    }
  }

  private createCharacter(): void {
    // Apply defaults for missing required fields
    const creationData = { ...this.characterData } as CharacterCreationData
    
    if (!creationData.name?.trim()) {
      creationData.name = 'Unnamed Character'
    }
    
    if (!creationData.race) {
      creationData.race = 'human'
    }
    
    if (!creationData.characterClass) {
      creationData.characterClass = 'fighter'
    }
    
    if (!creationData.abilities) {
      creationData.abilities = {
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10
      }
    }
    
    creationData.skills = creationData.skills || []
    creationData.equipment = creationData.equipment || []
    creationData.feats = creationData.feats || []
    
    // Calculate hit points
    try {
      const characterClass = this.classData.find(c => c.id === creationData.characterClass)
      const conModifier = this.getModifier(creationData.abilities.constitution)
      const hitDieSize = parseInt(characterClass?.hitDie?.substring(1) || '8')
      creationData.hitPoints = Math.max(1, hitDieSize + conModifier)
    } catch (error) {
      creationData.hitPoints = 8
    }
    
    // Convert to unified Character format
    const unifiedCharacter = convertCreationDataToCharacter(creationData)
    
    if (this.onComplete) {
      this.onComplete(unifiedCharacter)
    }
    
    this.hide()
  }

  private updateExistingCharacter(): void {
    if (!this.character) return

    // Update character with form data if in edit mode
    if (!this.isCreationMode) {
      this.updateCharacterFromForm()
    }

    // Emit update event
    const event = new CustomEvent('character-sheet-saved', {
      detail: {
        character: this.character,
        characterId: this.characterId,
        isNew: false,
        source: 'unified-interface'
      }
    })
    
    document.dispatchEvent(event)
    this.hide()
  }

  private updateCharacterFromForm(): void {
    if (!this.character || !this.modal) return

    // Update character properties from form inputs
    const currentHpInput = this.modal.querySelector('#current-hp') as HTMLInputElement
    const maxHpInput = this.modal.querySelector('#max-hp') as HTMLInputElement
    const tempHpInput = this.modal.querySelector('#temp-hp') as HTMLInputElement
    
    if (currentHpInput) this.character.hitPoints.current = parseInt(currentHpInput.value) || 0
    if (maxHpInput) this.character.hitPoints.max = parseInt(maxHpInput.value) || 1
    if (tempHpInput) this.character.hitPoints.temporary = parseInt(tempHpInput.value) || 0

    const totalAcInput = this.modal.querySelector('#total-ac') as HTMLInputElement
    const touchAcInput = this.modal.querySelector('#touch-ac') as HTMLInputElement
    const flatfootedAcInput = this.modal.querySelector('#flatfooted-ac') as HTMLInputElement
    
    if (totalAcInput) this.character.armorClass.total = parseInt(totalAcInput.value) || 10
    if (touchAcInput) this.character.armorClass.touch = parseInt(touchAcInput.value) || 10
    if (flatfootedAcInput) this.character.armorClass.flatFooted = parseInt(flatfootedAcInput.value) || 10

    const fortSaveInput = this.modal.querySelector('#fort-save') as HTMLInputElement
    const refSaveInput = this.modal.querySelector('#ref-save') as HTMLInputElement
    const willSaveInput = this.modal.querySelector('#will-save') as HTMLInputElement
    
    if (fortSaveInput) this.character.savingThrows.fortitude = parseInt(fortSaveInput.value) || 0
    if (refSaveInput) this.character.savingThrows.reflex = parseInt(refSaveInput.value) || 0
    if (willSaveInput) this.character.savingThrows.will = parseInt(willSaveInput.value) || 0
  }

  private validateCurrentStep(): FormValidation {
    const errors: Record<string, string> = {}
    
    if (!this.characterData.name?.trim()) {
      errors.name = 'Character name is required'
    }
    
    if (!this.characterData.race) {
      errors.race = 'Race selection is required'
    }
    
    if (!this.characterData.characterClass) {
      errors.characterClass = 'Class selection is required'
    }
    
    const pointBuy = this.calculatePointBuyCost()
    if (pointBuy.remaining !== 0) {
      errors.abilities = `Must spend all ability points (${pointBuy.remaining} remaining)`
    }
    
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  private calculatePointBuyCost(): { total: number; remaining: number } {
    const abilities = this.characterData.abilities || {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    }
    
    const totalCost = Object.values(abilities).reduce((sum, value) => sum + this.getAbilityCost(value), 0)
    return { total: totalCost, remaining: 27 - totalCost }
  }

  private getAbilityCost(score: number): number {
    const costs: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    }
    return costs[score] || 0
  }

  private getModifier(score: number): number {
    return Math.floor((score - 10) / 2)
  }

  private autoDistributePointBuy(): void {
    // Auto-distribute point buy with optimal spread
    this.characterData.abilities = {
      strength: 14,
      dexterity: 14, 
      constitution: 14,
      intelligence: 12,
      wisdom: 10,
      charisma: 8
    }
  }

  private rollAbilityScore(): number {
    // Roll 4d6, drop lowest
    const rolls = []
    for (let i = 0; i < 4; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1)
    }
    rolls.sort((a, b) => b - a) // Sort descending
    const result = rolls[0] + rolls[1] + rolls[2] // Take the three highest
    
    // Log the roll for user feedback
    console.log(`Rolled: [${rolls.join(', ')}] = ${result} (dropped ${rolls[3]})`)
    
    return result
  }

  private applyEliteArray(): void {
    // Apply elite array scores - user can rearrange them
    const eliteScores = [15, 14, 13, 12, 10, 8]
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
    
    abilities.forEach((ability, index) => {
      if (this.characterData.abilities) {
        this.characterData.abilities[ability] = eliteScores[index]
      }
    })
  }

  private focusModal(): void {
    this.modal?.focus()
  }

  public hide(): void {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal)
    }
    this.modal = null
  }

  public isVisible(): boolean {
    return this.modal !== null
  }
}

// Export for global access
export default UnifiedCharacterInterface
