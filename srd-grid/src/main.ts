import { Application, Container, Graphics, Sprite, Assets, Texture } from 'pixi.js'
import { createWorld, updateTime } from './engine/world'
import { UIManager } from './ui/interface'
import { DMChatPanel } from './ui/dmChat'
import { BattlefieldSettings } from './ui/battlefieldSettings'
import { Grid, coverBetweenSquares, concealmentAtTarget, coverBetweenSquaresCorner } from './engine/grid'
import { EffectManager } from './engine/effects'
import { planPath, planPathAvoidingThreat } from './engine/path'
import { threatenedSquares, reachInSquares } from './engine/threat'
import { analyzePathMovement } from './engine/movement'
import { trimPathBySpeed } from './engine/moveExecutor'
import { createTurnState, startEncounter, endTurn } from './engine/turns'
import { MONSTER_DATABASE } from './game/monsters/database'
import { consume } from './engine/actions'
import { attackRoll, type AttackProfile, type DefenderProfile, rollWeaponDamage, applyDamage, type DamagePacket, computeAC } from './game/combat'
import { seededRNG, sessionRNG, type RNG } from './engine/rng'
import { SaveDataSchema, type SaveData } from './data/schemas'
import { Provokes, aooPreventedByCoverOrFog } from './engine/provoke'
import { skills } from './game/skills'
import { type Character, getAbilityModifier } from './game/character'
import { monsterSelectionUI } from './game/monsters/ui'
import { monsterService } from './game/monsters/service'
import { monsterAI } from './ai/monsterAgent'
import { monsterDialogueUI } from './ai/monsterDialogue'
import { monsterTurnManager } from './ai/monsterTurnManager'
import { showThinking, hideThinking, showAttackSlash, flashPawnHit, showHitOrMiss } from './ui/visualEffects'
import { debugLogger } from './utils/debugLogger'

// Import CSS styles
import './style.css'

const root = document.getElementById('game-root') as HTMLDivElement | null
if (!root) throw new Error('#game-root not found')

const WIDTH = 800
const HEIGHT = 600
const CELL = 50

const app = new Application()
await app.init({ width: WIDTH, height: HEIGHT, background: '#1b1e22', antialias: true })
root.appendChild(app.canvas)

// Main stage containers
const world = new Container()
app.stage.addChild(world)

// Initialize ECS world and UI
const game = createWorld()

const uiManager = new UIManager(document.body)

// Expose applyCharacterToPawnA globally so UIManager can access it
;(window as any).applyCharacterToPawnA = applyCharacterToPawnA

// Debug logging for UIManager initialization
console.log('UIManager created:', uiManager)
console.log('characterCreation modal:', uiManager.characterCreation)
console.log('characterCreation type:', typeof uiManager.characterCreation)

// Debug global window access
;(window as any).debugUI = uiManager
;(window as any).toggleMonsterSelectionUI = toggleMonsterSelectionUI
;(window as any).debugLogger = debugLogger
console.log('UIManager exposed as window.debugUI')
console.log('Monster selection toggle exposed globally')
console.log('Debug logger exposed as window.debugLogger')

// Set initial message
uiManager.combatLog.addMessage('SRD Grid ready.', 'info')
uiManager.combatLog.addMessage('Press N for New Character, C for Character Sheet, S for Spells', 'info')
uiManager.combatLog.addMessage('Press M for Monster Selection, R for Random Monster', 'info')
uiManager.combatLog.addMessage('Right-click pawns for actions, or press Z (Pawn A) / X (Pawn B)', 'info')
uiManager.combatLog.addMessage('Press ` (backtick) or Tab to toggle control panel', 'info')
uiManager.combatLog.addMessage('Note: Keyboard shortcuts are disabled while typing in input fields', 'info')

// Helper function to maintain compatibility with existing code
function appendLogLine(text: string) {
  uiManager.combatLog.addMessage(text, 'info')
}

function updateActionHUD(text: string) {
  // Update the HUD display - for now we'll use the existing system
  const hud = document.getElementById('action-hud')
  if (hud) hud.textContent = text
}

// Initialize battlefield settings
const battlefieldSettings = new BattlefieldSettings()

// Expose battlefield settings globally so UI can access it
;(window as any).battlefieldSettings = battlefieldSettings

// Background image sprite (for battlefield backgrounds)
let backgroundSprite: Sprite | null = null
const backgroundContainer = new Container()
world.addChild(backgroundContainer)

// Draw a simple checkerboard grid to validate rendering & scaling
const grid = new Graphics()
const lines = new Graphics()

// Function to update battlefield graphics
function updateBattlefield() {
  const config = battlefieldSettings.getConfig()
  
  // Handle background image
  if (config.backgroundImage && config.backgroundImage !== (backgroundSprite as any)?.lastImageUrl) {
    if (backgroundSprite) {
      backgroundContainer.removeChild(backgroundSprite)
      backgroundSprite = null
    }
    
    // Create new background sprite using Assets.load
    Assets.load(config.backgroundImage).then((texture: Texture) => {
      if (backgroundSprite) {
        backgroundContainer.removeChild(backgroundSprite)
      }
      backgroundSprite = new Sprite(texture);
      (backgroundSprite as any).lastImageUrl = config.backgroundImage
      backgroundContainer.addChild(backgroundSprite)
      
      // Update graphics with the new sprite
      BattlefieldSettings.updateBattlefieldGraphics(
        grid, lines, backgroundSprite, config, WIDTH, HEIGHT, CELL
      )
    }).catch((error: Error) => {
      console.warn('Failed to load background image:', error)
      backgroundSprite = null
      BattlefieldSettings.updateBattlefieldGraphics(
        grid, lines, null, config, WIDTH, HEIGHT, CELL
      )
    })
  } else {
    // Update graphics without changing background sprite
    BattlefieldSettings.updateBattlefieldGraphics(
      grid, lines, backgroundSprite, config, WIDTH, HEIGHT, CELL
    )
  }
}

// Initial battlefield setup
updateBattlefield()

// Listen for battlefield setting changes
battlefieldSettings.onSettingsChange(() => {
  updateBattlefield()
})

world.addChild(grid, lines)

// Basic ticker callback placeholder
app.ticker.add(() => {
  updateTime(game)
  // Systems will be called here later
})

// Initialize logical grid and a demo path/threat overlay
const G = new Grid({ width: Math.floor(WIDTH/CELL), height: Math.floor(HEIGHT/CELL), cell: CELL })
// Mark a small wall
for (let y=3; y<=6; y++) G.set(7, y, { blockLoE: true, blockLoS: true, cover: 4 })

// Effects manager: track LoS-blocking effects (e.g., fog cloud) layered over base grid
const effects = new EffectManager(G)

// Sprites layer for pawn icons
const pieces = new Container()
const overlay = new Graphics()
overlay.alpha = 0.9
world.addChild(pieces)
world.addChild(overlay)

function drawCell(g: Graphics, x: number, y: number, color: number) {
  g.rect(x*CELL, y*CELL, CELL, CELL).fill({ color, alpha: 0.35 })
}

// Token state (two pawns)
let pawnA = { x: 2, y: 2, speed: 30, size: 'medium' as const, hp: 20 }
let pawnB = { x: 12, y: 8, speed: 30, size: 'large' as 'large' | 'medium', hp: 25 }
// Optional Pawn C (third token) - start off-screen to avoid interfering
let pawnC = { x: -5, y: -5, speed: 30, size: 'medium' as const, hp: 20, maxHp: 20 }
;(window as any).pawnC = pawnC
let pawnAMaxHP = 20 // Track max HP for pawn A
let pawnBMaxHP = 25 // Track max HP for pawn B

// Function to apply character stats to Pawn A
function applyCharacterToPawnA(character: Character) {
  // Update Pawn A's hit points based on character
  pawnAMaxHP = character.hitPoints.max
  pawnA.hp = character.hitPoints.current
  
  // Update speed based on character's race and size
  pawnA.speed = 30 // Default, could be modified by race or equipment
  
  // Update size if character is not medium
  if (character.race.toLowerCase().includes('halfling') || character.race.toLowerCase().includes('gnome')) {
    pawnA.size = 'medium' // Keep medium for grid simplicity, but could be 'small'
  } else if (character.race.toLowerCase().includes('half-giant') || 
             character.classes.some(c => c.class === 'barbarian')) {
    // Large-sized races or special cases could make pawn large
    pawnA.size = 'medium' // Keep medium for now, could be configurable
  }
  
  // Update defender profile based on character stats
  const dexMod = getAbilityModifier(character.abilityScores.DEX)
  
  // Update AC based on character equipment and stats
  const newAC = {
    base: 10,
    armor: character.equipment.armor ? character.equipment.armor.acBonus : 0,
    shield: character.equipment.shield ? character.equipment.shield.acBonus : 0,
    natural: 0,
    deflection: 0,
    dodge: dexMod,
    misc: 0
  }
  
  // Update defenderA profile with character stats
  defenderA.ac = newAC
  
  // Check for reach weapons
  const hasReachWeapon = character.equipment.weapons.some(weapon => 
    weapon.properties?.includes('reach') || weapon.name.toLowerCase().includes('reach')
  )
  reachA = hasReachWeapon
  
  // Log the character application
  appendLogLine(`Pawn A updated with ${character.name} (${character.race} ${character.classes[0]?.class})`)
  appendLogLine(`HP: ${pawnA.hp}/${pawnAMaxHP}, AC: ${computeAC(newAC)}, Speed: ${pawnA.speed}ft${reachA ? ', Reach Weapon' : ''}`)
  
  // Redraw to reflect changes
  drawAll()
}

// Function to apply monster stats to any pawn
function applyMonsterToPawn(pawnId: 'A' | 'B', monster: import('./game/monsters/types').MonsterData) {
  const pawn = pawnId === 'A' ? pawnA : pawnB
  const defender = pawnId === 'A' ? defenderA : defenderB
  
  // Update pawn's hit points based on monster
  const newMaxHP = monster.hitPoints.average
  if (pawnId === 'A') {
    pawnAMaxHP = newMaxHP
    pawnA.hp = newMaxHP
  } else {
    pawnBMaxHP = newMaxHP
    pawnB.hp = newMaxHP
  }
  
  // Update speed based on monster stats
  pawn.speed = monster.speed.land
  
  // Update position and size based on monster size
  if (monster.size === 'Small' || monster.size === 'Medium') {
    pawn.size = 'medium' as const
  } else if (monster.size === 'Large' || monster.size === 'Huge' || monster.size === 'Gargantuan' || monster.size === 'Colossal') {
    pawn.size = 'large' as const
  } else {
    // Fine, Diminutive, Tiny - keep as medium for visibility
    pawn.size = 'medium' as const
  }
  
  // Update defender profile based on monster stats
  const dexMod = Math.floor((monster.abilities.DEX - 10) / 2)
  
  // Update AC based on monster AC breakdown
  const newAC = {
    base: 10,
    armor: monster.armorClass.armor || 0,
    shield: monster.armorClass.shield || 0,
    natural: monster.armorClass.natural || 0,
    deflection: monster.armorClass.deflection || 0,
    dodge: dexMod,
    misc: monster.armorClass.misc || 0
  }
  
  // Update defender profile with monster stats
  defender.ac = newAC
  
  // Add damage reduction if monster has it
  if (monster.damageReduction) {
    defender.damageReduction = monster.damageReduction
  } else {
    delete defender.damageReduction
  }
  
  // Add energy resistance if monster has it
  if (monster.energyResistance) {
    defender.energyResistance = monster.energyResistance
  } else {
    defender.energyResistance = {}
  }
  
  // Add vulnerabilities if monster has them - convert to compatible type
  if (monster.vulnerability) {
    defender.vulnerability = monster.vulnerability as any[]
  } else {
    delete defender.vulnerability
  }
  
  // Check for reach attacks
  const hasReachAttack = monster.attacks?.some(attack => 
    attack.reach && attack.reach > 5
  ) || monster.reach === '10 ft.' || monster.reach === '15 ft.' || monster.reach === '20 ft.'
  
  if (pawnId === 'A') {
    reachA = hasReachAttack
  } else {
    reachB = hasReachAttack
  }
  
  // Log the monster application
  appendLogLine(`Pawn ${pawnId} updated with ${monster.name} (${monster.size} ${monster.type})`)
  appendLogLine(`HP: ${pawn.hp}/${newMaxHP}, AC: ${monster.armorClass.total}, Speed: ${pawn.speed}ft${hasReachAttack ? ', Reach' : ''}`)
  if (monster.specialAttacks && monster.specialAttacks.length > 0) {
    appendLogLine(`Special Attacks: ${monster.specialAttacks.map(sa => sa.name).join(', ')}`)
  }
  if (monster.specialQualities && monster.specialQualities.length > 0) {
    appendLogLine(`Special Qualities: ${monster.specialQualities.map(sq => sq.name).join(', ')}`)
  }
  
  // Auto-enable Monster AI for monster pawns
  if (pawnId === 'B') {
    console.log(`🤖 Auto-enabling Monster AI for Pawn ${pawnId} (${monster.name})`)
    // Make sure Monster AI is enabled
    if (!monsterAI.isEnabled()) {
      monsterAI.enable()
      console.log('✅ Monster AI enabled')
    }
    // Set pawn as Monster AI controlled
    monsterTurnManager.setMonsterPawn(pawnId, true)
    console.log(`✅ Pawn ${pawnId} set as Monster AI controlled`)
    appendLogLine(`🤖 Monster AI enabled for ${monster.name}!`)
  }
  
  // Redraw to reflect changes
  drawAll()
}

// Function to apply monster stats to Pawn B (legacy compatibility)
function applyMonsterToPawnB(monster: import('./game/monsters/types').MonsterData) {
  applyMonsterToPawn('B', monster)
}

