// Monster data types for D&D 3.5 SRD monsters
export interface MonsterAbilities {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface MonsterSaves {
  fortitude: number
  reflex: number
  will: number
}

export interface MonsterSkills {
  [skillName: string]: number
}

export interface MonsterSpecialAbility {
  name: string
  type: 'Ex' | 'Su' | 'Sp' | 'Special' // Extraordinary, Supernatural, Spell-like, Special
  description: string
  saveDC?: number
}

export interface MonsterAttack {
  name: string
  attackBonus: number
  damage: string
  type: 'melee' | 'ranged'
  reach?: number
  special?: string
}

export interface MonsterACBreakdown {
  total: number
  touch: number
  flatFooted: number
  size: number
  dex: number
  natural: number
  armor?: number
  shield?: number
  deflection?: number
  dodge?: number
  misc?: number
}

export interface MonsterSpeed {
  land: number
  fly?: number
  swim?: number
  climb?: number
  burrow?: number
}

export type MonsterSize = 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal'
export type MonsterType = 'Aberration' | 'Animal' | 'Construct' | 'Dragon' | 'Elemental' | 'Fey' | 'Giant' | 'Humanoid' | 'Magical Beast' | 'Monstrous Humanoid' | 'Ooze' | 'Outsider' | 'Plant' | 'Undead' | 'Vermin'
export type MonsterAlignment = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | 'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral' | 'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil'

export interface MonsterData {
  id: string
  name: string
  
  // Basic stats
  size: MonsterSize
  type: MonsterType
  subtype?: string[]
  hitDice: string
  hitPoints: { average: number; roll: string }
  initiative: number
  speed: MonsterSpeed
  
  // Combat stats
  armorClass: MonsterACBreakdown
  baseAttack: number
  grapple: number
  attacks: MonsterAttack[]
  fullAttacks?: MonsterAttack[]
  space: string
  reach: string
  
  // Abilities & Saves
  abilities: MonsterAbilities
  saves: MonsterSaves
  skills: MonsterSkills
  feats: string[]
  
  // Special abilities
  specialAttacks: MonsterSpecialAbility[]
  specialQualities: MonsterSpecialAbility[]
  
  // Metadata
  challengeRating: number | string // Can be 1/8, 1/4, 1/2, 1, 2, etc.
  environment: string
  organization: string
  treasure: string
  alignment: MonsterAlignment
  advancement?: string
  levelAdjustment?: string
  
  // Additional data for combat
  damageReduction?: { amount: number; bypass: string }
  spellResistance?: number
  energyResistance?: { [type: string]: number }
  energyImmunity?: string[]
  damageImmunity?: string[]
  vulnerability?: string[]
  
  // Visual/flavor
  description?: string
}

// Helper interface for monster selection
export interface MonsterSelectionFilter {
  name?: string
  type?: MonsterType
  size?: MonsterSize
  challengeRating?: { min?: number; max?: number }
  environment?: string
  alignment?: MonsterAlignment
}

// Combat integration interface
export interface MonsterCombatStats {
  id: string
  name: string
  hp: { current: number; max: number }
  ac: number
  speed: number
  size: MonsterSize
  reach: number
  abilities: MonsterAbilities
  saves: MonsterSaves
  specialAbilities: MonsterSpecialAbility[]
  attacks: MonsterAttack[]
  damageReduction?: { amount: number; bypass: string }
  energyResistance?: { [type: string]: number }
}
