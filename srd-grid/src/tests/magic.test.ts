import { describe, it, expect } from 'vitest'
import { 
  computeSaveDC, 
  concentrationCheck, 
  arcaneSpellFailure,
  sampleSpells,
  type CastingContext 
} from '../game/magic'

describe('Magic System', () => {
  it('should calculate save DCs correctly', () => {
    const context: CastingContext = {
      casterLevel: 5,
      spellLevel: 3,
      keyAbility: 'INT',
      keyAbilityMod: 4,
      feats: []
    }
    
    const baseDC = computeSaveDC(context)
    expect(baseDC).toBe(17) // 10 + 3 (spell level) + 4 (ability mod)
    
    // With Spell Focus
    const contextWithFocus: CastingContext = {
      ...context,
      feats: ['Spell Focus']
    }
    expect(computeSaveDC(contextWithFocus)).toBe(18)
    
    // With Greater Spell Focus too
    const contextWithGreaterFocus: CastingContext = {
      ...context,
      feats: ['Spell Focus', 'Greater Spell Focus']
    }
    expect(computeSaveDC(contextWithGreaterFocus)).toBe(19)
  })

  it('should handle concentration checks', () => {
    expect(concentrationCheck(15, 10, 5)).toBe(true) // 10 + 5 = 15, meets DC
    expect(concentrationCheck(16, 10, 5)).toBe(false) // 10 + 5 = 15, fails DC 16
    expect(concentrationCheck(10, 20, 0)).toBe(true) // Natural 20 succeeds
  })

  it('should calculate arcane spell failure', () => {
    const spellWithSomatic = sampleSpells['magic-missile']
    expect(arcaneSpellFailure(spellWithSomatic, 10)).toBe(10) // 10% ASF from armor
    
    const spellWithoutSomatic = {
      ...spellWithSomatic,
      components: { verbal: true } // No somatic component
    }
    expect(arcaneSpellFailure(spellWithoutSomatic, 10)).toBe(0) // No ASF
  })

  it('should have properly defined sample spells', () => {
    const fireball = sampleSpells['fireball']
    expect(fireball).toBeDefined()
    expect(fireball.school).toBe('evocation')
    expect(fireball.descriptors).toContain('fire')
    expect(fireball.level.sorcerer).toBe(3)
    expect(fireball.level.wizard).toBe(3)
    
    const magicMissile = sampleSpells['magic-missile']
    expect(magicMissile).toBeDefined()
    expect(magicMissile.spellResistance).toBe(true)
    expect(magicMissile.save.type).toBe('none')
  })
})
