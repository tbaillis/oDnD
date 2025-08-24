import { monsterService } from './service'
import type { MonsterData } from './types'

// Monster selection UI for choosing Pawn B creature
export class MonsterSelectionUI {
  private container: HTMLElement | null = null
  private searchInput: HTMLInputElement | null = null
  private monsterList: HTMLElement | null = null
  private selectedMonster: MonsterData | null = null
  private onSelectionCallback: ((monster: MonsterData) => void) | null = null

  /**
   * Initialize the monster selection UI
   */
  init(containerId: string): void {
    this.container = document.getElementById(containerId)
    if (!this.container) {
      throw new Error(`Container with ID '${containerId}' not found`)
    }

    this.createUI()
    this.populateMonsterList()
  }

  /**
   * Set callback for when a monster is selected
   */
  onMonsterSelected(callback: (monster: MonsterData) => void): void {
    this.onSelectionCallback = callback
  }

  /**
   * Create the UI elements
   */
  private createUI(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="monster-selection">
        <div class="monster-controls">
          <div class="monster-header">
            <h3>Select Monster for Pawn B</h3>
            <button id="close-monster-selection" class="close-button" title="Close">×</button>
          </div>
          <div class="search-bar">
            <input type="text" id="monster-search" placeholder="Search monsters..." />
            <button id="random-monster">Random</button>
            <button id="random-by-cr">Random (CR ≤ 5)</button>
          </div>
          <div class="filter-options">
            <select id="type-filter">
              <option value="">All Types</option>
              <option value="Humanoid">Humanoid</option>
              <option value="Beast">Beast</option>
              <option value="Undead">Undead</option>
              <option value="Giant">Giant</option>
              <option value="Magical Beast">Magical Beast</option>
              <option value="Monstrous Humanoid">Monstrous Humanoid</option>
              <option value="Animal">Animal</option>
            </select>
            <select id="size-filter">
              <option value="">All Sizes</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Huge">Huge</option>
            </select>
            <select id="cr-filter">
              <option value="">All CRs</option>
              <option value="0.25">1/4</option>
              <option value="0.33">1/3</option>
              <option value="0.5">1/2</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>
        <div class="monster-list-container">
          <div id="monster-list" class="monster-list"></div>
        </div>
        <div class="selected-monster">
          <div id="monster-details" class="monster-details">
            <p>No monster selected</p>
          </div>
        </div>
      </div>
    `

    // Add event listeners
    this.addEventListeners()
  }

  /**
   * Add event listeners to UI elements
   */
  private addEventListeners(): void {
    if (!this.container) return

    // Close button
    const closeBtn = this.container.querySelector('#close-monster-selection')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Call the global toggle function to close
        if (typeof (window as any).toggleMonsterSelectionUI === 'function') {
          ;(window as any).toggleMonsterSelectionUI()
        }
      })
    }

    // Search functionality
    this.searchInput = this.container.querySelector('#monster-search') as HTMLInputElement
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.handleSearch())
    }

    // Random selection buttons
    const randomBtn = this.container.querySelector('#random-monster')
    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.selectRandomMonster())
    }

    const randomCRBtn = this.container.querySelector('#random-by-cr')
    if (randomCRBtn) {
      randomCRBtn.addEventListener('click', () => this.selectRandomMonsterByCR())
    }

    // Filter dropdowns
    const typeFilter = this.container.querySelector('#type-filter') as HTMLSelectElement
    const sizeFilter = this.container.querySelector('#size-filter') as HTMLSelectElement
    const crFilter = this.container.querySelector('#cr-filter') as HTMLSelectElement

    if (typeFilter) typeFilter.addEventListener('change', () => this.applyFilters())
    if (sizeFilter) sizeFilter.addEventListener('change', () => this.applyFilters())
    if (crFilter) crFilter.addEventListener('change', () => this.applyFilters())

    this.monsterList = this.container.querySelector('#monster-list')
  }

  /**
   * Handle search input
   */
  private handleSearch(): void {
    const query = this.searchInput?.value || ''
    const results = query ? monsterService.searchMonsters(query) : monsterService.getAllMonsters()
    this.displayMonsters(results)
  }

  /**
   * Apply selected filters
   */
  private applyFilters(): void {
    if (!this.container) return

    const typeFilter = this.container.querySelector('#type-filter') as HTMLSelectElement
    const sizeFilter = this.container.querySelector('#size-filter') as HTMLSelectElement
    const crFilter = this.container.querySelector('#cr-filter') as HTMLSelectElement

    const filters = {
      type: typeFilter?.value as MonsterData['type'] || undefined,
      size: sizeFilter?.value as MonsterData['size'] || undefined,
      maxCR: crFilter?.value ? parseFloat(crFilter.value) : undefined
    }

    const allMonsters = monsterService.getAllMonsters()
    const filtered = allMonsters.filter(monster => {
      if (filters.type && monster.type !== filters.type) return false
      if (filters.size && monster.size !== filters.size) return false
      if (filters.maxCR) {
        const cr = typeof monster.challengeRating === 'string' 
          ? parseFloat(monster.challengeRating) || 0.25
          : monster.challengeRating
        if (cr > filters.maxCR) return false
      }
      return true
    })

    this.displayMonsters(filtered)
  }

  /**
   * Populate the initial monster list
   */
  private populateMonsterList(): void {
    const monsters = monsterService.getAllMonsters()
    this.displayMonsters(monsters)
  }

  /**
   * Display monsters in the list
   */
  private displayMonsters(monsters: MonsterData[]): void {
    if (!this.monsterList) return

    this.monsterList.innerHTML = monsters.map(monster => `
      <div class="monster-item" data-monster-id="${monster.id}">
        <div class="monster-basic-info">
          <h4>${monster.name}</h4>
          <div class="monster-meta">
            <span class="monster-type">${monster.size} ${monster.type}</span>
            <span class="monster-cr">CR ${monster.challengeRating}</span>
          </div>
        </div>
        <div class="monster-stats">
          <div class="hp">HP: ${monster.hitPoints.average}</div>
          <div class="ac">AC: ${monster.armorClass.total}</div>
          <div class="speed">Speed: ${monster.speed.land} ft</div>
        </div>
      </div>
    `).join('')

    // Add click listeners to monster items
    const monsterItems = this.monsterList.querySelectorAll('.monster-item')
    monsterItems.forEach(item => {
      item.addEventListener('click', () => {
        const monsterId = item.getAttribute('data-monster-id')
        if (monsterId) {
          this.selectMonster(monsterId)
        }
      })
    })
  }

  /**
   * Select a specific monster
   */
  private selectMonster(monsterId: string): void {
    const monster = monsterService.setMonster(monsterId)
    if (monster) {
      this.selectedMonster = monster
      this.displayMonsterDetails(monster)
      this.updateSelectedDisplay()
      
      if (this.onSelectionCallback) {
        this.onSelectionCallback(monster)
      }
    }
  }

  /**
   * Select a random monster
   */
  private selectRandomMonster(): void {
    const monster = monsterService.selectRandomMonster()
    this.selectedMonster = monster
    this.displayMonsterDetails(monster)
    this.updateSelectedDisplay()
    
    if (this.onSelectionCallback) {
      this.onSelectionCallback(monster)
    }
  }

  /**
   * Select a random monster with CR constraint
   */
  private selectRandomMonsterByCR(): void {
    const monster = monsterService.selectRandomMonsterByCR(5)
    this.selectedMonster = monster
    this.displayMonsterDetails(monster)
    this.updateSelectedDisplay()
    
    if (this.onSelectionCallback) {
      this.onSelectionCallback(monster)
    }
  }

  /**
   * Update visual indication of selected monster
   */
  private updateSelectedDisplay(): void {
    if (!this.monsterList || !this.selectedMonster) return

    // Remove previous selection highlighting
    const prevSelected = this.monsterList.querySelector('.monster-item.selected')
    if (prevSelected) {
      prevSelected.classList.remove('selected')
    }

    // Highlight new selection
    const selectedItem = this.monsterList.querySelector(`[data-monster-id="${this.selectedMonster.id}"]`)
    if (selectedItem) {
      selectedItem.classList.add('selected')
    }
  }

  /**
   * Display detailed information about selected monster
   */
  private displayMonsterDetails(monster: MonsterData): void {
    if (!this.container) return

    const detailsContainer = this.container.querySelector('#monster-details')
    if (!detailsContainer) return

    detailsContainer.innerHTML = `
      <div class="monster-detail-card">
        <h3>${monster.name}</h3>
        <div class="monster-type-line">
          ${monster.size} ${monster.type}${monster.subtype ? ` (${monster.subtype.join(', ')})` : ''}, ${monster.alignment}
        </div>
        
        <div class="monster-combat-stats">
          <div class="stat-block">
            <div class="stat-line"><strong>Hit Points:</strong> ${monster.hitPoints.average} (${monster.hitPoints.roll})</div>
            <div class="stat-line"><strong>Armor Class:</strong> ${monster.armorClass.total} (touch ${monster.armorClass.touch}, flat-footed ${monster.armorClass.flatFooted})</div>
            <div class="stat-line"><strong>Speed:</strong> ${monster.speed.land} ft</div>
            <div class="stat-line"><strong>Challenge Rating:</strong> ${monster.challengeRating}</div>
          </div>
          
          <div class="abilities-block">
            <div class="abilities-line">
              <span><strong>STR</strong> ${monster.abilities.STR}</span>
              <span><strong>DEX</strong> ${monster.abilities.DEX}</span>
              <span><strong>CON</strong> ${monster.abilities.CON}</span>
              <span><strong>INT</strong> ${monster.abilities.INT}</span>
              <span><strong>WIS</strong> ${monster.abilities.WIS}</span>
              <span><strong>CHA</strong> ${monster.abilities.CHA}</span>
            </div>
          </div>
          
          <div class="saves-attacks">
            <div class="stat-line"><strong>Saves:</strong> Fort +${monster.saves.fortitude}, Ref +${monster.saves.reflex}, Will +${monster.saves.will}</div>
            ${monster.attacks && monster.attacks.length > 0 ? `
              <div class="stat-line"><strong>Attacks:</strong> ${monster.attacks.map(a => `${a.name} ${a.attackBonus >= 0 ? '+' : ''}${a.attackBonus} (${a.damage})`).join(', ')}</div>
            ` : ''}
          </div>
          
          ${monster.specialAttacks && monster.specialAttacks.length > 0 ? `
            <div class="special-abilities">
              <div class="stat-line"><strong>Special Attacks:</strong></div>
              ${monster.specialAttacks.map(sa => `
                <div class="ability-detail"><strong>${sa.name} (${sa.type}):</strong> ${sa.description}</div>
              `).join('')}
            </div>
          ` : ''}
          
          ${monster.specialQualities && monster.specialQualities.length > 0 ? `
            <div class="special-qualities">
              <div class="stat-line"><strong>Special Qualities:</strong></div>
              ${monster.specialQualities.map(sq => `
                <div class="ability-detail"><strong>${sq.name} (${sq.type}):</strong> ${sq.description}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  /**
   * Get the currently selected monster
   */
  getSelectedMonster(): MonsterData | null {
    return this.selectedMonster
  }

  /**
   * Show/hide the UI
   */
  setVisible(visible: boolean): void {
    if (this.container) {
      this.container.style.display = visible ? 'block' : 'none'
    }
  }
}

// Export singleton instance
export const monsterSelectionUI = new MonsterSelectionUI()
