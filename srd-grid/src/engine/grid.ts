export type CellFlag = {
  blockLoS?: boolean
  blockLoE?: boolean
  difficult?: boolean
  cover?: 0 | 2 | 4 | 8 // 0 none, 2 partial, 4 cover, 8 improved cover
}

export interface GridConfig { width: number; height: number; cell: number }

export class Grid {
  readonly w: number
  readonly h: number
  readonly cell: number
  flags: CellFlag[][]

  constructor(cfg: GridConfig) {
    this.w = cfg.width
    this.h = cfg.height
    this.cell = cfg.cell
    this.flags = Array.from({ length: this.h }, () => Array.from({ length: this.w }, () => ({}) as CellFlag))
  }

  inBounds(x: number, y: number) { return x>=0 && y>=0 && x<this.w && y<this.h }
  get(x: number, y: number) { return this.flags[y][x] }
  set(x: number, y: number, f: Partial<CellFlag>) { Object.assign(this.flags[y][x], f) }
}

// 3.5e diagonal rule: 5-10-5-10... cost pattern
export function manhattanWithAltDiagonalCost(dx: number, dy: number) {
  const adx = Math.abs(dx), ady = Math.abs(dy)
  const diag = Math.min(adx, ady)
  const straight = Math.max(adx, ady) - diag
  // Every second diagonal costs 2 (10 ft)
  const diagCost = Math.floor(diag / 2) * 3 + (diag % 2) * 1
  return straight + diagCost
}

// Bresenham LoS, blocking on blockLoS cells; includes start and end
export function lineOfSight(grid: Grid, x0: number, y0: number, x1: number, y1: number) {
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

export type Concealment = 0 | 20 | 50

export function concealmentFor(cell: CellFlag, invisible = false): Concealment {
  if (invisible) return 50
  if (cell.blockLoE) return 50
  if (cell.cover && cell.cover >= 8) return 50
  if (cell.cover && cell.cover >= 4) return 20
  return 0
}

export function coverBetweenSquares(grid: Grid, x0: number, y0: number, x1: number, y1: number): 0|4|8 {
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

export function concealmentAtTarget(grid: Grid, tx: number, ty: number): Concealment {
  const cell = grid.get(tx, ty)
  return concealmentFor(cell)
}

// Corner-rule cover check with optional soft cover (occupied squares) approximation per 3.5e SRD.
// We trace lines from each corner of the attacker square to each corner of the target square.
// If all such lines are blocked by line-of-effect blockers, treat as total cover (8).
// If any such line passes through blocking or cover-providing cells or occupied cells, grant cover (4).
// This is an approximation on a cell grid and ignores exact edge cases of half-walls.
export function coverBetweenSquaresCorner(
  grid: Grid,
  ax: number,
  ay: number,
  tx: number,
  ty: number,
  opts?: { occupied?: Array<[number, number]> }
): 0 | 4 | 8 {
  // Early out: identical or adjacent melee uses wall rule; still handled by rays.
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

  // Helper: step along a segment in cell space [0..w],[0..h], check visited cells
  function segmentIntersectsBlocking(x0: number, y0: number, x1: number, y1: number): { blocked: boolean; anyBlocking: boolean } {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 4 // 4 samples per cell
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
      // Skip attacker and target squares
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
  for (const sc of startCorners) {
    for (const ec of endCorners) {
      const { blocked, anyBlocking } = segmentIntersectsBlocking(sc[0], sc[1], ec[0], ec[1])
      if (anyBlocking) anyBlocked = true
      // Consider total cover if basic line of sight between square centers is blocked
      const los = lineOfSight(grid, ax, ay, tx, ty)
      if (!los.clear) {
        // keep allTotallyBlocked as true
      } else {
        allTotallyBlocked = false
      }
      if (!blocked && los.clear) {
        // Found a clean ray; no need to continue for total cover calculation
        allTotallyBlocked = false
      }
    }
  }
  if (allTotallyBlocked) return 8
  if (anyBlocked) return 4
  return 0
}
