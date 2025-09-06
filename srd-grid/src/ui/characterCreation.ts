/**
 * Modern Character Creation Modal
 * Built following UX/UI design best practices for modal forms
 * Features: Multi-step progression, inline validation, accessibility support
 */

import { FantasyNameGenerator } from './nameGenerator.js'

interface CharacterData {
  name: string
  race: string
  characterClass: string
  abilityGenerationMethod: 'pointBuy' | 'eliteArray' | 'roll4d6'
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  rolledAbilities?: number[] // For 4d6 method - stores rolled values before assignment
  hitPoints: number
  skills: string[]
  feats: string[]
  equipment: string[]
}

interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
}

type Step = 'basics' | 'race' | 'class' | 'abilities' | 'skills' | 'feats' | 'equipment' | 'review'

interface StepConfig {
  id: Step
  title: string
  description: string
  isRequired: boolean
}

export class CharacterCreationModal {
  private modal: HTMLElement | null = null
  private currentStep: Step = 'basics'
  private characterData: Partial<CharacterData> = {}
  private completedSteps: Set<Step> = new Set()
  private onComplete?: (character: CharacterData) => void
  private onCancel?: () => void

  private readonly steps: StepConfig[] = [
    { id: 'basics', title: 'Character Basics', description: 'Name and basic information', isRequired: true },
    { id: 'race', title: 'Choose Race', description: 'Select your character race', isRequired: true },
    { id: 'class', title: 'Choose Class', description: 'Select your character class', isRequired: true },
    { id: 'abilities', title: 'Ability Scores', description: 'Assign your ability scores', isRequired: true },
    { id: 'skills', title: 'Select Skills', description: 'Choose your starting skills', isRequired: false },
    { id: 'feats', title: 'Select Feats', description: 'Choose your starting feats', isRequired: false },
    { id: 'equipment', title: 'Starting Equipment', description: 'Choose your starting gear', isRequired: false },
    { id: 'review', title: 'Review Character', description: 'Review and finalize', isRequired: true }
  ]

  private readonly raceData = [
    {
      id: 'human',
      name: 'Human',
      description: 'Versatile and ambitious, humans are the most common race in most worlds.',
      traits: ['+1 to any ability score', 'Extra feat at 1st level', 'Extra skill points'],
      size: 'Medium',
      speed: 30
    },
    {
      id: 'elf',
      name: 'Elf',
      description: 'Graceful and long-lived, elves are known for their connection to magic and nature.',
      traits: ['+2 Dexterity, -2 Constitution', 'Darkvision 60 ft', 'Keen Senses', 'Elven Magic'],
      size: 'Medium',
      speed: 30
    },
    {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Hardy and resilient, dwarves are known for their craftsmanship and combat prowess.',
      traits: ['+2 Constitution, -2 Charisma', 'Darkvision 60 ft', 'Stonecunning', 'Weapon Familiarity'],
      size: 'Medium',
      speed: 20
    },
    {
      id: 'halfling',
      name: 'Halfling',
      description: 'Small and nimble, halflings are known for their luck and stealth.',
      traits: ['+2 Dexterity, -2 Strength', 'Small size', 'Lucky', 'Halfling Stealth'],
      size: 'Small',
      speed: 20
    }
  ]

  private readonly classData = [
    {
      id: 'fighter',
      name: 'Fighter',
      description: 'Masters of combat, fighters excel with weapons and armor.',
      hitDie: 'd10',
      skillPoints: 2,
      baseAttackBonus: 'High',
      saves: { fortitude: 'High', reflex: 'Low', will: 'Low' }
    },
    {
      id: 'wizard',
      name: 'Wizard',
      description: 'Masters of arcane magic, wizards cast powerful spells.',
      hitDie: 'd4',
      skillPoints: 2,
      baseAttackBonus: 'Low',
      saves: { fortitude: 'Low', reflex: 'Low', will: 'High' }
    },
    {
      id: 'rogue',
      name: 'Rogue',
      description: 'Masters of stealth and skill, rogues excel at finding and exploiting weaknesses.',
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
      id: 'improved-initiative',
      name: 'Improved Initiative',
      description: '+4 bonus on initiative checks.',
      prerequisites: [],
      type: 'General'
    },
    {
      id: 'power-attack',
      name: 'Power Attack',
      description: 'Trade attack bonus for extra damage with melee weapons.',
      prerequisites: ['Str 13'],
      type: 'General'
    },
    {
      id: 'weapon-finesse',
      name: 'Weapon Finesse',
      description: 'Use Dex instead of Str for attack rolls with light weapons.',
      prerequisites: ['Base attack bonus +1'],
      type: 'General'
    },
    {
      id: 'toughness',
      name: 'Toughness',
      description: '+3 hit points.',
      prerequisites: [],
      type: 'General'
    },
    {
      id: 'skill-focus-perception',
      name: 'Skill Focus (Perception)',
      description: '+3 bonus on all Perception skill checks.',
      prerequisites: [],
      type: 'General'
    },
    {
      id: 'spell-focus-evocation',
      name: 'Spell Focus (Evocation)',
      description: '+1 to save DCs of Evocation spells you cast.',
      prerequisites: ['Ability to cast spells'],
      type: 'General'
    },
    {
      id: 'weapon-focus-longsword',
      name: 'Weapon Focus (Longsword)',
      description: '+1 bonus on attack rolls with longswords.',
      prerequisites: ['Proficiency with longsword', 'base attack bonus +1'],
      type: 'Fighter'
    },
    {
      id: 'cleave',
      name: 'Cleave',
      description: 'Make an additional attack against adjacent foe when you drop an enemy.',
      prerequisites: ['Power Attack'],
      type: 'General'
    }
  ]

