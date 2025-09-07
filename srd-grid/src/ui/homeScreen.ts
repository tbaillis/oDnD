import type { Character } from '../game/character'
import { UnifiedCharacterInterface } from './unifiedCharacterInterface'

interface HomeScreenCallbacks {
  onCreateCharacter: (character: Character) => void
  onSaveGame: () => void
  onLoadGame: () => void
  onLoadCharacter: () => void
  onEditGame: () => void
  onStartAdventure: () => void
  onRemoveCharacter?: (characterId: string) => void
  getPartyMembers: () => Map<string, Character>
}

export class HomeScreen {
  private container: HTMLDivElement
  private unifiedInterface: UnifiedCharacterInterface
  private partyContainer: HTMLDivElement
  private callbacks: HomeScreenCallbacks

  constructor(callbacks: HomeScreenCallbacks) {
    this.callbacks = callbacks
    this.unifiedInterface = new UnifiedCharacterInterface({
      onComplete: (character) => this.handleCharacterCreated(character),
      onCancel: () => console.log('Character creation cancelled')
    })
    
    this.container = document.createElement('div')
    this.container.id = 'home-screen'
    this.container.style.cssText = [
      'position:fixed',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
      'z-index:14000',
      'color:#ffd966',
      'font-family: "Times New Roman", serif'
    ].join(';')

    this.partyContainer = document.createElement('div')
    this.buildHomeScreen()
    this.keyHandler = this.keyHandler.bind(this)
  }

  private buildHomeScreen(): void {
    const card = document.createElement('div')
    card.style.cssText = [
      'width:900px',
      'max-width:calc(100% - 40px)',
      'height:80vh',
      'min-height:600px',
      'background:#1b1b1b',
      'border:6px solid #c59b45',
      'padding:24px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.8)',
      'display:flex',
      'flex-direction:column',
      'gap:20px',
      'overflow:auto'
    ].join(';')

    // Header
    const header = document.createElement('div')
    header.style.cssText = 'text-align:center;border-bottom:2px solid #c59b45;padding-bottom:16px;margin-bottom:16px'
    const title = document.createElement('h1')
    title.textContent = 'Dungeon Command Center'
    title.style.cssText = 'margin:0;font-size:32px;color:#ffd966;letter-spacing:2px'
    const subtitle = document.createElement('div')
    subtitle.textContent = 'Manage your party and begin your adventure'
    subtitle.style.cssText = 'font-size:14px;color:#cfc09a;margin-top:8px'
    header.appendChild(title)
    header.appendChild(subtitle)

    // Main content area
    const content = document.createElement('div')
    content.style.cssText = 'display:flex;gap:24px;flex:1;min-height:0'

    // Left panel - Actions
    const leftPanel = document.createElement('div')
    leftPanel.style.cssText = 'flex:0 0 300px;display:flex;flex-direction:column;gap:16px'

    // Character Management section
    const charSection = this.createSection('Character Management', [
      { label: 'Create Character', action: () => this.openCharacterCreation(), primary: true },
      { label: 'Load Character', action: () => this.openCharacterLoader() },
      { label: 'Edit Character', action: () => this.editSelectedCharacter() }
    ])

    // Game Management section  
    const gameSection = this.createSection('Game Management', [
      { label: 'Save Game', action: () => this.callbacks.onSaveGame() },
      { label: 'Load Game', action: () => this.callbacks.onLoadGame() },
      { label: 'Edit Game', action: () => this.callbacks.onEditGame() }
    ])

    // Adventure Management section
    const adventureSection = this.createSection('Adventure Management', [
      { label: 'Create New Adventure', action: () => this.showNotImplemented('Create Adventure') },
      { label: 'Load Adventure', action: () => this.showNotImplemented('Load Adventure') },
      { label: 'Start Adventure', action: () => this.callbacks.onStartAdventure(), primary: true }
    ])

    leftPanel.appendChild(charSection)
    leftPanel.appendChild(gameSection)
    leftPanel.appendChild(adventureSection)

    // Right panel - Party Members
    const rightPanel = document.createElement('div')
    rightPanel.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:12px'

    const partyHeader = document.createElement('h2')
    partyHeader.textContent = 'Current Party'
    partyHeader.style.cssText = 'margin:0;color:#ffd966;font-size:24px;border-bottom:1px solid #555;padding-bottom:8px'

    this.partyContainer.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;overflow-y:auto;padding:8px;background:#2a2a2a;border:2px solid #444;border-radius:6px'

    rightPanel.appendChild(partyHeader)
    rightPanel.appendChild(this.partyContainer)

    content.appendChild(leftPanel)
    content.appendChild(rightPanel)

    // Footer
    const footer = document.createElement('div')
    footer.style.cssText = 'text-align:center;border-top:1px solid #555;padding-top:12px;color:#999;font-size:12px'
    footer.textContent = 'Press ESC to close • Click party members to edit • Use keyboard shortcuts for quick access'

    card.appendChild(header)
    card.appendChild(content)
    card.appendChild(footer)
    this.container.appendChild(card)

    this.updatePartyDisplay()
  }

