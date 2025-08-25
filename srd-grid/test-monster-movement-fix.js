// Simple test for Monster AI Movement Logic
import { monsterAI } from '../ai/monsterAgent.js'

console.log('Testing Monster AI Movement Fix...')

// Test scenario: Monster is out of attack range but has movement available
const testGameState = {
  activeMonster: {
    id: 'goblin1',
    x: 1,
    y: 1,
    hp: 10,
    maxHp: 10,
    moveAvailable: true,
    attackAvailable: true
  },
  enemies: [
    {
      id: 'player1',
      x: 4,
      y: 1,
      hp: 20,
      maxHp: 20
    }
  ]
}

// Setup Monster AI with aggressive personality
monsterAI.setPersonality('feral_beast')

console.log('\nTest Setup:')
console.log(`Monster at (${testGameState.activeMonster.x}, ${testGameState.activeMonster.y})`)
console.log(`Enemy at (${testGameState.enemies[0].x}, ${testGameState.enemies[0].y})`) 
console.log(`Distance: ${Math.abs(testGameState.activeMonster.x - testGameState.enemies[0].x)}`)
console.log(`Monster moveAvailable: ${testGameState.activeMonster.moveAvailable}`)
console.log(`Monster attackAvailable: ${testGameState.activeMonster.attackAvailable}`)

async function testMovementDecision() {
  try {
    console.log('\n--- Making AI Decision ---')
    const decision = await monsterAI.makeDecision(testGameState)
    
    console.log('\nMonster AI Decision:')
    console.log(`Action type: ${decision.action.type}`)
    console.log(`Target: (${decision.action.target?.x}, ${decision.action.target?.y})`)
    console.log(`Reasoning: ${decision.action.reasoning}`)
    console.log(`Confidence: ${decision.confidence}`)
    console.log(`Personality: ${decision.personality}`)
    console.log(`Dialogue: "${decision.action.dialogue}"`)
    
    // Verify the expected behavior
    if (decision.action.type === 'move') {
      console.log('\n✅ SUCCESS: Monster chose to move closer!')
      console.log(`Will move from (${testGameState.activeMonster.x},${testGameState.activeMonster.y}) to (${decision.action.target.x},${decision.action.target.y})`)
      
      // Verify the move brings us closer
      const currentDistance = Math.abs(testGameState.activeMonster.x - testGameState.enemies[0].x)
      const newDistance = Math.abs(decision.action.target.x - testGameState.enemies[0].x)
      
      if (newDistance < currentDistance) {
        console.log(`✅ Move reduces distance from ${currentDistance} to ${newDistance}`)
      } else {
        console.log(`❌ Move doesn't reduce distance: ${currentDistance} -> ${newDistance}`)
      }
    } else if (decision.action.type === 'attack') {
      console.log('\n⚡ Monster chose to attack (unexpected for distance > 1)')
    } else {
      console.log('\n❌ ISSUE: Monster ended turn instead of moving closer')
      console.log('This suggests the movement logic in fallbackDecision needs more work')
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.log('This likely means there\'s an issue with the AI decision-making process')
  }
}

// Run the test
testMovementDecision()
