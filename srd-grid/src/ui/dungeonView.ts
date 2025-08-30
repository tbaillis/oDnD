// Simple 16-bit style pseudo-3D dungeon view (raycast-ish) for Gold Box style display
// - Renders a first-person view from a grid-based map
// Classic blocky pseudo-3D dungeon view inspired by SSI/Gold Box 16-bit style
// - Low-res column renderer (wide columns) to get authentic blocky look
// - Solid gray walls, three-band shading, bold outlines
// - Simple minimap placed into .party-panel if present

export class DungeonView {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private contentRow?: HTMLElement
  private resizeHandler?: () => void
  private map: number[][]
  private mapWidth = 50
  private mapHeight = 50
  private floorPattern?: CanvasPattern
  private ambientLevel = 0.15
  private torchLevel = 1.0

  // Player state
  private px = 25.5
  private py = 25.5
  private pa = 0 // angle in radians

  private fov = Math.PI / 3
  private renderWidth = 840
  private renderHeight = 720

  constructor(parent: HTMLElement = document.body) {
    this.container = document.createElement('div')
    this.container.id = 'dungeon-view'
    const inlineStyle = 'position: relative; width: ' + (this.renderWidth + 4) + 'px; height: ' + (this.renderHeight + 120) + 'px; background: linear-gradient(#0b1020, #071021); border: 1px solid #333; color: #fff; padding: 8px; box-sizing: border-box; font-family: "Courier New", monospace;'
    const fixedStyle = 'position: fixed; right: 220px; top: 80px; width: ' + (this.renderWidth + 4) + 'px; height: ' + (this.renderHeight + 120) + 'px; background: linear-gradient(#0b1020, #071021); border: 2px solid #999; box-shadow: 0 8px 24px rgba(0,0,0,0.6); color: #fff; z-index: 1200; padding: 8px; box-sizing: border-box; font-family: "Courier New", monospace;'
    this.container.style.cssText = parent === document.body ? fixedStyle : inlineStyle

    const title = document.createElement('div')
    title.textContent = 'Dungeon View'
    title.style.cssText = 'color: #ffd86b; font-weight: bold; margin-bottom:6px; text-align:center;'
    this.container.appendChild(title)

    const contentRow = document.createElement('div')
    contentRow.style.cssText = 'display:flex; flex-direction:row; gap:8px; align-items:flex-start;'

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.renderWidth
    this.canvas.height = this.renderHeight
    this.canvas.style.cssText = 'display:block; width:100%; height:auto; background:#000; border:1px solid #222; flex:1 1 auto; image-rendering: pixelated;'
    contentRow.appendChild(this.canvas)

    const smallMap = document.createElement('canvas')
    smallMap.className = 'dungeon-minimap'
    const miniSize = 120
    smallMap.width = miniSize
    smallMap.height = miniSize
    smallMap.style.cssText = 'width:' + miniSize + 'px; height:' + miniSize + 'px; image-rendering: pixelated; border:1px solid #222; background: rgba(0,0,0,0.6); display:block;'

    const party = document.querySelector('.party-panel') as HTMLElement | null
    if (party) {
      try {
        const comp = window.getComputedStyle(party)
        if (comp.position === 'static') party.style.position = 'relative'
      } catch (e) {}
      smallMap.style.position = 'absolute'
      smallMap.style.left = '8px'
      smallMap.style.bottom = '8px'
      smallMap.style.zIndex = '1201'
      party.appendChild(smallMap)
    } else {
      contentRow.appendChild(smallMap)
    }

    parent.appendChild(this.container)
    this.container.appendChild(contentRow)
    this.contentRow = contentRow

    const info = document.createElement('div')
    info.style.cssText = 'margin-top:8px; font-size:12px; color:#cbd5e1; text-align:center;'
    info.innerHTML = 'Use Arrow keys / Numpad (8/2/4/6) to move. WASD supported.'
    this.container.appendChild(info)

    // lighting controls (ambient and torch)
    try {
      const controls = document.createElement('div')
      controls.style.cssText = 'display:flex; gap:12px; justify-content:center; align-items:center; margin-top:8px;'

      const makeSlider = (labelText: string, initial: number) => {
        const wrap = document.createElement('div')
        wrap.style.cssText = 'display:flex; flex-direction:column; align-items:center; font-size:12px; color:#cbd5e1;'
        const label = document.createElement('div')
        label.textContent = labelText
        label.style.marginBottom = '4px'
        const input = document.createElement('input')
        input.type = 'range'
        input.min = '0'
        input.max = '100'
        input.step = '1'
        input.value = String(Math.round(initial * 100))
        input.style.width = '160px'
        const val = document.createElement('div')
        val.textContent = String(Math.round(initial * 100)) + '%'
        val.style.marginTop = '4px'
        wrap.appendChild(label)
        wrap.appendChild(input)
        wrap.appendChild(val)
        return { wrap, input, val }
      }

      const ambient = makeSlider('Ambient', this.ambientLevel)
      const torch = makeSlider('Torch (player)', this.torchLevel)

      ambient.input.oninput = (e) => {
        const v = Number((e.target as HTMLInputElement).value)
        this.ambientLevel = v / 100
        ambient.val.textContent = v + '%'
      }
      torch.input.oninput = (e) => {
        const v = Number((e.target as HTMLInputElement).value)
        this.torchLevel = v / 100
        torch.val.textContent = v + '%'
      }

      controls.appendChild(ambient.wrap)
      controls.appendChild(torch.wrap)
      this.container.appendChild(controls)
    } catch (e) {}

    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')
    this.ctx = ctx

    this.createPatterns()
    this.map = this.generateMap(this.mapWidth, this.mapHeight)

    this.px = Math.floor(this.mapWidth / 2) + 0.5
    this.py = Math.floor(this.mapHeight / 2) + 0.5
    this.pa = 0

    window.addEventListener('keydown', this.onKeyDown)
    this.resizeHandler = () => this.adjustCanvasSize()
    window.addEventListener('resize', this.resizeHandler)

    if (parent === document.body) setTimeout(() => this.positionNextToPartyPanel(), 500)

    this.adjustCanvasSize()
    requestAnimationFrame(() => this.frame())
  }

