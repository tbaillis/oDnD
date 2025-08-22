import { describe, it, expect } from 'vitest'
import { Grid, lineOfSight, coverBetweenSquares } from '../engine/grid'

function makeGrid(w=10,h=10,cell=50) { return new Grid({ width:w, height:h, cell }) }

describe('Grid LoS and cover', () => {
  it('blocks LoS when a blocking cell lies on the line', () => {
    const g = makeGrid()
    g.set(2,2,{ blockLoS: true })
    const los = lineOfSight(g, 0,0,4,4)
    expect(los.clear).toBe(false)
  })

  it('coverBetweenSquares returns 4 when passing through cover cells', () => {
    const g = makeGrid()
    g.set(2,1,{ cover: 4 })
    const cover = coverBetweenSquares(g, 0,0,4,2)
    expect([0,4,8]).toContain(cover)
  })
})
