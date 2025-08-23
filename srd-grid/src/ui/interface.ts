import type { Character } from '../game/character'
import type { Spell } from '../game/magic'
import { CharacterCreationUI } from './characterCreation'
import { Toolbar } from './toolbar'

// Character Sheet UI
export class CharacterSheetUI {
  private container: HTMLElement
  private character: Character | null = null

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div')
    this.container.id = 'character-sheet'
    this.container.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50px;
      width: 320px;
      max-height: 75vh;
      background: rgba(20, 25, 30, 0.95);
      border: 1px solid #444;
      border-radius: 6px;
      padding: 16px;
      color: #ddd;
      overflow-y: auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      display: none;
      z-index: 1200;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    `
    parent.appendChild(this.container)
  }

  setCharacter(character: Character) {
    this.character = character
    this.render()
  }

  show() {
    this.container.style.display = 'block'
  }

  hide() {
    this.container.style.display = 'none'
  }

  toggle() {
    if (this.container.style.display === 'none') {
      this.show()
    } else {
      this.hide()
    }
  }

  private render() {
    if (!this.character) return

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #444; padding-bottom: 8px;">
        <h3 style="margin: 0; color: #fff;">${this.character.name}</h3>
        <button id="close-character-sheet" style="background: none; border: none; color: #999; font-size: 18px; cursor: pointer;">×</button>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div><strong>${this.character.race}</strong> ${this.character.classes.map(c => `${c.class} ${c.level}`).join('/')}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
        ${this.renderAbilityScore('STR', this.character.abilityScores.STR)}
        ${this.renderAbilityScore('DEX', this.character.abilityScores.DEX)}
        ${this.renderAbilityScore('CON', this.character.abilityScores.CON)}
        ${this.renderAbilityScore('INT', this.character.abilityScores.INT)}
        ${this.renderAbilityScore('WIS', this.character.abilityScores.WIS)}
        ${this.renderAbilityScore('CHA', this.character.abilityScores.CHA)}
      </div>

      <div style="margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">Combat</h4>
            <div>HP: ${this.character.hitPoints.current}/${this.character.hitPoints.max}</div>
            <div>AC: ${this.character.armorClass.total} (Touch: ${this.character.armorClass.touch})</div>
            <div>BAB: +${this.calculateBAB()}</div>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">Saves</h4>
            <div>Fort: +${this.character.savingThrows.fortitude}</div>
            <div>Ref: +${this.character.savingThrows.reflex}</div>
            <div>Will: +${this.character.savingThrows.will}</div>
          </div>
        </div>
      </div>

      ${this.renderSkills()}
      ${this.renderFeats()}
      ${this.renderEquipment()}
    `

    // Add event listeners
    const closeBtn = document.getElementById('close-character-sheet')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide())
    }
  }

  private renderAbilityScore(ability: string, score: number): string {
    const modifier = Math.floor((score - 10) / 2)
    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`
    return `
      <div style="text-align: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px;">
        <div style="font-size: 11px; color: #aaa;">${ability}</div>
        <div style="font-size: 16px; font-weight: bold;">${score}</div>
        <div style="font-size: 12px; color: #ccc;">(${modStr})</div>
      </div>
    `
  }

  private renderSkills(): string {
    if (!this.character || !Object.keys(this.character.skills).length) return ''
    
    const skillsHtml = Object.entries(this.character.skills)
      .map(([name, skill]) => `
        <div style="display: flex; justify-content: space-between;">
          <span ${skill.classSkill ? 'style="color: #9cf;"' : ''}>${name}</span>
          <span>+${skill.total}</span>
        </div>
      `).join('')

    return `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">Skills</h4>
        ${skillsHtml}
      </div>
    `
  }

  private renderFeats(): string {
    if (!this.character || !this.character.feats.length) return ''

    return `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">Feats</h4>
        ${this.character.feats.map(feat => `<div>• ${feat}</div>`).join('')}
      </div>
    `
  }

  private renderEquipment(): string {
    if (!this.character) return ''
    
    const weapons = this.character.equipment.weapons.map(w => w.name).join(', ') || 'None'
    const armor = this.character.equipment.armor?.name || 'None'

    return `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">Equipment</h4>
        <div><strong>Weapons:</strong> ${weapons}</div>
        <div><strong>Armor:</strong> ${armor}</div>
      </div>
    `
  }

  private calculateBAB(): number {
    if (!this.character) return 0
    
    // This should use the calculateBAB function from character.ts
    return this.character.classes.reduce((total, classLevel) => {
      // Simplified BAB calculation for display
      switch (classLevel.class) {
        case 'fighter':
        case 'barbarian':
        case 'paladin':
        case 'ranger':
          return total + classLevel.level
        case 'cleric':
        case 'druid':
        case 'monk':
        case 'bard':
        case 'rogue':
          return total + Math.floor(classLevel.level * 3 / 4)
        default:
          return total + Math.floor(classLevel.level / 2)
      }
    }, 0)
  }
}

// Spell Book UI
export class SpellBookUI {
  private container: HTMLElement
  private spells: Record<string, Spell> = {}

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div')
    this.container.id = 'spell-book'
    this.container.style.cssText = `
      position: fixed;
      top: 50px;
      right: 50px;
      width: 340px;
      max-height: 70vh;
      background: rgba(20, 25, 30, 0.95);
      border: 1px solid #444;
      border-radius: 6px;
      padding: 16px;
      color: #ddd;
      overflow-y: auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      display: none;
      z-index: 1200;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    `
    parent.appendChild(this.container)
  }

  setSpells(spells: Record<string, Spell>) {
    this.spells = spells
    this.render()
  }

  show() { this.container.style.display = 'block' }
  hide() { this.container.style.display = 'none' }
  toggle() { this.container.style.display === 'none' ? this.show() : this.hide() }

  private render() {
    const spellsByLevel = this.groupSpellsByLevel()
    
    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #444; padding-bottom: 8px;">
        <h3 style="margin: 0; color: #fff;">Spell Book</h3>
        <button id="close-spell-book" style="background: none; border: none; color: #999; font-size: 18px; cursor: pointer;">×</button>
      </div>
      
      ${Object.entries(spellsByLevel)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([level, spells]) => this.renderSpellLevel(level, spells))
        .join('')}
    `

    const closeBtn = document.getElementById('close-spell-book')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide())
    }

    // Add spell click handlers
    this.container.querySelectorAll('.spell-entry').forEach(entry => {
      entry.addEventListener('click', (e) => {
        const spellName = (e.currentTarget as HTMLElement).dataset.spell
        if (spellName) this.showSpellDetails(spellName)
      })
    })
  }

  private groupSpellsByLevel(): Record<string, Spell[]> {
    const grouped: Record<string, Spell[]> = {}
    
    Object.values(this.spells).forEach(spell => {
      const levels = Object.values(spell.level)
      const minLevel = Math.min(...levels)
      
      if (!grouped[minLevel]) grouped[minLevel] = []
      grouped[minLevel].push(spell)
    })
    
    return grouped
  }

  private renderSpellLevel(level: string, spells: Spell[]): string {
    return `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #fff; border-bottom: 1px solid #333; padding-bottom: 4px;">
          Level ${level} (${spells.length})
        </h4>
        ${spells.map(spell => `
          <div class="spell-entry" data-spell="${spell.name}" style="
            padding: 6px 8px; 
            margin-bottom: 4px; 
            background: rgba(0,0,0,0.2); 
            border-radius: 3px; 
            cursor: pointer;
            border-left: 3px solid ${this.getSchoolColor(spell.school)};
          ">
            <div style="font-weight: bold;">${spell.name}</div>
            <div style="font-size: 11px; color: #aaa;">${spell.school} • ${spell.castingTime}</div>
          </div>
        `).join('')}
      </div>
    `
  }

  private getSchoolColor(school: string): string {
    const colors: Record<string, string> = {
      'abjuration': '#4a90e2',
      'conjuration': '#7ed321',
      'divination': '#f5a623',
      'enchantment': '#d0021b',
      'evocation': '#e94b3c',
      'illusion': '#9013fe',
      'necromancy': '#50e3c2',
      'transmutation': '#bd10e0'
    }
    return colors[school] || '#888'
  }

  private showSpellDetails(spellName: string) {
    const spell = this.spells[spellName]
    if (!spell) return

    // Create modal or tooltip with spell details
    console.log('Showing spell details for:', spell.name)
    // For now, just log - could implement a detailed modal later
  }
}

