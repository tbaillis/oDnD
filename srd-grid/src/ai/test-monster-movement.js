// Test script for Monster AI movement decisions
// This simulates the scenario where Monster AI should move closer to attack

import { monsterAI } from './monsterAgent.js';

// Test scenario: Monster with movement available but out of attack range
const testGameState = {
  activeMonster: {
    id: 'goblin1',
    x: 5,
    y: 5,
    hp: 10,
    maxHp: 10,
    moveAvailable: true,
    attackAvailable: true
  },
  enemies: [
    {
      id: 'player1',
      x: 8,
      y: 5,
      hp: 20,
      maxHp: 20
    }
  ]
};

console.log('Testing Monster AI Movement Decision...');
console.log('Monster position:', testGameState.activeMonster.x, testGameState.activeMonster.y);
console.log('Enemy position:', testGameState.enemies[0].x, testGameState.enemies[0].y);
console.log('Distance:', Math.abs(testGameState.activeMonster.x - testGameState.enemies[0].x));
console.log('Move available:', testGameState.activeMonster.moveAvailable);
console.log('Attack available:', testGameState.activeMonster.attackAvailable);

// Set monster personality to something aggressive
monsterAI.setPersonality('feral_beast');

// Test the fallback decision
async function testMovementDecision() {
  try {
    // First, let's directly test the fallback decision by calling it with a mock
    const decision = await monsterAI.makeDecision(testGameState);
    
    console.log('\n--- Monster AI Decision ---');
    console.log('Action type:', decision.action.type);
    console.log('Target:', decision.action.target);
    console.log('Reasoning:', decision.action.reasoning);
    console.log('Confidence:', decision.confidence);
    console.log('Dialogue:', decision.action.dialogue);
    
    if (decision.action.type === 'move') {
      console.log('\n✓ SUCCESS: Monster chose to move closer!');
      console.log('Moving from (' + testGameState.activeMonster.x + ',' + testGameState.activeMonster.y + ') to (' + decision.action.target.x + ',' + decision.action.target.y + ')');
    } else if (decision.action.type === 'end_turn') {
      console.log('\n✗ ISSUE: Monster ended turn instead of moving');
    } else {
      console.log('\n? Other action:', decision.action.type);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMovementDecision();
