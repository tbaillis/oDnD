import type { Character } from '../game/character'
import { GoldBoxInterface, convertCharacterToStatus, type CharacterStatus } from './goldBoxInterface'

/**
 * Adapter to integrate Gold Box Interface with existing game systems
 */
export class GoldBoxAdapter {
  private interface: GoldBoxInterface
  private characters: Map<string, Character> = new Map()
  private gameState: 'exploration' | 'combat' | 'menu' = 'exploration'
  
  constructor() {
    this.interface = new GoldBoxInterface()
    this.setupCommands()
    this.initializeDemo()
  }

  private setupCommands(): void {
    this.interface.setCommandCallback((command: string) => {
      this.handleCommand(command)
    })
  }

  private handleCommand(command: string): void {
    console.log(`Gold Box Command: ${command}`)
    
    switch (command) {
      case 'combat':
        this.startCombat()
        break
      case 'wait':
        this.wait()
        break
      case 'flee':
        this.flee()
        break
      case 'advance':
        this.advance()
        break
      case 'talk':
        this.talk()
        break
      case 'use':
        this.use()
        break
      case 'search':
        this.search()
        break
      case 'camp':
        this.camp()
        break
    }
  }

  private startCombat(): void {
    this.gameState = 'combat'
    this.interface.addMessage('Combat begins!', 'Combat')
    this.interface.setCommands({
      combat: false,
      wait: true,
      flee: true,
      advance: false,
      talk: false,
      use: true,
      search: false,
      camp: false
    })
  }

  private wait(): void {
    this.interface.addMessage('You wait and observe...', 'Narration')
  }

  private flee(): void {
    if (this.gameState === 'combat') {
      this.interface.addMessage('You attempt to flee from combat!', 'Combat')
      this.gameState = 'exploration'
      this.updateCommandsForExploration()
    } else {
      this.interface.addMessage('You quickly backtrack.', 'Narration')
    }
  }

  private advance(): void {
    this.interface.addMessage('You move forward...', 'Narration')
    // Potentially trigger random encounters or scene changes
    this.checkRandomEncounter()
  }

  private talk(): void {
    this.interface.addMessage('There is no one here to talk to.', 'System')
  }

  private use(): void {
    this.interface.addMessage('Use what? On what?', 'System')
  }

  private search(): void {
    this.interface.addMessage('You search the area carefully...', 'Skill')
    // Simulate a search check
    const searchResult = Math.random()
    if (searchResult > 0.7) {
      this.interface.addMessage('You find something interesting!', 'Skill')
    } else {
      this.interface.addMessage('You find nothing of interest.', 'Skill')
    }
  }

  private camp(): void {
    this.interface.prompt('Do you wish to rest? This will take 8 hours.', ['REST', 'CANCEL'])
      .then(response => {
        if (response === 'REST' || response === 'continue') {
          this.interface.addMessage('You make camp and rest for the night...', 'Narration')
          this.restParty()
        } else {
          this.interface.addMessage('You decide not to rest now.', 'System')
        }
      })
  }

  private checkRandomEncounter(): void {
    if (Math.random() < 0.1) { // 10% chance
      this.interface.addMessage('You encounter monsters!', 'Combat')
      this.startCombat()
    }
  }

  private restParty(): void {
    // Heal characters
    this.characters.forEach((character) => {
      if (character.hitPoints.current < character.hitPoints.max) {
        const healAmount = Math.floor(character.hitPoints.max * 0.1) + 1
        character.hitPoints.current = Math.min(
          character.hitPoints.max,
          character.hitPoints.current + healAmount
        )
        this.interface.addMessage(`${character.name} recovers ${healAmount} hit points.`, 'System')
      }
    })
    this.updatePartyDisplay()
  }

  private updateCommandsForExploration(): void {
    this.interface.setCommands({
      combat: true,
      wait: true,
      flee: false,
      advance: true,
      talk: false,
      use: false,
      search: true,
      camp: true
    })
  }

  private initializeDemo(): void {
    // Add some sample characters for demo
    const sampleCharacters = this.createSampleParty()
    sampleCharacters.forEach((character, index) => {
      this.addCharacter(`char-${index}`, character)
    })
    
    // Set initial scene
    this.interface.setScene({
      mode: 'image',
      imageSrc: './src/assets/Backgrounds/Dungeon.png'
    })
    
    // Add welcome message
    this.interface.addMessage('Welcome to the dungeon!', 'Narration')
    this.interface.addMessage('Use the command buttons or hotkeys to interact.', 'System')
    
    this.updateCommandsForExploration()
  }

