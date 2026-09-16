import type {ResumeContent} from '../../types/resume';
import type {KeywordImportance, KeywordWithImportance, AtsScoreBreakdown} from '../../types/resume';

interface ScoreWeights {
  keywords: number;
  skills: number;
  experience: number;
  education: number;
  formatting: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  keywords: 0.3,
  skills: 0.25,
  experience: 0.25,
  education: 0.1,
  formatting: 0.1,
};

const IMPORTANCE_WEIGHTS: Record<KeywordImportance, number> = {
  required: 3,
  important: 2,
  'nice-to-have': 1,
};

export const calculateKeywordScore = (
  matching: KeywordWithImportance[],
  missing: KeywordWithImportance[],
): number => {
  const allKeywords = [...matching, ...missing];
  if (allKeywords.length === 0) {
    return 100;
  }

  const matchedWeight = matching.reduce(
    (sum, k) => sum + (IMPORTANCE_WEIGHTS[k.importance] ?? 2),
    0,
  );

  const totalWeight = allKeywords.reduce(
    (sum, k) => sum + (IMPORTANCE_WEIGHTS[k.importance] ?? 2),
    0,
  );

  if (totalWeight === 0) {
    return 100;
  }

  return Math.round((matchedWeight / totalWeight) * 100);
};

export const calculateSkillsScore = (
  content: ResumeContent,
  suggestedSkills: string[],
): number => {
  if (!suggestedSkills.length) {
    return 100;
  }

  const skillsSection = content.sections.find(s => s.type === 'skills');
  if (!skillsSection || skillsSection.type !== 'skills') {
    return 0;
  }

  const existingSkills = [
    ...skillsSection.uncategorized,
    ...skillsSection.groups.flatMap(g => g.skills),
  ].map(s => s.name.toLowerCase());

  const matchedCount = suggestedSkills.filter(skill =>
    existingSkills.includes(skill.toLowerCase()),
  ).length;

  return Math.round((matchedCount / suggestedSkills.length) * 100);
};

export const calculateExperienceScore = (
  content: ResumeContent,
  jobDescription: string,
): number => {
  const experienceSection = content.sections.find(s => s.type === 'experience');
  if (!experienceSection || experienceSection.type !== 'experience') {
    return 0;
  }

  const entries = experienceSection.entries;
  if (entries.length === 0) {
    return 0;
  }

  const jdLower = jobDescription.toLowerCase();
  const hasJobTitles = entries.some(e => e.role && jdLower.includes(e.role.toLowerCase()));
  const hasCompanies = entries.some(e => e.company && jdLower.includes(e.company.toLowerCase()));
  const hasBullets = entries.some(
    e => e.responsibilities!.length > 0 || e.achievements!.length > 0,
  );

  let score = 0;
  if (hasJobTitles) score += 40;
  if (hasCompanies) score += 30;
  if (hasBullets) score += 30;

  return score;
};

export const calculateEducationScore = (
  content: ResumeContent,
  jobDescription: string,
): number => {
  const educationSection = content.sections.find(s => s.type === 'education');
  if (!educationSection || educationSection.type !== 'education') {
    return 50;
  }

  const entries = educationSection.entries;
  if (entries.length === 0) {
    return 50;
  }

  const jdLower = jobDescription.toLowerCase();
  const hasDegree = entries.some(e => e.degree && jdLower.includes(e.degree.toLowerCase()));
  const hasInstitution = entries.some(e => e.institution);

  if (hasDegree && hasInstitution) return 100;
  if (hasInstitution) return 70;
  return 50;
};

export const calculateFormattingScore = (content: ResumeContent): number => {
  const sections = content.sections;
  if (sections.length === 0) {
    return 0;
  }

  const hasPersonalInfo = sections.some(s => s.type === 'personalInfo');
  const hasExperience = sections.some(s => s.type === 'experience');
  const hasSkills = sections.some(s => s.type === 'skills');
  const hasEducation = sections.some(s => s.type === 'education');

  let score = 0;
  if (hasPersonalInfo) score += 25;
  if (hasExperience) score += 30;
  if (hasSkills) score += 25;
  if (hasEducation) score += 20;

  return score;
};

export const calculateAtsScoreBreakdown = (
  content: ResumeContent,
  matchingKeywords: KeywordWithImportance[],
  missingKeywords: KeywordWithImportance[],
  suggestedSkills: string[],
  jobDescription: string,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): AtsScoreBreakdown => {
  const keywords = calculateKeywordScore(matchingKeywords, missingKeywords);
  const skills = calculateSkillsScore(content, suggestedSkills);
  const experience = calculateExperienceScore(content, jobDescription);
  const education = calculateEducationScore(content, jobDescription);
  const formatting = calculateFormattingScore(content);

  const overall = Math.round(
    keywords * weights.keywords +
    skills * weights.skills +
    experience * weights.experience +
    education * weights.education +
    formatting * weights.formatting,
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    keywords,
    skills,
    experience,
    education,
    formatting,
  };
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#14B8A6';
  if (score >= 60) return '#2563EB';
  if (score >= 40) return '#F59E0B';
  return '#DC2626';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
};
