import type {
  AnalysisResult,
  ProfessionalExperience,
} from '../../types/resume';

export const buildGeminiPrompt = (
  resumeText: string,
  jobDescription: string,
): string => {
  const safeResume = resumeText.trim();
  const safeJobDescription = jobDescription.trim();

  return `You are an expert ATS resume optimization consultant.

Compare the candidate's resume with the target job description.
Provide practical improvements that increase ATS compatibility while remaining truthful.

Rules:
- Never invent experience.
- Never fabricate skills.
- Never fabricate companies.
- Never fabricate education.
- Never fabricate certifications.
- Only recommend rewording based on information present in the resume.
- Focus on relevant keywords.
- Focus on measurable impact when evidence exists.
- Keep professional language concise.
- Return valid JSON only.

Return JSON with this exact structure:
{
  "matchScore": 0,
  "matchingKeywords": [],
  "missingKeywords": [],
  "suggestedSummary": "",
  "suggestedSkills": [],
  "experienceImprovements": [{ "original": "", "improved": "" }],
  "atsTips": []
}

RESUME:
${safeResume}

JOB DESCRIPTION:
${safeJobDescription}
`;
};

export const buildExperienceImprovementPrompt = (
  resumeText: string,
  jobDescription: string,
  experiences: ProfessionalExperience[],
): string => {
  const safeResume = resumeText.trim();
  const safeJobDescription = jobDescription.trim();
  const safeExperiences = experiences.length
    ? experiences
        .map(
          experience => `- ${experience.jobTitle} @ ${experience.company}\n  Summary: ${experience.summary}\n  Bullets: ${experience.bulletPoints.join(' | ')}`,
        )
        .join('\n')
    : 'No saved professional experience entries available.';

  return `You are an expert ATS resume optimization consultant focused on professional experience improvement.

Improve the candidate's work history based on the resume and target job description without inventing facts, metrics, or responsibilities.

Rules:
- Reword only information already present in the experience data.
- Use stronger action verbs and measurable impact language when evidence exists.
- Prefer ATS-aligned phrasing and relevant keywords from the job description.
- Do not add fake companies, titles, projects, or responsibilities.
- Return valid JSON only.

Return JSON with this exact structure:
{
  "experienceSummaries": [
    {
      "jobTitle": "",
      "company": "",
      "improvedSummary": "",
      "suggestedBullets": [""],
      "keywords": [""],
      "impactNotes": [""]
    }
  ]
}

TARGET JOB DESCRIPTION:
${safeJobDescription}

RESUME:
${safeResume}

PROFESSIONAL EXPERIENCE:
${safeExperiences}
`;
};

export const buildFinalOutputPrompt = (
  resumeText: string,
  jobDescription: string,
  analysisResult: AnalysisResult,
  experiences: ProfessionalExperience[],
): string => {
  const safeResume = resumeText.trim();
  const safeJobDescription = jobDescription.trim();

  const safeAnalysis = JSON.stringify(
    {
      matchScore: analysisResult.matchScore,
      missingKeywords: analysisResult.missingKeywords,
      suggestedSummary: analysisResult.suggestedSummary,
      suggestedSkills: analysisResult.suggestedSkills,
      experienceImprovements: analysisResult.experienceImprovements,
      atsTips: analysisResult.atsTips,
    },
    null,
    2,
  );

  const safeExperiences = experiences.length
    ? experiences
        .map(
          experience => `- ${experience.jobTitle} @ ${experience.company}\n  Summary: ${experience.summary}\n  Bullets: ${experience.bulletPoints.join(' | ')}`,
        )
        .join('\n')
    : 'No saved professional experience entries available.';

  return `You are an expert resume optimization consultant preparing a final, polished resume-ready output package.

Generate practical, truthful, and ATS-aligned content based only on the provided resume, job description, and analysis.

Rules:
- Never invent experience, companies, titles, dates, projects, metrics, education, certifications, or skills.
- Reword and prioritize only what is already supported by the source material.
- Keep wording concise and professional.
- Keep sections easy to copy into a resume.
- If evidence is limited, be conservative and avoid inflated claims.
- Return valid JSON only.

Return JSON with this exact structure:
{
  "refinedSummary": "",
  "prioritizedKeywords": [""],
  "polishedExperienceSections": [
    {
      "heading": "",
      "polishedSummary": "",
      "polishedBullets": [""]
    }
  ],
  "finalRecommendations": [""],
  "cautions": [""]
}

TARGET JOB DESCRIPTION:
${safeJobDescription}

RESUME:
${safeResume}

EXISTING ANALYSIS:
${safeAnalysis}

PROFESSIONAL EXPERIENCE:
${safeExperiences}
`;
};
