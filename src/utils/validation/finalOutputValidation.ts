import type {FinalResumeOutput} from '../../types/resume';

const MAX_SUMMARY_CHARS = 1200;
const MAX_ITEM_CHARS = 240;

export interface FinalResumeOutputValidationResult {
  valid: boolean;
  message?: string;
}

const isBoundedText = (value: string, maxLength: number): boolean => {
  const trimmed = value.trim();
  return Boolean(trimmed) && trimmed.length <= maxLength;
};

export const validateFinalResumeOutput = (
  payload: FinalResumeOutput,
): FinalResumeOutputValidationResult => {
  if (!isBoundedText(payload.refinedSummary, MAX_SUMMARY_CHARS)) {
    return {
      valid: false,
      message: 'The final refined summary was invalid. Please generate it again.',
    };
  }

  if (!payload.prioritizedKeywords.length) {
    return {
      valid: false,
      message: 'The final output did not include prioritized keywords.',
    };
  }

  if (!payload.polishedExperienceSections.length) {
    return {
      valid: false,
      message: 'The final output did not include polished experience sections.',
    };
  }

  const hasInvalidSection = payload.polishedExperienceSections.some(section => {
    if (!isBoundedText(section.heading, MAX_ITEM_CHARS)) {
      return true;
    }

    if (!isBoundedText(section.polishedSummary, MAX_SUMMARY_CHARS)) {
      return true;
    }

    if (!section.polishedBullets.length) {
      return true;
    }

    return section.polishedBullets.some(
      bullet => !isBoundedText(bullet, MAX_ITEM_CHARS),
    );
  });

  if (hasInvalidSection) {
    return {
      valid: false,
      message: 'The final output sections were incomplete or too long.',
    };
  }

  return {valid: true};
};
