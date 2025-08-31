// Central story manager: holds chapters and accepts events from linkers (battles/dungeons).
export type ID = string;

export interface Chapter {
  id: ID;
  title: string;
  description?: string;
  encounters: Encounter[];
}

export interface Encounter {
  id: ID;
  name: string;
  linked?: boolean;
  meta?: Record<string, unknown>;
}

export type BattleResult = 'won' | 'lost' | 'fled';

export type BattleLogEntry = { who?: string; target?: string; dmg?: number; text?: string; time?: number }

export type StoryEvent =
  | { type: 'encounter_started'; chapterId: ID; encounterId: ID }
  | { type: 'battle_result'; chapterId?: ID; encounterId?: ID; result: BattleResult; details?: any }
  | { type: 'dungeon_explored'; chapterId?: ID; encounterId?: ID; progress?: number; details?: any }
  | { type: 'battle_log'; chapterId?: ID; encounterId?: ID; log: BattleLogEntry[] }
  | { type: 'narrative'; chapterId?: ID; encounterId?: ID; text: string; meta?: any };

export class StoryManager {
  private chapters: Map<ID, Chapter> = new Map();
  private listeners: Set<(e: StoryEvent) => void> = new Set();

  addChapter(chapter: Chapter) {
    this.chapters.set(chapter.id, chapter);
  }

  getChapter(id: ID) {
    return this.chapters.get(id);
  }

  startEncounter(chapterId: ID, encounterId: ID) {
    const ch = this.chapters.get(chapterId);
    if (!ch) throw new Error('chapter not found');
    const enc = ch.encounters.find(e => e.id === encounterId);
    if (!enc) throw new Error('encounter not found');
    enc.linked = true;
    this.emit({ type: 'encounter_started', chapterId, encounterId });
  }

  emit(event: StoryEvent) {
    for (const l of Array.from(this.listeners)) l(event);
  }

  onEvent(cb: (e: StoryEvent) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // convenience helpers used by linkers
  applyBattleResult(chapterId: ID | undefined, encounterId: ID | undefined, result: BattleResult, details?: any) {
    this.emit({ type: 'battle_result', chapterId, encounterId, result, details });
  }

  applyBattleLog(chapterId: ID | undefined, encounterId: ID | undefined, log: BattleLogEntry[]) {
    this.emit({ type: 'battle_log', chapterId, encounterId, log });
  }

  applyNarrative(chapterId: ID | undefined, encounterId: ID | undefined, text: string, meta?: any) {
    this.emit({ type: 'narrative', chapterId, encounterId, text, meta });
  }

  applyDungeonProgress(chapterId: ID | undefined, encounterId: ID | undefined, progress?: number, details?: any) {
    this.emit({ type: 'dungeon_explored', chapterId, encounterId, progress, details });
  }
}

export default StoryManager;
