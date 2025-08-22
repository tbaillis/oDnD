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
}

export interface AppliedDamage {
  taken: number
  preventedByDR?: number
  preventedByER?: Partial<Record<DamageType, number>>
  wasLethal?: boolean
  regenerationApplied?: number
}

export function applyDamage(defender: DefenderProfile, dmg: DamagePacket): AppliedDamage {
  let remaining = dmg.amount
  const preventedByER: Partial<Record<DamageType, number>> = {}

  // Energy resistance per type
  for (const t of dmg.types) {
    const er = defender.energyResistance?.[t]
    if (er && (t !== 'bludgeoning' && t !== 'piercing' && t !== 'slashing')) {
      const prevent = Math.min(er, remaining)
      remaining -= prevent
      preventedByER[t] = prevent
    }
  }

  // Damage Reduction for physical
  let preventedByDR = 0
  if (dmg.types.some(t => t === 'bludgeoning' || t === 'piercing' || t === 'slashing')) {
    const dr = defender.damageReduction?.amount || 0
    preventedByDR = Math.min(dr, remaining)
    remaining -= preventedByDR
  }

  // Regeneration: if damage types do not bypass, nonlethal conversion
  let wasLethal = true
  let regenerationApplied = 0
  if (defender.regeneration) {
    const bypass = defender.regeneration.bypass || []
    const bypassed = dmg.types.some(t => bypass.includes(t))
    if (!bypassed) {
      wasLethal = false
      // Regeneration healing happens on turn ticks; we record that regen could apply
      regenerationApplied = defender.regeneration.rate
    }
  }

  return { taken: Math.max(0, remaining), preventedByDR, preventedByER, wasLethal, regenerationApplied }
}

