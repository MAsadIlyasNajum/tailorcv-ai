export type KeywordImportance = 'required' | 'important' | 'nice-to-have';

export interface KeywordWithImportance {
  term: string;
  importance: KeywordImportance;
}

export interface ExperienceImprovement {
  original: string;
  improved: string;
}

export interface ExperienceOptimizationSuggestion {
  jobTitle: string;
  company: string;
  improvedSummary: string;
  suggestedBullets: string[];
  keywords: string[];
  impactNotes: string[];
}

export interface ProfessionalExperience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrentRole?: boolean;
  summary: string;
  bulletPoints: string[];
  keywords: string[];
  generatedSuggestions: string[];
}

export interface Resume {
  id: string;
  name: string;
  sourceType: 'pdf' | 'text';
  text: string;
  metadata?: {
    uri?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    extension?: string;
  };
  professionalExperiences: ProfessionalExperience[];
  /** Canonical structured resume representation (source of truth for editor/preview/ATS). */
  content?: ResumeContent;
  /** Last AI-proposed structure. Never auto-applied; user accepts field-by-field. */
  aiSuggestions?: ResumeContent;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
}

/**
 * Ordered discriminated-union section model. Every section is optional and orderable.
 * Adding future section types (languages, awards, publications, volunteer, courses,
 * training, organizations, interests, references, ...) is a one-line union extension;
 * anything we do not yet model explicitly is stored as `custom`.
 */
export type SectionType =
  | 'personalInfo'
  | 'intro'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'custom';

export type SingletonSectionType = 'personalInfo' | 'intro';
export type RepeatableSectionType =
  | 'experience'
  | 'projects'
  | 'education'
  | 'certifications'
  | 'custom';

export interface ContactValue {
  id: string;
  value: string;
  label?: string;
}

export interface AddressValue {
  id: string;
  value: string;
  label?: string;
}

export interface LinkValue {
  id: string;
  value: string;
  label?: string;
}

export interface PersonalInfoData {
  fullName?: string;
  /** Optional local photo uri only. Never a remote/cloud url. */
  photoUri?: string;
  emails: ContactValue[];
  phoneNumbers: ContactValue[];
  addresses: AddressValue[];
  links: LinkValue[];
}

export interface IntroData {
  headline?: string;
  summary?: string;
}

export interface ExperienceEntry {
  id: string;
  company?: string;
  role?: string;
  employmentType?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  summary?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  links?: LinkValue[];
  order: number;
}

export interface ProjectEntry {
  id: string;
  name?: string;
  description?: string;
  role?: string;
  startDate?: string;
  endDate?: string | null;
  /** Many-to-many: a project may be associated with zero, one, or many experiences. */
  associatedExperienceIds?: string[];
  technologies?: string[];
  responsibilities?: string[];
  achievements?: string[];
  url?: string;
  githubUrl?: string;
  demoUrl?: string;
  links?: LinkValue[];
  order: number;
}

export interface EducationEntry {
  id: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
  gpa?: string;
  coursework?: string[];
  activities?: string[];
  url?: string;
  links?: LinkValue[];
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  skills: SkillItem[];
}

export interface CertificationEntry {
  id: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  expirationDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  order: number;
}

export interface CustomEntry {
  id: string;
  title?: string;
  content?: string;
}

export interface CustomSectionData {
  content?: string;
  entries?: CustomEntry[];
}

export interface BaseSection {
  id: string;
  type: SectionType;
  visible: boolean;
  /** Overrides the default section label; required for `custom`. */
  title?: string;
  order: number;
}

export type ResumeSection =
  | (BaseSection & { type: 'personalInfo'; data: PersonalInfoData })
  | (BaseSection & { type: 'intro'; data: IntroData })
  | (BaseSection & { type: 'experience'; entries: ExperienceEntry[] })
  | (BaseSection & { type: 'projects'; entries: ProjectEntry[] })
  | (BaseSection & { type: 'education'; entries: EducationEntry[] })
  | (BaseSection & { type: 'skills'; groups: SkillGroup[]; uncategorized: SkillItem[] })
  | (BaseSection & { type: 'certifications'; entries: CertificationEntry[] })
  | (BaseSection & { type: 'custom'; data: CustomSectionData });

export type ResumeEntry =
  | ExperienceEntry
  | ProjectEntry
  | EducationEntry
  | CertificationEntry;

export interface ResumeContent {
  sections: ResumeSection[];
  /** Raw/unrecognized content that could not be confidently mapped. Preserved, never fabricated. */
  unmapped?: string;
}

export interface JobApplication {
  id: string;
  resumeId: string;
  jobDescription: string;
  companyName?: string;
  jobTitle?: string;
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

export interface UserEditedSuggestions {
  suggestedSummary?: string;
  suggestedSkills?: string[];
  experienceImprovements?: ExperienceImprovement[];
  atsTips?: string[];
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobApplicationId: string;
  jobDescription: string;
  companyName?: string;
  jobTitle?: string;
  matchScore: number;
  matchingKeywords: KeywordWithImportance[];
  missingKeywords: KeywordWithImportance[];
  suggestedSummary: string;
  suggestedSkills: string[];
  experienceImprovements: ExperienceImprovement[];
  atsTips: string[];
  userEditedSuggestions?: UserEditedSuggestions;
  createdAt: number;
  updatedAt: number;
}

export interface FinalResumeOutputSection {
  heading: string;
  polishedSummary: string;
  polishedBullets: string[];
}

export interface FinalResumeOutput {
  id: string;
  analysisId: string;
  refinedSummary: string;
  prioritizedKeywords: string[];
  polishedExperienceSections: FinalResumeOutputSection[];
  finalRecommendations: string[];
  cautions: string[];
  createdAt: number;
}

export interface ResumeMetadata {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  extension: string;
  selectedAt: string;
}

export interface ResumeStateSnapshot {
  resumeText: string;
  jobDescription: string;
  analysisResult: AnalysisResult | null;
  finalResumeOutput: FinalResumeOutput | null;
  resumeMetadata: ResumeMetadata | null;
  professionalExperiences: ProfessionalExperience[];
  usefulnessFeedback: 'yes' | 'no' | null;
}
