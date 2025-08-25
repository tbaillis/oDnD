import { UIManager } from './interface'

export class Toolbar {
  private container: HTMLElement
  private uiManager: UIManager

  constructor(parent: HTMLElement, uiManager: UIManager) {
    this.uiManager = uiManager
    
    this.container = document.createElement('div')
    this.container.id = 'game-toolbar'
    this.container.style.cssText = `
      position: fixed;
      top: 60px;
      right: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 1050;
    `
    
    this.createButton('New Character', () => {
      // Show character creation UI; older API accepted a callback but new API uses events or returned value
      // Call show() and rely on UIManager to emit the created character via its own flow.
      if (typeof this.uiManager.characterCreation.show === 'function') {
        try { this.uiManager.characterCreation.show(); } catch (e) { /* no-op fallback */ }
      }
    })
    
    this.createButton('Character (C)', () => {
      this.uiManager.characterSheet.toggle()
    })
    
    this.createButton('Spells (S)', () => {
      this.uiManager.spellBook.toggle()
    })
    
    parent.appendChild(this.container)
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button')
    button.textContent = text
    button.style.cssText = `
      padding: 8px 12px;
      background: rgba(32, 42, 68, 0.9);
      border: 1px solid #4a90e2;
      border-radius: 4px;
      color: #ddd;
      cursor: pointer;
      font-size: 12px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      transition: all 0.2s;
    `
    
    button.addEventListener('mouseover', () => {
      button.style.background = 'rgba(74, 144, 226, 0.3)'
      button.style.borderColor = '#7ed321'
    })
    
    button.addEventListener('mouseout', () => {
      button.style.background = 'rgba(32, 42, 68, 0.9)'
      button.style.borderColor = '#4a90e2'
    })
    
    button.addEventListener('click', onClick)
    
    this.container.appendChild(button)
    return button
  }

  show() {
    this.container.style.display = 'flex'
  }

  hide() {
    this.container.style.display = 'none'
  }
}
