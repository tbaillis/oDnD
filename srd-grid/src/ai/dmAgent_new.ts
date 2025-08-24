// OpenAI import temporarily commented out for browser compatibility
// import OpenAI from 'openai';
import { dmAgentConfig, type AIPersonality, AI_PERSONALITIES } from './config.js';

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
  private client: any | null = null; // Temporarily using 'any' since OpenAI is not available in browser
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
      const config = dmAgentConfig.getConfig();
      
      if (!config.enabled) {
        console.log('DM Agent is disabled in configuration');
        return;
      }

      // For browser safety, we'll simulate being ready without actual OpenAI connection
      // In production, this should be a server-side proxy to OpenAI
      console.log('⚠️  DM Agent running in browser-demo mode (no direct OpenAI connection)');
      
      // Temporarily disabled for browser safety - OpenAI should be server-side only
      // this.client = new OpenAI({
      //   apiKey: config.apiKey,
      //   baseURL: config.baseUrl,
      // });

      // Test the connection
      // await this.testConnection();
      
      this.isInitialized = config.enabled; // Set to enabled state from config
      console.log(`✅ DM Agent initialized in demo mode: ${this.personality.name}`);
    } catch (error) {
      console.error('Error initializing DM Agent:', error);
      this.isInitialized = false;
    }
  }

  public async sendMessage(userMessage: string): Promise<DMResponse> {
    // Check if agent is enabled in configuration
    if (!this.isReady()) {
      return {
        content: `*${this.personality.name} looks up from ancient tomes*\n\nI'm afraid I'm not properly configured yet, adventurer. Please check the configuration modal to enable me, then restart your development server.\n\nYour message: "${userMessage}"\n\nOnce I'm properly enabled, I'll be able to provide much more helpful responses!`,
        confidence: 0.3,
        suggestedActions: [
          'Check the Dungeon Master Configuration',
          'Ensure VITE_DM_AGENT_ENABLED=true in .env',
          'Restart the development server'
        ],
        mcpToolCalls: []
      };
    }

    // Provide enhanced demo response when configured but no API key
    return {
      content: `*${this.personality.name} adjusts their spectacles and grins*\n\nAh, excellent! I can see you've configured me properly. While I'm currently running in demonstration mode (for security, the OpenAI connection needs to be server-side), I'm fully aware and ready to assist!\n\n**Your message:** "${userMessage}"\n\n**My response:** Based on your query, I would normally analyze the situation using my vast knowledge of D&D 3.5e rules and provide contextual advice. I have access to 17 different tools for managing combat, environments, NPCs, and story elements.\n\n*In full AI mode, I would provide specific, contextual responses tailored to your campaign needs.*\n\n**${this.personality.name}'s Wisdom:** ${this.getPersonalityResponse(userMessage)}`,
      confidence: 0.8,
      suggestedActions: [
        'Try asking about combat mechanics',
        'Request NPC generation', 
        'Ask for environmental descriptions',
        'Explore rule clarifications'
      ],
      mcpToolCalls: []
    };
  }

  private getPersonalityResponse(userMessage: string): string {
    const personality = this.personality;
    
    if (userMessage.toLowerCase().includes('combat') || userMessage.toLowerCase().includes('fight')) {
      return `As ${personality.name}, I would analyze the tactical situation and provide strategic advice tailored to your party's capabilities.`;
    } else if (userMessage.toLowerCase().includes('story') || userMessage.toLowerCase().includes('plot')) {
      return `${personality.name} would weave narrative elements that enhance your campaign's themes and character development.`;
    } else if (userMessage.toLowerCase().includes('rule') || userMessage.toLowerCase().includes('mechanic')) {
      return `I would consult the vast D&D 3.5e rulebooks and provide clear, authoritative guidance on game mechanics.`;
    } else {
      return `Every question is an opportunity for adventure! ${personality.name} approaches each situation with wisdom gained from countless campaigns.`;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public getCurrentPersonality(): AIPersonality {
    return this.personality;
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
