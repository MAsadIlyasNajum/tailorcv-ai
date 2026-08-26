export interface GeminiResponseContract {
  matchScore: number;
  missingKeywords: string[];
  matchingKeywords: string[];
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
