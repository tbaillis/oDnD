import { describe, it, expect } from 'vitest'
import { getFeatByName, getGeneralFeats, searchFeats } from '../data/feats'
import { getFeatSpellDCBonus, getFeatSaveBonus, getFeatSkillBonus, characterHasFeat } from '../game/feat-effects'
import { createCharacter } from '../game/character'

describe('Feat System', () => {
  it('should retrieve feats by name from database', () => {
    const alertness = getFeatByName('Alertness')
    expect(alertness).toBeDefined()
    expect(alertness?.name).toBe('Alertness')
    expect(alertness?.type).toBe('general')
    expect(alertness?.benefits).toContain('+2 bonus on Listen checks')
    expect(alertness?.benefits).toContain('+2 bonus on Spot checks')

    const nonExistent = getFeatByName('Non-Existent Feat')
    expect(nonExistent).toBeNull()
  })

  it('should get general feats', () => {
    const generalFeats = getGeneralFeats()
    expect(generalFeats.length).toBeGreaterThan(40) // Should have many general feats
    expect(generalFeats.every(feat => feat.type === 'general')).toBe(true)
  })

  it('should search feats by name and description', () => {
    const alertnessFeats = searchFeats('alert')
    expect(alertnessFeats.some(feat => feat.name === 'Alertness')).toBe(true)

    const combatFeats = searchFeats('combat')
    expect(combatFeats.length).toBeGreaterThan(5)
  })

  it('should calculate feat effects for characters', () => {
    const character = createCharacter({
      name: 'Test',
      race: 'human',
      class: 'fighter',
      abilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
    })

    // Add some feats
    character.feats = ['Great Fortitude', 'Alertness', 'Dodge']

    // Test feat presence
    expect(characterHasFeat(character, 'Great Fortitude')).toBe(true)
    expect(characterHasFeat(character, 'Alertness')).toBe(true)
    expect(characterHasFeat(character, 'Power Attack')).toBe(false)

    // Test save bonuses
    expect(getFeatSaveBonus(character, 'Fort')).toBe(2) // Great Fortitude
    expect(getFeatSaveBonus(character, 'Will')).toBe(0)

    // Test skill bonuses
    expect(getFeatSkillBonus(character, 'Listen')).toBe(2) // Alertness
    expect(getFeatSkillBonus(character, 'Spot')).toBe(2) // Alertness
    expect(getFeatSkillBonus(character, 'Climb')).toBe(0)
  })

  it('should handle metamagic feats', () => {
    const empowerSpell = getFeatByName('Empower Spell')
    expect(empowerSpell?.type).toBe('metamagic')
    expect(empowerSpell?.description).toContain('greater effect')
  })

  it('should handle item creation feats', () => {
    const brewPotion = getFeatByName('Brew Potion')
    expect(brewPotion?.type).toBe('item-creation')
    expect(brewPotion?.prerequisites).toContainEqual({ type: 'level', value: 3 })
  })

  it('should handle fighter bonus feats', () => {
    const powerAttack = getFeatByName('Power Attack')
    expect(powerAttack?.type).toBe('fighter-bonus')
    expect(powerAttack?.prerequisites).toContainEqual({ type: 'ability', name: 'STR', value: 13 })
  })

  it('should handle spell-related feat effects', () => {
    const character = createCharacter({
      name: 'Wizard',
      race: 'human', 
      class: 'wizard',
      abilityScores: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 13, CHA: 10 }
    })

    character.feats = ['Spell Focus', 'Greater Spell Focus', 'Spell Penetration']

    // Test spell DC bonuses
    const dcBonus = getFeatSpellDCBonus(character)
    expect(dcBonus).toBe(2) // Spell Focus (1) + Greater Spell Focus (1)
  })
})
