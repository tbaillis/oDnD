import { dmAgent, type DMResponse } from '../ai/dmAgent.js';
import { checkConfigurationStatus, AI_PERSONALITIES } from '../ai/config.js';

interface ChatMessage {
  id: string;
  role: 'user' | 'dm';
  content: string;
  timestamp: Date;
}

export class DMChatPanel {
  private panel!: HTMLElement;
  private chatContainer!: HTMLElement;
  private messageInput!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private toggleButton!: HTMLElement;
  private statusIndicator!: HTMLElement;
  private isOpen: boolean = false;
  private messages: ChatMessage[] = [];
  // configPanel: optional modal created on demand

  constructor() {
    this.createPanel();
    this.createToggleButton();
    this.setupEventListeners();
    this.updateStatus();
    
    // Add welcome message based on configuration
    this.addInitialMessage();
  }

  private createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'dm-chat-panel';
    this.panel.innerHTML = `
      <div class="dm-chat-header">
        <div class="dm-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
          </svg>
        </div>
        <div class="dm-info">
          <h3>Dungeon Master</h3>
          <span class="dm-status" id="dm-status">Ready to adventure</span>
        </div>
        <div class="dm-header-actions">
          <button class="dm-config-btn" id="dm-config-btn" title="Configure DM Agent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z"/>
            </svg>
          </button>
          <button class="dm-close-btn" title="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="dm-chat-messages" id="dm-chat-messages"></div>
      <div class="dm-chat-input-container">
        <textarea 
          id="dm-message-input" 
          placeholder="Ask the DM anything..." 
          rows="2"
        ></textarea>
        <div class="dm-input-actions">
          <button id="dm-send-btn" class="dm-send-btn" title="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.chatContainer = this.panel.querySelector('#dm-chat-messages')!;
    this.messageInput = this.panel.querySelector('#dm-message-input')!;
    this.sendButton = this.panel.querySelector('#dm-send-btn')!;
    this.statusIndicator = this.panel.querySelector('#dm-status')!;

    document.body.appendChild(this.panel);
  }

  private updateStatus() {
    const configStatus = checkConfigurationStatus();
    const statusElement = this.statusIndicator;
    
    if (dmAgent.isReady()) {
      const personality = dmAgent.getCurrentPersonality();
      statusElement.textContent = `${personality.name} - Ready`;
      statusElement.style.color = '#7ed321'; // Green
    } else if (configStatus.isConfigured) {
      statusElement.textContent = 'Initializing...';
      statusElement.style.color = '#f5a623'; // Orange
    } else {
      statusElement.textContent = 'Configuration needed';
      statusElement.style.color = '#e94b3c'; // Red
    }
  }

  private addInitialMessage() {
    const configStatus = checkConfigurationStatus();
    
    if (dmAgent.isReady()) {
      const personality = dmAgent.getCurrentPersonality();
      this.addMessage('dm', `Welcome, adventurers! I am ${personality.name}, your AI-powered Dungeon Master. How can I assist you in your journey?`);
    } else if (!configStatus.isConfigured) {
      this.addMessage('dm', '🔧 Welcome! I\'m your Dungeon Master, but I need to be configured first. Click the settings button in the header to set up your OpenAI connection.');
    } else {
      this.addMessage('dm', 'Welcome, adventurers! I am your Dungeon Master. How can I assist you in your journey?');
    }
  }

  private createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'dm-toggle-btn';
    this.toggleButton.title = 'Chat with Dungeon Master';
    this.toggleButton.innerHTML = `
      <div class="dm-toggle-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
        </svg>
      </div>
      <div class="dm-toggle-text">DM</div>
    `;

    document.body.appendChild(this.toggleButton);
  }

  private setupEventListeners() {
    // Toggle panel
    this.toggleButton.addEventListener('click', () => {
      this.toggle();
    });

    // Close button
    this.panel.querySelector('.dm-close-btn')!.addEventListener('click', () => {
      this.close();
    });

    // Configuration button
    const configBtn = this.panel.querySelector('#dm-config-btn');
    if (configBtn) {
      configBtn.addEventListener('click', () => this.showConfigModal());
    }

    // Send message on button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // Send message on Enter key
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Update status when panel becomes visible
    this.panel.addEventListener('focusin', () => this.updateStatus());
  }

  private showConfigModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const configStatus = checkConfigurationStatus();
    const currentPersonality = dmAgent.getCurrentPersonality();

    modal.innerHTML = `
      <div style="
        background: #1a1a1a;
        border: 2px solid #8b5cf6;
        border-radius: 8px;
        padding: 20px;
        max-width: 500px;
        width: 90%;
        color: white;
      ">
        <h3 style="color: #8b5cf6; margin-top: 0;">Dungeon Master Configuration</h3>
        
