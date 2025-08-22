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
