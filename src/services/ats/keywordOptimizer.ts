import type {ResumeContent, SectionType, AnalysisResult, KeywordGap, OptimizationSuggestion} from '../../types/resume';

const LOCATION_PRIORITY: Record<string, SectionType[]> = {
  technical: ['skills', 'experience', 'projects'],
  soft: ['experience', 'intro', 'skills'],
  certification: ['certifications', 'education', 'skills'],
  education: ['education', 'certifications'],
  experience: ['experience', 'intro'],
};

const guessKeywordCategory = (term: string): string => {
  const lower = term.toLowerCase();
  const technicalPatterns = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'sql', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'api',
    'html', 'css', 'graphql', 'rest', 'mongodb', 'postgresql', 'redis',
    'ci/cd', 'agile', 'scrum', 'figma', 'sketch',
  ];

  const certificationPatterns = [
    'certified', 'certificate', 'pmp', 'aws certified', 'azure certified',
    'cissp', 'cisa', 'itil', 'six sigma',
  ];

  const educationPatterns = [
    'bachelor', 'master', 'phd', 'mba', 'degree', 'bs ', 'ms ', 'ba ', 'ma ',
  ];

  if (technicalPatterns.some(p => lower.includes(p))) {
    return 'technical';
  }
  if (certificationPatterns.some(p => lower.includes(p))) {
    return 'certification';
  }
  if (educationPatterns.some(p => lower.includes(p))) {
    return 'education';
  }

  return 'soft';
};

export const analyzeKeywordGaps = (
  content: ResumeContent,
  _jobDescription: string,
  analysisResult: AnalysisResult,
): KeywordGap[] => {
  const allKeywords = [
    ...analysisResult.matchingKeywords,
    ...analysisResult.missingKeywords,
  ];

  return allKeywords.map(keyword => {
    const term = typeof keyword === 'string' ? keyword : keyword.term;
    const importance = typeof keyword === 'string' ? 'important' : keyword.importance;
    const present = analysisResult.matchingKeywords.some(k => {
      const kTerm = typeof k === 'string' ? k : k.term;
      return kTerm.toLowerCase() === term.toLowerCase();
    });

    const category = guessKeywordCategory(term);
    const suggestedLocations = LOCATION_PRIORITY[category] || ['experience', 'skills'];
    const suggestedLocation = present ? undefined : suggestedLocations[0];

    return {
      term,
      importance,
      present,
      suggestedLocation,
    };
  });
};

export const suggestKeywordPlacements = (
  gap: KeywordGap,
  content: ResumeContent,
): string[] => {
  if (gap.present) {
    return [];
  }

  const category = guessKeywordCategory(gap.term);
  const locations = LOCATION_PRIORITY[category] || ['experience', 'skills'];

  return locations.filter(location => {
    switch (location) {
      case 'skills':
        return content.sections.some(s => s.type === 'skills');
      case 'experience':
        return content.sections.some(s => s.type === 'experience');
      case 'projects':
        return content.sections.some(s => s.type === 'projects');
      case 'education':
        return content.sections.some(s => s.type === 'education');
      case 'certifications':
        return content.sections.some(s => s.type === 'certifications');
      case 'intro':
        return content.sections.some(s => s.type === 'intro');
      default:
        return false;
    }
  });
};

export const calculateKeywordDensity = (
  content: ResumeContent,
  keywords: string[],
): {term: string; count: number; density: number}[] => {
  const allText = extractAllText(content);
  const words = allText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  if (totalWords === 0) {
    return keywords.map(term => ({term, count: 0, density: 0}));
  }

  return keywords.map(term => {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = allText.match(regex);
    const count = matches ? matches.length : 0;
    const density = Math.round((count / totalWords) * 100 * 100) / 100;

    return {term, count, density};
  });
};

