import {createMMKV} from 'react-native-mmkv';

import type {ResumeStateSnapshot} from '../../types/resume';

let storage: ReturnType<typeof createMMKV> | null = null;

try {
  storage = createMMKV({
    id: 'tailorcv-ai-storage',
  });
} catch {
  storage = null;
}

const LAST_ANALYSIS_KEY = 'latest-analysis';

const isStorageReady = (
  instance: typeof storage,
): instance is NonNullable<typeof storage> => instance !== null;

export const saveLatestAnalysis = (snapshot: ResumeStateSnapshot): void => {
  if (!isStorageReady(storage)) {
    return;
  }

  storage.set(LAST_ANALYSIS_KEY, JSON.stringify({
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

  storage.remove(LAST_ANALYSIS_KEY);
};
