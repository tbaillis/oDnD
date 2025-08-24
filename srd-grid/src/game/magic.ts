import { type Character } from './character'
import { type DamageType } from './combat'
import { getFeatSpellDCBonus } from './feat-effects'

// Magic schools and descriptors
export type SpellSchool = 'abjuration' | 'conjuration' | 'divination' | 'enchantment' | 'evocation' | 'illusion' | 'necromancy' | 'transmutation'
export type SpellDescriptor = 'acid' | 'air' | 'chaotic' | 'cold' | 'darkness' | 'death' | 'earth' | 'electricity' | 'evil' | 'fear' | 'fire' | 'force' | 'good' | 'language-dependent' | 'lawful' | 'light' | 'mind-affecting' | 'sonic' | 'water'

// Components
export interface SpellComponents {
  verbal?: boolean
  somatic?: boolean
  material?: string // Description of material component
  focus?: string // Description of focus
  divineFocus?: boolean
  xpCost?: number
}

// Spell targeting
export type TargetType = 'self' | 'creature' | 'creatures' | 'object' | 'area' | 'ray' | 'touch'
export type AreaType = 'burst' | 'emanation' | 'spread' | 'cone' | 'line' | 'cylinder'

export interface SpellTarget {
  type: TargetType
  range: string // "25 ft + 5 ft/2 levels", "touch", "personal", etc.
  area?: {
    type: AreaType
    size: string // "20-ft radius", "30-ft cone", etc.
  }
  targets?: string // "One creature", "Up to one creature/level", etc.
}

// Duration and saves
export interface SpellDuration {
  type: 'instantaneous' | 'permanent' | 'concentration' | 'timed'
  value?: string // "1 round/level", "10 minutes", etc.
  dismissible?: boolean
}

export interface SpellSave {
  type: 'none' | 'Fortitude' | 'Reflex' | 'Will'
  effect: 'negates' | 'half' | 'partial' | 'special'
  description?: string
}

// Complete spell definition
export interface Spell {
  name: string
  school: SpellSchool
  subschool?: string
  descriptors: SpellDescriptor[]
  level: Record<string, number> // e.g., {"sorcerer": 1, "wizard": 1}
  components: SpellComponents
  castingTime: string // "1 standard action", "1 round", etc.
  target: SpellTarget
  duration: SpellDuration
  save: SpellSave
  spellResistance: boolean
  description: string
}

// Spell effect handling
export type SpellEffect = 
  | { type: 'damage', amount: string, damageType: DamageType, save?: 'half' | 'negates' }
  | { type: 'healing', amount: string }
  | { type: 'buff', bonuses: Array<{type: string, value: number, duration: string}> }
  | { type: 'debuff', penalties: Array<{type: string, value: number, duration: string}> }
  | { type: 'area-effect', effect: 'fog-cloud' | 'darkness' | 'light', radius: number, duration: string }
  | { type: 'condition', condition: string, duration: string, save?: string }

// Casting context
export interface CastingContext {
  casterLevel: number
  spellLevel: number
  keyAbility: 'INT' | 'WIS' | 'CHA'
  keyAbilityMod: number
  feats?: string[] // Spell Focus, Greater Spell Focus, etc.
  defensive?: boolean // Casting defensively
  concentration?: number // Concentration bonus
}

// Spell resolution result
export interface SpellResult {
  success: boolean
  concentrated?: boolean // If casting defensively
  spellLost?: boolean // If concentration failed
  effects: SpellEffect[]
  targets: Array<{x: number, y: number, entity?: number}>
  areaOfEffect?: Array<{x: number, y: number}>
}

// Save DC calculation
export function computeSaveDC(context: CastingContext, character?: Character): number {
  const baseLevel = context.spellLevel
  const abilityMod = context.keyAbilityMod
  let dc = 10 + baseLevel + abilityMod
  
  // Apply feat bonuses using the new feat effects system
  if (character) {
    dc += getFeatSpellDCBonus(character)
  } else {
    // Legacy compatibility - use the old hardcoded approach if no character provided
    if (context.feats?.includes('Spell Focus')) dc += 1
    if (context.feats?.includes('Greater Spell Focus')) dc += 1
  }
  
  return dc
}

