// Tactical Combat AI - Strategic battlefield analysis and decision making
import { debugLogger } from '../utils/debugLogger';

const TACTICAL_API_BASE_URL = 'http://localhost:3001/api/dm';

export interface BattlefieldInfo {
  terrain: string;
  hazards: any[];
  cover: any[];
  elevation: any[];
  lighting: string;
  weather: string;
}

export interface CombatantStats {
  id: string;
  position: { x: number; y: number };
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  reach: number;
  size: number;
  abilities: string[];
  resistances: string[];
  vulnerabilities: string[];
  conditions: string[];
}

export interface TacticalStrategy {
  type: 'offensive' | 'defensive' | 'neutral' | 'optional';
  priority: number; // 1-10, higher = more preferred
  name: string;
  description: string;
  actions: TacticalAction[];
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedOutcome: string;
}

export interface TacticalAction {
  type: 'move' | 'attack' | 'special' | 'defend' | 'retreat';
  target?: { x: number; y: number };
  ability?: string;
  reasoning: string;
  order: number; // sequence within strategy
}

export interface TacticalAnalysis {
  strategies: TacticalStrategy[];
  battlefieldAssessment: string;
  threatLevel: 'minimal' | 'moderate' | 'severe' | 'critical';
  recommendedStrategy: TacticalStrategy;
  contingencyPlans: string[];
}

export class TacticalCombatAI {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize().catch(error => {
      console.error('Failed to initialize Tactical Combat AI:', error);
    });
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Tactical Combat AI...');
      
