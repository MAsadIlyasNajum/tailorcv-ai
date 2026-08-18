export const MAX_JOB_DESCRIPTION_LENGTH = 12000;
export const MIN_JOB_DESCRIPTION_LENGTH = 80;

export interface JobDescriptionValidationResult {
  valid: boolean;
  trimmed: string;
  message?: string;
}

export const validateJobDescription = (
  value: string,
): JobDescriptionValidationResult => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false,
      trimmed: '',
      message: 'Please paste a job description first.',
    };
  }

  if (trimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      trimmed,
      message: 'Please provide a more detailed job description so the analysis can be meaningful.',
    };
  }

  if (trimmed.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      trimmed,
      message: `The job description is too long. Please keep it under ${MAX_JOB_DESCRIPTION_LENGTH} characters.`,
    };
  }

  return {
    valid: true,
    trimmed,
  };
};