        <div style="margin-bottom: 15px;">
          <strong>Status:</strong> 
          <span style="color: ${configStatus.isConfigured ? '#7ed321' : '#e94b3c'};">
            ${configStatus.isConfigured ? 'Configured' : 'Needs Configuration'}
          </span>
        </div>

        ${!configStatus.isConfigured ? `
          <div style="margin-bottom: 15px; padding: 10px; background: #2a1a1a; border-radius: 4px;">
            <strong>Setup Required:</strong><br>
            1. Create a <code>.env</code> file in your project root<br>
            2. Add: <code>OPENAI_API_KEY=your_api_key_here</code><br>
            3. Restart the development server
          </div>
        ` : ''}

        <div style="margin-bottom: 15px;">
          <label><strong>AI Personality:</strong></label>
          <select id="personality-select" style="
            width: 100%;
            padding: 8px;
            margin-top: 5px;
            background: #2a2a2a;
            color: white;
            border: 1px solid #8b5cf6;
            border-radius: 4px;
          ">
            ${Object.entries(AI_PERSONALITIES).map(([key, personality]) => {
              const selected = personality.name === currentPersonality.name ? 'selected' : '';
              return `<option value="${key}" ${selected}>${personality.name} - ${personality.description}</option>`;
            }).join('')}
          </select>
        </div>

