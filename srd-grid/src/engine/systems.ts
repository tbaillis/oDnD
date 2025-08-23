import { defineSystem, defineQuery, enterQuery, exitQuery } from 'bitecs'
import type { World } from './world'
import { GridPosition, SpriteComp, HP, Stats } from './components'
import { updateTime } from './world'

// Time system - updates global time state
export const timeSystem = defineSystem((world: World['ecs']) => {
  updateTime(world as any) // Cast needed for world access
  return world
})

// Query for entities with position and sprite
const spriteQuery = defineQuery([GridPosition, SpriteComp])
const spriteEnterQuery = enterQuery(spriteQuery)
const spriteExitQuery = exitQuery(spriteQuery)

// Render system - handles sprite positioning and updates
export const createRenderSystem = (spriteRegistry: Map<number, any>) => {
  return defineSystem((world: World['ecs']) => {
    // Handle new entities that need sprites created
    const enteredEntities = spriteEnterQuery(world)
    for (const eid of enteredEntities) {
      // Create sprite for new entity
      const spriteRef = SpriteComp.spriteRef[eid]
      // Sprite creation will be handled by higher-level code
      console.log(`Entity ${eid} entered with sprite ref ${spriteRef}`)
    }

    // Handle entities that no longer need sprites
    const exitedEntities = spriteExitQuery(world)
    for (const eid of exitedEntities) {
      const sprite = spriteRegistry.get(eid)
      if (sprite) {
        sprite.parent?.removeChild(sprite)
        spriteRegistry.delete(eid)
      }
    }

    // Update sprite positions for existing entities
    const entities = spriteQuery(world)
    for (const eid of entities) {
      const sprite = spriteRegistry.get(eid)
      if (sprite) {
        const x = GridPosition.x[eid]
        const y = GridPosition.y[eid]
        const z = SpriteComp.z[eid]
        
        // Convert grid coordinates to pixel coordinates (assuming 50px cells)
        sprite.x = x * 50
        sprite.y = y * 50
        sprite.zIndex = z
      }
    }

    return world
  })
}

// Health system - handles HP changes, death, etc.
const hpQuery = defineQuery([HP, Stats])

export const healthSystem = defineSystem((world: World['ecs']) => {
  const entities = hpQuery(world)
  
  for (const eid of entities) {
    const currentHP = HP.current[eid]
    const maxHP = HP.max[eid]
    const con = Stats.CON[eid]
    
    // Handle death/dying conditions
    if (currentHP <= 0) {
      const deathThreshold = -con
      if (currentHP <= deathThreshold) {
        console.log(`Entity ${eid} has died (HP: ${currentHP}, threshold: ${deathThreshold})`)
        // TODO: Add death condition
      } else if (currentHP < 0) {
        console.log(`Entity ${eid} is dying (HP: ${currentHP})`)
        // TODO: Add dying condition
      } else {
        console.log(`Entity ${eid} is disabled (HP: 0)`)
        // TODO: Add disabled condition
      }
    }
    
    // Clamp current HP
    if (currentHP > maxHP) {
      HP.current[eid] = maxHP
    }
  }
  
  return world
})

// Animation system - handles sprite animations, effects, etc.
export const animationSystem = defineSystem((world: World['ecs']) => {
  // TODO: Implement animation updates
  // - Update tween states
  // - Handle effect animations
  // - Update sprite frames for animated sprites
  return world
})

// Input system - processes player input
export interface InputState {
  mouseX: number
  mouseY: number
  mouseDown: boolean
  keys: Set<string>
  gridMouseX: number
  gridMouseY: number
}

export const createInputSystem = (inputState: InputState) => {
  return defineSystem((world: World['ecs']) => {
    // Convert screen coordinates to grid coordinates
    inputState.gridMouseX = Math.floor(inputState.mouseX / 50)
    inputState.gridMouseY = Math.floor(inputState.mouseY / 50)
    
    // TODO: Handle input processing for:
    // - Entity selection
    // - Movement commands
    // - Attack commands
    // - Spell casting
    
    return world
  })
}
