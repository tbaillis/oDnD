import { d20, sessionRNG, type RNG } from '../engine/rng'
import type { ACBreakdown } from '../engine/components'
import { resolveBonuses, type Bonus } from '../engine/bonuses'

export type DamageType = 'bludgeoning'|'piercing'|'slashing'|'fire'|'cold'|'electricity'|'acid'|'sonic'|'force'|'positive'|'negative'

export interface AttackProfile {
  bab: number
  abilityMod: number // STR for melee, DEX for ranged, etc.
  sizeMod?: number
  miscBonuses?: Bonus[] // to hit bonuses
  threatRange?: number // 20 default, 19 for 19-20/x2
  critMult?: 2|3|4
}

export interface DefenderProfile {
  ac: ACBreakdown
  flatFooted?: boolean
  touchAttack?: boolean
  miscBonuses?: Bonus[] // e.g., dodge vs specific attacker
  damageReduction?: { amount: number, bypass?: string } // DR 5/magic etc. (simplified)
  energyResistance?: Partial<Record<DamageType, number>>
  regeneration?: { rate: number, bypass?: DamageType[] }
  vulnerability?: DamageType[] // +50% damage from listed types
  // Objects/hardness handling (Breaking & Entering SRD): energy modifiers apply before hardness
  isObject?: boolean
  objectHardness?: number
}

export function computeAC(ac: ACBreakdown, opts?: { touch?: boolean, flatFooted?: boolean, misc?: Bonus[] }) {
  const baseParts = [] as number[]
  baseParts.push(ac.base)
  if (!opts?.touch) {
    baseParts.push(ac.armor, ac.shield, ac.natural, ac.deflection)
  } else {
    baseParts.push(ac.deflection)
  }
  if (!opts?.flatFooted) {
    baseParts.push(ac.dodge)
  }
  baseParts.push(ac.misc)
  let total = baseParts.reduce((a,b)=>a+(b||0), 0)
  if (opts?.misc && opts.misc.length) {
    const res = resolveBonuses(opts.misc)
    total += res.total
  }
  return total
}

export interface AttackOutcome {
  attackRoll: number
  totalToHit: number
  hit: boolean
  critical: boolean
  concealmentMiss?: boolean
}

export function attackRoll(attacker: AttackProfile, defender: DefenderProfile, rng: RNG = sessionRNG, opts?: { coverBonus?: 0|4|8, concealment?: 0|20|50 }): AttackOutcome {
  const roll = d20(rng)
  const threat = attacker.threatRange ?? 20
  const misc = attacker.miscBonuses ? resolveBonuses(attacker.miscBonuses).total : 0
  const cover = opts?.coverBonus ?? 0
  const toHit = roll + attacker.bab + attacker.abilityMod + (attacker.sizeMod||0) + misc

  const acValue = computeAC(defender.ac, { touch: defender.touchAttack, flatFooted: defender.flatFooted, misc: defender.miscBonuses }) + cover
  let hit = toHit >= acValue || roll === 20
  let critical = false
  let concealmentMiss = false

  if (hit && roll >= threat) {
    // confirm
  const confirmRoll = d20(rng)
    const confirmToHit = confirmRoll + attacker.bab + attacker.abilityMod + (attacker.sizeMod||0) + misc
    if (confirmToHit >= acValue || confirmRoll === 20) critical = true
  }

  // Concealment miss chance (20% or 50%) when hit
  if (hit && (opts?.concealment === 20 || opts?.concealment === 50)) {
    const pct = opts.concealment
    const roll100 = Math.floor((d20(rng) - 1) * 5) + 1 // quick 1..100 via d20 mapping
    if (roll100 <= pct) {
      hit = false
      concealmentMiss = true
    }
  }

  return { attackRoll: roll, totalToHit: toHit, hit, critical, concealmentMiss }
}

export interface DamagePacket {
  amount: number
  types: DamageType[]
  // Optional tags that can bypass DR (e.g., 'magic', 'adamantine', 'good').
  // Simplified: compared against defender.damageReduction.bypass if provided.
  bypassTags?: string[]
}

export interface AppliedDamage {
  taken: number
  preventedByDR?: number
  preventedByER?: Partial<Record<DamageType, number>>
  wasLethal?: boolean
  regenerationApplied?: number
  vulnerabilityBonus?: number
  hardnessPrevented?: number
}

