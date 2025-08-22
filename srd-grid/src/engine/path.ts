import PF from 'pathfinding'
import { Grid } from './grid'

export interface PathOpts { allowDiagonal?: boolean; dontCrossCorners?: boolean }

export function planPath(grid: Grid, sx: number, sy: number, tx: number, ty: number, opts: PathOpts = {}) {
  const m = [] as number[][]
  for (let y=0; y<grid.h; y++) {
    const row: number[] = []
    for (let x=0; x<grid.w; x++) {
      const f = grid.flags[y][x]
      row.push(f.blockLoE ? 1 : 0)
    }
    m.push(row)
  }
  const g = new PF.Grid(m)
  const finder = new PF.AStarFinder({
    allowDiagonal: !!opts.allowDiagonal,
    dontCrossCorners: !!opts.dontCrossCorners,
  })
  const path = finder.findPath(sx, sy, tx, ty, g)
  return path as [number, number][]
}

export interface ThreatAvoidOpts extends PathOpts {
  threatSet?: Set<string>
  avoidThreat?: boolean
}

// Try to avoid threatened cells; if no path exists, fall back to regular path
export function planPathAvoidingThreat(
  grid: Grid,
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  opts: ThreatAvoidOpts = {},
) {
  const { threatSet, avoidThreat } = opts
  if (!avoidThreat || !threatSet || threatSet.size === 0) return planPath(grid, sx, sy, tx, ty, opts)

  // Build a matrix and temporarily mark threatened cells as blocked (except start/target)
  const m = [] as number[][]
  for (let y=0; y<grid.h; y++) {
    const row: number[] = []
    for (let x=0; x<grid.w; x++) {
      const f = grid.flags[y][x]
      const key = `${x},${y}`
      const isEndpoint = (x===sx && y===sy) || (x===tx && y===ty)
      const blocked = f.blockLoE || (!isEndpoint && threatSet.has(key))
      row.push(blocked ? 1 : 0)
    }
    m.push(row)
  }
  const g = new PF.Grid(m)
  const finder = new PF.AStarFinder({
    allowDiagonal: !!opts.allowDiagonal,
    dontCrossCorners: !!opts.dontCrossCorners,
  })
  let path = finder.findPath(sx, sy, tx, ty, g) as [number, number][]
  if (path && path.length > 0) return path
  // Fallback: allow threatened cells
  return planPath(grid, sx, sy, tx, ty, opts)
}
