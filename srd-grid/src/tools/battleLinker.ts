import StoryManager from './storyManager';
import type { ID, BattleResult } from './storyManager';

export interface BattleMeta {
  battleId: ID;
  participants: string[];
  difficulty?: number;
}

export class BattleLinker {
  private story: StoryManager;

  constructor(story: StoryManager) {
    this.story = story;
  }

  startBattle(chapterId: ID | undefined, encounterId: ID | undefined, meta: BattleMeta) {
    // if chapter/encounter provided and exists, signal start
    if (chapterId && encounterId) {
      const ch = this.story.getChapter(chapterId);
      const encExists = ch?.encounters?.some(e => e.id === encounterId);
      if (ch && encExists) {
        this.story.startEncounter(chapterId, encounterId);
      } else {
        // emit a looser event instead of throwing from StoryManager
        this.story.applyBattleResult(chapterId, encounterId, 'fled', { note: 'start skipped - encounter missing', meta });
      }
    }
    // return a richer controller for reporting results, logs, narrative, and XP
    const logBuffer: Array<{ who?: string; target?: string; dmg?: number; text?: string; time?: number }> = []
    return {
      log: (entry: { who?: string; target?: string; dmg?: number; text?: string }) => {
        logBuffer.push({ ...entry, time: Date.now() })
        this.story.applyBattleLog(chapterId, encounterId, logBuffer.slice())
      },
      narrative: (text: string, meta?: any) => this.story.applyNarrative(chapterId, encounterId, text, meta),
      awardXP: (amount: number) => this.story.applyBattleResult(chapterId, encounterId, 'won', { ...meta, xpAwarded: amount }),
      finish: (result: BattleResult, details?: any) => {
        // flush logs and emit final result
        if (logBuffer.length) this.story.applyBattleLog(chapterId, encounterId, logBuffer.slice())
        this.story.applyBattleResult(chapterId, encounterId, result, { ...details, meta })
      }
    };
  }
}

export default BattleLinker;