const extractAllText = (content: ResumeContent): string => {
  const texts: string[] = [];

  for (const section of content.sections) {
    switch (section.type) {
      case 'personalInfo': {
        const d = section.data;
        if (d.fullName) texts.push(d.fullName);
        break;
      }
      case 'intro': {
        const d = section.data;
        if (d.headline) texts.push(d.headline);
        if (d.summary) texts.push(d.summary);
        break;
      }
      case 'experience':
        for (const e of section.entries) {
          if (e.role) texts.push(e.role);
          if (e.company) texts.push(e.company);
          if (e.summary) texts.push(e.summary);
          texts.push(...e.responsibilities!);
          texts.push(...e.achievements!);
          texts.push(...e.technologies!);
        }
        break;
      case 'projects':
        for (const e of section.entries) {
          if (e.name) texts.push(e.name);
          if (e.description) texts.push(e.description);
          texts.push(...e.technologies!);
        }
        break;
      case 'education':
        for (const e of section.entries) {
          if (e.degree) texts.push(e.degree);
          if (e.institution) texts.push(e.institution);
          if (e.fieldOfStudy) texts.push(e.fieldOfStudy);
        }
        break;
      case 'skills': {
        const allSkills = [
          ...section.uncategorized,
          ...section.groups.flatMap(g => g.skills),
        ];
        texts.push(...allSkills.map(s => s.name));
        break;
      }
      case 'certifications':
        for (const e of section.entries) {
          if (e.name) texts.push(e.name);
          if (e.issuer) texts.push(e.issuer);
        }
        break;
      case 'custom':
        if (section.data.content) texts.push(section.data.content);
        for (const e of section.data.entries || []) {
          if (e.title) texts.push(e.title);
          if (e.content) texts.push(e.content);
        }
        break;
    }
  }

  return texts.join(' ').toLowerCase();
};

export const generateOptimizationSuggestions = (
  content: ResumeContent,
  analysisResult: AnalysisResult,
): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];

  for (const keyword of analysisResult.missingKeywords) {
    const term = typeof keyword === 'string' ? keyword : keyword.term;
    const importance = typeof keyword === 'string' ? 'important' : keyword.importance;
    const category = guessKeywordCategory(term);
    const locations = LOCATION_PRIORITY[category] || ['experience', 'skills'];

    const targetSection = locations.find(loc => {
      switch (loc) {
        case 'skills':
          return content.sections.some(s => s.type === 'skills');
        case 'experience':
          return content.sections.some(s => s.type === 'experience');
        case 'projects':
          return content.sections.some(s => s.type === 'projects');
        default:
          return false;
      }
    });

    if (targetSection) {
      suggestions.push({
        id: `add-${term.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'add_keyword',
        section: targetSection as SectionType,
        description: `Add "${term}" to your ${targetSection} section`,
        impact: importance === 'required' ? 'high' : importance === 'important' ? 'medium' : 'low',
        applied: false,
      });
    }
  }

  const hasSummary = content.sections.some(s => s.type === 'intro');
  if (!hasSummary && analysisResult.suggestedSummary) {
    suggestions.push({
      id: 'add-summary',
      type: 'add_detail',
      section: 'intro',
      description: 'Add a professional summary to your resume',
      impact: 'high',
      applied: false,
    });
  }

  const experienceSection = content.sections.find(s => s.type === 'experience');
  if (experienceSection && experienceSection.type === 'experience') {
    const entriesWithoutBullets = experienceSection.entries.filter(
      e => e.responsibilities!.length === 0 && e.achievements!.length === 0,
    );

    if (entriesWithoutBullets.length > 0) {
      suggestions.push({
        id: 'add-bullets-experience',
        type: 'add_detail',
        section: 'experience',
        description: `Add bullet points to ${entriesWithoutBullets.length} experience entr${entriesWithoutBullets.length === 1 ? 'y' : 'ies'}`,
        impact: 'medium',
        applied: false,
      });
    }
  }

  return suggestions;
};