  private createSampleParty(): Character[] {
    // Create sample characters based on the image
    return [
      {
        name: 'BARONESS BELLA',
        race: 'Human',
        classes: [{ class: 'fighter', level: 6, hitPointsRolled: 45, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 12, WIS: 13, CHA: 10 },
        hitPoints: { current: 42, max: 45, temporary: 0 },
        armorClass: { base: 10, total: 18, touch: 12, flatFooted: 16 },
        savingThrows: { fortitude: 7, reflex: 4, will: 3 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      },
      {
        name: 'BANT BLACKSMITH',
        race: 'Dwarf',
        classes: [{ class: 'cleric', level: 5, hitPointsRolled: 38, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 14, DEX: 10, CON: 16, INT: 12, WIS: 17, CHA: 13 },
        hitPoints: { current: 35, max: 38, temporary: 0 },
        armorClass: { base: 10, total: 16, touch: 10, flatFooted: 16 },
        savingThrows: { fortitude: 6, reflex: 2, will: 8 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      },
      {
        name: 'BROTHER GALTOR',
        race: 'Human', 
        classes: [{ class: 'monk', level: 4, hitPointsRolled: 32, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 13, DEX: 16, CON: 14, INT: 12, WIS: 15, CHA: 11 },
        hitPoints: { current: 25, max: 32, temporary: 0 },
        armorClass: { base: 10, total: 15, touch: 15, flatFooted: 12 },
        savingThrows: { fortitude: 5, reflex: 7, will: 6 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      },
      {
        name: 'BUFFY BURROWS',
        race: 'Halfling',
        classes: [{ class: 'rogue', level: 5, hitPointsRolled: 28, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 10, DEX: 18, CON: 12, INT: 14, WIS: 13, CHA: 15 },
        hitPoints: { current: 18, max: 28, temporary: 0 },
        armorClass: { base: 10, total: 16, touch: 15, flatFooted: 12 },
        savingThrows: { fortitude: 2, reflex: 8, will: 3 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      },
      {
        name: 'DRAGJA BLEEKBOW',
        race: 'Elf',
        classes: [{ class: 'ranger', level: 4, hitPointsRolled: 34, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 14, DEX: 17, CON: 13, INT: 12, WIS: 15, CHA: 10 },
        hitPoints: { current: 30, max: 34, temporary: 0 },
        armorClass: { base: 10, total: 15, touch: 13, flatFooted: 12 },
        savingThrows: { fortitude: 4, reflex: 6, will: 4 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      },
      {
        name: 'BRIM BRIGHTSTAR',
        race: 'Human',
        classes: [{ class: 'wizard', level: 5, hitPointsRolled: 20, skillPointsSpent: {}, featsGained: [] }],
        abilityScores: { STR: 8, DEX: 14, CON: 12, INT: 17, WIS: 13, CHA: 11 },
        hitPoints: { current: 16, max: 20, temporary: 0 },
        armorClass: { base: 10, total: 12, touch: 12, flatFooted: 10 },
        savingThrows: { fortitude: 2, reflex: 3, will: 6 },
        skills: {},
        feats: [],
        equipment: { weapons: [], items: [] }
      }
    ]
  }

  // Public API methods
  public show(): void {
    this.interface.show()
  }

  public hide(): void {
    this.interface.hide()
  }

  public toggle(): void {
    this.interface.toggle()
  }

  public isShowing(): boolean {
    return this.interface.isShowing()
  }

  public addCharacter(id: string, character: Character): void {
    this.characters.set(id, character)
    this.updatePartyDisplay()
  }

  public removeCharacter(id: string): void {
    this.characters.delete(id)
    this.updatePartyDisplay()
  }

  public updateCharacter(id: string, character: Character): void {
    this.characters.set(id, character)
    this.updatePartyDisplay()
  }

  public addCondition(characterId: string, condition: string): void {
    // This would integrate with the actual condition system
    console.log(`Adding condition ${condition} to ${characterId}`)
    this.updatePartyDisplay()
  }

  public removeCondition(characterId: string, condition: string): void {
    // This would integrate with the actual condition system
    console.log(`Removing condition ${condition} from ${characterId}`)
    this.updatePartyDisplay()
  }

  private updatePartyDisplay(): void {
    const partyStatus: CharacterStatus[] = Array.from(this.characters.entries()).map(([id, character]) => 
      convertCharacterToStatus(character, id, this.getCharacterConditions(id))
    )
    this.interface.updateParty(partyStatus)
  }

  private getCharacterConditions(characterId: string): string[] {
    // This would integrate with the actual ECS condition system
    // For demo, return some sample conditions for injured characters
    const character = this.characters.get(characterId)
    if (!character) return []
    
    const conditions: string[] = []
    const hpPercent = character.hitPoints.current / character.hitPoints.max
    
    if (character.hitPoints.current <= 0) {
      if (character.hitPoints.current < -10) {
        conditions.push('DEAD')
      } else if (character.hitPoints.current < 0) {
        conditions.push('DYG')
      } else {
        conditions.push('UNC')
      }
    } else if (character.hitPoints.current === 1) {
      conditions.push('DIS')
    } else if (hpPercent < 0.25) {
      conditions.push('STAG')
    }
    
    return conditions
  }

  // Integration methods for existing game systems
  public integrateWithUIManager(_uiManager: any): void {
    // Add keyboard shortcut to toggle Gold Box interface
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' && e.ctrlKey) {
        e.preventDefault()
        this.toggle()
      }
    })
    
    console.log('Gold Box Interface integrated. Press Ctrl+G to toggle.')
  }

  public syncWithWorld(_world: any): void {
    // This would sync with the actual ECS world state
    // For now, just log that integration point exists
    console.log('Gold Box Interface sync with world system available')
  }

  public getInterface(): GoldBoxInterface {
    return this.interface
  }
}
