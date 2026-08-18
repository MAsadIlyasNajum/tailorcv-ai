import {validateFinalResumeOutput} from '../src/utils/validation/finalOutputValidation';

describe('finalOutputValidation', () => {
  it('accepts valid final output payload', () => {
    const validation = validateFinalResumeOutput({
      id: 'final-1',
      analysisId: 'analysis-1',
      refinedSummary: 'Experienced mobile engineer focused on measurable delivery.',
      prioritizedKeywords: ['React Native', 'TypeScript'],
      polishedExperienceSections: [
        {
          heading: 'Senior Mobile Engineer - Example Co',
          polishedSummary: 'Led production mobile initiatives with quality guardrails.',
          polishedBullets: ['Improved release confidence with automated test coverage.'],
        },
      ],
      finalRecommendations: ['Tailor each bullet to role requirements.'],
      cautions: ['Avoid adding unsupported metrics.'],
      createdAt: Date.now(),
    });

    expect(validation.valid).toBe(true);
  });

  it('rejects payload with missing keywords', () => {
    const validation = validateFinalResumeOutput({
      id: 'final-2',
      analysisId: 'analysis-2',
      refinedSummary: 'Refined summary',
      prioritizedKeywords: [],
      polishedExperienceSections: [
        {
          heading: 'Role',
          polishedSummary: 'Summary',
          polishedBullets: ['Bullet'],
        },
      ],
      finalRecommendations: [],
      cautions: [],
      createdAt: Date.now(),
    });

    expect(validation.valid).toBe(false);
    expect(validation.message).toBe(
      'The final output did not include prioritized keywords.',
    );
  });
});
