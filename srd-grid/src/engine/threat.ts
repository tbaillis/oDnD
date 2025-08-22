import type { SizeCategory } from './components'

const BASE_REACH: Record<SizeCategory, number> = {
  fine: 0, diminutive: 0, tiny: 0, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4, colossal: 6,
}

export function reachInSquares(size: SizeCategory, hasReachWeapon = false) {
  const r = BASE_REACH[size]
  return hasReachWeapon ? r + 1 : r
}

export function threatenedSquares(x: number, y: number, size: SizeCategory, hasReachWeapon = false) {
  const r = reachInSquares(size, hasReachWeapon)
  const out: [number, number][] = []
  if (r <= 0) return out
  for (let dy=-r; dy<=r; dy++) {
    for (let dx=-r; dx<=r; dx++) {
      if (dx === 0 && dy === 0) continue
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r) out.push([x+dx, y+dy])
    }
  }
  return out
}

export function provokesAoO(fromThreat: Set<string>, path: [number, number][]) {
  for (const step of path) {
    const k = step.join(',')
    if (fromThreat.has(k)) return true
  }
  return false
}
