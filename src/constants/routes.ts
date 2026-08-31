export const ROUTES = {
  HOME: 'Home',
  RESUMES: 'Resumes',
  RESUME_DETAIL: 'ResumeDetail',
  UPLOAD_RESUME: 'UploadResume',
  JOB_DESCRIPTION: 'JobDescription',
  EXPERIENCE_EDITOR: 'ExperienceEditor',
  ANALYSIS_RESULT: 'AnalysisResult',
  FINAL_RESUME_OUTPUT: 'FinalResumeOutput',
  SETTINGS: 'Settings',
  HISTORY: 'History',
  JOB_APPLICATION_DETAIL: 'JobApplicationDetail',
  EDIT_SUGGESTIONS: 'EditSuggestions',
  RESUME_EDITOR: 'ResumeEditor',
  RESUME_PREVIEW: 'ResumePreview',
  RESUME_EXTRACTION_REVIEW: 'ResumeExtractionReview',
  MAIN_TABS: 'MainTabs',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
