import type {
  CertificationEntry,
  CustomSectionData,
  EducationEntry,
  ExperienceEntry,
  IntroData,
  PersonalInfoData,
  ProjectEntry,
  ResumeContent,
  ResumeSection,
  SkillItem,
} from '../../types/resume';
import {
  createExperienceEntry,
  createProjectEntry,
  createEducationEntry,
  createCertificationEntry,
  createSkillItem,
  createSkillGroup,
} from './sectionFactory';

const reindexSections = (sections: ResumeSection[]): ResumeSection[] =>
  [...sections].sort((a, b) => a.order - b.order);

const withSections = (
  content: ResumeContent,
  sections: ResumeSection[],
): ResumeContent => ({
  ...content,
  sections: reindexSections(sections),
});

const findSection = (
  content: ResumeContent,
  sectionId: string,
): ResumeSection | undefined =>
  content.sections.find(section => section.id === sectionId);

/** Build a content object if the provided value is missing. */
export const ensureContent = (content?: ResumeContent): ResumeContent =>
  content ?? {sections: []};

export const addSection = (
  content: ResumeContent,
  section: ResumeSection,
): ResumeContent =>
  withSections(content, [...content.sections, section]);

export const replaceSection = (
  content: ResumeContent,
  section: ResumeSection,
): ResumeContent =>
  withSections(
    content,
    content.sections.map(existing =>
      existing.id === section.id ? section : existing,
    ),
  );

export const removeSection = (
  content: ResumeContent,
  sectionId: string,
): ResumeContent =>
  withSections(
    content,
    content.sections.filter(section => section.id !== sectionId),
  );

export const reorderSections = (
  content: ResumeContent,
  orderedIds: string[],
): ResumeContent => {
  const byId = new Map(content.sections.map(section => [section.id, section]));
  const next = orderedIds
    .map((id, index) => {
      const section = byId.get(id);
      return section ? {...section, order: index} : null;
    })
    .filter((section): section is ResumeSection => section !== null);
  // Preserve any sections not included in orderedIds (defensive).
  const included = new Set(orderedIds);
  const remaining = content.sections
    .filter(section => !included.has(section.id))
    .map((section, i) => ({...section, order: next.length + i}));
  return withSections(content, [...next, ...remaining]);
};

export const setSectionVisible = (
  content: ResumeContent,
  sectionId: string,
  visible: boolean,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  return replaceSection(content, {...section, visible});
};

const nextEntryOrder = (entries: Array<{order: number}>): number =>
  entries.reduce((max, entry) => Math.max(max, entry.order), -1) + 1;

const mapEntries = (
  section: ResumeSection,
  sectionId: string,
  transform: (entries: any[]) => any[],
): ResumeSection => {
  if (section.id !== sectionId) {
    return section;
  }
  switch (section.type) {
    case 'experience':
      return {...section, entries: transform(section.entries) as ExperienceEntry[]};
    case 'projects':
      return {...section, entries: transform(section.entries) as ProjectEntry[]};
    case 'education':
      return {...section, entries: transform(section.entries) as EducationEntry[]};
    case 'certifications':
      return {...section, entries: transform(section.entries) as CertificationEntry[]};
    default:
      return section;
  }
};

export const addEntry = (
  content: ResumeContent,
  sectionId: string,
  entry:
    | ExperienceEntry
    | ProjectEntry
    | EducationEntry
    | CertificationEntry,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  return replaceSection(
    content,
    mapEntries(section, sectionId, (entries: any[]) => [
      ...entries,
      {...entry, order: nextEntryOrder(entries)},
    ]),
  );
};

export const updateEntry = (
  content: ResumeContent,
  sectionId: string,
  entry:
    | ExperienceEntry
    | ProjectEntry
    | EducationEntry
    | CertificationEntry,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  return replaceSection(
    content,
    mapEntries(section, sectionId, (entries: any[]) =>
      entries.map((existing: any) =>
        existing.id === entry.id ? {...existing, ...entry} : existing,
      ),
    ),
  );
};

export const removeEntry = (
  content: ResumeContent,
  sectionId: string,
  entryId: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  return replaceSection(
    content,
    mapEntries(section, sectionId, (entries: any[]) =>
      entries.filter((existing: any) => existing.id !== entryId),
    ),
  );
};

export const duplicateEntry = (
  content: ResumeContent,
  sectionId: string,
  entryId: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  const clone = mapEntries(section, sectionId, (entries: any[]) => {
    const list = entries;
    const index = list.findIndex((e: any) => e.id === entryId);
    if (index === -1) {
      return list;
    }
    const source = list[index];
    const copy = {
      ...source,
      id: `${source.id}-copy-${Math.random().toString(16).slice(2, 6)}`,
      order: nextEntryOrder(list),
    };
    return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
  });
  return replaceSection(content, clone);
};

