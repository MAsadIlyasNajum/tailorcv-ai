import {
  validateJobDescription,
} from '../src/utils/validation/jobDescriptionValidation';

describe('validateJobDescription', () => {
  it('rejects empty and whitespace values', () => {
    expect(validateJobDescription('')).toMatchObject({valid: false});
    expect(validateJobDescription('   ')).toMatchObject({valid: false});
  });

  it('rejects short job descriptions', () => {
    expect(validateJobDescription('React developer')).toMatchObject({
      valid: false,
    });
  });

  it('accepts realistic job descriptions with enough detail', () => {
    expect(
      validateJobDescription(
        'We are looking for a Senior React Native engineer with experience building mobile apps, working with TypeScript, Zustand, REST APIs, and collaborating across product teams to deliver high-quality user experiences.',
      ),
    ).toMatchObject({valid: true});
  });
});
