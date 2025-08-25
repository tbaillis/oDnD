// Monster AI Agent for automated pawn control - Dual AI System
import { debugLogger } from '../utils/debugLogger';
import { TacticalCombatAI } from './tacticalCombatAI';
import type { 
  TacticalAnalysis, 
  CombatantStats, 
  BattlefieldInfo 
} from './tacticalCombatAI';
import { RoleplayActingAI } from './roleplayActingAI';
import type { 
  RoleplayResponse, 
  CharacterProfile, 
  RoleplayContext, 
  ActionContext 
} from './roleplayActingAI';

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
  private tacticalAI: TacticalCombatAI;
  private roleplayAI: RoleplayActingAI;
  private currentCharacterProfile: CharacterProfile | null = null;

  constructor() {
    // Start with default personality
    this.personality = MONSTER_PERSONALITIES.savage_beast;
    
    // Initialize the dual AI system
    this.tacticalAI = new TacticalCombatAI();
    this.roleplayAI = new RoleplayActingAI();
    
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
      // Step 1: Tactical Analysis
      const tacticalAnalysis = await this.performTacticalAnalysis(gameState);
      debugLogger.logAI(`Tactical analysis complete: ${tacticalAnalysis.strategies.length} strategies, recommended: ${tacticalAnalysis.recommendedStrategy.name}`, 'Tactical AI');
      
      // Step 2: Character Profile Setup
      const characterProfile = this.getOrCreateCharacterProfile(gameState.activeMonster);
      
      // Step 3: Roleplay Generation
      const roleplayResponse = await this.generateRoleplayResponse(
        characterProfile, 
        gameState, 
        tacticalAnalysis.recommendedStrategy
      );
      
      // Step 4: Convert tactical strategy to game action
      const gameAction = this.convertStrategyToAction(tacticalAnalysis.recommendedStrategy, roleplayResponse);
      
      debugLogger.logAI(`Final decision: ${gameAction.type} with dialogue: "${gameAction.dialogue}"`, 'Monster AI');
      
      return {
        action: gameAction,
        confidence: 0.9,
        personality: this.personality.name
      };

    } catch (error) {
      console.error('Error in dual AI decision making:', error);
      return this.ensureDialogue(this.fallbackDecision(gameState));
    }
  }

  private async performTacticalAnalysis(gameState: any): Promise<TacticalAnalysis> {
    const monster = gameState.activeMonster;
    const enemies = gameState.enemies || [];
    
    // Convert game state to tactical format
    const monsterStats: CombatantStats = {
      id: monster?.id || 'unknown',
      position: { x: monster?.x || 0, y: monster?.y || 0 },
      hp: typeof monster?.hp === 'number' ? monster.hp : 10,
      maxHp: typeof monster?.maxHp === 'number' ? monster.maxHp : 10,
      ac: monster?.ac || 10,
      speed: monster?.speed || 30,
      reach: monster?.reach || 5,
      size: monster?.size || 1,
      abilities: monster?.abilities || [],
      resistances: monster?.resistances || [],
      vulnerabilities: monster?.vulnerabilities || [],
      conditions: monster?.conditions || []
    };

    const enemyStats: CombatantStats[] = enemies.map((enemy: any) => ({
      id: enemy?.id || 'enemy',
      position: { x: enemy?.x || 0, y: enemy?.y || 0 },
      hp: typeof enemy?.hp === 'number' ? enemy.hp : 10,
      maxHp: typeof enemy?.maxHp === 'number' ? enemy.maxHp : 10,
      ac: enemy?.ac || 10,
      speed: enemy?.speed || 30,
      reach: enemy?.reach || 5,
      size: enemy?.size || 1,
      abilities: enemy?.abilities || [],
      resistances: enemy?.resistances || [],
      vulnerabilities: enemy?.vulnerabilities || [],
      conditions: enemy?.conditions || []
    }));

    const battlefieldInfo: BattlefieldInfo = {
      terrain: gameState?.terrain || 'standard',
      hazards: gameState?.hazards || [],
      cover: gameState?.cover || [],
      elevation: gameState?.elevation || [],
      lighting: gameState?.lighting || 'bright',
      weather: gameState?.weather || 'clear'
    };

    return await this.tacticalAI.analyzeBattlefield(
      monsterStats, 
      enemyStats, 
      battlefieldInfo, 
      gameState?.turn || 1
    );
  }

  private getOrCreateCharacterProfile(monster: any): CharacterProfile {
    const monsterId = monster?.id || 'unknown';
    
    // Check if we have a cached profile for this monster
    if (this.currentCharacterProfile && 
        (this.currentCharacterProfile.name === monsterId || 
         this.currentCharacterProfile.name === monster?.name)) {
      return this.currentCharacterProfile;
    }
    
    // Try to get existing profile
    let profile = this.roleplayAI.getCharacterProfile(monsterId);
    
    if (!profile) {
      // Create new profile based on monster stats and personality
      profile = {
        name: monster?.name || `${this.personality.name}`,
        race: monster?.race || 'Unknown',
        class: monster?.class || 'Monster',
        background: monster?.background || this.personality.description,
        personality: this.personality.description,
        motivations: this.extractMotivations(this.personality),
        fears: this.extractFears(this.personality),
        speech_patterns: this.personality.dialogueStyle,
        cultural_background: monster?.culture || 'Unknown',
        current_emotional_state: this.determineEmotionalState(monster),
        relationships: {} // Would be populated based on game context
      };
      
      this.roleplayAI.setCharacterProfile(profile);
      this.currentCharacterProfile = profile;
    }
    
    return profile;
  }

  private async generateRoleplayResponse(
    character: CharacterProfile, 
    gameState: any, 
    strategy: any
  ): Promise<RoleplayResponse> {
    const context: RoleplayContext = {
      situation: `Combat encounter - Turn ${gameState?.turn || 1}`,
      recent_events: gameState?.recentEvents || ['Combat has begun'],
      other_characters_present: (gameState?.enemies || []).map((e: any) => e?.name || 'Enemy'),
      environment: gameState?.environment || 'Battlefield',
      mood: 'tense',
      stakes: this.determineStakes(gameState)
    };

    const actionContext: ActionContext = {
      tactical_decision: strategy.name,
      action_type: strategy.actions[0]?.type || 'end_turn',
      target: strategy.actions[0]?.target ? `(${strategy.actions[0].target.x}, ${strategy.actions[0].target.y})` : null,
      reasoning: strategy.reasoning,
      risk_level: strategy.riskLevel,
      expected_outcome: strategy.expectedOutcome
    };

    return await this.roleplayAI.generateRoleplay(character, context, actionContext);
  }

  private convertStrategyToAction(strategy: any, roleplay: RoleplayResponse): MonsterCombatAction {
    const primaryAction = strategy.actions[0];
    if (!primaryAction) {
      return {
        type: 'end_turn',
        reasoning: 'No tactical action available',
        dialogue: roleplay.dialogue
      };
    }

    return {
      type: primaryAction.type,
      target: primaryAction.target,
      reasoning: `${strategy.name}: ${primaryAction.reasoning}`,
      dialogue: roleplay.dialogue
    };
  }

  private extractMotivations(personality: MonsterPersonality): string[] {
    const motivations: string[] = [];
    
    if (personality.behaviorTraits.aggression > 0.7) {
      motivations.push('Dominate opponents', 'Prove strength');
    }
    if (personality.behaviorTraits.selfPreservation > 0.6) {
      motivations.push('Survive at all costs', 'Protect self');
    }
    if (personality.behaviorTraits.intelligence > 0.7) {
      motivations.push('Outsmart enemies', 'Execute perfect strategy');
    }
    
    return motivations.length > 0 ? motivations : ['Complete the mission'];
  }

  private extractFears(personality: MonsterPersonality): string[] {
    const fears: string[] = [];
    
    if (personality.behaviorTraits.selfPreservation > 0.6) {
      fears.push('Death', 'Serious injury');
    }
    if (personality.behaviorTraits.intelligence > 0.7) {
      fears.push('Being outsmarted', 'Making tactical errors');
    } else if (personality.behaviorTraits.intelligence < 0.3) {
      fears.push('Complex situations', 'Being confused');
    }
    
    return fears.length > 0 ? fears : ['Failure'];
  }

  private determineEmotionalState(monster: any): string {
    if (!monster) return 'neutral';
    
    const healthPercent = (monster.hp || 10) / (monster.maxHp || 10);
    
    if (healthPercent < 0.25) return 'desperate';
    if (healthPercent < 0.5) return 'concerned';
    if (healthPercent > 0.8) return 'confident';
    
    return 'focused';
  }

  private determineStakes(gameState: any): 'low' | 'medium' | 'high' | 'critical' {
    const monster = gameState?.activeMonster;
    if (!monster) return 'medium';
    
    const healthPercent = (monster.hp || 10) / (monster.maxHp || 10);
    const enemyCount = (gameState?.enemies || []).length;
    
    if (healthPercent < 0.25) return 'critical';
    if (healthPercent < 0.5 && enemyCount > 1) return 'high';
    if (enemyCount > 2) return 'high';
    
    return 'medium';
  }

  // Ensure the AI response has a dialogue string and log it for the debug panel.
  private ensureDialogue(resp: MonsterAIResponse): MonsterAIResponse {
    try {
      if (!resp || !resp.action) return resp;
      if (!resp.action.dialogue || typeof resp.action.dialogue !== 'string' || resp.action.dialogue.trim().length === 0) {
        // Pick a dialogue type based on action
        const t = (resp.action.type || 'end_turn').toLowerCase();
        let key = 'wait';
        if (t === 'attack') key = 'attack';
        else if (t === 'move') key = 'attack';
        else if (t === 'end_turn') key = 'wait';
        else key = 'no_target';
        resp.action.dialogue = this.generateFallbackDialogue(key);
      }
      debugLogger.logAI(`Decision resolved: type=${resp.action.type} target=${JSON.stringify(resp.action.target)} dialogue=${resp.action.dialogue}`, 'Monster AI');
    } catch (e) {
      // ignore
    }
    return resp;
  }

  private fallbackDecision(gameState: any): MonsterAIResponse {
    const monster = gameState.activeMonster;
    const enemies = gameState.enemies || [];
    const traits = this.personality.behaviorTraits;

    debugLogger.logAI(`Fallback decision for ${monster?.id || 'unknown'}: moveAvailable=${monster?.moveAvailable}, attackAvailable=${monster?.attackAvailable}, enemies=${enemies.length}`, 'Monster AI');

    if (!monster || enemies.length === 0) {
      debugLogger.logAI('No monster or no enemies - ending turn', 'Monster AI');
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

    if (!target) {
      debugLogger.logAI('No target found - ending turn', 'Monster AI');
      return {
        action: { 
          type: 'end_turn', 
          reasoning: 'No valid targets found',
          dialogue: this.generateFallbackDialogue('no_target')
        },
        confidence: 0.8,
        personality: this.personality.name
      };
    }

  // Calculate distance to target and log robustly
  const tx = typeof target.x === 'number' ? target.x : (target?.position?.x ?? null);
  const ty = typeof target.y === 'number' ? target.y : (target?.position?.y ?? null);
  const distanceToTarget = (typeof tx === 'number' && typeof ty === 'number') ? Math.abs(monster.x - tx) + Math.abs(monster.y - ty) : Infinity;
  debugLogger.logAI(`Distance to target ${target?.id ?? '(no-id)'} @ (${tx ?? '??'},${ty ?? '??'}): ${distanceToTarget}`, 'Monster AI');

    // Determine action based on traits and current situation
  // Safely compute health percent (guard against missing data)
  const hpVal = typeof monster.hp === 'number' ? monster.hp : null;
  const maxHpVal = typeof monster.maxHp === 'number' ? monster.maxHp : null;
  let healthPercent = 1;
  if (hpVal !== null && maxHpVal && maxHpVal > 0) {
    healthPercent = Math.max(0, Math.min(1, hpVal / maxHpVal));
  } else {
    debugLogger.logAI(`HP data missing for ${monster?.id ?? 'unknown'}; hp=${String(monster.hp)} maxHp=${String(monster.maxHp)} - assuming full health`, 'Monster AI');
    healthPercent = 1;
  }
  // Decide retreating based on selfPreservation and low HP
  const shouldRetreat = healthPercent < (traits.selfPreservation * 0.5);

  // Compute a deterministic desire to attack based on aggression, self-preservation and current health.
  // Higher aggression increases desire; higher selfPreservation or low HP reduces it.
  // Intelligence slightly biases toward safer tactical choices (prefers avoiding provokes).
  const aggression = typeof traits.aggression === 'number' ? traits.aggression : 0.5;
  const selfPres = typeof traits.selfPreservation === 'number' ? traits.selfPreservation : 0.5;
  const intelligence = typeof traits.intelligence === 'number' ? traits.intelligence : 0.5;

  // desireToAttack in [0,1]. Reduce desire when at low HP proportionally to selfPres.
  const desireToAttack = aggression * (1 - selfPres * (1 - healthPercent));
  // If already flagged to retreat, strongly avoid attacking.
  const shouldAttack = !shouldRetreat && desireToAttack > 0.5;

  // If we're in melee range and the monster is strongly aggressive, prefer to attack even if desire calc is borderline.
  const canAttack = distanceToTarget <= 1 && monster.attackAvailable;
  const attackPreferred = canAttack && (!shouldRetreat) && (shouldAttack || aggression > 0.65);

  // Compute a related move-aggression flag. Some monsters will move toward targets even if
  // they won't immediately attack (they're aggressive). Allow aggression to force movement.
  const shouldMoveAggressively = !shouldRetreat && (desireToAttack > 0.45 || aggression > 0.55);

  debugLogger.logAI(`Personality: aggr=${aggression.toFixed(2)} intel=${intelligence.toFixed(2)} selfPres=${selfPres.toFixed(2)} hp=${(healthPercent*100).toFixed(0)}% desire=${desireToAttack.toFixed(2)} shouldAttack=${shouldAttack} shouldMoveAggressively=${shouldMoveAggressively}`, 'Monster AI');

    if (attackPreferred) {
      debugLogger.logAI(`Attacking target ${target?.id ?? '(no-id)'} at distance ${distanceToTarget} (attackPreferred)`, 'Monster AI');
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

  // If we can't attack but we can move and should be aggressive, move closer
  if (monster.moveAvailable && distanceToTarget > 1 && shouldMoveAggressively) {
      try {
        const planFromActiveTo = (window as any).planFromActiveTo;
        if (typeof planFromActiveTo === 'function') {
          const { trimmed, info } = planFromActiveTo(target.x, target.y) || {};
          debugLogger.logAI(`Planned movement info to (${target.x},${target.y}): ${info ? info.feet + ' ft' : 'no-info'}`, 'Monster AI');

          // Use movement if planned movement is more than 5 feet
          if (info && typeof info.feet === 'number' && info.feet > 5 && trimmed && trimmed.length > 0) {
            const avoidEnteringTarget = !monster?.canGrapple;
            const isWithinAttackReach = (window as any).isWithinAttackReach;
            const planFn = (window as any).planFromActiveTo;
            const attackerReach = (monster && monster.id === 'A') ? (window as any).reachA : (window as any).reachB;
            const attackerSize = monster?.size || 1;

            type Candidate = { idx: number; x: number; y: number; feet: number; provokes: boolean; inRange: boolean };
            const candidates: Candidate[] = [];

            // Build candidate list from trimmed path but prefer minimal movement (start -> end)
            for (let i = 0; i < trimmed.length; i++) {
              const step = trimmed[i];
              const [sx, sy] = step;
              if (avoidEnteringTarget && sx === target.x && sy === target.y) continue;

              // Get movement info for stopping at this step by re-planning to that coordinate
              let stepInfo: any = null;
              try {
                if (typeof planFn === 'function') {
                  const p = planFn(sx, sy) || {};
                  stepInfo = p.info;
                }
              } catch (e) {
                stepInfo = null;
              }

              const feet = stepInfo?.feet ?? (i + 1) * 5;
              const provokes = stepInfo?.provokes ?? false;

              let inRange = false;
              try {
                if (typeof isWithinAttackReach === 'function') {
                  const r = isWithinAttackReach(sx, sy, target.x, target.y, attackerSize, attackerReach, false);
                  inRange = !!(r && r.inRange);
                }
              } catch (e) {
                inRange = false;
              }

              candidates.push({ idx: i, x: sx, y: sy, feet, provokes, inRange });
            }

            if (candidates.length > 0) {
              // Score candidates: prefer inRange, avoid provokes (weighted by personality), then minimal feet
              // Provocation penalty scales with self-preservation and intelligence (cautious or smart monsters avoid provokes more).
              const provokeWeight = 1 + (selfPres * 1.2) + (intelligence * 1.0);

              candidates.sort((a, b) => {
                const aScore = (a.inRange ? 0 : 10000) + (a.provokes ? Math.round(1000 * provokeWeight) : 0) + a.feet;
                const bScore = (b.inRange ? 0 : 10000) + (b.provokes ? Math.round(1000 * provokeWeight) : 0) + b.feet;
                return aScore - bScore || a.feet - b.feet;
              });

              const best = candidates[0];
              const last = [best.x, best.y];
              debugLogger.logAI(`Selected move step idx=${best.idx} (${last[0]},${last[1]}) feet=${best.feet} provokes=${best.provokes} inRange=${best.inRange}`, 'Monster AI');
              return {
                action: {
                  type: 'move',
                  target: { x: last[0], y: last[1] },
                  reasoning: `Moving closer to ${target.id} (selected step ${best.idx}, ${best.feet} ft, provokes=${best.provokes})`,
                  dialogue: this.generateFallbackDialogue('attack')
                },
                confidence: 0.6,
                personality: this.personality.name
              };
            }

            // If planner returned a trimmed path but no candidates (e.g. all were filtered due to avoidEnteringTarget),
            // pick a safe fallback step from the trimmed path so the monster actually advances.
            if ((!candidates || candidates.length === 0) && trimmed && trimmed.length > 0) {
              // find the furthest step within trimmed that doesn't enter target (respect avoidEnteringTarget)
              let fallbackStep: number[] | null = null;
              for (let i = trimmed.length - 1; i >= 0; i--) {
                const s = trimmed[i];
                if (avoidEnteringTarget && s[0] === (tx ?? target.x) && s[1] === (ty ?? target.y)) continue;
                fallbackStep = s as number[];
                break;
              }

              if (fallbackStep) {
                const [fx, fy] = fallbackStep;
                // check if this step would provoke; if cautious, avoid it
                let fallbackInfo: any = null;
                try {
                  const p = planFn(fx, fy) || {};
                  fallbackInfo = p.info;
                } catch (e) {
                  fallbackInfo = null;
                }
                const fallbackProvokes = !!fallbackInfo?.provokes;
                const isCautious = desireToAttack <= 0.45 || selfPres > 0.6;
                if (fallbackProvokes && isCautious) {
                  debugLogger.logAI(`Skipping fallback move due to provoke + cautious personality`, 'Monster AI');
                } else {
                  debugLogger.logAI(`Fallback moving to (${fx},${fy}) (no candidate chosen) provokes=${fallbackProvokes}`, 'Monster AI');
                  return {
                    action: {
                      type: 'move',
                      target: { x: fx, y: fy },
                      reasoning: `Fallback move toward ${target?.id ?? 'target'}`,
                      dialogue: this.generateFallbackDialogue('attack')
                    },
                    confidence: 0.45,
                    personality: this.personality.name
                  };
                }
              }
            }
          }

          // If movement planned is exactly 5 ft and five-foot-step is available, consider it.
          // But be cautious: if the five-foot step would provoke and the monster is cautious, avoid it.
          if (info && typeof info.feet === 'number' && info.feet === 5 && monster.fiveFootStepAvailable && trimmed && trimmed.length > 0) {
            const last = trimmed[trimmed.length - 1];
            // Use planner to see if that single step would provoke
            let lastInfo: any = null;
            try {
              const planFn = (window as any).planFromActiveTo;
              if (typeof planFn === 'function') {
                const p = planFn(last[0], last[1]) || {};
                lastInfo = p.info;
              }
            } catch (e) {
              lastInfo = null;
            }

            const lastProvokes = !!lastInfo?.provokes;
            // If the monster is cautious (low aggression or high selfPres) avoid provoking
            const cautiousThreshold = 0.45;
            const isCautious = desireToAttack <= cautiousThreshold || selfPres > 0.6;
            if (lastProvokes && isCautious) {
              debugLogger.logAI(`Avoiding five-foot step due to provoke and cautious personality`, 'Monster AI');
            } else {
              debugLogger.logAI(`Using five-foot step toward (${last[0]},${last[1]})`, 'Monster AI');
              return {
                action: {
                  type: 'move',
                  target: { x: last[0], y: last[1] },
                  reasoning: `Taking five-foot step toward ${target.id}`,
                  dialogue: this.generateFallbackDialogue('attack')
                },
                confidence: 0.5,
                personality: this.personality.name
              };
            }
          }
        }
        else {
          // Planner not available: do a simple 5ft step toward the target to ensure movement occurs.
          try {
            const sx = monster.x + Math.sign((target.x ?? tx) - monster.x);
            const sy = monster.y + Math.sign((target.y ?? ty) - monster.y);
            debugLogger.logAI(`Planner unavailable - stepping toward (${sx},${sy})`, 'Monster AI');
            return {
              action: {
                type: 'move',
                target: { x: sx, y: sy },
                reasoning: `Simple move toward ${target?.id ?? 'target'}`,
                dialogue: this.generateFallbackDialogue('attack')
              },
              confidence: 0.4,
              personality: this.personality.name
            };
          } catch (e) {
            // ignore and fall through to end turn
          }
        }
      } catch (e) {
        debugLogger.logAI(`Movement planning failed: ${e instanceof Error ? e.message : String(e)}`, 'Monster AI');
      }
    }

    // Default to ending turn
    debugLogger.logAI('No valid action found - ending turn', 'Monster AI');
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
