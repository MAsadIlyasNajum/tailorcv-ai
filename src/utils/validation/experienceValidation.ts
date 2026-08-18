export interface ProfessionalExperienceValidationResult {
  valid: boolean;
  trimmed: Partial<{
    jobTitle: string;
    company: string;
    summary: string;
    startDate: string;
    endDate: string;
  }>;
  message?: string;
}

export const validateProfessionalExperience = (
  value: {
    jobTitle?: string;
    company?: string;
    summary?: string;
    startDate?: string;
    endDate?: string | null;
    isCurrentRole?: boolean;
    bulletPoints?: string[];
  },
): ProfessionalExperienceValidationResult => {
  const jobTitle = value.jobTitle?.trim() ?? '';
  const company = value.company?.trim() ?? '';
  const summary = value.summary?.trim() ?? '';
  const startDate = value.startDate?.trim() ?? '';
  const endDate = value.endDate?.trim() ?? '';
  const bulletPoints = (value.bulletPoints ?? []).filter(
    bullet => bullet.trim().length > 0,
  );

  if (!jobTitle) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please enter a job title.',
    };
  }

  if (!company) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please enter a company name.',
    };
  }

  if (!summary) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please add a short summary for this role.',
    };
  }

  if (!startDate) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please provide a start date.',
    };
  }

  if (!value.isCurrentRole && !endDate) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please provide an end date or mark this as your current role.',
    };
  }

  if (bulletPoints.length === 0) {
    return {
      valid: false,
      trimmed: {jobTitle, company, summary, startDate, endDate},
      message: 'Please add at least one accomplishment bullet.',
    };
  }

  return {
    valid: true,
    trimmed: {jobTitle, company, summary, startDate, endDate},
  };
};
