// Roleplay Acting AI - Oscar-winning NPC dialogue and character acting
import { debugLogger } from '../utils/debugLogger';

const ROLEPLAY_API_BASE_URL = 'http://localhost:3001/api/dm';

export interface CharacterProfile {
  name: string;
  race: string;
  class: string;
  background: string;
  personality: string;
  motivations: string[];
  fears: string[];
  speech_patterns: string;
  cultural_background: string;
  current_emotional_state: string;
  relationships: Record<string, string>; // character_id -> relationship_type
}

export interface RoleplayContext {
  situation: string;
  recent_events: string[];
  other_characters_present: string[];
  environment: string;
  mood: string;
  stakes: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActionContext {
  tactical_decision: string;
  action_type: 'move' | 'attack' | 'special' | 'defend' | 'retreat' | 'end_turn';
  target: string | null;
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
  expected_outcome: string;
}

export interface RoleplayResponse {
  dialogue: string;
  internal_monologue: string;
  body_language: string;
  vocal_tone: string;
  facial_expression: string;
  environmental_interaction: string;
  emotional_state: string;
  character_development: string;
}

export interface PerformanceAnalysis {
  authenticity: number; // 1-10
  emotional_depth: number; // 1-10
  character_consistency: number; // 1-10
  dramatic_impact: number; // 1-10
  immersion_factor: number; // 1-10
}

export class RoleplayActingAI {
  private isInitialized: boolean = false;
  private characterMemory: Map<string, CharacterProfile> = new Map();
  private conversationHistory: Map<string, string[]> = new Map();

