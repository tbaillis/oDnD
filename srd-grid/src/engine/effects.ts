import type { Grid } from './grid'
import { lineOfSight } from './grid'

export type FogCloudEffect = {
  id: string
  kind: 'fog-cloud'
  x: number
  y: number
  radius: number // in grid squares
  expiresAtRound: number // round number when the effect ends before turns start
}

export type AnyEffect = FogCloudEffect

export class EffectManager {
  private fogMask: number[][]
  private effects: AnyEffect[] = []
  private grid: Grid

  constructor(grid: Grid) {
    this.grid = grid
    this.fogMask = Array.from({ length: grid.h }, () => Array.from({ length: grid.w }, () => 0))
  }

  private forRadius(x0: number, y0: number, r: number, cb: (x: number, y: number) => void) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const x = x0 + dx, y = y0 + dy
          if (x >= 0 && y >= 0 && x < this.grid.w && y < this.grid.h) cb(x, y)
        }
      }
    }
  }

  isFogAt(x: number, y: number) { return this.fogMask[y]?.[x] > 0 }

  addFogCloud(x: number, y: number, radius: number, durationRounds: number, currentRound: number) {
    const id = `fog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const effect: FogCloudEffect = { id, kind: 'fog-cloud', x, y, radius, expiresAtRound: currentRound + durationRounds }
    this.effects.push(effect)
  this.forRadius(x, y, radius, (cx, cy) => { this.fogMask[cy][cx]++ })
  }

  onRoundChanged(round: number) {
    const remaining: AnyEffect[] = []
    for (const e of this.effects) {
      if (round >= e.expiresAtRound) {
        // remove contribution
        if (e.kind === 'fog-cloud') {
          this.forRadius(e.x, e.y, e.radius, (cx, cy) => { this.fogMask[cy][cx] = Math.max(0, this.fogMask[cy][cx] - 1) })
        }
      } else remaining.push(e)
    }
    this.effects = remaining
  }

  serializeEffects() {
    return this.effects.map(e => ({ kind: e.kind, x: e.x, y: e.y, radius: e.radius, expiresAtRound: e.expiresAtRound }))
  }

  deserializeEffects(effects: Array<{ kind: 'fog-cloud'; x: number; y: number; radius: number; expiresAtRound: number }>) {
    // clear current
  this.effects = []
  for (let y = 0; y < this.grid.h; y++) for (let x = 0; x < this.grid.w; x++) this.fogMask[y][x] = 0
    // add saved effects with new ids, respecting remaining duration
    for (const e of effects) {
      const id = `fog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const eff: FogCloudEffect = { id, kind: 'fog-cloud', x: e.x, y: e.y, radius: e.radius, expiresAtRound: e.expiresAtRound }
      this.effects.push(eff)
      this.forRadius(eff.x, eff.y, eff.radius, (cx, cy) => { this.fogMask[cy][cx]++ })
    }
  }

  // Compute concealment due to fog cloud between two squares.
  // Returns 0 | 20 | 50 (percent concealment). Within 5 ft -> 20, beyond 5 ft -> 50, if line passes through fog.
  computeFogConcealment(ax: number, ay: number, tx: number, ty: number): 0 | 20 | 50 {
    const los = lineOfSight(this.grid, ax, ay, tx, ty)
    // Check if any point on the line is in fog
    let inFog = false
    for (const [x,y] of los.pts) { if (this.isFogAt(x,y)) { inFog = true; break } }
    if (!inFog) return 0
    const dx = Math.abs(tx - ax), dy = Math.abs(ty - ay)
    const squares = Math.max(dx, dy)
    return squares <= 1 ? 20 : 50
  }

  // LoS considering fog: base LoS must be clear and fog must not impose total concealment
  losClearConsideringFog(ax: number, ay: number, tx: number, ty: number) {
    const base = lineOfSight(this.grid, ax, ay, tx, ty)
    if (!base.clear) return { clear: false, pts: base.pts }
    const fogCon = this.computeFogConcealment(ax, ay, tx, ty)
    return { clear: fogCon !== 50, pts: base.pts }
  }
}
