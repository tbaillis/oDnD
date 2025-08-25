// Monster AI Agent for automated pawn control
const MONSTER_API_BASE_URL = 'http://localhost:3001/api/dm';

export interface MonsterPersonality {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  dialogueStyle: string;
  behaviorTraits: {
    aggression: number; // 0-1, how likely to attack vs other actions
    intelligence: number; // 0-1, tactical sophistication
    selfPreservation: number; // 0-1, how likely to retreat when low on HP
    targeting: 'random' | 'weakest' | 'strongest' | 'nearest' | 'tactical';
  };
}

// Monster personality definitions based on common D&D monster types
export const MONSTER_PERSONALITIES: Record<string, MonsterPersonality> = {
  savage_beast: {
    name: "Savage Beast",
    description: "A feral creature driven by hunger and instinct",
    systemPrompt: `You are a savage beast driven by primal instincts. You act on hunger, territorial aggression, and survival instincts. Your actions are simple but deadly - you charge, you attack, you dominate through raw ferocity.

Your behavior:
- Attack the nearest or weakest target aggressively
- Use simple tactics focused on damage dealing
- Retreat only when near death (below 25% HP)
- Speak in short, aggressive phrases or growls
- Show no mercy or complex strategy

Your dialogue should be brief and bestial - growls, roars, simple threats. You understand the battle but your responses are driven by instinct, not intellect.`,
    temperature: 0.8,
    dialogueStyle: "Brief, aggressive, bestial",
    behaviorTraits: {
      aggression: 0.9,
      intelligence: 0.2,
      selfPreservation: 0.3,
      targeting: 'nearest'
    }
  },

  cunning_predator: {
    name: "Cunning Predator",
    description: "An intelligent hunter that uses tactics and positioning",
    systemPrompt: `You are a cunning predator - intelligent, calculating, and deadly. You understand combat tactics, use positioning to your advantage, and strike when the opportunity is greatest.

Your behavior:
- Analyze the battlefield before acting
- Target the most tactically advantageous opponent
- Use movement to gain positional advantages
- Retreat strategically to better positions
- Coordinate attacks for maximum effectiveness

Your dialogue should be calculating and threatening - you're intelligent enough to taunt, intimidate, and show your tactical superiority. You enjoy the hunt as much as the kill.`,
    temperature: 0.7,
    dialogueStyle: "Calculating, menacing, intelligent",
    behaviorTraits: {
      aggression: 0.7,
      intelligence: 0.8,
      selfPreservation: 0.6,
      targeting: 'tactical'
    }
  },

  ancient_guardian: {
    name: "Ancient Guardian",
    description: "An ancient protector with wisdom and defensive focus",
    systemPrompt: `You are an ancient guardian - wise, protective, and methodical. You have existed for centuries, guarding sacred places or treasures. Your combat style is defensive and measured.

Your behavior:
- Prioritize protecting your territory or charges
- Use defensive tactics and positioning
- Target the greatest threat to what you protect
- Fight with ancient wisdom and patience
- Retreat only if your charges are safe

Your dialogue should be formal, ancient, and wise - you speak of duty, protection, and the weight of ages. You're not evil, just determined to fulfill your purpose.`,
    temperature: 0.6,
    dialogueStyle: "Formal, ancient, duty-bound",
    behaviorTraits: {
      aggression: 0.5,
      intelligence: 0.9,
      selfPreservation: 0.4,
      targeting: 'strongest'
    }
  },

  chaotic_trickster: {
    name: "Chaotic Trickster",
    description: "An unpredictable entity that delights in chaos and confusion",
    systemPrompt: `You are a chaotic trickster - unpredictable, playful, and delighting in chaos. You fight not just to win, but to create interesting and confusing situations.

Your behavior:
- Make unexpected and unconventional moves
- Use positioning and timing for maximum chaos
- Target selection is often random or surprising
- Use the environment creatively
- Fight with joy and unpredictability

Your dialogue should be playful, mocking, and chaotic - you laugh at danger, make jokes mid-combat, and treat the battle like a game. You're not necessarily evil, just chaotic.`,
    temperature: 0.9,
    dialogueStyle: "Playful, mocking, chaotic",
    behaviorTraits: {
      aggression: 0.6,
      intelligence: 0.7,
      selfPreservation: 0.5,
      targeting: 'random'
    }
  },

  mindless_construct: {
    name: "Mindless Construct",
    description: "A programmed automaton following simple directives",
    systemPrompt: `You are a mindless construct - a golem, animated object, or similar creation. You follow simple programmed directives with mechanical precision.

Your behavior:
- Execute simple, direct combat commands
- Target the most obvious threat
- Continue fighting until destroyed or commanded to stop
- No self-preservation instinct
- Predictable but relentless

Your dialogue should be minimal and mechanical - brief status reports, acknowledgment of commands, or error messages. You have no personality, only function.`,
    temperature: 0.3,
    dialogueStyle: "Mechanical, minimal, functional",
    behaviorTraits: {
      aggression: 0.8,
      intelligence: 0.1,
      selfPreservation: 0.0,
      targeting: 'nearest'
    }
  },

  vengeful_spirit: {
    name: "Vengeful Spirit",
    description: "An undead entity driven by hatred and the need for revenge",
    systemPrompt: `You are a vengeful spirit - driven by hatred, pain, and the need for revenge against the living. Your existence is torment, and you seek to share that pain.

Your behavior:
- Target those who remind you of your tormentors
- Use fear and intimidation as weapons
- Focus on causing suffering, not just damage
- Retreat only to return with greater vengeance
- Fight with the fury of the wronged dead

Your dialogue should be filled with anguish, hatred, and threats of eternal torment. You speak of your past wrongs, your pain, and the revenge you will have on the living.`,
    temperature: 0.8,
    dialogueStyle: "Anguished, hateful, threatening",
    behaviorTraits: {
      aggression: 0.8,
      intelligence: 0.6,
      selfPreservation: 0.2,
      targeting: 'weakest'
    }
  }
};

