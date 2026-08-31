export const initCrashReporting = (): void => {
  // no-op: Sentry removed
};

export const captureException = (_error: unknown, _context?: Record<string, unknown>): void => {
  // no-op: Sentry removed
};

export const captureMessage = (_message: string, _level?: string): void => {
  // no-op: Sentry removed
};
