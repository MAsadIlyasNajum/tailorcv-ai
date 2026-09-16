import type {Resume, ResumeContent, ResumeTemplate, TemplateStyles} from './types';
import {escapeHtml, renderSectionBlock} from './renderResumeToHtml';

const modernStyles: TemplateStyles = {
  sectionHeader: 'modern-section-header',
  entry: 'modern-entry',
  entryTitle: 'modern-entry-title',
  entryMeta: 'modern-entry-meta',
  entryBody: 'modern-entry-body',
  bullet: 'modern-bullet',
  skillsUncategorized: 'modern-skills-uncategorized',
  skillsGroupTitle: 'modern-skills-group-title',
  skillsGroupItems: 'modern-skills-group-items',
  customContent: 'modern-custom-content',
  customEntry: 'modern-custom-entry',
  customEntryTitle: 'modern-custom-entry-title',
  customEntryBody: 'modern-custom-entry-body',
};

export const modernTemplate: ResumeTemplate = {
  id: 'modern',
  name: 'Modern',
  description: 'Left-aligned with accent color',
  render: (content: ResumeContent, _resume: Resume): string => {
    const sections = content.sections;
    if (sections.length === 0) {
      return emptyState();
    }

    const body = sections
      .map(section => {
        const header = section.title
          ? `<div class="modern-section-header">${escapeHtml(section.title)}</div>`
          : '';
        const contentHtml = renderSectionBlock(section, modernStyles);
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
      text-align: left;
      border-bottom: 3px solid #2563EB;
      padding-bottom: 4pt;
      margin-bottom: 2pt;
    }
    .contact-line {
      font-size: 9.5pt;
      color: #64748B;
      margin-bottom: 8pt;
    }
    .headline {
      font-size: 11pt;
      color: #64748B;
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
    .modern-section-header {
      font-size: 12pt;
      font-weight: bold;
      color: #2563EB;
      border-left: 4px solid #2563EB;
      padding-left: 6pt;
      margin-bottom: 6pt;
    }
    .modern-entry {
      margin-bottom: 12pt;
    }
    .modern-entry-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0F172A;
    }
    .modern-entry-meta {
      font-size: 9.5pt;
      color: #64748B;
      margin-top: 1pt;
    }
    .modern-entry-body {
      font-size: 10pt;
      color: #334155;
      margin-top: 3pt;
    }
    .modern-bullet {
      margin-left: 14pt;
      text-indent: -14pt;
      padding-left: 14pt;
      margin-bottom: 1pt;
    }
    .modern-skills-uncategorized {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 4pt;
    }
    .modern-skills-group-title {
      font-size: 10pt;
      font-weight: bold;
      color: #0F172A;
      margin-top: 4pt;
    }
    .modern-skills-group-items {
      font-size: 10pt;
      color: #334155;
      margin-top: 1pt;
    }
    .modern-custom-content {
      font-size: 10pt;
      color: #334155;
    }
    .modern-custom-entry {
      margin-bottom: 6pt;
    }
    .modern-custom-entry-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0F172A;
    }
    .modern-custom-entry-body {
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
