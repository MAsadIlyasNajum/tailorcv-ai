import {MMKV} from 'react-native-mmkv';

import type {
  AnalysisResult,
  FinalResumeOutput,
  JobApplication,
  Resume,
  ResumeStateSnapshot,
} from '../../types/resume';
import {migrateResumeIfNeeded, normalizeAssociations} from '../../utils/resume/migration';

const RESUME_SCHEMA_VERSION = 2;

let storage: MMKV | null = null;

try {
  storage = new MMKV({
    id: 'tailorcv-ai-storage',
  });
} catch {
  storage = null;
}

const LAST_ANALYSIS_KEY = 'latest-analysis';

const RESUMES_KEY = 'resumes';
const JOB_APPLICATIONS_KEY = 'job-applications';
const ANALYSIS_RESULTS_KEY = 'analysis-results';
const CURRENT_RESUME_ID_KEY = 'current-resume-id';
const CURRENT_JOB_APPLICATION_ID_KEY = 'current-job-application-id';
const CURRENT_ANALYSIS_ID_KEY = 'current-analysis-id';
const FINAL_RESUME_OUTPUT_KEY = 'final-resume-output';
const SCHEMA_VERSION_KEY = 'schema-version';
const ANALYTICS_EVENTS_KEY = 'analytics-events';

const isStorageReady = (instance: typeof storage): instance is MMKV => instance !== null;

const safeParseJson = <T>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return 'null';
  }
};

export const saveResumes = (resumes: Resume[]): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(RESUMES_KEY, safeStringify(resumes));
};

export const getResumes = (): Resume[] => {
  if (!isStorageReady(storage)) {
    return [];
  }

  return safeParseJson(storage.getString(RESUMES_KEY), []);
};

export const saveJobApplications = (applications: JobApplication[]): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(JOB_APPLICATIONS_KEY, safeStringify(applications));
};

export const getJobApplications = (): JobApplication[] => {
  if (!isStorageReady(storage)) {
    return [];
  }

  return safeParseJson(storage.getString(JOB_APPLICATIONS_KEY), []);
};

export const saveAnalysisResults = (results: AnalysisResult[]): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(ANALYSIS_RESULTS_KEY, safeStringify(results));
};

export const getAnalysisResults = (): AnalysisResult[] => {
  if (!isStorageReady(storage)) {
    return [];
  }

  return safeParseJson(storage.getString(ANALYSIS_RESULTS_KEY), []);
};

export const setCurrentResumeId = (id: string | null): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(CURRENT_RESUME_ID_KEY, safeStringify(id));
};

export const getCurrentResumeId = (): string | null => {
  if (!isStorageReady(storage)) {
    return null;
  }

  return safeParseJson(storage.getString(CURRENT_RESUME_ID_KEY), null);
};

export const setCurrentJobApplicationId = (id: string | null): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(CURRENT_JOB_APPLICATION_ID_KEY, safeStringify(id));
};

export const getCurrentJobApplicationId = (): string | null => {
  if (!isStorageReady(storage)) {
    return null;
  }

  return safeParseJson(storage.getString(CURRENT_JOB_APPLICATION_ID_KEY), null);
};

export const setCurrentAnalysisId = (id: string | null): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(CURRENT_ANALYSIS_ID_KEY, safeStringify(id));
};

export const getCurrentAnalysisId = (): string | null => {
  if (!isStorageReady(storage)) {
    return null;
  }

  return safeParseJson(storage.getString(CURRENT_ANALYSIS_ID_KEY), null);
};

export const saveFinalResumeOutput = (result: FinalResumeOutput | null): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(FINAL_RESUME_OUTPUT_KEY, safeStringify(result));
};

export const getFinalResumeOutput = (): FinalResumeOutput | null => {
  if (!isStorageReady(storage)) {
    return null;
  }

  return safeParseJson(storage.getString(FINAL_RESUME_OUTPUT_KEY), null);
};

export const getSchemaVersion = (): number => {
  if (!isStorageReady(storage)) {
    return 0;
  }

  return safeParseJson(storage.getString(SCHEMA_VERSION_KEY), 0);
};

export const setSchemaVersion = (version: number): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(SCHEMA_VERSION_KEY, safeStringify(version));
};

export const getAnalyticsEvents = (): string[] => {
  if (!isStorageReady(storage)) {
    return [];
  }

  return safeParseJson(storage.getString(ANALYTICS_EVENTS_KEY), []);
};

export const saveAnalyticsEvents = (events: string[]): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(ANALYTICS_EVENTS_KEY, safeStringify(events));
};

