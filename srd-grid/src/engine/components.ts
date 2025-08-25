import { defineComponent, Types } from 'bitecs'

// BitECS component definitions using SoA (Structure of Arrays)
export const GridPosition = defineComponent({
  x: Types.f32,
  y: Types.f32,
  layer: Types.i8
})

export const SpriteComp = defineComponent({
  spriteRef: Types.ui32, // Reference to sprite in a separate mapping
  z: Types.f32
})

export const Team = defineComponent({
  id: Types.ui8 // Team ID (0 = neutral, 1 = party, 2+ = enemy factions)
})

export const Size = defineComponent({
  category: Types.ui8, // 0=fine, 1=diminutive, 2=tiny, 3=small, 4=medium, 5=large, 6=huge, 7=gargantuan, 8=colossal
  reach: Types.f32
})

export const Vision = defineComponent({
  sight: Types.f32,
  darkvision: Types.f32,
  blindsense: Types.f32
})

export const Stats = defineComponent({
  STR: Types.i8,
  DEX: Types.i8,
  CON: Types.i8,
  INT: Types.i8,
  WIS: Types.i8,
  CHA: Types.i8,
  BAB: Types.i8,
  Fort: Types.i8,
  Ref: Types.i8,
  Will: Types.i8
})

export const HP = defineComponent({
  current: Types.i16,
  max: Types.i16,
  temp: Types.i16
})

export const ACBreakdown = defineComponent({
  base: Types.i8,
  armor: Types.i8,
  shield: Types.i8,
  natural: Types.i8,
  deflection: Types.i8,
  dodge: Types.i8,
  misc: Types.i8
})

// Shape/type for AC breakdown when used as a plain JS object (not BitECS component)
export interface ACBreakdownShape {
  base: number
  armor: number
  shield: number
  natural: number
  deflection: number
  dodge: number
  misc: number
}

export const Movement = defineComponent({
  speed: Types.f32,
  encumberedSpeed: Types.f32
})

export const ConditionsBitset = defineComponent({
  flags: Types.ui32 // Bitmask for conditions: stunned, prone, flat-footed, invisible, etc.
})

// Time component for effects duration tracking
export const TimeComponent = defineComponent({
  delta: Types.f32,
  elapsed: Types.f32
})

// Type definitions for working with components
export type SizeCategory = 'fine'|'diminutive'|'tiny'|'small'|'medium'|'large'|'huge'|'gargantuan'|'colossal'

export const SIZE_CATEGORIES: SizeCategory[] = [
  'fine', 'diminutive', 'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal'
]

export interface EffectsEntry { 
  id: string
  durationRounds: number
  source?: string
}
