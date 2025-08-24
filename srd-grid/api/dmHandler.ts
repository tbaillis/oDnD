import OpenAI from 'openai';
import { AI_PERSONALITIES } from './personalities.js';

// Initialize OpenAI client with environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

export interface DMRequest {
  message: string;
  personality: string;
  gameContext?: any;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
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
  error?: string;
}

export async function handleDMRequest(request: DMRequest): Promise<DMResponse> {
  try {
    const { message, personality, gameContext, conversationHistory = [] } = request;
    
    // Get personality configuration
    const personalityConfig = AI_PERSONALITIES[personality] || AI_PERSONALITIES.experienced_wise_mentor;
    
    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(personalityConfig, gameContext);
    
    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 2048,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response content received from OpenAI');
    }

    // Parse response for actions and tool calls
    const suggestedActions = extractSuggestedActions(responseContent);
    const mcpToolCalls = parsePotentialToolCalls(responseContent);

    return {
      content: responseContent,
      confidence: completion.choices[0]?.finish_reason === 'stop' ? 0.9 : 0.7,
      suggestedActions,
      mcpToolCalls
    };

  } catch (error) {
    console.error('Error in DM request:', error);
    
    return {
      content: `*The Dungeon Master looks troubled*\n\nI apologize, but I encountered an issue while processing your request. ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or check the configuration.`,
      confidence: 0.1,
      suggestedActions: ['Try your request again', 'Check configuration', 'Contact support'],
      mcpToolCalls: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function buildSystemPrompt(personality: any, gameContext: any): string {
  const contextParts: string[] = [];
  
  // Add game context if available
  if (gameContext?.currentScene) {
    contextParts.push(`Current Scene: ${gameContext.currentScene}`);
  }
  
  if (gameContext?.activeEncounter) {
    contextParts.push(`Active Encounter: ${JSON.stringify(gameContext.activeEncounter)}`);
  }
  
  if (gameContext?.partyMembers?.length > 0) {
    contextParts.push(`Party: ${gameContext.partyMembers.join(', ')}`);
  }
  
  if (gameContext?.environment) {
    contextParts.push(`Environment: ${gameContext.environment}`);
  }

  const contextString = contextParts.length > 0 ? `\n\nCurrent Game Context:\n${contextParts.join('\n')}` : '';
  
  return `${personality.systemPrompt}${contextString}\n\nYou have access to 17 MCP tools for D&D session management. When appropriate, suggest tool usage by mentioning specific tools in your response.`;
}

function extractSuggestedActions(response: string): string[] {
  const actions: string[] = [];
  
  // Look for common action patterns
  const actionPatterns = [
    /roll (?:a |an )?(\w+)/gi,
    /make (?:a |an )?(\w+) (?:check|save|roll)/gi,
    /cast (\w+)/gi,
    /attack (?:with |the )?(\w+)/gi,
    /move (?:to )?(\w+)/gi,
    /search (?:for |the )?(\w+)/gi,
    /investigate (\w+)/gi,
    /talk to (\w+)/gi
  ];

  actionPatterns.forEach(pattern => {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        actions.push(match[0]);
      }
    }
  });

  // Add default suggestions if none found
  if (actions.length === 0) {
    if (response.toLowerCase().includes('combat') || response.toLowerCase().includes('initiative')) {
      actions.push('Roll initiative', 'Check combat status', 'Use combat tools');
    } else if (response.toLowerCase().includes('explore') || response.toLowerCase().includes('environment')) {
      actions.push('Investigate area', 'Search for secrets', 'Check for traps');
    } else {
      actions.push('Ask for clarification', 'Continue conversation', 'Check character sheet');
    }
  }

  return actions.slice(0, 3);
}

function parsePotentialToolCalls(response: string): Array<{ tool: string; parameters: any; reason: string }> {
  const toolCalls: Array<{ tool: string; parameters: any; reason: string }> = [];
  
  // Look for tool suggestions in the response
  const toolPatterns = [
    { pattern: /initiative|combat order/gi, tool: 'rollInitiative', reason: 'Combat initiative mentioned' },
    { pattern: /damage|hurt|wound/gi, tool: 'applyDamage', reason: 'Damage application needed' },
    { pattern: /heal|cure|restore/gi, tool: 'healCharacter', reason: 'Healing mentioned' },
    { pattern: /weather|climate|storm/gi, tool: 'setWeather', reason: 'Weather control suggested' },
    { pattern: /npc|character|person/gi, tool: 'generateNPC', reason: 'NPC interaction mentioned' },
    { pattern: /environment|scene|location/gi, tool: 'setEnvironment', reason: 'Environment change suggested' }
  ];

  toolPatterns.forEach(({ pattern, tool, reason }) => {
    if (pattern.test(response)) {
      toolCalls.push({
        tool,
        parameters: {}, // Would be populated with actual parameters in real implementation
        reason
      });
    }
  });

  return toolCalls.slice(0, 2); // Limit to 2 tool calls
}
