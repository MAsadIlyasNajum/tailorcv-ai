import type {KeywordWithImportance} from '../../types/resume';

export interface GeminiResponseContract {
  matchScore: number;
  missingKeywords: Array<KeywordWithImportance | string>;
  matchingKeywords: Array<KeywordWithImportance | string>;
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
