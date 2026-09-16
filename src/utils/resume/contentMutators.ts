import type {
  BaseSection,
  CertificationEntry,
  CustomSectionData,
  EducationEntry,
  ExperienceEntry,
  IntroData,
  PersonalInfoData,
  ProjectEntry,
  ResumeContent,
  ResumeSection,
  SkillGroup,
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
import {createId} from './ids';

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

const isMeaningful = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const mergeData = <T extends Record<string, unknown>>(existing: T, proposed: T): T => {
  const result = {...existing};
  for (const key of Object.keys(proposed) as (keyof T)[]) {
    const pVal = proposed[key];
    if (isMeaningful(pVal)) {
      result[key] = pVal as T[keyof T];
    }
  }
  return result;
};

export const mergeSections = (existing: ResumeSection, proposed: ResumeSection): ResumeSection => {
  if (existing.type !== proposed.type) return existing;

  switch (existing.type) {
    case 'personalInfo':
    case 'intro': {
      const eData = (existing as unknown as {data: Record<string, unknown>}).data;
      const pData = (proposed as unknown as {data: Record<string, unknown>}).data;
      return {...existing, data: mergeData(eData, pData)} as ResumeSection;
    }
    case 'experience':
    case 'projects':
    case 'education':
    case 'certifications': {
      const eEntries = (existing as unknown as {entries: any[]}).entries;
      const pEntries = (proposed as unknown as {entries: any[]}).entries;
      const appended = pEntries.map(entry => ({
        ...entry,
        id: createId('entry'),
        order: nextEntryOrder(eEntries),
      }));
      return {...existing, entries: [...eEntries, ...appended]} as ResumeSection;
    }
    case 'skills': {
      const eSkills = existing as {groups: SkillGroup[]; uncategorized: SkillItem[]};
      const pSkills = proposed as {groups: SkillGroup[]; uncategorized: SkillItem[]};

      const mergedUncategorized = [...eSkills.uncategorized];
      for (const s of pSkills.uncategorized) {
        if (!mergedUncategorized.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
          mergedUncategorized.push(s);
        }
      }

      const mergedGroups = [...eSkills.groups];
      for (const pg of pSkills.groups) {
        const idx = mergedGroups.findIndex(g => g.title.toLowerCase() === pg.title.toLowerCase());
        if (idx >= 0) {
          const mergedSkills = [...mergedGroups[idx].skills];
          for (const s of pg.skills) {
            if (!mergedSkills.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
              mergedSkills.push(s);
            }
          }
          mergedGroups[idx] = {...mergedGroups[idx], skills: mergedSkills};
        } else {
          mergedGroups.push(pg);
        }
      }

      return {...existing, uncategorized: mergedUncategorized, groups: mergedGroups} as ResumeSection;
    }
    case 'custom': {
      const eCustom = existing as {title?: string; data: CustomSectionData};
      const pCustom = proposed as {title?: string; data: CustomSectionData};
      if (eCustom.title?.toLowerCase() !== pCustom.title?.toLowerCase()) return existing;
      return {
        ...existing,
        data: {
          ...eCustom.data,
          ...(isMeaningful(pCustom.data.content) ? {content: pCustom.data.content} : {}),
          entries: [...(eCustom.data.entries ?? []), ...(pCustom.data.entries ?? [])],
        },
      } as ResumeSection;
    }
  }
};

const isPersonalInfo = (section: ResumeSection): section is BaseSection & {type: 'personalInfo'; data: PersonalInfoData} =>
  section.type === 'personalInfo';

export const moveContact = <T extends {id: string}>(
  content: ResumeContent,
  sectionId: string,
  index: number,
  dir: -1 | 1,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || !isPersonalInfo(section)) return content;

  const listField = 'emails' in section.data ? 'emails'
    : 'phoneNumbers' in section.data ? 'phoneNumbers'
    : 'addresses' in section.data ? 'addresses'
    : 'links' in section.data ? 'links'
    : null;

  if (!listField) return content;

  const list = (section.data as unknown as Record<string, T[]>)[listField];
  const j = index + dir;
  if (index < 0 || j < 0 || j >= list.length) return content;

  const next = [...list];
  [next[index], next[j]] = [next[j], next[index]];
  return replaceSection(content, {...section, data: {...section.data, [listField]: next}} as ResumeSection);
};

export const reorderSkillGroup = (
  content: ResumeContent,
  sectionId: string,
  groupId: string,
  dir: -1 | 1,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') return content;

  const groups = section.groups;
  const idx = groups.findIndex(g => g.id === groupId);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= groups.length) return content;

  const next = [...groups];
  [next[idx], next[j]] = [next[j], next[idx]];
  return replaceSection(content, {...section, groups: next});
};

export const reorderSkill = (
  content: ResumeContent,
  sectionId: string,
  groupId: string | null,
  skillId: string,
  dir: -1 | 1,
): ResumeContent => {
  const section = findSection(content, sectionId);
  if (!section || section.type !== 'skills') return content;

  if (groupId === null) {
    const uncategorized = section.uncategorized;
    const idx = uncategorized.findIndex(s => s.id === skillId);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= uncategorized.length) return content;
    const next = [...uncategorized];
    [next[idx], next[j]] = [next[j], next[idx]];
    return replaceSection(content, {...section, uncategorized: next});
  }

  const groups = section.groups;
  const groupIdx = groups.findIndex(g => g.id === groupId);
  if (groupIdx < 0) return content;
  const skills = groups[groupIdx].skills;
  const skillIdx = skills.findIndex(s => s.id === skillId);
  const j = skillIdx + dir;
  if (skillIdx < 0 || j < 0 || j >= skills.length) return content;
  const nextSkills = [...skills];
  [nextSkills[skillIdx], nextSkills[j]] = [nextSkills[j], nextSkills[skillIdx]];
  const nextGroups = [...groups];
  nextGroups[groupIdx] = {...nextGroups[groupIdx], skills: nextSkills};
  return replaceSection(content, {...section, groups: nextGroups});
};

export {createExperienceEntry, createProjectEntry, createEducationEntry, createCertificationEntry};
