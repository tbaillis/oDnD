import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { createWorld, type World } from './engine/world'
import { createRenderSystem, timeSystem, healthSystem, type InputState, createInputSystem } from './engine/systems'
import { UIManager } from './ui/interface'
import { sampleSpells } from './game/magic'
import { createSampleEncounter, sampleData } from './data/sampleData'
import { pipe } from 'bitecs'

// Game state interface
interface GameState {
  world: World
  uiManager: UIManager
  inputState: InputState
  spriteRegistry: Map<number, Sprite>
  currentCharacterIndex: number
  encounter: ReturnType<typeof createSampleEncounter> | null
}

async function initializeGame(): Promise<GameState> {
  // Create root container
  const root = document.getElementById('game-root') as HTMLDivElement
  if (!root) throw new Error('#game-root not found')

  // Initialize PixiJS
  const app = new Application()
  await app.init({ width: 800, height: 600, background: '#1a1a2e', antialias: true })
  root.appendChild(app.canvas)

  // Create main containers
  const worldContainer = new Container()
  const uiContainer = new Container()
  app.stage.addChild(worldContainer)
  app.stage.addChild(uiContainer)

  // Draw grid background
  const gridGraphics = new Graphics()
  drawGrid(gridGraphics, 800, 600, 50)
  worldContainer.addChild(gridGraphics)

  // Initialize ECS world
  const world = createWorld()
  
  // Initialize UI
  const uiManager = new UIManager(root)
  uiManager.combatLog.addMessage('D&D 3.5 SRD Grid Combat System Initialized', 'success')
  uiManager.combatLog.addMessage('Press C for Character Sheet, S for Spell Book, N for New Character', 'info')

  // Initialize input state
  const inputState: InputState = {
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    keys: new Set(),
    gridMouseX: 0,
    gridMouseY: 0
  }

  // Set up input handlers
  setupInputHandlers(app.canvas, inputState)

  // Initialize sprite registry
  const spriteRegistry = new Map<number, Sprite>()

  // Create sample encounter
  const encounter = createSampleEncounter(world)
  
  // Set up character sheet with first party member
  if (encounter.party.length > 0) {
    uiManager.characterSheet.setCharacter(encounter.party[0].character)
  }
  
  // Set up spell book with sample spells
  uiManager.spellBook.setSpells(sampleSpells)

  // Create systems pipeline
  const systems = pipe(
    timeSystem,
    createInputSystem(inputState),
    createRenderSystem(spriteRegistry),
    healthSystem
  )

  // Game loop
  app.ticker.add(() => {
    systems(world.ecs)
    updateSpritePositions(spriteRegistry, worldContainer)
  })

  uiManager.combatLog.addMessage(`Encounter created: ${encounter.party.length} party members vs ${encounter.enemies.length} enemies`, 'info')

  return {
    world,
    uiManager,
    inputState,
    spriteRegistry,
    currentCharacterIndex: 0,
    encounter
  }
}

function drawGrid(graphics: Graphics, width: number, height: number, cellSize: number) {
  graphics.clear()
  
  // Draw checkerboard pattern
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const dark = ((x / cellSize + y / cellSize) % 2) === 0
      graphics.rect(x, y, cellSize, cellSize)
        .fill({ color: dark ? 0x2a2a3e : 0x323248 })
    }
  }
  
  // Draw grid lines
  graphics.stroke({ color: 0x404055, width: 1 })
  for (let x = 0; x <= width; x += cellSize) {
    graphics.moveTo(x, 0).lineTo(x, height)
  }
  for (let y = 0; y <= height; y += cellSize) {
    graphics.moveTo(0, y).lineTo(width, y)
  }
}

function setupInputHandlers(canvas: HTMLCanvasElement, inputState: InputState) {
  // Mouse handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    inputState.mouseX = e.clientX - rect.left
    inputState.mouseY = e.clientY - rect.top
  })

  canvas.addEventListener('mousedown', () => {
    inputState.mouseDown = true
    // Handle clicks here
  })

  canvas.addEventListener('mouseup', () => {
    inputState.mouseDown = false
  })

  // Keyboard handlers
  document.addEventListener('keydown', (e) => {
    inputState.keys.add(e.key.toLowerCase())
    
    // Handle specific keys
    switch (e.key.toLowerCase()) {
      case 'r':
        console.log('Roll initiative!')
        break
      case 'space':
        e.preventDefault()
        console.log('End turn')
        break
    }
  })

  document.addEventListener('keyup', (e) => {
    inputState.keys.delete(e.key.toLowerCase())
  })
}

function updateSpritePositions(spriteRegistry: Map<number, Sprite>, container: Container) {
  // This will be called by the render system, but we can add additional logic here
  // For now, just ensure all sprites are added to the container
  for (const [, sprite] of spriteRegistry) {
    if (!sprite.parent) {
      container.addChild(sprite)
    }
  }
}

// Add some demo functionality
function addDemoFunctionality(gameState: GameState) {
  const { uiManager, encounter } = gameState
  
  // Add some demo messages
  setTimeout(() => {
    uiManager.combatLog.addMessage('Combat round 1 begins!', 'warning')
  }, 2000)
  
  // Add keyboard shortcuts info
  setTimeout(() => {
    uiManager.combatLog.addMessage('Keyboard shortcuts: C=Character, S=Spells, R=Roll Initiative, Space=End Turn', 'info')
  }, 3000)
  
  // Cycle through party members when pressing TAB
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && encounter) {
      e.preventDefault()
      gameState.currentCharacterIndex = (gameState.currentCharacterIndex + 1) % encounter.party.length
      const currentChar = encounter.party[gameState.currentCharacterIndex].character
      uiManager.characterSheet.setCharacter(currentChar)
      uiManager.combatLog.addMessage(`Switched to ${currentChar.name}`, 'info')
    }
  })
}

// Main initialization
async function main() {
  try {
    const gameState = await initializeGame()
    addDemoFunctionality(gameState)
    
    console.log('Game initialized successfully!')
    console.log('Sample data available:', sampleData)
    console.log('Use UI controls or check browser console for interaction')
    
    // Make game state available globally for debugging
    ;(window as any).gameState = gameState
    
  } catch (error) {
    console.error('Failed to initialize game:', error)
  }
}

// Start the game
main()

// Export for potential external use
export { initializeGame, type GameState }
