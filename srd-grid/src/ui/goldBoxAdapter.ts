import type { Character } from '../game/character'
import { GoldBoxInterface, convertCharacterToStatus, type CharacterStatus } from './goldBoxInterface'
import { GoldBoxCharacterSheet } from './goldBoxCharacterSheet'

/**
 * Adapter to integrate Gold Box Interface with existing game systems
 */
export class GoldBoxAdapter {
  private interface: GoldBoxInterface
  private characterSheet: GoldBoxCharacterSheet
  private characters: Map<string, Character> = new Map()
  private gameState: 'exploration' | 'combat' | 'menu' = 'exploration'
  
  constructor() {
    console.log('Gold Box Adapter: Constructor starting...')
    try {
      console.log('Gold Box Adapter: Creating GoldBoxInterface...')
      this.interface = new GoldBoxInterface()
      console.log('Gold Box Adapter: GoldBoxInterface created successfully')

      console.log('Gold Box Adapter: Creating GoldBoxCharacterSheet...')
      this.characterSheet = new GoldBoxCharacterSheet()
      console.log('Gold Box Adapter: GoldBoxCharacterSheet created successfully')
      
      console.log('Gold Box Adapter: Setting up commands...')
      this.setupCommands()
      console.log('Gold Box Adapter: Commands setup complete')

      console.log('Gold Box Adapter: Setting up character click handler...')
      this.setupCharacterClickHandler()
      console.log('Gold Box Adapter: Character click handler setup complete')
      
      console.log('Gold Box Adapter: Initializing demo...')
      this.initializeDemo()
      console.log('Gold Box Adapter: Demo initialization complete')
      
      console.log('Gold Box Adapter: Setting up character creation listener...')
      this.setupCharacterCreationListener()
      console.log('Gold Box Adapter: Character creation listener setup complete')

      console.log('Gold Box Adapter: Setting up character update listeners...')
      this.setupCharacterUpdateListeners()
      console.log('Gold Box Adapter: Character update listeners setup complete')
      
      console.log('Gold Box Adapter: Constructor completed successfully!')
    } catch (error) {
      console.error('Gold Box Adapter: Error in constructor:', error)
      throw error
    }
  }

  private setupCommands(): void {
    this.interface.setCommandCallback((command: string) => {
      this.handleCommand(command)
    })
  }

  private setupCharacterClickHandler(): void {
    this.interface.setOnCharacterClick((characterId: string) => {
      console.log('Gold Box: Character clicked:', characterId)
      const character = this.characters.get(characterId)
      if (character) {
        console.log('Gold Box: Opening character sheet for:', character.name)
        this.characterSheet.show(character, characterId)
      } else {
        console.warn('Gold Box: Character not found for ID:', characterId)
      }
    })
  }

  private setupCharacterUpdateListeners(): void {
    // Listen for character sheet updates
    document.addEventListener('character-sheet-updated', (event: Event) => {
      const customEvent = event as CustomEvent
      const { characterId, character } = customEvent.detail
      console.log('Gold Box: Received character sheet update for:', character.name, 'ID:', characterId)
      
      if (characterId && this.characters.has(characterId)) {
        this.characters.set(characterId, character)
        
        // Update the pawn if it's pawn-a (suppressEvent prevents loops)
        if (characterId === 'pawn-a') {
          this.applyCharacterToPawn(character)
        }
        
        // Update the Gold Box display
        this.updatePartyDisplay()
        
        console.log('Gold Box: Character data synchronized after sheet update')
      }
    })

    // Listen for external character updates (from combat, items, etc.)
    document.addEventListener('character-data-changed', (event: Event) => {
      const customEvent = event as CustomEvent
      const { characterId, character, source } = customEvent.detail
      console.log('Gold Box: Received external character update for:', character?.name || 'unknown', 'ID:', characterId, 'Source:', source)
      
      if (characterId && character && this.characters.has(characterId)) {
        // Update our character data
        this.characters.set(characterId, character)
        
        // Update the character sheet if it's currently showing this character
        this.characterSheet.updateCharacter(character, characterId)
        
        // Update the Gold Box display
        this.updatePartyDisplay()
        
        console.log('Gold Box: Character data synchronized after external update')
      }
    })
  }

