import {calculateWeightedKeywordCoverage} from '../src/utils/validation/keywordCoverage';
import type {KeywordWithImportance} from '../src/types/resume';

describe('calculateWeightedKeywordCoverage', () => {
  it('returns 0 for empty keyword arrays', () => {
    expect(calculateWeightedKeywordCoverage([], [])).toBe(0);
  });

  it('returns 100 when all keywords match', () => {
    const matching: KeywordWithImportance[] = [
      {term: 'react', importance: 'required'},
      {term: 'typescript', importance: 'important'},
    ];
    expect(calculateWeightedKeywordCoverage(matching, [])).toBe(100);
  });

  it('returns 0 when no keywords match', () => {
    const missing: KeywordWithImportance[] = [
      {term: 'react', importance: 'required'},
      {term: 'typescript', importance: 'important'},
    ];
    expect(calculateWeightedKeywordCoverage([], missing)).toBe(0);
  });

  it('weights required keywords higher than nice-to-have', () => {
    const matching: KeywordWithImportance[] = [
      {term: 'react', importance: 'required'},
    ];
    const missing: KeywordWithImportance[] = [
      {term: 'graphql', importance: 'nice-to-have'},
    ];
    // matched weight = 3, total weight = 3 + 1 = 4, coverage = 75%
    expect(calculateWeightedKeywordCoverage(matching, missing)).toBe(75);
  });

  it('weights important keywords correctly', () => {
    const matching: KeywordWithImportance[] = [
      {term: 'react', importance: 'important'},
    ];
    const missing: KeywordWithImportance[] = [
      {term: 'graphql', importance: 'important'},
    ];
    // matched weight = 2, total weight = 2 + 2 = 4, coverage = 50%
    expect(calculateWeightedKeywordCoverage(matching, missing)).toBe(50);
  });

  it('handles mixed importance levels', () => {
    const matching: KeywordWithImportance[] = [
      {term: 'react', importance: 'required'},
      {term: 'typescript', importance: 'important'},
    ];
    const missing: KeywordWithImportance[] = [
      {term: 'graphql', importance: 'nice-to-have'},
      {term: 'aws', importance: 'required'},
    ];
    // matched weight = 3 + 2 = 5, total weight = 5 + 1 + 3 = 9, coverage = 56%
    expect(calculateWeightedKeywordCoverage(matching, missing)).toBe(56);
  });

  it('defaults to important weight for unknown importance', () => {
    const matching: KeywordWithImportance[] = [
      {term: 'react', importance: 'important'},
    ];
    const missing: KeywordWithImportance[] = [
      {term: 'graphql', importance: 'important'},
    ];
    expect(calculateWeightedKeywordCoverage(matching, missing)).toBe(50);
  });
});
