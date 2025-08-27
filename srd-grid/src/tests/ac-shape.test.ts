import { describe, it, expect } from 'vitest'

// These tests validate that the AC merge using Object.assign preserves the expected AC shape
// We simulate the baseAC and newAC merge operation used in main.ts and assert keys/types

describe('AC shape after Object.assign merge', () => {
  const baseAC = { base: 10, armor: 0, shield: 0, natural: 0, deflection: 0, dodge: 0, misc: 0 }

  function mergeAC(target: any, source: Partial<typeof baseAC>) {
    // Simulate the minimal pattern used in main.ts: Object.assign((defenderX.ac as any), newAC)
    Object.assign(target, source)
    return target
  }

  it('defender AC has all expected numeric keys after merge', () => {
    const defenderAc: any = { ...baseAC }
    const newAC = { base: 12, armor: 4, dodge: 1 }

    const merged = mergeAC(defenderAc, newAC)

    const expectedKeys = ['base', 'armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']
    expectedKeys.forEach((k) => {
      expect(merged).toHaveProperty(k)
      expect(typeof merged[k]).toBe('number')
      expect(Number.isFinite(merged[k])).toBe(true)
    })

    // Values from newAC should be present
    expect(merged.base).toBe(12)
    expect(merged.armor).toBe(4)
    expect(merged.dodge).toBe(1)
  })

  it('merging partial ACs does not remove existing keys', () => {
    const defenderAc: any = { ...baseAC }
    const newAC = { armor: 6 }

    const merged = mergeAC(defenderAc, newAC)

    expect(merged.armor).toBe(6)
    // Ensure other keys still exist
    expect(merged.shield).toBe(0)
    expect(merged.misc).toBe(0)
  })
})
