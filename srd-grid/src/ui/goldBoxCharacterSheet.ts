import type { Character } from '../game/character'

/**
 * Gold Box style character sheet interface
 * Provides comprehensive character editing following D&D 3.5 SRD standards
 */
export class GoldBoxCharacterSheet {
  private character: Character | null = null
  private characterId: string | null = null
  private isVisible = false
  private container: HTMLElement | null = null
  private currentTokenUrl: string = ''
  private currentTokenName: string = ''
  private mappedPawnId: string | null = null

  constructor() {
    this.createCharacterSheet()
  }

  private createCharacterSheet(): void {
    this.container = document.createElement('div')
    this.container.className = 'gold-box-character-sheet'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 10000;
      font-family: 'Courier New', monospace;
      color: #0080FF;
    `

    const sheet = document.createElement('div')
    sheet.className = 'character-sheet-content'
    sheet.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 1000px;
      height: 90%;
      background: #000;
      border: 3px solid #0080FF;
      border-radius: 8px;
      overflow-y: auto;
      padding: 20px;
      box-shadow: 0 0 20px rgba(0, 128, 255, 0.5);
    `

    sheet.innerHTML = this.getCharacterSheetHTML()
    this.container.appendChild(sheet)
    document.body.appendChild(this.container)

    this.setupEventHandlers()
  }

