import type { DamageType } from './combat'
import { sumWithBase, type Bonus } from '../engine/bonuses'

// Equipment categories and properties
export type WeaponCategory = 'simple' | 'martial' | 'exotic'
export type WeaponType = 'melee' | 'ranged' | 'thrown'
export type ArmorCategory = 'light' | 'medium' | 'heavy'
export type ShieldType = 'buckler' | 'light' | 'heavy' | 'tower'

export interface WeaponProperties {
  name: string
  category: WeaponCategory
  type: WeaponType
  cost: number // in gold pieces
  damage: string // e.g., "1d8", "2d4"
  damageType: DamageType[]
  critical: {
    threat: number // 20, 19, 18 for threat ranges
    multiplier: 2 | 3 | 4
  }
  range?: number // for ranged weapons, in feet
  weight: number // in pounds
  properties: string[] // 'reach', 'finesse', 'two-handed', etc.
  hardness: number
  hitPoints: number
  special?: string // Special properties description
}

export interface ArmorProperties {
  name: string
  category: ArmorCategory
  cost: number
  acBonus: number
  maxDexBonus: number | null // null = unlimited
  armorCheckPenalty: number
  arcaneSpellFailure: number // percentage
  speed30: number // speed for 30ft base creature
  speed20: number // speed for 20ft base creature
  weight: number
  hardness: number
  hitPoints: number
  material?: 'normal' | 'mithral' | 'adamantine' // Special materials
}

export interface ShieldProperties {
  name: string
  type: ShieldType
  cost: number
  acBonus: number
  armorCheckPenalty: number
  arcaneSpellFailure: number
  weight: number
  hardness: number
  hitPoints: number
  material?: 'normal' | 'mithral' | 'adamantine'
}

// Special materials
export interface MaterialModifier {
  name: 'mithral' | 'adamantine' | 'cold-iron' | 'alchemical-silver'
  armorModifiers?: {
    acPenalty?: number // reduction in ACP
    asfReduction?: number // reduction in ASF
    weightMultiplier?: number
    costMultiplier?: number
  }
  weaponModifiers?: {
    hardnessBonus?: number
    hpBonus?: number
    bypassDR?: string[] // DR types this bypasses
    costMultiplier?: number
  }
}

// Proficiency system
export type ProficiencyCategory = 'simple' | 'martial' | 'exotic'
export interface CharacterProficiencies {
  weapons: ProficiencyCategory[]
  armor: ArmorCategory[]
  shields: ShieldType[]
}

// Encumbrance system
export interface EncumbranceThresholds {
  light: number
  medium: number
  heavy: number
  liftOverHead: number
  liftOffGround: number
  dragOrPush: number
}

export function calculateCarryingCapacity(str: number): EncumbranceThresholds {
  let base: number
  
  if (str <= 10) {
    base = str * 10
  } else if (str <= 20) {
    base = (str - 10) * 20 + 100
  } else if (str <= 30) {
    base = (str - 20) * 40 + 300
  } else {
    // Very high STR follows quadratic progression
    base = Math.pow(str - 20, 2) * 10 + 300
  }
  
  return {
    light: base,
    medium: base * 2,
    heavy: base * 3,
    liftOverHead: base,
    liftOffGround: base * 2,
    dragOrPush: base * 5
  }
}

export type EncumbranceLevel = 'light' | 'medium' | 'heavy' | 'overloaded'

export function getEncumbranceLevel(carriedWeight: number, capacity: EncumbranceThresholds): EncumbranceLevel {
  if (carriedWeight <= capacity.light) return 'light'
  if (carriedWeight <= capacity.medium) return 'medium'
  if (carriedWeight <= capacity.heavy) return 'heavy'
  return 'overloaded'
}

export function getEncumbrancePenalties(level: EncumbranceLevel): {
  maxDex: number | null
  checkPenalty: number
  speedReduction: boolean
  runMultiplier: number
} {
  switch (level) {
    case 'light':
      return { maxDex: null, checkPenalty: 0, speedReduction: false, runMultiplier: 4 }
    case 'medium':
      return { maxDex: 3, checkPenalty: -3, speedReduction: true, runMultiplier: 4 }
    case 'heavy':
      return { maxDex: 1, checkPenalty: -6, speedReduction: true, runMultiplier: 3 }
    case 'overloaded':
      return { maxDex: 0, checkPenalty: -12, speedReduction: true, runMultiplier: 1 }
  }
}

// Inventory item interface
export interface InventoryItem {
  id: string
  name: string
  weight: number
  value: number // in copper pieces
  quantity: number
  equipped?: boolean
  location?: 'carried' | 'worn' | 'stored'
  properties?: WeaponProperties | ArmorProperties | ShieldProperties
}

