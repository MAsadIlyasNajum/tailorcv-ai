import * as storage from '../storage/storage';

export type AnalyticsEvent =
  | 'app_opened'
  | 'resume_added'
  | 'resume_selected'
  | 'analysis_started'
  | 'analysis_completed'
  | 'analysis_failed'
  | 'analysis_viewed'
  | 'history_opened'
  | 'resume_deleted'
  | 'analysis_deleted'
  | 'suggestion_edited'
  | 'result_copied'
  | 'result_shared'
  | 'final_output_generated'
  | 'final_resume_shared'
  | 'pdf_exported'
  | 'pdf_export_failed'
  | 'resume_extraction_completed'
  | 'resume_extraction_failed';

export interface AnalyticsEventPayload {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

const MAX_EVENTS = 1000;

let events: AnalyticsEventPayload[] = [];

export const loadAnalyticsEvents = (): void => {
  const stored = storage.getAnalyticsEvents();
  events = stored
    .map(item => {
      try {
        return JSON.parse(item) as AnalyticsEventPayload;
      } catch {
        return null;
      }
    })
    .filter((item): item is AnalyticsEventPayload => item !== null);
};

export const getAnalyticsEvents = (): AnalyticsEventPayload[] => {
  return [...events];
};

export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void => {
  const payload: AnalyticsEventPayload = {
    event,
    properties,
    timestamp: Date.now(),
  };

  events.push(payload);

  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  try {
    storage.saveAnalyticsEvents(events.map(e => JSON.stringify(e)));
  } catch {
    // ignore persistence errors
  }

  try {
    if (__DEV__) {
      console.log('[Analytics]', JSON.stringify(payload));
    }
  } catch {
    // ignore logging errors
  }
};
