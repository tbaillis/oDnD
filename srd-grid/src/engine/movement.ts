import { Grid } from './grid'

export type PathPoint = [number, number]

export interface MovementAnalysis {
  feet: number
  squares: number
  diagonals: number
  difficultSquares: number
  provokes: boolean
  overSpeedBy?: number
}

function isDiagonal(a: PathPoint, b: PathPoint): boolean {
  return a[0] !== b[0] && a[1] !== b[1]
}

/**
 * Analyze movement along a path using 3.5e diagonal rule (5-10-5…) and difficult terrain doubling.
 * - Each orthogonal step costs 5 ft
 * - Diagonals alternate 5 ft, 10 ft
 * - Difficult terrain doubles the cost of entering that square
 */
export function analyzePathMovement(
  grid: Grid,
  path: PathPoint[],
  threatSet?: Set<string>,
  speedFeet?: number,
): MovementAnalysis {
  if (path.length <= 1) return { feet: 0, squares: 0, diagonals: 0, difficultSquares: 0, provokes: false }

  let feet = 0
  let squares = 0
  let diagonals = 0
  let difficultSquares = 0
  let provoke = false
  let diagParity = 0 // 0 => 5 ft, 1 => 10 ft

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    const base = isDiagonal(prev, curr) ? (diagParity % 2 === 0 ? 5 : 10) : 5
    if (isDiagonal(prev, curr)) diagParity++

    const cell = grid.get(curr[0], curr[1])
    const stepFeet = cell?.difficult ? base * 2 : base
    if (cell?.difficult) difficultSquares++

    feet += stepFeet
    squares += stepFeet / 5

    if (isDiagonal(prev, curr)) diagonals++
    // Provoke when leaving a threatened square (closer to 3.5e rule)
    if (threatSet && threatSet.has(`${prev[0]},${prev[1]}`)) provoke = true
  }

  const result: MovementAnalysis = { feet, squares, diagonals, difficultSquares, provokes: provoke }
  if (typeof speedFeet === 'number' && feet > speedFeet) result.overSpeedBy = feet - speedFeet
  return result
}
