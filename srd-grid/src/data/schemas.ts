import { z } from 'zod'

export const SkillSchema = z.object({
  name: z.string(),
  keyAbility: z.enum(['STR','DEX','CON','INT','WIS','CHA']),
  trainedOnly: z.boolean().default(false),
  armorCheckPenalty: z.boolean().default(false),
})

export const FeatSchema = z.object({
  name: z.string(),
  types: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
})

export const SpellSchema = z.object({
  name: z.string(),
  school: z.string(),
  level: z.number().int().min(0),
})

export const WeaponSchema = z.object({
  name: z.string(),
  category: z.string(),
  weight: z.number().nonnegative().optional(),
})

// Save/Load schema for MVP state
export const CellFlagSchema = z.object({
  blockLoS: z.boolean().optional(),
  blockLoE: z.boolean().optional(),
  difficult: z.boolean().optional(),
  cover: z.union([z.literal(0), z.literal(2), z.literal(4), z.literal(8)]).optional(),
})

export const SaveDataSchema = z.object({
  version: z.number().int().optional(),
  grid: z.array(z.array(CellFlagSchema)),
  pawnA: z.object({ x: z.number().int(), y: z.number().int(), speed: z.number().int(), size: z.enum(['medium','large']), hp: z.number().int(), reach: z.boolean().optional() }),
  pawnB: z.object({ x: z.number().int(), y: z.number().int(), speed: z.number().int(), size: z.enum(['medium','large']), hp: z.number().int(), reach: z.boolean().optional() }),
  round: z.number().int(),
  initiative: z.object({ order: z.array(z.object({ id: z.string(), initiative: z.number().int(), dexMod: z.number().int() })), index: z.number().int() }),
  aooUsed: z.record(z.string(), z.number().int()).default({}),
  toggles: z.object({
    rangedMode: z.boolean(),
    touchMode: z.boolean(),
    flatFootedMode: z.boolean(),
    editTerrain: z.boolean(),
    preciseShot: z.boolean().optional(),
    showLoS: z.boolean().optional(),
    defensiveCast: z.boolean().optional(),
    tumble: z.boolean().optional(),
    reachA: z.boolean().optional(),
    reachB: z.boolean().optional(),
    cornerCover: z.boolean().optional()
  }),
  inputs: z.object({
    tumbleBonus: z.number().int().optional(),
    concentrationBonus: z.number().int().optional(),
    spell: z.string().optional()
  }).optional(),
  rngSeed: z.number().int().nullable().optional(),
  effects: z.object({
    baseBlockLoS: z.array(z.array(z.boolean())).optional(),
    active: z.array(z.object({ kind: z.literal('fog-cloud'), x: z.number().int(), y: z.number().int(), radius: z.number().int(), expiresAtRound: z.number().int() }))
  }).optional(),
})

export type SaveData = z.infer<typeof SaveDataSchema>
