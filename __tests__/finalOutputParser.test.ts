import {
  createFinalResumeOutput,
  parseFinalOutputResponse,
} from '../src/services/ai/finalOutputParser';

describe('finalOutputParser', () => {
  it('parses and normalizes a valid final output payload', () => {
    const parsed = parseFinalOutputResponse(`
\`\`\`json
{
  "refinedSummary": "  Product-minded mobile engineer. ",
  "prioritizedKeywords": [" React Native ", "TypeScript", "TypeScript"],
  "polishedExperienceSections": [
    {
      "heading": "Senior Engineer - Example Co",
      "polishedSummary": " Built mobile features for production users. ",
      "polishedBullets": ["Improved testing", "Improved testing", "Reduced crash risks"]
    }
  ],
  "finalRecommendations": ["Keep results measurable"],
  "cautions": ["Avoid unsupported claims"]
}
\`\`\`
`);

    expect(parsed.refinedSummary).toBe('Product-minded mobile engineer.');
    expect(parsed.prioritizedKeywords).toEqual(['React Native', 'TypeScript']);
    expect(parsed.polishedExperienceSections).toHaveLength(1);
    expect(parsed.polishedExperienceSections[0].polishedBullets).toEqual([
      'Improved testing',
      'Reduced crash risks',
    ]);
  });

  it('throws when refined summary is missing', () => {
    expect(() =>
      parseFinalOutputResponse(
        JSON.stringify({
          refinedSummary: '  ',
          prioritizedKeywords: ['React Native'],
          polishedExperienceSections: [],
          finalRecommendations: [],
          cautions: [],
        }),
      ),
    ).toThrow('The final output response did not include a valid refined summary.');
  });

  it('applies sane caps when creating final output', () => {
    const result = createFinalResumeOutput(
      {
        refinedSummary: 'Strong summary',
        prioritizedKeywords: new Array(40).fill('keyword'),
        polishedExperienceSections: new Array(10).fill({
          heading: 'Role',
          polishedSummary: 'Summary',
          polishedBullets: new Array(10).fill('bullet'),
        }),
        finalRecommendations: new Array(20).fill('recommendation'),
        cautions: new Array(12).fill('caution'),
      },
      'analysis-1',
    );

    expect(result.prioritizedKeywords).toHaveLength(20);
    expect(result.polishedExperienceSections).toHaveLength(6);
    expect(result.polishedExperienceSections[0].polishedBullets).toHaveLength(5);
    expect(result.finalRecommendations).toHaveLength(12);
    expect(result.cautions).toHaveLength(8);
  });
});
