import {
  parseExperienceImprovementResponse,
} from '../src/services/ai/experienceImprovementParser';

describe('parseExperienceImprovementResponse', () => {
  it('parses a valid role-improvement payload and preserves grounded recommendations', () => {
    const parsed = parseExperienceImprovementResponse(
      [
        '```json',
        '{',
        '  "experienceSummaries": [',
        '    {',
        '      "jobTitle": "Senior Product Engineer",',
        '      "company": "Acme",',
        '      "improvedSummary": "Led mobile product delivery for a customer-facing platform serving enterprise teams.",',
        '      "suggestedBullets": [',
        '        "Delivered a React Native mobile platform used by enterprise customers across iOS and Android.",',
        '        "Improved release reliability by streamlining QA and deployment workflows."',
        '      ],',
        '      "keywords": ["React Native", "mobile platform", "delivery"],',
        '      "impactNotes": ["Stronger action verbs and measurable delivery language."]',
        '    }',
        '  ]',
        '}',
        '```',
      ].join('\n'),
    );

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      jobTitle: 'Senior Product Engineer',
      company: 'Acme',
      improvedSummary: 'Led mobile product delivery for a customer-facing platform serving enterprise teams.',
      suggestedBullets: [
        'Delivered a React Native mobile platform used by enterprise customers across iOS and Android.',
        'Improved release reliability by streamlining QA and deployment workflows.',
      ],
      keywords: ['React Native', 'mobile platform', 'delivery'],
    });
  });

  it('rejects malformed payloads that omit the experience summary block', () => {
    expect(() =>
      parseExperienceImprovementResponse(
        JSON.stringify({
          experienceSummaries: null,
        }),
      ),
    ).toThrow('The AI response did not include valid experience improvements.');
  });
});
