import {useResumeStore} from '../../store/useResumeStore';
import {useShallow} from 'zustand/react/shallow';
import type {ResumeContent, ResumeEntry, ResumeSection} from '../../types/resume';
import {
  addEntry,
  duplicateEntry,
  ensureContent,
  removeEntry,
  removeSection,
  renameSection,
  reorderEntries,
  reorderSections,
  setSectionVisible,
  updateEntry,
} from '../../utils/resume/contentMutators';
import {useRef} from 'react';

const EMPTY_CONTENT: ResumeContent = {sections: []};
const EMPTY_IDS: readonly string[] = Object.freeze([]);

export const useResumeContent = (
  resumeId: string,
): {content: ResumeContent; update: (fn: (prev: ResumeContent) => ResumeContent) => void} => {
  const content = useResumeStore(state =>
    state.resumes.find(r => r.id === resumeId)?.content,
  );
  const updateResumeContent = useResumeStore(state => state.updateResumeContent);
  const updateRef = useRef<((fn: (prev: ResumeContent) => ResumeContent) => void) | undefined>(undefined);
  updateRef.current = (fn: (prev: ResumeContent) => ResumeContent): void => {
    updateResumeContent(resumeId, prev => fn(ensureContent(prev)));
  };
  const update = (fn: (prev: ResumeContent) => ResumeContent): void => {
    updateRef.current!(fn);
  };
  return {content: content ?? EMPTY_CONTENT, update};
};

export const useSectionOps = (
  resumeId: string,
  section: ResumeSection,
  index: number,
  count: number,
) => {
  const {update} = useResumeContent(resumeId);
  const orderIds = useResumeStore(
    useShallow(
      state =>
        state.resumes.find(r => r.id === resumeId)?.content?.sections.map(s => s.id) ??
        EMPTY_IDS,
    ),
  );

  const canMoveUp = index > 0;
  const canMoveDown = index < count - 1;

  const move = (dir: -1 | 1): void => {
    const i = orderIds.indexOf(section.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= orderIds.length) {
      return;
    }
    const next = [...orderIds];
    [next[i], next[j]] = [next[j], next[i]];
    update(prev => reorderSections(prev, next));
  };

  return {
    canMoveUp,
    canMoveDown,
    moveUp: () => move(-1),
    moveDown: () => move(1),
    toggleVisible: () => update(prev => setSectionVisible(prev, section.id, !section.visible)),
    remove: () => update(prev => removeSection(prev, section.id)),
    rename: (title: string) => update(prev => renameSection(prev, section.id, title)),
  };
};

export const useEntryOps = (resumeId: string, sectionId: string) => {
  const {update} = useResumeContent(resumeId);
  const orderIds = useResumeStore(
    useShallow(state => {
      const resume = state.resumes.find(r => r.id === resumeId);
      const sec = resume?.content?.sections.find(s => s.id === sectionId);
      if (sec && 'entries' in sec) {
        return sec.entries.map(e => e.id);
      }
      return EMPTY_IDS;
    }),
  );

  return {
    add: (entry: ResumeEntry) => update(prev => addEntry(prev, sectionId, entry)),
    updateEntry: (entry: ResumeEntry) => update(prev => updateEntry(prev, sectionId, entry)),
    remove: (id: string) => update(prev => removeEntry(prev, sectionId, id)),
    duplicate: (id: string) => update(prev => duplicateEntry(prev, sectionId, id)),
    move: (id: string, dir: -1 | 1): void => {
      const i = orderIds.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= orderIds.length) {
        return;
      }
      const next = [...orderIds];
      [next[i], next[j]] = [next[j], next[i]];
      update(prev => reorderEntries(prev, sectionId, next));
    },
  };
};