// Persistent defender profiles for each pawn (demo stats)
const baseAC = { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }
const defenderA: DefenderProfile = { ac: baseAC, energyResistance: { fire: 5 }, vulnerability: ['cold'] }
const defenderB: DefenderProfile = { ac: baseAC, damageReduction: { amount: 5, bypass: 'magic' }, regeneration: { rate: 2, bypass: ['fire','acid'] } }

// Turn/initiative setup
const turns = createTurnState()
  startEncounter(turns, [
  { id: 'A', dexMod: 2, initiative: 15 },
  { id: 'B', dexMod: 0, initiative: 12 },
])
uiManager.combatLog.addMessage(`Encounter start: Round ${turns.round}, Active=${turns.active?.id}`, 'info')

function hudText() {
  const b = turns.budget!
  return `Round ${turns.round} | Turn: ${turns.active?.id ?? '-'} | Std:${b.standardAvailable?'✓':'×'} Move:${b.moveAvailable?'✓':'×'} 5ft:${b.fiveFootStepAvailable?'✓':'×'}`
}
updateActionHUD(hudText())

const tokens = new Graphics()
world.addChild(tokens)

let attackMode = false
let gameOver: 'A'|'B'|null = null
let rangedMode = false
let editTerrain = false
let currentRNG: RNG = sessionRNG
let currentSeed: number | null = null
let touchMode = false
let flatFootedMode = false
let preciseShot = false
let showLoS = false
let reachA = false
let reachB = false
let useCornerCover = false
let defensiveCast = false
let tumbleEnabled = false
let tumbleBonus = 5
let concBonus = 5
let selectedSpell: 'magic-missile'|'fog-cloud' = 'magic-missile'
let preferEasyTerrain = true

// Undo stack for recent states
const undoStack: SaveData[] = []
const redoStack: SaveData[] = []
const UNDO_LIMIT = 20

function captureState(): SaveData {
  const gridCopy = G.flags.map(row => row.map(cell => ({ ...cell })))
  const ser = (turns.tracker as any).serialize?.() ?? { order: [], index: 0 }
  return {
    version: 2,
    grid: gridCopy,
    pawnA: { ...pawnA, reach: reachA },
    pawnB: { ...pawnB, reach: reachB },
    round: turns.round,
    initiative: { order: ser.order, index: ser.index },
    aooUsed: (turns as any).aooUsed || {},
    toggles: { rangedMode, touchMode, flatFootedMode, editTerrain, preciseShot, showLoS, defensiveCast, tumble: tumbleEnabled, reachA, reachB, cornerCover: useCornerCover },
    inputs: { tumbleBonus, concentrationBonus: concBonus, spell: selectedSpell },
    rngSeed: currentSeed ?? null,
    effects: { active: effects.serializeEffects() },
  }
}

function restoreFromData(data: SaveData) {
  // grid
  if (Array.isArray(data.grid)) {
    for (let y=0; y<G.h; y++) for (let x=0; x<G.w; x++) {
      if (data.grid[y] && data.grid[y][x]) G.flags[y][x] = { ...data.grid[y][x] }
    }
  }
  // effects
  if ((data as any).effects?.active) effects.deserializeEffects((data as any).effects.active)
  // pawns
  if (data.pawnA) { const { x,y,speed,hp } = data.pawnA; pawnA = { ...pawnA, x, y, speed, hp }; reachA = !!(data.pawnA as any).reach }
  if (data.pawnB) { const { x,y,speed,hp } = data.pawnB; pawnB = { ...pawnB, x, y, speed, hp }; reachB = !!(data.pawnB as any).reach }
  // turn state
  if (typeof data.round === 'number') (turns as any).round = data.round
  if (data.initiative) { (turns.tracker as any).deserialize?.(data.initiative); (turns as any).active = (turns.tracker as any).current?.() }
  if (data.aooUsed) (turns as any).aooUsed = { ...data.aooUsed }
  // toggles + controls sync
  if (data.toggles) {
    rangedMode = !!data.toggles.rangedMode
    touchMode = !!data.toggles.touchMode
    flatFootedMode = !!data.toggles.flatFootedMode
    editTerrain = !!data.toggles.editTerrain
    preciseShot = !!data.toggles.preciseShot
    showLoS = !!data.toggles.showLoS
    defensiveCast = !!data.toggles.defensiveCast
    tumbleEnabled = !!data.toggles.tumble
    reachA = !!data.toggles.reachA
    reachB = !!data.toggles.reachB
    useCornerCover = !!data.toggles.cornerCover
    const ids = ['ranged-toggle','touch-toggle','flat-toggle','terrain-toggle','precise-toggle','show-los-toggle','defensive-cast-toggle','tumble-toggle','reachA-toggle','reachB-toggle','corner-cover-toggle'] as const
    const vals: boolean[] = [rangedMode,touchMode,flatFootedMode,editTerrain,preciseShot,showLoS,defensiveCast,tumbleEnabled,reachA,reachB,useCornerCover]
    ids.forEach((id, i) => { const el = document.getElementById(id) as HTMLInputElement | null; if (el) el.checked = vals[i] })
  }
  if (data.inputs) {
    tumbleBonus = (data.inputs.tumbleBonus ?? tumbleBonus)|0
    concBonus = (data.inputs.concentrationBonus ?? concBonus)|0
    const tb = document.getElementById('tumble-bonus') as HTMLInputElement | null; if (tb) tb.value = String(tumbleBonus)
    const cb = document.getElementById('conc-bonus') as HTMLInputElement | null; if (cb) cb.value = String(concBonus)
    const ss = document.getElementById('spell-select') as HTMLSelectElement | null; if (ss && (data.inputs as any).spell) { ss.value = (data.inputs as any).spell; selectedSpell = ((data.inputs as any).spell === 'fog-cloud' ? 'fog-cloud' : 'magic-missile') }
  }
  if (data.rngSeed !== null && data.rngSeed !== undefined && Number.isFinite(data.rngSeed as any)) { currentSeed = (data.rngSeed as number) >>> 0; currentRNG = seededRNG(currentSeed) }
  gameOver = null
  drawAll()
  updateActionHUD(hudText())
}

function threatSetFrom(x: number, y: number, size: 'medium'|'large', hasReach: boolean) {
  return new Set(threatenedSquares(x, y, size, hasReach).map(([sx,sy]) => `${sx},${sy}`))
}

// Check if an attack is within reach for the attacking pawn
function isWithinAttackReach(attackerX: number, attackerY: number, targetX: number, targetY: number, attackerSize: 'medium'|'large', hasReach: boolean, isRanged: boolean): { inRange: boolean, distance: number, maxReach: number } {
  const dx = Math.abs(attackerX - targetX)
  const dy = Math.abs(attackerY - targetY)
  const distance = Math.max(dx, dy) // Use Chebyshev distance (grid squares)
  
  if (isRanged) {
    // For ranged attacks, check if there's line of sight (already handled elsewhere)
    // Ranged attacks have effectively unlimited range in this tactical system
    return { inRange: true, distance, maxReach: Infinity }
  }
  
  // For melee attacks, use the same calculation as threatened squares
  const maxReach = reachInSquares(attackerSize, hasReach)
  const inRange = distance <= maxReach && distance > 0 // Must be adjacent or within reach, but not same square
  
  return { inRange, distance, maxReach }
}

function drawAll() {
  tokens.clear()
  overlay.clear()

  // Threat layers from both pawns
  const threatB = threatenedSquares(pawnB.x, pawnB.y, pawnB.size, reachB)
  for (const [x,y] of threatB) drawCell(overlay, x, y, 0xff4444)
  const threatA = threatenedSquares(pawnA.x, pawnA.y, pawnA.size, reachA)
  for (const [x,y] of threatA) drawCell(overlay, x, y, 0x4488ff)

  // Tokens: sprites if available, otherwise draw vector circles
  const center = (n: number) => n*CELL + CELL/2
  const scaleToCell = (s: Sprite) => {
    const pad = 6
    const target = CELL - pad
    const sx = target / (s.texture.width || target)
    const sy = target / (s.texture.height || target)
    s.scale.set(Math.min(sx, sy))
  }
  if (pawnASprite && pawnASprite.texture && pawnASprite.texture.width > 0 && pawnASprite.texture.height > 0) {
    pawnASprite.x = center(pawnA.x)
    pawnASprite.y = center(pawnA.y)
    scaleToCell(pawnASprite)
    pawnASprite.visible = true
  } else {
    if (pawnASprite) pawnASprite.visible = false
    tokens.circle(center(pawnA.x), center(pawnA.y), CELL*0.35).fill(0x5aa9e6)
  }
  if (pawnBSprite && pawnBSprite.texture && pawnBSprite.texture.width > 0 && pawnBSprite.texture.height > 0) {
    pawnBSprite.x = center(pawnB.x)
    pawnBSprite.y = center(pawnB.y)
    scaleToCell(pawnBSprite)
    pawnBSprite.visible = true
  } else {
    if (pawnBSprite) pawnBSprite.visible = false
    tokens.circle(center(pawnB.x), center(pawnB.y), CELL*0.4).fill(0xe65a5a)
  }
  // Pawn C rendering (optional third pawn)
  if (pawnCSprite && pawnCSprite.texture && pawnCSprite.texture.width > 0 && pawnCSprite.texture.height > 0) {
    pawnCSprite.x = center((window as any).pawnC?.x ?? 0)
    pawnCSprite.y = center((window as any).pawnC?.y ?? 0)
    scaleToCell(pawnCSprite)
    pawnCSprite.visible = true
  } else {
    if (pawnCSprite) pawnCSprite.visible = false
    if ((window as any).pawnC) tokens.circle(center((window as any).pawnC.x), center((window as any).pawnC.y), CELL*0.35).fill(0x6d28d9)
  }
  // HP bars
  const barW = CELL*0.7
  const barH = 6
  function drawHP(px: number, py: number, hp: number, max: number, color: number) {
    const x = px*CELL + (CELL - barW)/2
    const y = py*CELL + CELL - barH - 4
    tokens.rect(x, y, barW, barH).fill(0x333333)
    const w = Math.max(0, Math.min(1, hp/max)) * barW
    tokens.rect(x, y, w, barH).fill(color)
  }
  drawHP(pawnA.x, pawnA.y, pawnA.hp, 20, 0x5aa9e6)
  drawHP(pawnB.x, pawnB.y, pawnB.hp, 25, 0xe65a5a)
  if ((window as any).pawnC) drawHP((window as any).pawnC.x, (window as any).pawnC.y, (window as any).pawnC.hp, (window as any).pawnC.maxHp || 20, 0x6d28d9)
  if (gameOver) {
    // simple banner rectangle
    tokens.rect(WIDTH/2-160, HEIGHT/2-30, 320, 60).fill(0x111111).stroke({ color: 0xffffff, width: 2 })
  }
}

// Initialize sprite variables before drawAll is called
let pawnASprite: Sprite | null = null
let pawnBSprite: Sprite | null = null
let pawnCSprite: Sprite | null = null

drawAll()

// Import SVG assets directly with ?url to ensure they work in both dev and production
import pawnAUrl from './assets/pawns/pawnA.svg?url'
import pawnBUrl from './assets/pawns/pawnB.svg?url'
import pawnCUrl from './assets/pawns/pawnC.svg?url'
import pawnCCustomUrl from './assets/pawns/pawnC_custom.png?url'
import pawnDUrl from './assets/pawns/pawnD.svg?url'

// Create available tokens list with the imported URLs
const availableTokens = [
  { path: './assets/pawns/pawnA.svg', url: pawnAUrl, name: 'pawnA.svg' },
  { path: './assets/pawns/pawnB.svg', url: pawnBUrl, name: 'pawnB.svg' },
  { path: './assets/pawns/pawnC.svg', url: pawnCUrl, name: 'pawnC.svg' },
  { path: './assets/pawns/pawnC_custom.png', url: pawnCCustomUrl, name: 'pawnC_custom.png' },
  { path: './assets/pawns/pawnD.svg', url: pawnDUrl, name: 'pawnD.svg' }
]

console.log('Available tokens:', availableTokens)

// Expose available tokens and setter so static HTML token buttons can use them
;(window as any).availableTokens = availableTokens
;(window as any).setPawnTexture = setPawnTexture

function ensureSprite(ref: 'A'|'B'|'C') {
  const cur = ref === 'A' ? pawnASprite : (ref === 'B' ? pawnBSprite : pawnCSprite)
  if (cur) return cur
  const s = new Sprite()
  s.anchor.set(0.5)
  pieces.addChild(s)
  if (ref === 'A') pawnASprite = s; else if (ref === 'B') pawnBSprite = s; else pawnCSprite = s
  return s
}

async function setPawnTexture(ref: 'A'|'B'|'C', url: string) {
  console.log(`Loading texture for ${ref} from:`, url)
  const sp = ensureSprite(ref)
  sp.visible = false
  
  try {
    // First try to load via PixiJS Assets system
    let texture: Texture
    
    // Check if texture is already in cache
    if (Assets.cache.has(url)) {
      texture = Assets.cache.get(url)
      console.log(`Using cached texture for ${ref}:`, url)
    } else {
      // Load the texture
      texture = await Assets.load(url)
      console.log(`Loaded new texture for ${ref}:`, url)
    }
    
    if (texture && texture.width > 0 && texture.height > 0) {
      sp.texture = texture
      sp.visible = true
      console.log(`Successfully set texture for ${ref}`)
      drawAll()
      return
    }
  } catch (e1) {
    console.warn(`Assets.load failed for ${ref}:`, e1)
  }
  
  try {
    // Fallback: direct Texture.from
    const texture = Texture.from(url)
    sp.texture = texture
    sp.visible = true
    console.log(`Fallback texture set for ${ref}:`, url)
    drawAll()
  } catch (e2) {
    console.error(`All texture loading methods failed for ${ref}:`, url, e2)
    drawAll()
  }
}

