import {
  analyzeKeywordGaps,
  suggestKeywordPlacements,
  calculateKeywordDensity,
  generateOptimizationSuggestions,
} from '../../src/services/ats/keywordOptimizer';
import type {ResumeContent, AnalysisResult} from '../../src/types/resume';

describe('keywordOptimizer', () => {
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
          summary: 'Experienced developer',
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
            role: 'Engineer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: null,
            isCurrent: true,
            summary: 'Worked on React applications',
            achievements: [],
            responsibilities: ['Developed features'],
            technologies: ['React'],
            order: 0,
          },
        ],
      },
      {
        id: 'skills',
        type: 'skills',
        visible: true,
        order: 3,
        groups: [],
        uncategorized: [{id: 's1', name: 'React'}, {id: 's2', name: 'Node.js'}],
      },
    ],
  };

  const sampleAnalysis: AnalysisResult = {
    id: 'a1',
    resumeId: 'r1',
    jobApplicationId: 'ja1',
    jobDescription: 'Looking for React and TypeScript developer',
    matchScore: 75,
    matchingKeywords: [{term: 'react', importance: 'required'}],
    missingKeywords: [
      {term: 'typescript', importance: 'required'},
      {term: 'agile', importance: 'important'},
    ],
    suggestedSummary: 'Senior developer with React expertise',
    suggestedSkills: ['React', 'TypeScript', 'Node.js'],
    experienceImprovements: [],
    atsTips: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  describe('analyzeKeywordGaps', () => {
    it('returns gaps for all keywords', () => {
      const gaps = analyzeKeywordGaps(sampleContent, sampleAnalysis.jobDescription, sampleAnalysis);

      expect(gaps).toHaveLength(3);
    });

    it('marks present keywords correctly', () => {
      const gaps = analyzeKeywordGaps(sampleContent, sampleAnalysis.jobDescription, sampleAnalysis);

      const reactGap = gaps.find(g => g.term === 'react');
      expect(reactGap?.present).toBe(true);
    });

    it('marks missing keywords correctly', () => {
      const gaps = analyzeKeywordGaps(sampleContent, sampleAnalysis.jobDescription, sampleAnalysis);

      const typescriptGap = gaps.find(g => g.term === 'typescript');
      expect(typescriptGap?.present).toBe(false);
    });

    it('suggests locations for missing keywords', () => {
      const gaps = analyzeKeywordGaps(sampleContent, sampleAnalysis.jobDescription, sampleAnalysis);

      const typescriptGap = gaps.find(g => g.term === 'typescript');
      expect(typescriptGap?.suggestedLocation).toBeDefined();
    });
  });

  describe('suggestKeywordPlacements', () => {
    it('returns empty array for present keywords', () => {
      const gap = {term: 'react', importance: 'required', present: true};
      const placements = suggestKeywordPlacements(gap, sampleContent);

      expect(placements).toEqual([]);
    });

    it('suggests relevant sections for missing keywords', () => {
      const gap = {term: 'typescript', importance: 'required', present: false};
      const placements = suggestKeywordPlacements(gap, sampleContent);

      expect(placements.length).toBeGreaterThan(0);
      expect(placements).toContain('skills');
    });

    it('only suggests existing sections', () => {
      const content: ResumeContent = {
        sections: [
          {
            id: 'skills',
            type: 'skills',
            visible: true,
            order: 0,
            groups: [],
            uncategorized: [],
          },
        ],
      };

      const gap = {term: 'agile', importance: 'important', present: false};
      const placements = suggestKeywordPlacements(gap, content);

      expect(placements).toContain('skills');
      expect(placements).not.toContain('experience');
    });
  });

  describe('calculateKeywordDensity', () => {
    it('returns density for each keyword', () => {
      const keywords = ['react', 'angular'];
      const density = calculateKeywordDensity(sampleContent, keywords);

      expect(density).toHaveLength(2);
    });

    it('counts keyword occurrences', () => {
      const keywords = ['react'];
      const density = calculateKeywordDensity(sampleContent, keywords);

      expect(density[0].count).toBeGreaterThanOrEqual(1);
      expect(density[0].density).toBeGreaterThanOrEqual(0);
    });

    it('returns zero density for missing keywords', () => {
      const keywords = ['angular'];
      const density = calculateKeywordDensity(sampleContent, keywords);

      expect(density[0].count).toBe(0);
      expect(density[0].density).toBe(0);
    });

    it('handles empty content', () => {
      const content: ResumeContent = {sections: []};
      const keywords = ['react'];
      const density = calculateKeywordDensity(content, keywords);

      expect(density[0].count).toBe(0);
      expect(density[0].density).toBe(0);
    });
  });

  describe('generateOptimizationSuggestions', () => {
    it('generates suggestions for missing keywords', () => {
      const suggestions = generateOptimizationSuggestions(sampleContent, sampleAnalysis);

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('marks high impact for required keywords', () => {
      const suggestions = generateOptimizationSuggestions(sampleContent, sampleAnalysis);

      const highImpact = suggestions.filter(s => s.impact === 'high');
      expect(highImpact.length).toBeGreaterThan(0);
    });

    it('suggests adding summary when missing', () => {
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

      const suggestions = generateOptimizationSuggestions(content, sampleAnalysis);
      const summarySuggestion = suggestions.find(s => s.id === 'add-summary');

      expect(summarySuggestion).toBeDefined();
      expect(summarySuggestion?.impact).toBe('high');
    });

    it('suggests adding bullets to experience without them', () => {
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
                role: 'Engineer',
                company: 'Tech Corp',
                startDate: '2020-01',
                endDate: null,
                isCurrent: true,
                summary: '',
                achievements: [],
                responsibilities: [],
                technologies: [],
                order: 0,
              },
            ],
          },
        ],
      };

      const suggestions = generateOptimizationSuggestions(content, sampleAnalysis);
      const bulletsSuggestion = suggestions.find(s => s.id === 'add-bullets-experience');

      expect(bulletsSuggestion).toBeDefined();
      expect(bulletsSuggestion?.impact).toBe('medium');
    });

    it('returns empty array when no suggestions needed', () => {
      const perfectAnalysis: AnalysisResult = {
        ...sampleAnalysis,
        missingKeywords: [],
        suggestedSummary: '',
      };

      const suggestions = generateOptimizationSuggestions(sampleContent, perfectAnalysis);

      expect(suggestions).toEqual([]);
    });
  });
});
