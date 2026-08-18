export const ROUTES = {
  HOME: 'Home',
  UPLOAD_RESUME: 'UploadResume',
  JOB_DESCRIPTION: 'JobDescription',
  EXPERIENCE_EDITOR: 'ExperienceEditor',
  ANALYSIS_RESULT: 'AnalysisResult',
  FINAL_RESUME_OUTPUT: 'FinalResumeOutput',
  SETTINGS: 'Settings',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
