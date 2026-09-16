import {
  calculateKeywordScore,
  calculateSkillsScore,
  calculateExperienceScore,
  calculateEducationScore,
  calculateFormattingScore,
  calculateAtsScoreBreakdown,
  getScoreColor,
  getScoreLabel,
} from '../../src/services/ats/atsScorer';
import type {ResumeContent, KeywordWithImportance} from '../../src/types/resume';

describe('atsScorer', () => {
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
        id: 'intro',
        type: 'intro',
        visible: true,
        order: 1,
        data: {
          headline: 'Software Engineer',
          summary: 'Experienced developer with React and Node.js',
        },
      },
      {
        id: 'exp',
        type: 'experience',
        visible: true,
        order: 2,
        entries: [
          {
            id: 'e1',
            role: 'Senior Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: null,
            isCurrent: true,
            summary: 'Led development of React applications',
            achievements: ['Increased performance by 40%'],
            responsibilities: ['Developed features'],
            technologies: ['React', 'Node.js'],
            order: 0,
          },
        ],
      },
      {
        id: 'skills',
        type: 'skills',
        visible: true,
        order: 3,
        groups: [
          {
            id: 'g1',
            title: 'Programming',
            skills: [{id: 's1', name: 'JavaScript'}, {id: 's2', name: 'TypeScript'}],
          },
        ],
        uncategorized: [{id: 's3', name: 'React'}],
      },
      {
        id: 'edu',
        type: 'education',
        visible: true,
        order: 4,
        entries: [
          {
            id: 'ed1',
            degree: 'BS Computer Science',
            institution: 'MIT',
            startDate: '2016-09',
            endDate: '2020-05',
            isCurrent: false,
            achievements: [],
            order: 0,
          },
        ],
      },
    ],
  };

  const jobDescription = 'We are looking for a Senior Software Engineer with React, Node.js, and TypeScript experience. BS Computer Science required.';

  describe('calculateKeywordScore', () => {
    it('returns 100 when no keywords', () => {
      expect(calculateKeywordScore([], [])).toBe(100);
    });

    it('calculates weighted score correctly', () => {
      const matching: KeywordWithImportance[] = [
        {term: 'react', importance: 'required'},
        {term: 'node.js', importance: 'important'},
      ];
      const missing: KeywordWithImportance[] = [
        {term: 'typescript', importance: 'required'},
      ];

      const score = calculateKeywordScore(matching, missing);
      expect(score).toBe(63);
    });

    it('returns 100 when all keywords match', () => {
      const matching: KeywordWithImportance[] = [
        {term: 'react', importance: 'required'},
        {term: 'node.js', importance: 'important'},
      ];

      expect(calculateKeywordScore(matching, [])).toBe(100);
    });

    it('returns 0 when no keywords match', () => {
      const missing: KeywordWithImportance[] = [
        {term: 'react', importance: 'required'},
        {term: 'node.js', importance: 'important'},
      ];

      expect(calculateKeywordScore([], missing)).toBe(0);
    });
  });

  describe('calculateSkillsScore', () => {
    it('returns 100 when no suggested skills', () => {
      expect(calculateSkillsScore(sampleContent, [])).toBe(100);
    });

    it('returns 0 when no skills section', () => {
      const content: ResumeContent = {sections: []};
      expect(calculateSkillsScore(content, ['React'])).toBe(0);
    });

    it('calculates skills match percentage', () => {
      const score = calculateSkillsScore(sampleContent, ['React', 'Angular']);
      expect(score).toBe(50);
    });

    it('is case insensitive', () => {
      const score = calculateSkillsScore(sampleContent, ['react', 'typescript']);
      expect(score).toBe(100);
    });
  });

  describe('calculateExperienceScore', () => {
    it('returns 0 when no experience section', () => {
      const content: ResumeContent = {sections: []};
      expect(calculateExperienceScore(content, jobDescription)).toBe(0);
    });

    it('returns score with bullets', () => {
      const score = calculateExperienceScore(sampleContent, jobDescription);
      expect(score).toBe(30);
    });

    it('returns 100 when all fields match', () => {
      const content: ResumeContent = {
        sections: [
          {
            id: 'exp',
            type: 'experience',
            visible: true,
            order: 0,
            entries: [
              {
                id: 'e1',
                role: 'Software Engineer',
                company: 'Tech Corp',
                startDate: '2020-01',
                endDate: null,
                isCurrent: true,
                summary: 'Worked on projects',
                achievements: ['Achievement'],
                responsibilities: ['Responsibility'],
                technologies: ['React'],
                order: 0,
              },
            ],
          },
        ],
      };
      const jd = 'Software Engineer at Tech Corp';
      const score = calculateExperienceScore(content, jd);
      expect(score).toBe(100);
    });

    it('returns lower score without matches', () => {
      const content: ResumeContent = {
        sections: [
          {
            id: 'exp',
            type: 'experience',
            visible: true,
            order: 0,
            entries: [
              {
                id: 'e1',
                role: 'Barista',
                company: 'Coffee Shop',
                startDate: '2020-01',
                endDate: null,
                isCurrent: true,
                summary: 'Made coffee',
                achievements: [],
                responsibilities: [],
                technologies: [],
                order: 0,
              },
            ],
          },
        ],
      };
      const score = calculateExperienceScore(content, jobDescription);
      expect(score).toBe(0);
    });
  });

  describe('calculateEducationScore', () => {
    it('returns 50 when no education section', () => {
      const content: ResumeContent = {sections: []};
      expect(calculateEducationScore(content, jobDescription)).toBe(50);
    });

    it('returns 100 when degree matches', () => {
      const score = calculateEducationScore(sampleContent, jobDescription);
      expect(score).toBe(100);
    });

    it('returns 70 when only institution exists', () => {
      const content: ResumeContent = {
        sections: [
          {
            id: 'edu',
            type: 'education',
            visible: true,
            order: 0,
            entries: [
              {
                id: 'ed1',
                institution: 'MIT',
                startDate: '2016-09',
                endDate: '2020-05',
                isCurrent: false,
                achievements: [],
                order: 0,
              },
            ],
          },
        ],
      };
      const score = calculateEducationScore(content, jobDescription);
      expect(score).toBe(70);
    });
  });

  describe('calculateFormattingScore', () => {
    it('returns 0 when no sections', () => {
      const content: ResumeContent = {sections: []};
      expect(calculateFormattingScore(content)).toBe(0);
    });

    it('calculates formatting score based on section presence', () => {
      const score = calculateFormattingScore(sampleContent);
      expect(score).toBe(100);
    });

    it('returns partial score with fewer sections', () => {
      const content: ResumeContent = {
        sections: [
          {
            id: 'pi',
            type: 'personalInfo',
            visible: true,
            order: 0,
            data: {
              fullName: 'John',
              emails: [],
              phoneNumbers: [],
              addresses: [],
              links: [],
            },
          },
        ],
      };
      const score = calculateFormattingScore(content);
      expect(score).toBe(25);
    });
  });

  describe('calculateAtsScoreBreakdown', () => {
    it('calculates complete breakdown', () => {
      const matching: KeywordWithImportance[] = [{term: 'react', importance: 'required'}];
      const missing: KeywordWithImportance[] = [{term: 'angular', importance: 'important'}];

      const breakdown = calculateAtsScoreBreakdown(
        sampleContent,
        matching,
        missing,
        ['React', 'Angular'],
        jobDescription,
      );

      expect(breakdown.overall).toBeGreaterThanOrEqual(0);
      expect(breakdown.overall).toBeLessThanOrEqual(100);
      expect(breakdown.keywords).toBe(60);
      expect(breakdown.skills).toBe(50);
      expect(breakdown.experience).toBeGreaterThanOrEqual(0);
      expect(breakdown.education).toBe(100);
      expect(breakdown.formatting).toBe(100);
    });

    it('clamps overall score to 0-100', () => {
      const breakdown = calculateAtsScoreBreakdown(
        sampleContent,
        [],
        [],
        [],
        jobDescription,
      );

      expect(breakdown.overall).toBeGreaterThanOrEqual(0);
      expect(breakdown.overall).toBeLessThanOrEqual(100);
    });
  });

  describe('getScoreColor', () => {
    it('returns green for excellent scores', () => {
      expect(getScoreColor(85)).toBe('#14B8A6');
    });

    it('returns blue for good scores', () => {
      expect(getScoreColor(70)).toBe('#2563EB');
    });

    it('returns amber for fair scores', () => {
      expect(getScoreColor(50)).toBe('#F59E0B');
    });

    it('returns red for poor scores', () => {
      expect(getScoreColor(30)).toBe('#DC2626');
    });
  });

  describe('getScoreLabel', () => {
    it('returns Excellent for 80+', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
    });

    it('returns Good for 60-79', () => {
      expect(getScoreLabel(70)).toBe('Good');
    });

    it('returns Fair for 40-59', () => {
      expect(getScoreLabel(50)).toBe('Fair');
    });

    it('returns Needs Work for <40', () => {
      expect(getScoreLabel(30)).toBe('Needs Work');
    });
  });
});