  constructor() {
    this.initialize().catch(error => {
      console.error('Failed to initialize Roleplay Acting AI:', error);
    });
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Roleplay Acting AI...');
      
      // Check if server is available
      const response = await fetch(`${ROLEPLAY_API_BASE_URL}/config`);
      if (response.ok) {
        this.isInitialized = true;
        console.log('✅ Roleplay Acting AI initialized');
      } else {
        this.isInitialized = false;
        console.warn('⚠️ Roleplay AI Server not ready');
      }
    } catch (error) {
      console.error('Error initializing Roleplay Acting AI:', error);
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public async generateRoleplay(
    character: CharacterProfile,
    context: RoleplayContext,
    actionContext: ActionContext
  ): Promise<RoleplayResponse> {
    if (!this.isReady()) {
      return this.generateFallbackRoleplay(character, context, actionContext);
    }

    try {
      const prompt = this.buildRoleplayPrompt(character, context, actionContext);
      
      const response = await fetch(`${ROLEPLAY_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          personality: 'master_actor',
          temperature: 0.8, // Higher temperature for creative roleplay
        }),
      });

      if (!response.ok) {
        throw new Error(`Roleplay generation failed: ${response.status}`);
      }

      const result = await response.json();
      const roleplayResponse = this.parseRoleplayResponse(result.response, character);
      
      // Store in conversation history
      this.updateConversationHistory(character.name, roleplayResponse.dialogue);
      
      debugLogger.logAI(`Generated roleplay for ${character.name}: "${roleplayResponse.dialogue}"`, 'Roleplay AI');
      return roleplayResponse;

    } catch (error) {
      console.error('Error generating roleplay:', error);
      debugLogger.logAI('Roleplay AI failed, using fallback performance', 'Roleplay AI');
      return this.generateFallbackRoleplay(character, context, actionContext);
    }
  }

  private buildRoleplayPrompt(
    character: CharacterProfile,
    context: RoleplayContext,
    actionContext: ActionContext
  ): string {
    const conversationHistory = this.getConversationHistory(character.name);
    
    return `You are an Oscar-winning actor with unparalleled ability to embody any character. You are currently portraying a character in a D&D-style fantasy setting. Your performance must be absolutely authentic, emotionally compelling, and true to the character's nature.

CHARACTER PROFILE:
- Name: ${character.name}
- Race: ${character.race}, Class: ${character.class}
- Background: ${character.background}
- Personality: ${character.personality}
- Motivations: ${character.motivations.join(', ')}
- Fears: ${character.fears.join(', ')}
- Speech Patterns: ${character.speech_patterns}
- Cultural Background: ${character.cultural_background}
- Current Emotional State: ${character.current_emotional_state}
- Relationships: ${Object.entries(character.relationships).map(([k, v]) => `${k}: ${v}`).join(', ')}

CURRENT SITUATION:
- Context: ${context.situation}
- Recent Events: ${context.recent_events.join('; ')}
- Others Present: ${context.other_characters_present.join(', ')}
- Environment: ${context.environment}
- Mood: ${context.mood}
- Stakes: ${context.stakes}

TACTICAL DECISION BEING MADE:
- Decision: ${actionContext.tactical_decision}
- Action Type: ${actionContext.action_type}
- Target: ${actionContext.target || 'None'}
- Reasoning: ${actionContext.reasoning}
- Risk Level: ${actionContext.risk_level}
- Expected Outcome: ${actionContext.expected_outcome}

RECENT DIALOGUE:
${conversationHistory.length > 0 ? conversationHistory.slice(-3).join('\n') : 'No recent dialogue'}

As this character, provide a complete performance that includes spoken dialogue and physical acting. The character is about to take the tactical action described above. Your performance must:

1. Be completely authentic to the character's personality and background
2. Reflect the tactical decision being made
3. Show appropriate emotional depth for the situation
4. Include realistic body language and physical reactions
5. Demonstrate character growth or reveal character depth
6. Create immersion and dramatic impact

Respond with a JSON object in this exact format:
{
  "dialogue": "What the character says aloud (include any battle cries, commands, taunts, etc.)",
  "internal_monologue": "The character's private thoughts during this moment",
  "body_language": "Physical movements, gestures, posture",
  "vocal_tone": "How they sound (tone, volume, pace, emotion in voice)",
  "facial_expression": "Detailed description of facial expression and eyes",
  "environmental_interaction": "How they interact with surroundings during this action",
  "emotional_state": "Their current emotional state and any changes",
  "character_development": "What this moment reveals about the character or how they've grown"
}`;
  }

  private parseRoleplayResponse(response: string, character: CharacterProfile): RoleplayResponse {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in roleplay response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        dialogue: parsed.dialogue || this.generateFallbackDialogue(character),
        internal_monologue: parsed.internal_monologue || "The character focuses on the task at hand.",
        body_language: parsed.body_language || "Maintains a ready stance.",
        vocal_tone: parsed.vocal_tone || "Steady and determined.",
        facial_expression: parsed.facial_expression || "Focused and alert.",
        environmental_interaction: parsed.environmental_interaction || "Surveys the battlefield.",
        emotional_state: parsed.emotional_state || character.current_emotional_state,
        character_development: parsed.character_development || "Shows their tactical nature."
      };

    } catch (error) {
      console.error('Failed to parse roleplay response:', error);
      return this.generateFallbackRoleplay(character, {} as RoleplayContext, {} as ActionContext);
    }
  }

  private generateFallbackRoleplay(
    character: CharacterProfile,
    context: RoleplayContext,
    actionContext: ActionContext
  ): RoleplayResponse {
    debugLogger.logAI(`Generating fallback roleplay for ${character.name}`, 'Roleplay AI');
    
    const dialogue = this.generateFallbackDialogue(character);
    // Context and actionContext would be used for more sophisticated fallbacks
    void context; void actionContext;
    
    return {
      dialogue,
      internal_monologue: "I must stay focused and make the right choice.",
      body_language: "Takes a defensive stance, ready to act.",
      vocal_tone: "Determined but cautious.",
      facial_expression: "Eyes narrowed in concentration.",
      environmental_interaction: "Quickly assesses the immediate surroundings.",
      emotional_state: character.current_emotional_state || "focused",
      character_development: "Shows their ability to adapt under pressure."
    };
  }

  private generateFallbackDialogue(character: CharacterProfile): string {
    const dialogueOptions = {
      aggressive: [
        "You'll regret challenging me!",
        "This ends now!",
        "Come at me if you dare!",
        "I won't hold back!"
      ],
      defensive: [
        "I'll be ready for whatever you throw at me.",
        "Patience... patience...",
        "Let's see what you're capable of.",
        "I'm not going down that easily."
      ],
      tactical: [
        "Time to change the game.",
        "Let's try a different approach.",
        "This calls for strategy.",
        "I need to think this through."
      ],
      determined: [
        "I won't give up!",
        "This is what I trained for.",
        "For my cause!",
        "I must succeed!"
      ]
    };

    // Choose based on character personality
    const personality = character.personality.toLowerCase();
    let category = 'determined'; // default

    if (personality.includes('aggressive') || personality.includes('violent') || personality.includes('fierce')) {
      category = 'aggressive';
    } else if (personality.includes('defensive') || personality.includes('cautious') || personality.includes('careful')) {
      category = 'defensive';
    } else if (personality.includes('tactical') || personality.includes('smart') || personality.includes('cunning')) {
      category = 'tactical';
    }

    const options = dialogueOptions[category as keyof typeof dialogueOptions] || dialogueOptions.determined;
    return options[Math.floor(Math.random() * options.length)];
  }

  public analyzePerformance(roleplayResponse: RoleplayResponse, character: CharacterProfile): PerformanceAnalysis {
    // Simple heuristic analysis - in a real implementation this could be more sophisticated
    const authenticity = this.evaluateAuthenticity(roleplayResponse, character);
    const emotionalDepth = this.evaluateEmotionalDepth(roleplayResponse);
    const characterConsistency = this.evaluateConsistency(roleplayResponse, character);
    const dramaticImpact = this.evaluateDramaticImpact(roleplayResponse);
    const immersionFactor = (authenticity + emotionalDepth + characterConsistency + dramaticImpact) / 4;

    return {
      authenticity,
      emotional_depth: emotionalDepth,
      character_consistency: characterConsistency,
      dramatic_impact: dramaticImpact,
      immersion_factor: immersionFactor
    };
  }

  private evaluateAuthenticity(response: RoleplayResponse, character: CharacterProfile): number {
    // Check if dialogue matches character's speech patterns and personality
    let score = 5; // baseline
    
    if (response.dialogue.length > 10) score += 1; // substantial dialogue
    if (response.internal_monologue.length > 10) score += 1; // inner depth
    if (response.body_language.includes('stance') || response.body_language.includes('gesture')) score += 1;
    if (response.emotional_state !== character.current_emotional_state) score += 1; // emotional evolution
    
    return Math.min(10, Math.max(1, score));
  }

  private evaluateEmotionalDepth(response: RoleplayResponse): number {
    let score = 3; // baseline
    
    if (response.internal_monologue.length > 20) score += 2;
    if (response.facial_expression.length > 10) score += 1;
    if (response.vocal_tone.length > 10) score += 2;
    if (response.character_development.length > 20) score += 2;
    
    return Math.min(10, Math.max(1, score));
  }

  private evaluateConsistency(response: RoleplayResponse, character: CharacterProfile): number {
    // This would check against established character traits and history
    void response; void character; // Would be used for sophisticated consistency analysis
    return 8; // Assume good consistency for fallback
  }

  private evaluateDramaticImpact(response: RoleplayResponse): number {
    let score = 4; // baseline
    
    if (response.dialogue.includes('!') || response.dialogue.includes('?')) score += 1;
    if (response.environmental_interaction.length > 10) score += 2;
    if (response.body_language.includes('dramatic') || response.body_language.includes('bold')) score += 2;
    if (response.character_development.includes('reveals') || response.character_development.includes('shows')) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  private updateConversationHistory(characterName: string, dialogue: string): void {
    if (!this.conversationHistory.has(characterName)) {
      this.conversationHistory.set(characterName, []);
    }
    
    const history = this.conversationHistory.get(characterName)!;
    history.push(dialogue);
    
    // Keep only last 10 entries
    if (history.length > 10) {
      history.shift();
    }
  }

  private getConversationHistory(characterName: string): string[] {
    return this.conversationHistory.get(characterName) || [];
  }

  public updateCharacterProfile(characterName: string, updates: Partial<CharacterProfile>): void {
    const existing = this.characterMemory.get(characterName);
    if (existing) {
      this.characterMemory.set(characterName, { ...existing, ...updates });
    }
  }

  public setCharacterProfile(character: CharacterProfile): void {
    this.characterMemory.set(character.name, character);
  }

  public getCharacterProfile(characterName: string): CharacterProfile | null {
    return this.characterMemory.get(characterName) || null;
  }
}