  constructor(options: { onComplete?: (character: CharacterData) => void; onCancel?: () => void } = {}) {
    console.log('CharacterCreationModal constructor called with options:', options)
    this.onComplete = options.onComplete
    this.onCancel = options.onCancel
    this.initializeCharacterData()
  // Reference internal helper to prevent unused function warnings in different build modes
  void this._referValidateAllSteps
    console.log('CharacterCreationModal constructor completed, initialized with character data:', this.characterData)
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

  public show(): void {
    console.log('CharacterCreationModal: show() called')
    if (this.modal) {
      console.log('CharacterCreationModal: Existing modal found, removing it first')
      this.hide()
    }

    this.createModal()
    this.setupEventListeners()
    this.render()
    this.focusModal()
    console.log('CharacterCreationModal: modal created and rendered')
    
    // Additional debugging
    console.log('Modal element in DOM:', document.body.contains(this.modal))
    console.log('Modal computed style:', this.modal ? window.getComputedStyle(this.modal) : 'No modal')
    console.log('Modal innerHTML length:', this.modal?.innerHTML.length)
  }

  public hide(): void {
    if (this.modal) {
      this.modal.remove()
      this.modal = null
    }
    this.restoreFocus()
  }

  private createModal(): void {
    console.log('CharacterCreationModal: createModal() called')
    // Create modal backdrop with proper accessibility attributes
    this.modal = document.createElement('div')
    this.modal.className = 'character-modal-backdrop'
    this.modal.setAttribute('role', 'dialog')
    this.modal.setAttribute('aria-labelledby', 'character-modal-title')
    this.modal.setAttribute('aria-modal', 'true')
    this.modal.setAttribute('tabindex', '-1')
    
    // Add inline styles as fallback to ensure the modal displays correctly
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 21000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow-y: auto;
    `

    // Create modal container
    const modalContainer = document.createElement('div')
    modalContainer.className = 'character-modal-container'
    modalContainer.style.cssText = `
      background: rgba(20, 25, 30, 0.95);
      border: 1px solid #444;
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      position: relative;
      animation: modalSlideIn 0.3s ease-out;
      color: #ddd;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `
    
    this.modal.appendChild(modalContainer)
    document.body.appendChild(this.modal)
    console.log('CharacterCreationModal: modal DOM elements created and added to body')
    console.log('Modal element:', this.modal)
    console.log('Modal classes:', this.modal.classList.toString())

    // Disable background scrolling and interaction
    document.body.style.overflow = 'hidden'
    this.setBackgroundAriaHidden(true)
  }

  private setupEventListeners(): void {
    if (!this.modal) return

    // ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.cancel()
      }
    }

