// Monster AI Turn Management System
import { monsterAI, type MonsterCombatAction, type MonsterAIResponse } from '../ai/monsterAgent.js';
import { monsterDialogueUI } from '../ai/monsterDialogue.js';
import { debugLogger } from '../utils/debugLogger';

export interface MonsterTurnManager {
  isMonsterTurn(pawnId: 'A' | 'B'): boolean;
  shouldTakeAutoTurn(pawnId: 'A' | 'B'): boolean;
  executeMonsterTurn(pawnId: 'A' | 'B', gameState: any): Promise<boolean>;
  setMonsterPawn(pawnId: 'A' | 'B', isMonster: boolean): void;
  isMonsterPawn(pawnId: 'A' | 'B'): boolean;
}

export class MonsterTurnManager implements MonsterTurnManager {
  private monsterPawns: Set<'A' | 'B'> = new Set();
  private isProcessingTurn: boolean = false;
  private turnDelay: number = 1500; // Delay between AI actions in ms

  constructor() {
    // Initialize with pawn B as monster by default (can be changed)
    this.monsterPawns.add('B');
  // Reference internal helpers to avoid unused warnings in some build environments
  this._referencedHelpers();
  }

  public isMonsterTurn(pawnId: 'A' | 'B'): boolean {
    return this.monsterPawns.has(pawnId);
  }

  public shouldTakeAutoTurn(pawnId: 'A' | 'B'): boolean {
    return monsterAI.isEnabled() && this.isMonsterTurn(pawnId) && !this.isProcessingTurn;
  }

  public setMonsterPawn(pawnId: 'A' | 'B', isMonster: boolean): void {
    if (isMonster) {
      this.monsterPawns.add(pawnId);
    } else {
      this.monsterPawns.delete(pawnId);
    }
  }

  public isMonsterPawn(pawnId: 'A' | 'B'): boolean {
    return this.monsterPawns.has(pawnId);
  }

  public async executeMonsterTurn(pawnId: 'A' | 'B', gameState: any): Promise<boolean> {
    debugLogger.logAI('MonsterTurnManager', `Starting monster turn execution`, {
      pawnId,
      isProcessingTurn: this.isProcessingTurn,
      aiEnabled: monsterAI.isEnabled(),
      isMonsterTurn: this.isMonsterTurn(pawnId)
    });

    if (this.isProcessingTurn || !monsterAI.isEnabled() || !this.isMonsterTurn(pawnId)) {
      debugLogger.logAI('MonsterTurnManager', 'Cannot execute turn - conditions not met', {
        isProcessingTurn: this.isProcessingTurn,
        aiEnabled: monsterAI.isEnabled(),
        isMonsterTurn: this.isMonsterTurn(pawnId)
      });
      return false;
    }

    this.isProcessingTurn = true;

    try {
      // Execute a complete monster turn (potentially multiple actions)
      await this.executeCompleteMonsterTurn(pawnId, gameState);
      debugLogger.logAI('MonsterTurnManager', 'Monster turn completed successfully');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      debugLogger.logError('MonsterTurnManager', `Error executing monster turn: ${errorMsg}`, { error: errorMsg });
      console.error('Error executing monster turn:', error);
      return false;
    } finally {
      this.isProcessingTurn = false;
    }
  }

  private async executeCompleteMonsterTurn(pawnId: 'A' | 'B', gameState: any): Promise<void> {
    debugLogger.logAI('MonsterTurnManager', 'Starting complete monster turn', {
      pawnId,
      budget: gameState?.budget,
      turnDelay: this.turnDelay
    });

    const maxActions = 3; // Safety limit to prevent infinite loops
    let actionsExecuted = 0;
    
    while (actionsExecuted < maxActions) {
      debugLogger.logAI('MonsterTurnManager', `Action ${actionsExecuted + 1}/${maxActions}`, {
        remainingBudget: gameState?.budget
      });

      // Get AI decision for current game state
      const decision = await monsterAI.makeDecision(gameState);
      
      // If AI wants to end turn, commit end turn and exit
      if (decision.action.type === 'end_turn') {
        if (decision.action.dialogue) {
          monsterDialogueUI.showMessage(decision.action.dialogue);
        }
        if (typeof (window as any).commitEndTurn === 'function') {
          (window as any).commitEndTurn();
        }
        break;
      }

      // Show monster dialogue if provided
      if (decision.action.dialogue) {
        monsterDialogueUI.showMessage(decision.action.dialogue);
      }

      // Add small delay for dramatic effect
      await this.sleep(this.turnDelay);

      // Execute the action
      const actionExecuted = await this.executeAction(pawnId, decision);
      
      if (!actionExecuted) {
        console.warn(`Failed to execute ${decision.action.type} action for monster ${pawnId}`);
        break;
      }

      actionsExecuted++;

      // Update game state after action for next decision
      const turns = (window as any).turns;
      const pawnA = (window as any).pawnA;
      const pawnB = (window as any).pawnB;
      const effects = (window as any).effects;
      const G = (window as any).G;
      
      gameState = this.buildGameState(turns, pawnA, pawnB, {
        grid: G,
        terrain: G,
        effects: effects
      });

      // Check if we have actions remaining
      const budget = turns.budget;
      const hasActionsRemaining = budget && (
        budget.standard || budget.move || budget.fiveFootStep
      );

      if (!hasActionsRemaining) {
        console.log(`Monster ${pawnId} has no actions remaining, ending turn`);
        // Ensure we properly commit end of turn so game state advances
        if (typeof (window as any).commitEndTurn === 'function') {
          (window as any).commitEndTurn();
        }
        break;
      }

      // Add a small delay between actions
      await this.sleep(300);
    }

    console.log(`Monster ${pawnId} completed turn with ${actionsExecuted} actions`);
  }

