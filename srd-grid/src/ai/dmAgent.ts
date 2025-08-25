// Server-side OpenAI integration via API
import { type AIPersonality, AI_PERSONALITIES } from './config.js';

const DM_API_BASE_URL = 'http://localhost:3001/api/dm';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface GameContext {
  currentScene?: string;
  activeEncounter?: any;
  partyMembers?: string[];
  environment?: string;
  campaignInfo?: string;
}

export interface DMResponse {
  content: string;
  confidence: number;
  suggestedActions?: string[];
  mcpToolCalls?: Array<{
    tool: string;
    parameters: any;
    reason: string;
  }>;
}

export class OpenAIDMAgent {
  private isInitialized: boolean = false;
  private conversationHistory: ChatMessage[] = [];
  private gameContext: GameContext = {};
  private personality: AIPersonality;

  constructor() {
    // Start with default personality
    this.personality = AI_PERSONALITIES.experienced_wise_mentor;
    this.initialize().catch(error => {
      console.error('Failed to initialize DM Agent:', error);
    });
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Initializing DM Agent...');
      
      // Check if server is available and configured
      const serverStatus = await this.checkServerStatus();
      
      if (serverStatus.status === 'ready') {
        this.isInitialized = true;
        console.log(`✅ DM Agent initialized with server connection: ${this.personality.name}`);
      } else {
        console.warn(`⚠️ DM Server not ready: ${serverStatus.message || 'Unknown issue'}`);
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error initializing DM Agent:', error);
      this.isInitialized = false;
    }
  }

  private async checkServerStatus(): Promise<{ status: string; message?: string; hasApiKey?: boolean }> {
    try {
      const response = await fetch(`${DM_API_BASE_URL}/config`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const config = await response.json();
      return {
        status: config.hasApiKey ? 'ready' : 'needs_configuration',
        message: config.hasApiKey ? 'Server configured and ready' : 'OpenAI API key not configured',
        hasApiKey: config.hasApiKey
      };
    } catch (error) {
      return {
        status: 'server_unavailable',
        message: `Cannot connect to DM server: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async sendMessage(userMessage: string): Promise<DMResponse> {
    // Check if agent is properly initialized
    if (!this.isReady()) {
      // Check server status for better error messaging
      const serverStatus = await this.checkServerStatus();
      
      if (serverStatus.status === 'server_unavailable') {
        return {
          content: `*${this.personality.name} looks concerned*\n\nI'm having trouble connecting to my knowledge base. It seems the AI server isn't running.\n\nTo fix this:\n1. Make sure the DM server is running on port 3001\n2. Run \`npm run dev:server\` in a separate terminal\n3. Or use \`npm run dev:full\` to start both client and server\n\nYour message: "${userMessage}"`,
          confidence: 0.2,
          suggestedActions: [
            'Start the DM server',
            'Check server configuration',
            'Try again once server is running'
          ],
          mcpToolCalls: []
        };
      } else if (serverStatus.status === 'needs_configuration') {
        return {
          content: `*${this.personality.name} adjusts their spectacles*\n\nI can connect to my knowledge base, but it appears the OpenAI API key isn't configured on the server side.\n\nTo enable full AI responses:\n1. Add your OPENAI_API_KEY to the .env file\n2. Restart the DM server\n\nYour message: "${userMessage}"\n\nI'm ready to provide full AI responses once the API key is configured!`,
          confidence: 0.3,
          suggestedActions: [
            'Configure OpenAI API key',
            'Restart DM server',
            'Check .env file'
          ],
          mcpToolCalls: []
        };
      }
    }

    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Make API request to server
      const response = await fetch(`${DM_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          personality: this.getPersonalityKey(this.personality.name),
          gameContext: this.gameContext,
          conversationHistory: this.conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const dmResponse: DMResponse = await response.json();
      
      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: dmResponse.content,
        timestamp: new Date()
      });

      return dmResponse;

    } catch (error) {
      console.error('Error sending message to DM:', error);
      
      return {
        content: `*${this.personality.name} looks troubled*\n\nI apologize, but I encountered an issue while processing your request.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThis might be a temporary connectivity issue. Please try again in a moment.`,
        confidence: 0.1,
        suggestedActions: [
          'Try your request again',
          'Check your connection',
          'Verify server is running'
        ],
        mcpToolCalls: []
      };
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getCurrentPersonality(): AIPersonality {
    return this.personality;
  }

  private getPersonalityKey(personalityName: string): string {
    // Map personality name back to key
    for (const [key, personality] of Object.entries(AI_PERSONALITIES)) {
      if (personality.name === personalityName) {
        return key;
      }
    }
    return 'experienced_wise_mentor'; // Default fallback
  }

  public setPersonality(personalityKey: string): void {
    if (AI_PERSONALITIES[personalityKey]) {
      this.personality = AI_PERSONALITIES[personalityKey];
      console.log(`DM personality changed to: ${this.personality.name}`);
    }
  }

  public setGameContext(context: Partial<GameContext>): void {
    this.gameContext = { ...this.gameContext, ...context };
    console.log('Game context updated:', this.gameContext);
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  public clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }
}

// Export singleton instance
export const dmAgent = new OpenAIDMAgent();
