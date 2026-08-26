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

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobTitle?: string;
  company?: string;
  jobDescription: string;
  matchScore: number;
  missingKeywords: string[];
  suggestedSummary: string;
  suggestedSkills: string[];
  experienceImprovements: ExperienceImprovement[];
  atsTips: string[];
  createdAt: number;
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
