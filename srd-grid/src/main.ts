import { Application, Container, Graphics } from 'pixi.js'
import { createWorld, updateTime } from './engine/world'
import { initUIPanels, appendLogLine, updateActionHUD } from './ui/panels'
import { Grid, coverBetweenSquares, concealmentAtTarget, coverBetweenSquaresCorner } from './engine/grid'
import { EffectManager } from './engine/effects'
import { planPath, planPathAvoidingThreat } from './engine/path'
import { threatenedSquares } from './engine/threat'
import { analyzePathMovement } from './engine/movement'
import { trimPathBySpeed } from './engine/moveExecutor'
import { createTurnState, startEncounter, endTurn } from './engine/turns'
import { consume } from './engine/actions'
import { attackRoll, type AttackProfile, type DefenderProfile } from './game/combat'
import { seededRNG, sessionRNG, type RNG } from './engine/rng'
import { SaveDataSchema, type SaveData } from './data/schemas'
import { Provokes, aooPreventedByCoverOrFog } from './engine/provoke'
import { skills } from './game/skills'

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

// Effects manager: track LoS-blocking effects (e.g., fog cloud) layered over base grid
const effects = new EffectManager(G)

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

// Undo stack for recent states
const undoStack: SaveData[] = []
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

function drawAll() {
  tokens.clear()
  overlay.clear()

  // Threat layers from both pawns
  const threatB = threatenedSquares(pawnB.x, pawnB.y, pawnB.size, reachB)
  for (const [x,y] of threatB) drawCell(overlay, x, y, 0xff4444)
  const threatA = threatenedSquares(pawnA.x, pawnA.y, pawnA.size, reachA)
  for (const [x,y] of threatA) drawCell(overlay, x, y, 0x4488ff)

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
  const threatSet = threatSetFrom(other.x, other.y, other.size, other === pawnB ? reachB : reachA)
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
  // measurement label
  // measurement label (placeholder for future use)
  overlay.fill(0xffffff).rect(mx*CELL+4, my*CELL+4, 32, 14)
  overlay.fill(0x111111).rect(mx*CELL+4, my*CELL+4, 32, 14).stroke({ color: 0x333333, width: 1 })
  overlay.fill(0xffffff)
  // LoS overlay if enabled
  if (showLoS) {
    const active = turns.active?.id === 'A' ? pawnA : pawnB
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
  const { path, trimmed, info, threatSet } = planFromActiveTo(mx, my)
  overlay.clear()
  drawAll()
  drawPreview(path, threatSet, trimmed)
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
        const dmg = outcome.critical ? 12 : 6
        const targetPawn = turns.active?.id === 'A' ? pawnB : pawnA
        targetPawn.hp = Math.max(0, targetPawn.hp - dmg)
        appendLogLine(`${turns.active?.id} deals ${dmg} damage (target HP ${targetPawn.hp}).`)
        if (targetPawn.hp <= 0) { gameOver = turns.active?.id === 'A' ? 'A' : 'B'; appendLogLine(`${gameOver} wins!`) }
      }
  drawAll()
  updateActionHUD(hudText())
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
document.getElementById('defensive-cast-toggle')?.addEventListener('change', (e) => {
  defensiveCast = (e.target as HTMLInputElement).checked
  appendLogLine(`Defensive Cast: ${defensiveCast ? 'ON' : 'OFF'}`)
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
        const dmg = aooOutcome.critical ? 10 : 5
        const atkPawn = turns.active?.id === 'A' ? pawnA : pawnB
        atkPawn.hp = Math.max(0, atkPawn.hp - dmg)
        appendLogLine(`${otherId} deals ${dmg} damage (caster HP ${atkPawn.hp}).`)
        // Concentration check to avoid losing the spell: DC 10 + damage dealt + spell level
        const roll2 = Math.floor(currentRNG()*20)+1
        const total2 = roll2 + concBonus
        const dc2 = 10 + dmg + spellLevel
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
      const dmg = (Math.floor(currentRNG()*4)+1) + 1 // 1d4+1
      target.hp = Math.max(0, target.hp - dmg)
      appendLogLine(`Magic Missile hits for ${dmg}. Target HP ${target.hp}.`)
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
        const dmg = aooOutcome.critical ? 10 : 5
        self.hp = Math.max(0, self.hp - dmg)
        appendLogLine(`${otherId} deals ${dmg} damage (target HP ${self.hp}).`)
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
    const parsed = SaveDataSchema.parse(last)
    restoreFromData(parsed)
    appendLogLine('Undo: state restored.')
  } catch {
    appendLogLine('Undo failed.')
  }
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
