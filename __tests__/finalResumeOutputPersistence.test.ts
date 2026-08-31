import * as storage from '../src/services/storage/storage';
import type {FinalResumeOutput} from '../src/types/resume';

describe('FinalResumeOutput persistence', () => {
  const mockOutput: FinalResumeOutput = {
    id: 'test-output-id',
    analysisId: 'test-analysis-id',
    refinedSummary: 'Test summary',
    prioritizedKeywords: ['React', 'TypeScript'],
    polishedExperienceSections: [
      {
        heading: 'Engineer',
        polishedSummary: 'Test experience',
        polishedBullets: ['Bullet 1'],
      },
    ],
    finalRecommendations: ['Rec 1'],
    cautions: ['Caution 1'],
    createdAt: Date.now(),
  };

  beforeEach(() => {
    storage.clearAllData();
  });

  it('saves and retrieves FinalResumeOutput', () => {
    storage.saveFinalResumeOutput(mockOutput);
    const retrieved = storage.getFinalResumeOutput();
    expect(retrieved).toEqual(mockOutput);
  });

  it('returns null when no FinalResumeOutput is saved', () => {
    const retrieved = storage.getFinalResumeOutput();
    expect(retrieved).toBeNull();
  });

  it('clears FinalResumeOutput when set to null', () => {
    storage.saveFinalResumeOutput(mockOutput);
    storage.saveFinalResumeOutput(null);
    const retrieved = storage.getFinalResumeOutput();
    expect(retrieved).toBeNull();
  });

  it('clears FinalResumeOutput on clearAllData', () => {
    storage.saveFinalResumeOutput(mockOutput);
    storage.clearAllData();
    const retrieved = storage.getFinalResumeOutput();
    expect(retrieved).toBeNull();
  });
});

describe('Schema version persistence', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('returns 0 when no schema version is set', () => {
    expect(storage.getSchemaVersion()).toBe(0);
  });

  it('saves and retrieves schema version', () => {
    storage.setSchemaVersion(1);
    expect(storage.getSchemaVersion()).toBe(1);
  });

  it('updates schema version', () => {
    storage.setSchemaVersion(1);
    storage.setSchemaVersion(2);
    expect(storage.getSchemaVersion()).toBe(2);
  });
});

describe('Analytics events persistence', () => {
  beforeEach(() => {
    storage.clearAllData();
  });

  it('returns empty array when no events are saved', () => {
    expect(storage.getAnalyticsEvents()).toEqual([]);
  });

  it('saves and retrieves analytics events', () => {
    const events = ['event1', 'event2', 'event3'];
    storage.saveAnalyticsEvents(events);
    expect(storage.getAnalyticsEvents()).toEqual(events);
  });

  it('updates analytics events', () => {
    storage.saveAnalyticsEvents(['event1']);
    storage.saveAnalyticsEvents(['event1', 'event2']);
    expect(storage.getAnalyticsEvents()).toEqual(['event1', 'event2']);
  });
});
