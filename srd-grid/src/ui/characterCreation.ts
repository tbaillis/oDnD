import type { Character, AbilityScores, ClassType } from '../game/character'
import { createCharacter, sampleRaces, getAbilityModifier, validateCharacterPrerequisites } from '../game/character'
import { sampleWeapons, sampleArmor } from '../game/equipment'

// Character creation state
interface CharacterCreationState {
  step: 'race' | 'class' | 'abilities' | 'skills' | 'equipment' | 'review'
  name: string
  selectedRace: string
  selectedClass: ClassType | null
  abilityScores: AbilityScores
  remainingPoints: number
  selectedEquipment: {
    weapons: string[]
    armor?: string
  }
  character: Character | null
}

export class CharacterCreationUI {
  private container: HTMLElement
  private state: CharacterCreationState
  private onComplete?: (character: Character) => void

  constructor(parent: HTMLElement) {
    this.state = {
      step: 'race',
      name: '',
      selectedRace: 'human',
      selectedClass: null,
      abilityScores: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
      remainingPoints: 27, // Point-buy system (25 base + 2 for human)
      selectedEquipment: { weapons: [] },
      character: null
    }

    this.container = document.createElement('div')
    this.container.id = 'character-creation'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `
    
    parent.appendChild(this.container)
    this.render()
  }

  show(onComplete?: (character: Character) => void) {
    this.onComplete = onComplete
    this.container.style.display = 'flex'
  }

  hide() {
    this.container.style.display = 'none'
  }

  private render() {
    const content = document.createElement('div')
    content.style.cssText = `
      background: #1a1a2e;
      border: 2px solid #333;
      border-radius: 8px;
      width: 90vw;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      color: #ddd;
    `

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #333; padding-bottom: 16px;">
        <h2 style="margin: 0; color: #fff;">Create New Character</h2>
        <button id="close-creation" style="background: none; border: none; color: #999; font-size: 24px; cursor: pointer; padding: 4px 8px;">×</button>
      </div>
      
      ${this.renderStepIndicator()}
      ${this.renderCurrentStep()}
      ${this.renderNavigation()}
    `

    this.container.innerHTML = ''
    this.container.appendChild(content)

    this.attachEventListeners()
  }

