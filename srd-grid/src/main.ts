import { Application, Container, Graphics } from 'pixi.js'
import { createWorld, updateTime } from './engine/world'
import { initUIPanels, appendLogLine } from './ui/panels'
import { Grid, coverBetweenSquares, concealmentAtTarget } from './engine/grid'
import { planPath, planPathAvoidingThreat } from './engine/path'
import { threatenedSquares } from './engine/threat'
import { analyzePathMovement } from './engine/movement'
import { trimPathBySpeed } from './engine/moveExecutor'
import { createTurnState, startEncounter, endTurn } from './engine/turns'
import { consume } from './engine/actions'
import { attackRoll, type AttackProfile, type DefenderProfile } from './game/combat'
import { seededRNG, sessionRNG, type RNG } from './engine/rng'

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
initUIPanels(document.body)

// Draw a simple checkerboard grid to validate rendering & scaling
const grid = new Graphics()
grid.alpha = 0.7
for (let y = 0; y < HEIGHT; y += CELL) {
  for (let x = 0; x < WIDTH; x += CELL) {
    const dark = ((x / CELL + y / CELL) % 2) === 0
    grid.rect(x, y, CELL, CELL).fill({ color: dark ? 0x2b2f36 : 0x23272e })
  }
}
// grid lines
const lines = new Graphics()
lines.stroke({ color: 0x3a3f47, width: 1 })
for (let x = 0; x <= WIDTH; x += CELL) lines.moveTo(x, 0).lineTo(x, HEIGHT)
for (let y = 0; y <= HEIGHT; y += CELL) lines.moveTo(0, y).lineTo(WIDTH, y)

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

const overlay = new Graphics()
overlay.alpha = 0.9
world.addChild(overlay)

function drawCell(g: Graphics, x: number, y: number, color: number) {
  g.rect(x*CELL, y*CELL, CELL, CELL).fill({ color, alpha: 0.35 })
}

// Token state (two pawns)
let pawnA = { x: 2, y: 2, speed: 30, size: 'medium' as const, hp: 20 }
let pawnB = { x: 12, y: 8, speed: 30, size: 'large' as const, hp: 25 }

// Turn/initiative setup
const turns = createTurnState()
startEncounter(turns, [
  { id: 'A', dexMod: 2, initiative: 15 },
  { id: 'B', dexMod: 0, initiative: 12 },
])
appendLogLine(`Encounter start: Round ${turns.round}, Active=${turns.active?.id}`)

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

function threatSetFrom(x: number, y: number, size: 'medium'|'large') {
  return new Set(threatenedSquares(x, y, size, true).map(([sx,sy]) => `${sx},${sy}`))
}

function drawAll() {
  tokens.clear()
  overlay.clear()

  // Threat layer from B
  const threat = threatenedSquares(pawnB.x, pawnB.y, pawnB.size, true)
  for (const [x,y] of threat) drawCell(overlay, x, y, 0xff4444)

  // Tokens
  tokens.circle(pawnA.x*CELL + CELL/2, pawnA.y*CELL + CELL/2, CELL*0.35).fill(0x5aa9e6)
  tokens.circle(pawnB.x*CELL + CELL/2, pawnB.y*CELL + CELL/2, CELL*0.4).fill(0xe65a5a)
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
  if (gameOver) {
    // simple banner rectangle
    tokens.rect(WIDTH/2-160, HEIGHT/2-30, 320, 60).fill(0x111111).stroke({ color: 0xffffff, width: 2 })
  }
}

drawAll()

