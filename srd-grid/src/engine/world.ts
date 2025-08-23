import { createWorld as createBitWorld, addEntity, type IWorld } from 'bitecs'

export interface TimeState { 
  delta: number
  elapsed: number
  then: number
  gameTime: number // Game time in seconds
  roundCount: number // Combat round counter
  turnPhase: 'initiative' | 'action' | 'between-turns'
}

export interface World {
  ecs: IWorld
  time: TimeState
}

export function createWorld(): World {
  const ecs = createBitWorld({})
  const now = performance.now()
  const time: TimeState = { 
    delta: 0, 
    elapsed: 0, 
    then: now,
    gameTime: 0,
    roundCount: 0,
    turnPhase: 'between-turns'
  }
  return { ecs, time }
}

export function updateTime(world: World) {
  const now = performance.now()
  world.time.delta = now - world.time.then
  world.time.elapsed += world.time.delta
  world.time.gameTime += world.time.delta / 1000 // Convert to seconds
  world.time.then = now
}

// Utility function to create a new entity with given components
export function createEntity(world: World): number {
  return addEntity(world.ecs)
}
