import type {ResumeSection} from '../../types/resume';

const isNonEmptyString = (value?: string): boolean =>
  Boolean(value && value.trim().length > 0);

const hasItems = (value?: unknown[]): boolean => Boolean(value && value.length > 0);

/** Best-effort check used to surface "empty" UI hints. Not a hard validation. */
export const sectionHasContent = (section: ResumeSection): boolean => {
  switch (section.type) {
    case 'personalInfo':
      return (
        isNonEmptyString(section.data.fullName) ||
        isNonEmptyString(section.data.photoUri) ||
        hasItems(section.data.emails) ||
        hasItems(section.data.phoneNumbers) ||
        hasItems(section.data.addresses) ||
        hasItems(section.data.links)
      );
    case 'intro':
      return (
        isNonEmptyString(section.data.headline) ||
        isNonEmptyString(section.data.summary)
      );
    case 'experience':
    case 'projects':
    case 'education':
    case 'certifications':
      return section.entries.some(entry => {
        const anyEntry = entry as unknown as Record<string, unknown>;
        return Object.entries(anyEntry).some(([key, value]) => {
          if (key === 'id' || key === 'order') {
            return false;
          }
          if (typeof value === 'string') {
            return value.trim().length > 0;
          }
          return Array.isArray(value) && value.length > 0;
        });
      });
    case 'skills':
      return hasItems(section.uncategorized) || section.groups.some(g => g.skills.length > 0);
    case 'custom':
      return (
        isNonEmptyString(section.data.content) ||
        hasItems(section.data.entries)
      );
    default:
      return false;
  }
};