// Default selection: prefer pawnA.svg/pawnB.svg; else first available if present
const defA = availableTokens.find(t => /pawnA\./i.test(t.name)) || availableTokens[0]
const defB = availableTokens.find(t => /pawnB\./i.test(t.name)) || availableTokens[1] || availableTokens[0]
// Prefer custom pawnC image if present, else fallback to built-in pawnC.svg
const defC = availableTokens.find(t => /pawnC_custom\./i.test(t.name)) || availableTokens.find(t => /pawnC\./i.test(t.name)) || availableTokens[2] || availableTokens[0]
if (defA) setPawnTexture('A', defA.url)
if (defB) setPawnTexture('B', defB.url)
if (defC) setPawnTexture('C', defC.url)

// Build comprehensive token selector interface
export function buildTokenSelectors() {
  const wrap = document.createElement('div')
  wrap.style.cssText = [
    'position:fixed',
    'bottom:8px',
    'right:8px',
    'background:rgba(20,25,30,0.95)',
    'color:#e5e7eb',
    'padding:12px 16px',
    'border:1px solid #374151',
    'border-radius:8px',
    'font-family:system-ui, sans-serif',
    'font-size:13px',
    'line-height:1.3',
    'z-index:900',
    'box-shadow:0 4px 12px rgba(0,0,0,0.6)',
    'max-width:320px',
    'max-height:400px',
    'overflow-y:auto'
  ].join(';')

  const titleHeader = document.createElement('div')
  titleHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;'
  
  const titleText = document.createElement('span')
  titleText.textContent = 'Token Manager'
  titleText.style.cssText = 'font-weight:700; letter-spacing:0.3px; font-size:16px; color:#fbbf24;'
  
  const collapseBtn = document.createElement('button')
  collapseBtn.textContent = '−'
  collapseBtn.style.cssText = 'padding:4px 8px; background:#dc2626; color:white; border:0; border-radius:4px; cursor:pointer; font-weight:700; font-size:12px; margin-left:8px;'
  collapseBtn.title = 'Collapse'
  
  titleHeader.appendChild(titleText)
  titleHeader.appendChild(collapseBtn)
  wrap.appendChild(titleHeader)
  
  // Create content container for collapsible content
  const content = document.createElement('div')
  content.style.cssText = 'display:block;'

  // Create token button grid for each pawn
  const createTokenRow = (label: string, who: 'A'|'B'|'C', def?: { url: string, name: string } | undefined) => {
    const cont = document.createElement('div')
    cont.style.cssText = 'margin-bottom:12px; padding:8px; background:rgba(17,24,39,0.5); border-radius:6px;'
    
    const header = document.createElement('div')
    header.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;'
    
    const lab = document.createElement('label')
    lab.textContent = label
    lab.style.cssText = 'font-weight:600; color:#cbd5e1; font-size:15px;'
    
    const preview = document.createElement('img')
    preview.width = 48; preview.height = 48
    preview.style.cssText = 'width:48px; height:48px; object-fit:contain; background:#0b1020; border:2px solid #374151; border-radius:6px;'
    
    header.appendChild(lab)
    header.appendChild(preview)
    cont.appendChild(header)

    const buttonGrid = document.createElement('div')
    buttonGrid.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; max-height:120px; overflow-y:auto;'

    if (availableTokens.length) {
      availableTokens.forEach(t => {
        const btn = document.createElement('button')
        btn.textContent = t.name
        btn.title = t.name
        const isDefault = def && t.url === def.url
        btn.style.cssText = [
          'padding:6px 10px',
          `background:${isDefault ? '#0ea5e9' : '#374151'}`,
          `color:${isDefault ? '#0b1020' : '#e5e7eb'}`,
          'border:0',
          'border-radius:4px',
          'cursor:pointer',
          'font-weight:500',
          'font-size:12px',
          'transition:all 0.2s',
          'max-width:120px',
          'overflow:hidden',
          'text-overflow:ellipsis',
          'white-space:nowrap'
        ].join(';')
        
        btn.onmouseover = () => {
          if (!isDefault) btn.style.background = '#4b5563'
        }
        btn.onmouseout = () => {
          if (!isDefault) btn.style.background = '#374151'
        }
        
        btn.onclick = () => {
          // Update all buttons in this group
          Array.from(buttonGrid.children).forEach(child => {
            if (child !== btn) {
              (child as HTMLElement).style.background = '#374151';
              (child as HTMLElement).style.color = '#e5e7eb'
            }
          })
          btn.style.background = '#0ea5e9'
          btn.style.color = '#0b1020'
          
          preview.src = t.url
          setPawnTexture(who, t.url)
        }
        
        buttonGrid.appendChild(btn)
      })
      
      if (def) {
        preview.src = def.url
      }
    } else {
      const msg = document.createElement('div')
      msg.textContent = 'No tokens found — add .png/.jpg/.webp/.svg files to src/assets/pawns/'
      msg.style.cssText = 'color:#9ca3af; font-style:italic; padding:8px;'
      buttonGrid.appendChild(msg)
      preview.alt = 'No tokens'
    }

    cont.appendChild(buttonGrid)
    return { cont, preview }
  }

  const a = createTokenRow('Pawn A', 'A', defA)
  const b = createTokenRow('Pawn B', 'B', defB)
  const c = createTokenRow('Pawn C', 'C', defC)
  content.appendChild(a.cont)
  content.appendChild(b.cont)
  content.appendChild(c.cont)

  const foot = document.createElement('div')
  foot.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px solid #374151;'
  
  const status = document.createElement('div')
  status.textContent = `${availableTokens.length} tokens found`
  status.style.cssText = 'opacity:0.8; font-size:12px; color:#9ca3af;'
  
  const actions = document.createElement('div')
  actions.style.cssText = 'display:flex; gap:8px;'
  
  const rescan = document.createElement('button')
  rescan.textContent = 'Rescan Assets'
  rescan.style.cssText = 'padding:6px 12px; background:#059669; color:white; border:0; border-radius:4px; cursor:pointer; font-weight:600; font-size:12px;'
  rescan.onclick = () => location.reload()
  
  actions.appendChild(rescan)
  foot.appendChild(status)
  foot.appendChild(actions)
  content.appendChild(foot)
  
  // Add collapse functionality
  let collapsed = false
  collapseBtn.onclick = () => {
    collapsed = !collapsed
    content.style.display = collapsed ? 'none' : 'block'
    collapseBtn.textContent = collapsed ? '+' : '−'
    collapseBtn.title = collapsed ? 'Expand' : 'Collapse'
  }
  
  wrap.appendChild(content)

  document.body.appendChild(wrap)
}
// buildTokenSelectors() - Disabled: Token Manager now integrated into pop-out panel


// Demo defenses helper
function defenderFor(id: 'A'|'B'): DefenderProfile { return id === 'A' ? defenderA : defenderB }

function planFromActiveTo(mx: number, my: number) {
  const active = turns.active?.id === 'A' ? pawnA : pawnB
  const other = turns.active?.id === 'A' ? pawnB : pawnA
  const allowDiagonal = true
  const dontCrossCorners = true
  const threatSet = threatSetFrom(other.x, other.y, other.size, other === pawnB ? reachB : reachA)
  const avoid = (document.getElementById('avoid-toggle') as HTMLInputElement | null)?.checked ?? true
  const path = avoid
    ? planPathAvoidingThreat(G, active.x, active.y, mx, my, { allowDiagonal, dontCrossCorners, avoidThreat: true, threatSet, avoidDifficult: preferEasyTerrain })
    : planPath(G, active.x, active.y, mx, my, { allowDiagonal, dontCrossCorners, avoidDifficult: preferEasyTerrain })
  const trimmed = trimPathBySpeed(G, path, active.speed)
  const info = analyzePathMovement(G, trimmed, threatSet, active.speed)
  return { path, trimmed, info, threatSet }
}

function drawPreview(path: [number, number][], threatSet: Set<string>, trimmed: [number, number][]) {
  overlay.stroke({ color: 0x00ff88, width: 2 })
  for (const [x,y] of path) {
    const isThreat = threatSet.has(`${x},${y}`)
    overlay.stroke({ color: isThreat ? 0xff8844 : 0x00ff88, width: 2 })
    overlay.rect(x*CELL+16, y*CELL+16, CELL-32, CELL-32)
  }
  overlay.stroke({ color: 0x00ffff, width: 3 })
  for (const [x,y] of trimmed) overlay.rect(x*CELL+22, y*CELL+22, CELL-44, CELL-44)
}

function commitEndTurn() {
  const before = turns.round
  endTurn(turns)
  // Expire effects at round transitions
  effects.onRoundChanged(turns.round)
  if (turns.round !== before) (turns as any).aooUsed = {}
  // skip defeated
  let safety = 0
  while (safety++ < 4) {
  const ap = turns.active?.id === 'A' ? pawnA : pawnB
    if (ap.hp > 0) break
    endTurn(turns)
  }
  appendLogLine(`End Turn -> Round ${turns.round}, Active=${turns.active?.id}`)
  drawAll()
  updateActionHUD(hudText())
  
  // Check if the new active pawn is a monster and AI is enabled
  const newActivePawnId = turns.active?.id as 'A' | 'B'
  console.log(`🔍 Turn ended. New active pawn: ${newActivePawnId}`)
  
  if (newActivePawnId) {
    const isMonster = monsterTurnManager.isMonsterPawn(newActivePawnId)
    const aiEnabled = monsterAI.isEnabled()
    const shouldTakeAutoTurn = monsterTurnManager.shouldTakeAutoTurn(newActivePawnId)
    
    console.log(`🔍 Monster AI Check for Pawn ${newActivePawnId}:`, {
      isMonster,
      aiEnabled,
      shouldTakeAutoTurn
    })
    
    if (shouldTakeAutoTurn) {
      console.log(`🤖 Scheduling Monster AI turn for Pawn ${newActivePawnId}`)
      // Schedule monster AI turn after a short delay
      setTimeout(() => {
        executeMonsterTurn(newActivePawnId)
      }, 500) // Brief delay to let UI update
    } else {
      console.log(`⏭️ Pawn ${newActivePawnId} will not take auto turn`)
    }
  }
}

async function executeMonsterTurn(pawnId: 'A' | 'B') {
  console.log(`🤖 Executing Monster AI turn for Pawn ${pawnId}`)
  
  try {
    // Build game state for AI decision making
    const gameState = monsterTurnManager.buildGameState(turns, pawnA, pawnB, {
      grid: G,
      terrain: G,
      effects: effects
    })
    
    console.log(`🤖 Game state built for Pawn ${pawnId}:`, {
      activePawnId: gameState.activePawnId,
      activeMonster: !!gameState.activeMonster,
      enemies: gameState.enemies?.length || 0,
      budget: gameState.budget
    })

  // Show thinking indicator while AI decides and acts
  showThinking(pawnId)
  // Execute monster turn
  const success = await monsterTurnManager.executeMonsterTurn(pawnId, gameState)
  hideThinking()
    
    console.log(`🤖 Monster turn ${pawnId} result: ${success ? 'SUCCESS' : 'FAILED'}`)
    
    if (success) {
      // Update display after monster action
  drawAll()
      updateActionHUD(hudText())
    } else {
      // Fallback: just end turn if AI fails
      appendLogLine(`Monster AI failed for Pawn ${pawnId}, ending turn`)
      commitEndTurn()
    }
  } catch (error) {
    console.error('Error executing monster turn:', error)
    // Fallback: end turn on error
    commitEndTurn()
  }
}

function toggleDifficultAt(x: number, y: number) {
  const cell = G.get(x,y)
  const newDiff = !cell.difficult
  G.set(x,y,{ difficult: newDiff })
}

function cycleCoverAt(x: number, y: number) {
  const cell = G.get(x,y)
  const cur = cell.cover || 0
  const next = cur === 0 ? 4 : cur === 4 ? 8 : 0
  G.set(x,y,{ cover: next })
}

// Check if a click position is on a pawn
function getPawnAtPosition(x: number, y: number): 'A' | 'B' | null {
  if (pawnA.x === x && pawnA.y === y) return 'A'
  if (pawnB.x === x && pawnB.y === y) return 'B'
  return null
}

// Context menu for pawn interactions
let contextMenu: HTMLElement | null = null

