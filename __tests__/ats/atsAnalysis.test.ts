import {calculateAtsAnalysis} from '../../src/services/ats/atsAnalysis';
import type {ResumeContent, AnalysisResult} from '../../src/types/resume';

describe('calculateAtsAnalysis', () => {
  const sampleContent: ResumeContent = {
    sections: [
      {
        id: 'pi',
        type: 'personalInfo',
        visible: true,
        order: 0,
        data: {
          fullName: 'John Doe',
          emails: [{id: 'e1', value: 'john@example.com'}],
          phoneNumbers: [],
          addresses: [],
          links: [],
        },
      },
      {
        id: 'exp',
        type: 'experience',
        visible: true,
        order: 1,
        entries: [
          {
            id: 'e1',
            role: 'Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: null,
            isCurrent: true,
            summary: 'Worked with React',
            achievements: [],
            responsibilities: [],
            technologies: ['React'],
            order: 0,
          },
        ],
      },
      {
        id: 'skills',
        type: 'skills',
        visible: true,
        order: 2,
        groups: [],
        uncategorized: [{id: 's1', name: 'React'}],
      },
    ],
  };

  const sampleAnalysis: AnalysisResult = {
    id: 'a1',
    resumeId: 'r1',
    jobApplicationId: 'ja1',
    jobDescription: 'Looking for React developer',
    matchScore: 80,
    matchingKeywords: [{term: 'react', importance: 'required'}],
    missingKeywords: [{term: 'typescript', importance: 'important'}],
    suggestedSummary: 'React developer',
    suggestedSkills: ['React'],
    experienceImprovements: [],
    atsTips: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('calculates complete ATS analysis', () => {
    const result = calculateAtsAnalysis(sampleContent, sampleAnalysis);

    expect(result.scoreBreakdown).toBeDefined();
    expect(result.scoreBreakdown.overall).toBeGreaterThanOrEqual(0);
    expect(result.scoreBreakdown.overall).toBeLessThanOrEqual(100);
    expect(result.keywordGaps).toBeDefined();
    expect(result.keywordGaps.length).toBeGreaterThan(0);
    expect(result.optimizationSuggestions).toBeDefined();
  });

  it('does not mutate input content', () => {
    const contentBefore = JSON.stringify(sampleContent);
    calculateAtsAnalysis(sampleContent, sampleAnalysis);
    expect(JSON.stringify(sampleContent)).toBe(contentBefore);
  });

  it('does not mutate input analysis', () => {
    const analysisBefore = JSON.stringify(sampleAnalysis);
    calculateAtsAnalysis(sampleContent, sampleAnalysis);
    expect(JSON.stringify(sampleAnalysis)).toBe(analysisBefore);
  });
});
