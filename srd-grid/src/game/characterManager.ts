/**
 * Unified Character Management System
 * Handles character creation, storage, conversion, and party management
 */

import type { Character, AbilityScores, ClassType } from './character'
import { createCharacter } from './character'

// Unified character creation interface (used by CharacterCreation modal)
export interface CharacterCreationData {
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

// Unified character storage format (used for save/load)
export interface StoredCharacter {
  character: Character
  pawnMetadata?: {
    x?: number
    y?: number
    speed?: number
    size?: string
    hp?: number
    maxHp?: number
    goldBoxId?: string
    name?: string
  }
  createdAt: string
  lastModified: string
  version: string
}

// Party management interface
export interface PartyData {
  characters: Record<string, StoredCharacter> // key = pawn-id (pawn-a, pawn-b, etc.)
  metadata: {
    name?: string
    createdAt: string
    lastModified: string
    version: string
  }
}

/**
 * Central character management class
 */
export class CharacterManager {
  private static instance: CharacterManager
  private characters: Map<string, StoredCharacter> = new Map()
  private readonly version = '1.0.0'

  private constructor() {}

  public static getInstance(): CharacterManager {
    if (!CharacterManager.instance) {
      CharacterManager.instance = new CharacterManager()
    }
    return CharacterManager.instance
  }

  /**
   * Convert CharacterCreationData to unified Character format
   */
  public createCharacterFromCreationData(creationData: CharacterCreationData): Character {
    // Map ability scores from creation format to game format
    const abilityScores: AbilityScores = {
      STR: creationData.abilities.strength,
      DEX: creationData.abilities.dexterity,
      CON: creationData.abilities.constitution,
      INT: creationData.abilities.intelligence,
      WIS: creationData.abilities.wisdom,
      CHA: creationData.abilities.charisma
    }

    // Use the existing createCharacter function with mapped data
    const character = createCharacter({
      name: creationData.name,
      race: creationData.race,
      class: creationData.characterClass as ClassType,
      abilityScores
    })

    // Apply additional creation data
    if (creationData.hitPoints > 0) {
      character.hitPoints.max = creationData.hitPoints
      character.hitPoints.current = creationData.hitPoints
    }

    // Apply feats
    character.feats = [...creationData.feats]

    // Apply skills (if any - current implementation auto-assigns)
    // TODO: Implement full skill system integration

    return character
  }

  /**
   * Convert Character to CharacterCreationData format (for editing)
   */
  public convertCharacterToCreationData(character: Character): CharacterCreationData {
    return {
      name: character.name,
      race: character.race,
      characterClass: character.classes[0]?.class || 'fighter',
      abilityGenerationMethod: 'pointBuy', // Default - we don't store generation method
      abilities: {
        strength: character.abilityScores.STR,
        dexterity: character.abilityScores.DEX,
        constitution: character.abilityScores.CON,
        intelligence: character.abilityScores.INT,
        wisdom: character.abilityScores.WIS,
        charisma: character.abilityScores.CHA
      },
      hitPoints: character.hitPoints.max,
      skills: [], // TODO: Extract from character.skills
      feats: [...character.feats],
      equipment: [] // TODO: Extract from character.equipment
    }
  }

  /**
   * Store a character with metadata
   */
  public storeCharacter(pawnId: string, character: Character, pawnMetadata?: any): void {
    const storedCharacter: StoredCharacter = {
      character,
      pawnMetadata,
      createdAt: this.characters.has(pawnId) ? 
        this.characters.get(pawnId)!.createdAt : new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: this.version
    }

    this.characters.set(pawnId, storedCharacter)
    
    // Dispatch update event
    this.dispatchCharacterStoredEvent(pawnId, character)
  }

  /**
   * Retrieve a character
   */
  public getCharacter(pawnId: string): Character | null {
    const stored = this.characters.get(pawnId)
    return stored ? stored.character : null
  }

  /**
   * Get all characters
   */
  public getAllCharacters(): Map<string, Character> {
    const characterMap = new Map<string, Character>()
    for (const [pawnId, stored] of this.characters.entries()) {
      characterMap.set(pawnId, stored.character)
    }
    return characterMap
  }

  /**
   * Remove a character
   */
  public removeCharacter(pawnId: string): boolean {
    const removed = this.characters.delete(pawnId)
    if (removed) {
      this.dispatchCharacterRemovedEvent(pawnId)
    }
    return removed
  }

  /**
   * Export party data for saving
   */
  public exportPartyData(): PartyData {
    const characters: Record<string, StoredCharacter> = {}
    for (const [pawnId, stored] of this.characters.entries()) {
      characters[pawnId] = stored
    }

    return {
      characters,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: this.version
      }
    }
  }

