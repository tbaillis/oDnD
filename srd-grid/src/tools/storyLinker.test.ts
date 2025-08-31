import { describe, it, expect } from 'vitest';
import { StoryManager } from './storyManager';
import { BattleLinker } from './battleLinker';
import { DungeonLinker } from './dungeonLinker';

describe('story linking tools', () => {
  it('links a battle and dungeon to a central story', () => {
    const story = new StoryManager();
    const events: any[] = [];
    story.onEvent(e => events.push(e));

    // create a chapter with two encounters (battle and dungeon)
    story.addChapter({
      id: 'ch-1',
      title: 'The Lost Mine',
      encounters: [
        { id: 'enc-1', name: 'Goblin Ambush' },
        { id: 'enc-2', name: 'Forgotten Hall' },
      ],
    });

    const battle = new BattleLinker(story);
    const battleCtrl = battle.startBattle('ch-1', 'enc-1', { battleId: 'b-1', participants: ['pc1', 'pc2'] });
    battleCtrl.finish('won', { loot: ['gold'] });

    const dungeon = new DungeonLinker(story);
    const dungeonCtrl = dungeon.explore('ch-1', 'enc-2', { dungeonId: 'd-1', rooms: 5 });
    dungeonCtrl.progress(50, { found: 'trap' });

    // event checks
    expect(events.some(e => e.type === 'encounter_started' && e.encounterId === 'enc-1')).toBe(true);
    expect(events.some(e => e.type === 'battle_result' && e.result === 'won')).toBe(true);
    expect(events.some(e => e.type === 'dungeon_explored' && e.progress === 50)).toBe(true);
  });
});