  private async executeAction(
    pawnId: 'A' | 'B', 
    decision: MonsterAIResponse
  ): Promise<boolean> {
    const { action } = decision;

    switch (action.type) {
      case 'move':
        return this.executeMove(pawnId, action);
      
      case 'attack':
        return this.executeAttack(pawnId, action);
      
      case 'special':
        return this.executeSpecialAction(pawnId, action);
      
      case 'end_turn':
        return this.executeEndTurn(pawnId, action);
      
      default:
        console.warn('Unknown monster action type:', action.type);
        return false;
    }
  }

  private async executeMove(pawnId: 'A' | 'B', action: MonsterCombatAction): Promise<boolean> {
    if (!action.target) return false;

    try {
      // Get the current pawn and game state references from main.ts
      const pawn = pawnId === 'A' ? (window as any).pawnA : (window as any).pawnB;
      const turns = (window as any).turns;
      const consume = (window as any).consume;
      const planFromActiveTo = (window as any).planFromActiveTo;
      const appendLogLine = (window as any).appendLogLine;
      const drawAll = (window as any).drawAll;
      
      if (!pawn || !turns || !consume || !planFromActiveTo || !appendLogLine) {
        console.error('Missing required game functions for movement');
        return false;
      }

      // Ensure this is the active pawn's turn
      if (turns.active?.id !== pawnId) {
        console.error(`Cannot move pawn ${pawnId} - not their turn`);
        return false;
      }

      // Plan movement to target
  const { trimmed, info } = planFromActiveTo(action.target.x, action.target.y);
      
      if (!trimmed || trimmed.length === 0) {
        console.warn(`No valid path to target (${action.target.x}, ${action.target.y})`);
        return false;
      }

      const last = trimmed[trimmed.length - 1];
      
      // Check if movement is possible with available actions
      if (info.feet === 5 && info.difficultSquares === 0) {
        if (!consume(turns.budget!, 'five-foot-step')) {
          console.warn('No five-foot step available for Monster AI');
          return false;
        }
      } else {
        if (!consume(turns.budget!, 'move')) {
          console.warn('Move action already used for Monster AI');
          return false;
        }
      }

      // Execute the movement
      pawn.x = last[0];
      pawn.y = last[1];
      
      appendLogLine(`🤖 ${pawnId} moves ${info.feet} ft to (${last[0]}, ${last[1]})`);
      
      // Update display
      if (drawAll) drawAll();
      
      return true;
    } catch (error) {
      console.error('Error executing monster move:', error);
      return false;
    }
  }

