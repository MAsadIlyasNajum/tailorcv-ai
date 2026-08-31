import type {
  CertificationEntry,
  CustomEntry,
  EducationEntry,
  ExperienceEntry,
  PersonalInfoData,
  ProjectEntry,
  ResumeContent,
  ResumeSection,
  SectionType,
  SkillGroup,
  SkillItem,
} from '../../types/resume';
import {createId} from '../../utils/resume/ids';

const VALID_TYPES: SectionType[] = [
  'personalInfo',
  'intro',
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'custom',
];

const asString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const asStringOrNull = (value: unknown): string | undefined => {
  const trimmed = asString(value);
  return trimmed ? trimmed : undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const asBool = (value: unknown): boolean => value === true;

const asContactList = (value: unknown): {id: string; value: string; label?: string}[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: {id: string; value: string; label?: string}[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const v = item.trim();
      if (v) {
        result.push({id: createId('contact'), value: v});
      }
    } else if (item && typeof item === 'object') {
      const c = item as Record<string, unknown>;
      const val = asString(c.value);
      if (val) {
        const label = asString(c.label);
        result.push({id: createId('contact'), value: val, ...(label ? {label} : {})});
      }
    }
  }
  return result;
};

/**
 * Parse + validate a raw AI extraction response into a canonical ResumeContent.
 * - Regenerates all IDs (never trusts AI-provided IDs / foreign keys).
 * - Drops unknown section types instead of corrupting the structure.
 * - Leaves uncertain fields empty/null (no fabrication).
 * - Maps project→experience references via 0-based experience indices only.
 */