  private createSection(title: string, buttons: Array<{label: string, action: () => void, primary?: boolean}>): HTMLDivElement {
    const section = document.createElement('div')
    section.style.cssText = 'background:#2a2a2a;border:2px solid #444;border-radius:6px;padding:16px'

    const sectionTitle = document.createElement('h3')
    sectionTitle.textContent = title
    sectionTitle.style.cssText = 'margin:0 0 12px 0;color:#ffd966;font-size:18px'

    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = 'display:flex;flex-direction:column;gap:8px'

    buttons.forEach(btn => {
      const button = document.createElement('button')
      button.textContent = btn.label
      button.style.cssText = btn.primary 
        ? 'background:#ffd966;color:#1b1b1b;border:none;padding:12px 16px;border-radius:4px;cursor:pointer;font-weight:700;font-size:14px'
        : 'background:#444;color:#ffd966;border:2px solid #666;padding:10px 16px;border-radius:4px;cursor:pointer;font-weight:600;font-size:14px'
      
      button.addEventListener('mouseenter', () => {
        button.style.filter = 'brightness(1.2)'
      })
      button.addEventListener('mouseleave', () => {
        button.style.filter = 'brightness(1)'
      })
      button.addEventListener('click', btn.action)
      
      buttonContainer.appendChild(button)
    })

    section.appendChild(sectionTitle)
    section.appendChild(buttonContainer)
    return section
  }

