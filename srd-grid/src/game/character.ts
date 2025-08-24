import type { SizeCategory } from '../engine/components'
import type { WeaponProperties, ArmorProperties, CharacterProficiencies } from './equipment'
import { getFeatByName as getFeatFromDatabase } from '../data/feats'

// Basic ability scores
export interface AbilityScores {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

// Race definitions
export interface RaceTraits {
  name: string
  size: SizeCategory
  baseSpeed: number
  abilityAdjustments: Partial<AbilityScores>
  bonusSkillPoints: number
  bonusFeats: number
  specialAbilities: string[]
  favoritedClass?: string // Can multiclass without penalty
  levelAdjustment: number // ECL adjustment
}

// Class definitions
export type ClassType = 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' | 'wizard'

export interface ClassFeatures {
  name: ClassType
  hitDie: number // d6, d8, d10, d12
  skillPointsPerLevel: number
  classSkills: string[]
  proficiencies: CharacterProficiencies
  baseAttackBonusProgression: 'poor' | 'average' | 'good' // 1/2, 3/4, 1 per level
  savingThrows: {
    fortitude: 'poor' | 'good'
    reflex: 'poor' | 'good' 
    will: 'poor' | 'good'
  }
  spellcasting?: {
    type: 'arcane' | 'divine'
    keyAbility: 'INT' | 'WIS' | 'CHA'
    spellsPerDay: number[][] // [level][spell_level] = spells per day
  }
}

// Feat system
export interface FeatPrerequisite {
  type: 'ability' | 'skill' | 'feat' | 'bab' | 'level' | 'class'
  name?: string
  value?: number
}

export interface Feat {
  name: string
  type: 'general' | 'metamagic' | 'item-creation' | 'fighter-bonus'
  prerequisites: FeatPrerequisite[]
  description: string
  benefits: string[]
  special?: string
}

// Character class progression
export interface ClassLevel {
  class: ClassType
  level: number
  hitPointsRolled: number
  skillPointsSpent: Record<string, number>
  featsGained: string[]
  spellsKnown?: Record<number, string[]> // [spell_level] = spell names
}

// Complete character
export interface Character {
  name: string
  race: string
  classes: ClassLevel[]
  abilityScores: AbilityScores
  hitPoints: {
    max: number
    current: number
    temporary: number
  }
  armorClass: {
    base: number
    total: number
    touch: number
    flatFooted: number
  }
  savingThrows: {
    fortitude: number
    reflex: number
    will: number
  }
  skills: Record<string, {
    ranks: number
    total: number
    classSkill: boolean
  }>
  feats: string[]
  equipment: {
    weapons: WeaponProperties[]
    armor?: ArmorProperties
    shield?: any // ShieldProperties when implemented
    items: any[] // General inventory
  }
  spells?: {
    known: Record<number, string[]>
    perDay: Record<number, number>
    prepared?: Record<number, string[]> // For prepared casters
  }
}

// Ability modifier calculation
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// BAB calculation
export function calculateBAB(classes: ClassLevel[]): number {
  let totalBAB = 0
  
  for (const classLevel of classes) {
    const progression = getBABProgression(classLevel.class)
    let classBAB: number
    
    switch (progression) {
      case 'poor':
        classBAB = Math.floor(classLevel.level / 2)
        break
      case 'average':
        classBAB = Math.floor(classLevel.level * 3 / 4)
        break
      case 'good':
        classBAB = classLevel.level
        break
    }
    
    totalBAB += classBAB
  }
  
  return totalBAB
}

// Save calculation
export function calculateSave(
  classes: ClassLevel[], 
  saveType: 'fortitude' | 'reflex' | 'will',
  abilityMod: number
): number {
  let baseSave = 0
  
  for (const classLevel of classes) {
    const progression = getSaveProgression(classLevel.class, saveType)
    let classSave: number
    
    if (progression === 'good') {
      classSave = 2 + Math.floor(classLevel.level / 2)
    } else {
      classSave = Math.floor(classLevel.level / 3)
    }
    
    baseSave += classSave
  }
  
  return baseSave + abilityMod
}

// Helper functions for class features
function getBABProgression(classType: ClassType): 'poor' | 'average' | 'good' {
  const goodBAB: ClassType[] = ['barbarian', 'fighter', 'paladin', 'ranger']
  const averageBAB: ClassType[] = ['bard', 'cleric', 'druid', 'monk', 'rogue']
  
  if (goodBAB.includes(classType)) return 'good'
  if (averageBAB.includes(classType)) return 'average'
  return 'poor'
}

function getSaveProgression(classType: ClassType, saveType: 'fortitude' | 'reflex' | 'will'): 'poor' | 'good' {
  const saveProgression: Record<ClassType, Record<string, 'poor' | 'good'>> = {
    barbarian: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    bard: { fortitude: 'poor', reflex: 'good', will: 'good' },
    cleric: { fortitude: 'good', reflex: 'poor', will: 'good' },
    druid: { fortitude: 'good', reflex: 'poor', will: 'good' },
    fighter: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    monk: { fortitude: 'good', reflex: 'good', will: 'good' },
    paladin: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    ranger: { fortitude: 'good', reflex: 'good', will: 'poor' },
    rogue: { fortitude: 'poor', reflex: 'good', will: 'poor' },
    sorcerer: { fortitude: 'poor', reflex: 'poor', will: 'good' },
    wizard: { fortitude: 'poor', reflex: 'poor', will: 'good' }
  }
  
  return saveProgression[classType][saveType]
}

// Character validation
export function validateCharacterPrerequisites(character: Character): string[] {
  const errors: string[] = []
  
  // Check ability score minimums for classes
  for (const classLevel of character.classes) {
    const requirements = getClassRequirements(classLevel.class)
    for (const [ability, minimum] of Object.entries(requirements)) {
      const score = character.abilityScores[ability as keyof AbilityScores]
      if (score < minimum) {
        errors.push(`${classLevel.class} requires ${ability} ${minimum}, but character has ${score}`)
      }
    }
  }
  
  // Check feat prerequisites
  for (const featName of character.feats) {
    const feat = getFeatByName(featName)
    if (feat) {
      for (const prereq of feat.prerequisites) {
        // Implement prerequisite checking logic
        if (!checkPrerequisite(character, prereq)) {
          errors.push(`${featName} prerequisite not met: ${prereq.type} ${prereq.name} ${prereq.value}`)
        }
      }
    }
  }
  
  return errors
}

function getClassRequirements(classType: ClassType): Partial<AbilityScores> {
  // Simplified - some classes have minimum ability requirements
  const requirements: Record<ClassType, Partial<AbilityScores>> = {
    barbarian: {},
    bard: { CHA: 11 },
    cleric: { WIS: 11 },
    druid: { WIS: 11 },
    fighter: {},
    monk: { DEX: 13, WIS: 13 },
    paladin: { CHA: 11 },
    ranger: { WIS: 11 },
    rogue: {},
    sorcerer: { CHA: 11 },
    wizard: { INT: 11 }
  }
  
  return requirements[classType]
}

function getFeatByName(name: string): Feat | null {
  return getFeatFromDatabase(name)
}

function checkPrerequisite(character: Character, prereq: FeatPrerequisite): boolean {
  switch (prereq.type) {
    case 'ability':
      if (!prereq.name || !prereq.value) return false
      const score = character.abilityScores[prereq.name as keyof AbilityScores]
      return score >= prereq.value
    case 'bab':
      if (!prereq.value) return false
      return calculateBAB(character.classes) >= prereq.value
    case 'level':
      if (!prereq.value) return false
      const totalLevel = character.classes.reduce((sum, cl) => sum + cl.level, 0)
      return totalLevel >= prereq.value
    case 'feat':
      if (!prereq.name) return false
      return character.feats.includes(prereq.name)
    // Add other prerequisite types as needed
    default:
      return true
  }
}

// Sample races
export const sampleRaces: Record<string, RaceTraits> = {
  human: {
    name: 'Human',
    size: 'medium',
    baseSpeed: 30,
    abilityAdjustments: {}, // Humans get +1 to any one ability
    bonusSkillPoints: 1,
    bonusFeats: 1,
    specialAbilities: [],
    levelAdjustment: 0
  },
  elf: {
    name: 'Elf',
    size: 'medium',
    baseSpeed: 30,
    abilityAdjustments: { DEX: 2, CON: -2 },
    bonusSkillPoints: 0,
    bonusFeats: 0,
    specialAbilities: ['Low-light Vision', 'Keen Senses', 'Elven Immunities'],
    favoritedClass: 'wizard',
    levelAdjustment: 0
  },
  dwarf: {
    name: 'Dwarf',
    size: 'medium',
    baseSpeed: 20,
    abilityAdjustments: { CON: 2, CHA: -2 },
    bonusSkillPoints: 0,
    bonusFeats: 0,
    specialAbilities: ['Darkvision 60ft', 'Stonecunning', 'Weapon Familiarity'],
    favoritedClass: 'fighter',
    levelAdjustment: 0
  },
  halfling: {
    name: 'Halfling',
    size: 'small',
    baseSpeed: 20,
    abilityAdjustments: { DEX: 2, STR: -2 },
    bonusSkillPoints: 0,
    bonusFeats: 0,
    specialAbilities: ['Small Size', 'Lucky', 'Fearless'],
    favoritedClass: 'rogue',
    levelAdjustment: 0
  }
}

// Character creation helper
export function createCharacter(options: {
  name: string
  race: string
  class: ClassType
  abilityScores: AbilityScores
}): Character {
  const race = sampleRaces[options.race] || sampleRaces.human
  const adjustedAbilities = { ...options.abilityScores }
  
  // Apply racial ability adjustments
  for (const [ability, adjustment] of Object.entries(race.abilityAdjustments)) {
    adjustedAbilities[ability as keyof AbilityScores] += adjustment
  }
  
  // Calculate initial HP (max at 1st level)
  const classHitDie = getClassHitDie(options.class)
  const conMod = getAbilityModifier(adjustedAbilities.CON)
  const maxHP = classHitDie + conMod
  
  const character: Character = {
    name: options.name,
    race: race.name,
    classes: [{
      class: options.class,
      level: 1,
      hitPointsRolled: classHitDie,
      skillPointsSpent: {},
      featsGained: [],
      spellsKnown: {}
    }],
    abilityScores: adjustedAbilities,
    hitPoints: {
      max: maxHP,
      current: maxHP,
      temporary: 0
    },
    armorClass: {
      base: 10,
      total: 10 + getAbilityModifier(adjustedAbilities.DEX),
      touch: 10 + getAbilityModifier(adjustedAbilities.DEX),
      flatFooted: 10
    },
    savingThrows: {
      fortitude: calculateSave([{ class: options.class, level: 1 } as ClassLevel], 'fortitude', conMod),
      reflex: calculateSave([{ class: options.class, level: 1 } as ClassLevel], 'reflex', getAbilityModifier(adjustedAbilities.DEX)),
      will: calculateSave([{ class: options.class, level: 1 } as ClassLevel], 'will', getAbilityModifier(adjustedAbilities.WIS))
    },
    skills: {},
    feats: [],
    equipment: {
      weapons: [],
      items: []
    }
  }
  
  return character
}

function getClassHitDie(classType: ClassType): number {
  const hitDice: Record<ClassType, number> = {
    barbarian: 12,
    bard: 6,
    cleric: 8,
    druid: 8,
    fighter: 10,
    monk: 8,
    paladin: 10,
    ranger: 8,
    rogue: 6,
    sorcerer: 4,
    wizard: 4
  }
  
  return hitDice[classType]
}
