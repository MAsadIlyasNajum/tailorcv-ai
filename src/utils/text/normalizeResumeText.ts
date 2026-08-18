export const normalizeResumeText = (text: string): string => {
  if (!text) {
    return '';
  }

  const noTrailingPages = text.replace(/\n\s*Page\s+\d+\s+of\s+\d+\s*\n/gi, '\n');
  const noHeaders = noTrailingPages.replace(
    /^(?:[-*\s]+)?(resume|cv|curriculum vitae)\s*[:-]?\s*$/gim,
    '',
  );
  const withSingleBreaks = noHeaders.replace(/\r\n/g, '\n');
  const collapsedWhitespace = withSingleBreaks
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\f]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*•\s*/g, ' • ')
    .trim();

  return collapsedWhitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
};
