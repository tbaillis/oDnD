import { describe, it, expect } from 'vitest'
import { resolveBonuses, sumWithBase, type Bonus } from '../engine/bonuses'

describe('Typed bonus resolver', () => {
  it('takes highest of same type and stacks dodge/circumstance/unnamed', () => {
    const bonuses: Bonus[] = [
      { type: 'enhancement', value: 2, source: 'A' },
      { type: 'enhancement', value: 4, source: 'B' }, // should win
      { type: 'dodge', value: 1 },
      { type: 'dodge', value: 2 }, // stacks
      { type: 'circumstance', value: 1 },
      { type: 'unnamed', value: 3 },
      { type: 'competence', value: 2 },
      { type: 'competence', value: 1 }, // ignored
    ]
    const r = resolveBonuses(bonuses)
    expect(r.total).toBe(4 + (1 + 2) + 1 + 3 + 2)
    expect(r.ignored.some(b => b.type === 'competence' && b.value === 1)).toBe(true)
  })

  it('penalties always stack and are included', () => {
    const bonuses: Bonus[] = [
      { type: 'morale', value: 2 },
      { type: 'morale', value: 1 }, // ignored
      { type: 'insight', value: 3 },
      { type: 'luck', value: -2 },
      { type: 'dodge', value: -1 }, // still a penalty
    ]
    const r = resolveBonuses(bonuses)
    // morale 2, insight 3, penalties -3
    expect(r.total).toBe(2 + 3 - 3)
  })

  it('sumWithBase adds base to resolved total', () => {
    const bonuses: Bonus[] = [ { type: 'enhancement', value: 2 } ]
    const r = sumWithBase(10, bonuses)
    expect(r.total).toBe(12)
  })

  it('disabled bonuses are ignored', () => {
    const bonuses: Bonus[] = [
      { type: 'enhancement', value: 4, enabled: false },
      { type: 'enhancement', value: 2 },
    ]
    const r = resolveBonuses(bonuses)
    expect(r.total).toBe(2)
  })
})
