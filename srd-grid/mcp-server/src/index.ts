import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
  Prompt,
  Resource
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Game state and data types
interface GameState {
  currentEncounter: Encounter | null;
  players: Player[];
  activePlayer: string | null;
  initiative: InitiativeEntry[];
  environment: Environment;
  story: StoryContext;
}

interface Player {
  id: string;
  name: string;
  character: any; // Use existing character type from game
  position: { x: number; y: number };
  status: 'active' | 'unconscious' | 'dead' | 'stabilized';
}

interface Encounter {
  id: string;
  name: string;
  description: string;
  monsters: Monster[];
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  environment: string;
}

interface Monster {
  id: string;
  name: string;
  data: any; // Use existing monster data type
  position: { x: number; y: number };
  currentHp: number;
  status: string[];
  initiative: number;
}

interface InitiativeEntry {
  id: string;
  name: string;
  type: 'player' | 'monster';
  initiative: number;
  hasActed: boolean;
}

interface Environment {
  lighting: 'bright' | 'dim' | 'dark';
  weather: string;
  terrain: string[];
  hazards: string[];
  visibility: number;
}

interface StoryContext {
  currentScene: string;
  previousEvents: string[];
  goals: string[];
  secrets: string[];
  npcRelationships: Record<string, number>; // NPC ID to relationship score
}

// MCP Server implementation
class DungeonMasterMCPServer {
  private server: Server;
  private gameState: GameState;

