(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/dm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Please respond with only a JSON object like { "combatAnalysis": { "monster": { "position": { "x": 1, "y": 2 } } } }',
        personality: 'tactical_strategist'
      })
    });

    console.log('STATUS', res.status);
    const j = await res.json();
    console.log('keys:', Object.keys(j));
    console.log('has structured?', j.structured !== undefined);
    console.log('structured:', JSON.stringify(j.structured, null, 2));
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