function showPawnContextMenu(pawnId: 'A' | 'B', event: MouseEvent) {
  // Remove any existing context menu
  if (contextMenu) {
    contextMenu.remove()
    contextMenu = null
  }

  const menu = document.createElement('div')
  menu.id = 'pawn-context-menu'
  menu.style.cssText = `
    position: fixed;
    left: ${event.clientX}px;
    top: ${event.clientY}px;
    background: rgba(20,25,30,0.95);
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 8px;
    font-family: 'Segoe UI', system-ui, Arial, sans-serif;
    font-size: 13px;
    color: #e5e7eb;
    z-index: 2500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    min-width: 150px;
  `

  const pawn = pawnId === 'A' ? pawnA : pawnB
  const isActivePawn = turns.active?.id === pawnId

  // Menu header
  const header = document.createElement('div')
  header.textContent = `Pawn ${pawnId}`
  header.style.cssText = `
    font-weight: 600;
    color: ${pawnId === 'A' ? '#5aa9e6' : '#e65a5a'};
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid #374151;
  `
  menu.appendChild(header)

  // HP display
  const hpDisplay = document.createElement('div')
  const maxHp = pawnId === 'A' ? pawnAMaxHP : pawnBMaxHP
  hpDisplay.textContent = `HP: ${pawn.hp}/${maxHp}`
  hpDisplay.style.cssText = `
    color: #9ca3af;
    font-size: 12px;
    margin-bottom: 6px;
  `
  menu.appendChild(hpDisplay)

  // Active turn indicator
  if (isActivePawn) {
    const activeIndicator = document.createElement('div')
    activeIndicator.textContent = '● Active Turn'
    activeIndicator.style.cssText = `
      color: #10b981;
      font-size: 12px;
      margin-bottom: 6px;
      font-weight: 500;
    `
    menu.appendChild(activeIndicator)
  }

  // Attack Mode Toggle (only for active pawn)
  if (isActivePawn) {
    const attackToggle = document.createElement('button')
    attackToggle.textContent = attackMode ? '❌ Exit Attack Mode' : '⚔️ Enter Attack Mode'
    attackToggle.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: ${attackMode ? '#ef4444' : '#059669'};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 500;
      transition: background-color 0.2s;
    `
    attackToggle.addEventListener('mouseenter', () => {
      attackToggle.style.background = attackMode ? '#dc2626' : '#047857'
    })
    attackToggle.addEventListener('mouseleave', () => {
      attackToggle.style.background = attackMode ? '#ef4444' : '#059669'
    })
    attackToggle.addEventListener('click', () => {
      attackMode = !attackMode
      appendLogLine(`Pawn ${pawnId}: Attack mode ${attackMode ? 'ON' : 'OFF'}`)
      hideContextMenu()
    })
    menu.appendChild(attackToggle)

    // End Turn (only for active pawn)
    const endTurnBtn = document.createElement('button')
    endTurnBtn.textContent = '🛑 End Turn'
    endTurnBtn.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 500;
      transition: background-color 0.2s;
    `
    endTurnBtn.addEventListener('mouseenter', () => {
      endTurnBtn.style.background = '#d97706'
    })
    endTurnBtn.addEventListener('mouseleave', () => {
      endTurnBtn.style.background = '#f59e0b'
    })
    endTurnBtn.addEventListener('click', () => {
      ;(turns as any).aooUsed = {}
      commitEndTurn()
      appendLogLine(`Pawn ${pawnId}: Turn ended`)
      hideContextMenu()
    })
    menu.appendChild(endTurnBtn)

    // Cast Spell (only for active pawn)
    const castSpellBtn = document.createElement('button')
    castSpellBtn.textContent = '🪄 Cast Spell'
    castSpellBtn.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 500;
      transition: background-color 0.2s;
    `
    castSpellBtn.addEventListener('mouseenter', () => {
      castSpellBtn.style.background = '#7c3aed'
    })
    castSpellBtn.addEventListener('mouseleave', () => {
      castSpellBtn.style.background = '#8b5cf6'
    })
    castSpellBtn.addEventListener('click', () => {
      // Trigger the same functionality as the cast button
      if (!consume(turns.budget!, 'standard')) { 
        appendLogLine('Standard action already used.'); 
        hideContextMenu();
        return 
      }
      const attacker = turns.active?.id === 'A' ? pawnA : pawnB
      const target = turns.active?.id === 'A' ? pawnB : pawnA
      // Define simple spell data
      const spellLevel = selectedSpell === 'magic-missile' ? 1 : 2
      // Casting can provoke unless casting defensively succeeds
      let provoked = true
      if (defensiveCast) {
        const roll = Math.floor(currentRNG()*20)+1
        const total = roll + concBonus
        const dc = 15 + spellLevel // 3.5e: casting defensively DC 15 + spell level
        appendLogLine(`Concentration (defensive) ${roll}+${concBonus}=${total} vs DC ${dc}`)
        if (total >= dc) provoked = false
      }
      if (provoked) {
        const otherId = turns.active?.id === 'A' ? 'B' : 'A'
        const used = (turns as any).aooUsed?.[otherId] ?? 0
        const threat = threatSetFrom(target.x, target.y, target.size, target === pawnB ? reachB : reachA)
        if (threat.has(`${attacker!.x},${attacker!.y}`) && used < 1 && !flatFootedMode) {
          // Cover/fog prevention
          const prevented = aooPreventedByCoverOrFog(G, effects, { x: target.x, y: target.y }, { x: attacker!.x, y: attacker!.y }, [[attacker!.x, attacker!.y]])
          if (prevented) {
            appendLogLine(`${otherId}'s AoO prevented by cover.`)
          } else {
            const aooAtk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
            const aooDef: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
            const aooOutcome = attackRoll(aooAtk, aooDef, currentRNG)
            appendLogLine(`${otherId} AoO (casting): roll=${aooOutcome.attackRoll} total=${aooOutcome.totalToHit} hit=${aooOutcome.hit}${aooOutcome.critical ? ' CRIT!' : ''}`)
            if (aooOutcome.hit) {
              undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
              const base = aooOutcome.critical ? 10 : 5
              const atkPawn = turns.active?.id === 'A' ? pawnA : pawnB
              const packet: DamagePacket = { amount: base, types: ['slashing'], bypassTags: ['magic'] }
              const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'A' : 'B'), packet)
              const taken = applied.taken
              atkPawn.hp = Math.max(0, atkPawn.hp - taken)
              appendLogLine(`${otherId} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Caster HP ${atkPawn.hp}.`)
              // Concentration check to avoid losing the spell: DC 10 + damage dealt + spell level
              const roll2 = Math.floor(currentRNG()*20)+1
              const total2 = roll2 + concBonus
              const dc2 = 10 + taken + spellLevel
              appendLogLine(`Concentration (damage while casting) ${roll2}+${concBonus}=${total2} vs DC ${dc2}`)
              if (total2 < dc2) {
                appendLogLine('Spell lost due to damage while casting!')
                ;(turns as any).aooUsed![otherId] = used + 1
                updateActionHUD(hudText())
                hideContextMenu()
                return
              }
            }
            (turns as any).aooUsed![otherId] = used + 1
          }
        }
      }
      // Resolve simple spells
      if (selectedSpell === 'magic-missile') {
        // Require line of sight; Magic Missile auto-hits if LoS is clear
        const los = effects.losClearConsideringFog(attacker!.x, attacker!.y, target.x, target.y)
        if (!los.clear) {
          appendLogLine('Magic Missile fails: no line of sight to target.')
        } else {
          const base = (Math.floor(currentRNG()*4)+1) + 1 // 1d4+1
          const packet: DamagePacket = { amount: base, types: ['force'] }
          const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'B' : 'A'), packet)
          const taken = applied.taken
          target.hp = Math.max(0, target.hp - taken)
          appendLogLine(`Magic Missile hits for ${taken}${applied.preventedByER?` (ER)`:''}. Target HP ${target.hp}.`)
        }
      } else {
        // Fog Cloud: 20-ft radius spread (4 squares), lasts 3 rounds
        const R = 4
        const DURATION = 3
        undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
        effects.addFogCloud(attacker!.x, attacker!.y, R, DURATION, turns.round)
        appendLogLine(`Fog Cloud centered at (${attacker!.x},${attacker!.y}), radius ${R} squares, ${DURATION} rounds.`)
      }
      appendLogLine(`Pawn ${pawnId}: Cast ${selectedSpell === 'magic-missile' ? 'Magic Missile' : 'Fog Cloud'}`)
      updateActionHUD(hudText())
      hideContextMenu()
    })
    menu.appendChild(castSpellBtn)
  } else {
    // Show whose turn it is when not the active pawn
    const turnInfo = document.createElement('div')
    turnInfo.textContent = `Currently: Pawn ${turns.active?.id}'s turn`
    turnInfo.style.cssText = `
      color: #6b7280;
      font-size: 11px;
      margin-bottom: 6px;
      font-style: italic;
    `
    menu.appendChild(turnInfo)
  }

  // Pawn Info
  const infoBtn = document.createElement('button')
  infoBtn.textContent = '📋 Pawn Stats'
  infoBtn.style.cssText = `
    width: 100%;
    padding: 6px 8px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background-color 0.2s;
  `
  infoBtn.addEventListener('mouseenter', () => {
    infoBtn.style.background = '#4b5563'
  })
  infoBtn.addEventListener('mouseleave', () => {
    infoBtn.style.background = '#6b7280'
  })
  infoBtn.addEventListener('click', () => {
    const reach = pawnId === 'A' ? reachA : reachB
    const defender = defenderFor(pawnId)
    const ac = computeAC(defender.ac)
    const threatSquares = threatenedSquares(pawn.x, pawn.y, pawn.size, reach).length
    
    const stats = [
      `=== Pawn ${pawnId} Stats ===`,
      `HP: ${pawn.hp}/${maxHp} (${Math.round(pawn.hp/maxHp*100)}%)`,
      `Position: (${pawn.x}, ${pawn.y})`,
      `Size: ${pawn.size}`,
      `Speed: ${pawn.speed} ft`,
      `AC: ${ac}`,
      `Reach Weapon: ${reach ? 'Yes' : 'No'}`,
      `Threatens: ${threatSquares} squares`,
      `Status: ${pawn.hp <= 0 ? 'Defeated' : isActivePawn ? 'Active Turn' : 'Waiting'}`
    ].join(' | ')
    
    appendLogLine(stats)
    hideContextMenu()
  })
  menu.appendChild(infoBtn)

  // Change Monster Button
  const changeMonsterBtn = document.createElement('button')
  changeMonsterBtn.textContent = '🐲 Change Monster'
  changeMonsterBtn.style.cssText = `
    width: 100%;
    padding: 6px 8px;
    background: #7c3aed;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-top: 4px;
  `
  changeMonsterBtn.addEventListener('mouseenter', () => {
    changeMonsterBtn.style.background = '#6d28d9'
  })
  changeMonsterBtn.addEventListener('mouseleave', () => {
    changeMonsterBtn.style.background = '#7c3aed'
  })
  changeMonsterBtn.addEventListener('click', () => {
    showMonsterSelectionModal(pawnId)
    hideContextMenu()
  })
  menu.appendChild(changeMonsterBtn)

  // Monster AI Controls Section
  const aiSection = document.createElement('div')
  aiSection.style.cssText = `
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #374151;
  `

  // AI Status Header
  const aiHeader = document.createElement('div')
  const isAIEnabled = monsterAI.isEnabled() && monsterTurnManager.isMonsterPawn(pawnId)
  const currentPersonality = isAIEnabled ? monsterAI.getCurrentPersonality() : null
  
  aiHeader.textContent = isAIEnabled ? `🤖 AI Active: ${currentPersonality?.name}` : '🤖 Monster AI'
  aiHeader.style.cssText = `
    color: ${isAIEnabled ? '#10b981' : '#6b7280'};
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 6px;
    text-align: center;
  `
  aiSection.appendChild(aiHeader)

  // AI Toggle Button
  const aiToggleBtn = document.createElement('button')
  aiToggleBtn.textContent = isAIEnabled ? '🔴 Disable AI' : '🟢 Enable AI'
  aiToggleBtn.style.cssText = `
    width: 100%;
    padding: 6px 8px;
    background: ${isAIEnabled ? '#dc2626' : '#059669'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background-color 0.2s;
  `
  aiToggleBtn.addEventListener('mouseenter', () => {
    aiToggleBtn.style.background = isAIEnabled ? '#b91c1c' : '#047857'
  })
  aiToggleBtn.addEventListener('mouseleave', () => {
    aiToggleBtn.style.background = isAIEnabled ? '#dc2626' : '#059669'
  })
  aiToggleBtn.addEventListener('click', () => {
    if (isAIEnabled) {
      // Disable AI
      monsterAI.disable()
      monsterTurnManager.setMonsterPawn(pawnId, false)
      appendLogLine(`Monster AI disabled for Pawn ${pawnId}`)
    } else {
      // Enable AI for this pawn
      monsterTurnManager.setMonsterPawn(pawnId, true)
      monsterAI.enable()
      const personality = monsterAI.getCurrentPersonality()
      appendLogLine(`Monster AI enabled for Pawn ${pawnId} as ${personality.name}`)
    }
    hideContextMenu()
  })
  aiSection.appendChild(aiToggleBtn)

  // AI Test Action Button (only show if AI is enabled for this pawn)
  if (isAIEnabled) {
    const aiTestBtn = document.createElement('button')
    aiTestBtn.textContent = '⚡ Test AI Action'
    aiTestBtn.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: #f59e0b;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background-color 0.2s;
      margin-top: 4px;
    `
    aiTestBtn.addEventListener('mouseenter', () => {
      aiTestBtn.style.background = '#d97706'
    })
    aiTestBtn.addEventListener('mouseleave', () => {
      aiTestBtn.style.background = '#f59e0b'
    })
    aiTestBtn.addEventListener('click', async () => {
      // Force AI to take a test action by building game state and calling executeMonsterTurn
      appendLogLine(`Testing Monster AI for Pawn ${pawnId}...`)
      
      try {
        const gameState = monsterTurnManager.buildGameState(turns, pawnA, pawnB, {
          pawnId,
          reachA,
          reachB,
          threatenedSquares,
          attackRoll,
          appendLogLine
        })
        
        const success = await monsterTurnManager.executeMonsterTurn(pawnId, gameState)
        if (success) {
          appendLogLine(`Monster AI test completed for Pawn ${pawnId}`)
        } else {
          appendLogLine(`Monster AI test failed for Pawn ${pawnId}`)
        }
      } catch (error) {
        console.error('AI test error:', error)
        appendLogLine(`Monster AI test error: ${error}`)
      }
      
      hideContextMenu()
    })
    aiSection.appendChild(aiTestBtn)
  }

  menu.appendChild(aiSection)

  document.body.appendChild(menu)
  contextMenu = menu

  // Close menu when clicking outside
  const closeHandler = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      hideContextMenu()
      document.removeEventListener('click', closeHandler)
    }
  }
  setTimeout(() => document.addEventListener('click', closeHandler), 10)
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.remove()
    contextMenu = null
  }
}

// Monster Selection Modal
function showMonsterSelectionModal(pawnId: 'A' | 'B') {
  // Create modal overlay
  const modalOverlay = document.createElement('div')
  modalOverlay.id = 'monster-selection-modal'
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
  `

  // Create modal content
  const modalContent = document.createElement('div')
  modalContent.style.cssText = `
    background: rgba(20, 25, 30, 0.95);
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 20px;
    width: 80%;
    max-width: 800px;
    max-height: 80%;
    overflow-y: auto;
    color: #e5e7eb;
    font-family: 'Segoe UI', system-ui, Arial, sans-serif;
  `

  // Modal header
  const header = document.createElement('div')
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: ${pawnId === 'A' ? '#5aa9e6' : '#e65a5a'};">Change Monster - Pawn ${pawnId}</h2>
      <button id="close-monster-modal" style="
        background: #ef4444;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
      ">×</button>
    </div>
  `

  // Filter controls
  const filters = document.createElement('div')
  filters.innerHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
      <input type="text" id="monster-search" placeholder="Search monsters..." style="
        flex: 1;
        padding: 8px;
        border: 1px solid #374151;
        border-radius: 4px;
        background: #1f2937;
        color: #e5e7eb;
        min-width: 200px;
      ">
      <select id="monster-type-filter" style="
        padding: 8px;
        border: 1px solid #374151;
        border-radius: 4px;
        background: #1f2937;
        color: #e5e7eb;
      ">
        <option value="">All Types</option>
        <option value="Aberration">Aberration</option>
        <option value="Animal">Animal</option>
        <option value="Construct">Construct</option>
        <option value="Dragon">Dragon</option>
        <option value="Elemental">Elemental</option>
        <option value="Fey">Fey</option>
        <option value="Giant">Giant</option>
        <option value="Humanoid">Humanoid</option>
        <option value="Magical Beast">Magical Beast</option>
        <option value="Monstrous Humanoid">Monstrous Humanoid</option>
        <option value="Ooze">Ooze</option>
        <option value="Outsider">Outsider</option>
        <option value="Plant">Plant</option>
        <option value="Undead">Undead</option>
        <option value="Vermin">Vermin</option>
      </select>
      <select id="monster-size-filter" style="
        padding: 8px;
        border: 1px solid #374151;
        border-radius: 4px;
        background: #1f2937;
        color: #e5e7eb;
      ">
        <option value="">All Sizes</option>
        <option value="Fine">Fine</option>
        <option value="Diminutive">Diminutive</option>
        <option value="Tiny">Tiny</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="Huge">Huge</option>
        <option value="Gargantuan">Gargantuan</option>
        <option value="Colossal">Colossal</option>
      </select>
    </div>
  `

  // Monster list container
  const monsterList = document.createElement('div')
  monsterList.id = 'monster-list'
  monsterList.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #374151;
    border-radius: 4px;
    background: #1f2937;
  `

  // Function to render monster list
  const renderMonsterList = (monsters: typeof MONSTER_DATABASE) => {
    monsterList.innerHTML = monsters.slice(0, 50).map(monster => `
      <div class="monster-item" data-monster-id="${monster.id}" style="
        padding: 12px;
        border-bottom: 1px solid #374151;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseover="this.style.backgroundColor='rgba(124, 58, 237, 0.2)'" 
         onmouseout="this.style.backgroundColor='transparent'">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="font-weight: bold; color: #fff; margin-bottom: 4px;">${monster.name}</div>
            <div style="color: #9ca3af; font-size: 12px; margin-bottom: 2px;">
              ${monster.size} ${monster.type} | CR ${monster.challengeRating}
            </div>
            <div style="color: #6b7280; font-size: 11px;">
              HP: ${monster.hitPoints.average} | AC: ${monster.armorClass.total} | Speed: ${monster.speed.land}ft
            </div>
          </div>
          <div style="color: #7c3aed; font-size: 10px; text-align: right;">
            ${monster.specialAttacks?.slice(0, 2).map(sa => sa.name).join(', ') || 'No special attacks'}
          </div>
        </div>
      </div>
    `).join('')

    // Add click handlers
    monsterList.querySelectorAll('.monster-item').forEach(item => {
      item.addEventListener('click', () => {
        const monsterId = (item as HTMLElement).dataset.monsterId!
        const monster = MONSTER_DATABASE.find(m => m.id === monsterId)!
        applyMonsterToPawn(pawnId, monster)
        modalOverlay.remove()
      })
    })
  }

  // Filter functionality
  const applyFilters = () => {
    const searchTerm = (document.getElementById('monster-search') as HTMLInputElement).value.toLowerCase()
    const typeFilter = (document.getElementById('monster-type-filter') as HTMLSelectElement).value
    const sizeFilter = (document.getElementById('monster-size-filter') as HTMLSelectElement).value

    const filteredMonsters = MONSTER_DATABASE.filter(monster => {
      const matchesSearch = monster.name.toLowerCase().includes(searchTerm) ||
                           monster.type.toLowerCase().includes(searchTerm)
      const matchesType = !typeFilter || monster.type === typeFilter
      const matchesSize = !sizeFilter || monster.size === sizeFilter
      
      return matchesSearch && matchesType && matchesSize
    })

    renderMonsterList(filteredMonsters)
  }

  // Assemble modal
  modalContent.appendChild(header)
  modalContent.appendChild(filters)
  modalContent.appendChild(monsterList)
  modalOverlay.appendChild(modalContent)
  
  // Add to DOM first
  document.body.appendChild(modalOverlay)

  // Initial render
  renderMonsterList(MONSTER_DATABASE)

  // Event listeners (now that elements are in DOM)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.remove()
  })

  const closeButton = document.getElementById('close-monster-modal')
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      modalOverlay.remove()
    })
  }

  const searchInput = document.getElementById('monster-search') as HTMLInputElement
  const typeFilter = document.getElementById('monster-type-filter') as HTMLSelectElement
  const sizeFilter = document.getElementById('monster-size-filter') as HTMLSelectElement

  if (searchInput) searchInput.addEventListener('input', applyFilters)
  if (typeFilter) typeFilter.addEventListener('change', applyFilters)
  if (sizeFilter) sizeFilter.addEventListener('change', applyFilters)

  // Focus search input
  setTimeout(() => {
    if (searchInput) searchInput.focus()
  }, 100)
}

// Hover preview
app.canvas.addEventListener('mousemove', (ev) => {
  const rect = app.canvas.getBoundingClientRect()
  const mx = Math.floor((ev.clientX - rect.left) / CELL)
  const my = Math.floor((ev.clientY - rect.top) / CELL)
  
  if (editTerrain) return
  // If the active pawn is a monster controlled by the AI, disable user preview interactions
  const activeId = turns.active?.id as 'A'|'B' | undefined
  if (activeId && monsterTurnManager.isMonsterPawn(activeId) && monsterAI.isEnabled()) {
    // Show a disabled cursor so the user knows input is blocked during AI turns
    app.canvas.style.cursor = 'not-allowed'
    return
  }
  
  // Check if hovering over a pawn and update cursor
  const pawnAtPosition = getPawnAtPosition(mx, my)
  if (pawnAtPosition) {
    app.canvas.style.cursor = 'pointer'
  } else {
    app.canvas.style.cursor = 'default'
  }
  
  const { path, trimmed, threatSet } = planFromActiveTo(mx, my)
  overlay.clear()
  drawAll()
  drawPreview(path, threatSet, trimmed)
  // measurement label
  // measurement label (placeholder for future use)
  overlay.fill(0xffffff).rect(mx*CELL+4, my*CELL+4, 32, 14)
  overlay.fill(0x111111).rect(mx*CELL+4, my*CELL+4, 32, 14).stroke({ color: 0x333333, width: 1 })
  overlay.fill(0xffffff)
  // LoS overlay if enabled
  if (showLoS) {
    const active = turns.active?.id === 'A' ? pawnB : pawnB
    const los = effects.losClearConsideringFog(active.x, active.y, mx, my)
    overlay.stroke({ color: los.clear ? 0x66ff66 : 0xff6666, width: 2 }).moveTo(active.x*CELL+CELL/2, active.y*CELL+CELL/2).lineTo(mx*CELL+CELL/2, my*CELL+CELL/2)
  }
})

// Click to act
app.canvas.addEventListener('click', (ev) => {
  const rect = app.canvas.getBoundingClientRect()
  const mx = Math.floor((ev.clientX - rect.left) / CELL)
  const my = Math.floor((ev.clientY - rect.top) / CELL)
  
  if (editTerrain) {
    if (ev.shiftKey) cycleCoverAt(mx,my); else toggleDifficultAt(mx,my)
    drawAll()
    return
  }
  // Prevent manual clicks/movement while AI controls the active pawn
  const activeId = turns.active?.id as 'A'|'B' | undefined
  if (activeId && monsterTurnManager.isMonsterPawn(activeId) && monsterAI.isEnabled()) {
    appendLogLine(`Pawn ${activeId} is controlled by AI this turn. Manual movement disabled.`)
    return
  }
  
  const { path, trimmed, info, threatSet } = planFromActiveTo(mx, my)
  overlay.clear()
  drawAll()
  drawPreview(path, threatSet, trimmed)
  
  // Hide any existing context menu on regular click
  hideContextMenu()
  
  if (!attackMode) {
  if (gameOver) return
    const active = turns.active?.id === 'A' ? pawnA : pawnB
    if (active.hp <= 0) { appendLogLine(`${turns.active?.id} is down.`); commitEndTurn(); return }
    const last = trimmed[trimmed.length - 1]
    // If attempting to move through/into an enemy-occupied square, require Tumble DC 25
    const other = turns.active?.id === 'A' ? pawnB : pawnA
    if (last && last[0] === other.x && last[1] === other.y) {
      if (!tumbleEnabled) { appendLogLine('Cannot move through an enemy without Tumble.'); return }
      const roll = Math.floor(currentRNG()*20)+1
      const total = roll + tumbleBonus
      const dc = skills.tumble.dcThroughEnemy({})
      const ok = total >= dc
      appendLogLine(`Tumble (through enemy square) ${roll}+${tumbleBonus}=${total} vs DC ${dc} -> ${ok?'success':'fail'}`)
      if (!ok) return
    }
  if (last) { undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift(); active.x = last[0]; active.y = last[1] }
  // Enforce simple action economy
  // Five-foot step allowed if exactly 5 ft and not into difficult terrain
  if (info.feet === 5 && info.difficultSquares === 0) {
      if (!consume(turns.budget!, 'five-foot-step')) { appendLogLine('No five-foot step available.'); return }
    } else {
      if (!consume(turns.budget!, 'move')) { appendLogLine('Move action already used.'); return }
    }
    // If Tumble is enabled, attempt to avoid provoking. 3.5e: DC 15 to avoid AoO when moving through threatened squares.
    // If moving at full speed while tumbling, DC +10 (accelerated tumbling). Cannot run or charge (not modeled here).
    let avoided = false
    if (info.provokes && tumbleEnabled) {
      const activeSpeed = (turns.active?.id === 'A' ? pawnA : pawnB).speed
      const movingFullSpeed = info.feet > (activeSpeed / 2)
      const dc = skills.tumble.dcAvoidAoO({ accelerated: movingFullSpeed })
      const roll = Math.floor(currentRNG()*20)+1
      const total = roll + tumbleBonus
      avoided = total >= dc
      appendLogLine(`Tumble ${movingFullSpeed?'(accelerated) ':''}check ${roll}+${tumbleBonus}=${total} vs DC ${dc} -> ${avoided?'success (no AoO)':'fail'}`)
    }
    appendLogLine(`${turns.active?.id} moves ${info.feet} ft${(info.provokes && !avoided) ? ' (provokes)' : ''}.`)
  updateActionHUD(hudText())
    // AoO from the other pawn if path provokes and they have AoO available
    if (info.provokes && !avoided) {
      const otherId = turns.active?.id === 'A' ? 'B' : 'A'
      const otherPawn = otherId === 'A' ? pawnA : pawnB
      // Flat-footed creatures can't make AoOs (simplified demo toggle)
      if (flatFootedMode) {
        appendLogLine(`${otherId} is flat-footed and cannot make AoOs.`)
      } else {
      const used = (turns as any).aooUsed?.[otherId] ?? 0
      if (used < 1) {
  // Cover prevents AoOs. Check cover between threatening creature and the starting square of movement.
    const start = trimmed[0] ?? [active.x, active.y]
    const prevented = aooPreventedByCoverOrFog(G, effects, { x: otherPawn.x, y: otherPawn.y }, { x: start[0], y: start[1] }, [[active.x, active.y]])
  if (prevented) {
          appendLogLine(`${otherId}'s AoO prevented by cover.`)
        } else {
        const atk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
        const def: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
        const outcome = attackRoll(atk, def, currentRNG)
        appendLogLine(`${otherId} makes AoO: roll=${outcome.attackRoll} total=${outcome.totalToHit} hit=${outcome.hit}${outcome.critical ? ' CRIT!' : ''}`)
        if (outcome.hit) {
          undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
          const raw = rollWeaponDamage(currentRNG, { count: 1, sides: 6, strMod: 3, strScale: 1, critMult: outcome.critical ? 2 : 1 })
          const tgt = turns.active?.id === 'A' ? pawnA : pawnB
          const packet: DamagePacket = { amount: raw, types: ['slashing'], bypassTags: ['magic'] }
          const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'A' : 'B'), packet)
          const taken = applied.taken
          tgt.hp = Math.max(0, tgt.hp - taken)
          appendLogLine(`${otherId} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Target HP ${tgt.hp}.`)
          if (tgt.hp <= 0) { gameOver = otherId; appendLogLine(`${otherId} wins!`); }
        }
          (turns as any).aooUsed![otherId] = used + 1
        }
      }
  }
    }
  // If target had readied 'attack-when-adjacent' and ended adjacent, trigger now
  const idNow = turns.active?.id
  const otherIdNow = idNow === 'A' ? 'B' : 'A'
  const otherPawnNow = otherIdNow === 'A' ? pawnA : pawnB
  const readyMap: any = (turns as any).ready || {}
  if (readyMap[otherIdNow]?.type === 'attack-when-adjacent' && !readyMap[otherIdNow].used) {
    const dx = Math.abs((idNow === 'A' ? pawnA.x : pawnB.x) - otherPawnNow.x)
    const dy = Math.abs((idNow === 'A' ? pawnA.y : pawnB.y) - otherPawnNow.y)
    if (Math.max(dx, dy) === 1) {
      readyMap[otherIdNow].used = true
      appendLogLine(`${otherIdNow}'s readied action triggers!`)
      const atk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
      const def: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: false, flatFooted: flatFootedMode }
      const out = attackRoll(atk, def, currentRNG)
      appendLogLine(`${otherIdNow} readied attack: roll=${out.attackRoll} total=${out.totalToHit} hit=${out.hit}${out.critical?' CRIT!':''}`)
      if (out.hit) {
        undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
        const raw = rollWeaponDamage(currentRNG, { count: 1, sides: 6, strMod: 3, strScale: 1, critMult: out.critical ? 2 : 1 })
        const tgt = idNow === 'A' ? pawnA : pawnB
  const packet: DamagePacket = { amount: raw, types: ['slashing'], bypassTags: ['magic'] }
  const applied = applyDamage(defenderFor(idNow === 'A' ? 'A' : 'B'), packet)
        const taken = applied.taken
        tgt.hp = Math.max(0, tgt.hp - taken)
        appendLogLine(`${otherIdNow} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Target HP ${tgt.hp}.`)
        if (tgt.hp <= 0) { gameOver = otherIdNow as 'A'|'B'; appendLogLine(`${otherIdNow} wins!`) }
      }
    }
  }
  drawAll()
  // Remain on the same turn; use End Turn button to proceed.
  } else {
    // attack mode: if clicked on enemy square, resolve a simple attack
    const target = turns.active?.id === 'A' ? pawnB : pawnA
    if (mx === target.x && my === target.y) {
  if (gameOver) return
  if (!consume(turns.budget!, 'standard')) { appendLogLine('Standard action already used.'); return }
  
  const attacker = turns.active?.id === 'A' ? pawnA : pawnB
  const attackerReach = turns.active?.id === 'A' ? reachA : reachB
  
  // Check if attack is within reach
  const reachCheck = isWithinAttackReach(
    attacker.x, attacker.y, 
    target.x, target.y, 
    attacker.size, 
    attackerReach, 
    rangedMode
  )
  
  if (!reachCheck.inRange) {
    if (rangedMode) {
      appendLogLine(`Cannot make ranged attack: target not in range.`)
    } else {
      const reachText = attackerReach ? ` (reach weapon: ${reachCheck.maxReach} squares)` : ` (${reachCheck.maxReach} square${reachCheck.maxReach === 1 ? '' : 's'})`
      appendLogLine(`Cannot attack: target is ${reachCheck.distance} squares away, but melee reach is only ${reachCheck.maxReach}${reachText}.`)
    }
    return
  }
  
  const atk: AttackProfile = rangedMode ? { bab: 2, abilityMod: 3, sizeMod: 0 } : { bab: 2, abilityMod: 3, sizeMod: 0 }
  const def: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
  // If making a ranged attack while threatened, target gets an AoO first
  if (rangedMode) {
  const threat = threatSetFrom(target.x, target.y, target.size, target === pawnB ? reachB : reachA)
    const attackerKey = turns.active?.id
    const defenderKey = attackerKey === 'A' ? 'B' : 'A'
    if (threat.has(`${attacker!.x},${attacker!.y}`)) {
      if (flatFootedMode) {
        appendLogLine(`${defenderKey} is flat-footed and cannot make AoOs.`)
      } else {
        const used = (turns as any).aooUsed?.[defenderKey] ?? 0
        if (used < 1) {
          // Cover prevents AoOs against the attacker
          const prevented = aooPreventedByCoverOrFog(G, effects, { x: target.x, y: target.y }, { x: attacker!.x, y: attacker!.y }, [[attacker!.x, attacker!.y]])
          if (prevented) {
            appendLogLine(`${defenderKey}'s AoO prevented by cover.`)
          } else {
          const aooAtk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
          const aooDef: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
          const aooOutcome = attackRoll(aooAtk, aooDef, currentRNG)
          appendLogLine(`${defenderKey} AoO (ranged in melee): roll=${aooOutcome.attackRoll} total=${aooOutcome.totalToHit} hit=${aooOutcome.hit}${aooOutcome.critical ? ' CRIT!' : ''}`)
          if (aooOutcome.hit) {
            undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
            const base = aooOutcome.critical ? 10 : 5
            const atkPawn = attackerKey === 'A' ? pawnA : pawnB
            const packet: DamagePacket = { amount: base, types: ['slashing'], bypassTags: ['magic'] }
            const applied = applyDamage(defenderFor(attackerKey === 'A' ? 'A' : 'B'), packet)
            const taken = applied.taken
            atkPawn.hp = Math.max(0, atkPawn.hp - taken)
            appendLogLine(`${defenderKey} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Attacker HP ${atkPawn.hp}.`)
            if (atkPawn.hp <= 0) { gameOver = defenderKey as 'A'|'B'; appendLogLine(`${defenderKey} wins!`); drawAll(); commitEndTurn(); return }
          }
            (turns as any).aooUsed![defenderKey] = used + 1
          }
        }
      }
    }
  }
  const occupiedSoft: Array<[number,number]> = [[attacker!.x, attacker!.y],[target.x, target.y]]
  const cover = useCornerCover
    ? (coverBetweenSquaresCorner(G, attacker!.x, attacker!.y, target.x, target.y, { occupied: occupiedSoft }) || coverBetweenSquares(G, attacker!.x, attacker!.y, target.x, target.y))
    : coverBetweenSquares(G, attacker!.x, attacker!.y, target.x, target.y)
  let conceal = concealmentAtTarget(G, target.x, target.y)
  const fogCon = effects.computeFogConcealment(attacker!.x, attacker!.y, target.x, target.y)
  if (fogCon > conceal) conceal = fogCon
  const losCheck = effects.losClearConsideringFog(attacker!.x, attacker!.y, target.x, target.y)
  if (!losCheck.clear) conceal = 50 as const
  if (rangedMode && !losCheck.clear) {
    appendLogLine('No line of sight for ranged attack.')
    return
  }
  // Apply -4 ranged into melee penalty if target is engaged in melee (adjacent to an enemy), unless Precise Shot is enabled
  let inMeleePenalty = 0
  if (rangedMode && !preciseShot) {
    const dx = Math.abs(attacker!.x - target.x)
    const dy = Math.abs(attacker!.y - target.y)
    const engaged = (dx + dy) === 1 || (dx === 1 && dy === 1) // adjacent incl. diagonal
    if (engaged) inMeleePenalty = -4
  }
  const atkWithPenalty: AttackProfile = { ...atk, miscBonuses: inMeleePenalty ? [{ type: 'unnamed', value: inMeleePenalty }] : undefined }
  // Attack line overlay
  overlay.stroke({ color: 0xffff00, width: 2 }).moveTo(attacker!.x*CELL+CELL/2, attacker!.y*CELL+CELL/2).lineTo(target.x*CELL+CELL/2, target.y*CELL+CELL/2)
  const outcome = attackRoll(atkWithPenalty, def, currentRNG, { coverBonus: cover, concealment: conceal })
  appendLogLine(`${turns.active?.id} attacks: roll=${outcome.attackRoll} total=${outcome.totalToHit} vs AC${cover?`+${cover}`:''} hit=${outcome.hit}${outcome.critical ? ' CRIT!' : ''}${outcome.concealmentMiss?' (concealment)':''}`)
      if (outcome.hit) {
        undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
        const raw = rollWeaponDamage(currentRNG, { count: 1, sides: 8, strMod: 3, strScale: 1, critMult: outcome.critical ? 2 : 1 })
        const targetPawn = turns.active?.id === 'A' ? pawnB : pawnA
  const packet: DamagePacket = { amount: raw, types: ['slashing'], bypassTags: ['magic'] }
  const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'B' : 'A'), packet)
        const taken = applied.taken
        targetPawn.hp = Math.max(0, targetPawn.hp - taken)
  appendLogLine(`${turns.active?.id} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Target HP ${targetPawn.hp}.`)
  // Visuals: show slash from attacker to target for 3s, then show hit/miss indicator for 2s and flash the target pawn
  try {
    // show the slash for 3s (3000ms)
    showAttackSlash(overlay, attacker!.x, attacker!.y, target.x, target.y, CELL, 3000)
    // after the slash duration, show hit/miss indicator for 2s and flash the pawn for 2s
    setTimeout(() => {
      try { showHitOrMiss(overlay, target.x, target.y, CELL, true, 2000) } catch (e) {}
      try { flashPawnHit(target === pawnA ? pawnASprite : pawnBSprite, 2000) } catch (e) {}
    }, 3000)
  } catch (e) { }
  if (targetPawn.hp <= 0) { gameOver = turns.active?.id === 'A' ? 'A' : 'B'; appendLogLine(`${gameOver} wins!`) }
      }
  drawAll()
  updateActionHUD(hudText())
  // Remain on the same turn; use End Turn button to proceed.
    }
  }
})