      // Check if server is available
      const response = await fetch(`${TACTICAL_API_BASE_URL}/config`);
      if (response.ok) {
        this.isInitialized = true;
        console.log('✅ Tactical Combat AI initialized');
      } else {
        this.isInitialized = false;
        console.warn('⚠️ Tactical AI Server not ready');
      }
    } catch (error) {
      console.error('Error initializing Tactical Combat AI:', error);
      this.isInitialized = false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public async analyzeBattlefield(
    monsterStats: CombatantStats,
    enemyStats: CombatantStats[],
    battlefieldInfo: BattlefieldInfo,
    currentTurn: number
  ): Promise<TacticalAnalysis> {
    if (!this.isReady()) {
      return this.generateFallbackAnalysis(monsterStats, enemyStats);
    }

    try {
      const prompt = this.buildTacticalPrompt(monsterStats, enemyStats, battlefieldInfo, currentTurn);
      
      const response = await fetch(`${TACTICAL_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          personality: 'tactical_strategist',
          temperature: 0.3, // Lower temperature for more consistent tactical analysis
        }),
      });

      if (!response.ok) {
        throw new Error(`Tactical analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return this.parseTacticalResponse(result.response, monsterStats, enemyStats);
    } catch (error) {
      console.error('Error in tactical analysis:', error);
      debugLogger.logAI('Tactical AI failed, using fallback analysis', 'Tactical AI');
      return this.generateFallbackAnalysis(monsterStats, enemyStats);
    }
  }

  private buildTacticalPrompt(
    monster: CombatantStats,
    enemies: CombatantStats[],
    battlefield: BattlefieldInfo,
    turn: number
  ): string {
    return `You are the world's greatest tactical combat strategist for D&D-style grid-based combat. Analyze this battlefield situation and provide strategic recommendations.

MONSTER STATS:
- Position: (${monster.position.x}, ${monster.position.y})
- HP: ${monster.hp}/${monster.maxHp} (${Math.round((monster.hp/monster.maxHp)*100)}%)
- AC: ${monster.ac}, Speed: ${monster.speed}ft, Reach: ${monster.reach}ft
- Size: ${monster.size}, Abilities: ${monster.abilities.join(', ')}
- Resistances: ${monster.resistances.join(', ')}
- Vulnerabilities: ${monster.vulnerabilities.join(', ')}
- Conditions: ${monster.conditions.join(', ')}

ENEMIES (${enemies.length} total):
${enemies.map((e, i) => `Enemy ${i+1}: Position (${e.position.x}, ${e.position.y}), HP ${e.hp}/${e.maxHp}, AC ${e.ac}, Speed ${e.speed}ft`).join('\n')}

BATTLEFIELD:
- Terrain: ${battlefield.terrain}
- Hazards: ${battlefield.hazards.length} present
- Cover: ${battlefield.cover.length} elements
- Lighting: ${battlefield.lighting}
- Weather: ${battlefield.weather}

TURN: ${turn}

Provide a tactical analysis with exactly 3-10 strategies ranked by preference. Each strategy must be categorized as offensive, defensive, or neutral, with at least one of each type.

Respond with a JSON object in this exact format:
{
  "battlefieldAssessment": "Brief tactical overview",
  "threatLevel": "minimal|moderate|severe|critical",
  "strategies": [
    {
      "type": "offensive|defensive|neutral|optional",
      "priority": 1-10,
      "name": "Strategy Name",
      "description": "Detailed strategy description",
      "actions": [
        {
          "type": "move|attack|special|defend|retreat",
          "target": {"x": number, "y": number},
          "ability": "ability name if applicable",
          "reasoning": "why this action",
          "order": 1
        }
      ],
      "reasoning": "Strategic rationale",
      "riskLevel": "low|medium|high",
      "expectedOutcome": "Predicted result"
    }
  ],
  "contingencyPlans": ["Plan A", "Plan B", "Plan C"]
}`;
  }

  private parseTacticalResponse(response: string, monster: CombatantStats, enemies: CombatantStats[]): TacticalAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in tactical response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and clean up the analysis
      const strategies: TacticalStrategy[] = (analysis.strategies || []).slice(0, 10).map((s: any, i: number) => ({
        type: ['offensive', 'defensive', 'neutral', 'optional'].includes(s.type) ? s.type : 'neutral',
        priority: typeof s.priority === 'number' ? Math.max(1, Math.min(10, s.priority)) : i + 1,
        name: s.name || `Strategy ${i + 1}`,
        description: s.description || 'Tactical maneuver',
        actions: (s.actions || []).map((a: any, j: number) => ({
          type: ['move', 'attack', 'special', 'defend', 'retreat'].includes(a.type) ? a.type : 'move',
          target: a.target || { x: monster.position.x, y: monster.position.y },
          ability: a.ability || null,
          reasoning: a.reasoning || 'Tactical action',
          order: typeof a.order === 'number' ? a.order : j + 1
        })),
        reasoning: s.reasoning || 'Strategic decision',
        riskLevel: ['low', 'medium', 'high'].includes(s.riskLevel) ? s.riskLevel : 'medium',
        expectedOutcome: s.expectedOutcome || 'Unknown outcome'
      }));

      // Ensure we have at least one of each required type
      const hasOffensive = strategies.some(s => s.type === 'offensive');
      const hasDefensive = strategies.some(s => s.type === 'defensive');
      const hasNeutral = strategies.some(s => s.type === 'neutral');

      if (!hasOffensive || !hasDefensive || !hasNeutral) {
        debugLogger.logAI('Tactical response missing required strategy types, adding fallbacks', 'Tactical AI');
        // Add missing strategy types with fallbacks
        if (!hasOffensive) strategies.push(this.createFallbackStrategy('offensive', monster, enemies));
        if (!hasDefensive) strategies.push(this.createFallbackStrategy('defensive', monster, enemies));
        if (!hasNeutral) strategies.push(this.createFallbackStrategy('neutral', monster, enemies));
      }

      // Sort by priority (highest first)
      strategies.sort((a, b) => b.priority - a.priority);

      const result: TacticalAnalysis = {
        strategies,
        battlefieldAssessment: analysis.battlefieldAssessment || 'Standard combat situation',
        threatLevel: ['minimal', 'moderate', 'severe', 'critical'].includes(analysis.threatLevel) 
          ? analysis.threatLevel : 'moderate',
        recommendedStrategy: strategies[0],
        contingencyPlans: Array.isArray(analysis.contingencyPlans) 
          ? analysis.contingencyPlans.slice(0, 5) 
          : ['Adapt to battlefield changes', 'Focus on survival', 'Exploit enemy weaknesses']
      };

      debugLogger.logAI(`Tactical analysis complete: ${strategies.length} strategies, threat level: ${result.threatLevel}`, 'Tactical AI');
      return result;

    } catch (error) {
      console.error('Failed to parse tactical response:', error);
      debugLogger.logAI('Tactical parsing failed, using fallback', 'Tactical AI');
      return this.generateFallbackAnalysis(monster, enemies);
    }
  }

  private createFallbackStrategy(type: 'offensive' | 'defensive' | 'neutral', monster: CombatantStats, enemies: CombatantStats[]): TacticalStrategy {
    const nearestEnemy = enemies.reduce((nearest, enemy) => {
      const distToEnemy = Math.abs(monster.position.x - enemy.position.x) + Math.abs(monster.position.y - enemy.position.y);
      const distToNearest = nearest ? 
        Math.abs(monster.position.x - nearest.position.x) + Math.abs(monster.position.y - nearest.position.y) : 
        Infinity;
      return distToEnemy < distToNearest ? enemy : nearest;
    }, null as CombatantStats | null);

    const target = nearestEnemy || { position: { x: monster.position.x, y: monster.position.y } };
    const distanceToTarget = nearestEnemy ? 
      Math.abs(monster.position.x - nearestEnemy.position.x) + Math.abs(monster.position.y - nearestEnemy.position.y) : 
      0;

    switch (type) {
      case 'offensive':
        const offensiveActions: TacticalAction[] = [];
        
        // If not in melee range, add movement first
        if (distanceToTarget > 1) {
          offensiveActions.push({
            type: 'move',
            target: {
              x: target.position.x + (target.position.x > monster.position.x ? -1 : target.position.x < monster.position.x ? 1 : 0),
              y: target.position.y + (target.position.y > monster.position.y ? -1 : target.position.y < monster.position.y ? 1 : 0)
            },
            reasoning: 'Move into melee range for attack',
            order: 1
          });
        }
        
        // Always add attack action
        offensiveActions.push({
          type: 'attack',
          target: target.position,
          reasoning: 'Strike the primary threat',
          order: distanceToTarget > 1 ? 2 : 1
        });

        return {
          type: 'offensive',
          priority: 7,
          name: 'Direct Assault',
          description: distanceToTarget > 1 ? 'Move to engage and attack the nearest enemy' : 'Attack the nearest enemy',
          actions: offensiveActions,
          reasoning: 'Aggressive approach to eliminate threats quickly',
          riskLevel: 'medium',
          expectedOutcome: 'Potential damage to enemy, exposure to counterattack'
        };

      case 'defensive':
        const defensiveActions: TacticalAction[] = [];
        
        // If too close to enemies, move to safer position first
        if (distanceToTarget <= 2) {
          defensiveActions.push({
            type: 'move',
            target: {
              x: monster.position.x - Math.sign(target.position.x - monster.position.x),
              y: monster.position.y - Math.sign(target.position.y - monster.position.y)
            },
            reasoning: 'Retreat to safer position',
            order: 1
          });
        }
        
        // Then take defensive stance
        defensiveActions.push({
          type: 'defend',
          target: monster.position,
          reasoning: 'Minimize incoming damage and observe enemy movements',
          order: defensiveActions.length + 1
        });

        return {
          type: 'defensive',
          priority: 5,
          name: 'Defensive Positioning',
          description: distanceToTarget <= 2 ? 'Retreat and take defensive stance' : 'Take defensive stance',
          actions: defensiveActions,
          reasoning: 'Conservative approach to preserve health and resources',
          riskLevel: 'low',
          expectedOutcome: 'Reduced damage taken, information gathering'
        };

      case 'neutral':
        const neutralActions: TacticalAction[] = [];
        
        // Move to better tactical position
        neutralActions.push({
          type: 'move',
          target: { 
            x: monster.position.x + Math.sign(target.position.x - monster.position.x), 
            y: monster.position.y + Math.sign(target.position.y - monster.position.y) 
          },
          reasoning: 'Improve battlefield position while maintaining flexibility',
          order: 1
        });
        
        // If still have actions and in range, consider a cautious attack
        if (distanceToTarget <= 3) {
          neutralActions.push({
            type: 'attack',
            target: target.position,
            reasoning: 'Opportunistic strike while maintaining tactical flexibility',
            order: 2
          });
        }

        return {
          type: 'neutral',
          priority: 6,
          name: 'Tactical Maneuvering',
          description: neutralActions.length > 1 ? 'Reposition and strike if opportunity presents' : 'Move to more advantageous position',
          actions: neutralActions,
          reasoning: 'Balanced approach maintaining tactical options',
          riskLevel: 'low',
          expectedOutcome: neutralActions.length > 1 ? 'Better positioning and potential damage' : 'Better positioning for future actions'
        };
    }
  }

  private generateFallbackAnalysis(monster: CombatantStats, enemies: CombatantStats[]): TacticalAnalysis {
    debugLogger.logAI('Generating fallback tactical analysis', 'Tactical AI');
    
    const healthPercent = monster.hp / monster.maxHp;
    const threatLevel = healthPercent < 0.25 ? 'critical' : 
                       healthPercent < 0.5 ? 'severe' : 
                       healthPercent < 0.75 ? 'moderate' : 'minimal';

    const strategies: TacticalStrategy[] = [
      this.createFallbackStrategy('offensive', monster, enemies),
      this.createFallbackStrategy('defensive', monster, enemies),
      this.createFallbackStrategy('neutral', monster, enemies)
    ];

    return {
      strategies,
      battlefieldAssessment: `Fallback analysis: ${enemies.length} enemies present, monster at ${Math.round(healthPercent * 100)}% health`,
      threatLevel: threatLevel as any,
      recommendedStrategy: strategies[0],
      contingencyPlans: [
        'Adapt based on enemy actions',
        'Preserve health if severely wounded',
        'Focus on nearest threats first'
      ]
    };
  }
}
