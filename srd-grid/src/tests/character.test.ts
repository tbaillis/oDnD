import { describe, it, expect } from 'vitest'
import { 
  getAbilityModifier, 
  calculateBAB, 
  calculateSave,
  createCharacter,
  validateCharacterPrerequisites,
  sampleRaces,
  type AbilityScores,
  type ClassLevel
} from '../game/character'

describe('Character System', () => {
  it('should calculate ability modifiers correctly', () => {
    expect(getAbilityModifier(10)).toBe(0)  // Score 10-11 = +0
    expect(getAbilityModifier(11)).toBe(0)
    expect(getAbilityModifier(12)).toBe(1)  // Score 12-13 = +1
    expect(getAbilityModifier(13)).toBe(1)
    expect(getAbilityModifier(18)).toBe(4)  // Score 18-19 = +4
    expect(getAbilityModifier(8)).toBe(-1)  // Score 8-9 = -1
    expect(getAbilityModifier(6)).toBe(-2)  // Score 6-7 = -2
  })

  it('should calculate BAB correctly for different classes', () => {
    const fighterLevels: ClassLevel[] = [
      { class: 'fighter', level: 5, hitPointsRolled: 10, skillPointsSpent: {}, featsGained: [] }
    ]
    expect(calculateBAB(fighterLevels)).toBe(5) // Good BAB = level
    
    const wizardLevels: ClassLevel[] = [
      { class: 'wizard', level: 4, hitPointsRolled: 4, skillPointsSpent: {}, featsGained: [] }
    ]
    expect(calculateBAB(wizardLevels)).toBe(2) // Poor BAB = level/2
    
    const clericLevels: ClassLevel[] = [
      { class: 'cleric', level: 6, hitPointsRolled: 8, skillPointsSpent: {}, featsGained: [] }
    ]
    expect(calculateBAB(clericLevels)).toBe(4) // Average BAB = level*3/4, rounded down
    
    // Multiclass
    const multiclassLevels: ClassLevel[] = [
      { class: 'fighter', level: 3, hitPointsRolled: 10, skillPointsSpent: {}, featsGained: [] },
      { class: 'wizard', level: 2, hitPointsRolled: 4, skillPointsSpent: {}, featsGained: [] }
    ]
    expect(calculateBAB(multiclassLevels)).toBe(4) // 3 (fighter) + 1 (wizard)
  })

  it('should calculate saves correctly', () => {
    const fighterLevels: ClassLevel[] = [
      { class: 'fighter', level: 4, hitPointsRolled: 10, skillPointsSpent: {}, featsGained: [] }
    ]
    
    // Fighter has good Fortitude, poor Reflex and Will
    expect(calculateSave(fighterLevels, 'fortitude', 2)).toBe(6) // 2 + 4/2 + 2 = 6
    expect(calculateSave(fighterLevels, 'reflex', 1)).toBe(2) // 4/3 (rounded down = 1) + 1 = 2
    expect(calculateSave(fighterLevels, 'will', -1)).toBe(0) // 1 + (-1) = 0
  })

  it('should create characters with proper stats', () => {
    const abilities: AbilityScores = {
      STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
    }
    
    const character = createCharacter({
      name: 'Test Fighter',
      race: 'human',
      class: 'fighter',
      abilityScores: abilities
    })
    
    expect(character.name).toBe('Test Fighter')
    expect(character.race).toBe('Human')
    expect(character.classes).toHaveLength(1)
    expect(character.classes[0].class).toBe('fighter')
    expect(character.classes[0].level).toBe(1)
    
    // Human gets no racial ability adjustments (in this simplified version)
    expect(character.abilityScores.STR).toBe(15)
    
    // HP should be max at level 1: d10 + CON mod (1) = 10 + 1 = 11
    expect(character.hitPoints.max).toBe(11)
    expect(character.hitPoints.current).toBe(11)
    
    // AC should include DEX mod: 10 + 2 = 12
    expect(character.armorClass.total).toBe(12)
  })

  it('should apply racial bonuses correctly', () => {
    const baseAbilities: AbilityScores = {
      STR: 13, DEX: 14, CON: 15, INT: 12, WIS: 10, CHA: 8
    }
    
    const elf = createCharacter({
      name: 'Test Elf',
      race: 'elf',
      class: 'wizard',
      abilityScores: baseAbilities
    })
    
    // Elf gets +2 DEX, -2 CON
    expect(elf.abilityScores.DEX).toBe(16) // 14 + 2
    expect(elf.abilityScores.CON).toBe(13) // 15 - 2
  })

  it('should validate character prerequisites', () => {
    const validCharacter = createCharacter({
      name: 'Valid Cleric',
      race: 'human',
      class: 'cleric',
      abilityScores: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 15, CHA: 13 }
    })
    
    const errors = validateCharacterPrerequisites(validCharacter)
    expect(errors).toHaveLength(0) // No errors for valid character
    
    const invalidCharacter = createCharacter({
      name: 'Invalid Cleric',
      race: 'human', 
      class: 'cleric',
      abilityScores: { STR: 12, DEX: 10, CON: 14, INT: 10, WIS: 9, CHA: 13 } // WIS too low
    })
    
    const invalidErrors = validateCharacterPrerequisites(invalidCharacter)
    expect(invalidErrors.length).toBeGreaterThan(0) // Should have WIS requirement error
    expect(invalidErrors[0]).toContain('cleric requires WIS')
  })

  it('should have properly defined sample races', () => {
    const human = sampleRaces.human
    expect(human.size).toBe('medium')
    expect(human.baseSpeed).toBe(30)
    expect(human.bonusFeats).toBe(1)
    expect(human.bonusSkillPoints).toBe(1)
    
    const dwarf = sampleRaces.dwarf
    expect(dwarf.abilityAdjustments.CON).toBe(2)
    expect(dwarf.abilityAdjustments.CHA).toBe(-2)
    expect(dwarf.baseSpeed).toBe(20) // Dwarves are slower
  })
})