export const clearAllData = (): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.delete(RESUMES_KEY);
  storage.delete(JOB_APPLICATIONS_KEY);
  storage.delete(ANALYSIS_RESULTS_KEY);
  storage.delete(CURRENT_RESUME_ID_KEY);
  storage.delete(CURRENT_JOB_APPLICATION_ID_KEY);
  storage.delete(CURRENT_ANALYSIS_ID_KEY);
  storage.delete(FINAL_RESUME_OUTPUT_KEY);
  storage.delete(LAST_ANALYSIS_KEY);
};

/**
 * Non-destructive migration of stored resumes to the structured `content` model.
 * Legacy `text` and `professionalExperiences` are preserved on each resume.
 */
export const runResumeModelMigration = (): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  const resumes = getResumes();
  if (!resumes.length) {
    setSchemaVersion(RESUME_SCHEMA_VERSION);
    return;
  }

  const migrated = resumes.map(resume => {
    const withContent = migrateResumeIfNeeded(resume);
    return withContent.content
      ? {...withContent, content: normalizeAssociations(withContent.content)}
      : withContent;
  });
  saveResumes(migrated);
  setSchemaVersion(RESUME_SCHEMA_VERSION);
};

export const hasMigrated = (): boolean => {
  if (!isStorageReady(storage)) {
    return true;
  }

  const hasNewData =
    (storage.getString(RESUMES_KEY) ?? '') !== '' ||
    (storage.getString(JOB_APPLICATIONS_KEY) ?? '') !== '' ||
    (storage.getString(ANALYSIS_RESULTS_KEY) ?? '') !== '';

  return hasNewData;
};

export const migrateLegacySnapshot = (snapshot: ResumeStateSnapshot): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  const resumeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const jobApplicationId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const analysisId = snapshot.analysisResult?.id ?? `${resumeId}-analysis`;

  const resume: Resume = {
    id: resumeId,
    name: snapshot.resumeMetadata?.name ?? 'My Resume',
    sourceType: snapshot.resumeMetadata ? 'pdf' : 'text',
    text: snapshot.resumeText,
    metadata: snapshot.resumeMetadata
      ? {
          uri: snapshot.resumeMetadata.uri,
          fileName: snapshot.resumeMetadata.name,
          fileSize: snapshot.resumeMetadata.size,
          mimeType: snapshot.resumeMetadata.mimeType,
          extension: snapshot.resumeMetadata.extension,
        }
      : undefined,
    professionalExperiences: snapshot.professionalExperiences ?? [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUsedAt: Date.now(),
  };

  const jobApplication: JobApplication = {
    id: jobApplicationId,
    resumeId,
    jobDescription: snapshot.jobDescription,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const baseAnalysis = snapshot.analysisResult;
  const analysisResult: AnalysisResult = {
    id: analysisId,
    resumeId,
    jobApplicationId,
    jobDescription: snapshot.jobDescription,
    companyName: baseAnalysis?.companyName,
    jobTitle: baseAnalysis?.jobTitle,
    matchScore: baseAnalysis?.matchScore ?? 0,
    matchingKeywords: baseAnalysis?.matchingKeywords ?? [],
    missingKeywords: baseAnalysis?.missingKeywords ?? [],
    suggestedSummary: baseAnalysis?.suggestedSummary ?? '',
    suggestedSkills: baseAnalysis?.suggestedSkills ?? [],
    experienceImprovements: baseAnalysis?.experienceImprovements ?? [],
    atsTips: baseAnalysis?.atsTips ?? [],
    createdAt: baseAnalysis?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  saveResumes([resume]);
  saveJobApplications([jobApplication]);
  saveAnalysisResults([analysisResult]);
  setCurrentResumeId(resumeId);
  setCurrentJobApplicationId(jobApplicationId);
  setCurrentAnalysisId(analysisId);

  storage.delete(LAST_ANALYSIS_KEY);
};

export const saveLatestAnalysis = (snapshot: ResumeStateSnapshot): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(LAST_ANALYSIS_KEY, safeStringify({
    ...snapshot,
    finalResumeOutput: snapshot.finalResumeOutput ?? null,
    professionalExperiences: snapshot.professionalExperiences ?? [],
    usefulnessFeedback: snapshot.usefulnessFeedback ?? null,
  }));
};

export const getLatestAnalysis = (): ResumeStateSnapshot | null => {
  if (!isStorageReady(storage)) {
    return null;
  }

  const raw = storage.getString(LAST_ANALYSIS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ResumeStateSnapshot>;

    return {
      resumeText: parsed.resumeText ?? '',
      jobDescription: parsed.jobDescription ?? '',
      analysisResult: parsed.analysisResult ?? null,
      finalResumeOutput: parsed.finalResumeOutput ?? null,
      resumeMetadata: parsed.resumeMetadata ?? null,
      professionalExperiences: parsed.professionalExperiences ?? [],
      usefulnessFeedback: parsed.usefulnessFeedback ?? null,
    };
  } catch {
    return null;
  }
};

export const clearLatestAnalysis = (): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.delete(LAST_ANALYSIS_KEY);
};
