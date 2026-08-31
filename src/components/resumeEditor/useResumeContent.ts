import {useResumeStore} from '../../store/useResumeStore';
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

export const useResumeContent = (
  resumeId: string,
): {content: ResumeContent; update: (fn: (prev: ResumeContent) => ResumeContent) => void} => {
  const content = useResumeStore(state =>
    state.resumes.find(r => r.id === resumeId)?.content,
  );
  const updateResumeContent = useResumeStore(state => state.updateResumeContent);
  const update = (fn: (prev: ResumeContent) => ResumeContent): void => {
    updateResumeContent(resumeId, prev => fn(ensureContent(prev)));
  };
  return {content: ensureContent(content), update};
};

export const useSectionOps = (
  resumeId: string,
  section: ResumeSection,
  index: number,
  count: number,
) => {
  const {update} = useResumeContent(resumeId);
  const orderIds = useResumeStore(
    state =>
      state.resumes.find(r => r.id === resumeId)?.content?.sections.map(s => s.id) ??
      [],
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
  const orderIds = useResumeStore(state => {
    const resume = state.resumes.find(r => r.id === resumeId);
    const sec = resume?.content?.sections.find(s => s.id === sectionId);
    if (sec && 'entries' in sec) {
      return sec.entries.map(e => e.id);
    }
    return [];
  });

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
