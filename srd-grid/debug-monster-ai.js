// Monster AI Debug Script - Run this in browser console
console.log('🐲 Monster AI Debug Information');
console.log('================================');

// Check if Monster AI functions are available
console.log('Available functions:', {
  toggleMonsterAI: typeof window.toggleMonsterAI,
  testMonsterAI: typeof window.testMonsterAI,
  setMonsterPawn: typeof window.setMonsterPawn,
  triggerMonsterTurn: typeof window.triggerMonsterTurn,
  monsterAIHelp: typeof window.monsterAIHelp
});

// Check current Monster AI state
if (window.monsterAI) {
  console.log('Monster AI Status:');
  console.log('- Enabled:', window.monsterAI.isEnabled());
  console.log('- Current Personality:', window.monsterAI.getCurrentPersonality().name);
  console.log('- Available Personalities:', window.monsterAI.getAvailablePersonalities());
}

if (window.monsterTurnManager) {
  console.log('Monster Turn Manager Status:');
  console.log('- Pawn A is Monster:', window.monsterTurnManager.isMonsterPawn('A'));
  console.log('- Pawn B is Monster:', window.monsterTurnManager.isMonsterPawn('B'));
}

if (window.turns) {
  console.log('Game State:');
  console.log('- Current Round:', window.turns.round);
  console.log('- Active Pawn:', window.turns.active?.id);
  console.log('- Turn Budget:', window.turns.budget);
}

console.log('\n🛠️ Quick Fix Commands:');
console.log('1. Enable Monster AI: window.toggleMonsterAI()');
console.log('2. Set Pawn B as Monster: window.setMonsterPawn("B")');
console.log('3. Trigger Monster Turn: window.triggerMonsterTurn("B")');
console.log('4. Show AI Help: window.monsterAIHelp()');

// Auto-enable if not enabled
if (window.monsterAI && !window.monsterAI.isEnabled()) {
  console.log('\n🔧 Auto-enabling Monster AI...');
  window.toggleMonsterAI();
}

// Auto-set Pawn B as monster if not set
if (window.monsterTurnManager && !window.monsterTurnManager.isMonsterPawn('B')) {
  console.log('🔧 Setting Pawn B as Monster...');
  window.setMonsterPawn('B');
}

console.log('\n✅ Monster AI should now be active for Pawn B!');
console.log('Try ending a player turn to trigger AI behavior.');
