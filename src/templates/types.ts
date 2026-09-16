import type {Resume, ResumeContent} from '../types/resume';

export {Resume, ResumeContent};

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  render: (content: ResumeContent, resume: Resume) => string;
}

export interface TemplateStyles {
  sectionHeader: string;
  entry: string;
  entryTitle: string;
  entryMeta: string;
  entryBody: string;
  bullet: string;
  skillsUncategorized: string;
  skillsGroupTitle: string;
  skillsGroupItems: string;
  customContent: string;
  customEntry: string;
  customEntryTitle: string;
  customEntryBody: string;
}
