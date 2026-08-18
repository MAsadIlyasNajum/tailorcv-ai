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

const isStorageReady = (): boolean => storage !== null;

export const saveLatestAnalysis = (snapshot: ResumeStateSnapshot): void => {
  if (!isStorageReady()) {
    return;
  }

  storage.set(LAST_ANALYSIS_KEY, JSON.stringify({
    ...snapshot,
    finalResumeOutput: snapshot.finalResumeOutput ?? null,
    professionalExperiences: snapshot.professionalExperiences ?? [],
  }));
};

export const getLatestAnalysis = (): ResumeStateSnapshot | null => {
  if (!isStorageReady()) {
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
    };
  } catch {
    return null;
  }
};

export const clearLatestAnalysis = (): void => {
  if (!isStorageReady()) {
    return;
  }

  storage.remove(LAST_ANALYSIS_KEY);
};