export const parseExtractionResponse = (raw: string): ResumeContent => {
  if (typeof raw !== 'string') {
    throw new Error('Invalid AI response format.');
  }

  const trimmed = raw.trim();
  const cleaned = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('We could not safely process the AI response. Please try again.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('The AI response was incomplete. Please try again.');
  }

  const root = parsed as Record<string, unknown>;
  const rawSections = Array.isArray(root.sections) ? root.sections : [];

  if (rawSections.length === 0 && !asString(root.unmapped)) {
    throw new Error('The AI did not return any structured resume content.');
  }

  // Pre-pass: build an ordered list of generated experience IDs for association mapping.
  const experienceIdOrder: string[] = [];
  for (const rawSection of rawSections) {
    if (!rawSection || typeof rawSection !== 'object') {
      continue; // skip invalid
    }
    const section = rawSection as Record<string, unknown>;
    if (section.type === 'experience' && Array.isArray(section.entries)) {
      for (const entry of section.entries) {
        if (entry && typeof entry === 'object') {
          experienceIdOrder.push(createId('exp'));
        }
      }
    }
  }

  let experienceCursor = 0;
  const sections: ResumeSection[] = [];

  rawSections.forEach((rawSection, index) => {
    if (!rawSection || typeof rawSection !== 'object') {
      return; // skip invalid
    }
    const section = rawSection as Record<string, unknown>;
    const type = section.type as SectionType;
    if (!VALID_TYPES.includes(type)) {
      return; // drop unknown section types safely
    }

    const id = createId(type);
    const common = {id, type, visible: true, order: index};

    if (type === 'personalInfo') {
      const data = (section.data ?? {}) as Record<string, unknown>;
      const personalInfo: PersonalInfoData = {
        fullName: asStringOrNull(data.fullName),
        photoUri: asStringOrNull(data.photoUri),
        emails: asContactList(data.emails),
        phoneNumbers: asContactList(data.phoneNumbers),
        addresses: asContactList(data.addresses),
        links: asContactList(data.links),
      };
      sections.push({...common, type, data: personalInfo} as ResumeSection);
      return;
    }

    if (type === 'intro') {
      const data = (section.data ?? {}) as Record<string, unknown>;
      sections.push({
        ...common,
        type,
        data: {
          headline: asStringOrNull(data.headline),
          summary: asStringOrNull(data.summary),
        },
      } as ResumeSection);
      return;
    }

    if (type === 'experience') {
      const entriesRaw = Array.isArray(section.entries) ? section.entries : [];
      const entries: ExperienceEntry[] = entriesRaw
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map(entry => {
          const idForEntry = experienceIdOrder[experienceCursor] ?? createId('exp');
          experienceCursor += 1;
          return {
            id: idForEntry,
            company: asStringOrNull(entry.company),
            role: asStringOrNull(entry.role),
            employmentType: asStringOrNull(entry.employmentType),
            location: asStringOrNull(entry.location),
            startDate: asStringOrNull(entry.startDate),
            endDate: asStringOrNull(entry.endDate),
            isCurrent: asBool(entry.isCurrent),
            summary: asStringOrNull(entry.summary),
            responsibilities: asStringArray(entry.responsibilities),
            achievements: asStringArray(entry.achievements),
            technologies: asStringArray(entry.technologies),
            links: asContactList(entry.links),
            order: 0,
          } as ExperienceEntry;
        });
      sections.push({...common, type, entries} as ResumeSection);
      return;
    }

    if (type === 'projects') {
      const entriesRaw = Array.isArray(section.entries) ? section.entries : [];
      const entries: ProjectEntry[] = entriesRaw
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map((entry, i) => {
          const indices = Array.isArray(entry.associatedExperienceIndices)
            ? (entry.associatedExperienceIndices as unknown[])
                .map(n => Number(n))
                .filter(n => Number.isInteger(n) && n >= 0 && n < experienceIdOrder.length)
                .map(n => experienceIdOrder[n])
            : [];
          return {
            id: createId('proj'),
            name: asStringOrNull(entry.name),
            role: asStringOrNull(entry.role),
            description: asStringOrNull(entry.description),
            startDate: asStringOrNull(entry.startDate),
            endDate: asStringOrNull(entry.endDate),
            responsibilities: asStringArray(entry.responsibilities),
            achievements: asStringArray(entry.achievements),
            technologies: asStringArray(entry.technologies),
            url: asStringOrNull(entry.url),
            githubUrl: asStringOrNull(entry.githubUrl),
            demoUrl: asStringOrNull(entry.demoUrl),
            associatedExperienceIds: Array.from(new Set(indices)),
            order: i,
          } as ProjectEntry;
        });
      sections.push({...common, type, entries} as ResumeSection);
      return;
    }

    if (type === 'education') {
      const entriesRaw = Array.isArray(section.entries) ? section.entries : [];
      const entries: EducationEntry[] = entriesRaw
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map((entry, i) => ({
          id: createId('edu'),
          institution: asStringOrNull(entry.institution),
          degree: asStringOrNull(entry.degree),
          fieldOfStudy: asStringOrNull(entry.fieldOfStudy),
          location: asStringOrNull(entry.location),
          startDate: asStringOrNull(entry.startDate),
          endDate: asStringOrNull(entry.endDate),
          isCurrent: asBool(entry.isCurrent),
          description: asStringOrNull(entry.description),
          achievements: asStringArray(entry.achievements),
          gpa: asStringOrNull(entry.gpa),
          coursework: asStringArray(entry.coursework),
          activities: asStringArray(entry.activities),
          url: asStringOrNull(entry.url),
          order: i,
        } as EducationEntry));
      sections.push({...common, type, entries} as ResumeSection);
      return;
    }

    if (type === 'certifications') {
      const entriesRaw = Array.isArray(section.entries) ? section.entries : [];
      const entries: CertificationEntry[] = entriesRaw
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map((entry, i) => ({
          id: createId('cert'),
          name: asStringOrNull(entry.name),
          issuer: asStringOrNull(entry.issuer),
          issueDate: asStringOrNull(entry.issueDate),
          expirationDate: asStringOrNull(entry.expirationDate),
          credentialId: asStringOrNull(entry.credentialId),
          credentialUrl: asStringOrNull(entry.credentialUrl),
          description: asStringOrNull(entry.description),
          order: i,
        } as CertificationEntry));
      sections.push({...common, type, entries} as ResumeSection);
      return;
    }

    if (type === 'skills') {
      const data = (section.data ?? {}) as Record<string, unknown>;
      const uncategorized: SkillItem[] = asStringArray(data.uncategorized).map(name => ({
        id: createId('skill'),
        name,
      }));
      const rawGroups = Array.isArray(data.groups) ? data.groups : [];
      const groups: SkillGroup[] = rawGroups
        .filter((g): g is Record<string, unknown> => !!g && typeof g === 'object')
        .map(group => ({
          id: createId('skillgrp'),
          title: asString(group.title) || 'Skills',
          skills: asStringArray(group.skills).map(name => ({
            id: createId('skill'),
            name,
          })),
        }));
      sections.push({...common, type, groups, uncategorized} as ResumeSection);
      return;
    }

    if (type === 'custom') {
      const data = (section.data ?? {}) as Record<string, unknown>;
      const entriesRaw = Array.isArray(data.entries) ? data.entries : [];
      const entries: CustomEntry[] = entriesRaw
        .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
        .map(entry => ({
          id: createId('customentry'),
          title: asStringOrNull(entry.title),
          content: asStringOrNull(entry.content),
        }));
      sections.push({
        ...common,
        type,
        title: asString(section.title) || 'Custom Section',
        data: {
          content: asStringOrNull(data.content),
          entries,
        },
      } as ResumeSection);
      return;
    }
  });

  const unmapped = asString(root.unmapped) || undefined;

  return {sections, unmapped};
};