function planFromActiveTo(mx: number, my: number) {
  const active = turns.active?.id === 'A' ? pawnA : pawnB
  const other = turns.active?.id === 'A' ? pawnB : pawnA
  const allowDiagonal = true
  const dontCrossCorners = true
  const threatSet = threatSetFrom(other.x, other.y, other.size)
  const avoid = (document.getElementById('avoid-toggle') as HTMLInputElement | null)?.checked ?? true
  const path = avoid
    ? planPathAvoidingThreat(G, active.x, active.y, mx, my, { allowDiagonal, dontCrossCorners, avoidThreat: true, threatSet })
    : planPath(G, active.x, active.y, mx, my, { allowDiagonal, dontCrossCorners })
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

// Hover preview
app.canvas.addEventListener('mousemove', (ev) => {
  const rect = app.canvas.getBoundingClientRect()
  const mx = Math.floor((ev.clientX - rect.left) / CELL)
  const my = Math.floor((ev.clientY - rect.top) / CELL)
  if (editTerrain) return
  const { path, trimmed, threatSet } = planFromActiveTo(mx, my)
  overlay.clear()
  drawAll()
  drawPreview(path, threatSet, trimmed)
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
  const { path, trimmed, info, threatSet } = planFromActiveTo(mx, my)
  overlay.clear()
  drawAll()
  drawPreview(path, threatSet, trimmed)
  if (!attackMode) {
  if (gameOver) return
    const active = turns.active?.id === 'A' ? pawnA : pawnB
    if (active.hp <= 0) { appendLogLine(`${turns.active?.id} is down.`); commitEndTurn(); return }
    const last = trimmed[trimmed.length - 1]
    if (last) { active.x = last[0]; active.y = last[1] }
    // Enforce simple action economy
  // Five-foot step allowed if exactly 5 ft and not into difficult terrain
  if (info.feet === 5 && info.difficultSquares === 0) {
      if (!consume(turns.budget!, 'five-foot-step')) { appendLogLine('No five-foot step available.'); return }
    } else {
      if (!consume(turns.budget!, 'move')) { appendLogLine('Move action already used.'); return }
    }
    appendLogLine(`${turns.active?.id} moves ${info.feet} ft${info.provokes ? ' (provokes)' : ''}.`)
    // AoO from the other pawn if path provokes and they have AoO available
    if (info.provokes) {
      const otherId = turns.active?.id === 'A' ? 'B' : 'A'
      // Flat-footed creatures can't make AoOs (simplified demo toggle)
      if (flatFootedMode) {
        appendLogLine(`${otherId} is flat-footed and cannot make AoOs.`)
      } else {
      const used = (turns as any).aooUsed?.[otherId] ?? 0
      if (used < 1) {
        const atk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
        const def: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
        const outcome = attackRoll(atk, def, currentRNG)
        appendLogLine(`${otherId} makes AoO: roll=${outcome.attackRoll} total=${outcome.totalToHit} hit=${outcome.hit}${outcome.critical ? ' CRIT!' : ''}`)
        if (outcome.hit) {
          const dmg = outcome.critical ? 10 : 5
          const tgt = turns.active?.id === 'A' ? pawnA : pawnB
          tgt.hp = Math.max(0, tgt.hp - dmg)
          appendLogLine(`${otherId} deals ${dmg} damage (target HP ${tgt.hp}).`)
          if (tgt.hp <= 0) { gameOver = otherId; appendLogLine(`${otherId} wins!`); }
        }
        (turns as any).aooUsed![otherId] = used + 1
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
  const atk: AttackProfile = rangedMode ? { bab: 2, abilityMod: 3, sizeMod: 0 } : { bab: 2, abilityMod: 3, sizeMod: 0 }
  const def: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
  const attacker = turns.active?.id === 'A' ? pawnA : pawnB
  // If making a ranged attack while threatened, target gets an AoO first
  if (rangedMode) {
    const threat = threatSetFrom(target.x, target.y, target.size)
    const attackerKey = turns.active?.id
    const defenderKey = attackerKey === 'A' ? 'B' : 'A'
    if (threat.has(`${attacker!.x},${attacker!.y}`)) {
      if (flatFootedMode) {
        appendLogLine(`${defenderKey} is flat-footed and cannot make AoOs.`)
      } else {
        const used = (turns as any).aooUsed?.[defenderKey] ?? 0
        if (used < 1) {
          const aooAtk: AttackProfile = { bab: 2, abilityMod: 3, sizeMod: 0 }
          const aooDef: DefenderProfile = { ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, touchAttack: touchMode, flatFooted: flatFootedMode }
          const aooOutcome = attackRoll(aooAtk, aooDef, currentRNG)
          appendLogLine(`${defenderKey} AoO (ranged in melee): roll=${aooOutcome.attackRoll} total=${aooOutcome.totalToHit} hit=${aooOutcome.hit}${aooOutcome.critical ? ' CRIT!' : ''}`)
          if (aooOutcome.hit) {
            const dmg = aooOutcome.critical ? 10 : 5
            const atkPawn = attackerKey === 'A' ? pawnA : pawnB
            atkPawn.hp = Math.max(0, atkPawn.hp - dmg)
            appendLogLine(`${defenderKey} deals ${dmg} damage (attacker HP ${atkPawn.hp}).`)
            if (atkPawn.hp <= 0) { gameOver = defenderKey as 'A'|'B'; appendLogLine(`${defenderKey} wins!`); drawAll(); commitEndTurn(); return }
          }
          (turns as any).aooUsed![defenderKey] = used + 1
        }
      }
    }
  }
  const cover = coverBetweenSquares(G, attacker!.x, attacker!.y, target.x, target.y)
  const conceal = concealmentAtTarget(G, target.x, target.y)
  const outcome = attackRoll(atk, def, currentRNG, { coverBonus: cover, concealment: conceal })
  appendLogLine(`${turns.active?.id} attacks: roll=${outcome.attackRoll} total=${outcome.totalToHit} vs AC${cover?`+${cover}`:''} hit=${outcome.hit}${outcome.critical ? ' CRIT!' : ''}${outcome.concealmentMiss?' (concealment)':''}`)
      if (outcome.hit) {
        const dmg = outcome.critical ? 12 : 6
        const targetPawn = turns.active?.id === 'A' ? pawnB : pawnA
        targetPawn.hp = Math.max(0, targetPawn.hp - dmg)
        appendLogLine(`${turns.active?.id} deals ${dmg} damage (target HP ${targetPawn.hp}).`)
        if (targetPawn.hp <= 0) { gameOver = turns.active?.id === 'A' ? 'A' : 'B'; appendLogLine(`${gameOver} wins!`) }
      }
  drawAll()
  // Remain on the same turn; use End Turn button to proceed.
    }
  }
})

// Controls wiring
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
  pawnA = { x: 2, y: 2, speed: 30, size: 'medium', hp: 20 }
  pawnB = { x: 12, y: 8, speed: 30, size: 'large', hp: 25 }
  gameOver = null
  ;(turns as any).aooUsed = {}
  appendLogLine('Reset encounter.')
  drawAll()
})

// Save/Load (terrain + pawns)
document.getElementById('save-btn')?.addEventListener('click', () => {
  const data = {
    grid: G.flags,
    pawnA, pawnB,
    round: turns.round,
    active: turns.active?.id || null,
    aooUsed: (turns as any).aooUsed || {},
    toggles: { rangedMode, touchMode, flatFootedMode, editTerrain },
    rngSeed: currentSeed,
  }
  try {
    localStorage.setItem('srd-grid-save', JSON.stringify(data))
    appendLogLine('Saved state to localStorage.')
  } catch { appendLogLine('Save failed.') }
})
document.getElementById('load-btn')?.addEventListener('click', () => {
  try {
    const raw = localStorage.getItem('srd-grid-save')
    if (!raw) return
    const data = JSON.parse(raw)
    // restore grid flags shallowly
    if (Array.isArray(data.grid)) {
      for (let y=0; y<G.h; y++) for (let x=0; x<G.w; x++) {
        if (data.grid[y] && data.grid[y][x]) G.flags[y][x] = { ...data.grid[y][x] }
      }
    }
    if (data.pawnA) pawnA = { ...pawnA, ...data.pawnA }
    if (data.pawnB) pawnB = { ...pawnB, ...data.pawnB }
    if (typeof data.round === 'number') (turns as any).round = data.round
    if (data.active === 'A' || data.active === 'B') (turns as any).active = { id: data.active }
    if (data.aooUsed) (turns as any).aooUsed = { ...data.aooUsed }
    if (data.toggles) {
      rangedMode = !!data.toggles.rangedMode
      touchMode = !!data.toggles.touchMode
      flatFootedMode = !!data.toggles.flatFootedMode
      editTerrain = !!data.toggles.editTerrain
  const rEl = document.getElementById('ranged-toggle') as HTMLInputElement | null
  if (rEl) rEl.checked = rangedMode
  const tEl = document.getElementById('touch-toggle') as HTMLInputElement | null
  if (tEl) tEl.checked = touchMode
  const fEl = document.getElementById('flat-toggle') as HTMLInputElement | null
  if (fEl) fEl.checked = flatFootedMode
  const eEl = document.getElementById('terrain-toggle') as HTMLInputElement | null
  if (eEl) eEl.checked = editTerrain
    }
    if (Number.isFinite(data.rngSeed)) { currentSeed = data.rngSeed >>> 0; currentRNG = seededRNG(currentSeed) }
    gameOver = null
    drawAll()
    appendLogLine('Loaded state from localStorage.')
  } catch { appendLogLine('Load failed.') }
})

// Expose for quick dev tools inspection
Object.assign(window as any, { app, G })