  private applyCharacterToPawn(character: Character): void {
    const applyCharacterToPawnA = (window as any).applyCharacterToPawnA
    if (typeof applyCharacterToPawnA === 'function') {
      console.log('Gold Box: Applying updated character to pawn:', character.name)
      // Call with suppressEvent flag to prevent loop
      applyCharacterToPawnA(character, true)
      
      // Update pawn reference
      const pawnA = (window as any).pawnA
      if (pawnA) {
        pawnA.characterData = character
      }
    } else {
      console.warn('Gold Box: applyCharacterToPawnA function not available for character update')
    }
  }

  private setupCharacterCreationListener(): void {
    console.log('Gold Box: Setting up character creation listener')
    
    // Test that event system is working
    document.addEventListener('test-event', () => {
      console.log('Gold Box: Test event received - event system is working!')
    })
    
    // Dispatch test event immediately to verify
    setTimeout(() => {
      console.log('Gold Box: Dispatching test event')
      document.dispatchEvent(new CustomEvent('test-event'))
    }, 100)
    
    // Listen for character creation events from the existing UI
    document.addEventListener('goldbox-character-created', ((e: CustomEvent) => {
      const character = e.detail
      console.log('Gold Box: Character created via existing UI:', character.name)
      console.log('Gold Box: Full character data:', character)
      
      // Find next available pawn slot or use A if all full
      const availableSlot = this.findAvailablePawnSlot()
      if (availableSlot) {
        this.assignCharacterToPawn(character, availableSlot)
        this.interface.addMessage(`${character.name} assigned to Pawn ${availableSlot}!`, 'System')
      } else {
        // All slots full - replace Pawn A
        this.assignCharacterToPawn(character, 'A')
        this.interface.addMessage(`${character.name} replaces the leader (Pawn A)!`, 'System')
      }
      
      // No need to force update display - assignCharacterToPawn handles it
    }) as EventListener)
    
    console.log('Gold Box: Character creation listener setup complete')
    
    // REMOVED: The problematic syncPawnAChanges interval that was causing duplicates
    // The sync will happen automatically when characters are created or changed
  }

  // Method to assign character to specific pawn slot (excluding pawns with 'M' in names)
  public assignCharacterToPawn(character: Character, pawnSlot: 'A' | 'C' | 'D' | 'E' | 'F' | 'B'): void {
    console.log(`Gold Box: Assigning ${character.name} to Pawn ${pawnSlot}`)
    
    switch (pawnSlot) {
      case 'A':
        this.setPawnACharacter(character, true) // Suppress events to prevent loops
        break
      case 'B':
        this.setPawnBCharacter(character, true)
        break
      case 'C':
        this.setPawnCCharacter(character, true)
        break
      case 'D':
        this.setPawnDCharacter(character, true)
        break
      case 'E':
        this.setPawnECharacter(character, true)
        break
      case 'F':
        this.setPawnFCharacter(character, true)
        break
    }
    
    this.interface.addMessage(`${character.name} joins Pawn ${pawnSlot}!`, 'System')
    
    // Update display once at the end
    this.updatePartyDisplay()
  }

  // Method to find an available pawn slot (excluding pawns with 'M' in their names)
  public findAvailablePawnSlot(): 'A' | 'C' | 'D' | 'E' | 'F' | 'B' | null {
    // Exclude pawnM1 (has 'M' in name) and add pawnB as the sixth character slot
    const pawnIds = ['pawn-a', 'pawn-c', 'pawn-d', 'pawn-e', 'pawn-f', 'pawn-b']
    const pawnLetters: ('A' | 'C' | 'D' | 'E' | 'F' | 'B')[] = ['A', 'C', 'D', 'E', 'F', 'B']
    
    for (let i = 0; i < pawnIds.length; i++) {
      if (!this.characters.has(pawnIds[i])) {
        return pawnLetters[i]
      }
    }
    
    return null // All slots occupied
  }

