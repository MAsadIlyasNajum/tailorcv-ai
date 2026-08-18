import {normalizeResumeText} from '../src/utils/text/normalizeResumeText';

describe('normalizeResumeText', () => {
  it('cleans PDF text and collapses repeated whitespace', () => {
    const input = `  JOHN   DOE  


Senior Software Engineer  
Page 1 of 2

Skills:   JavaScript   • React Native
`;

    expect(normalizeResumeText(input)).toBe(
      'JOHN DOE\nSenior Software Engineer\nSkills: JavaScript • React Native',
    );
  });
});
