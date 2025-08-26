import { describe, it, expect, beforeEach } from 'vitest'
import { MonsterAIAgent } from '../ai/monsterAgent'
import { MonsterTurnManager } from '../ai/monsterTurnManager'

describe('Monster AI Movement Logic', () => {
  let monsterAI: MonsterAIAgent
  
  beforeEach(() => {
    monsterAI = new MonsterAIAgent()
    // Mock the LLM call to always fail so we test fallback logic
    ;(monsterAI as any)['callLLM'] = async () => { throw new Error('Mock LLM failure') }
  })

  it('should move towards target when out of attack range', async () => {
    const gameState = {
      activeMonster: { 
        x: 0, 
        y: 0, 
        hp: 20, 
        maxHp: 20, 
        id: 'monster',
        moveAvailable: true,
        attackAvailable: true
      },
      enemies: [{ x: 3, y: 3, hp: 15, maxHp: 15, id: 'player' }]
    }

    // Set aggressive personality to ensure attack attempt
    monsterAI.setPersonality('feral_beast')
    
    // Mock Math.random to return high aggression (0.8 < default 0.9 aggression for feral_beast)
    const originalRandom = Math.random
    Math.random = () => 0.8

    try {
      // Since makeDecision will fallback to our logic when LLM fails, we can test it directly
      const decision = await monsterAI.makeDecision(gameState)
      
      expect(decision.action.type).toBe('move')
      expect(decision.action.target).toBeDefined()
      expect(decision.action.reasoning).toContain('closer')
      expect(decision.personality).toBe('Feral Beast')
    } finally {
      Math.random = originalRandom
    }
  })

  it('should attack when target is within range', async () => {
    const gameState = {
      activeMonster: { 
        x: 0, 
        y: 0, 
        hp: 20, 
        maxHp: 20, 
        id: 'monster',
        moveAvailable: true,
        attackAvailable: true
      },
      enemies: [{ x: 1, y: 0, hp: 15, maxHp: 15, id: 'player' }], // Adjacent enemy
    }

    monsterAI.setPersonality('feral_beast')
    
    // Mock Math.random to return high aggression
    const originalRandom = Math.random
    Math.random = () => 0.8

    try {
      const decision = await monsterAI.makeDecision(gameState)
      
      expect(decision.action.type).toBe('attack')
      expect(decision.action.target).toEqual({ x: 1, y: 0 })
      expect(decision.action.reasoning).toContain('ttacking')
      expect(decision.personality).toBe('Feral Beast')
    } finally {
      Math.random = originalRandom
    }
  })

  it('should calculate optimal move position', () => {
    const monster = { x: 0, y: 0 }
    const target = { x: 5, y: 0 }
    const reach = 1
    
    const movePosition = (monsterAI as any)['calculateMovePosition'](monster, target, reach)
    
    // Should move one step towards target horizontally
    expect(movePosition.x).toBe(1)
    expect(movePosition.y).toBe(0) 
  })

  it('should move one step towards diagonal target', () => {
    const monster = { x: 0, y: 0 }
    const target = { x: 3, y: 3 }
    const reach = 1
    
    const movePosition = (monsterAI as any)['calculateMovePosition'](monster, target, reach)
    
    // Should move in one direction since both distances are equal (ties go to horizontal)
    expect(movePosition.x).toBe(1)
    expect(movePosition.y).toBe(0)
  })

  it('should end turn when not aggressive enough', () => {
    const gameState = {
      activeMonster: { x: 0, y: 0, hp: 20, maxHp: 20, id: 'monster' },
      enemies: [{ x: 3, y: 3, hp: 15, maxHp: 15, id: 'player' }]
    }

    monsterAI.setPersonality('Ancient Guardian')
    
    // Mock Math.random to return low aggression (Ancient Guardian has 0.4 aggression)
    const originalRandom = Math.random
    Math.random = () => 0.5

    try {
      const decision = (monsterAI as any)['fallbackDecision'](gameState)
      
      expect(decision.action.type).toBe('end_turn')
      expect(decision.action.reasoning).toBe('No aggressive action needed')
    } finally {
      Math.random = originalRandom
    }
  })

  it('should handle no enemies scenario', () => {
    const gameState = {
      activeMonster: { x: 0, y: 0, hp: 20, maxHp: 20, id: 'monster' },
      enemies: []
    }

    const decision = (monsterAI as any)['fallbackDecision'](gameState)
    
    expect(decision.action.type).toBe('end_turn')
    expect(decision.action.reasoning).toBe('No valid targets available')
  })

  it('should generate movement dialogue based on personality', () => {
    monsterAI.setPersonality('Savage Beast')
    
    const dialogue = (monsterAI as any)['generateFallbackDialogue']('move')
    
    expect(dialogue).toBeDefined()
    expect(typeof dialogue).toBe('string')
    expect(dialogue.length).toBeGreaterThan(0)
    
    // Should be appropriate for Savage Beast personality
    const expectedDialogues = ['*Stalks closer*', '*Advances menacingly*', '*Closes in for the kill*']
    expect(expectedDialogues).toContain(dialogue)
  })

  it('should use nearest targeting strategy correctly', () => {
    const monster = { x: 0, y: 0, hp: 20, maxHp: 20, id: 'monster' }
    const enemies = [
      { x: 5, y: 5, hp: 10, maxHp: 10, id: 'far_enemy' },    // Distance: 10
      { x: 2, y: 1, hp: 15, maxHp: 15, id: 'near_enemy' },   // Distance: 3
      { x: 1, y: 1, hp: 20, maxHp: 20, id: 'closest_enemy' } // Distance: 2
    ]
    
    const nearestEnemy = (monsterAI as any)['findNearestEnemy'](monster, enemies)
    
    expect(nearestEnemy.id).toBe('closest_enemy')
  })

  it('should respect action budget when no standard action available', () => {
    const gameState = {
      activeMonster: { x: 0, y: 0, hp: 20, maxHp: 20, id: 'monster' },
      enemies: [{ x: 1, y: 0, hp: 15, maxHp: 15, id: 'player' }], // Adjacent enemy
      budget: { move: true, standard: false, fiveFootStep: true } // No standard action
    }

    monsterAI.setPersonality('Savage Beast')
    
    const originalRandom = Math.random
    Math.random = () => 0.8

    try {
      const decision = (monsterAI as any)['fallbackDecision'](gameState)
      
      expect(decision.action.type).toBe('end_turn')
      expect(decision.action.reasoning).toContain('No standard action remaining')
    } finally {
      Math.random = originalRandom
    }
  })

  it('should respect movement budget when no movement available', () => {
    const gameState = {
      activeMonster: { x: 0, y: 0, hp: 20, maxHp: 20, id: 'monster' },
      enemies: [{ x: 3, y: 0, hp: 15, maxHp: 15, id: 'player' }], // Out of range enemy
      budget: { move: false, standard: true, fiveFootStep: false } // No movement
    }

    monsterAI.setPersonality('Savage Beast')
    
    const originalRandom = Math.random
    Math.random = () => 0.8

    try {
      const decision = (monsterAI as any)['fallbackDecision'](gameState)
      
      expect(decision.action.type).toBe('end_turn')
      expect(decision.action.reasoning).toContain('No movement actions available')
    } finally {
      Math.random = originalRandom
    }
  })
})

describe('Monster Turn Manager Complete Turn Execution', () => {
  let turnManager: MonsterTurnManager

  beforeEach(() => {
    turnManager = new MonsterTurnManager()
  })

  it('should handle complete turn execution method exists', () => {
    // Test that the executeCompleteMonsterTurn method exists
    expect(typeof (turnManager as any)['executeCompleteMonsterTurn']).toBe('function')
  })
})