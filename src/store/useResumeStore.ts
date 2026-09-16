import {create} from 'zustand';

import * as storage from '../services/storage/storage';
import type {
  AnalysisResult,
  FinalResumeOutput,
  JobApplication,
  OptimizationSuggestion,
  ProfessionalExperience,
  Resume,
  ResumeContent,
  ResumeSection,
  SectionType,
} from '../types/resume';
import {defaultSectionsForNewResume} from '../utils/resume/sectionFactory';
import {buildContentFromLegacy} from '../utils/resume/migration';
import {createId} from '../utils/resume/ids';
import {mergeSections} from '../utils/resume/contentMutators';

interface ResumeStore {
  resumes: Resume[];
  jobApplications: JobApplication[];
  analysisResults: AnalysisResult[];
  currentResumeId: string | null;
  currentJobApplicationId: string | null;
  currentAnalysisId: string | null;
  finalResumeOutput: FinalResumeOutput | null;
  isAnalyzing: boolean;
  isGeneratingFinalOutput: boolean;
  isExtracting: boolean;
  analysisError: string | null;
  finalOutputError: string | null;
  extractionError: string | null;
  usefulnessFeedback: 'yes' | 'no' | null;

  addResume: (resume: Resume) => void;
  updateResume: (id: string, updates: Partial<Resume>) => void;
  removeResume: (id: string) => void;
  setCurrentResume: (id: string | null) => void;
  updateResumeContent: (
    id: string,
    next: ResumeContent | ((prev: ResumeContent) => ResumeContent),
  ) => void;
  createEmptyResume: () => string;

  addJobApplication: (application: JobApplication) => void;
  updateJobApplication: (id: string, updates: Partial<JobApplication>) => void;
  removeJobApplication: (id: string) => void;
  setCurrentJobApplication: (id: string | null) => void;

  addAnalysisResult: (result: AnalysisResult) => void;
  updateAnalysisResult: (id: string, updates: Partial<AnalysisResult>) => void;
  removeAnalysisResult: (id: string) => void;
  setCurrentAnalysis: (id: string | null) => void;

  // Legacy APIs operating on the `professionalExperiences` array.
  // These are separate from the modern structured editor (`content.sections`).
  // New features should use content mutators / `useResumeContent` instead.
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
  setExtractionError: (message: string | null) => void;
  setIsExtracting: (value: boolean) => void;
  setResumeSuggestion: (resumeId: string, content: ResumeContent) => void;
  clearResumeSuggestion: (resumeId: string) => void;
  acceptResumeSuggestion: (resumeId: string, sectionTypes?: SectionType[]) => void;
  rejectResumeSuggestion: (resumeId: string) => void;
  setUsefulnessFeedback: (value: 'yes' | 'no' | null) => void;

  setFinalResumeOutput: (result: FinalResumeOutput | null) => void;
  clearFinalResumeOutput: () => void;

  applyOptimizationSuggestion: (resumeId: string, suggestion: OptimizationSuggestion) => void;
  dismissOptimizationSuggestion: (resumeId: string, suggestionId: string) => void;

  hydrateLatest: () => void;
  clearAll: () => void;
}

