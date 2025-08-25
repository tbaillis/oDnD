import { MonsterAIAgent, type MonsterPersonality } from './monsterAgent';

/**
 * UI component for displaying monster dialogue and controlling the Monster AI toggle
 */
export class MonsterDialogueUI {
  private dialogueContainer: HTMLElement | null = null;
  private messageContainer: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;
  private personalityDisplay: HTMLElement | null = null;
  private isVisible: boolean = false;
  private monsterAI: MonsterAIAgent | null = null;

  constructor() {
    this.createDialogueContainer();
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Monster Dialogue UI...');
      
      // Make sure the UI is properly set up
      if (!this.dialogueContainer) {
        this.createDialogueContainer();
      }

      // Set initial visibility
      this.setVisibility(false);
      
      console.log('✅ Monster Dialogue UI initialized');
    } catch (error) {
      console.error('Failed to initialize Monster Dialogue UI:', error);
    }
  }

  /**
   * Set the monster AI agent reference
   */
  public setMonsterAI(monsterAI: MonsterAIAgent): void {
    this.monsterAI = monsterAI;
    this.updatePersonalityDisplay();
    this.updateToggleState();
  }

  /**
   * Create the dialogue container UI
   */
  private createDialogueContainer(): void {
    // Remove existing container if it exists
    const existingContainer = document.getElementById('monster-dialogue-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create main container
    this.dialogueContainer = document.createElement('div');
    this.dialogueContainer.id = 'monster-dialogue-container';
    this.dialogueContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 800px;
      background-color: rgba(0, 0, 0, 0.9);
      color: #fff;
      border: 2px solid #8B0000;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      display: none;
      transition: all 0.3s ease-in-out;
    `;

    // Create header with personality and toggle
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #444;
    `;

    // Personality display
    this.personalityDisplay = document.createElement('div');
    this.personalityDisplay.style.cssText = `
      font-weight: bold;
      color: #ff6b6b;
      font-size: 12px;
    `;
    this.personalityDisplay.textContent = 'Monster AI: Not Initialized';

    // Toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.style.cssText = `
      background-color: #8B0000;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 11px;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    this.toggleButton.textContent = 'AI: OFF';
    this.toggleButton.addEventListener('click', () => this.toggleMonsterAI());
    this.toggleButton.addEventListener('mouseenter', () => {
      this.toggleButton!.style.backgroundColor = '#A0001A';
    });
    this.toggleButton.addEventListener('mouseleave', () => {
      this.toggleButton!.style.backgroundColor = '#8B0000';
    });

    header.appendChild(this.personalityDisplay);
    header.appendChild(this.toggleButton);

    // Message container
    this.messageContainer = document.createElement('div');
    this.messageContainer.style.cssText = `
      min-height: 60px;
      max-height: 150px;
      overflow-y: auto;
      line-height: 1.4;
      color: #f0f0f0;
    `;

    // Assemble the container
    this.dialogueContainer.appendChild(header);
    this.dialogueContainer.appendChild(this.messageContainer);

    // Add to document
    document.body.appendChild(this.dialogueContainer);

    console.log('Monster dialogue container created');
  }

  /**
   * Show a message from the monster
   */
  public showMessage(message: string, personality?: MonsterPersonality): void {
    if (!message.trim()) return;

    // Update personality display if provided
    if (personality) {
      this.updatePersonalityDisplay(personality);
    }

    // Clear any existing content and show the new message
    if (this.messageContainer) {
      this.messageContainer.innerHTML = '';
      
      // Create message element
      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        margin-bottom: 8px;
        padding: 8px;
        background-color: rgba(139, 0, 0, 0.2);
        border-left: 3px solid #8B0000;
        border-radius: 3px;
      `;
      
      // Add message text with typing effect
      messageElement.innerHTML = `<span style="color: #ff6b6b;">[Monster AI]</span> ${message}`;
      this.messageContainer.appendChild(messageElement);
    }

    // Show the dialogue container
    this.setVisibility(true);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      this.setVisibility(false);
    }, 8000);
  }

  /**
   * Update the personality display
   */
  private updatePersonalityDisplay(personality?: MonsterPersonality): void {
    if (!this.personalityDisplay) return;

    if (personality) {
      this.personalityDisplay.textContent = `Monster AI: ${personality.name}`;
      this.personalityDisplay.style.color = '#ff6b6b';
    } else if (this.monsterAI) {
      const currentPersonality = this.monsterAI.getCurrentPersonality();
      this.personalityDisplay.textContent = `Monster AI: ${currentPersonality.name}`;
      this.personalityDisplay.style.color = '#ff6b6b';
    } else {
      this.personalityDisplay.textContent = 'Monster AI: Not Initialized';
      this.personalityDisplay.style.color = '#666';
    }
  }

  /**
   * Update toggle button state
   */
  private updateToggleState(): void {
    if (!this.toggleButton || !this.monsterAI) return;

    const isEnabled = this.monsterAI.isEnabled();
    this.toggleButton.textContent = isEnabled ? 'AI: ON' : 'AI: OFF';
    this.toggleButton.style.backgroundColor = isEnabled ? '#006400' : '#8B0000';
  }

  /**
   * Toggle monster AI on/off
   */
  private toggleMonsterAI(): void {
    if (!this.monsterAI) {
      console.warn('Monster AI not initialized, cannot toggle');
      return;
    }

    const wasEnabled = this.monsterAI.isEnabled();
    
    if (wasEnabled) {
      this.monsterAI.disable();
      this.showMessage('Monster AI disabled. Manual control active.', this.monsterAI.getCurrentPersonality());
    } else {
      this.monsterAI.enable();
      this.showMessage(`Monster AI enabled. ${this.monsterAI.getCurrentPersonality().name} personality active.`, this.monsterAI.getCurrentPersonality());
    }

    this.updateToggleState();
    console.log(`Monster AI toggled: ${this.monsterAI.isEnabled() ? 'ON' : 'OFF'}`);
  }

  /**
   * Set visibility of the dialogue container
   */
  private setVisibility(visible: boolean): void {
    if (!this.dialogueContainer) return;

    this.isVisible = visible;
    this.dialogueContainer.style.display = visible ? 'block' : 'none';
    
    if (visible) {
      this.dialogueContainer.style.opacity = '0';
      this.dialogueContainer.style.transform = 'translateX(-50%) translateY(20px)';
      
      // Animate in
      setTimeout(() => {
        if (this.dialogueContainer) {
          this.dialogueContainer.style.opacity = '1';
          this.dialogueContainer.style.transform = 'translateX(-50%) translateY(0)';
        }
      }, 10);
    }
  }

  /**
   * Force show the dialogue (useful for testing)
   */
  public show(): void {
    this.setVisibility(true);
  }

  /**
   * Force hide the dialogue
   */
  public hide(): void {
    this.setVisibility(false);
  }

  /**
   * Check if dialogue is currently visible
   */
  public isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    if (this.messageContainer) {
      this.messageContainer.innerHTML = '';
    }
  }

  /**
   * Show a temporary status message
   */
  public showStatus(status: string, duration: number = 3000): void {
    this.showMessage(`Status: ${status}`);
    
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Update personality when monster changes form/type
   */
  public updatePersonality(personality: MonsterPersonality): void {
    this.updatePersonalityDisplay(personality);
  }

  /**
   * Destroy the dialogue UI
   */
  public destroy(): void {
    if (this.dialogueContainer && this.dialogueContainer.parentNode) {
      this.dialogueContainer.parentNode.removeChild(this.dialogueContainer);
    }
    
    this.dialogueContainer = null;
    this.messageContainer = null;
    this.toggleButton = null;
    this.personalityDisplay = null;
    this.monsterAI = null;
  }
}

/**
 * Global instance for easy access
 */
export const monsterDialogueUI = new MonsterDialogueUI();