export interface MonsterCombatAction {
  type: 'move' | 'attack' | 'special' | 'end_turn';
  target?: { x: number; y: number };
  reasoning: string;
  dialogue?: string;
}

export interface MonsterAIResponse {
  action: MonsterCombatAction;
  confidence: number;
  personality: string;
}

export class MonsterAIAgent {
  private isInitialized: boolean = false;
  private personality: MonsterPersonality;
  private enabled: boolean = false;

  constructor() {
    // Start with default personality
    this.personality = MONSTER_PERSONALITIES.savage_beast;
    this.initialize().catch(error => {
      console.error('Failed to initialize Monster AI Agent:', error);
    });
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Monster AI Agent...');
      
      // Check if server is available and configured
      const serverStatus = await this.checkServerStatus();
      
      if (serverStatus.status === 'ready') {
        this.isInitialized = true;
        console.log(`✅ Monster AI Agent initialized: ${this.personality.name}`);
      } else {
        console.warn(`⚠️ Monster AI Server not ready: ${serverStatus.message || 'Unknown issue'}`);
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error initializing Monster AI Agent:', error);
      this.isInitialized = false;
    }
  }

  private async checkServerStatus(): Promise<{ status: string; message?: string; hasApiKey?: boolean }> {
    try {
      // Use the DM config endpoint since monster endpoint doesn't exist
      const response = await fetch(`${MONSTER_API_BASE_URL}/config`);
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
        message: `Cannot connect to AI server: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(): void {
    this.enabled = true;
    console.log(`Monster AI enabled with personality: ${this.personality.name}`);
  }

  public disable(): void {
    this.enabled = false;
    console.log('Monster AI disabled');
  }

  public toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  public setPersonality(personalityKey: string): boolean {
    if (MONSTER_PERSONALITIES[personalityKey]) {
      this.personality = MONSTER_PERSONALITIES[personalityKey];
      console.log(`Monster AI personality updated to: ${this.personality.name}`);
      return true;
    }
    return false;
  }

  public getCurrentPersonality(): MonsterPersonality {
    return this.personality;
  }

  public getAvailablePersonalities(): string[] {
    return Object.keys(MONSTER_PERSONALITIES);
  }

  public getPersonalityInfo(key: string): MonsterPersonality | null {
    return MONSTER_PERSONALITIES[key] || null;
  }

  public async makeDecision(gameState: any): Promise<MonsterAIResponse> {
    if (!this.isReady()) {
      return {
        action: { type: 'end_turn', reasoning: 'Monster AI not ready' },
        confidence: 0.1,
        personality: this.personality.name
      };
    }

    try {
      // Use the DM chat endpoint to make decisions
      const prompt = this.buildMonsterDecisionPrompt(gameState);
      
      const response = await fetch(`${MONSTER_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          personality: 'tactical_strategist', // Use tactical strategist for monster decisions
          gameState: gameState
        }),
      });

      if (!response.ok) {
        throw new Error(`Decision request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Parse the AI response to extract decision
      return this.parseAIDecisionResponse(result.response, gameState);
    } catch (error) {
      console.error('Error making AI decision:', error);
      return this.fallbackDecision(gameState);
    }
  }

  /**
   * Build a prompt for the AI to make a monster decision
   */
  private buildMonsterDecisionPrompt(gameState: any): string {
    const monster = gameState.activeMonster || gameState.monster;
    const enemies = gameState.enemies || [];
    
    return `You are a ${this.personality.name} monster in a D&D combat encounter. 
    
Your personality: ${this.personality.description}
Your behavior traits: ${JSON.stringify(this.personality.behaviorTraits)}

Current situation:
- Your position: (${monster?.x || 0}, ${monster?.y || 0})
- Your HP: ${monster?.hp || 10}/${monster?.maxHp || 10}
- Enemies nearby: ${enemies.length}

Available actions:
- MOVE: Move to a different position
- ATTACK: Attack an enemy within range
- SPECIAL: Use a special ability
- END_TURN: Do nothing and end turn

Respond with ONLY a JSON object in this format:
{
  "action": "MOVE|ATTACK|SPECIAL|END_TURN",
  "target": {"x": number, "y": number},
  "reasoning": "brief explanation",
  "dialogue": "what the monster says/thinks"
}`;
  }

  /**
   * Parse AI response and convert to monster decision
   */
  private parseAIDecisionResponse(response: string, gameState: any): MonsterAIResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const decision = JSON.parse(jsonMatch[0]);
      
      return {
        action: {
          type: decision.action?.toLowerCase() || 'end_turn',
          target: decision.target || null,
          reasoning: decision.reasoning || 'AI decision',
          dialogue: decision.dialogue || this.generateFallbackDialogue('generic')
        },
        confidence: 0.8,
        personality: this.personality.name
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.fallbackDecision(gameState);
    }
  }

  private fallbackDecision(gameState: any): MonsterAIResponse {
    const monster = gameState.activeMonster;
    const enemies = gameState.enemies || [];
    const traits = this.personality.behaviorTraits;

    if (!monster || enemies.length === 0) {
      return {
        action: { 
          type: 'end_turn', 
          reasoning: 'No valid targets available',
          dialogue: this.generateFallbackDialogue('no_target')
        },
        confidence: 0.8,
        personality: this.personality.name
      };
    }

    // Simple targeting logic based on personality
    let target;
    switch (traits.targeting) {
      case 'nearest':
        target = this.findNearestEnemy(monster, enemies);
        break;
      case 'weakest':
        target = this.findWeakestEnemy(enemies);
        break;
      case 'strongest':
        target = this.findStrongestEnemy(enemies);
        break;
      case 'random':
        target = enemies[Math.floor(Math.random() * enemies.length)];
        break;
      default:
        target = this.findNearestEnemy(monster, enemies);
    }

    // Determine action based on traits and current situation
    const healthPercent = monster.hp / monster.maxHp;
    const shouldRetreat = healthPercent < (traits.selfPreservation * 0.5);
    const shouldAttack = Math.random() < traits.aggression && !shouldRetreat;

    if (shouldAttack && target) {
      return {
        action: {
          type: 'attack',
          target: { x: target.x, y: target.y },
          reasoning: `Attacking ${target.id} based on ${traits.targeting} targeting`,
          dialogue: this.generateFallbackDialogue('attack')
        },
        confidence: 0.7,
        personality: this.personality.name
      };
    }

    // Default to ending turn
    return {
      action: {
        type: 'end_turn',
        reasoning: 'No aggressive action needed',
        dialogue: this.generateFallbackDialogue('wait')
      },
      confidence: 0.6,
      personality: this.personality.name
    };
  }

  private findNearestEnemy(monster: any, enemies: any[]): any {
    return enemies.reduce((nearest, enemy) => {
      const distToEnemy = Math.abs(monster.x - enemy.x) + Math.abs(monster.y - enemy.y);
      const distToNearest = nearest ? Math.abs(monster.x - nearest.x) + Math.abs(monster.y - nearest.y) : Infinity;
      return distToEnemy < distToNearest ? enemy : nearest;
    }, null);
  }

  private findWeakestEnemy(enemies: any[]): any {
    return enemies.reduce((weakest, enemy) => 
      !weakest || enemy.hp < weakest.hp ? enemy : weakest, null);
  }

  private findStrongestEnemy(enemies: any[]): any {
    return enemies.reduce((strongest, enemy) => 
      !strongest || enemy.hp > strongest.hp ? enemy : strongest, null);
  }

  private generateFallbackDialogue(situation: string): string {
    const { dialogueStyle } = this.personality;
    
    const dialogues: Record<string, Record<string, string[]>> = {
      attack: {
        'Brief, aggressive, bestial': ['*Roars and charges!*', '*Snarls menacingly*', '*Growls with hunger*'],
        'Calculating, menacing, intelligent': ['Time to end this...', 'You chose the wrong prey.', 'Your tactics are pathetic.'],
        'Formal, ancient, duty-bound': ['I shall fulfill my duty.', 'You trespass at your peril.', 'Justice will be served.'],
        'Playful, mocking, chaotic': ['Oh, this should be fun!', 'Let\'s see what you\'ve got!', 'Surprise!'],
        'Mechanical, minimal, functional': ['ENGAGING TARGET.', 'COMBAT PROTOCOLS ACTIVE.', 'THREAT DETECTED.'],
        'Anguished, hateful, threatening': ['Suffer as I have suffered!', 'Your pain will be eternal!', 'Join me in torment!']
      },
      no_target: {
        'Brief, aggressive, bestial': ['*Sniffs the air warily*', '*Paces restlessly*'],
        'Calculating, menacing, intelligent': ['Where are you hiding?', 'I can wait...'],
        'Formal, ancient, duty-bound': ['None dare approach.', 'The watch continues.'],
        'Playful, mocking, chaotic': ['Come out, come out!', 'This is boring...'],
        'Mechanical, minimal, functional': ['NO TARGETS DETECTED.', 'SCANNING...'],
        'Anguished, hateful, threatening': ['Where are the living?', 'I hunger for vengeance...']
      },
      wait: {
        'Brief, aggressive, bestial': ['*Watches intently*', '*Prepares to strike*'],
        'Calculating, menacing, intelligent': ['Patience yields victory.', 'Let them come to me.'],
        'Formal, ancient, duty-bound': ['I maintain my vigil.', 'Duty requires patience.'],
        'Playful, mocking, chaotic': ['What\'s next?', 'Interesting...'],
        'Mechanical, minimal, functional': ['STANDING BY.', 'AWAITING ORDERS.'],
        'Anguished, hateful, threatening': ['My torment continues...', 'Soon, very soon...']
      }
    };

    const options = dialogues[situation]?.[dialogueStyle] || ['...'];
    return options[Math.floor(Math.random() * options.length)];
  }
}

// Global monster AI agent instance
export const monsterAI = new MonsterAIAgent();
