import type {KeywordImportance, KeywordWithImportance} from '../../types/resume';

const IMPORTANCE_WEIGHTS: Record<KeywordImportance, number> = {
  required: 3,
  important: 2,
  'nice-to-have': 1,
};

export const calculateWeightedKeywordCoverage = (
  matching: KeywordWithImportance[],
  missing: KeywordWithImportance[],
): number => {
  const allKeywords = [...matching, ...missing];

  if (allKeywords.length === 0) {
    return 0;
  }

  const matchedWeight = matching.reduce(
    (sum, k) => sum + (IMPORTANCE_WEIGHTS[k.importance] ?? 2),
    0,
  );

  const totalWeight = allKeywords.reduce(
    (sum, k) => sum + (IMPORTANCE_WEIGHTS[k.importance] ?? 2),
    0,
  );

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((matchedWeight / totalWeight) * 100);
};

export const getKeywordImportanceLabel = (importance: KeywordImportance): string => {
  switch (importance) {
    case 'required':
      return 'Required';
    case 'important':
      return 'Important';
    case 'nice-to-have':
      return 'Nice to have';
    default:
      return 'Important';
  }
};
