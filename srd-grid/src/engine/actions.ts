export type ActionType = 'standard' | 'move' | 'full' | 'free' | 'five-foot-step'

export interface TurnBudget {
  standardAvailable: boolean
  moveAvailable: boolean
  freeCount: number
  fiveFootStepAvailable: boolean
}

export function newTurnBudget(): TurnBudget {
  return { standardAvailable: true, moveAvailable: true, freeCount: 99, fiveFootStepAvailable: true }
}

export function consume(b: TurnBudget, type: ActionType): boolean {
  switch (type) {
    case 'standard':
      if (!b.standardAvailable) return false
      b.standardAvailable = false
      return true
    case 'move':
      if (!b.moveAvailable) return false
      b.moveAvailable = false
      return true
    case 'full':
      if (!b.standardAvailable || !b.moveAvailable) return false
      b.standardAvailable = false
      b.moveAvailable = false
      b.fiveFootStepAvailable = true // still allowed
      return true
    case 'free':
      if (b.freeCount <= 0) return false
      b.freeCount--
      return true
    case 'five-foot-step':
      if (!b.fiveFootStepAvailable) return false
      b.fiveFootStepAvailable = false
      return true
  }
}
