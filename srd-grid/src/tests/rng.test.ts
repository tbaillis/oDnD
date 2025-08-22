import { describe, it, expect } from 'vitest'
import { mulberry32, d20, d100 } from '../engine/rng'

describe('RNG & dice', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(1234)
    const b = mulberry32(1234)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('d20 is within [1,20]', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const v = d20(rng)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(20)
    }
  })

  it('d100 is within [1,100]', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const v = d100(rng)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(100)
    }
  })
})
