import type { Character } from '../game/character'
import { DungeonView } from './dungeonView'

// Condition codes and their display information
export interface ConditionInfo {
  code: string
  name: string
  description: string
  priority: number
  color: string
  icon: string
}

export const CONDITION_MAP: Record<string, ConditionInfo> = {
  'DEAD': { code: 'DEAD', name: 'Dead', description: 'Character is dead and cannot act', priority: 1, color: '#000000', icon: '💀' },
  'DYG': { code: 'DYG', name: 'Dying', description: 'Character is dying and losing hit points', priority: 2, color: '#8B0000', icon: '🩸' },
  'UNC': { code: 'UNC', name: 'Unconscious', description: 'Character is unconscious and helpless', priority: 3, color: '#4B0082', icon: '😴' },
  'STBL': { code: 'STBL', name: 'Stable', description: 'Character is stable but unconscious', priority: 4, color: '#8B4513', icon: '🏥' },
  'DIS': { code: 'DIS', name: 'Disabled', description: 'Character has exactly 0 hit points', priority: 5, color: '#B8860B', icon: '❤️‍🩹' },
  'STAG': { code: 'STAG', name: 'Staggered', description: 'Character can only take one action per turn', priority: 6, color: '#FFD700', icon: '🥴' },
  'PRN': { code: 'PRN', name: 'Prone', description: 'Character is lying on the ground', priority: 10, color: '#8B4513', icon: '⬇️' },
  'STUN': { code: 'STUN', name: 'Stunned', description: 'Character cannot act and loses Dex bonus to AC', priority: 7, color: '#FF4500', icon: '⭐' },
  'DAZ': { code: 'DAZ', name: 'Dazed', description: 'Character can only take one action per turn', priority: 8, color: '#FF6347', icon: '🌀' },
  'FTF': { code: 'FTF', name: 'Flat-Footed', description: 'Character loses Dex bonus to AC', priority: 15, color: '#696969', icon: '👢' },
  'GRP': { code: 'GRP', name: 'Grappling', description: 'Character is engaged in a grapple', priority: 11, color: '#8B008B', icon: '🔗' },
  'PIN': { code: 'PIN', name: 'Pinned', description: 'Character is pinned in a grapple', priority: 9, color: '#4B0082', icon: '📌' },
  'ENT': { code: 'ENT', name: 'Entangled', description: 'Character is entangled and cannot move', priority: 12, color: '#228B22', icon: '🕸️' },
  'FAT': { code: 'FAT', name: 'Fatigued', description: 'Character takes -2 to Str and Dex', priority: 18, color: '#808080', icon: '☕' },
  'EXH': { code: 'EXH', name: 'Exhausted', description: 'Character takes -6 to Str and Dex', priority: 17, color: '#2F4F4F', icon: '☕❌' },
  'INV': { code: 'INV', name: 'Invisible', description: 'Character cannot be seen', priority: 14, color: '#E6E6FA', icon: '👻' },
  'INC': { code: 'INC', name: 'Incorporeal', description: 'Character has no physical form', priority: 13, color: '#F0F8FF', icon: '👻' },
  'NVD': { code: 'NVD', name: 'Nauseated', description: 'Character can only take move actions', priority: 16, color: '#32CD32', icon: '🤢' },
  'SCK': { code: 'SCK', name: 'Sickened', description: 'Character takes -2 to attack and damage', priority: 19, color: '#9ACD32', icon: '🤒' },
  'SHK': { code: 'SHK', name: 'Shaken', description: 'Character takes -2 to attack, saves, and checks', priority: 22, color: '#FFD700', icon: '❗' },
  'FRI': { code: 'FRI', name: 'Frightened', description: 'Character must flee and takes -2 penalty', priority: 21, color: '#FF8C00', icon: '❗❗' },
  'PAN': { code: 'PAN', name: 'Panicked', description: 'Character must flee and takes -2 penalty', priority: 20, color: '#FF0000', icon: '❗❗❗' },
  'ENx': { code: 'ENx', name: 'Energy Drained', description: 'Character has negative levels', priority: 23, color: '#800080', icon: '⬇️' }
}

