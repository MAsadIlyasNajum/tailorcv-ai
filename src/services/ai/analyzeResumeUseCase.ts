import {geminiService} from './geminiService';
import {validateJobDescription} from '../../utils/validation/jobDescriptionValidation';
import {useResumeStore} from '../../store/useResumeStore';
import {validateFinalResumeOutput} from '../../utils/validation/finalOutputValidation';

export const runResumeAnalysis = async (): Promise<void> => {
  const store = useResumeStore.getState();
  const resumeText = store.resumeText.trim();
  const jobDescription = store.jobDescription.trim();

  if (!resumeText) {
    store.setAnalysisError('Please upload your resume first.');
    return;
  }

  const jobValidation = validateJobDescription(jobDescription);
  if (!jobValidation.valid) {
    store.setAnalysisError(jobValidation.message ?? 'Please provide a valid job description.');
    return;
  }

  store.setIsAnalyzing(true);
  store.setAnalysisError(null);

  try {
    const result = await geminiService.analyzeResume(resumeText, jobDescription);
    store.setAnalysisResult(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'We could not complete the analysis. Please try again.';

    store.setAnalysisError(message);
  } finally {
    store.setIsAnalyzing(false);
  }
};

export const runExperienceImprovementAnalysis = async (): Promise<void> => {
  const store = useResumeStore.getState();
  const resumeText = store.resumeText.trim();
  const jobDescription = store.jobDescription.trim();
  const professionalExperiences = store.professionalExperiences;

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
  const resumeText = store.resumeText.trim();
  const jobDescription = store.jobDescription.trim();
  const analysisResult = store.analysisResult;
  const professionalExperiences = store.professionalExperiences;

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

  if (!analysisResult) {
    store.setFinalOutputError('Please run analysis before generating final output.');
    return;
  }

  store.setIsGeneratingFinalOutput(true);
  store.setFinalOutputError(null);

  try {
    const finalOutput = await geminiService.generateFinalResumeOutput(
      resumeText,
      jobDescription,
      analysisResult,
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
