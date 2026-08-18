import {createMMKV} from 'react-native-mmkv';

import type {ResumeStateSnapshot} from '../../types/resume';

const storage = createMMKV({
  id: 'tailorcv-ai-storage',
});

const LAST_ANALYSIS_KEY = 'latest-analysis';

export const saveLatestAnalysis = (snapshot: ResumeStateSnapshot): void => {
  storage.set(LAST_ANALYSIS_KEY, JSON.stringify({
    ...snapshot,
    finalResumeOutput: snapshot.finalResumeOutput ?? null,
    professionalExperiences: snapshot.professionalExperiences ?? [],
  }));
};

export const getLatestAnalysis = (): ResumeStateSnapshot | null => {
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
  storage.remove(LAST_ANALYSIS_KEY);
};