// Concentration check for defensive casting
export function concentrationCheck(dc: number, roll: number, bonus: number): boolean {
  return (roll + bonus) >= dc
}

// Arcane Spell Failure chance
export function arcaneSpellFailure(
  spell: Spell, 
  armorCheckPenalty: number, 
  shieldACP: number = 0
): number {
  if (!spell.components.somatic) return 0
  
  // Base ASF from armor and shield
  let asf = armorCheckPenalty + shieldACP
  
  // Still Spell metamagic removes somatic components (not implemented here)
  return Math.max(0, Math.min(100, asf))
}

// Sample spells for MVP
export const sampleSpells: Record<string, Spell> = {
  'magic-missile': {
    name: 'Magic Missile',
    school: 'evocation',
    descriptors: ['force'],
    level: { 'sorcerer': 1, 'wizard': 1 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: { 
      type: 'creature',
      range: '100 ft + 10 ft/level',
      targets: 'Up to five creatures, no two of which can be more than 15 ft apart'
    },
    duration: { type: 'instantaneous' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: true,
    description: 'A missile of magical energy darts forth and unerringly strikes its target.'
  },
  'cure-light-wounds': {
    name: 'Cure Light Wounds',
    school: 'conjuration',
    subschool: 'healing',
    descriptors: [],
    level: { 'cleric': 1, 'druid': 1, 'ranger': 2 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: { 
      type: 'creature',
      range: 'touch',
      targets: 'Creature touched'
    },
    duration: { type: 'instantaneous' },
    save: { type: 'Will', effect: 'half', description: 'harmless; see text' },
    spellResistance: true,
    description: 'Heals 1d8+1 points of damage (max +5).'
  },
  'fireball': {
    name: 'Fireball',
    school: 'evocation',
    descriptors: ['fire'],
    level: { 'sorcerer': 3, 'wizard': 3 },
    components: { verbal: true, somatic: true, material: 'A tiny ball of bat guano and sulfur' },
    castingTime: '1 standard action',
    target: { 
      type: 'area',
      range: '400 ft + 40 ft/level',
      area: { type: 'spread', size: '20-ft radius' }
    },
    duration: { type: 'instantaneous' },
    save: { type: 'Reflex', effect: 'half' },
    spellResistance: true,
    description: 'Deals 1d6 fire damage per caster level (max 10d6) to all creatures in area.'
  },
  'invisibility': {
    name: 'Invisibility',
    school: 'illusion',
    subschool: 'glamer',
    descriptors: [],
    level: { 'sorcerer': 2, 'wizard': 2, 'bard': 2 },
    components: { verbal: true, somatic: true, material: 'An eyelash encased in gum arabic' },
    castingTime: '1 standard action',
    target: { 
      type: 'creature',
      range: 'touch',
      targets: 'You or creature touched'
    },
    duration: { type: 'timed', value: '1 min/level', dismissible: true },
    save: { type: 'Will', effect: 'negates', description: 'harmless' },
    spellResistance: true,
    description: 'Subject is invisible for 1 min/level or until it attacks.'
  },
  'fog-cloud': {
    name: 'Fog Cloud',
    school: 'conjuration',
    subschool: 'creation',
    descriptors: [],
    level: { 'sorcerer': 2, 'wizard': 2, 'druid': 2 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: { 
      type: 'area',
      range: '100 ft + 10 ft/level',
      area: { type: 'spread', size: '20-ft radius' }
    },
    duration: { type: 'timed', value: '10 min/level' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'Fog obscures all sight, including darkvision, beyond 5 feet.'
  },
  'protection-from-evil': {
    name: 'Protection from Evil',
    school: 'abjuration',
    descriptors: ['good'],
    level: { 'cleric': 1, 'paladin': 1, 'sorcerer': 1, 'wizard': 1 },
    components: { verbal: true, somatic: true, material: 'A little powdered silver' },
    castingTime: '1 standard action',
    target: { 
      type: 'creature',
      range: 'touch',
      targets: 'Creature touched'
    },
    duration: { type: 'timed', value: '1 min/level', dismissible: true },
    save: { type: 'Will', effect: 'negates', description: 'harmless' },
    spellResistance: false,
    description: '+2 AC and saves vs evil creatures, blocks mental control and summoned creatures.'
  }
}

export const magic = { version: 2, spells: sampleSpells }
