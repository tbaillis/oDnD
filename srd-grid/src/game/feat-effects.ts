import type { Bonus, BonusType } from '../engine/bonuses'
import type { Character } from '../game/character'

/**
 * D&D 3.5 Feat Effects System
 * Integrates feat benefits with the bonus resolution system
 */

export interface FeatEffect {
  bonusType: BonusType
  target: string // What the bonus applies to (e.g., 'attack-roll', 'skill-Jump', 'saves-Fort', etc.)
  value: number
  condition?: string // Optional condition for when the bonus applies
}

export interface FeatBonus extends Bonus {
  target: string
  condition?: string
}

/**
 * Maps feat names to their mechanical effects in the bonus system
 */
export const FEAT_EFFECTS: Record<string, FeatEffect[]> = {
  // Skill-boosting feats (+2 bonuses)
  'Acrobatic': [
    { bonusType: 'feat', target: 'skill-Jump', value: 2 },
    { bonusType: 'feat', target: 'skill-Tumble', value: 2 }
  ],

  'Agile': [
    { bonusType: 'feat', target: 'skill-Balance', value: 2 },
    { bonusType: 'feat', target: 'skill-Escape Artist', value: 2 }
  ],

  'Alertness': [
    { bonusType: 'feat', target: 'skill-Listen', value: 2 },
    { bonusType: 'feat', target: 'skill-Spot', value: 2 }
  ],

  'Animal Affinity': [
    { bonusType: 'feat', target: 'skill-Handle Animal', value: 2 },
    { bonusType: 'feat', target: 'skill-Ride', value: 2 }
  ],

  'Athletic': [
    { bonusType: 'feat', target: 'skill-Climb', value: 2 },
    { bonusType: 'feat', target: 'skill-Swim', value: 2 }
  ],

  'Deceitful': [
    { bonusType: 'feat', target: 'skill-Disguise', value: 2 },
    { bonusType: 'feat', target: 'skill-Forgery', value: 2 }
  ],

  'Deft Hands': [
    { bonusType: 'feat', target: 'skill-Sleight of Hand', value: 2 },
    { bonusType: 'feat', target: 'skill-Use Rope', value: 2 }
  ],

  'Diligent': [
    { bonusType: 'feat', target: 'skill-Appraise', value: 2 },
    { bonusType: 'feat', target: 'skill-Decipher Script', value: 2 }
  ],

  'Investigator': [
    { bonusType: 'feat', target: 'skill-Gather Information', value: 2 },
    { bonusType: 'feat', target: 'skill-Search', value: 2 }
  ],

  'Magical Aptitude': [
    { bonusType: 'feat', target: 'skill-Spellcraft', value: 2 },
    { bonusType: 'feat', target: 'skill-Use Magic Device', value: 2 }
  ],

  'Negotiator': [
    { bonusType: 'feat', target: 'skill-Diplomacy', value: 2 },
    { bonusType: 'feat', target: 'skill-Sense Motive', value: 2 }
  ],

  'Nimble Fingers': [
    { bonusType: 'feat', target: 'skill-Disable Device', value: 2 },
    { bonusType: 'feat', target: 'skill-Open Lock', value: 2 }
  ],

  'Persuasive': [
    { bonusType: 'feat', target: 'skill-Bluff', value: 2 },
    { bonusType: 'feat', target: 'skill-Intimidate', value: 2 }
  ],

  'Self-Sufficient': [
    { bonusType: 'feat', target: 'skill-Heal', value: 2 },
    { bonusType: 'feat', target: 'skill-Survival', value: 2 }
  ],

  'Stealthy': [
    { bonusType: 'feat', target: 'skill-Hide', value: 2 },
    { bonusType: 'feat', target: 'skill-Move Silently', value: 2 }
  ],

  // Save bonuses
  'Great Fortitude': [
    { bonusType: 'feat', target: 'saves-Fort', value: 2 }
  ],

  'Iron Will': [
    { bonusType: 'feat', target: 'saves-Will', value: 2 }
  ],

  'Lightning Reflexes': [
    { bonusType: 'feat', target: 'saves-Reflex', value: 2 }
  ],

  // Combat feats
  'Combat Casting': [
    { bonusType: 'feat', target: 'concentration-defensive', value: 4 },
    { bonusType: 'feat', target: 'concentration-grapple', value: 4 }
  ],

  'Dodge': [
    { bonusType: 'dodge', target: 'ac', value: 1, condition: 'designated opponent' }
  ],

  'Improved Initiative': [
    { bonusType: 'feat', target: 'initiative', value: 4 }
  ],

  'Point Blank Shot': [
    { bonusType: 'feat', target: 'attack-ranged', value: 1, condition: 'within 30 feet' },
    { bonusType: 'feat', target: 'damage-ranged', value: 1, condition: 'within 30 feet' }
  ],

  // Weapon Focus (template - actual instances would specify weapon)
  'Weapon Focus': [
    { bonusType: 'feat', target: 'attack-weapon', value: 1 }
  ],

  'Weapon Specialization': [
    { bonusType: 'feat', target: 'damage-weapon', value: 2 }
  ],

  'Greater Weapon Focus': [
    { bonusType: 'feat', target: 'attack-weapon', value: 1 } // Stacks with Weapon Focus
  ],

  'Greater Weapon Specialization': [
    { bonusType: 'feat', target: 'damage-weapon', value: 2 } // Stacks with Weapon Specialization
  ],

  // Spell-related feats
  'Spell Focus': [
    { bonusType: 'feat', target: 'spell-dc', value: 1 } // For specific school
  ],

  'Greater Spell Focus': [
    { bonusType: 'feat', target: 'spell-dc', value: 1 } // Stacks with Spell Focus
  ],

  'Spell Penetration': [
    { bonusType: 'feat', target: 'caster-level-check', value: 2 }
  ],

  'Greater Spell Penetration': [
    { bonusType: 'feat', target: 'caster-level-check', value: 2 } // Stacks with Spell Penetration
  ],

  // Special combat feats
  'Blind-Fight': [
    // Re-roll miss chance for concealment - handled as special case in combat
  ],

  'Combat Reflexes': [
    // Additional AoOs based on Dex - handled as special case in combat
  ],

  // Defensive feats
  'Two-Weapon Defense': [
    { bonusType: 'shield', target: 'ac', value: 1, condition: 'wielding two weapons' }
  ],

  'Mobility': [
    { bonusType: 'dodge', target: 'ac', value: 4, condition: 'moving out of threatened square' }
  ],

  // Hit point bonuses
  'Toughness': [
    { bonusType: 'feat', target: 'hit-points', value: 3 }
  ],

  // Skill Focus (template - actual instances would specify skill)
  'Skill Focus': [
    { bonusType: 'feat', target: 'skill', value: 3 }
  ],

  // Endurance benefits (handled as special cases mostly)
  'Endurance': [
    { bonusType: 'feat', target: 'constitution-checks', value: 4, condition: 'running, forced march, breath holding, starvation, thirst' },
    { bonusType: 'feat', target: 'saves-Fort', value: 4, condition: 'hot/cold environments, suffocation' }
  ]
}

