import {
  createAnalysisResult,
  parseAnalysisResponse,
} from '../src/services/ai/analysisParser';

describe('analysisParser', () => {
  it('parses a valid JSON payload and normalizes fields', () => {
    const parsed = parseAnalysisResponse(`\n\`\`\`json\n{\n  "matchScore": 87.4,\n  "matchingKeywords": ["React Native", "TypeScript"],\n  "missingKeywords": ["TypeScript", "  React Native  "],\n  "suggestedSummary": "  Product-focused mobile engineer. ",\n  "suggestedSkills": ["Zustand", "Testing"],\n  "experienceImprovements": [\n    {"original": "Built app", "improved": "Built a React Native app used by 10k users"}\n  ],\n  "atsTips": ["Use standard section headings"]\n}\n\`\`\``);

    expect(parsed).toMatchObject({
      matchScore: 87,
      matchingKeywords: ['React Native', 'TypeScript'],
      missingKeywords: ['TypeScript', 'React Native'],
      suggestedSummary: 'Product-focused mobile engineer.',
      suggestedSkills: ['Zustand', 'Testing'],
      experienceImprovements: [
        {
          original: 'Built app',
          improved: 'Built a React Native app used by 10k users',
        },
      ],
      atsTips: ['Use standard section headings'],
    });
  });

  it('throws for invalid score values', () => {
    expect(() =>
      parseAnalysisResponse(
        JSON.stringify({
          matchScore: 130,
          matchingKeywords: [],
          missingKeywords: [],
          suggestedSummary: 'Summary',
          suggestedSkills: [],
          experienceImprovements: [],
          atsTips: [],
        }),
      ),
    ).toThrow('The AI returned an invalid ATS score.');
  });

  it('builds an AnalysisResult with sane caps', () => {
    const result = createAnalysisResult(
      {
        matchScore: 99,
        matchingKeywords: new Array(30).fill('keyword'),
        missingKeywords: new Array(30).fill('keyword'),
        suggestedSummary: 'Strong summary',
        suggestedSkills: new Array(30).fill('skill'),
        experienceImprovements: new Array(8).fill({
          original: 'Old',
          improved: 'New',
        }),
        atsTips: new Array(20).fill('tip'),
      },
      'resume text',
      'job description',
    );

    expect(result.matchScore).toBe(99);
    expect(result.matchingKeywords).toHaveLength(25);
    expect(result.missingKeywords).toHaveLength(25);
    expect(result.suggestedSkills).toHaveLength(25);
    expect(result.experienceImprovements).toHaveLength(5);
    expect(result.atsTips).toHaveLength(10);
    expect(result.jobDescription).toBe('job description');
  });
});