// Currency system
export interface Currency {
  cp: number // copper pieces
  sp: number // silver pieces (10 cp)
  gp: number // gold pieces (100 cp)
  pp: number // platinum pieces (1000 cp)
}

export function currencyToCopper(currency: Currency): number {
  return currency.cp + (currency.sp * 10) + (currency.gp * 100) + (currency.pp * 1000)
}

export function copperToCurrency(totalCopper: number): Currency {
  const pp = Math.floor(totalCopper / 1000)
  totalCopper %= 1000
  const gp = Math.floor(totalCopper / 100)
  totalCopper %= 100
  const sp = Math.floor(totalCopper / 10)
  const cp = totalCopper % 10
  
  return { pp, gp, sp, cp }
}

export function currencyWeight(currency: Currency): number {
  const totalCoins = currency.cp + currency.sp + currency.gp + currency.pp
  return totalCoins / 50 // 50 coins per pound
}

// Sample weapons
export const sampleWeapons: Record<string, WeaponProperties> = {
  'dagger': {
    name: 'Dagger',
    category: 'simple',
    type: 'melee',
    cost: 200, // 2 gp in copper
    damage: '1d4',
    damageType: ['piercing', 'slashing'],
    critical: { threat: 19, multiplier: 2 },
    range: 10,
    weight: 1,
    properties: [],
    hardness: 10,
    hitPoints: 2
  },
  'longsword': {
    name: 'Longsword',
    category: 'martial',
    type: 'melee',
    cost: 1500, // 15 gp
    damage: '1d8',
    damageType: ['slashing'],
    critical: { threat: 19, multiplier: 2 },
    weight: 4,
    properties: [],
    hardness: 10,
    hitPoints: 5
  },
  'shortbow': {
    name: 'Shortbow',
    category: 'martial',
    type: 'ranged',
    cost: 3000, // 30 gp
    damage: '1d6',
    damageType: ['piercing'],
    critical: { threat: 20, multiplier: 3 },
    range: 60,
    weight: 2,
    properties: [],
    hardness: 5,
    hitPoints: 3
  },
  'greatsword': {
    name: 'Greatsword',
    category: 'martial',
    type: 'melee',
    cost: 5000, // 50 gp
    damage: '2d6',
    damageType: ['slashing'],
    critical: { threat: 19, multiplier: 2 },
    weight: 8,
    properties: ['two-handed'],
    hardness: 10,
    hitPoints: 10
  }
}

// Sample armor
export const sampleArmor: Record<string, ArmorProperties> = {
  'leather': {
    name: 'Leather Armor',
    category: 'light',
    cost: 1000, // 10 gp
    acBonus: 2,
    maxDexBonus: 6,
    armorCheckPenalty: 0,
    arcaneSpellFailure: 10,
    speed30: 30,
    speed20: 20,
    weight: 15,
    hardness: 2,
    hitPoints: 15
  },
  'chainmail': {
    name: 'Chainmail',
    category: 'medium',
    cost: 15000, // 150 gp
    acBonus: 5,
    maxDexBonus: 2,
    armorCheckPenalty: -2,
    arcaneSpellFailure: 30,
    speed30: 20,
    speed20: 15,
    weight: 40,
    hardness: 10,
    hitPoints: 25
  },
  'full-plate': {
    name: 'Full Plate',
    category: 'heavy',
    cost: 150000, // 1500 gp
    acBonus: 8,
    maxDexBonus: 1,
    armorCheckPenalty: -6,
    arcaneSpellFailure: 35,
    speed30: 20,
    speed20: 15,
    weight: 50,
    hardness: 10,
    hitPoints: 35
  }
}

// Attack calculation helpers
export function isWeaponProficient(weapon: WeaponProperties, proficiencies: CharacterProficiencies): boolean {
  return proficiencies.weapons.includes(weapon.category)
}

export function getUnprofficientPenalty(): number {
  return -4 // Non-proficient weapon penalty
}

// AC calculation with equipment
export function calculateEquippedAC(
  baseAC: number,
  armor?: ArmorProperties,
  shield?: ShieldProperties,
  dexMod: number = 0,
  otherBonuses: Bonus[] = []
): number {
  let totalAC = baseAC
  
  if (armor) {
    totalAC += armor.acBonus
    // Apply max dex bonus limitation
    const maxDex = armor.maxDexBonus
    if (maxDex !== null && dexMod > maxDex) {
      dexMod = maxDex
    }
  }
  
  if (shield) {
    totalAC += shield.acBonus
  }
  
  totalAC += dexMod
  
  if (otherBonuses.length > 0) {
    const result = sumWithBase(totalAC, otherBonuses)
    return result.total
  }
  
  return totalAC
}