/**
 * Get all feat effects for a character based on their feats
 */
export function getCharacterFeatEffects(character: Character): FeatBonus[] {
  const effects: FeatBonus[] = []

  for (const featName of character.feats) {
    const featEffects = FEAT_EFFECTS[featName]
    if (featEffects) {
      for (const effect of featEffects) {
        effects.push({
          type: effect.bonusType,
          value: effect.value,
          source: `Feat: ${featName}`,
          target: effect.target,
          condition: effect.condition
        })
      }
    }
  }

  return effects
}

/**
 * Get feat effects for a specific feat
 */
export function getFeatEffects(featName: string): FeatEffect[] {
  return FEAT_EFFECTS[featName] || []
}

/**
 * Check if a character has a specific feat
 */
export function characterHasFeat(character: Character, featName: string): boolean {
  return character.feats.includes(featName)
}

/**
 * Get skill bonuses from feats for a specific skill
 */
export function getFeatSkillBonus(character: Character, skillName: string): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === `skill-${skillName}` || effect.target === 'skill') {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get save bonuses from feats for a specific save
 */
export function getFeatSaveBonus(character: Character, saveType: 'Fort' | 'Reflex' | 'Will'): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === `saves-${saveType}`) {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get attack bonuses from feats
 */
export function getFeatAttackBonus(character: Character, attackType?: string): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'attack-ranged' || effect.target === 'attack-weapon' || 
        (attackType && effect.target === `attack-${attackType}`)) {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get damage bonuses from feats
 */
export function getFeatDamageBonus(character: Character, damageType?: string): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'damage-ranged' || effect.target === 'damage-weapon' || 
        (damageType && effect.target === `damage-${damageType}`)) {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get AC bonuses from feats
 */
export function getFeatACBonus(character: Character): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'ac') {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get initiative bonuses from feats
 */
export function getFeatInitiativeBonus(character: Character): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'initiative') {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get spell DC bonuses from feats for a specific school
 */
export function getFeatSpellDCBonus(character: Character): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'spell-dc') {
      bonus += effect.value
    }
  }
  
  return bonus
}

/**
 * Get caster level check bonuses from feats (for spell penetration)
 */
export function getFeatCasterLevelBonus(character: Character): number {
  let bonus = 0
  const effects = getCharacterFeatEffects(character)
  
  for (const effect of effects) {
    if (effect.target === 'caster-level-check') {
      bonus += effect.value
    }
  }
  
  return bonus
}
