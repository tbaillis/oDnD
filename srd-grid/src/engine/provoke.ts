import { coverBetweenSquares, type Grid, coverBetweenSquaresCorner } from './grid'
import type { EffectManager } from './effects'

export type ProvokingAction =
  | 'move'
  | 'stand-up'
  | 'drink-potion'
  | 'cast-spell'
  | 'load-crossbow'
  | 'draw-weapon'
  | 'sheath-weapon'
  | 'reload'
  | 'ready-shield'
  | 'unarmed-attack'
  | 'ranged-attack-in-melee'

// Basic matrix: whether action provokes when threatened
export const Provokes: Record<ProvokingAction, boolean> = {
  move: true,
  'stand-up': true,
  'drink-potion': true,
  'cast-spell': true,
  'load-crossbow': true,
  'draw-weapon': false, // drawing as move normally doesn't provoke; retrieving stored item does
  'sheath-weapon': true,
  reload: true,
  'ready-shield': false,
  'unarmed-attack': true,
  'ranged-attack-in-melee': true,
}

export function aooPreventedByCoverOrFog(
  grid: Grid,
  effects: EffectManager,
  attacker: { x: number; y: number },
  defender: { x: number; y: number },
  occupied?: Array<[number, number]>
) {
  // Use corner rule with soft cover approximation, then apply fog/LoS
  const covCorner = coverBetweenSquaresCorner(grid, attacker.x, attacker.y, defender.x, defender.y, { occupied })
  const cov = covCorner || coverBetweenSquares(grid, attacker.x, attacker.y, defender.x, defender.y)
  const losFog = effects.losClearConsideringFog(attacker.x, attacker.y, defender.x, defender.y)
  return cov >= 4 || !losFog.clear
}
