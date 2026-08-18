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
  experienceImprovements: Array<{
    original: string;
    improved: string;
  }>;
  atsTips: string[];
  createdAt: number;
}

export interface GeminiResponseContract {
  matchScore: number;
  missingKeywords: string[];
  suggestedSummary: string;
  suggestedSkills: string[];
  experienceImprovements: Array<{
    original: string;
    improved: string;
  }>;
  atsTips: string[];
}

export interface FinalOutputResponseContract {
  refinedSummary: string;
  prioritizedKeywords: string[];
  polishedExperienceSections: Array<{
    heading: string;
    polishedSummary: string;
    polishedBullets: string[];
  }>;
  finalRecommendations: string[];
  cautions: string[];
}
