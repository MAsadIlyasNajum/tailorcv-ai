import {geminiService} from './geminiService';
import {validateJobDescription} from '../../utils/validation/jobDescriptionValidation';
import {useResumeStore} from '../../store/useResumeStore';
import {validateFinalResumeOutput} from '../../utils/validation/finalOutputValidation';
import type {AnalysisResult, JobApplication} from '../../types/resume';
import {trackEvent} from '../analytics/analytics';

export const runResumeAnalysis = async (): Promise<void> => {
  const store = useResumeStore.getState();
  const currentResume = store.resumes.find(r => r.id === store.currentResumeId);
  const currentJobApplication = store.jobApplications.find(
    app => app.id === store.currentJobApplicationId,
  );
  const resumeText = currentResume?.text?.trim() ?? '';

  if (!currentResume || !resumeText) {
    store.setAnalysisError('Please upload your resume first.');
    return;
  }

  const jobDescription = currentJobApplication?.jobDescription?.trim() ?? '';

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    store.setAnalysisError(jobValidation.message ?? 'Please provide a valid job description.');
    return;
  }

  store.setIsAnalyzing(true);
  store.setAnalysisError(null);

  try {
    const result = await geminiService.analyzeResume(resumeText, jobDescription);

    let jobApplication = currentJobApplication;
    if (!jobApplication) {
      const newApp: JobApplication = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        resumeId: currentResume.id,
        jobDescription,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      store.addJobApplication(newApp);
      store.setCurrentJobApplication(newApp.id);
      jobApplication = newApp;
    }

    const analysisResult: AnalysisResult = {
      ...result,
      resumeId: currentResume.id,
      jobApplicationId: jobApplication.id,
      jobDescription,
      companyName: jobApplication.companyName,
      jobTitle: jobApplication.jobTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    store.addAnalysisResult(analysisResult);
    store.setCurrentAnalysis(analysisResult.id);
    trackEvent('analysis_completed');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'We could not complete the analysis. Please try again.';

    store.setAnalysisError(message);
    trackEvent('analysis_failed');
  } finally {
    store.setIsAnalyzing(false);
  }
};

export const runExperienceImprovementAnalysis = async (): Promise<void> => {
  const store = useResumeStore.getState();
  const currentResume = store.resumes.find(r => r.id === store.currentResumeId);
  const currentJobApplication = store.jobApplications.find(
    app => app.id === store.currentJobApplicationId,
  );
  const resumeText = currentResume?.text?.trim() ?? '';
  const jobDescription = currentJobApplication?.jobDescription?.trim() ?? '';
  const professionalExperiences = currentResume?.professionalExperiences ?? [];

  if (!resumeText) {
    store.setAnalysisError('Please upload your resume first.');
    return;
  }

  if (!professionalExperiences.length) {
    store.setAnalysisError('Please add at least one professional experience entry first.');
    return;
  }

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    store.setAnalysisError(jobValidation.message ?? 'Please provide a valid job description.');
    return;
  }

  try {
    const suggestions = await geminiService.analyzeProfessionalExperience(
      resumeText,
      jobDescription,
      professionalExperiences,
    );

    suggestions.forEach(suggestion => {
      const match = professionalExperiences.find(
        experience =>
          experience.jobTitle.toLowerCase() === suggestion.jobTitle.toLowerCase() &&
          experience.company.toLowerCase() === suggestion.company.toLowerCase(),
      );

      if (!match) {
        return;
      }

      store.updateProfessionalExperience(match.id, {
        summary: suggestion.improvedSummary,
        keywords: suggestion.keywords,
        generatedSuggestions: suggestion.impactNotes.length
          ? suggestion.impactNotes
          : suggestion.suggestedBullets,
      });
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'We could not generate experience recommendations. Please try again.';

    store.setAnalysisError(message);
  }
};

export const runFinalOutputGeneration = async (): Promise<void> => {
  const store = useResumeStore.getState();
  const currentResume = store.resumes.find(r => r.id === store.currentResumeId);
  const currentJobApplication = store.jobApplications.find(
    app => app.id === store.currentJobApplicationId,
  );
  const resumeText = currentResume?.text?.trim() ?? '';
  const jobDescription = currentJobApplication?.jobDescription?.trim() ?? '';
  const currentAnalysis = store.analysisResults.find(r => r.id === store.currentAnalysisId);
  const professionalExperiences = currentResume?.professionalExperiences ?? [];

  if (!resumeText) {
    store.setFinalOutputError('Please upload your resume first.');
    return;
  }

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    store.setFinalOutputError(
      jobValidation.message ?? 'Please provide a valid job description.',
    );
    return;
  }

  if (!currentAnalysis) {
    store.setFinalOutputError('Please run analysis before generating final output.');
    return;
  }

  const userEdits = currentAnalysis.userEditedSuggestions;
  const analysisForPrompt = userEdits
    ? {
        ...currentAnalysis,
        suggestedSummary: userEdits.suggestedSummary ?? currentAnalysis.suggestedSummary,
        suggestedSkills: userEdits.suggestedSkills ?? currentAnalysis.suggestedSkills,
        experienceImprovements: userEdits.experienceImprovements ?? currentAnalysis.experienceImprovements,
        atsTips: userEdits.atsTips ?? currentAnalysis.atsTips,
      }
    : currentAnalysis;

  store.setIsGeneratingFinalOutput(true);
  store.setFinalOutputError(null);

  try {
    const finalOutput = await geminiService.generateFinalResumeOutput(
      resumeText,
      jobDescription,
      analysisForPrompt,
      professionalExperiences,
    );

    const validation = validateFinalResumeOutput(finalOutput);

    if (!validation.valid) {
      store.setFinalOutputError(
        validation.message ??
          'The final output was incomplete. Please generate it again.',
      );
      return;
    }

    store.setFinalResumeOutput(finalOutput);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'We could not generate final output. Please try again.';

    store.setFinalOutputError(message);
  } finally {
    store.setIsGeneratingFinalOutput(false);
  }
};