// Right-click context menu for pawns
app.canvas.addEventListener('contextmenu', (ev) => {
  ev.preventDefault() // Prevent default context menu
  
  const rect = app.canvas.getBoundingClientRect()
  const mx = Math.floor((ev.clientX - rect.left) / CELL)
  const my = Math.floor((ev.clientY - rect.top) / CELL)
  
  // Check if right-click is on a pawn
  const pawnAtPosition = getPawnAtPosition(mx, my)
  if (pawnAtPosition) {
    showPawnContextMenu(pawnAtPosition, ev)
  } else {
    // Hide any existing context menu when right-clicking elsewhere
    hideContextMenu()
  }
})

// Controls wiring
// Collapsible panel functionality
let controlsCollapsed = false

function toggleControlsPanel() {
  controlsCollapsed = !controlsCollapsed
  const advancedControls = document.getElementById('advanced-controls')
  const collapseIcon = document.getElementById('collapse-icon')
  const collapseText = document.getElementById('collapse-text')
  
  if (advancedControls && collapseIcon && collapseText) {
    if (controlsCollapsed) {
      advancedControls.style.display = 'none'
      collapseIcon.textContent = '▶'
      collapseText.textContent = 'Show More'
    } else {
      advancedControls.style.display = 'block'
      collapseIcon.textContent = '▼'
      collapseText.textContent = 'Show Less'
    }
    
    // Store state in localStorage
    localStorage.setItem('controlsCollapsed', controlsCollapsed.toString())
  }
}

