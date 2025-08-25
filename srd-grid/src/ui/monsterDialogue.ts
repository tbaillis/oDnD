// Monster Dialogue UI Component
import { monsterAI } from '../ai/monsterAgent.js';

export class MonsterDialogueUI {
  private dialogueElement: HTMLElement | null = null;
  private messageQueue: Array<{ message: string; timestamp: number }> = [];
  private displayDuration = 4000; // 4 seconds
  private currentTimeout: number | null = null;

  constructor() {
    this.createDialogueElement();
  }

  private createDialogueElement(): void {
    // Remove existing element if it exists
    const existing = document.getElementById('monster-dialogue');
    if (existing) {
      existing.remove();
    }

    // Create dialogue container
    this.dialogueElement = document.createElement('div');
    this.dialogueElement.id = 'monster-dialogue';
    this.dialogueElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(40, 30, 30, 0.95));
      border: 2px solid #8b5a2b;
      border-radius: 8px;
      padding: 12px 20px;
      max-width: 600px;
      min-width: 200px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: 500;
      color: #f4f4f4;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      z-index: 1000;
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
      transition: all 0.3s ease-out;
      pointer-events: none;
      backdrop-filter: blur(5px);
    `;

    // Add personality indicator
    const personalityIndicator = document.createElement('div');
    personalityIndicator.id = 'monster-personality';
    personalityIndicator.style.cssText = `
      font-size: 10px;
      color: #a0a0a0;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    this.dialogueElement.appendChild(personalityIndicator);

    // Add message content
    const messageContent = document.createElement('div');
    messageContent.id = 'monster-message';
    messageContent.style.cssText = `
      font-size: 14px;
      line-height: 1.4;
      margin: 0;
    `;
    this.dialogueElement.appendChild(messageContent);

    // Add toggle button (top-right corner)
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🎭';
    toggleButton.title = 'Toggle Monster AI';
    toggleButton.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #8b5a2b;
      background: ${monsterAI.isEnabled() ? '#059669' : '#6b7280'};
      color: white;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      pointer-events: auto;
      z-index: 1001;
    `;
    
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.transform = 'scale(1.1)';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.transform = 'scale(1)';
    });
    
    toggleButton.addEventListener('click', () => {
      const enabled = monsterAI.toggle();
      toggleButton.style.background = enabled ? '#059669' : '#6b7280';
      toggleButton.title = enabled ? 'Monster AI Enabled - Click to Disable' : 'Monster AI Disabled - Click to Enable';
      
      // Show status message
      this.showMessage(
        enabled ? 'Monster AI Activated' : 'Monster AI Deactivated',
        enabled ? 'System' : 'System'
      );
    });
    
    this.dialogueElement.appendChild(toggleButton);

    // Append to body
    document.body.appendChild(this.dialogueElement);

    // Update initial personality display
    this.updatePersonalityDisplay();
  }

  public showMessage(message: string, personalityName?: string): void {
    if (!this.dialogueElement) return;

    // Clear any existing timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    const messageElement = this.dialogueElement.querySelector('#monster-message') as HTMLElement;
    const personalityElement = this.dialogueElement.querySelector('#monster-personality') as HTMLElement;

    if (!messageElement || !personalityElement) return;

    // Update content
    messageElement.textContent = message;
    personalityElement.textContent = personalityName || monsterAI.getCurrentPersonality().name;

    // Show the dialogue box
    this.dialogueElement.style.opacity = '1';
    this.dialogueElement.style.transform = 'translateX(-50%) translateY(0px)';

    // Set timeout to fade out
    this.currentTimeout = window.setTimeout(() => {
      this.hideMessage();
    }, this.displayDuration);
  }

  public hideMessage(): void {
    if (!this.dialogueElement) return;

    // Fade out
    this.dialogueElement.style.opacity = '0';
    this.dialogueElement.style.transform = 'translateX(-50%) translateY(20px)';

    // Clear timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  public updatePersonalityDisplay(): void {
    if (!this.dialogueElement) return;

    const personalityElement = this.dialogueElement.querySelector('#monster-personality') as HTMLElement;
    const toggleButton = this.dialogueElement.querySelector('button') as HTMLElement;

    if (personalityElement) {
      const personality = monsterAI.getCurrentPersonality();
      personalityElement.textContent = personality.name;
    }

    if (toggleButton) {
      toggleButton.style.background = monsterAI.isEnabled() ? '#059669' : '#6b7280';
      toggleButton.title = monsterAI.isEnabled() ? 'Monster AI Enabled - Click to Disable' : 'Monster AI Disabled - Click to Enable';
    }
  }

  public isVisible(): boolean {
    return this.dialogueElement?.style.opacity === '1';
  }

  public destroy(): void {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
    if (this.dialogueElement) {
      this.dialogueElement.remove();
      this.dialogueElement = null;
    }
  }

  // Queue system for multiple messages
  public queueMessage(message: string): void {
    const now = Date.now();
    this.messageQueue.push({ message, timestamp: now });

    // If no message is currently showing, show this one immediately
    if (!this.isVisible()) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.messageQueue.length === 0) return;

    const nextMessage = this.messageQueue.shift();
    if (nextMessage) {
      this.showMessage(nextMessage.message);
      
      // Process next message after current one finishes
      setTimeout(() => {
        this.processQueue();
      }, this.displayDuration + 500); // Small gap between messages
    }
  }

  // Show personality selection dialog
  public showPersonalitySelector(): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #1e1e2e;
      border: 2px solid #8b5a2b;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      color: #f4f4f4;
      font-family: 'Segoe UI', sans-serif;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Monster AI Personality';
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #f4f4f4;
      text-align: center;
      font-size: 18px;
    `;
    content.appendChild(title);

