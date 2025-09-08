// Monster AI Turn Management System
import { monsterAI, type MonsterCombatAction, type MonsterAIResponse } from '../ai/monsterAgent.js';
import { monsterDialogueUI } from '../ai/monsterDialogue.js';
import { debugLogger } from '../utils/debugLogger';
import { showAttackSlash, flashPawnHit, showHitOrMiss } from '../ui/visualEffects'

export interface MonsterTurnManager {
  isMonsterTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean;
  shouldTakeAutoTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean;
  executeMonsterTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', gameState: any): Promise<boolean>;
  setMonsterPawn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', isMonster: boolean): void;
  isMonsterPawn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean;
}

export class MonsterTurnManager implements MonsterTurnManager {
  private monsterPawns: Set<'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'> = new Set();
  private isProcessingTurn: boolean = false;
  private turnDelay: number = 1500; // Delay between AI actions in ms

  constructor() {
    // Initialize with pawns M1 and M2 as monsters by default (both are active by default)
    this.monsterPawns.add('M1');
    this.monsterPawns.add('M2');
  // Reference internal helpers to avoid unused warnings in some build environments
  this._referencedHelpers();
  }

  // Resolve a pawn object by its ID, preferring gameState if provided, then window globals
  private getPawnById(
    pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10',
    gameState?: any
  ): any | null {
    const fromState = gameState?.allPawns?.find((p: any) => p && (p.id === pawnId || p.id === String(pawnId)));
    if (fromState) return fromState;

    const w = (window as any);
    const map: Record<string, any> = {
      'A': w.pawnA,
      'M1': w.pawnM1,
      'M2': w.pawnM2,
      'M3': w.pawnM3,
      'M4': w.pawnM4,
      'M5': w.pawnM5,
      'M6': w.pawnM6,
      'M7': w.pawnM7,
      'M8': w.pawnM8,
      'M9': w.pawnM9,
      'M10': w.pawnM10,
    };
    const pawn = map[pawnId];
    if (pawn && !pawn.id) pawn.id = pawnId; // ensure ID exists for downstream logic
    return pawn ?? null;
  }

  // Collect all known pawns (players and monsters), preferring gameState if provided
  private getAllPawns(gameState?: any): any[] {
    if (Array.isArray(gameState?.allPawns) && gameState.allPawns.length) {
      return gameState.allPawns;
    }
    const w = (window as any);
    const list = [
      w.pawnA, w.pawnB, w.pawnC, w.pawnD, w.pawnE, w.pawnF,
      w.pawnM1, w.pawnM2, w.pawnM3, w.pawnM4, w.pawnM5,
      w.pawnM6, w.pawnM7, w.pawnM8, w.pawnM9, w.pawnM10,
    ].filter(Boolean);
    // normalize IDs when missing
    for (const p of list) {
      if (!p.id) {
        // Try to infer from reference by comparing against window map
        if (p === w.pawnA) p.id = 'A';
        else if (p === w.pawnB) p.id = 'B';
        else if (p === w.pawnC) p.id = 'C';
        else if (p === w.pawnD) p.id = 'D';
        else if (p === w.pawnE) p.id = 'E';
        else if (p === w.pawnF) p.id = 'F';
        else if (p === w.pawnM1) p.id = 'M1';
        else if (p === w.pawnM2) p.id = 'M2';
        else if (p === w.pawnM3) p.id = 'M3';
        else if (p === w.pawnM4) p.id = 'M4';
        else if (p === w.pawnM5) p.id = 'M5';
        else if (p === w.pawnM6) p.id = 'M6';
        else if (p === w.pawnM7) p.id = 'M7';
        else if (p === w.pawnM8) p.id = 'M8';
        else if (p === w.pawnM9) p.id = 'M9';
        else if (p === w.pawnM10) p.id = 'M10';
      }
    }
    return list;
  }

  private isMonsterId(id: string | undefined): boolean {
    return !!id && /^M(10|[1-9])$/.test(id);
  }

  public isMonsterTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean {
    return this.monsterPawns.has(pawnId);
  }

  public shouldTakeAutoTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean {
    return monsterAI.isEnabled() && this.isMonsterTurn(pawnId) && !this.isProcessingTurn;
  }

  public setMonsterPawn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', isMonster: boolean): void {
    if (isMonster) {
      this.monsterPawns.add(pawnId);
    } else {
      this.monsterPawns.delete(pawnId);
    }
    
