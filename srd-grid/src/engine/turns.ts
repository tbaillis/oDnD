import { InitiativeTracker, type Combatant } from './initiative'
import { newTurnBudget, type TurnBudget } from './actions'

export interface TurnState {
  round: number
  tracker: InitiativeTracker
  active?: Combatant
  budget?: TurnBudget
  aooUsed?: Record<string, number>
}

export function createTurnState(): TurnState {
  return { round: 1, tracker: new InitiativeTracker(), aooUsed: {} }
}

export function startEncounter(state: TurnState, combatants: Combatant[]) {
  state.tracker.setCombatants(combatants)
  state.active = state.tracker.current()
  state.budget = newTurnBudget()
}

export function endTurn(state: TurnState) {
  state.active = state.tracker.next()
  state.budget = newTurnBudget()
  if (state.tracker.getIndex() === 0) state.round += 1
}