// Character status for UI display
export interface CharacterStatus {
  id: string
  name: string
  armorClass: number
  hp: { current: number; max: number; temp?: number }
  initiative?: number
  conditions: string[]
  isActiveTurn?: boolean
}

// Message types for the message log
export interface Message {
  id: string
  text: string
  kind: 'Narration' | 'Combat' | 'System' | 'Skill' | 'Warning' | 'Prompt'
  requiresAck?: boolean
  color?: string
  timestamp: number
}

// Command structure
export interface Command {
  key: string
  label: string
  enabled: boolean
  hotkey: string
  action: () => void
}

// Scene display modes
export interface ViewportScene {
  mode: 'image' | 'tile' | 'overlay'
  imageId?: string
  imageSrc?: string
  tileRendererId?: string
  overlay?: { imageId: string; x: number; y: number }
}

/**
 * Gold Box-style full screen interface overlay
 * Implements the classic D&D Gold Box game interface
 */
export class GoldBoxInterface {
  private container!: HTMLElement
  private viewportElement!: HTMLElement
  private partyPanelElement!: HTMLElement
  private messageLogElement!: HTMLElement
  private commandBarElement!: HTMLElement
  private isVisible = false
  
  // State
  private party: CharacterStatus[] = []
  private messages: Message[] = []
  private currentScene: ViewportScene = { mode: 'image' }
  private commands: Command[] = []
  private awaitingInput = false
  
  // Callbacks
  private onCommand: (command: string) => void = () => {}
  private onPromptResponse: (response: string) => void = () => {}
  private onCharacterClick: (characterId: string) => void = () => {}

  constructor() {
    this.createInterface()
    this.setupEventListeners()
    this.initializeDefaultCommands()

  // NOTE: inline story list will be created in createInterface

    // If a global story manager exists, subscribe to its events to render story messages
    try {
      const globalStory = (window as any).story
      if (globalStory && typeof globalStory.onEvent === 'function') {
        globalStory.onEvent((e: any) => {
          switch (e.type) {
            case 'encounter_started':
              this.addMessage(`Encounter started: ${e.encounterId} (Chapter ${e.chapterId})`, 'Narration')
              break
            case 'battle_result':
              this.addMessage(`Battle ${e.result.toUpperCase()} ${e.encounterId ? `in ${e.encounterId}` : ''} ${e.details?.loot ? `- Loot: ${JSON.stringify(e.details.loot)}` : ''}`, 'Combat')
              break
            case 'dungeon_explored':
              this.addMessage(`Exploration progress: ${e.progress ?? 0}% ${e.encounterId ? `(encounter ${e.encounterId})` : ''}`, 'Narration')
              break
            default:
              this.addMessage(`Story event: ${e.type}`, 'System')
          }
        })
      }
    } catch (err) {}

  // nothing to append here; createInterface will wire story list element
  }

  private createInterface(): void {
    // Create full-screen overlay container
    this.container = document.createElement('div')
    this.container.className = 'gold-box-interface'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      color: #00FFFF;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.2;
      z-index: 10000;
      display: none;
      overflow: hidden;
    `

    // Create main layout grid (classic Gold Box layout)
    const gridContainer = document.createElement('div')
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 200px;
      grid-template-rows: 1fr auto;
      gap: 4px;
      width: 100%;
      height: 100%;
      padding: 8px;
      box-sizing: border-box;
    `

    // Create viewport (scene display)
    this.viewportElement = this.createViewport()
    
    // Create party panel
    this.partyPanelElement = this.createPartyPanel()
    
    // Create message log (spans both columns)
    this.messageLogElement = this.createMessageLog()
    
    // Create command bar (spans both columns)
    this.commandBarElement = this.createCommandBar()

  // Create dungeon slot (will hold the DungeonView)
  const dungeonSlot = this.createDungeonSlot()

  // Layout components
  // Left column will contain the viewport and dungeon slot stacked vertically
  const leftColumn = document.createElement('div')
  leftColumn.style.cssText = `display:flex; flex-direction:column; gap:8px;`
  leftColumn.appendChild(this.viewportElement)
  leftColumn.appendChild(dungeonSlot)

    gridContainer.appendChild(leftColumn)
    gridContainer.appendChild(this.partyPanelElement)
    
    const bottomSection = document.createElement('div')
    bottomSection.style.cssText = `
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      min-height: 120px;
    `
    bottomSection.appendChild(this.messageLogElement)
    bottomSection.appendChild(this.commandBarElement)
    gridContainer.appendChild(bottomSection)

    this.container.appendChild(gridContainer)
    document.body.appendChild(this.container)
  // save dungeon slot reference for later instantiation
  ;(this as any)._dungeonSlot = dungeonSlot
  }

