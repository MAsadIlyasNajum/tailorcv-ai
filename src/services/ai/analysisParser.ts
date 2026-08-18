import type {AnalysisResult, GeminiResponseContract} from './types';

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
};

const normalizeExperienceImprovements = (
  value: unknown,
): Array<{original: string; improved: string}> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const candidate = item as Record<string, unknown>;
      const original = typeof candidate.original === 'string' ? candidate.original.trim() : '';
      const improved = typeof candidate.improved === 'string' ? candidate.improved.trim() : '';

      return {
        original,
        improved,
      };
    })
    .filter(item => item.original && item.improved);
};

export const parseAnalysisResponse = (
  raw: unknown,
): GeminiResponseContract => {
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

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The AI response was incomplete. Please try again.');
  }

  const candidate = parsed as Record<string, unknown>;
  const matchScore = Number(candidate.matchScore);

  if (!Number.isFinite(matchScore) || matchScore < 0 || matchScore > 100) {
    throw new Error('The AI returned an invalid ATS score.');
  }

  const missingKeywords = normalizeStringArray(candidate.missingKeywords);
  const suggestedSkills = normalizeStringArray(candidate.suggestedSkills);
  const atsTips = normalizeStringArray(candidate.atsTips);
  const suggestedSummary =
    typeof candidate.suggestedSummary === 'string' && candidate.suggestedSummary.trim()
      ? candidate.suggestedSummary.trim()
      : '';

  if (!suggestedSummary) {
    throw new Error('The AI response did not include a valid summary.');
  }

  const experienceImprovements = normalizeExperienceImprovements(
    candidate.experienceImprovements,
  );

  return {
    matchScore: Math.round(matchScore),
    missingKeywords,
    suggestedSummary,
    suggestedSkills,
    experienceImprovements,
    atsTips,
  };
};

export const createAnalysisResult = (
  payload: GeminiResponseContract,
  resumeText: string,
  jobDescription: string,
): AnalysisResult => {
  const resumeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: `${resumeId}-analysis`,
    resumeId,
    jobDescription,
    jobTitle: undefined,
    company: undefined,
    matchScore: Math.max(0, Math.min(100, Math.round(payload.matchScore))),
    missingKeywords: payload.missingKeywords.slice(0, 25),
    suggestedSummary: payload.suggestedSummary.trim(),
    suggestedSkills: payload.suggestedSkills.slice(0, 25),
    experienceImprovements: payload.experienceImprovements.slice(0, 5),
    atsTips: payload.atsTips.slice(0, 10),
    createdAt: Date.now(),
  };
};
