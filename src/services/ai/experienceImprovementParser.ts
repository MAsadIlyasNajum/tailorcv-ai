export interface ParsedExperienceImprovement {
  jobTitle: string;
  company: string;
  improvedSummary: string;
  suggestedBullets: string[];
  keywords: string[];
  impactNotes: string[];
}

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean);
};

export const parseExperienceImprovementResponse = (
  raw: unknown,
): ParsedExperienceImprovement[] => {
  if (typeof raw !== 'string') {
    throw new Error('The AI response did not include valid experience improvements.');
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
    throw new Error('The AI response did not include valid experience improvements.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The AI response did not include valid experience improvements.');
  }

  const candidate = parsed as Record<string, unknown>;
  const experienceSummaries = Array.isArray(candidate.experienceSummaries)
    ? candidate.experienceSummaries
    : [];

  if (!experienceSummaries.length) {
    throw new Error('The AI response did not include valid experience improvements.');
  }

  return experienceSummaries
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const role = item as Record<string, unknown>;
      const jobTitle = typeof role.jobTitle === 'string' ? role.jobTitle.trim() : '';
      const company = typeof role.company === 'string' ? role.company.trim() : '';
      const improvedSummary =
        typeof role.improvedSummary === 'string' ? role.improvedSummary.trim() : '';
      const suggestedBullets = normalizeStringArray(role.suggestedBullets);
      const keywords = normalizeStringArray(role.keywords);
      const impactNotes = normalizeStringArray(role.impactNotes);

      if (!jobTitle || !company || !improvedSummary) {
        throw new Error('The AI response did not include valid experience improvements.');
      }

      return {
        jobTitle,
        company,
        improvedSummary,
        suggestedBullets,
        keywords,
        impactNotes,
      };
    });
};
