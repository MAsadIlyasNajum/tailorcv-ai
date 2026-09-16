import type {AnalysisResult, ResumeContent, AtsScoreBreakdown, KeywordGap, OptimizationSuggestion} from '../../types/resume';
import {calculateAtsScoreBreakdown} from './atsScorer';
import {analyzeKeywordGaps, generateOptimizationSuggestions} from './keywordOptimizer';

export interface AtsAnalysisData {
  scoreBreakdown: AtsScoreBreakdown;
  keywordGaps: KeywordGap[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export const calculateAtsAnalysis = (
  content: ResumeContent,
  analysisResult: AnalysisResult,
): AtsAnalysisData => {
  const scoreBreakdown = calculateAtsScoreBreakdown(
    content,
    analysisResult.matchingKeywords,
    analysisResult.missingKeywords,
    analysisResult.suggestedSkills,
    analysisResult.jobDescription,
  );

  const keywordGaps = analyzeKeywordGaps(
    content,
    analysisResult.jobDescription,
    analysisResult,
  );

  const optimizationSuggestions = generateOptimizationSuggestions(
    content,
    analysisResult,
  );

  return {
    scoreBreakdown,
    keywordGaps,
    optimizationSuggestions,
  };
};
