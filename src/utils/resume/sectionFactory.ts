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
  SectionType,
  SkillGroup,
  SkillItem,
} from '../../types/resume';
import {createId} from './ids';

export const DEFAULT_SECTION_LABELS: Record<SectionType, string> = {
  personalInfo: 'Personal Information',
  intro: 'Introduction',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  custom: 'Custom Section',
};

const emptyPersonalInfo = (): PersonalInfoData => ({
  emails: [],
  phoneNumbers: [],
  addresses: [],
  links: [],
});

const emptyIntro = (): IntroData => ({});

export const createSection = (
  type: SectionType,
  order: number,
  overrides: Partial<ResumeSection> = {},
): ResumeSection => {
  const base = {
    id: createId(type),
    type,
    visible: true,
    order,
    ...overrides,
  };

  switch (type) {
    case 'personalInfo':
      return {...base, type, data: emptyPersonalInfo()} as ResumeSection;
    case 'intro':
      return {...base, type, data: emptyIntro()} as ResumeSection;
    case 'skills':
      return {
        ...base,
        type,
        groups: [],
        uncategorized: [],
      } as ResumeSection;
    case 'custom':
      return {
        ...base,
        type,
        title: overrides.title ?? DEFAULT_SECTION_LABELS.custom,
        data: {content: '', entries: []},
      } as ResumeSection;
    case 'experience':
    case 'projects':
    case 'education':
    case 'certifications':
      return {...base, type, entries: []} as ResumeSection;
    default:
      return {...base, type, data: {}} as ResumeSection;
  }
};

export const emptyContent = (): ResumeContent => ({sections: []});

/** Core sections every new (from-scratch) resume starts with. */
export const defaultSectionsForNewResume = (): ResumeSection[] => [
  createSection('personalInfo', 0),
  createSection('intro', 1),
];

export const nextOrder = (sections: ResumeSection[]): number =>
  sections.reduce((max, section) => Math.max(max, section.order), -1) + 1;

export const createExperienceEntry = (order: number): ExperienceEntry => ({
  id: createId('exp'),
  order,
  responsibilities: [],
  achievements: [],
  technologies: [],
  links: [],
});

export const createProjectEntry = (order: number): ProjectEntry => ({
  id: createId('proj'),
  order,
  responsibilities: [],
  achievements: [],
  technologies: [],
  links: [],
});

export const createEducationEntry = (order: number): EducationEntry => ({
  id: createId('edu'),
  order,
  achievements: [],
  coursework: [],
  activities: [],
  links: [],
});

export const createCertificationEntry = (order: number): CertificationEntry => ({
  id: createId('cert'),
  order,
});

export const createSkillItem = (name: string): SkillItem => ({
  id: createId('skill'),
  name: name.trim(),
});

export const createSkillGroup = (title: string): SkillGroup => ({
  id: createId('skillgrp'),
  title: title.trim() || 'Untitled Group',
  skills: [],
});

export const createContactValue = (value = '', label?: string) => ({
  id: createId('contact'),
  value,
  label,
});

export const createCustomSectionData = (): CustomSectionData => ({
  content: '',
  entries: [],
});

export const createCustomEntry = (): {id: string; title?: string; content?: string} => ({
  id: createId('customentry'),
  title: '',
  content: '',
});
