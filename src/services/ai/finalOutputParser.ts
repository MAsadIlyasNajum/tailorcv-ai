import type {FinalResumeOutput} from '../../types/resume';
import type {FinalOutputResponseContract} from './types';

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueValues = new Set<string>();

  value
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => uniqueValues.add(item));

  return Array.from(uniqueValues);
};

const normalizeSections = (
  value: unknown,
): FinalOutputResponseContract['polishedExperienceSections'] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const candidate = item as Record<string, unknown>;
      const heading =
        typeof candidate.heading === 'string' ? candidate.heading.trim() : '';
      const polishedSummary =
        typeof candidate.polishedSummary === 'string'
          ? candidate.polishedSummary.trim()
          : '';

      return {
        heading,
        polishedSummary,
        polishedBullets: normalizeStringArray(candidate.polishedBullets),
      };
    })
    .filter(
      section =>
        section.heading &&
        section.polishedSummary &&
        section.polishedBullets.length > 0,
    );
};

export const parseFinalOutputResponse = (
  raw: unknown,
): FinalOutputResponseContract => {
  if (typeof raw !== 'string') {
    throw new Error('Invalid AI response format.');
  }

  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('We could not safely process the final output response. Please try again.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The final output response was incomplete. Please try again.');
  }

  const candidate = parsed as Record<string, unknown>;
  const refinedSummary =
    typeof candidate.refinedSummary === 'string'
      ? candidate.refinedSummary.trim()
      : '';

  if (!refinedSummary) {
    throw new Error('The final output response did not include a valid refined summary.');
  }

  const polishedExperienceSections = normalizeSections(
    candidate.polishedExperienceSections,
  );

  return {
    refinedSummary,
    prioritizedKeywords: normalizeStringArray(candidate.prioritizedKeywords),
    polishedExperienceSections,
    finalRecommendations: normalizeStringArray(candidate.finalRecommendations),
    cautions: normalizeStringArray(candidate.cautions),
  };
};

export const createFinalResumeOutput = (
  payload: FinalOutputResponseContract,
  analysisId: string,
): FinalResumeOutput => {
  const finalOutputId = `${Date.now()}-${Math.random().toString(16).slice(2)}-final`;

  return {
    id: finalOutputId,
    analysisId,
    refinedSummary: payload.refinedSummary,
    prioritizedKeywords: payload.prioritizedKeywords.slice(0, 20),
    polishedExperienceSections: payload.polishedExperienceSections
      .slice(0, 6)
      .map(section => ({
        heading: section.heading,
        polishedSummary: section.polishedSummary,
        polishedBullets: section.polishedBullets.slice(0, 5),
      })),
    finalRecommendations: payload.finalRecommendations.slice(0, 12),
    cautions: payload.cautions.slice(0, 8),
    createdAt: Date.now(),
  };
};