  private createViewport(): HTMLElement {
    const viewport = document.createElement('div')
    viewport.className = 'viewport'
    viewport.style.cssText = `
      border: 2px solid #00FFFF;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      min-height: 300px;
    `

    const content = document.createElement('div')
    content.className = 'viewport-content'
    content.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00FFFF;
    `
    content.textContent = 'Scene will appear here'

    viewport.appendChild(content)
    return viewport
  }

  private createPartyPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'party-panel'
    panel.style.cssText = `
      border: 2px solid #00FFFF;
      background: #000;
      padding: 8px;
      overflow-y: auto;
    `

    const header = document.createElement('div')
    header.style.cssText = `
      color: #FFFF00;
      font-weight: bold;
      margin-bottom: 8px;
      text-align: center;
      border-bottom: 1px solid #00FFFF;
      padding-bottom: 4px;
    `
    header.textContent = 'PARTY'

    const membersList = document.createElement('div')
    membersList.className = 'party-members'
    
    panel.appendChild(header)
    panel.appendChild(membersList)
    return panel
  }

  private createDungeonSlot(): HTMLElement {
    const slot = document.createElement('div')
    slot.className = 'dungeon-slot'
    slot.style.cssText = `
      border: 2px solid #00aaff;
      background: #04050a;
      padding: 6px;
      width: 440px;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    `
    const title = document.createElement('div')
    title.textContent = 'Dungeon'
    title.style.cssText = 'color: #ffd86b; font-weight: bold; text-align:center; margin-bottom:6px;'
    slot.appendChild(title)
    return slot
  }

  private createMessageLog(): HTMLElement {
    const log = document.createElement('div')
    log.className = 'message-log'
    log.style.cssText = `
      border: 2px solid #00FFFF;
      background: #000;
      padding: 8px;
      height: 80px;
      overflow-y: auto;
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 11px;
    `

    return log
  }

  private createCommandBar(): HTMLElement {
    const bar = document.createElement('div')
    bar.className = 'command-bar'
    bar.style.cssText = `
      border: 2px solid #00FFFF;
      background: #000;
      padding: 6px;
      height: 30px;
      display: flex;
      align-items: center;
      gap: 16px;
      justify-content: center;
    `

    return bar
  }

  private setupEventListeners(): void {
    // Global keyboard handler
    document.addEventListener('keydown', (e) => {
      if (!this.isVisible) return

      // Handle hotkeys
      const key = e.key.toLowerCase()
      
      // Check for command hotkeys
      const command = this.commands.find(cmd => cmd.hotkey.toLowerCase() === key && cmd.enabled)
      if (command) {
        e.preventDefault()
        command.action()
        return
      }

      // Handle special keys
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          this.hide()
          break
        case 'Enter':
        case ' ':
          if (this.awaitingInput) {
            e.preventDefault()
            this.handlePromptContinue()
          }
          break
      }
    })

    // Prevent context menu on right click
    this.container.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private initializeDefaultCommands(): void {
    this.commands = [
      {
        key: 'combat',
        label: '(C)OMBAT',
        enabled: true,
        hotkey: 'c',
        action: () => this.onCommand('combat')
      },
      {
        key: 'wait',
        label: '(W)AIT',
        enabled: true,
        hotkey: 'w',
        action: () => this.onCommand('wait')
      },
      {
        key: 'flee',
        label: '(F)LEE',
        enabled: false,
        hotkey: 'f',
        action: () => this.onCommand('flee')
      },
      {
        key: 'advance',
        label: '(A)DVANCE',
        enabled: true,
        hotkey: 'a',
        action: () => this.onCommand('advance')
      },
      {
        key: 'talk',
        label: '(T)ALK',
        enabled: false,
        hotkey: 't',
        action: () => this.onCommand('talk')
      },
      {
        key: 'use',
        label: '(U)SE',
        enabled: false,
        hotkey: 'u',
        action: () => this.onCommand('use')
      },
      {
        key: 'search',
        label: '(S)EARCH',
        enabled: true,
        hotkey: 's',
        action: () => this.onCommand('search')
      },
      {
        key: 'camp',
        label: '(P)CAMP',
        enabled: true,
        hotkey: 'p',
        action: () => this.onCommand('camp')
      }
    ]
    this.updateCommandBar()
  }

  // Public API methods

  public show(): void {
    this.isVisible = true
    this.container.style.display = 'block'
    console.log('Gold Box Interface shown')
    // instantiate DungeonView inside the main viewport content (replace image)
    try {
      const content = this.viewportElement.querySelector('.viewport-content') as HTMLElement | null
      if (content && !(content as any)._dungeonInstance) {
        // clear any existing content (image placeholder)
        content.innerHTML = ''
  // If a global story manager exists, pass it through for optional linking
  const globalStory = (window as any).story
  const dungeon = globalStory ? new DungeonView(content, { story: globalStory, chapterId: 'ch-1' }) : new DungeonView(content)
        ;(content as any)._dungeonInstance = dungeon
        ;(window as any).dungeonView = dungeon
        console.log('DungeonView instantiated in Gold Box viewport content')
      }
    } catch (err) {
      console.warn('Failed to instantiate DungeonView in viewport content:', err)
    }
  }

  public hide(): void {
    this.isVisible = false
    this.container.style.display = 'none'
    console.log('Gold Box Interface hidden')
    // destroy dungeon view instance if present and restore viewport placeholder
    try {
      const content = this.viewportElement.querySelector('.viewport-content') as HTMLElement | null
      const inst = content && (content as any)._dungeonInstance
      if (inst && inst.destroy) {
        try { inst.destroy() } catch (e) { /* ignore */ }
      }
      if (content) {
        (content as any)._dungeonInstance = undefined
        // restore placeholder image/text
        content.innerHTML = ''
        if (this.currentScene.mode === 'image' && this.currentScene.imageSrc) {
          const img = document.createElement('img')
          img.src = this.currentScene.imageSrc
          img.style.cssText = 'max-width:100%; max-height:100%; object-fit:contain;'
          content.appendChild(img)
        } else {
          content.textContent = 'Scene will appear here'
        }
      }
      ;(window as any).dungeonView = undefined
    } catch (err) {
      console.warn('Failed to clean up DungeonView instance:', err)
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  public isShowing(): boolean {
    return this.isVisible
  }

  public setOnCharacterClick(callback: (characterId: string) => void): void {
    this.onCharacterClick = callback
  }

  public updateParty(party: CharacterStatus[]): void {
    this.party = [...party]
    this.renderPartyPanel()
  }

  public addMessage(text: string, kind: Message['kind'] = 'System', options: Partial<Message> = {}): void {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      kind,
      timestamp: Date.now(),
      ...options
    }
    
    this.messages.push(message)
    this.renderMessageLog()
  }

  public setScene(scene: ViewportScene): void {
    this.currentScene = scene
    this.renderViewport()
  }

  public setCommands(commands: Partial<Record<string, boolean>>): void {
    for (const [key, enabled] of Object.entries(commands)) {
      const command = this.commands.find(cmd => cmd.key === key)
      if (command && enabled !== undefined) {
        command.enabled = enabled
      }
    }
    this.updateCommandBar()
  }

  public prompt(message: string, options: string[] = ['YES', 'NO']): Promise<string> {
    return new Promise((resolve) => {
      this.addMessage(message, 'Prompt', { requiresAck: true })
      this.awaitingInput = true
      
      const promptMessage = `${message} [${options.map((opt) => `(${opt[0]})${opt.slice(1)}`).join(' / ')}]`
      this.addMessage(promptMessage, 'Prompt')
      
      this.onPromptResponse = resolve
    })
  }

  public setCommandCallback(callback: (command: string) => void): void {
    this.onCommand = callback
  }

  // Rendering methods

  private renderPartyPanel(): void {
    const membersList = this.partyPanelElement.querySelector('.party-members') as HTMLElement
    if (!membersList) return

    membersList.innerHTML = ''

    this.party.forEach((character) => {
      const memberElement = document.createElement('div')
      memberElement.className = 'party-member'
      memberElement.style.cssText = `
        margin-bottom: 12px;
        padding: 4px;
        border: 1px solid ${character.isActiveTurn ? '#FFFF00' : '#333'};
        background: ${character.isActiveTurn ? 'rgba(255,255,0,0.1)' : 'transparent'};
        cursor: pointer;
      `

      // Add click handler to open character sheet
      memberElement.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.onCharacterClick(character.id)
      })

      // Add hover effect
      memberElement.addEventListener('mouseenter', () => {
        memberElement.style.background = character.isActiveTurn ? 'rgba(255,255,0,0.2)' : 'rgba(0,255,255,0.1)'
      })

      memberElement.addEventListener('mouseleave', () => {
        memberElement.style.background = character.isActiveTurn ? 'rgba(255,255,0,0.1)' : 'transparent'
      })

      // Name with pawn ID and basic stats
      const nameElement = document.createElement('div')
      nameElement.style.cssText = `
        color: #00FFFF;
        font-weight: bold;
        margin-bottom: 2px;
      `
      // Extract pawn ID from character.id (e.g., "pawn-a" -> "A", "pawn-m1" -> "M1") 
      const pawnIdMap: Record<string, string> = {
        'pawn-a': 'A',
        'pawn-b': 'B',
        'pawn-c': 'C', 
        'pawn-d': 'D',
        'pawn-e': 'E',
        'pawn-f': 'F'
      }
      const pawnId = pawnIdMap[character.id] || character.id.replace('pawn-', '').toUpperCase()
      nameElement.textContent = `[${pawnId}] ${character.name}`

      const statsElement = document.createElement('div')
      statsElement.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        margin-bottom: 4px;
      `

      const acElement = document.createElement('span')
      acElement.style.color = '#FFFFFF'
      acElement.textContent = `AC ${character.armorClass}`

      const hpElement = document.createElement('span')
      const hpPercent = character.hp.current / character.hp.max
      hpElement.style.color = hpPercent >= 0.66 ? '#00FF00' : hpPercent >= 0.33 ? '#FFFF00' : '#FF0000'
      hpElement.textContent = `${character.hp.current}/${character.hp.max}`

      statsElement.appendChild(acElement)
      statsElement.appendChild(hpElement)

      // Condition badges
      const conditionsElement = document.createElement('div')
      conditionsElement.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 4px;
      `

      // Sort conditions by priority and show top 3
      const sortedConditions = character.conditions
        .map(code => CONDITION_MAP[code])
        .filter(info => info)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3)

      sortedConditions.forEach(conditionInfo => {
        const badge = document.createElement('span')
        badge.className = 'condition-badge'
        badge.style.cssText = `
          background: ${conditionInfo.color};
          color: white;
          font-size: 8px;
          padding: 1px 3px;
          border-radius: 2px;
          cursor: help;
        `
        badge.textContent = conditionInfo.code
        badge.title = `${conditionInfo.name}: ${conditionInfo.description}`
        conditionsElement.appendChild(badge)
      })

      if (character.conditions.length > 3) {
        const overflow = document.createElement('span')
        overflow.style.cssText = `
          color: #888;
          font-size: 8px;
        `
        overflow.textContent = `+${character.conditions.length - 3}`
        conditionsElement.appendChild(overflow)
      }

      memberElement.appendChild(nameElement)
      memberElement.appendChild(statsElement)
      if (character.conditions.length > 0) {
        memberElement.appendChild(conditionsElement)
      }

      membersList.appendChild(memberElement)
    })
  }

  private renderMessageLog(): void {
    // Show last few messages
    const recentMessages = this.messages.slice(-10)
    
    this.messageLogElement.innerHTML = ''
    
    recentMessages.forEach(message => {
      const messageElement = document.createElement('div')
      messageElement.className = `message message-${message.kind.toLowerCase()}`
      
      let color = '#FFFFFF'
      switch (message.kind) {
        case 'Narration': color = '#FFFF00'; break
        case 'Combat': color = '#FF0000'; break
        case 'System': color = '#00FFFF'; break
        case 'Skill': color = '#00FF00'; break
        case 'Warning': color = '#FF8000'; break
        case 'Prompt': color = '#FFFFFF'; break
      }
      
      messageElement.style.cssText = `
        color: ${message.color || color};
        margin-bottom: 2px;
        word-wrap: break-word;
      `
      
      messageElement.textContent = message.text
      this.messageLogElement.appendChild(messageElement)
    })
    
    // Auto-scroll to bottom
    this.messageLogElement.scrollTop = this.messageLogElement.scrollHeight
  }

  private renderViewport(): void {
    const content = this.viewportElement.querySelector('.viewport-content') as HTMLElement
    if (!content) return

    switch (this.currentScene.mode) {
      case 'image':
        if (this.currentScene.imageSrc) {
          content.innerHTML = `<img src="${this.currentScene.imageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Scene" />`
        } else {
          content.innerHTML = '<div style="color: #00FFFF;">Scene Loading...</div>'
        }
        break
      case 'tile':
        content.innerHTML = '<div style="color: #00FFFF;">Tile-based view not yet implemented</div>'
        break
      case 'overlay':
        content.innerHTML = '<div style="color: #00FFFF;">Overlay view not yet implemented</div>'
        break
      default:
        content.innerHTML = '<div style="color: #888;">No scene loaded</div>'
    }
  }

  private updateCommandBar(): void {
    this.commandBarElement.innerHTML = ''
    
    this.commands.forEach(command => {
      const button = document.createElement('button')
      button.className = 'command-button'
      button.style.cssText = `
        background: ${command.enabled ? '#333' : '#111'};
        color: ${command.enabled ? '#00FFFF' : '#666'};
        border: 1px solid ${command.enabled ? '#00FFFF' : '#333'};
        padding: 4px 8px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        cursor: ${command.enabled ? 'pointer' : 'not-allowed'};
        margin: 0 2px;
      `
      button.textContent = command.label
      button.disabled = !command.enabled
      
      if (command.enabled) {
        button.addEventListener('click', command.action)
        button.addEventListener('mouseenter', () => {
          button.style.background = '#555'
        })
        button.addEventListener('mouseleave', () => {
          button.style.background = '#333'
        })
      }
      
      this.commandBarElement.appendChild(button)
    })
  }

  private handlePromptContinue(): void {
    if (this.awaitingInput) {
      this.awaitingInput = false
      this.onPromptResponse('continue')
    }
  }
}

// Utility functions for converting existing character data
export function convertCharacterToStatus(character: Character, id: string, conditions: string[] = []): CharacterStatus {
  return {
    id,
    name: character.name,
    armorClass: character.armorClass.total,
    hp: {
      current: character.hitPoints.current,
      max: character.hitPoints.max,
      temp: character.hitPoints.temporary
    },
    conditions
  }
}
