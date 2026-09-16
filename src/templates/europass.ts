import type {Resume, ResumeContent, ResumeTemplate, TemplateStyles} from './types';
import {escapeHtml, renderSectionBlock} from './renderResumeToHtml';
import type {PersonalInfoData} from '../types/resume';

const europassStyles: TemplateStyles = {
  sectionHeader: 'europass-section-header',
  entry: 'europass-entry',
  entryTitle: 'europass-entry-title',
  entryMeta: 'europass-entry-meta',
  entryBody: 'europass-entry-body',
  bullet: 'europass-bullet',
  skillsUncategorized: 'europass-skills-uncategorized',
  skillsGroupTitle: 'europass-skills-group-title',
  skillsGroupItems: 'europass-skills-group-items',
  customContent: 'europass-custom-content',
  customEntry: 'europass-custom-entry',
  customEntryTitle: 'europass-custom-entry-title',
  customEntryBody: 'europass-custom-entry-body',
};

const renderEuropassContact = (info: PersonalInfoData): string => {
  const parts: string[] = [];
  if (info.emails.length) {
    for (const e of info.emails) {
      if (e.value) parts.push(`Email: ${escapeHtml(e.value)}`);
    }
  }
  if (info.phoneNumbers.length) {
    for (const p of info.phoneNumbers) {
      if (p.value) parts.push(`Phone: ${escapeHtml(p.value)}`);
    }
  }
  if (info.addresses.length) {
    for (const a of info.addresses) {
      if (a.value) parts.push(`Address: ${escapeHtml(a.value)}`);
    }
  }
  if (info.links.length) {
    for (const l of info.links) {
      if (l.value) {
        const label = l.label ? `${l.label}: ` : '';
        parts.push(`${label}${escapeHtml(l.value)}`);
      }
    }
  }
  if (parts.length === 0) return '';
  return parts.join(' · ');
};

const renderEuropassPersonalInfo = (data: PersonalInfoData): string => {
  const displayName = data.fullName?.trim() || [data.firstName, data.lastName].filter((x): x is string => Boolean(x)).join(' ') || '';
  const contactLine = renderEuropassContact(data);
  let html = '';
  if (displayName) {
    html += `<div class="europass-name">${escapeHtml(displayName)}</div>`;
  }
  if (contactLine) {
    html += `<div class="europass-contact">${contactLine}</div>`;
  }
  return html;
};

export const europassTemplate: ResumeTemplate = {
  id: 'europass',
  name: 'Europass',
  description: 'Compact EU-style layout',
  render: (content: ResumeContent, _resume: Resume): string => {
    const sections = content.sections;
    if (sections.length === 0) {
      return emptyState();
    }

    const body = sections
      .map(section => {
        let header = '';
        if (section.title) {
          header = `<div class="europass-section-header">${escapeHtml(section.title)}</div>`;
        }
        let contentHtml = '';
        if (section.type === 'personalInfo') {
          contentHtml = renderEuropassPersonalInfo(section.data);
        } else {
          contentHtml = renderSectionBlock(section, europassStyles);
        }
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
      line-height: 1.4;
      margin: 0;
      padding: 0;
    }
    .europass-name {
      font-size: 18pt;
      font-weight: bold;
      text-align: left;
      margin-bottom: 4pt;
    }
    .europass-contact {
      font-size: 9pt;
      color: #334155;
      margin-bottom: 8pt;
    }
    .europass-headline {
      font-size: 10pt;
      color: #334155;
      margin-bottom: 8pt;
    }
    .europass-summary {
      font-size: 9.5pt;
      color: #334155;
      margin-bottom: 6pt;
    }
    .section {
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    .europass-section-header {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-top: 1px solid #E2E8F0;
      padding-top: 3pt;
      margin-bottom: 4pt;
    }
    .europass-entry {
      margin-bottom: 6pt;
    }
    .europass-entry-title {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0F172A;
    }
    .europass-entry-meta {
      font-size: 9.5pt;
      color: #64748B;
      margin-top: 1pt;
    }
    .europass-entry-body {
      font-size: 9.5pt;
      color: #334155;
      margin-top: 2pt;
    }
    .europass-bullet {
      margin-left: 12pt;
      text-indent: -12pt;
      padding-left: 12pt;
      margin-bottom: 1pt;
    }
    .europass-skills-uncategorized {
      font-size: 9.5pt;
      color: #334155;
      margin-bottom: 3pt;
    }
    .europass-skills-group-title {
      font-size: 9.5pt;
      font-weight: bold;
      color: #0F172A;
      margin-top: 3pt;
    }
    .europass-skills-group-items {
      font-size: 9.5pt;
      color: #334155;
      margin-top: 1pt;
    }
    .europass-custom-content {
      font-size: 9.5pt;
      color: #334155;
    }
    .europass-custom-entry {
      margin-bottom: 4pt;
    }
    .europass-custom-entry-title {
      font-size: 10pt;
      font-weight: bold;
      color: #0F172A;
    }
    .europass-custom-entry-body {
      font-size: 9.5pt;
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
      line-height: 1.4;
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
