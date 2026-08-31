import type {FinalResumeOutput} from '../../types/resume';

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const renderFinalResumeToHtml = (
  output: FinalResumeOutput,
  jobTitle?: string,
  companyName?: string,
): string => {
  const headerName = jobTitle || 'Professional Profile';
  const headerSuffix = companyName ? ` — ${companyName}` : '';

  const keywordsHtml = output.prioritizedKeywords.length
    ? output.prioritizedKeywords
        .map(k => `<div class="bullet">• ${escapeHtml(k)}</div>`)
        .join('')
    : '<div class="bullet">• None specified</div>';

  const experienceHtml = output.polishedExperienceSections
    .map(section => {
      const bullets = section.polishedBullets
        .map(b => `<div class="bullet">• ${escapeHtml(b)}</div>`)
        .join('');
      return `
        <div class="section">
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.polishedSummary)}</p>
          ${bullets}
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 0.6in;
      size: letter;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      color: #000;
      line-height: 1.4;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 16pt;
      margin-bottom: 4pt;
      margin-top: 0;
    }
    h2 {
      font-size: 12pt;
      margin-top: 12pt;
      margin-bottom: 4pt;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2pt;
    }
    p {
      margin: 0 0 4pt 0;
    }
    .section {
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    .bullet {
      margin-left: 14pt;
      text-indent: -14pt;
      padding-left: 14pt;
      margin-bottom: 2pt;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(headerName)}${escapeHtml(headerSuffix)}</h1>

  <div class="section">
    <h2>Professional Summary</h2>
    <p>${escapeHtml(output.refinedSummary)}</p>
  </div>

  <div class="section">
    <h2>Key Skills</h2>
    ${keywordsHtml}
  </div>

  ${experienceHtml}
</body>
</html>`;
};
