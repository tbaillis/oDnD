export type BonusType =
  | 'unnamed'
  | 'dodge'
  | 'circumstance'
  | 'competence'
  | 'enhancement'
  | 'morale'
  | 'luck'
  | 'insight'
  | 'deflection'
  | 'natural-armor'
  | 'sacred'
  | 'profane'
  | 'resistance'
  | 'armor' | 'shield' | 'natural' | 'size' | 'racial' | 'alchemical' | 'feat'

export interface Bonus {
  type: BonusType
  value: number
  source?: string // e.g., spell/feat/item name, used later to enforce same-source rules
  enabled?: boolean
}

export interface ResolveResult {
  total: number
  applied: Bonus[]
  ignored: Bonus[]
  byType: Record<string, number>
}

const ALWAYS_STACK_TYPES = new Set<BonusType>(['unnamed', 'dodge', 'circumstance'])

/**
 * SRD-style typed bonus resolver.
 * - Same-type positive bonuses: take highest only (except dodge/circumstance/unnamed).
 * - Dodge, circumstance, unnamed: stack with themselves.
 * - Penalties (< 0): always stack.
 * Disabled bonuses (enabled === false) are ignored.
 */
export function resolveBonuses(bonuses: Bonus[]): ResolveResult {
  const enabled = bonuses.filter(b => b.enabled !== false)
  const applied: Bonus[] = []
  const ignored: Bonus[] = []

  let sum = 0
  const byType: Record<string, number> = {}

  // 1) Penalties stack unconditionally
  for (const b of enabled) {
    if (b.value < 0) {
      sum += b.value
      byType[b.type] = (byType[b.type] ?? 0) + b.value
      applied.push(b)
    }
  }

  // 2) Always-stack types
  // - 'dodge' and 'unnamed' always stack
  // - 'circumstance' stacks only when arising from different sources (same-source doesn't stack)
  const always = enabled.filter(b => b.value > 0 && ALWAYS_STACK_TYPES.has(b.type))
  // a) dodge + unnamed: sum all
  for (const b of always) {
    if (b.type === 'dodge' || b.type === 'unnamed') {
      sum += b.value
      byType[b.type] = (byType[b.type] ?? 0) + b.value
      applied.push(b)
    }
  }
  // b) circumstance: take best per source (undefined source treated as unique bucket per entry)
  const circ = always.filter(b => b.type === 'circumstance')
  if (circ.length) {
    const bySource = new Map<string | undefined, Bonus[]>()
    for (const b of circ) {
      const arr = bySource.get(b.source) || []
      arr.push(b)
      bySource.set(b.source, arr)
    }
    for (const [src, arr] of bySource) {
      if (!src) {
        // No reliable source: conservatively stack all
        for (const b of arr) {
          sum += b.value
          byType[b.type] = (byType[b.type] ?? 0) + b.value
          applied.push(b)
        }
      } else {
        // Same-source: take highest only
        let best: Bonus | null = null
        for (const b of arr) if (!best || b.value > best.value) best = b
        if (best) {
          sum += best.value
          byType[best.type] = (byType[best.type] ?? 0) + best.value
          applied.push(best)
          for (const b of arr) if (b !== best) ignored.push(b)
        }
      }
    }
  }

  // For remaining positive bonuses: take highest per type
  const remaining = enabled.filter(b => b.value > 0 && !ALWAYS_STACK_TYPES.has(b.type))
  const bestByType = new Map<BonusType, Bonus>()
  for (const b of remaining) {
    const prev = bestByType.get(b.type)
    if (!prev || b.value > prev.value) bestByType.set(b.type, b)
  }
  for (const [type, b] of bestByType) {
    sum += b.value
    byType[type] = (byType[type] ?? 0) + b.value
    applied.push(b)
  }
  for (const b of remaining) {
    if (bestByType.get(b.type) !== b) ignored.push(b)
  }

  // Disabled are ignored
  for (const b of bonuses) if (b.enabled === false) ignored.push(b)

  return { total: sum, applied, ignored, byType }
}

export function sumWithBase(base: number, bonuses: Bonus[]): ResolveResult {
  const res = resolveBonuses(bonuses)
  return { ...res, total: base + res.total }
}