    // Click outside to close (on backdrop only)
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === this.modal) {
        this.cancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    this.modal.addEventListener('click', handleBackdropClick)

    // Store event listeners for cleanup
    this.modal.dataset.keyDownHandler = 'attached'
    this.modal.dataset.clickHandler = 'attached'
  }

  private focusModal(): void {
    if (this.modal) {
      this.modal.focus()
      // Focus first interactive element
      const firstInput = this.modal.querySelector('input, select, textarea, button') as HTMLElement
      if (firstInput) {
        firstInput.focus()
      }
    }
  }

  private restoreFocus(): void {
    document.body.style.overflow = ''
    this.setBackgroundAriaHidden(false)
  }

  private setBackgroundAriaHidden(hidden: boolean): void {
    const mainContent = document.querySelector('main, #app, .app')
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', hidden.toString())
    }
  }

  private render(): void {
    if (!this.modal) {
      console.error('CharacterCreationModal: render() called but modal is null')
      return
    }

    console.log('CharacterCreationModal: render() starting for step:', this.currentStep)
    
    const container = this.modal.querySelector('.character-modal-container')
    if (!container) {
      console.error('CharacterCreationModal: modal container not found')
      return
    }

    const stepIndex = this.steps.findIndex(step => step.id === this.currentStep)
    const currentStepConfig = this.steps[stepIndex]

    console.log('CharacterCreationModal: rendering step', stepIndex + 1, 'of', this.steps.length)
    
    container.innerHTML = `
      <div class="character-modal-content">
        <!-- Modal Header -->
        <header class="character-modal-header">
          <div class="modal-title-section">
            <h1 id="character-modal-title" class="modal-title">${currentStepConfig.title}</h1>
            <p class="modal-subtitle">${currentStepConfig.description}</p>
          </div>
          <button 
            type="button" 
            class="modal-close-button" 
            id="close-modal-btn"
            aria-label="Close character creation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </header>

        <!-- Progress Indicator -->
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${((stepIndex + 1) / this.steps.length) * 100}%"></div>
          </div>
          <div class="step-indicators">
            ${this.steps.map((step, index) => `
              <div class="step-indicator ${index <= stepIndex ? 'active' : ''} ${this.completedSteps.has(step.id) ? 'completed' : ''}">
                <div class="step-number">${index + 1}</div>
                <div class="step-label">${step.title}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Form Content -->
        <main class="character-form-content">
          ${this.renderStepContent()}
        </main>

        <!-- Navigation Footer -->
        <footer class="character-modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            id="prev-button"
            ${stepIndex === 0 ? 'disabled' : ''}>
            Previous
          </button>
          
          <div class="step-info">
            Step ${stepIndex + 1} of ${this.steps.length}
          </div>
          
          <button 
            type="button" 
            class="btn btn-primary" 
            id="next-button">
            ${stepIndex === this.steps.length - 1 ? 'Create Character' : 'Next'}
          </button>
        </footer>
      </div>
    `

    console.log('CharacterCreationModal: Modal HTML generated, length:', container.innerHTML.length)
    console.log('CharacterCreationModal: Step content preview:', this.renderStepContent().substring(0, 200))

    // Add event listeners for navigation buttons
    this.setupNavigationEvents()
    
    // Update next button state based on validation
    this.updateNavigationState()
    
    console.log('CharacterCreationModal: render() completed for step:', this.currentStep)
  }

  private setupNavigationEvents(): void {
    if (!this.modal) {
      console.error('CharacterCreationModal: setupNavigationEvents called but modal is null')
      return
    }

    console.log('CharacterCreationModal: Setting up navigation events')

    // Close button
    const closeBtn = this.modal.querySelector('#close-modal-btn') as HTMLButtonElement
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('CharacterCreationModal: Close button clicked')
        this.cancel()
      })
      console.log('CharacterCreationModal: Close button event listener added')
    } else {
      console.error('CharacterCreationModal: Close button not found')
    }

    // Previous button
    const prevBtn = this.modal.querySelector('#prev-button') as HTMLButtonElement
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        console.log('CharacterCreationModal: Previous button clicked')
        this.previousStep()
      })
      console.log('CharacterCreationModal: Previous button event listener added')
    } else {
      console.error('CharacterCreationModal: Previous button not found')
    }

    // Next button
    const nextBtn = this.modal.querySelector('#next-button') as HTMLButtonElement
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        console.log('CharacterCreationModal: Next button clicked')
        this.nextStep()
      })
      console.log('CharacterCreationModal: Next button event listener added')
    } else {
      console.error('CharacterCreationModal: Next button not found')
    }

    // Setup step-specific event listeners
    this.setupStepSpecificEvents()
  }

  private setupStepSpecificEvents(): void {
    if (!this.modal) return

    console.log('CharacterCreationModal: Setting up step-specific events for:', this.currentStep)

    switch (this.currentStep) {
      case 'basics':
        const nameInput = this.modal.querySelector('#character-name') as HTMLInputElement
        if (nameInput) {
          nameInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement
            console.log('CharacterCreationModal: Name input changed to:', target.value)
            this.updateCharacterData('name', target.value)
            // Hide suggestions when user starts typing
            this.hideNameSuggestions()
          })
          console.log('CharacterCreationModal: Name input event listener added')
        } else {
          console.error('CharacterCreationModal: Name input not found')
        }

        // Random name generator button
        const randomNameBtn = this.modal.querySelector('#random-name-btn') as HTMLButtonElement
        if (randomNameBtn) {
          randomNameBtn.addEventListener('click', () => {
            this.showNameSuggestions()
          })
          console.log('CharacterCreationModal: Random name button event listener added')
        }
        break

      case 'race':
        // Race selection will be handled by the race option clicks
        const raceOptions = this.modal.querySelectorAll('.race-option')
        console.log('CharacterCreationModal: Found', raceOptions.length, 'race options')
        raceOptions.forEach(option => {
          option.addEventListener('click', () => {
            const raceId = (option as HTMLElement).dataset.raceId
            console.log('CharacterCreationModal: Race option clicked:', raceId)
            if (raceId) {
              this.selectRace(raceId)
            }
          })
        })
        break

      case 'class':
        // Class selection will be handled by the class option clicks
        const classOptions = this.modal.querySelectorAll('.class-option')
        classOptions.forEach(option => {
          option.addEventListener('click', () => {
            const classId = (option as HTMLElement).dataset.classId
            if (classId) {
              this.selectClass(classId)
            }
          })
        })
        break

      case 'abilities':
        // Ability generation method selection
        const methodOptions = this.modal.querySelectorAll('.method-option-compact')
        methodOptions.forEach(option => {
          option.addEventListener('click', () => {
            const method = (option as HTMLElement).dataset.method
            if (method) {
              this.selectAbilityGenerationMethod(method)
            }
          })
        })

        // Point buy adjustment buttons
        const abilityBtns = this.modal.querySelectorAll('.ability-btn-compact')
        abilityBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const ability = (btn as HTMLElement).dataset.ability
            const change = parseInt((btn as HTMLElement).dataset.change || '0')
            if (ability) {
              this.adjustAbility(ability, change)
            }
          })
        })

        // Elite array selection
        const eliteSelects = this.modal.querySelectorAll('.ability-select-compact')
        eliteSelects.forEach(select => {
          select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement
            const ability = target.dataset.ability
            const value = parseInt(target.value)
            if (ability && !isNaN(value)) {
              this.assignEliteArrayScore(ability, value)
            }
          })
        })

        // Rolled abilities button
        const rollBtn = this.modal.querySelector('.roll-btn-compact') as HTMLButtonElement
        if (rollBtn) {
          rollBtn.addEventListener('click', () => {
            this.rollAbilities()
          })
        }

        // Rolled ability assignment
        const rolledSelects = this.modal.querySelectorAll('.ability-select-rolled-compact')
        rolledSelects.forEach(select => {
          select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement
            const ability = target.dataset.ability
            const value = parseInt(target.value)
            if (ability && !isNaN(value)) {
              this.assignRolledScore(ability, value)
            }
          })
        })
        break

      case 'skills':
        const skillCheckboxes = this.modal.querySelectorAll('.skill-checkbox input[type="checkbox"]')
        skillCheckboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            this.toggleSkill(target.value, target.checked)
          })
        })
        break

      case 'feats':
        const featCheckboxes = this.modal.querySelectorAll('.feat-option input[type="checkbox"]')
        featCheckboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            this.toggleFeat(target.value, target.checked)
          })
        })
        break

      case 'equipment':
        const equipmentCheckboxes = this.modal.querySelectorAll('.equipment-checkbox input[type="checkbox"]')
        equipmentCheckboxes.forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement
            this.toggleEquipment(target.value, target.checked)
          })
        })
        break
    }
  }

  private renderStepContent(): string {
    switch (this.currentStep) {
      case 'basics':
        return this.renderBasicsStep()
      case 'race':
        return this.renderRaceStep()
      case 'class':
        return this.renderClassStep()
      case 'abilities':
        return this.renderAbilitiesStep()
      case 'skills':
        return this.renderSkillsStep()
      case 'feats':
        return this.renderFeatsStep()
      case 'equipment':
        return this.renderEquipmentStep()
      case 'review':
        return this.renderReviewStep()
      default:
        return '<p>Invalid step</p>'
    }
  }

  private renderBasicsStep(): string {
    return `
      <div class="form-section">
        <div class="form-group">
          <label for="character-name" class="form-label">Character Name *</label>
          <div class="name-input-container">
            <input 
              type="text" 
              id="character-name" 
              class="form-input" 
              value="${this.characterData.name || ''}"
              placeholder="Enter your character's name"
              required
            />
            <button 
              type="button" 
              id="random-name-btn" 
              class="random-name-btn"
              title="Generate random name"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
            </button>
          </div>
          <div class="name-suggestions" id="name-suggestions" style="display: none;">
            <small class="suggestions-label">Suggestions:</small>
            <div class="suggestions-list" id="suggestions-list"></div>
          </div>
          <small class="form-help">Give your character a memorable name that fits the setting. Click the dice to generate random suggestions! (Names will match your selected race)</small>
        </div>
      </div>
    `
  }

  private renderRaceStep(): string {
    return `
      <div class="form-section">
        <div class="race-selection">
          ${this.raceData.map(race => `
            <div class="race-option ${this.characterData.race === race.id ? 'selected' : ''}" 
                 data-race-id="${race.id}">
              <div class="race-header">
                <h3 class="race-name">${race.name}</h3>
                <div class="race-size-speed">
                  <span class="race-size">${race.size}</span>
                  <span class="race-speed">${race.speed} ft. speed</span>
                </div>
              </div>
              <p class="race-description">${race.description}</p>
              <div class="race-traits">
                <h4>Racial Traits:</h4>
                <ul>
                  ${race.traits.map(trait => `<li>${trait}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderClassStep(): string {
    return `
      <div class="form-section">
        <div class="class-selection">
          ${this.classData.map(cls => `
            <div class="class-option ${this.characterData.characterClass === cls.id ? 'selected' : ''}" 
                 data-class-id="${cls.id}">
              <div class="class-header">
                <h3 class="class-name">${cls.name}</h3>
                <div class="class-hit-die">Hit Die: ${cls.hitDie}</div>
              </div>
              <p class="class-description">${cls.description}</p>
              <div class="class-stats">
                <div class="class-stat">
                  <label>Skill Points:</label>
                  <span>${cls.skillPoints} + Int modifier</span>
                </div>
                <div class="class-stat">
                  <label>Base Attack:</label>
                  <span>${cls.baseAttackBonus}</span>
                </div>
                <div class="class-saves">
                  <label>Saving Throws:</label>
                  <div class="saves-grid">
                    <span class="save-item save-${cls.saves.fortitude.toLowerCase()}">Fort: ${cls.saves.fortitude}</span>
                    <span class="save-item save-${cls.saves.reflex.toLowerCase()}">Ref: ${cls.saves.reflex}</span>
                    <span class="save-item save-${cls.saves.will.toLowerCase()}">Will: ${cls.saves.will}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderAbilitiesStep(): string {
    const abilities = this.characterData.abilities!
    const method = this.characterData.abilityGenerationMethod || 'pointBuy'
    
    return `
      <div class="form-section">
        <div class="abilities-section-split">
          <!-- Left Panel: Method Selection -->
          <div class="ability-method-panel">
            <h3>Generation Method</h3>
            <div class="method-options-compact">
              <div class="method-option-compact ${method === 'pointBuy' ? 'selected' : ''}" data-method="pointBuy">
                <div class="method-header-compact">
                  <h4>Point Buy</h4>
                  <span class="method-badge">Balanced</span>
                </div>
                <p class="method-description-compact">Spend 27 points to customize ability scores.</p>
              </div>
              
              <div class="method-option-compact ${method === 'eliteArray' ? 'selected' : ''}" data-method="eliteArray">
                <div class="method-header-compact">
                  <h4>Elite Array</h4>
                  <span class="method-badge">Quick</span>
                </div>
                <p class="method-description-compact">Assign fixed values: 15, 14, 13, 12, 10, 8.</p>
              </div>
              
              <div class="method-option-compact ${method === 'roll4d6' ? 'selected' : ''}" data-method="roll4d6">
                <div class="method-header-compact">
                  <h4>Roll 4d6</h4>
                  <span class="method-badge">Random</span>
                </div>
                <p class="method-description-compact">Roll dice for random ability scores.</p>
              </div>
            </div>
            
            ${this.renderMethodDetails(method)}
          </div>
          
          <!-- Right Panel: Ability Scores Assignment -->
          <div class="ability-assignment-panel">
            <h3>Ability Scores</h3>
            ${this.renderAbilityScoresForMethod(method, abilities)}
          </div>
        </div>
      </div>
    `
  }

  private renderMethodDetails(method: string): string {
    switch (method) {
      case 'pointBuy':
        return `
          <div class="method-details-panel">
            <h5>Point Buy Rules:</h5>
            <ul class="rules-list">
              <li>Start with 8 in each ability</li>
              <li>Scores 8-13 cost 1 point each</li>
              <li>Scores 14-15 cost 2 points each</li>
              <li>Total budget: 27 points</li>
            </ul>
          </div>
        `
      case 'eliteArray':
        return `
          <div class="method-details-panel">
            <h5>Elite Array Values:</h5>
            <div class="elite-preview">
              <span class="elite-value">15</span>
              <span class="elite-value">14</span>
              <span class="elite-value">13</span>
              <span class="elite-value">12</span>
              <span class="elite-value">10</span>
              <span class="elite-value">8</span>
            </div>
            <p class="elite-note">Assign these six values to your abilities</p>
          </div>
        `
      case 'roll4d6':
        return `
          <div class="method-details-panel">
            <h5>Rolling Rules:</h5>
            <ul class="rules-list">
              <li>Roll 4d6 six times</li>
              <li>Drop lowest die each roll</li>
              <li>Assign results to abilities</li>
              <li>High variance possible</li>
            </ul>
          </div>
        `
      default:
        return ''
    }
  }

  private renderAbilityScoresForMethod(method: string, abilities: Record<string, number>): string {
    switch (method) {
      case 'pointBuy':
        return this.renderPointBuyAbilities(abilities)
      case 'eliteArray':
        return this.renderEliteArrayAbilities(abilities)
      case 'roll4d6':
        return this.renderRolledAbilities(abilities)
      default:
        return this.renderPointBuyAbilities(abilities)
    }
  }

  private renderPointBuyAbilities(abilities: Record<string, number>): string {
    const pointBuy = this.calculatePointBuyCost()
    
    return `
      <div class="point-buy-compact">
        <div class="points-tracker">
          <span class="points-label">Points Remaining:</span>
          <span class="points-value ${pointBuy.remaining < 0 ? 'negative' : ''}">${pointBuy.remaining}</span>
        </div>
        
        <div class="abilities-grid-compact">
          ${Object.entries(abilities).map(([ability, value]) => `
            <div class="ability-row">
              <label class="ability-label-compact">${this.capitalizeFirst(ability)}</label>
              <div class="ability-controls-compact">
                <button 
                  type="button" 
                  class="ability-btn-compact" 
                  data-ability="${ability}"
                  data-change="-1"
                  ${value <= 8 ? 'disabled' : ''}>
                  −
                </button>
                <div class="ability-display-compact">
                  <span class="score-compact">${value}</span>
                  <span class="modifier-compact">${this.getModifier(value) >= 0 ? '+' : ''}${this.getModifier(value)}</span>
                </div>
                <button 
                  type="button" 
                  class="ability-btn-compact" 
                  data-ability="${ability}"
                  data-change="1"
                  ${value >= 15 || pointBuy.remaining <= 0 ? 'disabled' : ''}>
                  +
                </button>
              </div>
              <small class="ability-cost-compact">${this.getAbilityCost(value)}pts</small>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderEliteArrayAbilities(abilities: Record<string, number>): string {
    const eliteArray = [15, 14, 13, 12, 10, 8]
    const usedValues = Object.values(abilities) as number[]
    
    return `
      <div class="elite-array-compact">
        <div class="available-values">
          <small class="available-label">Available Values:</small>
          <div class="value-pool-compact">
            ${eliteArray.map(score => {
              const isUsed = usedValues.includes(score)
              return `<span class="pool-value ${isUsed ? 'used' : 'available'}" data-score="${score}">${score}</span>`
            }).join('')}
          </div>
        </div>
        
        <div class="abilities-grid-compact">
          ${Object.entries(abilities).map(([ability, value]) => `
            <div class="ability-row">
              <label class="ability-label-compact">${this.capitalizeFirst(ability)}</label>
              <div class="ability-assignment-compact">
                <select class="ability-select-compact" data-ability="${ability}">
                  <option value="">--</option>
                  ${eliteArray.map(score => 
                    `<option value="${score}" ${value === score ? 'selected' : ''}>${score}</option>`
                  ).join('')}
                </select>
                <div class="ability-display-compact">
                  <span class="score-compact">${value || '--'}</span>
                  <span class="modifier-compact">${value ? (this.getModifier(value) >= 0 ? '+' : '') + this.getModifier(value) : '--'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderRolledAbilities(abilities: Record<string, number>): string {
    const rolledValues = this.characterData.rolledAbilities || []
    const hasRolled = rolledValues.length > 0
    
    return `
      <div class="rolled-abilities-compact">
        <div class="roll-controls-compact">
          <button type="button" class="roll-btn-compact ${hasRolled ? 'reroll' : ''}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5M7,13A2,2 0 0,0 5,15A2,2 0 0,0 7,17A2,2 0 0,0 9,15A2,2 0 0,0 7,13M17,5A2,2 0 0,0 15,7A2,2 0 0,0 17,9A2,2 0 0,0 19,7A2,2 0 0,0 17,5M17,13A2,2 0 0,0 15,15A2,2 0 0,0 17,17A2,2 0 0,0 19,15A2,2 0 0,0 17,13Z"/>
            </svg>
            ${hasRolled ? 'Re-roll' : 'Roll 4d6'}
          </button>
        </div>
        
        ${hasRolled ? `
          <div class="rolled-values">
            <small class="available-label">Rolled Values:</small>
            <div class="value-pool-compact">
              ${rolledValues.map((score, index) => {
                const isUsed = Object.values(abilities).includes(score)
                return `<span class="pool-value ${isUsed ? 'used' : 'available'}" data-score="${score}" data-roll-index="${index}">${score}</span>`
              }).join('')}
            </div>
          </div>
          
          <div class="abilities-grid-compact">
            ${Object.entries(abilities).map(([ability, value]) => `
              <div class="ability-row">
                <label class="ability-label-compact">${this.capitalizeFirst(ability)}</label>
                <div class="ability-assignment-compact">
                  <select class="ability-select-rolled-compact" data-ability="${ability}">
                    <option value="">--</option>
                    ${rolledValues.map((score, index) => 
                      `<option value="${score}" data-roll-index="${index}" ${value === score ? 'selected' : ''}>${score}</option>`
                    ).join('')}
                  </select>
                  <div class="ability-display-compact">
                    <span class="score-compact">${value || '--'}</span>
                    <span class="modifier-compact">${value ? (this.getModifier(value) >= 0 ? '+' : '') + this.getModifier(value) : '--'}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<div class="roll-prompt-compact">Click "Roll 4d6" to generate ability scores</div>'}
      </div>
    `
  }

  private renderSkillsStep(): string {
    const availableSkills = [
      'Appraise', 'Balance', 'Bluff', 'Climb', 'Concentration', 'Craft', 'Decipher Script',
      'Diplomacy', 'Disable Device', 'Disguise', 'Escape Artist', 'Forgery', 'Gather Information',
      'Handle Animal', 'Heal', 'Hide', 'Intimidate', 'Jump', 'Knowledge', 'Listen', 'Move Silently',
      'Open Lock', 'Perform', 'Profession', 'Ride', 'Search', 'Sense Motive', 'Sleight of Hand',
      'Spellcraft', 'Spot', 'Survival', 'Swim', 'Tumble', 'Use Magic Device', 'Use Rope'
    ]

    return `
      <div class="form-section">
        <div class="skills-section">
          <h3>Select Starting Skills</h3>
          <p>Choose skills that complement your character class and background.</p>
          
          <div class="skills-grid">
            ${availableSkills.map(skill => `
              <div class="skill-option">
                <label class="skill-checkbox">
                  <input 
                    type="checkbox" 
                    value="${skill}"
                    ${this.characterData.skills?.includes(skill) ? 'checked' : ''}
                  />
                  <span class="skill-name">${skill}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  private renderFeatsStep(): string {
    return `
      <div class="form-section">
        <div class="feats-section">
          <h3>Select Feats</h3>
          <p>Choose feats to enhance your character's abilities. Humans get an extra feat at 1st level.</p>
          
          <div class="feats-grid">
            ${this.featData.map(feat => `
              <div class="feat-card ${this.characterData.feats?.includes(feat.name) ? 'selected' : ''}">
                <label class="feat-option">
                  <input 
                    type="checkbox" 
                    value="${feat.name}"
                    ${this.characterData.feats?.includes(feat.name) ? 'checked' : ''}
                  />
                  <div class="feat-content">
                    <h4 class="feat-name">${feat.name} <span class="feat-type">[${feat.type}]</span></h4>
                    <p class="feat-description">${feat.description}</p>
                    ${feat.prerequisites.length > 0 ? 
                      `<div class="feat-prerequisites">
                        <strong>Prerequisites:</strong> ${feat.prerequisites.join(', ')}
                      </div>` : 
                      '<div class="feat-no-prereq">No prerequisites</div>'
                    }
                  </div>
                </label>
              </div>
            `).join('')}
          </div>
          
          <div class="feats-info">
            <p><strong>Selected Feats:</strong> ${this.characterData.feats?.length || 0}</p>
            <p class="feat-note">Most characters get 1 feat at 1st level. Humans get a bonus feat.</p>
          </div>
        </div>
      </div>
    `
  }

  private renderEquipmentStep(): string {
    const equipment = [
      'Backpack', 'Bedroll', 'Belt Pouch', 'Blanket', 'Candles (10)', 'Chain (10 ft.)',
      'Chalk (1 piece)', 'Crowbar', 'Dagger', 'Flint and Steel', 'Grappling Hook',
      'Hammer', 'Ink (1 vial)', 'Inkpen', 'Lantern (Bullseye)', 'Lock (Simple)',
      'Manacles', 'Mirror (Small Steel)', 'Oil (1 pint)', 'Paper (Sheet)', 'Pick (Miner\'s)',
      'Piton', 'Pole (10-foot)', 'Rations (Trail/Per Day)', 'Rope (Hemp/50 ft.)',
      'Sack', 'Sealing Wax', 'Sewing Needle', 'Signal Whistle', 'Signet Ring',
      'Sledge', 'Soap (Per lb.)', 'Spade or Shovel', 'Tent', 'Torch', 'Vial', 'Waterskin'
    ]

    return `
      <div class="form-section">
        <div class="equipment-section">
          <h3>Starting Equipment</h3>
          <p>Select basic equipment for your adventure. You'll start with class-specific gear automatically.</p>
          
          <div class="equipment-grid">
            ${equipment.map(item => `
              <div class="equipment-option">
                <label class="equipment-checkbox">
                  <input 
                    type="checkbox" 
                    value="${item}"
                    ${this.characterData.equipment?.includes(item) ? 'checked' : ''}
                  />
                  <span class="equipment-name">${item}</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  private renderReviewStep(): string {
    const race = this.raceData.find(r => r.id === this.characterData.race)
    const characterClass = this.classData.find(c => c.id === this.characterData.characterClass)
    
    return `
      <div class="form-section">
        <div class="character-review">
          <h3>Character Summary</h3>
          
          <div class="review-grid">
            <div class="review-section">
              <h4>Basic Information</h4>
              <div class="review-item">
                <label>Name:</label>
                <span>${this.characterData.name}</span>
              </div>
              <div class="review-item">
                <label>Race:</label>
                <span>${race?.name}</span>
              </div>
              <div class="review-item">
                <label>Class:</label>
                <span>${characterClass?.name}</span>
              </div>
            </div>
            
            <div class="review-section">
              <h4>Ability Scores</h4>
              ${Object.entries(this.characterData.abilities!).map(([ability, value]) => `
                <div class="review-item">
                  <label>${this.capitalizeFirst(ability)}:</label>
                  <span>${value} (${this.getModifier(value) >= 0 ? '+' : ''}${this.getModifier(value)})</span>
                </div>
              `).join('')}
            </div>
            
            <div class="review-section">
              <h4>Skills Selected</h4>
              <div class="review-list">
                ${this.characterData.skills?.length ? 
                  this.characterData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') :
                  '<span class="no-items">No skills selected</span>'
                }
              </div>
            </div>
            
            <div class="review-section">
              <h4>Equipment</h4>
              <div class="review-list">
                ${this.characterData.equipment?.length ?
                  this.characterData.equipment.map(item => `<span class="equipment-tag">${item}</span>`).join('') :
                  '<span class="no-items">No additional equipment selected</span>'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Public methods for UI interaction
  public updateCharacterData(field: string, value: any): void {
    (this.characterData as any)[field] = value
    this.updateNavigationState()
  }

  public selectRace(raceId: string): void {
    this.characterData.race = raceId
    this.render()
    this.updateNavigationState()
    
    // Update name suggestions if they are currently visible
    this.updateNameSuggestionsForRace()
  }

  public selectClass(classId: string): void {
    this.characterData.characterClass = classId
    this.render()
    this.updateNavigationState()
  }

  public adjustAbility(ability: string, change: number): void {
    const abilities = this.characterData.abilities!
    const currentValue = abilities[ability as keyof typeof abilities]
    const newValue = Math.max(8, Math.min(15, currentValue + change))
    
    const pointBuy = this.calculatePointBuyCost()
    const newCost = this.getAbilityCost(newValue)
    const oldCost = this.getAbilityCost(currentValue)
    const costDifference = newCost - oldCost
    
    if (pointBuy.remaining >= costDifference) {
      abilities[ability as keyof typeof abilities] = newValue
      this.render()
    }
  }

  public selectAbilityGenerationMethod(method: string): void {
    this.characterData.abilityGenerationMethod = method as 'pointBuy' | 'eliteArray' | 'roll4d6'
    
    // Reset abilities based on method
    switch (method) {
      case 'pointBuy':
        this.characterData.abilities = {
          strength: 8,
          dexterity: 8,
          constitution: 8,
          intelligence: 8,
          wisdom: 8,
          charisma: 8
        }
        break
      case 'eliteArray':
        this.characterData.abilities = {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        }
        break
      case 'roll4d6':
        this.characterData.abilities = {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        }
        this.characterData.rolledAbilities = []
        break
    }
    this.render()
  }

  public assignEliteArrayScore(ability: string, value: number): void {
    if (!this.characterData.abilities) return

    // Check if this value is already assigned to another ability
    const currentAssignments = Object.entries(this.characterData.abilities)
    for (const [otherAbility, otherValue] of currentAssignments) {
      if (otherAbility !== ability && otherValue === value) {
        // Swap the values
        this.characterData.abilities[otherAbility as keyof typeof this.characterData.abilities] = 
          this.characterData.abilities[ability as keyof typeof this.characterData.abilities]
        break
      }
    }

    this.characterData.abilities[ability as keyof typeof this.characterData.abilities] = value
    this.render()
  }

  public rollAbilities(): void {
    // Roll 4d6 drop lowest six times
    const rolledAbilities: number[] = []
    for (let i = 0; i < 6; i++) {
      const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      rolls.sort((a, b) => b - a) // Sort descending
      const sum = rolls.slice(0, 3).reduce((total, roll) => total + roll, 0) // Take top 3
      rolledAbilities.push(sum)
    }

    this.characterData.rolledAbilities = rolledAbilities
    // Reset ability assignments
    this.characterData.abilities = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    }
    this.render()
  }

  public assignRolledScore(ability: string, value: number): void {
    if (!this.characterData.abilities) return

    // Check if this value is already assigned to another ability
    const currentAssignments = Object.entries(this.characterData.abilities)
    for (const [otherAbility, otherValue] of currentAssignments) {
      if (otherAbility !== ability && otherValue === value) {
        // Swap the values
        this.characterData.abilities[otherAbility as keyof typeof this.characterData.abilities] = 
          this.characterData.abilities[ability as keyof typeof this.characterData.abilities]
        break
      }
    }

    this.characterData.abilities[ability as keyof typeof this.characterData.abilities] = value
    this.render()
  }

  public toggleSkill(skill: string, selected: boolean): void {
    if (!this.characterData.skills) {
      this.characterData.skills = []
    }
    
    if (selected && !this.characterData.skills.includes(skill)) {
      this.characterData.skills.push(skill)
    } else if (!selected) {
      this.characterData.skills = this.characterData.skills.filter(s => s !== skill)
    }
  }

  public toggleEquipment(equipment: string, selected: boolean): void {
    if (!this.characterData.equipment) {
      this.characterData.equipment = []
    }
    
    if (selected && !this.characterData.equipment.includes(equipment)) {
      this.characterData.equipment.push(equipment)
    } else if (!selected) {
      this.characterData.equipment = this.characterData.equipment.filter(e => e !== equipment)
    }
  }

  private showNameSuggestions(): void {
    // Determine race and gender for name generation
    const race = this.characterData.race || 'human'
    // For now, we'll generate both male and female names
    const maleSuggestions = FantasyNameGenerator.generateSuggestions(3, race, 'male')
    const femaleSuggestions = FantasyNameGenerator.generateSuggestions(3, race, 'female')
    const allSuggestions = [...maleSuggestions, ...femaleSuggestions]
    
    // Show suggestions container
    const suggestionsContainer = this.modal?.querySelector('#name-suggestions') as HTMLElement
    const suggestionsList = this.modal?.querySelector('#suggestions-list')
    
    if (suggestionsContainer && suggestionsList) {
      // Clear previous suggestions
      suggestionsList.innerHTML = ''
      
      // Add suggestion buttons
      allSuggestions.forEach(name => {
        const suggestionBtn = document.createElement('button')
        suggestionBtn.type = 'button'
        suggestionBtn.className = 'name-suggestion-btn'
        suggestionBtn.textContent = name
        suggestionBtn.addEventListener('click', () => {
          this.selectSuggestedName(name)
        })
        suggestionsList.appendChild(suggestionBtn)
      })
      
      // Show the suggestions container
      suggestionsContainer.style.display = 'block'
    }
  }

  private selectSuggestedName(name: string): void {
    // Update the character data
    this.updateCharacterData('name', name)
    
    // Update the input field
    const nameInput = this.modal?.querySelector('#character-name') as HTMLInputElement
    if (nameInput) {
      nameInput.value = name
    }
    
    // Hide suggestions
    const suggestionsContainer = this.modal?.querySelector('#name-suggestions') as HTMLElement
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none'
    }
  }

  private updateNameSuggestionsForRace(): void {
    // Only update if suggestions are currently visible
    const suggestionsContainer = this.modal?.querySelector('#name-suggestions') as HTMLElement
    if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
      this.showNameSuggestions()
    }
  }

  private hideNameSuggestions(): void {
    const suggestionsContainer = this.modal?.querySelector('#name-suggestions') as HTMLElement
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none'
    }
  }

  public toggleFeat(featName: string, selected: boolean): void {
    if (!this.characterData.feats) {
      this.characterData.feats = []
    }
    
    if (selected && !this.characterData.feats.includes(featName)) {
      // Check if feat prerequisites are met (for now, allow all selections)
      // TODO: Add prerequisite validation
      this.characterData.feats.push(featName)
      console.log('CharacterCreationModal: Added feat:', featName)
    } else if (!selected) {
      this.characterData.feats = this.characterData.feats.filter(f => f !== featName)
      console.log('CharacterCreationModal: Removed feat:', featName)
    }

    // Update the feat count display
    const featsInfo = this.modal?.querySelector('.feats-info p')
    if (featsInfo) {
      featsInfo.textContent = `Selected Feats: ${this.characterData.feats.length}`
    }

    // Update visual selection
    const featCards = this.modal?.querySelectorAll('.feat-card')
    featCards?.forEach(card => {
      const checkbox = card.querySelector('input[type="checkbox"]') as HTMLInputElement
      if (checkbox && checkbox.value === featName) {
        card.classList.toggle('selected', selected)
      }
    })
  }

  public nextStep(): void {
    const currentIndex = this.steps.findIndex(step => step.id === this.currentStep)
    
    if (currentIndex === this.steps.length - 1) {
      // Final step - create character
      this.createCharacter()
    } else {
      // Always allow progression, but log validation issues
      const validation = this.validateCurrentStep()
      if (!validation.isValid) {
        console.warn('CharacterCreationModal: Validation issues on step', this.currentStep, ':', validation.errors)
        // Show a brief warning but still proceed
        const warningMessage = Object.values(validation.errors).join(', ')
        console.log('CharacterCreationModal: Proceeding despite validation issues:', warningMessage)
      }
      
      // Always mark step as completed and proceed
      this.completedSteps.add(this.currentStep)
      this.currentStep = this.steps[currentIndex + 1].id
      this.render()
    }
  }

  public previousStep(): void {
    const currentIndex = this.steps.findIndex(step => step.id === this.currentStep)
    if (currentIndex > 0) {
      this.currentStep = this.steps[currentIndex - 1].id
      this.render()
    }
  }

  public cancel(): void {
    if (this.onCancel) {
      this.onCancel()
    }
    this.hide()
  }

  private createCharacter(): void {
    console.log('CharacterCreationModal: Creating character with data:', this.characterData)
    
    // Always create character, even with validation issues
    // Apply defaults for missing required fields
    const character = { ...this.characterData } as CharacterData
    
    // Ensure required fields have defaults
    if (!character.name?.trim()) {
      character.name = 'Unnamed Character'
      console.warn('CharacterCreationModal: No name provided, using default')
    }
    
    if (!character.race) {
      character.race = 'human'
      console.warn('CharacterCreationModal: No race selected, defaulting to human')
    }
    
    if (!character.characterClass) {
      character.characterClass = 'fighter'
      console.warn('CharacterCreationModal: No class selected, defaulting to fighter')
    }
    
    // Ensure abilities are properly initialized
    if (!character.abilities) {
      character.abilities = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
      console.warn('CharacterCreationModal: No abilities set, using defaults')
    }
    
    // Ensure arrays are initialized
    character.skills = character.skills || []
    character.equipment = character.equipment || []
    character.feats = character.feats || []
    
    // Calculate final hit points with error handling
    try {
      const characterClass = this.classData.find(c => c.id === character.characterClass)
      const conModifier = this.getModifier(character.abilities.constitution)
      const hitDieSize = parseInt(characterClass?.hitDie?.substring(1) || '8')
      character.hitPoints = Math.max(1, hitDieSize + conModifier) // Ensure at least 1 HP
      console.log('CharacterCreationModal: Calculated HP:', character.hitPoints)
    } catch (error) {
      console.error('CharacterCreationModal: Error calculating HP, using default:', error)
      character.hitPoints = 8 // Default HP
    }
    
    // Always complete character creation
    console.log('CharacterCreationModal: Final character data:', character)
    
    if (this.onComplete) {
      try {
        this.onComplete(character)
        console.log('CharacterCreationModal: Character creation callback completed successfully')
      } catch (error) {
        console.error('CharacterCreationModal: Error in completion callback:', error)
      }
    }
    
    this.hide()
    console.log('CharacterCreationModal: Character creation process completed')
  }

  private validateCurrentStep(): FormValidation {
    const errors: Record<string, string> = {}
    
    switch (this.currentStep) {
      case 'basics':
        if (!this.characterData.name?.trim()) {
          errors.name = 'Character name is required'
        }
        break
      case 'race':
        if (!this.characterData.race) {
          errors.race = 'Please select a race'
        }
        break
      case 'class':
        if (!this.characterData.characterClass) {
          errors.characterClass = 'Please select a class'
        }
        break
      case 'abilities':
        const pointBuy = this.calculatePointBuyCost()
        if (pointBuy.remaining !== 0) {
          errors.abilities = 'You must spend all ability points'
        }
        break
    }
    
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  private validateAllSteps(): FormValidation {
    const errors: Record<string, string> = {}
    
    if (!this.characterData.name?.trim()) errors.name = 'Name required'
    if (!this.characterData.race) errors.race = 'Race required'
    if (!this.characterData.characterClass) errors.characterClass = 'Class required'
    
    const pointBuy = this.calculatePointBuyCost()
    if (pointBuy.remaining !== 0) errors.abilities = 'Ability points must be spent'
    
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  // No-op reference to avoid unused function warning in some build configurations
  private _referValidateAllSteps = () => { void this.validateAllSteps }

  private updateNavigationState(): void {
    const nextButton = this.modal?.querySelector('#next-button') as HTMLButtonElement
    if (nextButton) {
      // Always allow progression - never disable the Next button
      // This makes character creation more user-friendly and robust
      nextButton.disabled = false
      
      // Optional: Visual indication of validation issues without blocking
      const validation = this.validateCurrentStep()
      if (!validation.isValid) {
        nextButton.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)'
        nextButton.title = 'Some fields may need attention, but you can still proceed'
      } else {
        nextButton.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        nextButton.title = 'Continue to next step'
      }
    }
  }

  private calculatePointBuyCost(): { total: number; remaining: number } {
    const abilities = this.characterData.abilities!
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

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// Global instance for HTML onclick handlers
declare global {
  interface Window {
    characterCreationModal: CharacterCreationModal
  }
}

// Default export for module usage
export default CharacterCreationModal