// Combat Log Enhancement
export class CombatLog {
  private container: HTMLElement
  private logs: string[] = []

  constructor(parent: HTMLElement) {
    this.container = document.getElementById('combat-log') || this.createContainer(parent)
  }

  private createContainer(parent: HTMLElement): HTMLElement {
    const log = document.createElement('div')
    log.id = 'combat-log'
    log.style.cssText = `
      position: fixed;
      bottom: 8px;
      left: 8px;
      width: 300px;
      max-height: 160px;
      background: rgba(20,25,30,0.95);
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 10px;
      color: #e5e7eb;
      overflow-y: auto;
      font-family: 'Segoe UI', system-ui, Arial, sans-serif;
      font-size: 11px;
      z-index: 950;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    `
    parent.appendChild(log)
    return log
  }

  addMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const colorMap = {
      info: '#ddd',
      success: '#7ed321',
      warning: '#f5a623',
      error: '#e94b3c'
    }
    
    this.logs.push(message)
    if (this.logs.length > 50) this.logs.shift() // Keep last 50 messages
    
    const logEntry = document.createElement('div')
    logEntry.style.color = colorMap[type]
    logEntry.style.marginBottom = '2px'
    logEntry.innerHTML = `<span style="color: #999">[${timestamp}]</span> ${message}`
    
    this.container.appendChild(logEntry)
    this.container.scrollTop = this.container.scrollHeight
  }

  clear() {
    this.logs = []
    this.container.innerHTML = ''
  }
}

// UI Manager - coordinates all UI components
export class UIManager {
  characterSheet: CharacterSheetUI
  spellBook: SpellBookUI
  combatLog: CombatLog
  characterCreation: CharacterCreationUI
  toolbar: Toolbar

  constructor(parent: HTMLElement) {
    this.characterSheet = new CharacterSheetUI(parent)
    this.spellBook = new SpellBookUI(parent)
    this.combatLog = new CombatLog(parent)
    this.characterCreation = new CharacterCreationUI(parent)
    this.toolbar = new Toolbar(parent, this)
    
    this.setupKeyboardShortcuts()
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' && !e.ctrlKey && !e.altKey) {
        this.characterSheet.toggle()
      }
      if (e.key === 's' && !e.ctrlKey && !e.altKey) {
        this.spellBook.toggle()
      }
      if (e.key === 'n' && !e.ctrlKey && !e.altKey) {
        this.characterCreation.show((character) => {
          this.characterSheet.setCharacter(character)
          this.combatLog.addMessage(`Created new character: ${character.name}`)
        })
      }
      if (e.key === 'Escape') {
        this.characterSheet.hide()
        this.spellBook.hide()
        this.characterCreation.hide()
      }
    })
  }
}
