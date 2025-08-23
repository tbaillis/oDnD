import { describe, it, expect } from 'vitest'
import { 
  calculateCarryingCapacity, 
  getEncumbranceLevel, 
  getEncumbrancePenalties,
  currencyToCopper,
  copperToCurrency,
  currencyWeight,
  calculateEquippedAC,
  sampleWeapons,
  sampleArmor,
  isWeaponProficient,
  type Currency,
  type CharacterProficiencies
} from '../game/equipment'

describe('Equipment System', () => {
  it('should calculate carrying capacity correctly', () => {
    const capacity = calculateCarryingCapacity(15)
    expect(capacity.light).toBe(200) // STR 15 = 200 lb light load
    expect(capacity.medium).toBe(400)
    expect(capacity.heavy).toBe(600)
    expect(capacity.liftOverHead).toBe(200)
    expect(capacity.liftOffGround).toBe(400)
    expect(capacity.dragOrPush).toBe(1000)
  })

  it('should determine encumbrance level', () => {
    const capacity = calculateCarryingCapacity(15)
    
    expect(getEncumbranceLevel(150, capacity)).toBe('light')
    expect(getEncumbranceLevel(250, capacity)).toBe('medium')
    expect(getEncumbranceLevel(500, capacity)).toBe('heavy')
    expect(getEncumbranceLevel(700, capacity)).toBe('overloaded')
  })

  it('should apply encumbrance penalties', () => {
    const lightPenalties = getEncumbrancePenalties('light')
    expect(lightPenalties.maxDex).toBeNull()
    expect(lightPenalties.checkPenalty).toBe(0)
    expect(lightPenalties.speedReduction).toBe(false)
    
    const heavyPenalties = getEncumbrancePenalties('heavy')
    expect(heavyPenalties.maxDex).toBe(1)
    expect(heavyPenalties.checkPenalty).toBe(-6)
    expect(heavyPenalties.speedReduction).toBe(true)
  })

  it('should handle currency conversions', () => {
    const currency: Currency = { cp: 5, sp: 3, gp: 2, pp: 1 }
    const totalCopper = currencyToCopper(currency)
    expect(totalCopper).toBe(1235) // 1000 + 200 + 30 + 5
    
    const backToCurrency = copperToCurrency(1235)
    expect(backToCurrency).toEqual({ pp: 1, gp: 2, sp: 3, cp: 5 })
    
    const weight = currencyWeight(currency)
    expect(weight).toBe((1 + 2 + 3 + 5) / 50) // 11 coins = 0.22 pounds
  })

  it('should calculate equipped AC correctly', () => {
    const leather = sampleArmor['leather']
    const baseAC = 10
    const dexMod = 3
    
    const ac = calculateEquippedAC(baseAC, leather, undefined, dexMod)
    expect(ac).toBe(15) // 10 base + 2 armor + 3 dex
    
    // Test dex cap
    const chainmail = sampleArmor['chainmail']
    const acWithDexCap = calculateEquippedAC(baseAC, chainmail, undefined, dexMod)
    expect(acWithDexCap).toBe(17) // 10 base + 5 armor + 2 dex (capped by armor)
  })

  it('should check weapon proficiency', () => {
    const proficiencies: CharacterProficiencies = {
      weapons: ['simple', 'martial'],
      armor: ['light', 'medium'],
      shields: ['light']
    }
    
    const dagger = sampleWeapons['dagger']
    const longsword = sampleWeapons['longsword']
    
    expect(isWeaponProficient(dagger, proficiencies)).toBe(true) // Simple weapon
    expect(isWeaponProficient(longsword, proficiencies)).toBe(true) // Martial weapon
    
    const limitedProficiencies: CharacterProficiencies = {
      weapons: ['simple'],
      armor: [],
      shields: []
    }
    
    expect(isWeaponProficient(longsword, limitedProficiencies)).toBe(false) // No martial proficiency
  })

  it('should have properly defined sample equipment', () => {
    const longsword = sampleWeapons['longsword']
    expect(longsword.category).toBe('martial')
    expect(longsword.damage).toBe('1d8')
    expect(longsword.critical.threat).toBe(19)
    
    const fullPlate = sampleArmor['full-plate']
    expect(fullPlate.category).toBe('heavy')
    expect(fullPlate.acBonus).toBe(8)
    expect(fullPlate.maxDexBonus).toBe(1)
  })
})