  private getCharacterSheetHTML(): string {
    return `
      <div class="character-sheet-header">
        <h2 style="color: #FFFF00; text-align: center; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
          CHARACTER SHEET
        </h2>
        <button class="close-button" style="
          position: absolute;
          top: 10px;
          right: 15px;
          background: #FF0000;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          padding: 5px 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">CLOSE</button>
      </div>

      <div class="character-sheet-grid" style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        height: calc(100% - 80px);
      ">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Basic Info -->
          <div class="basic-info section">
            <h3 class="section-title">BASIC INFORMATION</h3>
            <div class="form-grid">
              <label>Name: <input type="text" class="char-name" /></label>
              <label>Class: <input type="text" class="char-class" /></label>
              <label>Level: <input type="number" class="char-level" min="1" max="20" /></label>
              <label>Race: <input type="text" class="char-race" /></label>
              <label>Alignment: <select class="char-alignment">
                <option value="LG">Lawful Good</option>
                <option value="NG">Neutral Good</option>
                <option value="CG">Chaotic Good</option>
                <option value="LN">Lawful Neutral</option>
                <option value="TN">True Neutral</option>
                <option value="CN">Chaotic Neutral</option>
                <option value="LE">Lawful Evil</option>
                <option value="NE">Neutral Evil</option>
                <option value="CE">Chaotic Evil</option>
              </select></label>
              <label>Experience: <input type="number" class="char-experience" /></label>
            </div>
          </div>

          <!-- Token Selection -->
          <div class="token-selection section">
            <h3 class="section-title">PAWN TOKEN</h3>
            <div class="token-selector">
              <div class="current-token-preview">
                <img class="token-preview-image" style="
                  width: 64px;
                  height: 64px;
                  border: 2px solid #0080FF;
                  border-radius: 4px;
                  object-fit: cover;
                  background: #111;
                " alt="Current token" />
                <div class="token-info" style="
                  color: #0080FF;
                  font-size: 11px;
                  margin-top: 4px;
                  text-align: center;
                ">
                  <div class="token-name">No token</div>
                  <div class="pawn-mapping">Not mapped</div>
                </div>
              </div>
              <div class="token-controls" style="
                display: flex;
                gap: 8px;
                margin-top: 8px;
                flex-wrap: wrap;
              ">
                <button type="button" class="change-token-btn" style="
                  background: #0080FF;
                  color: #000;
                  border: 1px solid #0080FF;
                  padding: 6px 12px;
                  cursor: pointer;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: bold;
                ">Change Token</button>
                <button type="button" class="map-to-pawn-btn" style="
                  background: #16a34a;
                  color: #fff;
                  border: 1px solid #16a34a;
                  padding: 6px 12px;
                  cursor: pointer;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: bold;
                ">Map to Pawn</button>
              </div>
            </div>
          </div>

          <!-- Ability Scores -->
          <div class="ability-scores section">
            <h3 class="section-title">ABILITY SCORES</h3>
            <div class="ability-grid">
              <div class="ability">
                <label>STR: <input type="number" class="ability-str" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
              <div class="ability">
                <label>DEX: <input type="number" class="ability-dex" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
              <div class="ability">
                <label>CON: <input type="number" class="ability-con" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
              <div class="ability">
                <label>INT: <input type="number" class="ability-int" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
              <div class="ability">
                <label>WIS: <input type="number" class="ability-wis" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
              <div class="ability">
                <label>CHA: <input type="number" class="ability-cha" min="3" max="25" /></label>
                <span class="modifier">+0</span>
              </div>
            </div>
          </div>

          <!-- Combat Stats -->
          <div class="combat-stats section">
            <h3 class="section-title">COMBAT STATISTICS</h3>
            <div class="combat-grid">
              <label>Hit Points: <input type="number" class="combat-hp" /></label>
              <label>Max HP: <input type="number" class="combat-max-hp" /></label>
              <label>Armor Class: <input type="number" class="combat-ac" /></label>
              <label>Touch AC: <input type="number" class="combat-touch-ac" /></label>
              <label>Flat-Footed AC: <input type="number" class="combat-ff-ac" /></label>
              <label>Initiative: <input type="number" class="combat-init" /></label>
              <label>Base Attack: <input type="text" class="combat-bab" /></label>
              <label>Grapple: <input type="number" class="combat-grapple" /></label>
            </div>
          </div>

          <!-- Saving Throws -->
          <div class="saves section">
            <h3 class="section-title">SAVING THROWS</h3>
            <div class="saves-grid">
              <label>Fortitude: <input type="number" class="save-fort" /></label>
              <label>Reflex: <input type="number" class="save-ref" /></label>
              <label>Will: <input type="number" class="save-will" /></label>
            </div>
          </div>

          <!-- Skills -->
          <div class="skills section">
            <h3 class="section-title">SKILLS</h3>
            <div class="skills-container">
              <div class="skill-entry">
                <label>Appraise (Int): <input type="number" class="skill-appraise" /></label>
              </div>
              <div class="skill-entry">
                <label>Balance (Dex): <input type="number" class="skill-balance" /></label>
              </div>
              <div class="skill-entry">
                <label>Bluff (Cha): <input type="number" class="skill-bluff" /></label>
              </div>
              <div class="skill-entry">
                <label>Climb (Str): <input type="number" class="skill-climb" /></label>
              </div>
              <div class="skill-entry">
                <label>Concentration (Con): <input type="number" class="skill-concentration" /></label>
              </div>
              <div class="skill-entry">
                <label>Diplomacy (Cha): <input type="number" class="skill-diplomacy" /></label>
              </div>
              <div class="skill-entry">
                <label>Disable Device (Int): <input type="number" class="skill-disable-device" /></label>
              </div>
              <div class="skill-entry">
                <label>Escape Artist (Dex): <input type="number" class="skill-escape-artist" /></label>
              </div>
              <div class="skill-entry">
                <label>Hide (Dex): <input type="number" class="skill-hide" /></label>
              </div>
              <div class="skill-entry">
                <label>Intimidate (Cha): <input type="number" class="skill-intimidate" /></label>
              </div>
              <div class="skill-entry">
                <label>Jump (Str): <input type="number" class="skill-jump" /></label>
              </div>
              <div class="skill-entry">
                <label>Listen (Wis): <input type="number" class="skill-listen" /></label>
              </div>
              <div class="skill-entry">
                <label>Move Silently (Dex): <input type="number" class="skill-move-silently" /></label>
              </div>
              <div class="skill-entry">
                <label>Open Lock (Dex): <input type="number" class="skill-open-lock" /></label>
              </div>
              <div class="skill-entry">
                <label>Search (Int): <input type="number" class="skill-search" /></label>
              </div>
              <div class="skill-entry">
                <label>Sense Motive (Wis): <input type="number" class="skill-sense-motive" /></label>
              </div>
              <div class="skill-entry">
                <label>Spot (Wis): <input type="number" class="skill-spot" /></label>
              </div>
              <div class="skill-entry">
                <label>Survival (Wis): <input type="number" class="skill-survival" /></label>
              </div>
              <div class="skill-entry">
                <label>Tumble (Dex): <input type="number" class="skill-tumble" /></label>
              </div>
              <div class="skill-entry">
                <label>Use Magic Device (Cha): <input type="number" class="skill-umd" /></label>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Weapons -->
          <div class="weapons section">
            <h3 class="section-title">WEAPONS</h3>
            <div class="weapon-list">
              <div class="weapon-entry">
                <label>Weapon 1: <input type="text" class="weapon-1-name" placeholder="Weapon Name" /></label>
                <label>Attack: <input type="text" class="weapon-1-attack" placeholder="+5" /></label>
                <label>Damage: <input type="text" class="weapon-1-damage" placeholder="1d8+3" /></label>
                <label>Critical: <input type="text" class="weapon-1-crit" placeholder="19-20/x2" /></label>
                <label>Range: <input type="text" class="weapon-1-range" placeholder="20 ft" /></label>
              </div>
              <div class="weapon-entry">
                <label>Weapon 2: <input type="text" class="weapon-2-name" placeholder="Weapon Name" /></label>
                <label>Attack: <input type="text" class="weapon-2-attack" placeholder="+5" /></label>
                <label>Damage: <input type="text" class="weapon-2-damage" placeholder="1d8+3" /></label>
                <label>Critical: <input type="text" class="weapon-2-crit" placeholder="19-20/x2" /></label>
                <label>Range: <input type="text" class="weapon-2-range" placeholder="20 ft" /></label>
              </div>
              <div class="weapon-entry">
                <label>Weapon 3: <input type="text" class="weapon-3-name" placeholder="Weapon Name" /></label>
                <label>Attack: <input type="text" class="weapon-3-attack" placeholder="+5" /></label>
                <label>Damage: <input type="text" class="weapon-3-damage" placeholder="1d8+3" /></label>
                <label>Critical: <input type="text" class="weapon-3-crit" placeholder="19-20/x2" /></label>
                <label>Range: <input type="text" class="weapon-3-range" placeholder="20 ft" /></label>
              </div>
            </div>
          </div>

          <!-- Armor -->
          <div class="armor section">
            <h3 class="section-title">ARMOR & PROTECTIVE ITEMS</h3>
            <div class="armor-list">
              <div class="armor-entry">
                <label>Armor: <input type="text" class="armor-name" placeholder="Armor Type" /></label>
                <label>AC Bonus: <input type="number" class="armor-ac" /></label>
                <label>Max Dex: <input type="number" class="armor-max-dex" /></label>
                <label>Check Penalty: <input type="number" class="armor-penalty" /></label>
                <label>Spell Failure: <input type="text" class="armor-spell-failure" placeholder="15%" /></label>
              </div>
              <div class="armor-entry">
                <label>Shield: <input type="text" class="shield-name" placeholder="Shield Type" /></label>
                <label>AC Bonus: <input type="number" class="shield-ac" /></label>
                <label>Check Penalty: <input type="number" class="shield-penalty" /></label>
                <label>Spell Failure: <input type="text" class="shield-spell-failure" placeholder="5%" /></label>
              </div>
            </div>
          </div>

          <!-- Feats -->
          <div class="feats section">
            <h3 class="section-title">FEATS</h3>
            <textarea class="feats-text" placeholder="List character feats here..." style="
              width: 100%;
              height: 120px;
              background: #111;
              color: #0080FF;
              border: 1px solid #333;
              padding: 8px;
              font-family: inherit;
              resize: vertical;
            "></textarea>
          </div>

          <!-- Equipment & Items -->
          <div class="equipment section">
            <h3 class="section-title">EQUIPMENT & ITEMS</h3>
            <textarea class="equipment-text" placeholder="List equipment, magic items, and other gear here..." style="
              width: 100%;
              height: 120px;
              background: #111;
              color: #0080FF;
              border: 1px solid #333;
              padding: 8px;
              font-family: inherit;
              resize: vertical;
            "></textarea>
          </div>

          <!-- Money -->
          <div class="money section">
            <h3 class="section-title">MONEY</h3>
            <div class="money-grid">
              <label>Platinum: <input type="number" class="money-pp" min="0" /></label>
              <label>Gold: <input type="number" class="money-gp" min="0" /></label>
              <label>Silver: <input type="number" class="money-sp" min="0" /></label>
              <label>Copper: <input type="number" class="money-cp" min="0" /></label>
            </div>
          </div>

          <!-- Notes -->
          <div class="notes section">
            <h3 class="section-title">NOTES</h3>
            <textarea class="notes-text" placeholder="Character notes, background, special abilities, etc..." style="
              width: 100%;
              height: 150px;
              background: #111;
              color: #0080FF;
              border: 1px solid #333;
              padding: 8px;
              font-family: inherit;
              resize: vertical;
            "></textarea>
          </div>
        </div>
      </div>

      <div class="character-sheet-footer" style="
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
      ">
        <button class="save-button" style="
          background: #0080FF;
          color: #000000;
          border: 2px solid #FFFFFF;
          padding: 10px 20px;
          margin: 0 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">SAVE CHANGES</button>
        <button class="cancel-button" style="
          background: #FF0000;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          padding: 10px 20px;
          margin: 0 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">CANCEL</button>
      </div>
    `
  }

