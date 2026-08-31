import {geminiService} from './geminiService';
import {useResumeStore} from '../../store/useResumeStore';
import type {ResumeContent} from '../../types/resume';
import {trackEvent} from '../analytics/analytics';

/**
 * Run AI structured extraction for the current resume.
 * Non-destructive: the proposal is stored in `resume.aiSuggestions` only.
 * The canonical `resume.content` is never modified here; it changes only when
 * the user explicitly accepts the suggestion.
 */
export const runStructuredExtraction = async (): Promise<ResumeContent | null> => {
  const store = useResumeStore.getState();
  const currentResume = store.resumes.find(r => r.id === store.currentResumeId);
  const resumeText = currentResume?.text?.trim() ?? '';

  if (!currentResume || !resumeText) {
    store.setExtractionError('Please upload or create a resume first.');
    return null;
  }

  store.setIsExtracting(true);
  store.setExtractionError(null);

  try {
    const proposal = await geminiService.extractStructuredResume(resumeText);
    store.setResumeSuggestion(currentResume.id, proposal);
    trackEvent('resume_extraction_completed');
    return proposal;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'We could not extract the structured resume. Please try again.';
    store.setExtractionError(message);
    trackEvent('resume_extraction_failed');
    return null;
  } finally {
    store.setIsExtracting(false);
  }
};

/** Reject the current extraction proposal (canonical content untouched). */
export const discardStructuredExtraction = (): void => {
  const store = useResumeStore.getState();
  if (store.currentResumeId) {
    store.rejectResumeSuggestion(store.currentResumeId);
  }
  store.setExtractionError(null);
};
