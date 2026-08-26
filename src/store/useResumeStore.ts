import {create} from 'zustand';

import * as storage from '../services/storage/storage';
import type {
  AnalysisResult,
  FinalResumeOutput,
  ProfessionalExperience,
  ResumeMetadata,
} from '../types/resume';

interface ResumeStore {
  resumeText: string;
  jobDescription: string;
  analysisResult: AnalysisResult | null;
  finalResumeOutput: FinalResumeOutput | null;
  resumeMetadata: ResumeMetadata | null;
  professionalExperiences: ProfessionalExperience[];
  isAnalyzing: boolean;
  isGeneratingFinalOutput: boolean;
  analysisError: string | null;
  finalOutputError: string | null;
  usefulnessFeedback: 'yes' | 'no' | null;
  setResumeText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setFinalResumeOutput: (result: FinalResumeOutput | null) => void;
  setResumeMetadata: (metadata: ResumeMetadata | null) => void;
  setProfessionalExperiences: (experiences: ProfessionalExperience[]) => void;
  addProfessionalExperience: (experience: ProfessionalExperience) => void;
  updateProfessionalExperience: (
    id: string,
    nextExperience: Partial<ProfessionalExperience>,
  ) => void;
  removeProfessionalExperience: (id: string) => void;
  setIsAnalyzing: (value: boolean) => void;
  setIsGeneratingFinalOutput: (value: boolean) => void;
  setAnalysisError: (message: string | null) => void;
  setFinalOutputError: (message: string | null) => void;
  setUsefulnessFeedback: (value: 'yes' | 'no' | null) => void;
  clearFinalResumeOutput: () => void;
  hydrateLatest: () => void;
  clearAll: () => void;
}

const persistSnapshot = (state: Pick<ResumeStore, 'resumeText' | 'jobDescription' | 'analysisResult' | 'finalResumeOutput' | 'resumeMetadata' | 'professionalExperiences' | 'usefulnessFeedback'>): void => {
  storage.saveLatestAnalysis({
    resumeText: state.resumeText,
    jobDescription: state.jobDescription,
    analysisResult: state.analysisResult,
    finalResumeOutput: state.finalResumeOutput,
    resumeMetadata: state.resumeMetadata,
    professionalExperiences: state.professionalExperiences,
    usefulnessFeedback: state.usefulnessFeedback,
  });
};

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeText: '',
  jobDescription: '',
  analysisResult: null,
  finalResumeOutput: null,
  resumeMetadata: null,
  professionalExperiences: [],
  isAnalyzing: false,
  isGeneratingFinalOutput: false,
  analysisError: null,
  finalOutputError: null,
  usefulnessFeedback: null,
  setResumeText: text => {
    set({resumeText: text});
    persistSnapshot(get());
  },
  setJobDescription: text => {
    set({jobDescription: text});
    persistSnapshot(get());
  },
  setAnalysisResult: result => {
    set({analysisResult: result, finalResumeOutput: null, analysisError: null, usefulnessFeedback: null});
    persistSnapshot(get());
  },
  setFinalResumeOutput: result => {
    set({finalResumeOutput: result, finalOutputError: null});
    persistSnapshot(get());
  },
  setResumeMetadata: metadata => {
    set({resumeMetadata: metadata});
    persistSnapshot(get());
  },
  setProfessionalExperiences: experiences => {
    set({professionalExperiences: experiences});
    persistSnapshot(get());
  },
  addProfessionalExperience: experience => {
    const nextExperiences = [...get().professionalExperiences, experience];
    set({professionalExperiences: nextExperiences});
    persistSnapshot(get());
  },
  updateProfessionalExperience: (id, nextExperience) => {
    const nextExperiences = get().professionalExperiences.map(experience =>
      experience.id === id ? {...experience, ...nextExperience} : experience,
    );

    set({professionalExperiences: nextExperiences});
    persistSnapshot(get());
  },
  removeProfessionalExperience: id => {
    const nextExperiences = get().professionalExperiences.filter(
      experience => experience.id !== id,
    );

    set({professionalExperiences: nextExperiences});
    persistSnapshot(get());
  },
  setIsAnalyzing: value => {
    set({isAnalyzing: value});
  },
  setIsGeneratingFinalOutput: value => {
    set({isGeneratingFinalOutput: value});
  },
  setAnalysisError: message => {
    set({analysisError: message});
  },
  setFinalOutputError: message => {
    set({finalOutputError: message});
  },
  setUsefulnessFeedback: value => {
    set({usefulnessFeedback: value});
    persistSnapshot(get());
  },
  clearFinalResumeOutput: () => {
    set({finalResumeOutput: null, finalOutputError: null});
    persistSnapshot(get());
  },
  hydrateLatest: () => {
    if (typeof storage.getLatestAnalysis !== 'function') {
      return;
    }

    const latest = storage.getLatestAnalysis();
    if (!latest) {
      return;
    }

    set({
      resumeText: latest.resumeText,
      jobDescription: latest.jobDescription,
      analysisResult: latest.analysisResult,
      finalResumeOutput: latest.finalResumeOutput ?? null,
      resumeMetadata: latest.resumeMetadata ?? null,
      professionalExperiences: latest.professionalExperiences ?? [],
      analysisError: null,
      finalOutputError: null,
      usefulnessFeedback: latest.usefulnessFeedback ?? null,
    });
  },
  clearAll: () => {
    storage.clearLatestAnalysis();
    set({
      resumeText: '',
      jobDescription: '',
      analysisResult: null,
      finalResumeOutput: null,
      resumeMetadata: null,
      professionalExperiences: [],
      isAnalyzing: false,
      isGeneratingFinalOutput: false,
      analysisError: null,
      finalOutputError: null,
      usefulnessFeedback: null,
    });
  },
}));