  /**
   * Import party data from save file
   */
  public importPartyData(partyData: PartyData): void {
    this.characters.clear()
    
    for (const [pawnId, stored] of Object.entries(partyData.characters)) {
      this.characters.set(pawnId, stored)
    }

    // Dispatch party updated event
    this.dispatchPartyUpdatedEvent()
  }

  /**
   * Load characters from various save file formats (backward compatibility)
   */
  public loadFromLegacySaveData(saveData: any): Character[] {
    const loadedCharacters: Character[] = []

    if (Array.isArray(saveData)) {
      // Array format - assign to sequential pawn slots
      const candidateIds = ['pawn-a', 'pawn-b', 'pawn-c', 'pawn-d', 'pawn-e', 'pawn-f']
      saveData.forEach((entry: any, i: number) => {
        if (entry && typeof entry === 'object') {
          const pawnId = entry?.goldBoxId || entry?.id || candidateIds[i] || `pawn-${i}`
          this.storeCharacter(pawnId, entry as Character)
          loadedCharacters.push(entry as Character)
        }
      })
    } else if (typeof saveData === 'object' && saveData !== null) {
      // Object format with pawn keys
      for (const [id, payload] of Object.entries(saveData)) {
        let character: Character | null = null

        if (payload && typeof payload === 'object') {
          // Check if it's wrapped in a character property
          if ('character' in (payload as any)) {
            character = (payload as any).character
          } else {
            // Assume it's a direct character object
            character = payload as Character
          }

          if (character && character.name) {
            this.storeCharacter(id, character, (payload as any).pawnMetadata)
            loadedCharacters.push(character)
          }
        }
      }
    }

    return loadedCharacters
  }

  /**
   * Validate character data
   */
  public validateCharacter(character: Character): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!character.name || character.name.trim().length === 0) {
      errors.push('Character name is required')
    }

    if (!character.race || character.race.trim().length === 0) {
      errors.push('Character race is required')
    }

    if (!character.classes || character.classes.length === 0) {
      errors.push('Character must have at least one class')
    }

    // Validate ability scores (should be between 3 and 25 for most cases)
    for (const [ability, score] of Object.entries(character.abilityScores)) {
      if (score < 3 || score > 25) {
        errors.push(`${ability} score (${score}) is out of valid range (3-25)`)
      }
    }

    // Validate hit points
    if (character.hitPoints.max <= 0) {
      errors.push('Maximum hit points must be greater than 0')
    }

    if (character.hitPoints.current < 0) {
      errors.push('Current hit points cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get character summary for display
   */
  public getCharacterSummary(character: Character): string {
    const primaryClass = character.classes[0]
    const level = primaryClass ? primaryClass.level : 1
    const className = primaryClass ? primaryClass.class : 'Unknown'
    
    return `${character.name} (${character.race} ${className} ${level})`
  }

  /**
   * Check if party is full (6 characters max, excluding monsters)
   */
  public isPartyFull(): boolean {
    const validPawnIds = ['pawn-a', 'pawn-b', 'pawn-c', 'pawn-d', 'pawn-e', 'pawn-f']
    let count = 0
    
    for (const pawnId of validPawnIds) {
      if (this.characters.has(pawnId)) {
        count++
      }
    }
    
    return count >= 6
  }

  /**
   * Find next available pawn slot
   */
  public findAvailablePawnSlot(): string | null {
    const validPawnIds = ['pawn-a', 'pawn-b', 'pawn-c', 'pawn-d', 'pawn-e', 'pawn-f']
    
    for (const pawnId of validPawnIds) {
      if (!this.characters.has(pawnId)) {
        return pawnId
      }
    }
    
    return null
  }

  // Event dispatching methods
  private dispatchCharacterStoredEvent(pawnId: string, character: Character): void {
    const event = new CustomEvent('character-manager-stored', {
      detail: { pawnId, character }
    })
    document.dispatchEvent(event)
  }

  private dispatchCharacterRemovedEvent(pawnId: string): void {
    const event = new CustomEvent('character-manager-removed', {
      detail: { pawnId }
    })
    document.dispatchEvent(event)
  }

  private dispatchPartyUpdatedEvent(): void {
    const event = new CustomEvent('character-manager-party-updated', {
      detail: { characters: this.getAllCharacters() }
    })
    document.dispatchEvent(event)
  }
}

// Export singleton instance
export const characterManager = CharacterManager.getInstance()

// Export utility functions
export function convertCreationDataToCharacter(creationData: CharacterCreationData): Character {
  return characterManager.createCharacterFromCreationData(creationData)
}

export function convertCharacterToCreationData(character: Character): CharacterCreationData {
  return characterManager.convertCharacterToCreationData(character)
}