  constructor() {
    this.server = new Server(
      {
        name: 'dnd-dungeon-master-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    );

    this.gameState = {
      currentEncounter: null,
      players: [],
      activePlayer: null,
      initiative: [],
      environment: {
        lighting: 'bright',
        weather: 'clear',
        terrain: [],
        hazards: [],
        visibility: 120
      },
      story: {
        currentScene: '',
        previousEvents: [],
        goals: [],
        secrets: [],
        npcRelationships: {}
      }
    };

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Combat Management Tools
          {
            name: 'start_encounter',
            description: 'Start a new combat encounter with specified monsters',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the encounter' },
                description: { type: 'string', description: 'Description of the encounter' },
                monsters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      count: { type: 'number' },
                      positions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            x: { type: 'number' },
                            y: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                },
                environment: { type: 'string', description: 'Environment description' }
              },
              required: ['name', 'monsters']
            }
          },
          {
            name: 'roll_initiative',
            description: 'Roll initiative for all participants in combat',
            inputSchema: {
              type: 'object',
              properties: {
                participants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['player', 'monster'] },
                      initiativeBonus: { type: 'number' }
                    }
                  }
                }
              },
              required: ['participants']
            }
          },
          {
            name: 'apply_damage',
            description: 'Apply damage to a character or monster',
            inputSchema: {
              type: 'object',
              properties: {
                targetId: { type: 'string' },
                damage: { type: 'number' },
                damageType: { type: 'string' },
                source: { type: 'string' }
              },
              required: ['targetId', 'damage']
            }
          },
          {
            name: 'apply_healing',
            description: 'Apply healing to a character or monster',
            inputSchema: {
              type: 'object',
              properties: {
                targetId: { type: 'string' },
                healing: { type: 'number' },
                source: { type: 'string' }
              },
              required: ['targetId', 'healing']
            }
          },
          {
            name: 'apply_condition',
            description: 'Apply a condition to a character or monster',
            inputSchema: {
              type: 'object',
              properties: {
                targetId: { type: 'string' },
                condition: { type: 'string' },
                duration: { type: 'number', description: 'Duration in rounds' },
                source: { type: 'string' }
              },
              required: ['targetId', 'condition']
            }
          },
          {
            name: 'remove_condition',
            description: 'Remove a condition from a character or monster',
            inputSchema: {
              type: 'object',
              properties: {
                targetId: { type: 'string' },
                condition: { type: 'string' }
              },
              required: ['targetId', 'condition']
            }
          },

          // Environment and Scene Tools
          {
            name: 'set_environment',
            description: 'Set the current environment conditions',
            inputSchema: {
              type: 'object',
              properties: {
                lighting: { type: 'string', enum: ['bright', 'dim', 'dark'] },
                weather: { type: 'string' },
                terrain: { type: 'array', items: { type: 'string' } },
                hazards: { type: 'array', items: { type: 'string' } },
                visibility: { type: 'number' }
              }
            }
          },
          {
            name: 'describe_scene',
            description: 'Describe the current scene to players',
            inputSchema: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                senses: {
                  type: 'object',
                  properties: {
                    sight: { type: 'string' },
                    sound: { type: 'string' },
                    smell: { type: 'string' },
                    touch: { type: 'string' }
                  }
                }
              },
              required: ['description']
            }
          },

          // Story and NPC Tools
          {
            name: 'update_story_context',
            description: 'Update the current story context and goals',
            inputSchema: {
              type: 'object',
              properties: {
                currentScene: { type: 'string' },
                newEvents: { type: 'array', items: { type: 'string' } },
                goals: { type: 'array', items: { type: 'string' } },
                secrets: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          {
            name: 'manage_npc_relationship',
            description: 'Update NPC relationship scores',
            inputSchema: {
              type: 'object',
              properties: {
                npcId: { type: 'string' },
                change: { type: 'number', description: 'Change in relationship score (-10 to +10)' },
                reason: { type: 'string' }
              },
              required: ['npcId', 'change']
            }
          },

          // Game Mechanics Tools
          {
            name: 'make_ability_check',
            description: 'Make an ability check for a character',
            inputSchema: {
              type: 'object',
              properties: {
                characterId: { type: 'string' },
                ability: { type: 'string', enum: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] },
                dc: { type: 'number' },
                skill: { type: 'string', description: 'Optional skill to use' },
                advantage: { type: 'boolean' },
                disadvantage: { type: 'boolean' }
              },
              required: ['characterId', 'ability', 'dc']
            }
          },
          {
            name: 'make_saving_throw',
            description: 'Make a saving throw for a character',
            inputSchema: {
              type: 'object',
              properties: {
                characterId: { type: 'string' },
                saveType: { type: 'string', enum: ['fortitude', 'reflex', 'will'] },
                dc: { type: 'number' },
                advantage: { type: 'boolean' },
                disadvantage: { type: 'boolean' }
              },
              required: ['characterId', 'saveType', 'dc']
            }
          },
          {
            name: 'roll_dice',
            description: 'Roll dice with specified notation (e.g., 2d6+3)',
            inputSchema: {
              type: 'object',
              properties: {
                dice: { type: 'string', description: 'Dice notation (e.g., 2d6+3)' },
                reason: { type: 'string' }
              },
              required: ['dice']
            }
          },

          // Utility Tools
          {
            name: 'get_game_state',
            description: 'Get the current game state',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'move_character',
            description: 'Move a character or monster to a new position',
            inputSchema: {
              type: 'object',
              properties: {
                characterId: { type: 'string' },
                x: { type: 'number' },
                y: { type: 'number' },
                checkMovement: { type: 'boolean', description: 'Check if movement is valid' }
              },
              required: ['characterId', 'x', 'y']
            }
          },
          {
            name: 'end_turn',
            description: 'End the current character\'s turn and advance initiative',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ] as Tool[]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'start_encounter':
            return this.startEncounter(args);
          case 'roll_initiative':
            return this.rollInitiative(args);
          case 'apply_damage':
            return this.applyDamage(args);
          case 'apply_healing':
            return this.applyHealing(args);
          case 'apply_condition':
            return this.applyCondition(args);
          case 'remove_condition':
            return this.removeCondition(args);
          case 'set_environment':
            return this.setEnvironment(args);
          case 'describe_scene':
            return this.describeScene(args);
          case 'update_story_context':
            return this.updateStoryContext(args);
          case 'manage_npc_relationship':
            return this.manageNPCRelationship(args);
          case 'make_ability_check':
            return this.makeAbilityCheck(args);
          case 'make_saving_throw':
            return this.makeSavingThrow(args);
          case 'roll_dice':
            return this.rollDice(args);
          case 'get_game_state':
            return this.getGameState(args);
          case 'move_character':
            return this.moveCharacter(args);
          case 'end_turn':
            return this.endTurn(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${errorMessage}`
            }
          ]
        };
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'dm_assistant',
            description: 'Dungeon Master assistant for running D&D sessions',
            arguments: [
              {
                name: 'scenario',
                description: 'Current scenario or situation',
                required: false
              },
              {
                name: 'player_action',
                description: 'Player action to respond to',
                required: false
              }
            ]
          },
          {
            name: 'combat_narrator',
            description: 'Narrate combat actions and outcomes',
            arguments: [
              {
                name: 'action_type',
                description: 'Type of combat action',
                required: true
              },
              {
                name: 'result',
                description: 'Result of the action',
                required: true
              }
            ]
          }
        ] as Prompt[]
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'dm_assistant':
          return this.getDMAssistantPrompt(args);
        case 'combat_narrator':
          return this.getCombatNarratorPrompt(args);
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'game://state',
            name: 'Current Game State',
            description: 'Current state of the D&D game session',
            mimeType: 'application/json'
          },
          {
            uri: 'game://players',
            name: 'Player Characters',
            description: 'List of all player characters',
            mimeType: 'application/json'
          },
          {
            uri: 'game://encounter',
            name: 'Current Encounter',
            description: 'Current combat encounter details',
            mimeType: 'application/json'
          }
        ] as Resource[]
      };
    });

    // Handle resource requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'game://state':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.gameState, null, 2)
              }
            ]
          };
        case 'game://players':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.gameState.players, null, 2)
              }
            ]
          };
        case 'game://encounter':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.gameState.currentEncounter, null, 2)
              }
            ]
          };
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  // Tool implementation methods
  private async startEncounter(args: any) {
    // Implementation would integrate with the existing game system
    this.gameState.currentEncounter = {
      id: Date.now().toString(),
      name: args.name,
      description: args.description || '',
      monsters: [], // Would populate from args.monsters
      difficulty: 'medium', // Would calculate based on monsters
      environment: args.environment || 'dungeon'
    };

    return {
      content: [
        {
          type: 'text',
          text: `Started encounter: ${args.name}. Ready to roll initiative.`
        }
      ]
    };
  }

  private async rollInitiative(args: any) {
    // Implementation would integrate with existing dice rolling system
    const results = args.participants.map((p: any) => ({
      ...p,
      initiative: Math.floor(Math.random() * 20) + 1 + (p.initiativeBonus || 0),
      hasActed: false
    }));

    results.sort((a: any, b: any) => b.initiative - a.initiative);
    this.gameState.initiative = results;

    return {
      content: [
        {
          type: 'text',
          text: `Initiative rolled:\n${results.map((r: any) => `${r.name}: ${r.initiative}`).join('\n')}`
        }
      ]
    };
  }

  private async applyDamage(args: any) {
    // Implementation would integrate with existing damage system
    return {
      content: [
        {
          type: 'text',
          text: `Applied ${args.damage} ${args.damageType || 'damage'} to ${args.targetId}`
        }
      ]
    };
  }

  private async applyHealing(args: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Applied ${args.healing} healing to ${args.targetId}`
        }
      ]
    };
  }

  private async applyCondition(args: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Applied condition ${args.condition} to ${args.targetId} for ${args.duration || 'indefinite'} rounds`
        }
      ]
    };
  }

  private async removeCondition(args: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Removed condition ${args.condition} from ${args.targetId}`
        }
      ]
    };
  }

  private async setEnvironment(args: any) {
    this.gameState.environment = { ...this.gameState.environment, ...args };
    return {
      content: [
        {
          type: 'text',
          text: `Environment updated: ${JSON.stringify(args)}`
        }
      ]
    };
  }

  private async describeScene(args: any) {
    this.gameState.story.currentScene = args.description;
    return {
      content: [
        {
          type: 'text',
          text: `Scene described: ${args.description}`
        }
      ]
    };
  }

  private async updateStoryContext(args: any) {
    if (args.currentScene) this.gameState.story.currentScene = args.currentScene;
    if (args.newEvents) this.gameState.story.previousEvents.push(...args.newEvents);
    if (args.goals) this.gameState.story.goals = args.goals;
    if (args.secrets) this.gameState.story.secrets = args.secrets;

    return {
      content: [
        {
          type: 'text',
          text: 'Story context updated successfully'
        }
      ]
    };
  }

  private async manageNPCRelationship(args: any) {
    this.gameState.story.npcRelationships[args.npcId] = 
      (this.gameState.story.npcRelationships[args.npcId] || 0) + args.change;

    return {
      content: [
        {
          type: 'text',
          text: `NPC ${args.npcId} relationship changed by ${args.change}. New score: ${this.gameState.story.npcRelationships[args.npcId]}`
        }
      ]
    };
  }

  private async makeAbilityCheck(args: any) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= args.dc;
    
    return {
      content: [
        {
          type: 'text',
          text: `${args.ability} check (DC ${args.dc}): ${roll} - ${success ? 'SUCCESS' : 'FAILURE'}`
        }
      ]
    };
  }

  private async makeSavingThrow(args: any) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= args.dc;
    
    return {
      content: [
        {
          type: 'text',
          text: `${args.saveType} save (DC ${args.dc}): ${roll} - ${success ? 'SUCCESS' : 'FAILURE'}`
        }
      ]
    };
  }

  private async rollDice(args: any) {
    // Simple dice rolling - would integrate with existing RNG system
    const result = this.parseDiceNotation(args.dice);
    
    return {
      content: [
        {
          type: 'text',
          text: `Rolled ${args.dice}: ${result}${args.reason ? ` (${args.reason})` : ''}`
        }
      ]
    };
  }

  private parseDiceNotation(notation: string): number {
    // Simple implementation - would use existing dice system
    const match = notation.match(/(\d+)d(\d+)(?:([+-])(\d+))?/);
    if (!match) return 0;

    const [, numDice, sides, operator, modifier] = match;
    let total = 0;

    for (let i = 0; i < parseInt(numDice); i++) {
      total += Math.floor(Math.random() * parseInt(sides)) + 1;
    }

    if (modifier) {
      const mod = parseInt(modifier);
      total += operator === '+' ? mod : -mod;
    }

    return total;
  }

  private async getGameState(args: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(this.gameState, null, 2)
        }
      ]
    };
  }

  private async moveCharacter(args: any) {
    // Would integrate with existing movement system
    return {
      content: [
        {
          type: 'text',
          text: `Moved ${args.characterId} to position (${args.x}, ${args.y})`
        }
      ]
    };
  }

  private async endTurn(args: any) {
    // Would integrate with existing turn system
    return {
      content: [
        {
          type: 'text',
          text: 'Turn ended, advancing to next in initiative order'
        }
      ]
    };
  }

  // Prompt implementation methods
  private async getDMAssistantPrompt(args: any) {
    const gameContext = JSON.stringify(this.gameState, null, 2);
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are an expert Dungeon Master assistant for a D&D 3.5e game. 

Current Game State:
${gameContext}

${args.scenario ? `Current Scenario: ${args.scenario}` : ''}
${args.player_action ? `Player Action: ${args.player_action}` : ''}

Please provide guidance, suggestions, or narration as appropriate for the current situation. Consider the environment, story context, character relationships, and game mechanics.`
          }
        }
      ]
    };
  }

  private async getCombatNarratorPrompt(args: any) {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a combat narrator for a D&D 3.5e game. 

Action Type: ${args.action_type}
Result: ${args.result}

Please provide vivid, engaging narration for this combat action and its outcome. Make it exciting and cinematic while staying true to D&D combat mechanics.`
          }
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Dungeon Master MCP Server running on stdio');
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DungeonMasterMCPServer();
  server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

export { DungeonMasterMCPServer };
