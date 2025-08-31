import StoryManager from './storyManager';
import type { ID } from './storyManager';

export interface DungeonMeta {
  dungeonId: ID;
  rooms: number;
  theme?: string;
}

export class DungeonLinker {
  private story: StoryManager;

  constructor(story: StoryManager) {
    this.story = story;
  }

  explore(chapterId: ID | undefined, encounterId: ID | undefined, meta: DungeonMeta) {
    // emit a starting signal if available and valid
    if (chapterId && encounterId) {
      const ch = this.story.getChapter(chapterId);
      const encExists = ch?.encounters?.some(e => e.id === encounterId);
      if (ch && encExists) {
        this.story.startEncounter(chapterId, encounterId);
      } else {
        // start skipped - emit a progress event so the story still receives updates
        this.story.applyDungeonProgress(chapterId, encounterId, 0, { note: 'start skipped - encounter missing', meta });
      }
    }

    return {
      progress: (percent: number, details?: any) => this.story.applyDungeonProgress(chapterId, encounterId, percent, { ...details, meta }),
    };
  }
}

export default DungeonLinker;