  private async executeAttack(pawnId: 'A' | 'B', action: MonsterCombatAction): Promise<boolean> {
    if (!action.target) return false;

    try {
      // Get required game functions and state
      const turns = (window as any).turns;
      const consume = (window as any).consume;
      const appendLogLine = (window as any).appendLogLine;
      const drawAll = (window as any).drawAll;
      const attackRoll = (window as any).attackRoll;
      const isWithinAttackReach = (window as any).isWithinAttackReach;
      
      if (!turns || !consume || !appendLogLine || !attackRoll || !isWithinAttackReach) {
        console.error('Missing required game functions for attack');
        return false;
      }

      // Ensure this is the active pawn's turn
      if (turns.active?.id !== pawnId) {
        console.error(`Cannot attack with pawn ${pawnId} - not their turn`);
        return false;
      }

      // Check if standard action is available
      if (!consume(turns.budget!, 'standard')) {
        console.warn('Standard action already used for Monster AI attack');
        return false;
      }

      // Get attacker and target pawns
      const attacker = pawnId === 'A' ? (window as any).pawnA : (window as any).pawnB;
      const target = pawnId === 'A' ? (window as any).pawnB : (window as any).pawnA;
      
      // Verify target is at the expected position
      if (target.x !== action.target.x || target.y !== action.target.y) {
        console.warn(`Target not found at expected position (${action.target.x}, ${action.target.y})`);
        return false;
      }

      // Check reach distance
      const attackerReach = pawnId === 'A' ? (window as any).reachA : (window as any).reachB;
      const rangedMode = (window as any).rangedMode || false;
      
      const reachCheck = isWithinAttackReach(
        attacker.x, attacker.y, 
        target.x, target.y, 
        attacker.size, 
        attackerReach, 
        rangedMode
      );
      
      if (!reachCheck.inRange) {
        const reachText = attackerReach ? ` (reach weapon: ${reachCheck.maxReach} squares)` : ` (${reachCheck.maxReach} square${reachCheck.maxReach === 1 ? '' : 's'})`;
        appendLogLine(`Monster AI cannot attack: target is ${reachCheck.distance} squares away, but melee reach is only ${reachCheck.maxReach}${reachText}.`);
        return false;
      }

      // Execute attack using game's attack system
      const atk = { bab: 2, abilityMod: 3, sizeMod: 0 };
      const def = { 
        ac: { base: 10, armor: 4, shield: 0, natural: 0, deflection: 0, dodge: 1, misc: 0 }, 
        touchAttack: false, 
        flatFooted: false 
      };

      const outcome = attackRoll(atk, def, (window as any).currentRNG);
      appendLogLine(`🤖 ${pawnId} attacks: roll=${outcome.attackRoll} total=${outcome.totalToHit} hit=${outcome.hit}${outcome.critical ? ' CRIT!' : ''}`);
      
      if (outcome.hit) {
        const damage = outcome.critical ? 10 : 5;
        target.hp = Math.max(0, target.hp - damage);
        appendLogLine(`🤖 ${pawnId} deals ${damage} damage. Target HP ${target.hp}.`);
        
        if (target.hp <= 0) {
          appendLogLine(`${pawnId} wins!`);
          (window as any).gameOver = pawnId;
        }
      }

      // Update display
      if (drawAll) drawAll();
      
      return true;
    } catch (error) {
      console.error('Error executing monster attack:', error);
      return false;
    }
  }

  private async executeSpecialAction(pawnId: 'A' | 'B', action: MonsterCombatAction): Promise<boolean> {
    // Placeholder for special abilities like spells, breath weapons, etc.
    console.log(`Monster ${pawnId} uses special ability: ${action.reasoning}`);
    
    // For now, just treat as end turn
    return this.executeEndTurn(pawnId, action);
  }

  private async executeEndTurn(pawnId: 'A' | 'B', action: MonsterCombatAction): Promise<boolean> {
    // Use existing end turn functionality
    if (typeof (window as any).commitEndTurn === 'function') {
      (window as any).commitEndTurn();
      console.log(`Monster ${pawnId} ends turn: ${action.reasoning}`);
      return true;
    }

    console.warn(`Monster ${pawnId} failed to end turn`);
    return false;
  }

  private findPawnAtPosition(x: number, y: number): 'A' | 'B' | null {
    // Check global pawn positions if available
    const pawnA = (window as any).pawnA;
    const pawnB = (window as any).pawnB;

    if (pawnA && pawnA.x === x && pawnA.y === y) {
      return 'A';
    }
    
    if (pawnB && pawnB.x === x && pawnB.y === y) {
      return 'B';
    }

    return null;
  }

  // Reference helper to avoid TS unused warnings in builds that tree-shake differently
  private _referencedHelpers(): void {
    void this.findPawnAtPosition;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for game state analysis
  public buildGameState(turns: any, pawnA: any, pawnB: any, gameState?: any): any {
    const activePawnId = turns.active?.id;
    const activePawn = activePawnId === 'A' ? pawnA : pawnB;
    const enemyPawn = activePawnId === 'A' ? pawnB : pawnA;

    // Enhance active monster with budget-derived availability flags
    const activeMonster = this.isMonsterTurn(activePawnId) ? {
      ...activePawn,
      moveAvailable: turns.budget?.moveAvailable || false,
      attackAvailable: turns.budget?.standardAvailable || false,
      fiveFootStepAvailable: turns.budget?.fiveFootStepAvailable || false
    } : null;

    debugLogger.logAI('MonsterTurnManager', 'Building game state', {
      activePawnId,
      isMonsterTurn: this.isMonsterTurn(activePawnId),
      budget: turns.budget,
      activeMonster: activeMonster ? {
        id: activeMonster.id,
        position: `(${activeMonster.x}, ${activeMonster.y})`,
        moveAvailable: activeMonster.moveAvailable,
        attackAvailable: activeMonster.attackAvailable
      } : null,
      enemyCount: [enemyPawn].filter(p => p.hp > 0).length
    });

    return {
      activePawnId,
      activeMonster,
      activePawn: activePawn,
      enemies: [enemyPawn].filter(p => p.hp > 0),
      allPawns: [pawnA, pawnB],
      round: turns.round,
      budget: turns.budget,
      grid: gameState?.grid,
      terrain: gameState?.terrain,
      effects: gameState?.effects
    };
  }

  public setTurnDelay(ms: number): void {
    this.turnDelay = Math.max(500, Math.min(5000, ms)); // Between 0.5 and 5 seconds
  }

  public getTurnDelay(): number {
    return this.turnDelay;
  }
}

// Global monster turn manager instance
export const monsterTurnManager = new MonsterTurnManager();
