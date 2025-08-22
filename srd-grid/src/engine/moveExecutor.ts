import { Grid } from './grid'

type Step = [number, number]

function isDiag(a: Step, b: Step) { return a[0] !== b[0] && a[1] !== b[1] }

export function trimPathBySpeed(grid: Grid, path: Step[], speedFeet: number): Step[] {
  if (path.length <= 1) return path
  const out: Step[] = [path[0]]
  let spent = 0
  let diagParity = 0
  for (let i=1; i<path.length; i++) {
    const prev = path[i-1]
    const curr = path[i]
    const base = isDiag(prev, curr) ? (diagParity % 2 === 0 ? 5 : 10) : 5
    if (isDiag(prev, curr)) diagParity++
    const cell = grid.get(curr[0], curr[1])
    const cost = cell?.difficult ? base * 2 : base
    if (spent + cost > speedFeet) break
    spent += cost
    out.push(curr)
  }
  return out
}