export const reorderEntries = (
  content: ResumeContent,
  sectionId: string,
  orderedIds: string[],
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  const updated = mapEntries(section, sectionId, (entries: any) => {
    const list = entries as any[];
    const byId = new Map(list.map((e: any) => [e.id, e]));
    const next = orderedIds
      .map((id, index) => {
        const item = byId.get(id);
        return item ? {...item, order: index} : null;
      })
      .filter((e: any): e is any => e !== null);
    const included = new Set(orderedIds);
    const remaining = list
      .filter((e: any) => !included.has(e.id))
      .map((e: any, i: number) => ({...e, order: next.length + i}));
    return [...next, ...remaining];
  });
  return replaceSection(content, updated as ResumeSection);
};

/* ----- Skills (groups + uncategorized) ----- */

export const addSkillGroup = (
  content: ResumeContent,
  sectionId: string,
  title: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  return replaceSection(content, {
    ...section,
    groups: [...section.groups, createSkillGroup(title)],
  });
};

export const renameSkillGroup = (
  content: ResumeContent,
  sectionId: string,
  groupId: string,
  title: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  return replaceSection(content, {
    ...section,
    groups: section.groups.map(group =>
      group.id === groupId ? {...group, title} : group,
    ),
  });
};

export const removeSkillGroup = (
  content: ResumeContent,
  sectionId: string,
  groupId: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  const group = section.groups.find(g => g.id === groupId);
  const movedSkills: SkillItem[] = group ? group.skills : [];
  return replaceSection(content, {
    ...section,
    groups: section.groups.filter(g => g.id !== groupId),
    uncategorized: [...section.uncategorized, ...movedSkills],
  });
};

export const addSkill = (
  content: ResumeContent,
  sectionId: string,
  name: string,
  groupId?: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  const skill = createSkillItem(name);
  if (groupId) {
    return replaceSection(content, {
      ...section,
      groups: section.groups.map(group =>
        group.id === groupId
          ? {...group, skills: [...group.skills, skill]}
          : group,
      ),
    });
  }
  return replaceSection(content, {
    ...section,
    uncategorized: [...section.uncategorized, skill],
  });
};

export const removeSkill = (
  content: ResumeContent,
  sectionId: string,
  skillId: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  return replaceSection(content, {
    ...section,
    uncategorized: section.uncategorized.filter(s => s.id !== skillId),
    groups: section.groups.map(group => ({
      ...group,
      skills: group.skills.filter(s => s.id !== skillId),
    })),
  });
};

/** Move a skill to a group (groupId) or to uncategorized (groupId = null). */
export const moveSkill = (
  content: ResumeContent,
  sectionId: string,
  skillId: string,
  groupId: string | null,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') {
    return content;
  }
  let skill: SkillItem | undefined;
  const strippedUncategorized = section.uncategorized.filter(s => {
    if (s.id === skillId) {
      skill = s;
      return false;
    }
    return true;
  });
  const strippedGroups = section.groups.map(group => ({
    ...group,
    skills: group.skills.filter(s => {
      if (s.id === skillId) {
        skill = s;
        return false;
      }
      return true;
    }),
  }));
  if (!skill) {
    return content;
  }
  const movingSkill = skill;
  if (groupId === null) {
    return replaceSection(content, {
      ...section,
      uncategorized: [...strippedUncategorized, movingSkill],
      groups: strippedGroups,
    });
  }
  return replaceSection(content, {
    ...section,
    uncategorized: strippedUncategorized,
    groups: strippedGroups.map(group =>
      group.id === groupId
        ? {...group, skills: [...group.skills, movingSkill]}
        : group,
    ),
  });
};

/* ----- Personal info / intro / custom helpers ----- */

export const updatePersonalInfo = (
  content: ResumeContent,
  sectionId: string,
  patch: Partial<PersonalInfoData>,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'personalInfo') {
    return content;
  }
  return replaceSection(content, {...section, data: {...section.data, ...patch}});
};

export const updateIntro = (
  content: ResumeContent,
  sectionId: string,
  patch: Partial<IntroData>,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'intro') {
    return content;
  }
  return replaceSection(content, {...section, data: {...section.data, ...patch}});
};

export const updateCustomSection = (
  content: ResumeContent,
  sectionId: string,
  patch: Partial<CustomSectionData>,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'custom') {
    return content;
  }
  return replaceSection(content, {
    ...section,
    data: {...section.data, ...patch},
  });
};

export const renameSection = (
  content: ResumeContent,
  sectionId: string,
  title: string,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section) {
    return content;
  }
  return replaceSection(content, {
    ...section,
    title: section.type === 'custom' ? title : section.title,
  });
};

export {createExperienceEntry, createProjectEntry, createEducationEntry, createCertificationEntry};