// Initialize collapse state from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedState = localStorage.getItem('controlsCollapsed')
  if (savedState === 'true') {
    controlsCollapsed = false // Set opposite so toggle works correctly
    toggleControlsPanel()
  }
})

// Add collapse toggle event listener
document.getElementById('collapse-toggle')?.addEventListener('click', toggleControlsPanel)

// Character management buttons
document.getElementById('new-character-btn')?.addEventListener('click', () => {
  console.log('=== NEW CHARACTER BUTTON CLICKED ===')
  console.log('uiManager exists:', !!uiManager)
  console.log('uiManager.characterCreation exists:', !!uiManager.characterCreation)
  console.log('characterCreation.show type:', typeof uiManager.characterCreation.show)
  
  try {
    uiManager.characterCreation.show()
    console.log('show() method called successfully')
  } catch (err) {
    console.error('Error calling show():', err)
  }
})
document.getElementById('character-sheet-btn')?.addEventListener('click', () => {
  uiManager.characterSheet.toggle()
})
document.getElementById('spellbook-btn')?.addEventListener('click', () => {
  uiManager.spellBook.toggle()
})

// Combat controls
document.getElementById('end-turn')?.addEventListener('click', () => { (turns as any).aooUsed = {}; commitEndTurn() })
document.getElementById('attack-mode')?.addEventListener('click', () => {
  attackMode = !attackMode
  appendLogLine(`Attack mode: ${attackMode ? 'ON' : 'OFF'}`)
})
document.getElementById('ranged-toggle')?.addEventListener('change', (e) => {
  rangedMode = (e.target as HTMLInputElement).checked
  appendLogLine(`Ranged mode: ${rangedMode ? 'ON' : 'OFF'}`)
})
document.getElementById('terrain-toggle')?.addEventListener('change', (e) => {
  editTerrain = (e.target as HTMLInputElement).checked
  appendLogLine(`Edit Terrain: ${editTerrain ? 'ON' : 'OFF'} (click toggles difficult; Shift+click cycles cover)`) 
})
document.getElementById('touch-toggle')?.addEventListener('change', (e) => {
  touchMode = (e.target as HTMLInputElement).checked
  appendLogLine(`Touch AC mode: ${touchMode ? 'ON' : 'OFF'}`)
})
document.getElementById('flat-toggle')?.addEventListener('change', (e) => {
  flatFootedMode = (e.target as HTMLInputElement).checked
  appendLogLine(`Flat-Footed mode: ${flatFootedMode ? 'ON' : 'OFF'}`)
})
document.getElementById('defensive-cast-toggle')?.addEventListener('change', (e) => {
  defensiveCast = (e.target as HTMLInputElement).checked
  appendLogLine(`Defensive Cast: ${defensiveCast ? 'ON' : 'OFF'}`)
})
document.getElementById('prefer-easy-toggle')?.addEventListener('change', (e) => {
  preferEasyTerrain = (e.target as HTMLInputElement).checked
  appendLogLine(`Prefer easy terrain: ${preferEasyTerrain ? 'ON' : 'OFF'}`)
})
document.getElementById('show-los-toggle')?.addEventListener('change', (e) => {
  showLoS = (e.target as HTMLInputElement).checked
  appendLogLine(`Show LoS: ${showLoS ? 'ON' : 'OFF'}`)
})
document.getElementById('reachA-toggle')?.addEventListener('change', (e) => {
  reachA = (e.target as HTMLInputElement).checked
  appendLogLine(`Pawn A reach weapon: ${reachA ? 'ON' : 'OFF'}`)
  drawAll()
})
document.getElementById('reachB-toggle')?.addEventListener('change', (e) => {
  reachB = (e.target as HTMLInputElement).checked
  appendLogLine(`Pawn B reach weapon: ${reachB ? 'ON' : 'OFF'}`)
  drawAll()
})
document.getElementById('corner-cover-toggle')?.addEventListener('change', (e) => {
  useCornerCover = (e.target as HTMLInputElement).checked
  appendLogLine(`Corner-rule cover: ${useCornerCover ? 'ON' : 'OFF'}`)
})
document.getElementById('precise-toggle')?.addEventListener('change', (e) => {
  preciseShot = (e.target as HTMLInputElement).checked
  appendLogLine(`Precise Shot: ${preciseShot ? 'ON' : 'OFF'} (ranged into melee penalty ${preciseShot ? 'ignored' : '-4'})`)
})
document.getElementById('ready-btn')?.addEventListener('click', () => {
  const id = turns.active?.id
  if (!id) return
  if (!consume(turns.budget!, 'standard')) { appendLogLine('Ready: need a Standard action available.'); return }
  ;(turns as any).ready ||= {}
  ;(turns as any).ready[id] = { type: 'attack-when-adjacent', used: false }
  appendLogLine(`${id} readies: attack when enemy is adjacent.`)
})
document.getElementById('tumble-toggle')?.addEventListener('change', (e) => {
  tumbleEnabled = (e.target as HTMLInputElement).checked
  appendLogLine(`Tumble: ${tumbleEnabled ? 'ON' : 'OFF'}`)
})
document.getElementById('tumble-bonus')?.addEventListener('change', (e) => {
  const v = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) tumbleBonus = v|0
})
document.getElementById('conc-bonus')?.addEventListener('change', (e) => {
  const v = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) concBonus = v|0
})
document.getElementById('spell-select')?.addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value
  selectedSpell = (v === 'fog-cloud' ? 'fog-cloud' : 'magic-missile')
})
document.getElementById('cast-btn')?.addEventListener('click', () => {
  if (!consume(turns.budget!, 'standard')) { appendLogLine('Standard action already used.'); return }
  const attacker = turns.active?.id === 'A' ? pawnA : pawnB
  const target = turns.active?.id === 'A' ? pawnB : pawnA
  // Define simple spell data
  const spellLevel = selectedSpell === 'magic-missile' ? 1 : 2
  // Casting can provoke unless casting defensively succeeds
  let provoked = true
  if (defensiveCast) {
    const roll = Math.floor(currentRNG()*20)+1
    const total = roll + concBonus
    const dc = 15 + spellLevel // 3.5e: casting defensively DC 15 + spell level
    appendLogLine(`Concentration (defensive) ${roll}+${concBonus}=${total} vs DC ${dc}`)
    if (total >= dc) provoked = false
  }
  if (provoked) {
    const otherId = turns.active?.id === 'A' ? 'B' : 'A'
    const used = (turns as any).aooUsed?.[otherId] ?? 0
  const threat = threatSetFrom(target.x, target.y, target.size, target === pawnB ? reachB : reachA)
    if (threat.has(`${attacker!.x},${attacker!.y}`) && used < 1 && !flatFootedMode) {
      // Cover/fog prevention
      const prevented = aooPreventedByCoverOrFog(G, effects, { x: target.x, y: target.y }, { x: attacker!.x, y: attacker!.y }, [[attacker!.x, attacker!.y]])
      if (prevented) {
        appendLogLine(`${otherId}'s AoO prevented by cover.`)
      } else {
      const aooAtk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
      const aooDef: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
      const aooOutcome = attackRoll(aooAtk, aooDef, currentRNG)
      appendLogLine(`${otherId} AoO (casting): roll=${aooOutcome.attackRoll} total=${aooOutcome.totalToHit} hit=${aooOutcome.hit}${aooOutcome.critical ? ' CRIT!' : ''}`)
      if (aooOutcome.hit) {
        undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
        const base = aooOutcome.critical ? 10 : 5
        const atkPawn = turns.active?.id === 'A' ? pawnA : pawnB
  const packet: DamagePacket = { amount: base, types: ['slashing'], bypassTags: ['magic'] }
  const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'A' : 'B'), packet)
        const taken = applied.taken
        atkPawn.hp = Math.max(0, atkPawn.hp - taken)
        appendLogLine(`${otherId} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Caster HP ${atkPawn.hp}.`)
        // Concentration check to avoid losing the spell: DC 10 + damage dealt + spell level
        const roll2 = Math.floor(currentRNG()*20)+1
        const total2 = roll2 + concBonus
        const dc2 = 10 + taken + spellLevel
        appendLogLine(`Concentration (damage while casting) ${roll2}+${concBonus}=${total2} vs DC ${dc2}`)
        if (total2 < dc2) {
          appendLogLine('Spell lost due to damage while casting!')
          ;(turns as any).aooUsed![otherId] = used + 1
          updateActionHUD(hudText())
          return
        }
      }
      (turns as any).aooUsed![otherId] = used + 1
      }
    }
  }
  // Resolve simple spells
  if (selectedSpell === 'magic-missile') {
    // Require line of sight; Magic Missile auto-hits if LoS is clear
  const los = effects.losClearConsideringFog(attacker!.x, attacker!.y, target.x, target.y)
    if (!los.clear) {
      appendLogLine('Magic Missile fails: no line of sight to target.')
    } else {
      const base = (Math.floor(currentRNG()*4)+1) + 1 // 1d4+1
  const packet: DamagePacket = { amount: base, types: ['force'] }
  const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'B' : 'A'), packet)
      const taken = applied.taken
      target.hp = Math.max(0, target.hp - taken)
      appendLogLine(`Magic Missile hits for ${taken}${applied.preventedByER?` (ER)`:''}. Target HP ${target.hp}.`)
    }
  } else {
    // Fog Cloud: 20-ft radius spread (4 squares), lasts 3 rounds
    const R = 4
    const DURATION = 3
  undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
  effects.addFogCloud(target.x, target.y, R, DURATION, turns.round)
    appendLogLine('Fog Cloud placed (blocks LoS in a 20-ft radius, 3 rounds).')
  }
  drawAll()
  updateActionHUD(hudText())
})
document.getElementById('potion-btn')?.addEventListener('click', () => {
  if (!consume(turns.budget!, 'standard')) { appendLogLine('Standard action already used.'); return }
  const self = turns.active?.id === 'A' ? pawnA : pawnB
  undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
  const heal = 5
  self.hp = Math.min(self === pawnA ? 20 : 25, self.hp + heal)
  appendLogLine(`Drinks potion: heals ${heal}. HP now ${self.hp}.`)
  // Drinking a potion provokes if threatened and not prevented by cover/fog
  const other = turns.active?.id === 'A' ? pawnB : pawnA
  const threat = threatSetFrom(other.x, other.y, other.size, other === pawnB ? reachB : reachA)
  const key = `${self.x},${self.y}`
  const otherId = turns.active?.id === 'A' ? 'B' : 'A'
  if (Provokes['drink-potion'] && threat.has(key) && !flatFootedMode) {
    const prevented = aooPreventedByCoverOrFog(G, effects, { x: other.x, y: other.y }, { x: self.x, y: self.y }, [[self.x, self.y]])
    const used = (turns as any).aooUsed?.[otherId] ?? 0
    if (!prevented && used < 1) {
      const aooAtk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
      const aooDef: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
      const aooOutcome = attackRoll(aooAtk, aooDef, currentRNG)
      appendLogLine(`${otherId} AoO (potion): roll=${aooOutcome.attackRoll} total=${aooOutcome.totalToHit} hit=${aooOutcome.hit}${aooOutcome.critical ? ' CRIT!' : ''}`)
      if (aooOutcome.hit) {
        undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
        const base = aooOutcome.critical ? 10 : 5
  const packet: DamagePacket = { amount: base, types: ['slashing'], bypassTags: ['magic'] }
  const applied = applyDamage(defenderFor(turns.active?.id === 'A' ? 'A' : 'B'), packet)
        const taken = applied.taken
        self.hp = Math.max(0, self.hp - taken)
        appendLogLine(`${otherId} deals ${taken} damage${applied.preventedByDR?` (DR -${applied.preventedByDR})`:''}${applied.preventedByER?` (ER)`:''}${applied.vulnerabilityBonus?` (+${applied.vulnerabilityBonus} vuln)`:''}. Target HP ${self.hp}.`)
      }
      (turns as any).aooUsed![otherId] = used + 1
    }
  }
  updateActionHUD(hudText())
})
document.getElementById('delay-btn')?.addEventListener('click', () => {
  const id = turns.active?.id
  if (!id) return
  ;(turns.tracker as any).delay(id)
  appendLogLine(`${id} delays.`)
  undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
  commitEndTurn()
})
document.getElementById('apply-seed')?.addEventListener('click', () => {
  const el = document.getElementById('seed-input') as HTMLInputElement | null
  const v = el?.value?.trim()
  if (!v) return
  const n = Number(v)
  if (!Number.isFinite(n)) return
  currentRNG = seededRNG(n >>> 0)
  currentSeed = n >>> 0
  appendLogLine(`RNG reseeded with ${n >>> 0}`)
})
document.getElementById('reset-btn')?.addEventListener('click', () => {
  undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
  pawnA = { x: 2, y: 2, speed: 30, size: 'medium', hp: 20 }
  pawnB = { x: 12, y: 8, speed: 30, size: 'large', hp: 25 }
  gameOver = null
  ;(turns as any).aooUsed = {}
  appendLogLine('Reset encounter.')
  drawAll()
  updateActionHUD(hudText())
})

