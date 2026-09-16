import type {Resume, ResumeContent, ResumeTemplate, TemplateStyles} from './types';
import {escapeHtml, renderSectionBlock} from './renderResumeToHtml';

const classicStyles: TemplateStyles = {
  sectionHeader: 'classic-section-header',
  entry: 'classic-entry',
  entryTitle: 'classic-entry-title',
  entryMeta: 'classic-entry-meta',
  entryBody: 'classic-entry-body',
  bullet: 'classic-bullet',
  skillsUncategorized: 'classic-skills-uncategorized',
  skillsGroupTitle: 'classic-skills-group-title',
  skillsGroupItems: 'classic-skills-group-items',
  customContent: 'classic-custom-content',
  customEntry: 'classic-custom-entry',
  customEntryTitle: 'classic-custom-entry-title',
  customEntryBody: 'classic-custom-entry-body',
};

export const classicTemplate: ResumeTemplate = {
  id: 'classic',
  name: 'Classic',
  description: 'Clean, traditional single-column layout',
  render: (content: ResumeContent, _resume: Resume): string => {
    const sections = content.sections;
    if (sections.length === 0) {
      return emptyState();
    }

    const body = sections
      .map(section => {
        const header = section.title
          ? `<div class="section-header">${escapeHtml(section.title)}</div>`
          : '';
        const contentHtml = renderSectionBlock(section, classicStyles);
        return `<div class="section">${header}${contentHtml}</div>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 0.65in;
      size: letter;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #000;
      line-height: 1.45;
      margin: 0;
      padding: 0;
    }
    .name {
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 4pt;
    }
    .contact-line {
      text-align: center;
      font-size: 9.5pt;
      color: #64748B;
      margin-bottom: 8pt;
    }
    .headline {
      text-align: center;
      font-size: 11pt;
      color: #334155;
      margin-bottom: 12pt;
    }
    .summary {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 8pt;
    }
    .section {
      margin-bottom: 14pt;
      page-break-inside: avoid;
    }
    .section-header {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 2pt;
      margin-bottom: 6pt;
    }
    .classic-entry {
      margin-bottom: 8pt;
    }
    .classic-entry-title {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0F172A;
    }
    .classic-entry-meta {
      font-size: 9.5pt;
      color: #64748B;
      margin-top: 1pt;
    }
    .classic-entry-body {
      font-size: 10pt;
      color: #334155;
      margin-top: 3pt;
    }
    .classic-bullet {
      margin-left: 14pt;
      text-indent: -14pt;
      padding-left: 14pt;
      margin-bottom: 1pt;
    }
    .classic-skills-uncategorized {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 4pt;
    }
    .classic-skills-group-title {
      font-size: 10pt;
      font-weight: bold;
      color: #0F172A;
      margin-top: 4pt;
    }
    .classic-skills-group-items {
      font-size: 10pt;
      color: #334155;
      margin-top: 1pt;
    }
    .classic-custom-content {
      font-size: 10pt;
      color: #334155;
    }
    .classic-custom-entry {
      margin-bottom: 6pt;
    }
    .classic-custom-entry-title {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0F172A;
    }
    .classic-custom-entry-body {
      font-size: 10pt;
      color: #334155;
      margin-top: 1pt;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
  },
};

const emptyState = (): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 0.65in;
      size: letter;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #000;
      line-height: 1.45;
      margin: 0;
      padding: 0;
    }
    .empty {
      text-align: center;
      color: #64748B;
      margin-top: 40pt;
    }
  </style>
</head>
<body>
  <div class="empty">No visible sections</div>
</body>
</html>`;
};