  private setupEventHandlers(): void {
    if (!this.container) return

    // Close button handler
    const closeButton = this.container.querySelector('.close-button')
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide()
      })
    }

    // Save button handler
    const saveButton = this.container.querySelector('.save-button')
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveCharacter()
      })
    }

    // Cancel button handler
    const cancelButton = this.container.querySelector('.cancel-button')
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.hide()
      })
    }

    // Escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide()
      }
    })

    // Click outside to close
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.hide()
      }
    })

    // Setup ability score modifier calculation
    this.setupAbilityModifiers()

    // Setup token selection handlers
    this.setupTokenSelection()

    // Style all form elements
    this.styleFormElements()
  }

  private setupAbilityModifiers(): void {
    if (!this.container) return

    const abilityInputs = this.container.querySelectorAll('[class*="ability-"]')
    
    abilityInputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener('input', () => {
          const value = parseInt(input.value) || 10
          const modifier = Math.floor((value - 10) / 2)
          const modifierElement = input.parentElement?.querySelector('.modifier')
          if (modifierElement) {
            modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`
          }
        })
      }
    })
  }

  private setupTokenSelection(): void {
    if (!this.container) return

    // Change token button handler
    const changeTokenBtn = this.container.querySelector('.change-token-btn')
    if (changeTokenBtn) {
      changeTokenBtn.addEventListener('click', () => {
        this.showTokenSelector()
      })
    }

    // Map to pawn button handler
    const mapToPawnBtn = this.container.querySelector('.map-to-pawn-btn')
    if (mapToPawnBtn) {
      mapToPawnBtn.addEventListener('click', () => {
        this.showPawnMapper()
      })
    }

    // Initialize token preview
    this.updateTokenPreview()
  }

  private updateTokenPreview(): void {
    if (!this.container) return

    const previewImage = this.container.querySelector('.token-preview-image') as HTMLImageElement
    const tokenName = this.container.querySelector('.token-name')
    const pawnMapping = this.container.querySelector('.pawn-mapping')

    if (previewImage) {
      previewImage.src = this.currentTokenUrl || '/src/assets/pawns/pawnA.svg'
      previewImage.alt = this.currentTokenName || 'Default token'
    }

    if (tokenName) {
      tokenName.textContent = this.currentTokenName || 'Default Token'
    }

    if (pawnMapping) {
      pawnMapping.textContent = this.mappedPawnId ? `Mapped to Pawn ${this.mappedPawnId}` : 'Not mapped to board'
    }
  }

  private showTokenSelector(): void {
    // Create token selection modal
    const modal = document.createElement('div')
    modal.className = 'token-selector-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      font-family: 'Courier New', monospace;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: #000;
      border: 3px solid #0080FF;
      border-radius: 8px;
      padding: 20px;
      width: 90%;
      max-width: 800px;
      max-height: 80%;
      overflow-y: auto;
      color: #0080FF;
    `

    content.innerHTML = `
      <h3 style="color: #FFFF00; text-align: center; margin-bottom: 20px;">SELECT TOKEN</h3>
      <div class="token-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      "></div>
      <div style="text-align: center;">
        <button class="close-token-selector" style="
          background: #FF0000;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          padding: 10px 20px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">CANCEL</button>
      </div>
    `

    // Get available tokens from window
    const availableTokens = (window as any).availableTokens || []
    const tokenGrid = content.querySelector('.token-grid')

    if (tokenGrid) {
      availableTokens.forEach((token: any) => {
        const tokenButton = document.createElement('div')
        tokenButton.className = 'token-option'
        tokenButton.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          border: 2px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.2s;
        `

        tokenButton.innerHTML = `
          <img src="${token.url}" style="
            width: 64px;
            height: 64px;
            object-fit: cover;
            border-radius: 4px;
          " alt="${token.name}" />
          <div style="
            font-size: 10px;
            margin-top: 5px;
            text-align: center;
            word-break: break-word;
          ">${token.name}</div>
        `

        tokenButton.addEventListener('mouseenter', () => {
          tokenButton.style.borderColor = '#0080FF'
        })

        tokenButton.addEventListener('mouseleave', () => {
          tokenButton.style.borderColor = '#333'
        })

        tokenButton.addEventListener('click', () => {
          this.currentTokenUrl = token.url
          this.currentTokenName = token.name
          this.updateTokenPreview()
          document.body.removeChild(modal)
        })

        tokenGrid.appendChild(tokenButton)
      })
    }

    // Close button handler
    const closeBtn = content.querySelector('.close-token-selector')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal)
      })
    }

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })

    modal.appendChild(content)
    document.body.appendChild(modal)
  }

  private showPawnMapper(): void {
    // Create pawn mapping modal
    const modal = document.createElement('div')
    modal.className = 'pawn-mapper-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      font-family: 'Courier New', monospace;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: #000;
      border: 3px solid #16a34a;
      border-radius: 8px;
      padding: 20px;
      width: 500px;
      color: #0080FF;
    `

    content.innerHTML = `
      <h3 style="color: #FFFF00; text-align: center; margin-bottom: 20px;">MAP TO PAWN</h3>
      <p style="margin-bottom: 20px; text-align: center;">
        Select which pawn on the board this character should control:
      </p>
      <div class="pawn-options" style="
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      ">
        <button class="pawn-option" data-pawn="A" style="
          background: #5aa9e6;
          color: #000;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn A</button>
        <button class="pawn-option" data-pawn="M1" style="
          background: #e65a5a;
          color: #fff;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn M1</button>
        <button class="pawn-option" data-pawn="C" style="
          background: #6d28d9;
          color: #fff;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn C</button>
        <button class="pawn-option" data-pawn="D" style="
          background: #9333ea;
          color: #fff;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn D</button>
        <button class="pawn-option" data-pawn="E" style="
          background: #059669;
          color: #fff;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn E</button>
        <button class="pawn-option" data-pawn="F" style="
          background: #f59e0b;
          color: #000;
          border: none;
          padding: 15px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        ">Pawn F</button>
      </div>
      <div style="text-align: center;">
        <button class="close-pawn-mapper" style="
          background: #FF0000;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          padding: 10px 20px;
          margin: 0 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">CANCEL</button>
        <button class="clear-mapping" style="
          background: #6b7280;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          padding: 10px 20px;
          margin: 0 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
        ">CLEAR MAPPING</button>
      </div>
    `

    // Pawn option handlers
    const pawnOptions = content.querySelectorAll('.pawn-option')
    pawnOptions.forEach(option => {
      option.addEventListener('click', () => {
        const pawnId = (option as HTMLElement).dataset.pawn
        if (pawnId) {
          this.mappedPawnId = pawnId
          this.applyCharacterToPawn(pawnId)
          this.updateTokenPreview()
          document.body.removeChild(modal)
        }
      })
    })

    // Close button handler
    const closeBtn = content.querySelector('.close-pawn-mapper')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal)
      })
    }

    // Clear mapping button handler
    const clearBtn = content.querySelector('.clear-mapping')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.mappedPawnId = null
        this.updateTokenPreview()
        document.body.removeChild(modal)
      })
    }

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })

    modal.appendChild(content)
    document.body.appendChild(modal)
  }

  private applyCharacterToPawn(pawnId: string): void {
    if (!this.character) return

    // Apply current token to the pawn if we have one
    if (this.currentTokenUrl && (window as any).setPawnTexture) {
      (window as any).setPawnTexture(pawnId, this.currentTokenUrl)
    }

    // Apply character data to the pawn
    const pawn = this.getPawnObject(pawnId)
    if (pawn) {
      // Store character data reference in pawn
      ;(pawn as any).characterData = this.character
      ;(pawn as any).goldBoxId = this.characterId || pawnId.toLowerCase()
      
      // Apply basic stats
      pawn.hp = this.character.hitPoints.current
      const maxHpProperty = `pawn${pawnId}MaxHP`
      if ((window as any)[maxHpProperty] !== undefined) {
        (window as any)[maxHpProperty] = this.character.hitPoints.max
      }

      // Update initiative display and redraw
      if ((window as any).updateInitiativeDisplay) {
        (window as any).updateInitiativeDisplay()
      }
      if ((window as any).drawAll) {
        (window as any).drawAll()
      }

      console.log(`Applied character ${this.character.name} to pawn ${pawnId}`)
    }
  }

  private getPawnObject(pawnId: string): any {
    switch (pawnId) {
      case 'A': return (window as any).pawnA
      case 'M1': return (window as any).pawnM1
      case 'C': return (window as any).pawnC
      case 'D': return (window as any).pawnD
      case 'E': return (window as any).pawnE
      case 'F': return (window as any).pawnF
      default: return null
    }
  }

  private styleFormElements(): void {
    if (!this.container) return

    // Style all inputs, selects, and textareas
    const elements = this.container.querySelectorAll('input, select, textarea')
    
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.cssText += `
          background: #111;
          color: #0080FF;
          border: 1px solid #333;
          padding: 4px 8px;
          font-family: inherit;
          font-size: 14px;
        `
      }
    })

    // Add section styling
    const sections = this.container.querySelectorAll('.section')
    sections.forEach(section => {
      if (section instanceof HTMLElement) {
        section.style.cssText = `
          margin-bottom: 20px;
          padding: 15px;
          border: 2px solid #333;
          border-radius: 4px;
          background: rgba(0, 128, 255, 0.05);
        `
      }
    })

    // Style section titles
    const titles = this.container.querySelectorAll('.section-title')
    titles.forEach(title => {
      if (title instanceof HTMLElement) {
        title.style.cssText = `
          color: #FFFF00;
          font-weight: bold;
          margin: 0 0 15px 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        `
      }
    })

    // Style form grids
    const grids = this.container.querySelectorAll('.form-grid, .combat-grid, .saves-grid, .money-grid')
    grids.forEach(grid => {
      if (grid instanceof HTMLElement) {
        grid.style.cssText = `
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        `
      }
    })

    // Style ability grid
    const abilityGrid = this.container.querySelector('.ability-grid')
    if (abilityGrid instanceof HTMLElement) {
      abilityGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      `
    }

    // Style ability entries
    const abilities = this.container.querySelectorAll('.ability')
    abilities.forEach(ability => {
      if (ability instanceof HTMLElement) {
        ability.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
        `
      }
    })

    // Style modifiers
    const modifiers = this.container.querySelectorAll('.modifier')
    modifiers.forEach(modifier => {
      if (modifier instanceof HTMLElement) {
        modifier.style.cssText = `
          font-weight: bold;
          color: #FFFFFF;
          margin-top: 5px;
        `
      }
    })

    // Style weapon and armor entries
    const weaponEntries = this.container.querySelectorAll('.weapon-entry, .armor-entry')
    weaponEntries.forEach(entry => {
      if (entry instanceof HTMLElement) {
        entry.style.cssText = `
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #555;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.3);
        `
      }
    })
  }

  private saveCharacter(): void {
    if (!this.character || !this.container) return

    // Extract all form data and update character
    const formData = this.extractFormData()
    this.updateCharacterFromForm(formData)
    
    console.log('Character saved:', this.character)
    
    // Emit character update event for synchronization
    this.emitCharacterUpdateEvent()
    
    this.hide()
  }

  private emitCharacterUpdateEvent(): void {
    if (!this.character || !this.characterId) return

    const event = new CustomEvent('character-sheet-updated', {
      detail: {
        characterId: this.characterId,
        character: this.character,
        source: 'character-sheet'
      }
    })
    
    document.dispatchEvent(event)
    console.log('Character sheet update event emitted for:', this.character.name, 'ID:', this.characterId)
  }

  private extractFormData(): Record<string, any> {
    if (!this.container) return {}

    const data: Record<string, any> = {}
    
    // Extract all input values
    const inputs = this.container.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) {
        const className = input.className
        const value = input.type === 'number' ? parseFloat(input.value) || 0 : input.value
        data[className] = value
      }
    })

    return data
  }

  private updateCharacterFromForm(data: Record<string, any>): void {
    if (!this.character) return

    // Update character properties based on form data
    if (data['char-name']) this.character.name = data['char-name']
    
    // Update ability scores
    if (data['ability-str']) this.character.abilityScores.STR = data['ability-str']
    if (data['ability-dex']) this.character.abilityScores.DEX = data['ability-dex']
    if (data['ability-con']) this.character.abilityScores.CON = data['ability-con']
    if (data['ability-int']) this.character.abilityScores.INT = data['ability-int']
    if (data['ability-wis']) this.character.abilityScores.WIS = data['ability-wis']
    if (data['ability-cha']) this.character.abilityScores.CHA = data['ability-cha']

    // Update combat stats
    if (data['combat-hp'] !== undefined) this.character.hitPoints.current = data['combat-hp']
    if (data['combat-max-hp']) this.character.hitPoints.max = data['combat-max-hp']

    console.log('Character updated from form data')
  }

  private populateForm(): void {
    if (!this.character || !this.container) return

    // Populate basic info
    this.setInputValue('char-name', this.character.name)
    // Level and experience are not available in Character interface

    // Populate ability scores
    this.setInputValue('ability-str', this.character.abilityScores.STR)
    this.setInputValue('ability-dex', this.character.abilityScores.DEX)
    this.setInputValue('ability-con', this.character.abilityScores.CON)
    this.setInputValue('ability-int', this.character.abilityScores.INT)
    this.setInputValue('ability-wis', this.character.abilityScores.WIS)
    this.setInputValue('ability-cha', this.character.abilityScores.CHA)

    // Populate combat stats
    this.setInputValue('combat-hp', this.character.hitPoints.current)
    this.setInputValue('combat-max-hp', this.character.hitPoints.max)

    // Trigger modifier calculations
    this.updateAbilityModifiers()

    // Load token information from character/pawn mapping
    this.loadTokenInformation()
  }

  private loadTokenInformation(): void {
    if (!this.character) return

    // Try to find which pawn this character is mapped to
    const pawnIds = ['A', 'M1', 'C', 'D', 'E', 'F']
    
    // First try: use characterId if available and it matches goldBoxId pattern
    if (this.characterId) {
      const pawnIdFromCharId = this.characterId.replace('pawn-', '').toUpperCase()
      if (pawnIds.includes(pawnIdFromCharId)) {
        const pawn = this.getPawnObject(pawnIdFromCharId)
        if (pawn && (pawn as any).characterData) {
          this.mappedPawnId = pawnIdFromCharId
          console.log(`Character ${this.character.name} mapped to pawn ${pawnIdFromCharId} via characterId`)
        }
      }
    }
    
    // Second try: search by character name if not found by ID
    if (!this.mappedPawnId) {
      for (const pawnId of pawnIds) {
        const pawn = this.getPawnObject(pawnId)
        if (pawn && (pawn as any).characterData) {
          // Compare by character name instead of object reference to avoid reference issues
          if ((pawn as any).characterData.name === this.character.name) {
            this.mappedPawnId = pawnId
            console.log(`Character ${this.character.name} found mapped to pawn ${pawnId} via name search`)
            break
          }
        }
      }
    }

    // If we found a mapped pawn, try to get its current token
    if (this.mappedPawnId) {
      // Check if the pawn has a custom token stored
      const pawn = this.getPawnObject(this.mappedPawnId)
      if (pawn && (pawn as any).tokenUrl) {
        this.currentTokenUrl = (pawn as any).tokenUrl
        this.currentTokenName = (pawn as any).tokenName || 'Custom Token'
      } else {
        // Try to determine default token based on pawn ID
        const availableTokens = (window as any).availableTokens || []
        const defaultToken = availableTokens.find((t: any) => 
          t.name.toLowerCase().includes(`pawn${this.mappedPawnId}`.toLowerCase())
        ) || availableTokens[0]
        
        if (defaultToken) {
          this.currentTokenUrl = defaultToken.url
          this.currentTokenName = defaultToken.name
        }
      }
    }

    // Update the token preview with loaded information
    this.updateTokenPreview()
  }

  private setInputValue(className: string, value: any): void {
    if (!this.container) return
    
    const element = this.container.querySelector(`.${className}`)
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
      element.value = value?.toString() || ''
    }
  }

  private updateAbilityModifiers(): void {
    if (!this.container) return

    const abilityMappings = [
      { className: 'ability-str', value: this.character?.abilityScores.STR || 10 },
      { className: 'ability-dex', value: this.character?.abilityScores.DEX || 10 },
      { className: 'ability-con', value: this.character?.abilityScores.CON || 10 },
      { className: 'ability-int', value: this.character?.abilityScores.INT || 10 },
      { className: 'ability-wis', value: this.character?.abilityScores.WIS || 10 },
      { className: 'ability-cha', value: this.character?.abilityScores.CHA || 10 }
    ]

    abilityMappings.forEach(({ className, value }) => {
      const input = this.container?.querySelector(`.${className}`)
      if (input instanceof HTMLInputElement) {
        const modifier = Math.floor((value - 10) / 2)
        const modifierElement = input.parentElement?.querySelector('.modifier')
        if (modifierElement) {
          modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`
        }
      }
    })
  }

  public show(character: Character, characterId?: string): void {
    this.character = character
    this.characterId = characterId || null
    this.isVisible = true
    
    if (this.container) {
      this.container.style.display = 'block'
      this.populateForm()
    }
    
    console.log('Character sheet shown for:', character.name, 'ID:', this.characterId)
  }

  public updateCharacter(character: Character, characterId?: string): void {
    if (!this.isVisible || !character) return
    
    // Only update if it's the same character we're currently displaying
    if (characterId && this.characterId !== characterId) return
    
    this.character = character
    this.populateForm()
    console.log('Character sheet updated externally for:', character.name, 'ID:', characterId)
  }

  public hide(): void {
    this.isVisible = false
    
    if (this.container) {
      this.container.style.display = 'none'
    }
    
    console.log('Character sheet hidden')
  }

  public isShowing(): boolean {
    return this.isVisible
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
    this.character = null
    this.characterId = null
  }
}