  private adjustCanvasSize() {
    try {
      const dpr = window.devicePixelRatio || 1
      const container = this.contentRow || this.container
      const style = window.getComputedStyle(this.container)
      const paddingLeft = parseFloat(style.paddingLeft || '8') || 8
      const paddingRight = parseFloat(style.paddingRight || '8') || 8
      const availableWidth = Math.max(64, container.clientWidth - paddingLeft - paddingRight)
      const displayWidth = Math.floor(availableWidth)
      const displayHeight = Math.floor(this.renderHeight * (displayWidth / this.renderWidth))

      this.canvas.style.width = displayWidth + 'px'
      this.canvas.style.height = displayHeight + 'px'

      this.canvas.width = Math.max(1, Math.floor(displayWidth * dpr))
      this.canvas.height = Math.max(1, Math.floor(displayHeight * dpr))
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    } catch (e) {}
  }

  private createPatterns() {
    try {
      const fp = document.createElement('canvas')
      fp.width = 16
      fp.height = 16
      const fctx = fp.getContext('2d')!
      fctx.fillStyle = '#2e2b21'
      fctx.fillRect(0, 0, fp.width, fp.height)
      fctx.fillStyle = '#3b352a'
      fctx.fillRect(0, 0, fp.width / 2, fp.height / 2)
      fctx.fillRect(fp.width / 2, fp.height / 2, fp.width / 2, fp.height / 2)
      fctx.fillStyle = 'rgba(0,0,0,0.12)'
      fctx.fillRect(0, 0, fp.width, 1)
      fctx.fillRect(0, 0, 1, fp.height)
      this.floorPattern = this.ctx.createPattern(fp, 'repeat') || undefined
    } catch (e) {}
  }

