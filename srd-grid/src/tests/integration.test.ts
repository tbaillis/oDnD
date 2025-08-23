import { describe, it, expect } from 'vitest'
import { createSampleFighter, createSampleWizard, createSampleCleric, sampleData } from '../data/sampleData'
import { createWorld } from '../engine/world'

describe('Integration Tests', () => {
  it('should create sample characters with proper integration', () => {
    const fighter = createSampleFighter()
    expect(fighter.name).toBe('Sir Garrett')
    expect(fighter.classes[0].class).toBe('fighter')
    expect(fighter.equipment.weapons).toHaveLength(1)
    expect(fighter.equipment.weapons[0].name).toBe('Longsword')
    expect(fighter.feats).toContain('Power Attack')
    expect(fighter.skills.Climb).toBeDefined()
  })

  it('should create sample spellcasters with spells', () => {
    const wizard = createSampleWizard()
    expect(wizard.spells?.known[1]).toContain('magic-missile')
    
    const cleric = createSampleCleric()
    expect(cleric.spells?.known[1]).toContain('cure-light-wounds')
  })

  it('should have all required sample data', () => {
    expect(sampleData.characters.fighter).toBeDefined()
    expect(sampleData.characters.wizard).toBeDefined()
    expect(sampleData.characters.cleric).toBeDefined()
    
    expect(sampleData.spells['magic-missile']).toBeDefined()
    expect(sampleData.spells['fireball']).toBeDefined()
    
    expect(sampleData.equipment.weapons.longsword).toBeDefined()
    expect(sampleData.equipment.armor['chainmail']).toBeDefined()
  })

  it('should create ECS world successfully', () => {
    const world = createWorld()
    expect(world.ecs).toBeDefined()
    expect(world.time).toBeDefined()
    expect(world.time.gameTime).toBe(0)
    expect(world.time.roundCount).toBe(0)
  })

  it('should integrate all major systems', () => {
    // Test that all our major systems can be imported and initialized
    const world = createWorld()
    const fighter = createSampleFighter()
    
    // Verify the character has stats that would work with combat system
    expect(fighter.abilityScores.STR).toBeGreaterThan(10)
    expect(fighter.hitPoints.max).toBeGreaterThan(0)
    expect(fighter.armorClass.total).toBeGreaterThan(10)
    
    // Verify equipment integration
    expect(fighter.equipment.armor?.acBonus).toBeGreaterThan(0)
    expect(fighter.equipment.weapons[0].damage).toBeDefined()
    
    // Verify world can track time
    expect(world.time.delta).toBe(0)
    expect(world.time.elapsed).toBe(0)
  })
})
