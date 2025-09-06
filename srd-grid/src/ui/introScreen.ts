export type IntroScene = {
  title?: string
  text: string
  imageSrc?: string
}

export class IntroScreen {
  private scenes: IntroScene[] = []
  private index = 0
  private container: HTMLDivElement
  private onFinish: () => void

  constructor(onFinish: () => void) {
    this.onFinish = onFinish
    this.container = document.createElement('div')
    this.container.id = 'intro-screen'
    this.container.style.cssText = [
      'position:fixed',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85))',
      'z-index:13000',
      'color:#ffd966',
      'font-family: "Times New Roman", serif'
    ].join(';')

    // Load StoryPanels images (Vite import.meta.glob). If none, fall back to Backgrounds/Dungeon.png
    const panelEntries = Object.entries(import.meta.glob('../assets/StoryPanels/*', { query: '?url', import: 'default', eager: true })) as [string, string][]
    const panels = panelEntries
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(e => e[1])

    const fallback = panels[0] ?? new URL('../assets/Backgrounds/Dungeon.png', import.meta.url).href

    const baseScenes: IntroScene[] = [
      { title: 'A Distant Journey', text: `The wizard Elowen left her lighthouse tower beneath a harvest moon. Strange tremors and whispers of lights under the city of Lyr had reached her — merchants vanished at night and a pall of fear lay over the avenue of brass. She sealed her grimoire, mounted her mare, and rode toward the distant city to learn what lay beneath.` },
      { title: 'Warnings and Portents', text: `In taverns and temples the same story appeared like a worn coin: caravans never reached Lyr's gates, and sentries muttered of a deep breath beneath the ground. Elowen found rune marks older than the city's founders and a legend of a sleeping wyrm whose dreams pulled at the bones of the earth.` },
      { title: 'A Dragon Stirs', text: `Far below the cobbled streets, an ancient dragon turned in its hoard. It tasted the passage of time like old iron. In its dreams wealth and memory braided into a hunger; when those dreams shifted, the surface shook. The wizard's spells could read the echoes, but she would not face the deep alone.` },
      { title: 'A Call for Heroes', text: `Elowen sent word and the world answered: a cleric carrying light against shadows, a fighter with a broad blade, a keen-eyed ranger, a quick-fingered rogue, and a young mage eager for trials. They met beneath Lyr's western gate and swore a silent oath to see the light again.` },
      { title: 'Down the Iron Stair', text: `Torches guttered as the party descended into vaults where the air smelled of old coin and older sorrow. Stone doors groaned and traps lay waiting for careless feet; somewhere beyond a deep, resonant breathing answered them. Their torches threw long shadows, and the gold that glinted in dark corners told both of wealth and warning.` },
      { title: 'Begin', text: `Your party stands before a vaulted chamber, torchlight flickering across a ring of ancient runes. The dragon sleeps — for now. The choices you make will wake legend or leave it sleeping. Click the image or story text to continue the tale.` }
    ]

    this.scenes = baseScenes.map((s, i) => ({ ...s, imageSrc: panels[i] ?? fallback }))

    const card = document.createElement('div')
    card.style.cssText = [
      'width:820px',
      'max-width:calc(100% - 40px)',
      'height:75vh',
      'min-height:520px',
      'background:#1b1b1b',
      'border:6px solid #c59b45',
      'padding:18px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.8)',
      'display:flex',
      'flex-direction:column',
      'gap:12px',
      'align-items:stretch'
    ].join(';')

    const header = document.createElement('div')
    header.style.cssText = 'text-align:center;padding:6px 0;color:#ffd966;font-family: "Times New Roman", serif'
    const headerTitle = document.createElement('div')
    headerTitle.textContent = 'Dungeon'
    headerTitle.style.cssText = 'font-size:28px;font-weight:800;letter-spacing:2px;'
    const headerSub = document.createElement('div')
    headerSub.textContent = 'A Tale of Gold and Shadow'
    headerSub.style.cssText = 'font-size:12px;color:#cfc09a;margin-top:4px'
    header.appendChild(headerTitle)
    header.appendChild(headerSub)

    const contentRow = document.createElement('div')
    contentRow.style.cssText = 'display:flex;gap:16px;align-items:flex-start;flex:1;min-height:0'

    const imgCol = document.createElement('div')
    imgCol.style.cssText = 'flex:0 0 40%;display:flex;align-items:center;justify-content:center;height:100%;padding:8px;box-sizing:border-box'
    const img = document.createElement('img')
    img.id = 'intro-image'
    img.style.cssText = 'max-height:100%;max-width:100%;height:auto;width:auto;object-fit:contain;border:4px solid #3b3b3b;display:block'
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => this.next())
    img.alt = 'intro'
    imgCol.appendChild(img)

    const textCol = document.createElement('div')
    textCol.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:12px;'

    const titleEl = document.createElement('h2')
    titleEl.id = 'intro-title'
    titleEl.style.cssText = 'margin:0;color:#ffd966;font-size:20px'

    const bodyEl = document.createElement('div')
    bodyEl.id = 'intro-body'
    bodyEl.style.cssText = 'color:#e6e6e6;font-size:17px;line-height:1.5;overflow:auto;max-height:100%'
    bodyEl.style.cursor = 'pointer'
    bodyEl.addEventListener('click', () => this.next())

    const controls = document.createElement('div')
    controls.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;align-items:center;margin-top:8px'

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Back'
    backBtn.style.cssText = 'background:#c59b45;color:#1b1b1b;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:700'
    backBtn.addEventListener('click', () => this.prev())

    const nextBtn = document.createElement('button')
    nextBtn.textContent = 'Next'
    nextBtn.style.cssText = 'background:#ffd966;color:#1b1b1b;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-weight:700'
    nextBtn.addEventListener('click', () => this.next())

    const skipBtn = document.createElement('button')
    skipBtn.textContent = 'Skip'
    skipBtn.style.cssText = 'background:transparent;color:#ffd966;border:2px solid #ffd966;padding:6px 10px;border-radius:4px;cursor:pointer'
    skipBtn.addEventListener('click', () => this.finish())

    controls.appendChild(skipBtn)
    controls.appendChild(backBtn)
    controls.appendChild(nextBtn)

    textCol.appendChild(titleEl)
    textCol.appendChild(bodyEl)

    const hint = document.createElement('div')
    hint.style.cssText = 'color:#cfc09a;font-size:12px;margin-top:6px'
    hint.textContent = 'Tip: click the image or story text to continue — or use Enter / Right Arrow.'
    textCol.appendChild(hint)
    textCol.appendChild(controls)

    contentRow.appendChild(imgCol)
    contentRow.appendChild(textCol)

    card.appendChild(header)
    card.appendChild(contentRow)
    this.container.appendChild(card)

    this.keyHandler = this.keyHandler.bind(this)
  }

  private keyHandler(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'Enter') this.next()
    if (e.key === 'ArrowLeft') this.prev()
    if (e.key === 'Escape') this.finish()
  }

  public show(): void {
    document.body.appendChild(this.container)
    this.render()
    window.addEventListener('keydown', this.keyHandler)
  }

  public hide(): void {
    try { window.removeEventListener('keydown', this.keyHandler) } catch (e) { /* ignore */ }
    if (this.container.parentElement) this.container.parentElement.removeChild(this.container)
  }

  private render(): void {
    const scene = this.scenes[this.index]
    const titleEl = this.container.querySelector('#intro-title') as HTMLElement
    const bodyEl = this.container.querySelector('#intro-body') as HTMLElement
    const img = this.container.querySelector('#intro-image') as HTMLImageElement

    if (scene.title) titleEl.textContent = scene.title
    else titleEl.textContent = ''
    bodyEl.textContent = scene.text
    if (scene.imageSrc) img.src = scene.imageSrc
    else img.removeAttribute('src')

    const buttons = Array.from(this.container.querySelectorAll('button')) as HTMLButtonElement[]
    const back = buttons.find(b => b.textContent === 'Back')
    const next = buttons.find(b => b.textContent === 'Next')
    if (back) back.disabled = this.index === 0
    if (next) next.textContent = (this.index === this.scenes.length - 1) ? 'Finish' : 'Next'
  }

  private prev(): void {
    if (this.index > 0) {
      this.index--
      this.render()
    }
  }

  private next(): void {
    if (this.index < this.scenes.length - 1) {
      this.index++
      this.render()
    } else {
      this.finish()
    }
  }

  private finish(): void {
    this.hide()
    try { this.onFinish() } catch (e) { console.error('IntroScreen: onFinish error', e) }
  }
}
