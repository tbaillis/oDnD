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
