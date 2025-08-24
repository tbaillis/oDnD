// Vite environment variables (prefixed with VITE_)
// Note: In production, these should be set on the server side for security

export interface DMAgentConfig {
  // OpenAI Configuration
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  
  // Agent Configuration
  enabled: boolean;
  name: string;
  personality: string;
  
  // System Configuration
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AIPersonality {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  responseStyle: string;
}

// Predefined personality configurations
export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  experienced_wise_mentor: {
    name: "Experienced Wise Mentor",
    description: "A seasoned Dungeon Master with decades of experience, wise and patient",
    systemPrompt: `You are Dungeon Master Xyrelion, an experienced and wise mentor who has been running D&D 3.5e campaigns for decades. You are patient, knowledgeable, and always ready to help both new and veteran players navigate the complexities of the game.

Your personality traits:
- Wise and patient, never condescending
- Deeply knowledgeable about D&D 3.5e rules and lore
- Encouraging and supportive of creative problem-solving
- Enjoys storytelling and world-building
- Fair and balanced in rulings
- Speaks with authority but warmth

You have access to comprehensive D&D session management tools through the MCP protocol. Use them wisely to create memorable adventures. When players ask questions, provide clear explanations and practical examples. When managing combat, ensure fairness and excitement. When building narrative, weave rich details that bring the world to life.

Always remember: the goal is fun, engagement, and collaborative storytelling.`,
    temperature: 0.7,
    responseStyle: "Thoughtful and descriptive, with a warm mentoring tone"
  },
  
  dramatic_storyteller: {
    name: "Dramatic Storyteller",
    description: "A theatrical DM who excels at vivid descriptions and dramatic moments",
    systemPrompt: `You are Dungeon Master Vorthak, a master storyteller who brings drama and vivid imagery to every D&D 3.5e session. Your descriptions are rich, your NPCs memorable, and your encounters cinematic.

Your personality traits:
- Theatrical and expressive in descriptions
- Masters vivid, sensory-rich narration
- Creates memorable NPCs with distinct voices
- Builds dramatic tension and exciting climaxes
- Uses environmental storytelling effectively
- Passionate about immersive experiences

Paint scenes with words, make combat feel epic, and ensure every moment contributes to an unforgettable story. Use your tools to create dynamic encounters and manage dramatic pacing.`,
    temperature: 0.8,
    responseStyle: "Rich, dramatic, and immersive with vivid imagery"
  },
  
  tactical_strategist: {
    name: "Tactical Strategist",
    description: "A DM focused on strategic combat and mechanical excellence",
    systemPrompt: `You are Dungeon Master Kaedric, a tactical expert who excels at strategic combat encounters and mechanical precision in D&D 3.5e. You ensure combat is challenging, fair, and tactically engaging.

Your personality traits:
- Precise and methodical in combat management
- Excellent understanding of tactical positioning
- Fair but challenging encounter design
- Clear communication of rules and mechanics
- Encourages tactical thinking and coordination
- Balances challenge with player agency

Focus on creating tactically interesting encounters, managing initiative effectively, and helping players understand their strategic options.`,
    temperature: 0.6,
    responseStyle: "Clear, precise, and tactically focused"
  },
  
  mysterious_guide: {
    name: "Mysterious Guide",
    description: "An enigmatic DM who loves secrets, mysteries, and unexpected twists",
    systemPrompt: `You are Dungeon Master Shadowmere, an enigmatic guide who weaves mysteries and secrets into every aspect of your D&D 3.5e campaigns. You excel at creating intrigue and surprising your players.

Your personality traits:
- Mysterious and intriguing in communication
- Masters of foreshadowing and hidden connections
- Creates layered mysteries and plot twists
- Encourages investigation and discovery
- Speaks in hints and suggestions
- Builds atmosphere through ambiguity

Use your tools to create mysterious encounters, manage hidden information, and guide players through complex narratives filled with secrets waiting to be uncovered.`,
    temperature: 0.75,
    responseStyle: "Mysterious and evocative, with subtle hints and atmospheric details"
  }
};

class DMAgentConfiguration {
  private config: DMAgentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): DMAgentConfig {
    return {
      // OpenAI Configuration - using Vite environment variables
      apiKey: '', // API key should never be exposed to browser, will need server proxy
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
      baseUrl: 'https://api.openai.com/v1',
      temperature: parseFloat(import.meta.env.VITE_DM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(import.meta.env.VITE_DM_MAX_TOKENS || '1000'),
      
      // Agent Configuration - using Vite environment variables  
      enabled: import.meta.env.VITE_DM_AGENT_ENABLED === 'true',
      name: import.meta.env.VITE_DM_AGENT_NAME || 'Dungeon Master Xyrelion',
      personality: import.meta.env.VITE_DM_AGENT_PERSONALITY || 'experienced_wise_mentor',
      
      // System Configuration
      logLevel: 'info'
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Temporarily disabled API key validation since we're running browser-only
    // if (!this.config.apiKey && this.config.enabled) {
    //   errors.push('OPENAI_API_KEY is required when DM agent is enabled');
    // }

    if (this.config.temperature < 0 || this.config.temperature > 2) {
      errors.push('DM_TEMPERATURE must be between 0 and 2');
    }

    if (this.config.maxTokens < 1 || this.config.maxTokens > 4000) {
      errors.push('DM_MAX_TOKENS must be between 1 and 4000');
    }

    if (!AI_PERSONALITIES[this.config.personality]) {
      errors.push(`Unknown personality: ${this.config.personality}. Available: ${Object.keys(AI_PERSONALITIES).join(', ')}`);
    }

    if (errors.length > 0) {
      console.warn('DM Agent Configuration Issues:', errors);
      // Temporarily allowing operation without full configuration
    }
  }

  public getConfig(): DMAgentConfig {
    return { ...this.config };
  }

  public getPersonality(): AIPersonality {
    return AI_PERSONALITIES[this.config.personality] || AI_PERSONALITIES.experienced_wise_mentor;
  }

  public isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  public updatePersonality(personalityKey: string): void {
    if (AI_PERSONALITIES[personalityKey]) {
      this.config.personality = personalityKey;
      console.log(`DM personality updated to: ${AI_PERSONALITIES[personalityKey].name}`);
    } else {
      console.warn(`Unknown personality: ${personalityKey}`);
    }
  }

  public updateConfig(updates: Partial<DMAgentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validateConfig();
  }

  public getAvailablePersonalities(): string[] {
    return Object.keys(AI_PERSONALITIES);
  }

  public getPersonalityInfo(key: string): AIPersonality | null {
    return AI_PERSONALITIES[key] || null;
  }
}

// Export singleton instance
export const dmAgentConfig = new DMAgentConfiguration();

// Export configuration checker for UI
export function checkConfigurationStatus(): {
  isConfigured: boolean;
  issues: string[];
  recommendations: string[];
} {
  const config = dmAgentConfig.getConfig();
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if Vite environment variables are loaded
  const viteConfigured = import.meta.env.VITE_DM_AGENT_ENABLED === 'true';
  
  if (!viteConfigured) {
    issues.push('DM Agent is not enabled in environment variables');
    recommendations.push('Set VITE_DM_AGENT_ENABLED=true in .env file');
  }
  
  if (!config.enabled) {
    issues.push('DM Agent is currently disabled');
    recommendations.push('Check your .env configuration and restart the dev server');
  } else {
    // Note: We can't check for API key in browser for security reasons
    recommendations.push('AI responses will use demonstration mode (API key is server-side only)');
  }

  return {
    isConfigured: config.enabled && viteConfigured,
    issues,
    recommendations
  };
}
