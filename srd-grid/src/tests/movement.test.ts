import { describe, it, expect } from 'vitest'
import { Grid } from '../engine/grid'
import { analyzePathMovement } from '../engine/movement'

function makeGrid(w=10,h=10,cell=50) { return new Grid({ width:w, height:h, cell }) }

describe('Movement analysis', () => {
  it('uses 5-10-5 diagonal costing', () => {
    const g = makeGrid()
    const path: [number,number][] = [ [0,0],[1,1],[2,2],[3,3] ] // three diagonals => 5,10,5 = 20 ft
    const info = analyzePathMovement(g, path)
    expect(info.feet).toBe(20)
    expect(info.diagonals).toBe(3)
  })

  it('difficult terrain doubles entering square cost', () => {
    const g = makeGrid()
    g.set(1,0,{ difficult:true })
    const path: [number,number][] = [ [0,0],[1,0],[2,0] ] // 5*2 + 5 = 15 ft
    const info = analyzePathMovement(g, path)
    expect(info.feet).toBe(15)
    expect(info.difficultSquares).toBe(1)
  })

  it('provokes when leaving a threatened square', () => {
    const g = makeGrid()
    const threat = new Set<string>(['0,0'])
    const path: [number,number][] = [ [0,0],[1,0] ]
    const info = analyzePathMovement(g, path, threat)
    expect(info.provokes).toBe(true)
  })
})