  private renderStepIndicator(): string {
    const steps = [
      { key: 'race', label: 'Race' },
      { key: 'class', label: 'Class' },
      { key: 'abilities', label: 'Abilities' },
      { key: 'skills', label: 'Skills' },
      { key: 'equipment', label: 'Equipment' },
      { key: 'review', label: 'Review' }
    ]

    const currentIndex = steps.findIndex(s => s.key === this.state.step)

    return `
      <div style="display: flex; justify-content: center; margin-bottom: 32px;">
        ${steps.map((step, index) => `
          <div style="
            display: flex;
            align-items: center;
            color: ${index <= currentIndex ? '#7ed321' : '#666'};
            font-weight: ${index === currentIndex ? 'bold' : 'normal'};
          ">
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: ${index < currentIndex ? '#7ed321' : (index === currentIndex ? '#f5a623' : '#333')};
              color: ${index <= currentIndex ? '#000' : '#666'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
            ">${index + 1}</div>
            <span style="margin-left: 8px;">${step.label}</span>
            ${index < steps.length - 1 ? '<div style="width: 40px; height: 2px; background: #333; margin: 0 16px;"></div>' : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  private renderCurrentStep(): string {
    switch (this.state.step) {
      case 'race': return this.renderRaceSelection()
      case 'class': return this.renderClassSelection()
      case 'abilities': return this.renderAbilityScores()
      case 'skills': return this.renderSkillSelection()
      case 'equipment': return this.renderEquipmentSelection()
      case 'review': return this.renderReview()
      default: return ''
    }
  }

  private renderRaceSelection(): string {
    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Choose Your Race</h3>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px;">Character Name:</label>
          <input type="text" id="character-name" value="${this.state.name}" placeholder="Enter character name" style="
            width: 100%;
            padding: 8px;
            background: #2a2a3e;
            border: 1px solid #444;
            border-radius: 4px;
            color: #ddd;
            font-size: 16px;
          ">
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          ${Object.entries(sampleRaces).map(([key, race]) => `
            <div class="race-option" data-race="${key}" style="
              border: 2px solid ${this.state.selectedRace === key ? '#7ed321' : '#444'};
              border-radius: 8px;
              padding: 16px;
              cursor: pointer;
              background: ${this.state.selectedRace === key ? 'rgba(126, 211, 33, 0.1)' : 'rgba(0,0,0,0.2)'};
              transition: all 0.2s;
            ">
              <h4 style="margin: 0 0 8px 0; color: ${this.state.selectedRace === key ? '#7ed321' : '#fff'};">${race.name}</h4>
              <div style="font-size: 13px; color: #aaa; margin-bottom: 12px;">
                Size: ${race.size} • Speed: ${race.baseSpeed}ft
              </div>
              <div style="font-size: 12px; color: #ccc;">
                <div><strong>Ability Adjustments:</strong></div>
                ${Object.entries(race.abilityAdjustments).length > 0 
                  ? Object.entries(race.abilityAdjustments).map(([ability, mod]) => 
                      `<span style="color: ${mod > 0 ? '#7ed321' : '#e94b3c'}">${ability} ${mod > 0 ? '+' : ''}${mod}</span>`
                    ).join(', ')
                  : '<span style="color: #aaa">None</span>'
                }
              </div>
              <div style="font-size: 12px; color: #ccc; margin-top: 8px;">
                <div><strong>Special:</strong> ${race.specialAbilities.join(', ') || 'None'}</div>
                ${race.bonusSkillPoints > 0 ? `<div>+${race.bonusSkillPoints} skill points</div>` : ''}
                ${race.bonusFeats > 0 ? `<div>+${race.bonusFeats} bonus feats</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderClassSelection(): string {
    const classes: { key: ClassType, name: string, description: string, hitDie: string, skills: string }[] = [
      { key: 'fighter', name: 'Fighter', description: 'Masters of weapons and armor', hitDie: 'd10', skills: '2 + Int' },
      { key: 'wizard', name: 'Wizard', description: 'Arcane spellcasters who study magic', hitDie: 'd4', skills: '2 + Int' },
      { key: 'cleric', name: 'Cleric', description: 'Divine spellcasters and healers', hitDie: 'd8', skills: '2 + Int' },
      { key: 'rogue', name: 'Rogue', description: 'Skilled scouts and sneaks', hitDie: 'd6', skills: '8 + Int' },
      { key: 'ranger', name: 'Ranger', description: 'Skilled hunters and trackers', hitDie: 'd8', skills: '6 + Int' },
      { key: 'barbarian', name: 'Barbarian', description: 'Fierce warriors who rage in battle', hitDie: 'd12', skills: '4 + Int' },
      { key: 'bard', name: 'Bard', description: 'Versatile performers and spellcasters', hitDie: 'd6', skills: '6 + Int' },
      { key: 'druid', name: 'Druid', description: 'Nature priests with wild shape', hitDie: 'd8', skills: '4 + Int' },
      { key: 'monk', name: 'Monk', description: 'Martial artists with inner power', hitDie: 'd8', skills: '4 + Int' },
      { key: 'paladin', name: 'Paladin', description: 'Holy warriors with divine power', hitDie: 'd10', skills: '2 + Int' },
      { key: 'sorcerer', name: 'Sorcerer', description: 'Natural-born arcane spellcasters', hitDie: 'd4', skills: '2 + Int' }
    ]

    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Choose Your Class</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          ${classes.map(cls => `
            <div class="class-option" data-class="${cls.key}" style="
              border: 2px solid ${this.state.selectedClass === cls.key ? '#7ed321' : '#444'};
              border-radius: 8px;
              padding: 16px;
              cursor: pointer;
              background: ${this.state.selectedClass === cls.key ? 'rgba(126, 211, 33, 0.1)' : 'rgba(0,0,0,0.2)'};
              transition: all 0.2s;
            ">
              <h4 style="margin: 0 0 8px 0; color: ${this.state.selectedClass === cls.key ? '#7ed321' : '#fff'};">${cls.name}</h4>
              <div style="font-size: 13px; color: #ccc; margin-bottom: 8px;">${cls.description}</div>
              <div style="font-size: 12px; color: #aaa;">
                <div>Hit Die: ${cls.hitDie}</div>
                <div>Skill Points: ${cls.skills}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderAbilityScores(): string {
    const abilities: (keyof AbilityScores)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    
    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Set Ability Scores</h3>
        <div style="margin-bottom: 16px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px;">
          <div style="color: #f5a623; font-weight: bold;">Point Buy System</div>
          <div style="font-size: 13px; color: #ccc;">
            You have <strong style="color: #7ed321;">${this.state.remainingPoints}</strong> points remaining.
            Base cost: 8=0pts, 9=1pt, 10=2pts, 11=3pts, 12=4pts, 13=5pts, 14=6pts, 15=8pts
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          ${abilities.map(ability => {
            const score = this.state.abilityScores[ability]
            const modifier = getAbilityModifier(score)
            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`
            
            return `
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; text-align: center;">
                <h4 style="margin: 0 0 12px 0; color: #fff;">${ability}</h4>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                  <button class="ability-btn" data-ability="${ability}" data-action="decrease" style="
                    width: 30px; height: 30px; border: none; background: #e94b3c; color: white; border-radius: 50%; cursor: pointer;
                    ${score <= 8 ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                  ">−</button>
                  <div style="font-size: 24px; font-weight: bold; color: #fff; min-width: 40px;">${score}</div>
                  <button class="ability-btn" data-ability="${ability}" data-action="increase" style="
                    width: 30px; height: 30px; border: none; background: #7ed321; color: white; border-radius: 50%; cursor: pointer;
                    ${score >= 15 || this.state.remainingPoints <= 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                  ">+</button>
                </div>
                <div style="font-size: 14px; color: #ccc;">Modifier: ${modStr}</div>
                <div style="font-size: 12px; color: #aaa;">Cost: ${this.getAbilityCost(score)}pts</div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    `
  }

  private renderSkillSelection(): string {
    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Skills</h3>
        <div style="text-align: center; color: #aaa; font-style: italic; padding: 40px;">
          Skill selection will be implemented with class-specific skill lists.<br>
          For now, default skills will be assigned automatically.
        </div>
      </div>
    `
  }

  private renderEquipmentSelection(): string {
    const weapons = Object.entries(sampleWeapons).slice(0, 6) // Show first 6 weapons
    const armors = Object.entries(sampleArmor)

    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Starting Equipment</h3>
        
        <div style="margin-bottom: 24px;">
          <h4 style="color: #fff; margin-bottom: 12px;">Weapons</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            ${weapons.map(([key, weapon]) => `
              <div class="weapon-option" data-weapon="${key}" style="
                border: 1px solid ${this.state.selectedEquipment.weapons.includes(key) ? '#7ed321' : '#444'};
                border-radius: 4px;
                padding: 12px;
                cursor: pointer;
                background: ${this.state.selectedEquipment.weapons.includes(key) ? 'rgba(126, 211, 33, 0.1)' : 'rgba(0,0,0,0.2)'};
                transition: all 0.2s;
              ">
                <div style="font-weight: bold; color: ${this.state.selectedEquipment.weapons.includes(key) ? '#7ed321' : '#fff'};">${weapon.name}</div>
                <div style="font-size: 12px; color: #aaa;">Damage: ${weapon.damage} • ${weapon.damageType.join('/')}</div>
                <div style="font-size: 12px; color: #aaa;">Critical: ${weapon.critical.threat}-20/×${weapon.critical.multiplier}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 style="color: #fff; margin-bottom: 12px;">Armor</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;">
            ${armors.map(([key, armor]) => `
              <div class="armor-option" data-armor="${key}" style="
                border: 1px solid ${this.state.selectedEquipment.armor === key ? '#7ed321' : '#444'};
                border-radius: 4px;
                padding: 12px;
                cursor: pointer;
                background: ${this.state.selectedEquipment.armor === key ? 'rgba(126, 211, 33, 0.1)' : 'rgba(0,0,0,0.2)'};
                transition: all 0.2s;
              ">
                <div style="font-weight: bold; color: ${this.state.selectedEquipment.armor === key ? '#7ed321' : '#fff'};">${armor.name}</div>
                <div style="font-size: 12px; color: #aaa;">AC: +${armor.acBonus} • Max Dex: ${armor.maxDexBonus ?? '∞'}</div>
                <div style="font-size: 12px; color: #aaa;">ACP: ${armor.armorCheckPenalty} • ASF: ${armor.arcaneSpellFailure}%</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  private renderReview(): string {
    if (!this.state.character) {
      this.createCharacterFromState()
    }

    const char = this.state.character!
    const errors = validateCharacterPrerequisites(char)

    return `
      <div>
        <h3 style="color: #fff; margin-bottom: 16px;">Review Character</h3>
        
        ${errors.length > 0 ? `
          <div style="background: rgba(233, 75, 60, 0.2); border: 1px solid #e94b3c; border-radius: 4px; padding: 12px; margin-bottom: 16px;">
            <div style="color: #e94b3c; font-weight: bold; margin-bottom: 8px;">⚠ Character Issues:</div>
            ${errors.map(error => `<div style="color: #e94b3c; font-size: 13px;">• ${error}</div>`).join('')}
          </div>
        ` : `
          <div style="background: rgba(126, 211, 33, 0.2); border: 1px solid #7ed321; border-radius: 4px; padding: 12px; margin-bottom: 16px;">
            <div style="color: #7ed321; font-weight: bold;">✓ Character is valid and ready!</div>
          </div>
        `}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <h4 style="color: #fff; margin-bottom: 12px;">Basic Info</h4>
            <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 12px;">
              <div><strong>Name:</strong> ${char.name}</div>
              <div><strong>Race:</strong> ${char.race}</div>
              <div><strong>Class:</strong> ${char.classes.map(c => `${c.class} ${c.level}`).join(', ')}</div>
              <div><strong>Hit Points:</strong> ${char.hitPoints.max}</div>
              <div><strong>Armor Class:</strong> ${char.armorClass.total}</div>
            </div>

            <h4 style="color: #fff; margin: 16px 0 12px 0;">Ability Scores</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${Object.entries(char.abilityScores).map(([ability, score]) => {
                const mod = getAbilityModifier(score)
                const modStr = mod >= 0 ? `+${mod}` : `${mod}`
                return `
                  <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 8px; text-align: center;">
                    <div style="font-size: 12px; color: #aaa;">${ability}</div>
                    <div style="font-weight: bold;">${score} (${modStr})</div>
                  </div>
                `
              }).join('')}
            </div>
          </div>

          <div>
            <h4 style="color: #fff; margin-bottom: 12px;">Combat</h4>
            <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 12px;">
              <div><strong>Base Attack:</strong> +${this.calculateBAB(char)}</div>
              <div><strong>Fort Save:</strong> +${char.savingThrows.fortitude}</div>
              <div><strong>Ref Save:</strong> +${char.savingThrows.reflex}</div>
              <div><strong>Will Save:</strong> +${char.savingThrows.will}</div>
            </div>

            <h4 style="color: #fff; margin: 16px 0 12px 0;">Equipment</h4>
            <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 12px;">
              <div><strong>Weapons:</strong> ${char.equipment.weapons.map(w => w.name).join(', ') || 'None'}</div>
              <div><strong>Armor:</strong> ${char.equipment.armor?.name || 'None'}</div>
            </div>

            <h4 style="color: #fff; margin: 16px 0 12px 0;">Feats</h4>
            <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 12px;">
              ${char.feats.length > 0 ? char.feats.map(feat => `<div>• ${feat}</div>`).join('') : '<div style="color: #aaa;">None selected</div>'}
            </div>
          </div>
        </div>
      </div>
    `
  }

  private renderNavigation(): string {
    const canGoNext = this.canProceedFromCurrentStep()
    const isLastStep = this.state.step === 'review'

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #333;">
        <button id="prev-step" style="
          padding: 10px 20px; 
          background: #666; 
          border: none; 
          border-radius: 4px; 
          color: white; 
          cursor: pointer;
          ${this.state.step === 'race' ? 'opacity: 0.5; cursor: not-allowed;' : ''}
        " ${this.state.step === 'race' ? 'disabled' : ''}>
          ← Previous
        </button>

        <div style="color: #aaa; font-size: 13px;">
          Step ${this.getStepIndex() + 1} of 6
        </div>

        <button id="next-step" style="
          padding: 10px 20px; 
          background: ${isLastStep ? '#7ed321' : '#4a90e2'}; 
          border: none; 
          border-radius: 4px; 
          color: white; 
          cursor: pointer;
          font-weight: bold;
          ${!canGoNext ? 'opacity: 0.5; cursor: not-allowed;' : ''}
        " ${!canGoNext ? 'disabled' : ''}>
          ${isLastStep ? 'Create Character' : 'Next →'}
        </button>
      </div>
    `
  }

  private attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById('close-creation')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide())
    }

    // Character name
    const nameInput = document.getElementById('character-name') as HTMLInputElement
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.state.name = nameInput.value
      })
    }

    // Race selection
    document.querySelectorAll('.race-option').forEach(element => {
      element.addEventListener('click', () => {
        this.state.selectedRace = (element as HTMLElement).dataset.race!
        this.render()
      })
    })

    // Class selection
    document.querySelectorAll('.class-option').forEach(element => {
      element.addEventListener('click', () => {
        this.state.selectedClass = (element as HTMLElement).dataset.class! as ClassType
        this.render()
      })
    })

    // Ability score buttons
    document.querySelectorAll('.ability-btn').forEach(button => {
      button.addEventListener('click', () => {
        const ability = (button as HTMLElement).dataset.ability! as keyof AbilityScores
        const action = (button as HTMLElement).dataset.action!
        
        if (action === 'increase' && this.canIncreaseAbility(ability)) {
          this.increaseAbility(ability)
        } else if (action === 'decrease' && this.canDecreaseAbility(ability)) {
          this.decreaseAbility(ability)
        }
        this.render()
      })
    })

    // Equipment selection
    document.querySelectorAll('.weapon-option').forEach(element => {
      element.addEventListener('click', () => {
        const weapon = (element as HTMLElement).dataset.weapon!
        const weapons = this.state.selectedEquipment.weapons
        if (weapons.includes(weapon)) {
          this.state.selectedEquipment.weapons = weapons.filter(w => w !== weapon)
        } else {
          weapons.push(weapon)
        }
        this.render()
      })
    })

    document.querySelectorAll('.armor-option').forEach(element => {
      element.addEventListener('click', () => {
        const armor = (element as HTMLElement).dataset.armor!
        this.state.selectedEquipment.armor = this.state.selectedEquipment.armor === armor ? undefined : armor
        this.render()
      })
    })

    // Navigation
    const prevBtn = document.getElementById('prev-step')
    const nextBtn = document.getElementById('next-step')

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToPreviousStep())
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.state.step === 'review') {
          this.completeCharacterCreation()
        } else {
          this.goToNextStep()
        }
      })
    }
  }

  private getAbilityCost(score: number): number {
    if (score <= 8) return 0
    if (score <= 13) return score - 8
    if (score === 14) return 6
    if (score === 15) return 8
    return 10 // Should not reach here in point-buy
  }

  private canIncreaseAbility(ability: keyof AbilityScores): boolean {
    const score = this.state.abilityScores[ability]
    const currentCost = this.getAbilityCost(score)
    const newCost = this.getAbilityCost(score + 1)
    const costDiff = newCost - currentCost
    
    return score < 15 && costDiff <= this.state.remainingPoints
  }

  private canDecreaseAbility(ability: keyof AbilityScores): boolean {
    return this.state.abilityScores[ability] > 8
  }

  private increaseAbility(ability: keyof AbilityScores) {
    const score = this.state.abilityScores[ability]
    const currentCost = this.getAbilityCost(score)
    const newCost = this.getAbilityCost(score + 1)
    const costDiff = newCost - currentCost
    
    this.state.abilityScores[ability] = score + 1
    this.state.remainingPoints -= costDiff
  }

  private decreaseAbility(ability: keyof AbilityScores) {
    const score = this.state.abilityScores[ability]
    const currentCost = this.getAbilityCost(score)
    const newCost = this.getAbilityCost(score - 1)
    const costDiff = currentCost - newCost
    
    this.state.abilityScores[ability] = score - 1
    this.state.remainingPoints += costDiff
  }

  private canProceedFromCurrentStep(): boolean {
    switch (this.state.step) {
      case 'race': return this.state.name.trim().length > 0 && this.state.selectedRace !== null
      case 'class': return this.state.selectedClass !== null
      case 'abilities': return this.state.remainingPoints >= 0
      case 'skills': return true // Always can proceed from skills for now
      case 'equipment': return true // Always can proceed from equipment
      case 'review': return this.state.character !== null
      default: return false
    }
  }

  private getStepIndex(): number {
    const steps = ['race', 'class', 'abilities', 'skills', 'equipment', 'review']
    return steps.indexOf(this.state.step)
  }

  private goToPreviousStep() {
    const steps = ['race', 'class', 'abilities', 'skills', 'equipment', 'review']
    const currentIndex = steps.indexOf(this.state.step)
    if (currentIndex > 0) {
      this.state.step = steps[currentIndex - 1] as any
      this.render()
    }
  }

  private goToNextStep() {
    const steps = ['race', 'class', 'abilities', 'skills', 'equipment', 'review']
    const currentIndex = steps.indexOf(this.state.step)
    if (currentIndex < steps.length - 1) {
      this.state.step = steps[currentIndex + 1] as any
      this.render()
    }
  }

  private createCharacterFromState() {
    if (!this.state.selectedClass) return

    const character = createCharacter({
      name: this.state.name,
      race: this.state.selectedRace,
      class: this.state.selectedClass,
      abilityScores: this.state.abilityScores
    })

    // Add selected equipment
    if (this.state.selectedEquipment.weapons.length > 0) {
      character.equipment.weapons = this.state.selectedEquipment.weapons.map(key => sampleWeapons[key])
    }

    if (this.state.selectedEquipment.armor) {
      character.equipment.armor = sampleArmor[this.state.selectedEquipment.armor]
    }

    this.state.character = character
  }

  private calculateBAB(character: Character): number {
    return character.classes.reduce((total, classLevel) => {
      switch (classLevel.class) {
        case 'fighter':
        case 'barbarian':
        case 'paladin':
        case 'ranger':
          return total + classLevel.level
        case 'cleric':
        case 'druid':
        case 'monk':
        case 'bard':
        case 'rogue':
          return total + Math.floor(classLevel.level * 3 / 4)
        default:
          return total + Math.floor(classLevel.level / 2)
      }
    }, 0)
  }

  private completeCharacterCreation() {
    if (this.state.character && this.onComplete) {
      this.onComplete(this.state.character)
    }
    this.hide()
  }
}
