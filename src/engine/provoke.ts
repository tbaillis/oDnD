// Local minimal types and helpers to avoid external module dependencies.
type CellFlag = { blockLoS?: boolean; blockLoE?: boolean; cover?: 0|2|4|8 }
export interface Grid { inBounds(x: number, y: number): boolean; get(x: number, y: number): CellFlag }
export interface EffectManager { losClearConsideringFog(ax: number, ay: number, tx: number, ty: number): { clear: boolean } }

function lineOfSight(grid: Grid, x0: number, y0: number, x1: number, y1: number) {
  const pts: [number, number][] = []
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0, y = y0
  while (true) {
    pts.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
    if (grid.inBounds(x, y) && grid.get(x, y).blockLoS) return { clear: false, pts }
  }
  return { clear: true, pts }
}

function coverBetweenSquares(grid: Grid, x0: number, y0: number, x1: number, y1: number): 0|4|8 {
  const los = lineOfSight(grid, x0, y0, x1, y1)
  if (!los.clear) return 8
  let maxCover = 0
  for (let i = 1; i < los.pts.length - 1; i++) {
    const [x,y] = los.pts[i]
    const c = grid.get(x,y).cover || 0
    if (c > maxCover) maxCover = c
  }
  if (maxCover >= 8) return 8
  if (maxCover >= 4) return 4
  return 0
}

function coverBetweenSquaresCorner(
  grid: Grid,
  ax: number,
  ay: number,
  tx: number,
  ty: number,
  opts?: { occupied?: Array<[number, number]> }
): 0 | 4 | 8 {
  const startCorners: Array<[number, number]> = [
    [ax, ay], [ax + 1, ay], [ax, ay + 1], [ax + 1, ay + 1],
  ]
  const endCorners: Array<[number, number]> = [
    [tx, ty], [tx + 1, ty], [tx, ty + 1], [tx + 1, ty + 1],
  ]

  const occupied = new Set<string>()
  for (const p of opts?.occupied || []) {
    if ((p[0] === ax && p[1] === ay) || (p[0] === tx && p[1] === ty)) continue
    occupied.add(p.join(','))
  }

  function segmentIntersectsBlocking(x0: number, y0: number, x1: number, y1: number): { blocked: boolean; anyBlocking: boolean } {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4
    if (steps <= 0) return { blocked: false, anyBlocking: false }
    let blocked = false
    let anyBlocking = false
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const xf = x0 + (x1 - x0) * t
      const yf = y0 + (y1 - y0) * t
      const cx = Math.floor(xf)
      const cy = Math.floor(yf)
      if (!grid.inBounds(cx, cy)) continue
      if ((cx === ax && cy === ay) || (cx === tx && cy === ty)) continue
      const f = grid.get(cx, cy)
      if (f.blockLoE || f.blockLoS) { anyBlocking = true; blocked = true; break }
      if ((f.cover || 0) >= 4) { anyBlocking = true; blocked = true; break }
      if (occupied.has(`${cx},${cy}`)) { anyBlocking = true; blocked = true; break }
    }
    return { blocked, anyBlocking }
  }

  let anyBlocked = false
  let allTotallyBlocked = true
  const losCenters = lineOfSight(grid, ax, ay, tx, ty)
  for (const sc of startCorners) {
    for (const ec of endCorners) {
      const { blocked, anyBlocking } = segmentIntersectsBlocking(sc[0], sc[1], ec[0], ec[1])
      if (anyBlocking) anyBlocked = true
      if (losCenters.clear && !blocked) allTotallyBlocked = false
    }
  }
  if (!losCenters.clear) return 8
  if (allTotallyBlocked) return 8
  if (anyBlocked) return 4
  return 0
}

export type ProvokingAction =
  | 'move'
  | 'stand-up'
  | 'drink-potion'
  | 'cast-spell'
  | 'load-crossbow'
  | 'draw-weapon'
  | 'sheath-weapon'
  | 'reload'
  | 'ready-shield'
  | 'unarmed-attack'
  | 'ranged-attack-in-melee'

// Basic matrix: whether action provokes when threatened
export const Provokes: Record<ProvokingAction, boolean> = {
  move: true,
  'stand-up': true,
  'drink-potion': true,
  'cast-spell': true,
  'load-crossbow': true,
  'draw-weapon': false, // drawing as move normally doesn't provoke; retrieving stored item does
  'sheath-weapon': true,
  reload: true,
  'ready-shield': false,
  'unarmed-attack': true,
  'ranged-attack-in-melee': true,
}

export function aooPreventedByCoverOrFog(
  grid: Grid,
  effects: EffectManager,
  attacker: { x: number; y: number },
  defender: { x: number; y: number },
  occupied?: Array<[number, number]>
) {
  // Prefer corner-rule cover (with optional soft cover occupancy), fallback to classic cover
  const covCorner = coverBetweenSquaresCorner(grid, attacker.x, attacker.y, defender.x, defender.y, { occupied })
  const cov = covCorner || coverBetweenSquares(grid, attacker.x, attacker.y, defender.x, defender.y)
  const losFog = effects.losClearConsideringFog(attacker.x, attacker.y, defender.x, defender.y)
  return cov >= 4 || !losFog.clear
}
