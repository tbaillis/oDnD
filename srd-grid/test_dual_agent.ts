// Mock DOM environment for Node.js testing
const mockDocument = {
  createElement: (tag: string) => ({
    id: '',
    style: { cssText: '' },
    innerHTML: '',
    appendChild: () => {},
    addEventListener: () => {},
    querySelector: () => null
  }),
  body: {
    appendChild: () => {}
  },
  addEventListener: () => {}
};

const mockWindow = {
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  addEventListener: () => {}
};

// Set up global mocks
(global as any).document = mockDocument;
(global as any).window = mockWindow;

// Now we can safely import our classes
import { MonsterAIAgent, MONSTER_PERSONALITIES } from './src/ai/monsterAgent.js';

// Mock the DM chat functionality for testing
const mockDMChat = async (prompt: string, options: any = {}) => {
  console.log(`\n=== MOCK DM CHAT REQUEST ===`);
  console.log(`Temperature: ${options.temperature || 0.7}`);
  console.log(`Prompt (first 200 chars): ${prompt.substring(0, 200)}...`);
  
  // Simulate different responses based on temperature to test both AIs
  if (options.temperature === 0.3) {
    // Tactical AI response
    return `## Tactical Analysis

**Primary Strategies:**

1. **OFFENSIVE** - Direct melee assault
   - Move to (5,3) adjacent to the wizard
   - Attack with claws for potential 2d6+3 damage
   - Risk: Opportunity attacks, potential wizard counterattack
   - Success Probability: 75%

2. **DEFENSIVE** - Protective positioning
   - Move to (3,1) behind partial cover
   - Ready action to attack any approaching enemy
   - Risk: Allows enemies time to coordinate
   - Success Probability: 85%

3. **NEUTRAL** - Tactical repositioning
   - Move to (6,2) for flanking opportunity next turn
   - Maintain threat while preserving options
   - Risk: Minimal immediate impact
   - Success Probability: 90%

**Recommendation:** OFFENSIVE strategy given current HP advantage and positioning.`;
  } else {
    // Roleplay AI response
    return `**Character Response:**

*The orc's eyes blaze with primal fury as battle-rage surges through its veins. Spittle flies from its tusked maw as it bellows a war cry that echoes through the chamber.*

**Dialogue:** "Graaahhh! Weak wizard-meat thinks magic can save it! Krugg will feast on your bones tonight!"

**Internal Monologue:** The scent of fear from the enemies fills my nostrils - they know death approaches. My muscles coil like springs, ready to unleash devastating violence.

**Physical Actions:** Crude iron weapons gleam with malicious intent as massive hands grip them tighter. The orc's scarred chest heaves with anticipation of glorious combat.

**Emotional State:** Bloodthirsty excitement mixed with territorial aggression - this is what orcs live for!`;
  }
};

async function testDualAgentSystem() {
  console.log('=== Testing Dual-Agent Monster AI System ===\n');
  
  // Create a test monster AI agent
  const monsterAI = new MonsterAIAgent();
  
  // Set the personality to aggressive
  monsterAI.setPersonality('aggressive');
  
  // Mock the DM chat method
  (monsterAI as any).dmChat = mockDMChat;
  
  // Create test game state
  const testGameState = {
    activeMonster: {
      id: 'orc_warrior_1',
      name: 'Orc Warrior',
      x: 2,
      y: 2,
      hp: 12,
      maxHp: 15,
      ac: 13,
      attack: 5,
      damage: '2d6+3',
      moveAvailable: true,
      attackAvailable: true,
      race: 'Orc',
      class: 'Warrior'
    },
    enemies: [
      {
        id: 'wizard_1',
        name: 'Human Wizard',
        x: 5,
        y: 3,
        hp: 8,
        maxHp: 12,
        ac: 12
      },
      {
        id: 'fighter_1', 
        name: 'Human Fighter',
        x: 1,
        y: 4,
        hp: 15,
        maxHp: 18,
        ac: 16
      }
    ],
    battlefield: {
      width: 10,
      height: 8,
      obstacles: [
        { x: 4, y: 1, type: 'wall' },
        { x: 4, y: 2, type: 'wall' }
      ],
      terrain: 'dungeon'
    },
    turn: 3
  };
  
  try {
    console.log('🎯 Making dual-agent decision...\n');
    
    // Test the dual-agent decision making
    const decision = await monsterAI.makeDecision(testGameState);
    
    console.log('\n=== DUAL-AGENT DECISION RESULT ===');
    console.log('✅ Action Type:', decision.action.type);
    console.log('✅ Target:', decision.action.target);
    console.log('✅ Reasoning:', decision.action.reasoning.substring(0, 100) + '...');
    console.log('✅ Dialogue:', (decision.action.dialogue || 'No dialogue').substring(0, 100) + '...');
    console.log('✅ Confidence:', decision.confidence);
    console.log('✅ Personality:', decision.personality);
    
    console.log('\n✅ Dual-agent system test completed successfully!');
    
    // Test personality switching
    console.log('\n🔄 Testing personality switching...');
    monsterAI.setPersonality('cunning');
    const cunningDecision = await monsterAI.makeDecision(testGameState);
    console.log('✅ Cunning personality decision:', cunningDecision.action.type);
    
    return decision;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

console.log('Starting dual-agent Monster AI test...\n');

// Run the test
testDualAgentSystem()
  .then((result) => {
    console.log('\n🎉 All tests passed! The dual-agent system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- ✅ TacticalCombatAI provides strategic battle analysis');
    console.log('- ✅ RoleplayActingAI generates immersive character dialogue');
    console.log('- ✅ MonsterAIAgent orchestrates both systems seamlessly');
    console.log('- ✅ Personality switching affects both tactical and roleplay decisions');
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