  private setPawnACharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-a', character)
    
    // Apply to the actual Pawn A in the game
    const applyCharacterToPawnA = (window as any).applyCharacterToPawnA
    if (typeof applyCharacterToPawnA === 'function') {
      applyCharacterToPawnA(character, suppressEvent)
      console.log('Applied character to Pawn A:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // CRITICAL: Ensure the pawn uses the same character object reference as the GoldBoxAdapter
      const pawnA = (window as any).pawnA
      if (pawnA) {
        console.log('Syncing Pawn A character data with GoldBoxAdapter reference')
        pawnA.characterData = character  // Use the exact same object reference
        pawnA.goldBoxId = 'pawn-a'
        console.log('Pawn A character data set to:', character.name)
      }
    } else {
      console.warn('applyCharacterToPawnA function not found on window - will retry later')
      // Store the character data anyway and apply it later when the function becomes available
      setTimeout(() => {
        const retryApply = (window as any).applyCharacterToPawnA
        if (typeof retryApply === 'function') {
          console.log('Retrying character application for:', character.name)
          retryApply(character, suppressEvent)
          const pawnA = (window as any).pawnA
          if (pawnA) {
            pawnA.characterData = character  // Use the exact same object reference
            pawnA.goldBoxId = 'pawn-a'
          }
        }
      }, 100)
    }
    
    this.interface.addMessage(`${character.name} joins the party as the leader!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnBCharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-b', character)
    
    // Apply to the actual Pawn B in the game
    const applyCharacterToPawnB = (window as any).applyCharacterToPawnB
    if (typeof applyCharacterToPawnB === 'function') {
      applyCharacterToPawnB(character, suppressEvent)
      console.log('Applied character to Pawn B:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // CRITICAL: Ensure the pawn uses the same character object reference as the GoldBoxAdapter
      const pawnB = (window as any).pawnB
      if (pawnB) {
        console.log('Syncing Pawn B character data with GoldBoxAdapter reference')
        pawnB.characterData = character  // Use the exact same object reference
        pawnB.goldBoxId = 'pawn-b'
        console.log('Pawn B character data set to:', character.name)
      }
    } else {
      console.warn('applyCharacterToPawnB function not found on window - will retry later')
      // Store the character data anyway and apply it later when the function becomes available
      setTimeout(() => {
        const retryApply = (window as any).applyCharacterToPawnB
        if (typeof retryApply === 'function') {
          console.log('Retrying character application for:', character.name)
          retryApply(character, suppressEvent)
          const pawnB = (window as any).pawnB
          if (pawnB) {
            pawnB.characterData = character  // Use the exact same object reference
            pawnB.goldBoxId = 'pawn-b'
          }
        }
      }, 100)
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnM1Character(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-m1', character)
    
    const applyCharacterToPawnM1 = (window as any).applyCharacterToPawnM1
    if (typeof applyCharacterToPawnM1 === 'function') {
      applyCharacterToPawnM1(character, suppressEvent)
      console.log('Applied character to Pawn M1:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // Sync character data to ensure object reference consistency
      const pawnM1 = (window as any).pawnM1
      if (pawnM1) {
        pawnM1.characterData = character
        pawnM1.goldBoxId = 'pawn-m1'
      }
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnCCharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-c', character)
    
    const applyCharacterToPawnC = (window as any).applyCharacterToPawnC
    if (typeof applyCharacterToPawnC === 'function') {
      applyCharacterToPawnC(character, suppressEvent)
      console.log('Applied character to Pawn C:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // Sync character data to ensure object reference consistency
      const pawnC = (window as any).pawnC
      if (pawnC) {
        pawnC.characterData = character
        pawnC.goldBoxId = 'pawn-c'
      }
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnDCharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-d', character)
    
    const applyCharacterToPawnD = (window as any).applyCharacterToPawnD
    if (typeof applyCharacterToPawnD === 'function') {
      applyCharacterToPawnD(character, suppressEvent)
      console.log('Applied character to Pawn D:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // Sync character data to ensure object reference consistency
      const pawnD = (window as any).pawnD
      if (pawnD) {
        pawnD.characterData = character
        pawnD.goldBoxId = 'pawn-d'
      }
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnECharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-e', character)
    
    const applyCharacterToPawnE = (window as any).applyCharacterToPawnE
    if (typeof applyCharacterToPawnE === 'function') {
      applyCharacterToPawnE(character, suppressEvent)
      console.log('Applied character to Pawn E:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // Sync character data to ensure object reference consistency
      const pawnE = (window as any).pawnE
      if (pawnE) {
        pawnE.characterData = character
        pawnE.goldBoxId = 'pawn-e'
      }
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
  }

  private setPawnFCharacter(character: Character, suppressEvent: boolean = false): void {
    this.addCharacter('pawn-f', character)
    
    const applyCharacterToPawnF = (window as any).applyCharacterToPawnF
    if (typeof applyCharacterToPawnF === 'function') {
      applyCharacterToPawnF(character, suppressEvent)
      console.log('Applied character to Pawn F:', character.name, suppressEvent ? '(events suppressed)' : '')
      
      // Sync character data to ensure object reference consistency
      const pawnF = (window as any).pawnF
      if (pawnF) {
        pawnF.characterData = character
        pawnF.goldBoxId = 'pawn-f'
      }
    }
    
    this.interface.addMessage(`${character.name} joins the party!`, 'System')
    
    // Only update display if not suppressing events
    if (!suppressEvent) {
      this.updatePartyDisplay()
    }
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
    console.log('=== INITIALIZING DEMO ===')
    // Check if there's already a character on Pawn A
    const pawnA = (window as any).pawnA
    let pawnACharacterLoaded = false
    
    if (pawnA && pawnA.characterData) {
      // Load existing character from pawn data (during startup, don't trigger events)
      console.log('Loading existing character from Pawn A:', pawnA.characterData.name)
      this.characters.set('pawn-a', pawnA.characterData)
      pawnACharacterLoaded = true
      this.interface.addMessage(`${pawnA.characterData.name} is ready to lead the party.`, 'System')
    } else if (pawnA && pawnA.name && pawnA.name !== 'Pawn A') {
      // Try to create a basic character from pawn data
      const existingCharacter = this.createCharacterFromPawn(pawnA)
      this.setPawnACharacter(existingCharacter, true) // Suppress events during initialization
      pawnACharacterLoaded = true
    }
    
    // Create sample characters for full 6-person party
    const sampleCharacters = this.createSampleParty()
    console.log('Created sample characters:', sampleCharacters.map(c => c.name))
    
    if (!pawnACharacterLoaded) {
      // No existing character, use first sample as Pawn A
      const leaderCharacter = sampleCharacters[0]
      this.setPawnACharacter(leaderCharacter, true) // Suppress events during initialization
    }
    
    // Assign characters to all 6 pawn slots
    const remainingCharacters = pawnACharacterLoaded ? sampleCharacters : sampleCharacters.slice(1)
    console.log('Assigning remaining characters:', remainingCharacters.map(c => c.name))

    // Fill pawn slots B through F with sample characters
    if (remainingCharacters.length > 0) {
      console.log('Assigning to M1:', remainingCharacters[0].name)
      this.setPawnM1Character(remainingCharacters[0], true)
    }
    if (remainingCharacters.length > 1) {
      console.log('Assigning to C:', remainingCharacters[1].name)
      this.setPawnCCharacter(remainingCharacters[1], true)
    }
    if (remainingCharacters.length > 2) {
      console.log('Assigning to D:', remainingCharacters[2].name)
      this.setPawnDCharacter(remainingCharacters[2], true)
    }
    if (remainingCharacters.length > 3) {
      console.log('Assigning to E:', remainingCharacters[3].name)
      this.setPawnECharacter(remainingCharacters[3], true)
    }
    if (remainingCharacters.length > 4) {
      console.log('Assigning to F:', remainingCharacters[4].name)
      this.setPawnFCharacter(remainingCharacters[4], true)
    }
    
    // Set initial scene
    this.interface.setScene({
      mode: 'image',
      imageSrc: './src/assets/Backgrounds/Dungeon.png'
    })
    
    // Add welcome message
    this.interface.addMessage('Welcome to the dungeon!', 'Narration')
    this.interface.addMessage('All 6 party members are ready for adventure!', 'System')
    this.interface.addMessage('Use the command buttons or hotkeys to interact.', 'System')
    this.interface.addMessage('Press N in the main game to create a new character.', 'System')
    
    this.updateCommandsForExploration()
  }

  private createCharacterFromPawn(pawn: any): Character {
    // Create a basic character structure from pawn data
    return {
      name: pawn.name || 'Unknown Adventurer',
      race: 'Human',
      classes: [{ class: 'fighter', level: 1, hitPointsRolled: pawn.hp || 20, skillPointsSpent: {}, featsGained: [] }],
      abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 12, CHA: 11 },
      hitPoints: { current: pawn.hp || 20, max: pawn.hp || 20, temporary: 0 },
      armorClass: { base: 10, total: 15, touch: 12, flatFooted: 13 },
      savingThrows: { fortitude: 2, reflex: 2, will: 0 },
      skills: {},
      feats: [],
      equipment: { weapons: [], items: [] }
    }
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
    console.log(`Gold Box: addCharacter called with id '${id}', character '${character.name}'`)
    this.characters.set(id, character)
    console.log(`Gold Box: Character stored. Current character count: ${this.characters.size}`)
    this.updatePartyDisplay()
  }

  public showCharacterSheet(characterId: string): void {
    console.log(`=== SHOWING CHARACTER SHEET FOR: ${characterId} ===`)
    const character = this.characters.get(characterId)
    console.log('Found character:', character ? character.name : 'NOT FOUND')
    console.log('Available characters:', Array.from(this.characters.keys()))
    
    if (character && this.characterSheet) {
      this.characterSheet.show(character, characterId)
    } else {
      console.warn(`Cannot show character sheet: character with ID '${characterId}' not found`)
    }
  }

  // Debug methods - can be called from browser console
  public debugPartyState(): void {
    console.log('=== Gold Box Debug Party State ===')
    console.log('Character count:', this.characters.size)
    console.log('Characters:')
    Array.from(this.characters.entries()).forEach(([id, character]) => {
      console.log(`  ${id}: ${character.name} (${character.race} ${character.classes[0]?.class})`)
      console.log(`    HP: ${character.hitPoints.current}/${character.hitPoints.max}`)
      console.log(`    AC: ${character.armorClass.total}`)
    })
    
    console.log('=== Pawn goldBoxId Mapping ===')
    const pawns = ['pawnA', 'pawnB', 'pawnC', 'pawnD', 'pawnE', 'pawnF']
    pawns.forEach(pawnName => {
      const pawn = (window as any)[pawnName]
      console.log(`${pawnName}.goldBoxId:`, (pawn as any)?.goldBoxId)
      console.log(`${pawnName}.characterData:`, (pawn as any)?.characterData ? (pawn as any).characterData.name : 'None')
    })
  }

  public forceRefresh(): void {
    console.log('Gold Box: Force refreshing party display')
    this.updatePartyDisplay()
  }

  public clearParty(): void {
    console.log('Gold Box: Clearing all party members')
    this.characters.clear()
    this.updatePartyDisplay()
  }

  public resetToDefaults(): void {
    console.log('Gold Box: Resetting to default party')
    this.characters.clear()
    this.initializeDemo()
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
    console.log('Gold Box: updatePartyDisplay called')
    console.log('Gold Box: Current characters:', Array.from(this.characters.entries()).map(([id, char]) => `${id}: ${char.name}`))
    
    // Get current active turn from the global turns object
    const turns = (window as any).turns
    const activeId = turns?.active?.id
    
    const partyStatus: CharacterStatus[] = Array.from(this.characters.entries()).map(([id, character]) => {
      // Map gold box character IDs to pawn IDs for turn tracking
      const pawnIdMap: Record<string, string> = {
        'pawn-a': 'A',
        'pawn-m1': 'M1', 
        'pawn-c': 'C',
        'pawn-d': 'D',
        'pawn-e': 'E',
        'pawn-f': 'F'
      }
      
      const pawnId = pawnIdMap[id]
      const isActiveTurn = pawnId === activeId && this.gameState === 'combat'
      
      const status = {
        ...convertCharacterToStatus(character, id, this.getCharacterConditions(id)),
        isActiveTurn
      }
      
      console.log(`Gold Box: Character ${character.name} (${id} -> ${pawnId}) status:`, status)
      return status
    })
    
    console.log('Gold Box: Updating interface with party status:', partyStatus.length, 'characters')
    this.interface.updateParty(partyStatus)
    console.log('Gold Box: Party display update complete')
  }

  private getCharacterConditions(characterId: string): string[] {
    const character = this.characters.get(characterId)
    if (!character) return []
    
    const conditions: string[] = []
    const hpPercent = character.hitPoints.current / character.hitPoints.max
    
    // Check for death and unconsciousness
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
    
    // For Pawn A, check actual battlefield conditions
    if (characterId === 'pawn-a') {
      const turns = (window as any).turns
      const pawnA = (window as any).pawnA
      
      if (turns?.active?.id === 'A') {
        // Character is active, check for various conditions
        const flatFootedMode = (window as any).flatFootedMode
        if (flatFootedMode) {
          conditions.push('FTF')
        }
      }
      
      // Check for low HP based on pawn data
      if (pawnA?.hp !== undefined && pawnA.hp !== character.hitPoints.current) {
        character.hitPoints.current = Math.max(0, pawnA.hp)
      }
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

  // Public methods for external character updates
  public notifyCharacterChanged(characterId: string, character: Character, source: string = 'external'): void {
    console.log('Gold Box: External character change notification for:', character.name, 'Source:', source)
    
    const event = new CustomEvent('character-data-changed', {
      detail: {
        characterId,
        character,
        source
      }
    })
    
    document.dispatchEvent(event)
  }

  public updateCharacterHP(characterId: string, newHP: number, source: string = 'combat'): void {
    const character = this.characters.get(characterId)
    if (character) {
      const oldHP = character.hitPoints.current
      character.hitPoints.current = Math.max(0, Math.min(newHP, character.hitPoints.max))
      
      console.log(`Gold Box: HP updated for ${character.name}: ${oldHP} -> ${character.hitPoints.current}`)
      this.notifyCharacterChanged(characterId, character, source)
    }
  }

  public getCharacter(characterId: string): Character | undefined {
    return this.characters.get(characterId)
  }

  public getAllCharacters(): Map<string, Character> {
    return new Map(this.characters)
  }

  // Method to sync HP changes from pawn back to character
  public syncPawnAChanges(): void {
    const pawnA = (window as any).pawnA
    const character = this.characters.get('pawn-a')
    
    if (pawnA && character && character.hitPoints.current !== pawnA.hp) {
      character.hitPoints.current = Math.max(0, pawnA.hp)
      this.updatePartyDisplay()
      
      if (pawnA.hp <= 0) {
        this.interface.addMessage(`${character.name} falls unconscious!`, 'Combat')
      }
    }
  }

  public getPawnACharacter(): Character | null {
    return this.characters.get('pawn-a') || null
  }

  public getInterface(): GoldBoxInterface {
    return this.interface
  }

  // Expose assignment methods globally
  public exposeGlobalMethods(): void {
    const windowObj = window as any
    windowObj.assignCharacterToPawn = (character: Character, pawnSlot: 'A' | 'M1' | 'C' | 'D' | 'E' | 'F' | 'B') => {
      // Accept legacy 'B' alias and map it to 'M1'
      const slot = (pawnSlot === 'B') ? 'M1' : pawnSlot
      this.assignCharacterToPawn(character, slot as any)
    }
    windowObj.findAvailablePawnSlot = () => {
      return this.findAvailablePawnSlot()
    }
  }
}