// Undo button
document.getElementById('undo-btn')?.addEventListener('click', () => {
  const last = undoStack.pop()
  if (!last) { appendLogLine('Undo: nothing to revert.'); return }
  try {
    const current = captureState()
    const parsed = SaveDataSchema.parse(last)
    restoreFromData(parsed)
    appendLogLine('Undo: state restored.')
    redoStack.push(current)
    if (redoStack.length > UNDO_LIMIT) redoStack.shift()
  } catch {
    appendLogLine('Undo failed.')
  }
})
// Redo button
document.getElementById('redo-btn')?.addEventListener('click', () => {
  const next = redoStack.pop()
  if (!next) { appendLogLine('Redo: nothing to reapply.'); return }
  try {
    undoStack.push(captureState()); if (undoStack.length > UNDO_LIMIT) undoStack.shift()
    const parsed = SaveDataSchema.parse(next)
    restoreFromData(parsed)
    appendLogLine('Redo: state restored.')
  } catch { appendLogLine('Redo failed.') }
})

// Save/Load (terrain + pawns)
document.getElementById('save-btn')?.addEventListener('click', () => {
  const data: SaveData = {
    version: 2,
    grid: G.flags,
    pawnA: { ...pawnA, reach: reachA },
    pawnB: { ...pawnB, reach: reachB },
    round: turns.round,
    initiative: { order: (turns.tracker as any).serialize().order, index: (turns.tracker as any).serialize().index },
    aooUsed: (turns as any).aooUsed || {},
  toggles: { rangedMode, touchMode, flatFootedMode, editTerrain, preciseShot, showLoS, defensiveCast, tumble: tumbleEnabled, reachA, reachB, cornerCover: useCornerCover },
  inputs: { tumbleBonus, concentrationBonus: concBonus, spell: selectedSpell },
    rngSeed: currentSeed ?? null,
  effects: { active: effects.serializeEffects() }
  }
  try {
    const parsed = SaveDataSchema.parse(data)
    localStorage.setItem('srd-grid-save', JSON.stringify(parsed))
    appendLogLine('Saved state to localStorage.')
  } catch { appendLogLine('Save failed.') }
})
document.getElementById('load-btn')?.addEventListener('click', () => {
  try {
    const raw = localStorage.getItem('srd-grid-save')
    if (!raw) return
    const data = SaveDataSchema.parse(JSON.parse(raw))
    // restore grid flags shallowly
    if (Array.isArray(data.grid)) {
      for (let y=0; y<G.h; y++) for (let x=0; x<G.w; x++) {
        if (data.grid[y] && data.grid[y][x]) G.flags[y][x] = { ...data.grid[y][x] }
      }
    }
    // restore active effects if present
    if ((data as any).effects?.active) {
      effects.deserializeEffects((data as any).effects.active)
    }
    if (data.pawnA) {
  const { x,y,speed,hp } = data.pawnA
  pawnA = { ...pawnA, x, y, speed, hp }
  reachA = !!(data.pawnA as any).reach
    }
    if (data.pawnB) {
  const { x,y,speed,hp } = data.pawnB
  pawnB = { ...pawnB, x, y, speed, hp }
  reachB = !!(data.pawnB as any).reach
    }
    if (typeof data.round === 'number') (turns as any).round = data.round
    if (data.initiative) {
      (turns.tracker as any).deserialize(data.initiative)
      ;(turns as any).active = (turns.tracker as any).current()
    }
    if (data.aooUsed) (turns as any).aooUsed = { ...data.aooUsed }
    if (data.toggles) {
      rangedMode = !!data.toggles.rangedMode
      touchMode = !!data.toggles.touchMode
      flatFootedMode = !!data.toggles.flatFootedMode
      editTerrain = !!data.toggles.editTerrain
  preciseShot = !!data.toggles.preciseShot
  showLoS = !!data.toggles.showLoS
  defensiveCast = !!data.toggles.defensiveCast
  tumbleEnabled = !!data.toggles.tumble
  reachA = !!data.toggles.reachA
  reachB = !!data.toggles.reachB
  useCornerCover = !!data.toggles.cornerCover
  const rEl = document.getElementById('ranged-toggle') as HTMLInputElement | null
  if (rEl) rEl.checked = rangedMode
  const tEl = document.getElementById('touch-toggle') as HTMLInputElement | null
  if (tEl) tEl.checked = touchMode
  const fEl = document.getElementById('flat-toggle') as HTMLInputElement | null
  if (fEl) fEl.checked = flatFootedMode
  const eEl = document.getElementById('terrain-toggle') as HTMLInputElement | null
  if (eEl) eEl.checked = editTerrain
  const pEl = document.getElementById('precise-toggle') as HTMLInputElement | null
  if (pEl) pEl.checked = preciseShot
  const sEl = document.getElementById('show-los-toggle') as HTMLInputElement | null
  if (sEl) sEl.checked = showLoS
  const dEl = document.getElementById('defensive-cast-toggle') as HTMLInputElement | null
  if (dEl) dEl.checked = defensiveCast
  const tuEl = document.getElementById('tumble-toggle') as HTMLInputElement | null
  if (tuEl) tuEl.checked = tumbleEnabled
  const ra = document.getElementById('reachA-toggle') as HTMLInputElement | null
  if (ra) ra.checked = reachA
  const rb = document.getElementById('reachB-toggle') as HTMLInputElement | null
  if (rb) rb.checked = reachB
  const cc = document.getElementById('corner-cover-toggle') as HTMLInputElement | null
  if (cc) cc.checked = useCornerCover
    }
    if (data.inputs) {
      tumbleBonus = (data.inputs.tumbleBonus ?? tumbleBonus)|0
      concBonus = (data.inputs.concentrationBonus ?? concBonus)|0
      const tb = document.getElementById('tumble-bonus') as HTMLInputElement | null
      if (tb) tb.value = String(tumbleBonus)
      const cb = document.getElementById('conc-bonus') as HTMLInputElement | null
      if (cb) cb.value = String(concBonus)
      const ss = document.getElementById('spell-select') as HTMLSelectElement | null
      if (ss && data.inputs.spell) { ss.value = data.inputs.spell; selectedSpell = (data.inputs.spell === 'fog-cloud' ? 'fog-cloud' : 'magic-missile') }
    }
  if (data.rngSeed !== null && data.rngSeed !== undefined && Number.isFinite(data.rngSeed)) { currentSeed = (data.rngSeed as number) >>> 0; currentRNG = seededRNG(currentSeed) }
    gameOver = null
    drawAll()
  updateActionHUD(hudText())
    appendLogLine('Loaded state from localStorage.')
  } catch { appendLogLine('Load failed.') }
})