const persistCollections = (
  state: Pick<
    ResumeStore,
    | 'resumes'
    | 'jobApplications'
    | 'analysisResults'
    | 'currentResumeId'
    | 'currentJobApplicationId'
    | 'currentAnalysisId'
    | 'usefulnessFeedback'
    | 'finalResumeOutput'
  >,
): void => {
  storage.saveResumes(state.resumes);
  storage.saveJobApplications(state.jobApplications);
  storage.saveAnalysisResults(state.analysisResults);
  storage.setCurrentResumeId(state.currentResumeId);
  storage.setCurrentJobApplicationId(state.currentJobApplicationId);
  storage.setCurrentAnalysisId(state.currentAnalysisId);
  storage.saveFinalResumeOutput(state.finalResumeOutput);
};

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumes: [],
  jobApplications: [],
  analysisResults: [],
  currentResumeId: null,
  currentJobApplicationId: null,
  currentAnalysisId: null,
  finalResumeOutput: null,
  isAnalyzing: false,
  isGeneratingFinalOutput: false,
  isExtracting: false,
  analysisError: null,
  finalOutputError: null,
  extractionError: null,
  usefulnessFeedback: null,

  addResume: resume => {
    const withContent: Resume = resume.content
      ? resume
      : {...resume, content: buildContentFromLegacy(resume)};
    const next = [...get().resumes, withContent];
    set({resumes: next});
    persistCollections(get());
  },
  updateResume: (id, updates) => {
    const next = get().resumes.map(resume =>
      resume.id === id ? {...resume, ...updates, updatedAt: Date.now()} : resume,
    );
    set({resumes: next});
    persistCollections(get());
  },
  removeResume: id => {
    const {currentResumeId, analysisResults, jobApplications, currentJobApplicationId, currentAnalysisId} = get();
    const nextResumes = get().resumes.filter(resume => resume.id !== id);
    const nextAnalysisResults = analysisResults.filter(item => item.resumeId !== id);
    const removedAnalysisIds = new Set(
      analysisResults.filter(item => item.resumeId === id).map(item => item.id),
    );
    const nextJobApplications = jobApplications.filter(app => app.resumeId !== id);
    const nextCurrentResumeId = currentResumeId === id ? null : currentResumeId;
    const nextCurrentJobApplicationId = nextJobApplications.some(app => app.id === currentJobApplicationId)
      ? currentJobApplicationId
      : null;
    const nextCurrentAnalysisId = removedAnalysisIds.has(currentAnalysisId ?? '')
      ? null
      : currentAnalysisId;
    set({
      resumes: nextResumes,
      analysisResults: nextAnalysisResults,
      jobApplications: nextJobApplications,
      currentResumeId: nextCurrentResumeId,
      currentJobApplicationId: nextCurrentJobApplicationId,
      currentAnalysisId: nextCurrentAnalysisId,
      finalResumeOutput: removedAnalysisIds.has(get().finalResumeOutput?.analysisId ?? '')
        ? null
        : get().finalResumeOutput,
    });
    persistCollections(get());
  },
  setCurrentResume: id => {
    set({currentResumeId: id});
    persistCollections(get());
  },

  updateResumeContent: (id, next) => {
    const nextResumes = get().resumes.map(resume => {
      if (resume.id !== id) {
        return resume;
      }
      const prev: ResumeContent = resume.content ?? {sections: []};
      const computed: ResumeContent = typeof next === 'function' ? next(prev) : next;
      return {
        ...resume,
        content: computed,
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
      };
    });
    set({resumes: nextResumes});
    persistCollections(get());
  },

  createEmptyResume: () => {
    const id = createId('resume');
    const resume: Resume = {
      id,
      name: 'Untitled Resume',
      sourceType: 'text',
      text: '',
      metadata: undefined,
      professionalExperiences: [],
      content: {sections: defaultSectionsForNewResume()},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
    };
    set({resumes: [...get().resumes, resume], currentResumeId: id});
    persistCollections(get());
    return id;
  },

  addJobApplication: application => {
    const next = [...get().jobApplications, application];
    set({jobApplications: next});
    persistCollections(get());
  },
  updateJobApplication: (id, updates) => {
    const next = get().jobApplications.map(app =>
      app.id === id ? {...app, ...updates, updatedAt: Date.now()} : app,
    );
    set({jobApplications: next});
    persistCollections(get());
  },
  removeJobApplication: id => {
    const next = get().jobApplications.filter(app => app.id !== id);
    const {currentJobApplicationId} = get();
    set({
      jobApplications: next,
      currentJobApplicationId: currentJobApplicationId === id ? null : currentJobApplicationId,
    });
    persistCollections(get());
  },
  setCurrentJobApplication: id => {
    set({currentJobApplicationId: id});
    persistCollections(get());
  },

  addAnalysisResult: result => {
    const next = [...get().analysisResults, result];
    set({analysisResults: next});
    persistCollections(get());
  },
  updateAnalysisResult: (id, updates) => {
    const next = get().analysisResults.map(item =>
      item.id === id ? {...item, ...updates, updatedAt: Date.now()} : item,
    );
    set({analysisResults: next});
    persistCollections(get());
  },
  removeAnalysisResult: id => {
    const next = get().analysisResults.filter(item => item.id !== id);
    const {currentAnalysisId} = get();
    set({
      analysisResults: next,
      currentAnalysisId: currentAnalysisId === id ? null : currentAnalysisId,
    });
    persistCollections(get());
  },
  setCurrentAnalysis: id => {
    set({currentAnalysisId: id});
    persistCollections(get());
  },

  // Legacy: operates on `resume.professionalExperiences`, not `content.sections`.
  // Used by the legacy ExperienceEditorScreen. New flows should use content mutators.
  addProfessionalExperience: experience => {
    const currentResumeId = get().currentResumeId;
    if (!currentResumeId) {
      return;
    }

    const next = get().resumes.map(resume =>
      resume.id === currentResumeId
        ? {
            ...resume,
            professionalExperiences: [...resume.professionalExperiences, experience],
            updatedAt: Date.now(),
          }
        : resume,
    );

    set({resumes: next});
    persistCollections(get());
  },

  // Legacy: operates on `resume.professionalExperiences`, not `content.sections`.
  updateProfessionalExperience: (id, nextExperience) => {
    const currentResumeId = get().currentResumeId;
    if (!currentResumeId) {
      return;
    }

    const next = get().resumes.map(resume => {
      if (resume.id !== currentResumeId) {
        return resume;
      }

      return {
        ...resume,
        professionalExperiences: resume.professionalExperiences.map(experience =>
          experience.id === id ? {...experience, ...nextExperience} : experience,
        ),
        updatedAt: Date.now(),
      };
    });

    set({resumes: next});
    persistCollections(get());
  },

  // Legacy: operates on `resume.professionalExperiences`, not `content.sections`.
  removeProfessionalExperience: id => {
    const currentResumeId = get().currentResumeId;
    if (!currentResumeId) {
      return;
    }

    const next = get().resumes.map(resume => {
      if (resume.id !== currentResumeId) {
        return resume;
      }

      return {
        ...resume,
        professionalExperiences: resume.professionalExperiences.filter(
          experience => experience.id !== id,
        ),
        updatedAt: Date.now(),
      };
    });

    set({resumes: next});
    persistCollections(get());
  },

  setIsAnalyzing: value => set({isAnalyzing: value}),
  setIsGeneratingFinalOutput: value => set({isGeneratingFinalOutput: value}),
  setAnalysisError: message => set({analysisError: message}),
  setFinalOutputError: message => set({finalOutputError: message}),

  setIsExtracting: value => set({isExtracting: value}),
  setExtractionError: message => set({extractionError: message}),

  setResumeSuggestion: (resumeId, content) => {
    set({
      resumes: get().resumes.map(resume =>
        resume.id === resumeId
          ? {...resume, aiSuggestions: content, updatedAt: Date.now(), lastUsedAt: Date.now()}
          : resume,
      ),
    });
    persistCollections(get());
  },

  clearResumeSuggestion: resumeId => {
    set({
      resumes: get().resumes.map(resume =>
        resume.id === resumeId
          ? {...resume, aiSuggestions: undefined, updatedAt: Date.now()}
          : resume,
      ),
    });
    persistCollections(get());
  },

  acceptResumeSuggestion: (resumeId, sectionTypes) => {
    const state = get();
    const resume = state.resumes.find(r => r.id === resumeId);
    if (!resume?.aiSuggestions) {
      return;
    }
    const suggestion = resume.aiSuggestions;
    const toAccept = sectionTypes
      ? suggestion.sections.filter(s => sectionTypes.includes(s.type))
      : suggestion.sections;

    if (toAccept.length === 0) {
      return;
    }

    const prev = resume.content ?? {sections: []};

    const merged: ResumeSection[] = [...prev.sections];
    for (const accepted of toAccept) {
      if (accepted.type === 'custom') {
        const acceptedTitle = accepted.title?.trim();
        const existingIdx = merged.findIndex(s => {
          if (s.type !== 'custom') return false;
          const existingTitle = s.title?.trim();
          if (!acceptedTitle || !existingTitle) return false;
          return existingTitle.toLowerCase() === acceptedTitle.toLowerCase();
        });
        if (existingIdx >= 0) {
          merged[existingIdx] = mergeSections(merged[existingIdx], accepted);
        } else {
          merged.push(accepted);
        }
      } else {
        const idx = merged.findIndex(s => s.type === accepted.type);
        if (idx >= 0) {
          merged[idx] = mergeSections(merged[idx], accepted);
        } else {
          merged.push(accepted);
        }
      }
    }

    const newContent: ResumeContent = {
      sections: merged.map((s, index) => ({...s, order: index})),
      unmapped: prev.unmapped ?? suggestion.unmapped,
    };

    const remainingSuggestion =
      sectionTypes
        ? suggestion.sections.filter(s => !sectionTypes.includes(s.type))
        : [];
    const newSuggestion = remainingSuggestion.length
      ? {...suggestion, sections: remainingSuggestion}
      : undefined;

    set({
      resumes: state.resumes.map(r =>
        r.id === resumeId
          ? {...r, content: newContent, aiSuggestions: newSuggestion, updatedAt: Date.now(), lastUsedAt: Date.now()}
          : r,
      ),
    });
    persistCollections(get());
  },

  rejectResumeSuggestion: resumeId => {
    set({
      resumes: get().resumes.map(resume =>
        resume.id === resumeId
          ? {...resume, aiSuggestions: undefined, updatedAt: Date.now()}
          : resume,
      ),
    });
    persistCollections(get());
  },
  setUsefulnessFeedback: value => {
    set({usefulnessFeedback: value});
    persistCollections(get());
  },
  setFinalResumeOutput: result => {
    set({finalResumeOutput: result});
    storage.saveFinalResumeOutput(result);
  },
  clearFinalResumeOutput: () => {
    set({finalResumeOutput: null});
    storage.saveFinalResumeOutput(null);
  },

  applyOptimizationSuggestion: (resumeId, suggestion) => {
    const resume = get().resumes.find(r => r.id === resumeId);
    if (!resume) {
      return;
    }

    const appliedSuggestions = [...(resume.appliedSuggestions || []), suggestion.id];
    const scoreHistory = resume.scoreHistory || [];

    set({
      resumes: get().resumes.map(r =>
        r.id === resumeId ? {...r, appliedSuggestions, scoreHistory} : r,
      ),
    });

    persistCollections(get());
  },

  dismissOptimizationSuggestion: (resumeId, suggestionId) => {
    const resume = get().resumes.find(r => r.id === resumeId);
    if (!resume) {
      return;
    }

    const appliedSuggestions = [...(resume.appliedSuggestions || []), suggestionId];

    set({
      resumes: get().resumes.map(r =>
        r.id === resumeId ? {...r, appliedSuggestions} : r,
      ),
    });

    persistCollections(get());
  },

  hydrateLatest: () => {
    const resumes = storage.getResumes();
    const jobApplications = storage.getJobApplications();
    const analysisResults = storage.getAnalysisResults();
    const currentResumeId = storage.getCurrentResumeId();
    const currentJobApplicationId = storage.getCurrentJobApplicationId();
    const currentAnalysisId = storage.getCurrentAnalysisId();
    const finalResumeOutput = storage.getFinalResumeOutput();

    set({
      resumes,
      jobApplications,
      analysisResults,
      currentResumeId,
      currentJobApplicationId,
      currentAnalysisId,
      finalResumeOutput,
      analysisError: null,
      finalOutputError: null,
    });
  },
  clearAll: () => {
    storage.clearAllData();
    set({
      resumes: [],
      jobApplications: [],
      analysisResults: [],
      currentResumeId: null,
      currentJobApplicationId: null,
      currentAnalysisId: null,
      finalResumeOutput: null,
      isAnalyzing: false,
      isGeneratingFinalOutput: false,
      analysisError: null,
      finalOutputError: null,
      usefulnessFeedback: null,
    });
  },
}));
