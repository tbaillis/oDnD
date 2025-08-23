import * as PF from 'pathfinding'
import { Grid } from './grid'

export interface PathOpts { allowDiagonal?: boolean; dontCrossCorners?: boolean; avoidDifficult?: boolean }

export function planPath(grid: Grid, sx: number, sy: number, tx: number, ty: number, opts: PathOpts = {}) {
  // Helper to build a walkability matrix with optional difficult-terrain avoidance
  function buildMatrix(blockDifficult: boolean) {
    const m = [] as number[][]
    for (let y=0; y<grid.h; y++) {
      const row: number[] = []
      for (let x=0; x<grid.w; x++) {
        const f = grid.flags[y][x]
        // Block LoE cells are hard walls. Optionally treat difficult cells as blocked to simulate higher cost preference
        const isEndpoint = (x===sx && y===sy) || (x===tx && y===ty)
        const blocked = f.blockLoE || (blockDifficult && !isEndpoint && !!f.difficult)
        row.push(blocked ? 1 : 0)
      }
      m.push(row)
    }
    return m
  }

  const preferEasy = !!opts.avoidDifficult
  const g1 = new PF.Grid(buildMatrix(preferEasy))
  const finder = new PF.AStarFinder({ allowDiagonal: !!opts.allowDiagonal, dontCrossCorners: !!opts.dontCrossCorners })
  let path = finder.findPath(sx, sy, tx, ty, g1) as [number, number][]
  if (preferEasy && (!path || path.length === 0)) {
    // Fallback allowing difficult terrain
    const g2 = new PF.Grid(buildMatrix(false))
    path = finder.findPath(sx, sy, tx, ty, g2) as [number, number][]
  }
  return path
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
      // Optionally avoid difficult terrain the same way (soft preference via fallback)
      const avoidDiff = !!opts.avoidDifficult
      const blocked = f.blockLoE || (!isEndpoint && threatSet.has(key)) || (avoidDiff && !isEndpoint && !!f.difficult)
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
  return planPath(grid, sx, sy, tx, ty, { ...opts, avoidDifficult: false })
}