    const personalities = monsterAI.getAvailablePersonalities();
    const currentPersonality = monsterAI.getCurrentPersonality().name;

    personalities.forEach(key => {
      const personality = monsterAI.getPersonalityInfo(key);
      if (!personality) return;

      const option = document.createElement('div');
      option.style.cssText = `
        padding: 12px;
        margin: 8px 0;
        border: 2px solid ${personality.name === currentPersonality ? '#059669' : '#4a4a4a'};
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: ${personality.name === currentPersonality ? 'rgba(5, 150, 105, 0.2)' : 'transparent'};
      `;

      option.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px; color: #f4f4f4;">${personality.name}</div>
        <div style="font-size: 12px; color: #a0a0a0; margin-bottom: 8px;">${personality.description}</div>
        <div style="font-size: 11px; color: #8a8a8a;">
          Aggression: ${Math.round(personality.behaviorTraits.aggression * 100)}% | 
          Intelligence: ${Math.round(personality.behaviorTraits.intelligence * 100)}% | 
          Self-Preservation: ${Math.round(personality.behaviorTraits.selfPreservation * 100)}%
        </div>
      `;

      option.addEventListener('mouseenter', () => {
        if (personality.name !== currentPersonality) {
          option.style.background = 'rgba(75, 75, 75, 0.3)';
          option.style.borderColor = '#6a6a6a';
        }
      });

      option.addEventListener('mouseleave', () => {
        if (personality.name !== currentPersonality) {
          option.style.background = 'transparent';
          option.style.borderColor = '#4a4a4a';
        }
      });

      option.addEventListener('click', () => {
        monsterAI.setPersonality(key);
        this.updatePersonalityDisplay();
        modal.remove();
        this.showMessage(`Monster AI personality changed to ${personality.name}`, personality.name);
      });

      content.appendChild(option);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeButton.addEventListener('click', () => modal.remove());
    content.appendChild(closeButton);

    modal.appendChild(content);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }
}

// Global dialogue UI instance
export const monsterDialogue = new MonsterDialogueUI();
