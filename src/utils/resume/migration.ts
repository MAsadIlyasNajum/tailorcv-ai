import type {
  ExperienceEntry,
  Resume,
  ResumeContent,
  ResumeSection,
} from '../../types/resume';
import {createSection} from './sectionFactory';
import {createId} from './ids';

/**
 * Build a structured `ResumeContent` from a legacy resume. Non-destructive:
 * - `resume.text` is preserved on the resume and also reflected in `content.unmapped`.
 * - `professionalExperiences` are mapped 1:1 into an `experience` section.
 * - `personalInfo` and `intro` form the basic structure; repeatable sections are only
 *   created when actual data exists (so the editor does not open full of empty sections).
 * - Nothing is fabricated; missing fields stay empty/undefined.
 */
export const buildContentFromLegacy = (resume: Resume): ResumeContent => {
  const sections: ResumeSection[] = [];

  // Basic structure always exists.
  sections.push(createSection('personalInfo', 0));
  sections.push(createSection('intro', 1));

  if (resume.professionalExperiences?.length) {
    const entries = resume.professionalExperiences.map((experience, index) => ({
      id: experience.id,
      company: experience.company || undefined,
      role: experience.jobTitle || undefined,
      location: experience.location || undefined,
      startDate: experience.startDate || undefined,
      endDate: experience.endDate ?? null,
      isCurrent: experience.isCurrentRole ?? false,
      summary: experience.summary || undefined,
      responsibilities: [],
      achievements: experience.bulletPoints?.length
        ? experience.bulletPoints
        : [],
      technologies: experience.keywords?.length ? experience.keywords : [],
      links: [],
      order: index,
    }));
    sections.push({
      id: createId('experience'),
      type: 'experience',
      visible: true,
      order: 2,
      entries,
    } as ResumeSection);
  }

  return {
    sections,
    unmapped: resume.text?.trim() ? resume.text : undefined,
  };
};

/**
 * Make `project.associatedExperienceIds[]` the single canonical relationship.
 * Any legacy `experience.associatedProjectIds[]` (read defensively) is folded into the
 * project side and then removed. Idempotent: once folded, the legacy field is gone.
 */
export const normalizeAssociations = (content: ResumeContent): ResumeContent => {
  const projects = content.sections.find(s => s.type === 'projects');
  const experiences = content.sections.find(s => s.type === 'experience');
  if (!projects || projects.type !== 'projects' || !experiences || experiences.type !== 'experience') {
    return content;
  }

  const projectById = new Map(projects.entries.map(p => [p.id, p] as const));
  let changed = false;

  const newExperienceEntries = experiences.entries.map(exp => {
    const legacy = (exp as unknown as Record<string, unknown>)
      .associatedProjectIds as string[] | undefined;
    if (!legacy || legacy.length === 0) {
      return exp;
    }
    changed = true;
    for (const projectId of legacy) {
      const project = projectById.get(projectId);
      if (project && !(project.associatedExperienceIds ?? []).includes(exp.id)) {
        project.associatedExperienceIds = [...(project.associatedExperienceIds ?? []), exp.id];
      }
    }
    const stripped = {...(exp as unknown as Record<string, unknown>)};
    delete stripped.associatedProjectIds;
    return stripped as unknown as ExperienceEntry;
  });

  if (!changed) {
    return content;
  }

  return {
    ...content,
    sections: content.sections.map(section => {
      if (section.type === 'experience') {
        return {...section, entries: newExperienceEntries};
      }
      if (section.type === 'projects') {
        return {...section, entries: projects.entries};
      }
      return section;
    }),
  };
};

/** Migrate a resume in place only if it lacks structured content. */
export const migrateResumeIfNeeded = (resume: Resume): Resume => {
  if (resume.content && Array.isArray(resume.content.sections)) {
    return resume;
  }
  return {
    ...resume,
    content: buildContentFromLegacy(resume),
  };
};
