import { createWorld as createBitWorld, addEntity } from 'bitecs'

export interface TimeState { delta: number; elapsed: number; then: number }

export interface World {
  ecs: ReturnType<typeof createBitWorld>
  time: TimeState
}

export function createWorld(): World {
  const ecs = createBitWorld({})
  const now = performance.now()
  const time: TimeState = { delta: 0, elapsed: 0, then: now }
  // Seed one entity id for future use
  addEntity(ecs)
  return { ecs, time }
}

export function updateTime(w: World) {
  const now = performance.now()
  w.time.delta = now - w.time.then
  w.time.elapsed += w.time.delta
  w.time.then = now
}
