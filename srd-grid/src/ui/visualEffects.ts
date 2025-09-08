import type { Graphics, Sprite } from 'pixi.js'

let thinkingEl: HTMLDivElement | null = null

export function showThinking(pawnId?: 'A'|'M1'|'M2'|'M3'|'M4'|'M5'|'M6'|'M7'|'M8'|'M9'|'M10') {
  if (!thinkingEl) {
    thinkingEl = document.createElement('div')
    thinkingEl.id = 'monster-thinking'
    thinkingEl.style.cssText = [
      'position:fixed',
      'top:12px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(17,24,39,0.95)',
      'color:#fbbf24',
      'padding:8px 12px',
      'border-radius:8px',
      'border:1px solid #374151',
      'font-family:system-ui,Segoe UI,Arial,sans-serif',
      'z-index:4000',
      'box-shadow:0 6px 20px rgba(0,0,0,0.6)'
    ].join(';')
    document.body.appendChild(thinkingEl)
  }
  thinkingEl.textContent = pawnId ? `🤖 Pawn ${pawnId} thinking...` : '🤖 Monster thinking...'
  thinkingEl.style.display = 'block'
}

export function hideThinking() {
  if (thinkingEl) thinkingEl.style.display = 'none'
}

export function showAttackSlash(overlay: Graphics | null | undefined, fromX: number, fromY: number, toX: number, toY: number, cellSize: number, duration = 3000) {
  try {
    if (!overlay) return
    // pixel endpoints
    const fromPX = fromX * cellSize + cellSize / 2
    const fromPY = fromY * cellSize + cellSize / 2
    const toPX = toX * cellSize + cellSize / 2
    const toPY = toY * cellSize + cellSize / 2

    // compute direction and ensure minimum visual length (at least 8 squares)
    const dx = toPX - fromPX
    const dy = toPY - fromPY
    const actualLen = Math.hypot(dx, dy)
    const minLen = Math.max(actualLen, 8 * cellSize)
    const angle = Math.atan2(dy, dx)

    const midX = (fromPX + toPX) / 2
    const midY = (fromPY + toPY) / 2
    const halfLen = minLen / 2

    const fullStartX = midX - Math.cos(angle) * halfLen
    const fullStartY = midY - Math.sin(angle) * halfLen
    const fullEndX = midX + Math.cos(angle) * halfLen
    const fullEndY = midY + Math.sin(angle) * halfLen

    // Create a temporary graphics layer for this effect so we don't clear the shared overlay
    const parent = (overlay as any).parent ?? overlay
    const LayerCtor = (overlay as any).constructor || ((window as any).PIXI && (window as any).PIXI.Graphics)
    const g: Graphics = LayerCtor ? new (LayerCtor as any)() : (overlay as any)
    try {
      if (parent && typeof parent.addChild === 'function') parent.addChild(g)
      else if (typeof overlay.addChild === 'function') overlay.addChild(g)
    } catch (e) {
      // fall back to drawing on overlay directly
      // continue
    }

    const lineWidth = Math.max(6, Math.floor(cellSize / 8))
    const accentWidth = Math.max(4, Math.floor(cellSize / 12))

    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()

    const animate = (now: number) => {
      const t = now || ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now())
      const elapsed = Math.max(0, t - startTime)
      const progress = Math.min(1, elapsed / duration)

      const curHalf = halfLen * progress
      const curStartX = midX - Math.cos(angle) * curHalf
      const curStartY = midY - Math.sin(angle) * curHalf
      const curEndX = midX + Math.cos(angle) * curHalf
      const curEndY = midY + Math.sin(angle) * curHalf

      try { g.clear() } catch {}

      try {
        g.lineStyle(lineWidth, 0xff3333)
        g.moveTo(curStartX, curStartY)
        g.lineTo(curEndX, curEndY)
        // Add accent near the real target once progress is significant
        if (progress > 0.35) {
          const nx = Math.sign(dx) || 1
          const ny = Math.sign(dy) || 1
          g.lineStyle(accentWidth, 0xff0000)
          g.moveTo(toPX - nx * (cellSize * 0.12), toPY - ny * (cellSize * 0.12))
          g.lineTo(toPX + ny * (cellSize * 0.12), toPY - nx * (cellSize * 0.12))
        }
      } catch (e) { /* drawing may fail if container destroyed */ }

      if (progress < 1) {
        if (typeof window !== 'undefined' && (window as any).requestAnimationFrame) (window as any).requestAnimationFrame(animate)
        else setTimeout(() => animate((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()), 16)
      } else {
        // Keep final slash visible for a short buffer then remove
        setTimeout(() => {
          try { if (g && g.parent) g.parent.removeChild(g) } catch {}
          try { if ((g as any).destroy) (g as any).destroy({ children: true }) } catch {}
        }, 120)
      }
    }

    // start animation
    try {
      if (typeof window !== 'undefined' && (window as any).requestAnimationFrame) (window as any).requestAnimationFrame(animate)
      else animate((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now())
    } catch (e) {
      // fallback: draw static full-sized slash
      try {
        g.clear()
        g.lineStyle(lineWidth, 0xff3333)
        g.moveTo(fullStartX, fullStartY).lineTo(fullEndX, fullEndY)
      } catch (e) {}
      setTimeout(() => { try { if (g && g.parent) g.parent.removeChild(g) } catch {} }, duration)
    }
  } catch (e) { console.error('showAttackSlash error', e) }
}

export function flashPawnHit(sprite: Sprite | null | undefined, duration = 300) {
  try {
    if (!sprite) return
    const prev = (sprite as any).tint ?? 0xFFFFFF
    // flash red
    sprite.tint = 0xff6666
    setTimeout(() => {
      try { sprite.tint = prev } catch {}
    }, duration)
  } catch (e) { console.error('flashPawnHit error', e) }
}

export function showHitOrMiss(overlay: Graphics | null | undefined, atX: number, atY: number, cellSize: number, hit: boolean, duration = 2000) {
  try {
    if (!overlay) return
    const cx = atX*cellSize + cellSize/2
    const cy = atY*cellSize + cellSize/2
    // draw a filled circle: green for hit, gray for miss
    const color = hit ? 0x33cc33 : 0x999999
    overlay.beginFill(color)
    overlay.drawCircle(cx, cy, Math.max(6, Math.floor(cellSize * 0.2)))
    overlay.endFill()
    // schedule clear of just this effect by clearing overlay after duration (overlay is used as transient layer)
    setTimeout(() => {
      try { overlay.clear(); } catch {}
    }, duration)
  } catch (e) { console.error('showHitOrMiss error', e) }
}