  private generateMap(w: number, h: number): number[][] {
    const map: number[][] = Array.from({ length: h }, () => Array(w).fill(1))
    const rooms: Array<{ x: number; y: number; w: number; h: number }> = []
    const targetRooms = 6
    let attempts = 0
    while (rooms.length < targetRooms && attempts < 200) {
      attempts++
      const rw = 4 + Math.floor(Math.random() * Math.min(12, Math.max(4, Math.floor(w / 3))))
      const rh = 4 + Math.floor(Math.random() * Math.min(12, Math.max(4, Math.floor(h / 3))))
      const rx = 1 + Math.floor(Math.random() * Math.max(1, w - rw - 2))
      const ry = 1 + Math.floor(Math.random() * Math.max(1, h - rh - 2))
      const room = { x: rx, y: ry, w: rw, h: rh }
      let ok = true
      for (const r of rooms) {
        if (rx < r.x + r.w + 1 && rx + rw + 1 > r.x && ry < r.y + r.h + 1 && ry + rh + 1 > r.y) { ok = false; break }
      }
      if (ok) rooms.push(room)
    }

    for (const r of rooms) {
      for (let y = r.y; y < r.y + r.h && y < h - 1; y++) {
        for (let x = r.x; x < r.x + r.w && x < w - 1; x++) {
          map[y][x] = 0
        }
      }
    }

    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1]
      const b = rooms[i]
      const ax = Math.floor(a.x + a.w / 2)
      const ay = Math.floor(a.y + a.h / 2)
      const bx = Math.floor(b.x + b.w / 2)
      const by = Math.floor(b.y + b.h / 2)
      let x = ax, y = ay
      while (x !== bx) {
        map[y][x] = 0
        x += bx > x ? 1 : -1
      }
      while (y !== by) {
        map[y][x] = 0
        y += by > y ? 1 : -1
      }
    }

    for (let i = 0; i < 150; i++) {
      let x = 1 + Math.floor(Math.random() * (w - 2))
      let y = 1 + Math.floor(Math.random() * (h - 2))
      const len = 3 + Math.floor(Math.random() * 18)
      const horiz = Math.random() < 0.5
      for (let j = 0; j < len; j++) {
        if (x > 0 && x < w - 1 && y > 0 && y < h - 1) map[y][x] = 0
        if (horiz) x += Math.random() < 0.5 ? -1 : 1
        else y += Math.random() < 0.5 ? -1 : 1
      }
    }

    for (let x = 0; x < w; x++) { map[0][x] = 1; map[h - 1][x] = 1 }
    for (let y = 0; y < h; y++) { map[y][0] = 1; map[y][w - 1] = 1 }

    return map
  }

  private positionNextToPartyPanel() {
    const party = document.querySelector('.party-panel') as HTMLElement | null
    if (party && party.getBoundingClientRect) {
      const r = party.getBoundingClientRect()
      this.container.style.right = (window.innerWidth - r.left + 8) + 'px'
      this.container.style.top = r.top + 'px'
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const active = document.activeElement
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return

    const key = e.key.toLowerCase()
    switch (key) {
      case 'arrowup':
      case '8':
      case 'w':
        this.moveForward(1)
        break
      case 'arrowdown':
      case '2':
      case 's':
        this.moveForward(-1)
        break
      case 'arrowleft':
      case '4':
      case 'a':
        this.rotate(-Math.PI / 8)
        break
      case 'arrowright':
      case '6':
      case 'd':
        this.rotate(Math.PI / 8)
        break
      case 'q':
        this.rotate(-Math.PI / 2)
        break
      case 'e':
        this.rotate(Math.PI / 2)
        break
    }
    this.frame()
  }

  private moveForward(dir: number) {
    const speed = 1.0
    const nx = this.px + Math.cos(this.pa) * speed * dir
    const ny = this.py + Math.sin(this.pa) * speed * dir
    if (!this.isWall(nx, ny)) {
      this.px = nx
      this.py = ny
    }
  }

  private rotate(a: number) { this.pa = (this.pa + a) % (Math.PI * 2) }

  private isWall(x: number, y: number): boolean {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (ix < 0 || iy < 0 || ix >= this.mapWidth || iy >= this.mapHeight) return true
    return this.map[iy][ix] === 1
  }

  private frame() {
    this.render()
    requestAnimationFrame(() => this.frame())
  }

  public destroy() {
    try { window.removeEventListener('keydown', this.onKeyDown) } catch (e) {}
    if (this.resizeHandler) { try { window.removeEventListener('resize', this.resizeHandler) } catch (e) {} }
    if (this.container && this.container.parentElement) this.container.parentElement.removeChild(this.container)
  }

  private render() {
    const ctx = this.ctx
    const w = this.canvas.width
    const h = this.canvas.height

    // clear
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)

  // sky and uniform floor band
  ctx.fillStyle = '#2b3a67'
  ctx.fillRect(0, 0, w, Math.floor(h / 2))
  const floorGray = 120
  ctx.fillStyle = 'rgb(' + floorGray + ',' + floorGray + ',' + floorGray + ')'
  ctx.fillRect(0, Math.floor(h / 2), w, Math.ceil(h / 2))

    // low-resolution column renderer for classic 16-bit look
    const dpr = window.devicePixelRatio || 1
    const columnWidth = Math.max(2, Math.floor(dpr * 4))
    const numRays = Math.ceil(w / columnWidth)
    for (let r = 0; r < numRays; r++) {
      const col = r * columnWidth
      const cameraX = 2 * r / numRays - 1
      const rayDir = this.pa + this.fov * cameraX / 2

      let distance = 0.0
      let hit = false
      while (!hit && distance < 30) {
        distance += 0.08
        const rx = this.px + Math.cos(rayDir) * distance
        const ry = this.py + Math.sin(rayDir) * distance
        const ix = Math.floor(rx)
        const iy = Math.floor(ry)
        if (ix < 0 || iy < 0 || ix >= this.mapWidth || iy >= this.mapHeight) { hit = true; break }
        if (this.map[iy][ix] === 1) { hit = true; break }
      }

      const correctedDist = Math.max(0.0001, distance * Math.cos(rayDir - this.pa))
      const rawHeight = Math.floor(h / correctedDist * 0.6)
      const lineHeight = Math.min(h, rawHeight)
      const drawStart = Math.floor((h - lineHeight) / 2)
      const drawEnd = Math.min(h - 1, drawStart + lineHeight)

  // base shading by distance (darker overall)
  const shade = Math.max(0, 1 - correctedDist / 18)
  const sideFactor = 1 - Math.min(1, Math.abs(cameraX) * 0.95)

  // lighting: combine ambient (global) and torch (player) sliders
  const ambient = Math.max(0, Math.min(1, this.ambientLevel))
  const torch = Math.max(0, Math.min(3, this.torchLevel * 3)) // allow torch to amplify up to 3x

  // light originates from the player: closer surfaces receive much stronger light
  const lightFromPlayer = Math.max(0, 1 - correctedDist / 5) * torch + ambient
  // bias per vertical band so lower bands (near player) receive considerably more light
  const topBias = 0.5 + 0.35 * (1 - lightFromPlayer)
  const midBias = 0.7 + 0.9 * lightFromPlayer
  const botBias = 0.85 + 1.1 * lightFromPlayer

  const bandTop = Math.floor(160 * (0.45 + 0.55 * shade) * (0.55 + 0.45 * sideFactor) * topBias * (0.4 + 0.6 * (ambient + lightFromPlayer)))
  const bandMid = Math.floor(140 * (0.45 + 0.55 * shade) * (0.55 + 0.45 * sideFactor) * midBias * (0.4 + 0.6 * (ambient + lightFromPlayer)))
  const bandBot = Math.floor(90 * (0.35 + 0.65 * shade) * (0.45 + 0.55 * sideFactor) * botBias * (0.4 + 0.6 * (ambient + lightFromPlayer)))

      const bandHeight = Math.max(1, Math.floor(lineHeight * 0.22))
      ctx.fillStyle = 'rgb(' + bandTop + ',' + bandTop + ',' + bandTop + ')'
      ctx.fillRect(col, drawStart, columnWidth, bandHeight)

      const midStart = drawStart + bandHeight
      const midHeight = Math.max(1, Math.floor(lineHeight * 0.56))
      ctx.fillStyle = 'rgb(' + bandMid + ',' + bandMid + ',' + bandMid + ')'
      ctx.fillRect(col, midStart, columnWidth, midHeight)

      const botStart = midStart + midHeight
      const botHeight = Math.max(1, drawEnd - botStart)
      ctx.fillStyle = 'rgb(' + bandBot + ',' + bandBot + ',' + bandBot + ')'
      ctx.fillRect(col, botStart, columnWidth, botHeight)

  // darker rim overlay for stronger contrast
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
      ctx.fillRect(col, drawStart, Math.max(1, Math.floor(columnWidth * 0.18)), lineHeight)

      if (shade > 0.6) {
        ctx.fillStyle = 'rgba(255,255,255,' + ((shade - 0.6) * 0.12).toFixed(3) + ')'
        ctx.fillRect(col, drawStart, columnWidth, 1)
      }

  // no per-column floor fills — floor is a single uniform band
    }

    // crosshair/HUD
    ctx.strokeStyle = '#ffd86b'
    ctx.beginPath()
    ctx.moveTo(w / 2 - 8, h / 2)
    ctx.lineTo(w / 2 + 8, h / 2)
    ctx.moveTo(w / 2, h / 2 - 8)
    ctx.lineTo(w / 2, h / 2 + 8)
    ctx.stroke()

    this.drawMiniMap()
  }

  private drawMiniMap() {
    const mini = document.querySelector('.dungeon-minimap') as HTMLCanvasElement | null || this.container.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement | null
    if (!mini) return
    const mctx = mini.getContext('2d')!
    const mw = mini.width
    const mh = mini.height
    mctx.fillStyle = '#000'
    mctx.fillRect(0, 0, mw, mh)

    const scaleX = mw / this.mapWidth
    const scaleY = mh / this.mapHeight
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        mctx.fillStyle = this.map[y][x] === 1 ? '#444' : '#083a2a'
        mctx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.max(1, Math.ceil(scaleX)), Math.max(1, Math.ceil(scaleY)))
      }
    }

    const px = Math.floor(this.px * scaleX)
    const py = Math.floor(this.py * scaleY)
    mctx.fillStyle = '#ffd86b'
    mctx.beginPath()
    mctx.arc(px, py, 3, 0, Math.PI * 2)
    mctx.fill()

    const tipX = px + Math.round(Math.cos(this.pa) * 8)
    const tipY = py + Math.round(Math.sin(this.pa) * 8)
    const leftX = px + Math.round(Math.cos(this.pa + Math.PI * 0.75) * 5)
    const leftY = py + Math.round(Math.sin(this.pa + Math.PI * 0.75) * 5)
    const rightX = px + Math.round(Math.cos(this.pa - Math.PI * 0.75) * 5)
    const rightY = py + Math.round(Math.sin(this.pa - Math.PI * 0.75) * 5)
    mctx.fillStyle = '#ffd86b'
    mctx.beginPath()
    mctx.moveTo(tipX, tipY)
    mctx.lineTo(leftX, leftY)
    mctx.lineTo(rightX, rightY)
    mctx.closePath()
    mctx.fill()
  }
}