    // Ensure B-F pawns are never accidentally marked as monsters
    this.ensurePlayerPawnsNotMonsters();
  }
  
  private ensurePlayerPawnsNotMonsters(): void {
    // Clear any invalid monster pawn assignments (this method prevents legacy bugs)
    const validMonsterPawns = new Set<'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'>();
    for (const pawnId of this.monsterPawns) {
      if (pawnId === 'A' || pawnId.startsWith('M')) {
        validMonsterPawns.add(pawnId);
      }
    }
    this.monsterPawns = validMonsterPawns;
  }

  public isMonsterPawn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10'): boolean {
    return this.monsterPawns.has(pawnId);
  }

  // Debug method to show current monster pawns
  public getMonsterPawns(): string[] {
    return Array.from(this.monsterPawns);
  }

  public async executeMonsterTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', gameState: any): Promise<boolean> {
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

  private async executeCompleteMonsterTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', gameState: any): Promise<void> {
    debugLogger.logAI('MonsterTurnManager', 'Starting complete monster turn', {
      pawnId,
      budget: gameState?.budget,
      turnDelay: this.turnDelay
    });

    // Get AI decision for current game state
    const decision = await monsterAI.makeDecision(gameState);
    
    debugLogger.logAI('MonsterTurnManager', `AI Decision: ${decision.action.type}`, {
      reasoning: decision.action.reasoning,
      hasSequence: decision.action.type === 'multi_action' && decision.action.actionSequence ? decision.action.actionSequence.length : 0
    });
    
    // Show monster dialogue if provided
    if (decision.action.dialogue) {
      monsterDialogueUI.showMessage(decision.action.dialogue);
    }

    // Add small delay for dramatic effect
    await this.sleep(this.turnDelay);

    // Execute the action (single action or multi-action sequence)
    const actionExecuted = await this.executeAction(pawnId, decision, gameState);

    if (!actionExecuted) {
      console.warn(`Failed to execute ${decision.action.type} action for monster ${pawnId}`);
    }

    // For multi-actions or end_turn, we're done. If the multi-action failed to run
    // ensure we still end the turn to avoid leaving the game stalled.
    if (decision.action.type === 'multi_action' || decision.action.type === 'end_turn') {
      if (!actionExecuted) {
        if (typeof (window as any).commitEndTurn === 'function') {
          debugLogger.logAI('Forcing end-turn after failed multi_action', 'MonsterTurnManager');
          (window as any).commitEndTurn();
        } else {
          console.warn('commitEndTurn not available to force end turn');
        }
      }
      console.log(`Monster ${pawnId} completed turn with ${decision.action.type} action`);
      return;
    }

    // For single actions, we might have more to do - but let's add a fallback to end turn
    // to prevent the old infinite loop behavior
    console.log(`Monster ${pawnId} completed single action, turn will be ended by main game loop`);
    // Note: Turn ending is handled by main game loop after successful execution
  }

  private async executeAction(
    pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', 
    decision: MonsterAIResponse,
    gameState?: any
  ): Promise<boolean> {
    const { action } = decision;

    switch (action.type) {
      case 'move':
        {
          const ok = await this.executeMove(pawnId, action, gameState);
          debugLogger.logActionResult(pawnId, 'move', ok, { target: action.target, reasoning: action.reasoning });
          return ok;
        }
      
      case 'attack':
        {
          const ok = await this.executeAttack(pawnId, action, gameState);
          debugLogger.logActionResult(pawnId, 'attack', ok, { target: action.target, reasoning: action.reasoning });
          return ok;
        }
      
      case 'special':
        {
          const ok = await this.executeSpecialAction(pawnId, action);
          debugLogger.logActionResult(pawnId, 'special', ok, { reasoning: action.reasoning });
          return ok;
        }
      
      case 'end_turn':
        {
          const ok = await this.executeEndTurn(pawnId, action);
          debugLogger.logActionResult(pawnId, 'end_turn', ok, { reasoning: action.reasoning });
          return ok;
        }
      
      case 'multi_action':
        {
          const ok = await this.executeMultiAction(pawnId, action, gameState);
          debugLogger.logActionResult(pawnId, 'multi_action', ok, { sequenceLength: action.actionSequence?.length || 0, reasoning: action.reasoning });
          return ok;
        }
      
      default:
        console.warn('Unknown monster action type:', action.type);
        return false;
    }
  }

  private async executeMove(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', action: MonsterCombatAction, gameState?: any): Promise<boolean> {
    if (!action.target) return false;

    try {
  // Resolve pawns and helpers
  const pawn = this.getPawnById(pawnId, gameState);

      const activeId = gameState?.activePawnId ?? (gameState?.turns?.active?.id) ?? (window as any).turns?.active?.id;
      const budget = gameState?.budget ?? gameState?.turns?.budget ?? (window as any).turns?.budget;
      const consume = gameState?.consume ?? (window as any).consume;
      const planFromActiveTo = gameState?.planFromActiveTo ?? (window as any).planFromActiveTo;
      const appendLogLine = gameState?.appendLogLine ?? (window as any).appendLogLine;
      const drawAll = gameState?.drawAll ?? (window as any).drawAll;

      if (!pawn || !consume || !planFromActiveTo || !appendLogLine) {
        console.error('Missing required game functions or pawn data for movement');
        return false;
      }

      // Ensure this is the active pawn's turn
      if (activeId !== pawnId) {
        console.error(`Cannot move pawn ${pawnId} - not their turn (activeId=${activeId})`);
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
      if (info.feet === 5 && (info.difficultSquares || 0) === 0) {
        if (!budget || !consume(budget, 'five-foot-step')) {
          console.warn('No five-foot step available for Monster AI');
          return false;
        }
      } else {
        if (!budget || !consume(budget, 'move')) {
          console.warn('Move action already used for Monster AI');
          return false;
        }
      }

  // Execute the movement (guard against out-of-bounds)
  const boardWidth = Math.floor(800 / 50) // 16 squares (0-15)
  const boardHeight = Math.floor(600 / 50) // 12 squares (0-11)
      
      // Validate movement target is within board bounds
      if (last[0] < 0 || last[0] >= boardWidth || last[1] < 0 || last[1] >= boardHeight) {
        console.warn(`Invalid movement target (${last[0]}, ${last[1]}) - out of bounds on ${boardWidth}x${boardHeight} board`);
        return false;
      }
      
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

  private async executeAttack(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', action: MonsterCombatAction, gameState?: any): Promise<boolean> {
    if (!action.target) return false;

    try {
  // Resolve game helpers and state from possible shapes
      const activeId = gameState?.activePawnId ?? (gameState?.turns?.active?.id) ?? (window as any).turns?.active?.id;
      const budget = gameState?.budget ?? gameState?.turns?.budget ?? (window as any).turns?.budget;
      const consume = gameState?.consume ?? (window as any).consume;
      const appendLogLine = gameState?.appendLogLine ?? (window as any).appendLogLine;
      const drawAll = gameState?.drawAll ?? (window as any).drawAll;
      const attackRoll = gameState?.attackRoll ?? (window as any).attackRoll;
      const isWithinAttackReach = gameState?.isWithinAttackReach ?? (window as any).isWithinAttackReach;

      if (!consume || !appendLogLine || !attackRoll || !isWithinAttackReach) {
        console.error('Missing required game functions for attack');
        return false;
      }

      // Ensure this is the active pawn's turn
      if (activeId !== pawnId) {
        console.error(`Cannot attack with pawn ${pawnId} - not their turn (activeId=${activeId})`);
        return false;
      }

      // Check if standard action is available
      if (!budget || !consume(budget, 'standard')) {
        console.warn('Standard action already used for Monster AI attack');
        return false;
      }

  // Get attacker and resolve target by coordinates across all pawns
  const attacker = this.getPawnById(pawnId, gameState);
  const allPawns = this.getAllPawns(gameState);
  const t = action.target as { x: number; y: number };
  const target = allPawns.find((p: any) => p && p.x === t.x && p.y === t.y);
      
      // Verify target is at the expected position
      if (!target || target.x !== action.target.x || target.y !== action.target.y) {
        console.warn(`Target not found at expected position (${action.target.x}, ${action.target.y})`);
        return false;
      }

  // Check reach distance (generalize reach map)
  const reachMap = (gameState?.reach ?? (window as any).reach) || {};
  const attackerReach = reachMap[pawnId] ?? (this.isMonsterId(pawnId) ? (window as any).reachM1 : (window as any).reachA);
  const rangedMode = ((gameState && gameState.rangedMode) ?? (window as any).rangedMode) || false;
      
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
        // Visuals: show attack slash and flash target pawn (use gameState overlay if provided)
        try {
          const overlay = gameState?.overlay ?? (window as any).overlay
          const cellSize = gameState?.cellSize ?? (window as any).CELL ?? 50
          // show slash for 3s, then show hit indicator and flash pawn for 2s
          showAttackSlash(overlay, attacker.x, attacker.y, target.x, target.y, cellSize, 3000)
          setTimeout(() => {
            try { showHitOrMiss(overlay, target.x, target.y, cellSize, true, 2000) } catch (e) {}
            try {
              // Try to locate a sprite by ID; fall back to A/B for legacy
              const spriteMap = (window as any).sprites || {};
              const targetSprite = spriteMap[target.id] ?? ((target === (window as any).pawnA) ? (window as any).pawnASprite : (window as any).pawnBSprite)
              flashPawnHit(targetSprite, 2000)
            } catch (e) {}
          }, 3000)
        } catch (e) { /* ignore */ }
        
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

  private async executeSpecialAction(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', action: MonsterCombatAction): Promise<boolean> {
    // Placeholder for special abilities like spells, breath weapons, etc.
    console.log(`Monster ${pawnId} uses special ability: ${action.reasoning}`);
    
    // For now, just treat as end turn
    return this.executeEndTurn(pawnId, action);
  }

  private async executeEndTurn(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', action: MonsterCombatAction): Promise<boolean> {
    // Note: Turn ending is handled by main game loop after successful execution
    console.log(`Monster ${pawnId} end turn action completed: ${action.reasoning}`);
    return true;

    console.warn(`Monster ${pawnId} failed to end turn`);
    return false;
  }

  private async executeMultiAction(pawnId: 'A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10', action: MonsterCombatAction, gameState?: any): Promise<boolean> {
    if (!action.actionSequence || action.actionSequence.length === 0) {
      console.warn(`Monster ${pawnId} multi-action has no action sequence`);
      return false;
    }

    console.log(`Monster ${pawnId} executing multi-action sequence: ${action.reasoning}`);
    
    // Execute each action in sequence
    for (let i = 0; i < action.actionSequence.length; i++) {
      const singleAction = action.actionSequence[i];
      console.log(`  Action ${i + 1}/${action.actionSequence.length}: ${singleAction.type} - ${singleAction.reasoning}`);

      // Create a temporary MonsterCombatAction for this single action
      const tempAction: MonsterCombatAction = {
        type: singleAction.type,
        target: singleAction.target,
        reasoning: singleAction.reasoning
      };

      // Execute the single action
      let success = false;
      switch (singleAction.type) {
        case 'move':
          success = await this.executeMove(pawnId, tempAction, gameState);
          break;
        case 'attack':
          success = await this.executeAttack(pawnId, tempAction, gameState);
          break;
        case 'special':
          success = await this.executeSpecialAction(pawnId, tempAction);
          break;
        case 'end_turn':
          success = await this.executeEndTurn(pawnId, tempAction);
          break;
        default:
          console.warn(`Unknown action type in sequence: ${singleAction.type}`);
          continue;
      }

      if (!success) {
        console.warn(`Failed to execute action ${i + 1} in multi-action sequence: ${singleAction.type}`);
        return false;
      }

      // Add small delay between actions for dramatic effect
      if (i < action.actionSequence.length - 1) {
        await this.sleep(500);
      }
    }

    console.log(`Monster ${pawnId} completed multi-action sequence`);
    
    // Note: Turn ending is handled by main game loop after successful execution
    console.log(`Monster ${pawnId} multi-action sequence completed, turn will be ended by main game loop`);
    
    return true;
  }

  private findPawnAtPosition(x: number, y: number, gameState?: any): string | null {
    const all = this.getAllPawns(gameState);
    const found = all.find((p: any) => p && p.x === x && p.y === y);
    return found?.id ?? null;
  }

  // Reference helper to avoid TS unused warnings in builds that tree-shake differently
  private _referencedHelpers(): void {
    void this.findPawnAtPosition;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for game state analysis
  public buildGameState(turns: any, pawnA: any, _pawnM1: any, gameState?: any): any {
    const activePawnId = turns.active?.id as ('A' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10');
    const allPawns = this.getAllPawns(gameState);
    const activePawn = this.getPawnById(activePawnId, { allPawns }) ?? pawnA;

    // Determine enemy team: monsters vs players
    const activeIsMonster = this.isMonsterId(activePawnId);
    const enemies = allPawns.filter((p: any) => {
      if (!p || typeof p.hp !== 'number' || p.hp <= 0) return false;
      const isMonster = this.isMonsterId(p.id);
      return activeIsMonster ? !isMonster : isMonster;
    });

    const activeMonster = this.isMonsterTurn(activePawnId) ? {
      ...activePawn,
      moveAvailable: !!(turns.budget?.moveAvailable),
      attackAvailable: !!(turns.budget?.standardAvailable),
      fiveFootStepAvailable: !!(turns.budget?.fiveFootStepAvailable)
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
      enemyCount: enemies.length
    });

    return {
      activePawnId,
      activeMonster,
      activePawn,
      enemies,
      allPawns,
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