// Expose for quick dev tools inspection
Object.assign(window as any, { app, G })

// Monster selection functions
function initializeMonsterUI() {
  monsterSelectionUI.init('monster-selection-panel')
  monsterSelectionUI.onMonsterSelected((monster) => {
    applyMonsterToPawnB(monster)
    toggleMonsterSelectionUI() // Close UI after selection
  })
}

function toggleMonsterSelectionUI() {
  const panel = document.getElementById('monster-selection-panel')
  let backdrop = document.getElementById('monster-backdrop')
  
  if (panel) {
    const isVisible = panel.style.display !== 'none'
    if (isVisible) {
      // Hide monster selection
      panel.style.display = 'none'
      if (backdrop) {
        backdrop.remove()
      }
      appendLogLine('Monster selection closed.')
    } else {
      // Show monster selection with backdrop
      if (!backdrop) {
        backdrop = document.createElement('div')
        backdrop.id = 'monster-backdrop'
        backdrop.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 1900;
          display: flex;
          align-items: center;
          justify-content: center;
        `
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            toggleMonsterSelectionUI() // Close when clicking backdrop
          }
        })
        document.body.appendChild(backdrop)
      }
      panel.style.display = 'block'
      appendLogLine('Monster selection opened. Press M to close, or select a monster.')
    }
  }
}

function selectRandomMonster() {
  const monster = monsterService.selectRandomMonster()
  applyMonsterToPawnB(monster)
  appendLogLine(`Random monster selected: ${monster.name}`)
}

// Initialize monster UI and AI systems
initializeMonsterUI()

// Initialize monster AI systems
try {
  monsterAI.initialize()
  // Enable the Monster AI by default for demonstration
  monsterAI.enable()
  console.log('✅ Monster AI initialized and enabled successfully')
  console.log('✅ Monster AI Status:', {
    enabled: monsterAI.isEnabled(),
    personality: monsterAI.getCurrentPersonality().name,
    ready: monsterAI.isReady()
  })
} catch (error) {
  console.error('Failed to initialize Monster AI:', error)
}

try {
  monsterDialogueUI.initialize()
  // Connect the dialogue UI to the monster AI
  monsterDialogueUI.setMonsterAI(monsterAI)
  console.log('Monster dialogue initialized successfully')
  
  // Test monster AI functionality
  setTimeout(() => {
    if (monsterAI.isEnabled()) {
      console.log('✅ Monster AI System Status:')
      console.log(`   - Current personality: ${monsterAI.getCurrentPersonality().name}`)
      console.log(`   - AI enabled: ${monsterAI.isEnabled()}`)
      console.log(`   - Available personalities: ${monsterAI.getAvailablePersonalities().length}`)
      
      // Force show the dialogue interface so it's visible immediately
      monsterDialogueUI.show()
      monsterDialogueUI.showMessage('Monster AI system is online and ready! Use console commands or the toggle button to control AI.', monsterAI.getCurrentPersonality());
      
      // Show helpful console message
      console.log('🐲 Monster AI Ready! Try these commands:');
      console.log('   - showMonsterUI() - Show Monster AI interface');
      console.log('   - setMonsterPawn("A") or setMonsterPawn("B") - Designate monster');
      console.log('   - testMonsterAI() - Test AI decision making');
      console.log('   - monsterAIHelp() - Show all commands');
    } else {
      // Even if AI is not enabled, show the interface for testing
      monsterDialogueUI.show()
      const systemPersonality = {
        name: 'System',
        description: 'System notification',
        systemPrompt: '',
        temperature: 0,
        dialogueStyle: 'informative',
        behaviorTraits: {
          aggression: 0,
          intelligence: 1,
          selfPreservation: 1,
          targeting: 'tactical' as const
        }
      };
      monsterDialogueUI.showMessage('Monster AI interface loaded. AI may be disconnected - check console for details.', systemPersonality);
      console.log('⚠️ Monster AI not enabled, but interface is available for testing');
    }
  }, 1000);

  // Add global test functions for easy access
  (window as any).testMonsterAI = async () => {
    console.log('Testing Monster AI connection...');
    try {
      const testGameState = {
        activeMonster: { x: 5, y: 5, hp: 10, maxHp: 10 },
        enemies: [{ x: 3, y: 3, hp: 8 }]
      };
      const decision = await monsterAI.makeDecision(testGameState);
      console.log('✅ Monster AI Decision:', decision);
      monsterDialogueUI.showMessage(decision.action.dialogue || 'Test successful!');
      return decision;
    } catch (error) {
      console.error('❌ Monster AI Test Failed:', error);
      return null;
    }
  };

  (window as any).toggleMonsterAI = () => {
    if (monsterAI.isEnabled()) {
      monsterAI.disable();
      console.log('Monster AI disabled');
      monsterDialogueUI.showMessage('Monster AI disabled. Manual control active.');
    } else {
      monsterAI.enable();
      console.log('Monster AI enabled');
      monsterDialogueUI.showMessage('Monster AI enabled! Ready for combat.', monsterAI.getCurrentPersonality());
    }
  };

  // Add function to manually show the Monster AI interface
  (window as any).showMonsterUI = () => {
    console.log('Showing Monster AI interface...');
    monsterDialogueUI.showMessage('Monster AI interface activated! Click the toggle to control AI.', monsterAI.getCurrentPersonality());
  };

  // Add function to designate a pawn as a monster
  (window as any).setMonsterPawn = (pawnId: 'A' | 'B') => {
    console.log(`Setting pawn ${pawnId} as monster`);
    monsterTurnManager.setMonsterPawn(pawnId, true);
    monsterDialogueUI.showMessage(`Pawn ${pawnId} is now controlled by Monster AI!`, monsterAI.getCurrentPersonality());
  };

  // Add function to manually trigger a monster turn for testing
  (window as any).triggerMonsterTurn = async (pawnId?: 'A' | 'B') => {
    const targetPawn = pawnId || turns.active?.id as 'A' | 'B';
    if (!targetPawn) {
      console.error('No pawn specified and no active pawn found');
      return;
    }
    
    console.log(`Manually triggering Monster AI turn for pawn ${targetPawn}...`);
    await executeMonsterTurn(targetPawn);
  };

  // Add comprehensive help function
  (window as any).monsterAIHelp = () => {
    console.log(`
🐲 Monster AI Commands:
- showMonsterUI() - Show the Monster AI dialogue interface
- testMonsterAI() - Test AI decision making (no actions)
- toggleMonsterAI() - Enable/disable Monster AI
- setMonsterPawn('A') or setMonsterPawn('B') - Designate a pawn as monster
- triggerMonsterTurn('A'/'B') - Manually execute a full Monster AI turn
- monsterAIHelp() - Show this help message

Current Status:
- Monster AI enabled: ${monsterAI.isEnabled()}
- Current personality: ${monsterAI.getCurrentPersonality().name}
- Available personalities: ${monsterAI.getAvailablePersonalities().join(', ')}
- Monster pawns: A=${monsterTurnManager.isMonsterPawn('A')}, B=${monsterTurnManager.isMonsterPawn('B')}
- Active pawn: ${turns.active?.id}
    `);
    monsterDialogueUI.showMessage('Monster AI help displayed in console. Check console for commands.', monsterAI.getCurrentPersonality());
  };

  // Expose game functions and state for Monster AI action execution
  (window as any).pawnA = pawnA;
  (window as any).pawnB = pawnB;
  (window as any).turns = turns;
  (window as any).consume = consume;
  (window as any).planFromActiveTo = planFromActiveTo;
  (window as any).appendLogLine = appendLogLine;
  (window as any).drawAll = drawAll;
  (window as any).commitEndTurn = commitEndTurn;
  (window as any).attackRoll = attackRoll;
  (window as any).currentRNG = currentRNG;
  (window as any).CELL = CELL;
  (window as any).isWithinAttackReach = isWithinAttackReach;
  (window as any).reachA = reachA;
  (window as any).reachB = reachB;
  (window as any).rangedMode = rangedMode;
  
} catch (error) {
  console.error('Failed to initialize Monster dialogue:', error)
}

// Optional: quick object hardness test via keyboard (acid/fire/electricity/cold/sonic) + pawn shortcuts
document.addEventListener('keydown', (e) => {
  // Don't execute any shortcuts if the user is typing in any input field
  if (DMChatPanel.isAnyInputFocused()) {
    return;
  }

  const key = e.key
  
  // Pawn context menu shortcuts
  if (key === 'z' || key === 'Z') {
    // Show context menu for pawn A
    if (pawnA.hp > 0) {
      const rect = app.canvas.getBoundingClientRect()
      const fakeEvent = new MouseEvent('contextmenu', {
        clientX: rect.left + (pawnA.x * CELL) + (CELL / 2),
        clientY: rect.top + (pawnA.y * CELL) + (CELL / 2),
        bubbles: true
      })
      showPawnContextMenu('A', fakeEvent)
    }
    return
  }
  
  if (key === 'x' || key === 'X') {
    // Show context menu for pawn B
    if (pawnB.hp > 0) {
      const rect = app.canvas.getBoundingClientRect()
      const fakeEvent = new MouseEvent('contextmenu', {
        clientX: rect.left + (pawnB.x * CELL) + (CELL / 2),
        clientY: rect.top + (pawnB.y * CELL) + (CELL / 2),
        bubbles: true
      })
      showPawnContextMenu('B', fakeEvent)
    }
    return
  }
  
  // Close any open context menu with Escape
  if (key === 'Escape') {
    hideContextMenu()
    return
  }
  
  // Toggle control panel with '`' (backtick) or 'Tab'
  if (key === '`' || key === 'Tab') {
    e.preventDefault() // Prevent default tab behavior
    toggleControlsPanel()
    return
  }
  
  // Monster selection UI shortcuts
  if (key === 'm' || key === 'M') {
    e.preventDefault()
    toggleMonsterSelectionUI()
    return
  }
  
  // Random monster shortcut
  if (key === 'r' || key === 'R') {
    e.preventDefault()
    selectRandomMonster()
    return
  }
  
  // Damage type tests
  const map: Record<string, { label: string, types: DamagePacket['types'], amount: number }> = {
    '1': { label: 'acid', types: ['acid'], amount: 10 },
    '2': { label: 'fire', types: ['fire'], amount: 10 },
    '3': { label: 'electricity', types: ['electricity'], amount: 10 },
    '4': { label: 'cold', types: ['cold'], amount: 10 },
    '5': { label: 'sonic', types: ['sonic'], amount: 10 },
  }
  const sel = map[key]
  if (!sel) return
  const objectDef: DefenderProfile = { ac: { base: 10, armor: 0, shield: 0, natural: 0, deflection: 0, dodge: 0, misc: 0 }, isObject: true, objectHardness: 5 }
  const packet: DamagePacket = { amount: sel.amount, types: sel.types }
  const applied = applyDamage(objectDef, packet)
  appendLogLine(`Object test (${sel.label} ${sel.amount}) -> after hardness: ${applied.taken} ${applied.hardnessPrevented?`(hardness -${applied.hardnessPrevented})`:''}`)
})