export function applyDamage(defender: DefenderProfile, dmg: DamagePacket): AppliedDamage {
  let remaining = dmg.amount
  const preventedByER: Partial<Record<DamageType, number>> = {}
  let preventedByDR = 0
  let hardnessPrevented = 0
  let vulnerabilityBonus = 0

  const isPhysical = (t: DamageType) => (t === 'bludgeoning' || t === 'piercing' || t === 'slashing')

  // Objects: apply energy attack modifiers BEFORE hardness (SRD Breaking & Entering)
  if (defender.isObject && defender.objectHardness && defender.objectHardness > 0) {
    // If damage is energy vs objects, scale first.
    if (dmg.types.includes('cold')) {
      remaining = Math.floor(remaining / 4) || (remaining > 0 ? 1 : 0)
    } else if (dmg.types.includes('electricity') || dmg.types.includes('fire')) {
      remaining = Math.floor(remaining / 2) || (remaining > 0 ? 1 : 0)
    } else if (dmg.types.includes('acid') || dmg.types.includes('sonic')) {
      // full damage
    }
    // Then subtract hardness
    const prevented = Math.min(defender.objectHardness, remaining)
    remaining -= prevented
    hardnessPrevented = prevented
  }

  // Energy resistance per type (simplified to apply against the whole packet for that type)
  for (const t of dmg.types) {
    const er = defender.energyResistance?.[t]
    if (er && !isPhysical(t)) {
      const prevent = Math.min(er, remaining)
      remaining -= prevent
      preventedByER[t] = (preventedByER[t] || 0) + prevent
    }
  }

  // Damage Reduction for physical unless bypassed
  if (dmg.types.some(isPhysical)) {
    const dr = defender.damageReduction?.amount || 0
    const bypassKey = defender.damageReduction?.bypass
    const bypassed = !!(bypassKey && dmg.bypassTags && dmg.bypassTags.includes(bypassKey))
    if (dr > 0 && !bypassed) {
      const prevent = Math.min(dr, remaining)
      remaining -= prevent
      preventedByDR += prevent
    }
  }

  // Vulnerability: +50% damage from listed energy types; apply after ER/DR and before regeneration conversion
  if (defender.vulnerability && defender.vulnerability.length > 0) {
    const vulnerable = dmg.types.some(t => defender.vulnerability!.includes(t))
    if (vulnerable && remaining > 0) {
      const bonus = Math.floor(remaining / 2)
      remaining += bonus
      vulnerabilityBonus = bonus
    }
  }

  // Regeneration: if none of the damage types bypass, damage becomes nonlethal
  let wasLethal = true
  let regenerationApplied = 0
  if (defender.regeneration && remaining > 0) {
    const bypass = defender.regeneration.bypass || []
    const anyBypass = dmg.types.some(t => bypass.includes(t))
    if (!anyBypass) {
      wasLethal = false
      regenerationApplied = defender.regeneration.rate
    }
  }

  return {
    taken: Math.max(0, remaining),
    preventedByDR: preventedByDR || undefined,
    preventedByER: Object.keys(preventedByER).length ? preventedByER : undefined,
    wasLethal,
    regenerationApplied: regenerationApplied || undefined,
    vulnerabilityBonus: vulnerabilityBonus || undefined,
    hardnessPrevented: hardnessPrevented || undefined,
  }
}

// Simple weapon damage roller with STR scaling and crit multiplier support.
export function rollWeaponDamage(rng: RNG = sessionRNG, opts: {
  count: number
  sides: number
  flatBonus?: number
  strMod?: number
  strScale?: number // e.g., 1 for 1H melee, 1.5 for 2H, 0.5 offhand
  critMult?: 1|2|3|4
}): number {
  const { count, sides } = opts
  let total = 0
  for (let i=0;i<count;i++) total += Math.floor(rng()*sides)+1
  if (opts.strMod) total += Math.floor((opts.strMod) * (opts.strScale ?? 1))
  if (opts.flatBonus) total += opts.flatBonus
  const mult = opts.critMult ?? 1
  if (mult > 1) total = Math.max(1, total * mult)
  return Math.max(1, total)
}