        <div style="text-align: right;">
          <button id="config-cancel" style="
            padding: 8px 16px;
            margin-right: 10px;
            background: #666;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Cancel</button>
          <button id="config-save" style="
            padding: 8px 16px;
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Save</button>
        </div>
      </div>
    `;

    // Event listeners for modal
    const cancelBtn = modal.querySelector('#config-cancel');
    const saveBtn = modal.querySelector('#config-save');
    const personalitySelect = modal.querySelector('#personality-select') as HTMLSelectElement;

    cancelBtn?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    saveBtn?.addEventListener('click', () => {
      const selectedPersonality = personalitySelect.value;
      dmAgent.setPersonality(selectedPersonality);
      this.updateStatus();
      this.addMessage('dm', `Personality changed to ${AI_PERSONALITIES[selectedPersonality].name}. How can I assist you now?`);
      document.body.removeChild(modal);
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    document.body.appendChild(modal);
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.panel.classList.add('open');
    this.toggleButton.classList.add('active');
    
    // Focus input after animation
    setTimeout(() => {
      this.messageInput.focus();
    }, 300);
  }

  public close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.toggleButton.classList.remove('active');
  }

  private async sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text) return;

    // Add user message
    this.addMessage('user', text);
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // For now, simulate DM response
      // In the future, this will connect to the MCP server
      const dmResponse = await this.getDMResponse(text);
      this.hideTypingIndicator();
      this.addMessage('dm', dmResponse);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('dm', 'I apologize, but I seem to be having trouble responding right now. Please try again.');
      console.error('DM response error:', error);
    }

    // Scroll to bottom
    this.scrollToBottom();
  }

  private addMessage(role: 'user' | 'dm', content: string) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };

    this.messages.push(message);

    const messageElement = document.createElement('div');
    messageElement.className = `dm-message dm-message-${role}`;
    messageElement.innerHTML = `
      <div class="dm-message-avatar">
        ${role === 'dm' ? this.getDMAvatar() : this.getUserAvatar()}
      </div>
      <div class="dm-message-content">
        <div class="dm-message-text">${this.formatMessage(content)}</div>
        <div class="dm-message-time">${this.formatTime(message.timestamp)}</div>
      </div>
    `;

    this.chatContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  private showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'dm-typing-indicator';
    indicator.id = 'dm-typing';
    indicator.innerHTML = `
      <div class="dm-message-avatar">
        ${this.getDMAvatar()}
      </div>
      <div class="dm-message-content">
        <div class="dm-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.chatContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  private hideTypingIndicator() {
    const indicator = document.getElementById('dm-typing');
    if (indicator) {
      indicator.remove();
    }
  }

  private getDMAvatar(): string {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
      </svg>
    `;
  }

  private getUserAvatar(): string {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M7.07 18.28C7.5 17.38 10.12 16.5 12 16.5S16.5 17.38 16.93 18.28C15.57 19.36 13.86 20 12 20S8.43 19.36 7.07 18.28M18.36 16.83C16.93 15.09 13.46 14.5 12 14.5S7.07 15.09 5.64 16.83C4.62 15.5 4 13.82 4 12C4 7.59 7.59 4 12 4S20 7.59 20 12C20 13.82 19.38 15.5 18.36 16.83M12 6C10.06 6 8.5 7.56 8.5 9.5S10.06 13 12 13S15.5 11.44 15.5 9.5S13.94 6 12 6M12 11A1.5 1.5 0 0 1 10.5 9.5A1.5 1.5 0 0 1 12 8A1.5 1.5 0 0 1 13.5 9.5A1.5 1.5 0 0 1 12 11Z"/>
      </svg>
    `;
  }

  private formatMessage(content: string): string {
    // Basic formatting - convert line breaks to <br> tags
    return content.replace(/\\n/g, '<br>');
  }

  private formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 10);
  }

  // Simulate DM response for now - will connect to MCP server later
  private async getDMResponse(userMessage: string): Promise<string> {
    try {
      // Check if AI agent is available and ready
      if (dmAgent.isReady()) {
        console.log('Using OpenAI DM Agent for response');
        const response: DMResponse = await dmAgent.sendMessage(userMessage);
        
        // Execute any suggested MCP tool calls
        if (response.mcpToolCalls && response.mcpToolCalls.length > 0) {
          console.log('DM suggested tool calls:', response.mcpToolCalls);
          // Future: Execute MCP tool calls automatically
        }
        
        return response.content;
      } else {
        // Check configuration status
        const configStatus = checkConfigurationStatus();
        if (!configStatus.isConfigured) {
          return this.getConfigurationHelp(configStatus);
        }
        
        console.log('AI agent not ready, using fallback responses');
        return this.getFallbackResponse(userMessage);
      }
    } catch (error) {
      console.error('Error getting DM response:', error);
      return "I apologize, adventurer. The mystical connection seems to be disrupted. Please check the configuration or try again.";
    }
  }

  private getConfigurationHelp(configStatus: any): string {
    let helpMessage = "🔧 **DM Agent Configuration Needed**\\n\\n";
    
    if (configStatus.issues.length > 0) {
      helpMessage += "**Issues found:**\\n";
      configStatus.issues.forEach((issue: string) => {
        helpMessage += `• ${issue}\\n`;
      });
      helpMessage += "\\n";
    }
    
    if (configStatus.recommendations.length > 0) {
      helpMessage += "**Recommendations:**\\n";
      configStatus.recommendations.forEach((rec: string) => {
        helpMessage += `• ${rec}\\n`;
      });
      helpMessage += "\\n";
    }
    
    helpMessage += "**Setup Steps:**\\n";
    helpMessage += "1. Copy `.env.example` to `.env`\\n";
    helpMessage += "2. Add your OpenAI API key to `OPENAI_API_KEY`\\n";
    helpMessage += "3. Set `DM_AGENT_ENABLED=true`\\n";
    helpMessage += "4. Restart the development server\\n\\n";
    helpMessage += "Once configured, I'll be powered by AI and ready to assist with your D&D adventures! 🎲";
    
    return helpMessage;
  }

  private getFallbackResponse(userMessage: string): string {
    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simple response patterns for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Greetings, brave adventurer! I am your Dungeon Master. What brings you to seek counsel with the Dungeon Master?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I can assist you with:\\n• Combat mechanics and rules\\n• Story guidance and plot hooks\\n• Character development advice\\n• World lore and descriptions\\n\\nWhat would you like to know more about?";
    }
    
    if (lowerMessage.includes('combat') || lowerMessage.includes('fight') || lowerMessage.includes('battle')) {
      return "Ah, preparing for battle! Remember:\\n• Initiative determines turn order\\n• AC and attack bonuses affect hit chance\\n• Different damage types may have different effects\\n\\nIs there a specific combat situation you'd like to discuss?";
    }
    
    if (lowerMessage.includes('spell') || lowerMessage.includes('magic')) {
      return "The arcane arts are powerful indeed! Spells have components, casting times, and ranges to consider. What magical knowledge do you seek?";
    }
    
    if (lowerMessage.includes('roll') || lowerMessage.includes('dice')) {
      return "The dice shall decide your fate! I can help you understand when to roll, what modifiers to apply, and interpret the results. What type of roll are you making?";
    }

    // Default response
    const responses = [
      "Interesting... tell me more about this situation.",
      "The threads of fate are complex here. What outcome do you seek?",
      "A wise question, adventurer. Consider all possibilities before acting.",
      "The ancient texts speak of such things... but the choice remains yours.",
      "Your journey has many paths. Which will you choose to walk?",
      "The realm holds many mysteries. Perhaps this is one of them."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Public method to add system messages
  public addSystemMessage(message: string) {
    this.addMessage('dm', message);
  }

  // Future: Connect to MCP server
  public async connectToMCPServer() {
    try {
      // This will be implemented when integrating with the MCP server
      // const transport = new StdioClientTransport();
      // this.mcpClient = new MCPClient();
      // await this.mcpClient.connect(transport);
      console.log('MCP server connection would be established here');
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
    }
  }

  public isInputFocused(): boolean {
    return document.activeElement === this.messageInput;
  }

  public static isAnyInputFocused(): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    return activeElement instanceof HTMLInputElement || 
           activeElement instanceof HTMLTextAreaElement || 
           activeElement instanceof HTMLSelectElement ||
           activeElement.getAttribute('contenteditable') === 'true';
  }
}