  private updatePartyDisplay(): void {
    this.partyContainer.innerHTML = ''
    const party = this.callbacks.getPartyMembers()

    if (party.size === 0) {
      const emptyMsg = document.createElement('div')
      emptyMsg.textContent = 'No party members yet. Create your first character!'
      emptyMsg.style.cssText = 'text-align:center;color:#999;font-style:italic;padding:20px'
      this.partyContainer.appendChild(emptyMsg)
      return
    }

    Array.from(party.entries()).forEach(([id, character]: [string, Character]) => {
      const memberCard = document.createElement('div')
      memberCard.style.cssText = [
        'background:#333;border:2px solid #555;border-radius:6px;padding:12px',
        'cursor:pointer;transition:all 0.2s ease',
        'display:flex;justify-content:space-between;align-items:center'
      ].join(';')

      memberCard.addEventListener('mouseenter', () => {
        memberCard.style.borderColor = '#ffd966'
        memberCard.style.backgroundColor = '#404040'
      })
      memberCard.addEventListener('mouseleave', () => {
        memberCard.style.borderColor = '#555'
        memberCard.style.backgroundColor = '#333'
      })

      const info = document.createElement('div')
      const name = document.createElement('div')
      name.textContent = character.name
      name.style.cssText = 'font-weight:700;color:#ffd966;font-size:16px'
      
      const details = document.createElement('div')
      const race = character.race
      const className = character.classes[0]?.class || 'Unknown'
      const level = character.classes[0]?.level || 1
      details.textContent = `${race} ${className} (Level ${level})`
      details.style.cssText = 'color:#cfc09a;font-size:12px;margin-top:2px'

      const hp = document.createElement('div')
      hp.textContent = `HP: ${character.hitPoints.current}/${character.hitPoints.max}`
      hp.style.cssText = 'color:#999;font-size:11px;margin-top:2px'

      info.appendChild(name)
      info.appendChild(details)
      info.appendChild(hp)

      const actions = document.createElement('div')
      actions.style.cssText = 'display:flex;gap:8px'

      const editBtn = document.createElement('button')
      editBtn.textContent = 'Edit'
      editBtn.style.cssText = 'background:#16a34a;color:white;border:none;padding:6px 12px;border-radius:3px;cursor:pointer;font-size:12px'
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.editCharacter(id, character)
      })

      const removeBtn = document.createElement('button')
      removeBtn.textContent = 'Remove'
      removeBtn.style.cssText = 'background:#dc2626;color:white;border:none;padding:6px 12px;border-radius:3px;cursor:pointer;font-size:12px'
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.removeCharacter(id, character.name)
      })

      actions.appendChild(editBtn)
      actions.appendChild(removeBtn)

      memberCard.appendChild(info)
      memberCard.appendChild(actions)

      // Click to select/edit
      memberCard.addEventListener('click', () => {
        this.editCharacter(id, character)
      })

      this.partyContainer.appendChild(memberCard)
    })
  }

  private openCharacterCreation(): void {
    console.log('HomeScreen: Opening unified character creation')
    this.unifiedInterface.showForCreation()
  }

  private openCharacterLoader(): void {
    console.log('HomeScreen: Opening character loader')
    this.callbacks.onLoadCharacter()
  }

  private handleCharacterCreated(character: Character): void {
    const party = this.callbacks.getPartyMembers()
    
    if (party.size >= 6) {
      // Party is full, ask user to replace someone
      this.showPartyReplacementDialog(character)
    } else {
      // Add to party
      this.callbacks.onCreateCharacter(character)
      this.updatePartyDisplay()
      this.showMessage(`${character.name} has joined the party!`)
    }
  }

  private showPartyReplacementDialog(newCharacter: Character): void {
    const dialog = document.createElement('div')
    dialog.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:24000',
      'display:flex;align-items:center;justify-content:center'
    ].join(';')

    const content = document.createElement('div')
    content.style.cssText = [
      'background:#1b1b1b;border:4px solid #c59b45;border-radius:8px;padding:24px',
      'max-width:500px;color:#ffd966;font-family: "Times New Roman", serif'
    ].join(';')

    const title = document.createElement('h2')
    title.textContent = 'Party Full'
    title.style.cssText = 'margin:0 0 16px 0;color:#ffd966;text-align:center'

    const message = document.createElement('p')
    message.textContent = `Your party is full (6 members). Would you like to replace an existing member with ${newCharacter.name}?`
    message.style.cssText = 'margin:0 0 20px 0;line-height:1.5;text-align:center'

    const partyList = document.createElement('div')
    partyList.style.cssText = 'margin:16px 0;max-height:200px;overflow-y:auto'

    const party = this.callbacks.getPartyMembers()
    Array.from(party.entries()).forEach(([id, character]: [string, Character]) => {
      const item = document.createElement('div')
      item.style.cssText = [
        'background:#333;border:2px solid #555;margin:4px 0;padding:12px',
        'cursor:pointer;border-radius:4px;transition:all 0.2s ease'
      ].join(';')

      item.innerHTML = `
        <div style="font-weight:700;color:#ffd966">${character.name}</div>
        <div style="color:#cfc09a;font-size:12px">${character.race} ${character.classes[0]?.class} (Level ${character.classes[0]?.level})</div>
      `

      item.addEventListener('mouseenter', () => {
        item.style.borderColor = '#dc2626'
        item.style.backgroundColor = '#404040'
      })
      item.addEventListener('mouseleave', () => {
        item.style.borderColor = '#555'
        item.style.backgroundColor = '#333'
      })

      item.addEventListener('click', () => {
        this.replacePartyMember(id, newCharacter)
        document.body.removeChild(dialog)
        this.showMessage(`${character.name} has been replaced by ${newCharacter.name}!`)
      })

      partyList.appendChild(item)
    })

    const buttons = document.createElement('div')
    buttons.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:20px'

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.cssText = 'background:#666;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer'
    cancelBtn.addEventListener('click', () => document.body.removeChild(dialog))

    buttons.appendChild(cancelBtn)

    content.appendChild(title)
    content.appendChild(message)
    content.appendChild(partyList)
    content.appendChild(buttons)
    dialog.appendChild(content)
    document.body.appendChild(dialog)
  }

  private replacePartyMember(_replaceId: string, newCharacter: Character): void {
    // This will be handled by the adapter
    this.callbacks.onCreateCharacter(newCharacter)
    // The adapter should handle the replacement logic
    this.updatePartyDisplay()
  }

  private editCharacter(id: string, character: Character): void {
    console.log('HomeScreen: Editing character:', character.name)
    this.unifiedInterface.showForEdit(character, id)
    
    // Update display when edit is complete
    const handleEdit = () => {
      this.updatePartyDisplay()
      document.removeEventListener('character-sheet-saved', handleEdit)
    }
    document.addEventListener('character-sheet-saved', handleEdit)
  }

  private editSelectedCharacter(): void {
    const party = this.callbacks.getPartyMembers()
    if (party.size === 0) {
      this.showMessage('No characters to edit. Create a character first!')
      return
    }

    // For now, just edit the first character. Could enhance with selection dialog
    const firstEntry = Array.from(party.entries())[0] as [string, Character] | undefined
    if (firstEntry) {
      this.editCharacter(firstEntry[0], firstEntry[1])
    }
  }

  private removeCharacter(id: string, name: string): void {
    if (confirm(`Are you sure you want to remove ${name} from the party?`)) {
      if (this.callbacks.onRemoveCharacter) {
        this.callbacks.onRemoveCharacter(id)
      }
      this.showMessage(`${name} has left the party.`)
      this.updatePartyDisplay()
    }
  }

  private showNotImplemented(feature: string): void {
    this.showMessage(`${feature} feature coming soon!`)
  }

  private showMessage(text: string): void {
    const toast = document.createElement('div')
    toast.style.cssText = [
      'position:fixed;top:20px;right:20px;z-index:26000',
      'background:#16a34a;color:white;padding:12px 20px;border-radius:6px',
      'font-family: "Times New Roman", serif;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.3)'
    ].join(';')
    toast.textContent = text

    document.body.appendChild(toast)
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast)
    }, 3000)
  }

  private keyHandler(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.hide()
    } else if (e.key === 'c' && !e.ctrlKey && !e.altKey) {
      this.openCharacterCreation()
    } else if (e.key === 's' && e.ctrlKey) {
      e.preventDefault()
      this.callbacks.onSaveGame()
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      this.callbacks.onLoadGame()
    }
  }

  public show(): void {
    document.body.appendChild(this.container)
    this.updatePartyDisplay()
    window.addEventListener('keydown', this.keyHandler)
  }

  public hide(): void {
    try { window.removeEventListener('keydown', this.keyHandler) } catch (e) { /* ignore */ }
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
  }

  public refresh(): void {
    this.updatePartyDisplay()
  }
}
