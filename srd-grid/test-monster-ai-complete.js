// Paste this into the browser console to test Monster AI
console.log('🧪 Testing Monster AI System...');

async function testMonsterAIComplete() {
    console.log('\n=== MONSTER AI COMPLETE SYSTEM TEST ===');
    
    // Enable detailed logging first
    if (window.debugLogger) {
        window.debugLogger.enableAILogging(true);
        window.debugLogger.enableDetailedLogging(true);
        window.debugLogger.showPanel();
        console.log('✅ Debug logging enabled');
    }
    
    // 1. Check if everything is loaded
    console.log('1️⃣ Checking system availability...');
    const systems = {
        monsterAI: !!window.monsterAI,
        monsterTurnManager: !!window.monsterTurnManager,
        debugLogger: !!window.debugLogger,
        turns: !!window.turns,
        pawns: !!(window.pawnA && window.pawnM1)
    };
    console.log('Systems:', systems);
    
    if (!systems.monsterAI || !systems.monsterTurnManager) {
        console.error('❌ Core systems not available!');
        return;
    }
    
    // 2. Enable and configure AI
    console.log('\n2️⃣ Configuring Monster AI...');
    window.monsterAI.enable();
    window.monsterTurnManager.setMonsterPawn('M1', true);
    
    console.log('AI Status after configuration:', {
        enabled: window.monsterAI.isEnabled(),
        ready: window.monsterAI.isReady(),
        pawnM1IsMonster: window.monsterTurnManager.isMonsterPawn('M1')
    });
    
    // 3. Set up game state for testing
    console.log('\n3️⃣ Setting up test scenario...');
    if (window.pawnA && window.pawnM1) {
        // Position pawns for combat test - make sure they need to move to attack
        window.pawnA.x = 5;
        window.pawnA.y = 5;
        window.pawnA.hp = 20;
        window.pawnA.maxHp = 20;
        
        window.pawnM1.x = 8;  // 3 squares away - requires movement to attack
        window.pawnM1.y = 5;
        window.pawnM1.hp = 30;
        window.pawnM1.maxHp = 30;
        
        console.log('✅ Pawns positioned for combat test');
        console.log(`   Pawn A (Player): (${window.pawnA.x}, ${window.pawnA.y}) HP: ${window.pawnA.hp}/${window.pawnA.maxHp}`);
        console.log(`   Pawn M1 (Monster): (${window.pawnM1.x}, ${window.pawnM1.y}) HP: ${window.pawnM1.hp}/${window.pawnM1.maxHp}`);
        console.log(`   Distance: ${Math.abs(window.pawnA.x - window.pawnM1.x) + Math.abs(window.pawnA.y - window.pawnM1.y)} squares`);
    }
    
    // 4. Set up turn state with MOVEMENT AVAILABLE
    console.log('\n4️⃣ Setting up turn state...');
    if (window.turns) {
        window.turns.active = { id: 'M1' }; // Make M1 the active pawn
        window.turns.budget = {
            move: true,
            standard: true,
            fiveFootStep: true,
            // Also try the other budget format
            moveAvailable: true,
            standardAvailable: true,
            fiveFootStepAvailable: true,
            freeCount: 99
        };
        console.log('✅ Turn state configured for Pawn M1 with FULL action budget');
        console.log('Budget details:', window.turns.budget);
    }
    
    // 5. Test Monster AI decision making with detailed logging
    console.log('\n5️⃣ Testing Monster AI decision making with detailed logging...');
    try {
        // Build game state like the real system does
        const gameState = window.monsterTurnManager.buildGameState(
            window.turns, 
            window.pawnA, 
            window.pawnM1, 
            { grid: window.G, terrain: window.G, effects: window.effects }
        );
        
        console.log('Game state built:', {
            activePawnId: gameState.activePawnId,
            activeMonster: !!gameState.activeMonster,
            enemies: gameState.enemies?.length || 0,
            budget: gameState.budget,
            monsterPosition: gameState.activeMonster ? `(${gameState.activeMonster.x}, ${gameState.activeMonster.y})` : 'none',
            enemyPosition: gameState.enemies?.[0] ? `(${gameState.enemies[0].x}, ${gameState.enemies[0].y})` : 'none'
        });
        
        console.log('🚨 BEFORE AI DECISION - Check debug panel for detailed logs!');
        
        // Test the AI decision
        const decision = await window.monsterAI.makeDecision(gameState);
        console.log('✅ Monster AI Decision:', decision);
        
        if (decision.action.type === 'move') {
            console.log('🎯 AI correctly decided to MOVE closer (distance > reach)');
            console.log(`   Moving from (${gameState.activeMonster.x}, ${gameState.activeMonster.y}) to (${decision.action.target.x}, ${decision.action.target.y})`);
        } else if (decision.action.type === 'attack') {
            console.log('🎯 AI decided to ATTACK (already in range)');
        } else if (decision.action.type === 'end_turn') {
            console.log('🤔 AI decided to END TURN:', decision.action.reasoning);
            console.log('❌ THIS MIGHT BE THE BUG - should have moved instead!');
        }
        
    } catch (error) {
        console.error('❌ Error testing AI decision:', error);
    }
    
    // 6. Test full turn execution with detailed logging
    console.log('\n6️⃣ Testing complete turn execution with detailed logging...');
    try {
        // Reset budget for full turn test
        window.turns.budget = {
            move: true,
            standard: true,
            fiveFootStep: true,
            moveAvailable: true,
            standardAvailable: true,
            fiveFootStepAvailable: true,
            freeCount: 99
        };
        
        console.log('🚨 BEFORE TURN EXECUTION - Watch debug panel for step-by-step logs!');
        console.log('🤖 Executing complete Monster AI turn...');
        
        const success = await window.monsterTurnManager.executeMonsterTurn('M1', 
            window.monsterTurnManager.buildGameState(
                window.turns, 
                window.pawnA, 
                window.pawnM1, 
                { grid: window.G, terrain: window.G, effects: window.effects }
            )
        );
        
        console.log(`✅ Monster turn execution result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        // Check what happened
        console.log('Final positions:');
        console.log(`   Pawn A: (${window.pawnA.x}, ${window.pawnA.y}) HP: ${window.pawnA.hp}/${window.pawnA.maxHp}`);
        console.log(`   Pawn M1: (${window.pawnM1.x}, ${window.pawnM1.y}) HP: ${window.pawnM1.hp}/${window.pawnM1.maxHp}`);
        console.log(`   Final distance: ${Math.abs(window.pawnA.x - window.pawnM1.x) + Math.abs(window.pawnA.y - window.pawnM1.y)} squares`);
        console.log(`   Turn budget remaining:`, window.turns.budget);
        
        if (window.pawnM1.x === 8 && window.pawnM1.y === 5) {
            console.log('❌ MONSTER DID NOT MOVE! Check debug panel for the reason.');
        } else {
            console.log('✅ MONSTER MOVED successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error executing full turn:', error);
    }
    
    console.log('\n✅ Monster AI Complete System Test Finished!');
    console.log('🔍 Check the debug panel (bottom-right) for detailed step-by-step analysis.');
    console.log('📋 Look for any issues in the combat analysis and decision logic.');
}

// Run the test
testMonsterAIComplete();
