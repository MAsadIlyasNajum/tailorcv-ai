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
  "matchingKeywords": [{"term": "", "importance": "required"}],
  "missingKeywords": [{"term": "", "importance": "important"}],
  "suggestedSummary": "",
  "suggestedSkills": [],
  "experienceImprovements": [{ "original": "", "improved": "" }],
  "atsTips": []
}

For each keyword, assign importance based on how prominently it appears in the job description:
- "required" for must-have qualifications (e.g., "must have", "required", "essential")
- "important" for preferred qualifications (e.g., "preferred", "desired", "strong")
- "nice-to-have" for bonus qualifications (e.g., "bonus", "nice to have", "plus")

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

export const buildExtractionPrompt = (resumeText: string): string => {
  const safeResume = resumeText.trim();

  return `You are an expert resume structuring assistant.
Extract the candidate's resume into a clean, structured JSON representation that EXACTLY matches the schema below.

CRITICAL RULES:
- Extract ONLY information explicitly present in the resume.
- DO NOT fabricate names, companies, job titles, dates, degrees, certifications, skills, URLs, or projects.
- DO NOT invent dates. If a date is not explicitly stated, use null.
- DO NOT invent URLs, credential IDs, or links.
- Separate work "experience" entries from "projects" only when the source clearly distinguishes them.
- Preserve the candidate's exact wording where it is clear and factual.
- Keep optional fields empty/null when the information is unavailable.
- If some content does not fit any section (awards, languages, publications, volunteer work, etc.), put it verbatim into "unmapped".
- For project to experience associations, list 0-based indices of the related experiences in "associatedExperienceIndices" (for example [0, 2]). Only reference indices that exist in the experience list.
- Use skill groups only when the source provides clear categorization; otherwise put skills in "uncategorized".

Return ONLY valid JSON with this structure:
{
  "unmapped": "any leftover/unknown text verbatim, or empty string",
  "sections": [
    {
      "type": "personalInfo",
      "data": {
        "fullName": "",
        "photoUri": "",
        "emails": [{"value": "name@example.com", "label": "personal"}],
        "phoneNumbers": [{"value": "+1 555 000 0000", "label": "mobile"}],
        "addresses": [{"value": "City, Country", "label": "current"}],
        "links": [{"value": "https://example.com", "label": "GitHub"}]
      }
    },
    {
      "type": "intro",
      "data": { "headline": "", "summary": "" }
    },
    {
      "type": "experience",
      "entries": [
        {
          "company": "", "role": "", "employmentType": "", "location": "",
          "startDate": null, "endDate": null, "isCurrent": false,
          "summary": "", "responsibilities": [], "achievements": [], "technologies": [],
          "links": []
        }
      ]
    },
    {
      "type": "projects",
      "entries": [
        {
          "name": "", "role": "", "description": "",
          "startDate": null, "endDate": null,
          "responsibilities": [], "achievements": [], "technologies": [],
          "url": "", "githubUrl": "", "demoUrl": "",
          "associatedExperienceIndices": []
        }
      ]
    },
    {
      "type": "education",
      "entries": [
        {
          "institution": "", "degree": "", "fieldOfStudy": "", "location": "",
          "startDate": null, "endDate": null, "isCurrent": false,
          "description": "", "achievements": [], "gpa": "",
          "coursework": [], "activities": [], "url": ""
        }
      ]
    },
    {
      "type": "skills",
      "data": {
        "uncategorized": ["Skill A", "Skill B"],
        "groups": [{ "title": "Programming Languages", "skills": ["TypeScript"] }]
      }
    },
    {
      "type": "certifications",
      "entries": [
        {
          "name": "", "issuer": "", "issueDate": "", "expirationDate": "",
          "credentialId": "", "credentialUrl": "", "description": ""
        }
      ]
    },
    {
      "type": "custom",
      "title": "Publications",
      "data": { "content": "", "entries": [{ "title": "", "content": "" }] }
    }
  ]
}

RESUME:
${safeResume}
`;
};
