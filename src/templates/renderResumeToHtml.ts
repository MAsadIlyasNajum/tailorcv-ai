import type {PersonalInfoData, ResumeSection, ExperienceEntry, ProjectEntry, EducationEntry, CertificationEntry, SkillGroup, SkillItem, CustomSectionData} from '../types/resume';
import type {TemplateStyles} from './types';

export const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const renderContactLine = (info: PersonalInfoData): string => {
  const emails = info.emails.map(e => e.value).filter((x): x is string => Boolean(x));
  const phones = info.phoneNumbers.map(e => e.value).filter((x): x is string => Boolean(x));
  const addresses = info.addresses.map(e => e.value).filter((x): x is string => Boolean(x));
  const links = info.links.map(e => (e.label ? `${e.label}: ${e.value}` : e.value)).filter((x): x is string => Boolean(x));
  const parts = [...emails, ...phones, ...addresses, ...links];
  if (parts.length === 0) return '';
  return parts.map(part => escapeHtml(part)).join(' · ');
};

export const renderDateRange = (start?: string, end?: string | null, isCurrent?: boolean): string => {
  const startStr = start?.trim();
  const endStr = isCurrent ? 'Present' : end?.trim();
  if (!startStr && !endStr) return '';
  return [startStr, endStr].filter((x): x is string => Boolean(x)).join(' – ');
};

export const renderBullets = (items?: string[]): string => {
  if (!items || items.length === 0) return '';
  return items
    .filter((item): item is string => Boolean(item))
    .map(item => `<div class="bullet">• ${escapeHtml(item)}</div>`)
    .join('');
};

const renderExperienceEntry = (entry: ExperienceEntry, styles: TemplateStyles): string => {
  const title = [entry.role, entry.company].filter((x): x is string => Boolean(x)).join(' @ ');
  const meta = renderDateRange(entry.startDate, entry.endDate, entry.isCurrent);
  const body = [entry.summary, renderBullets([...(entry.achievements ?? []), ...(entry.responsibilities ?? []), ...(entry.technologies ?? [])])]
    .filter((x): x is string => Boolean(x))
    .join('');
  return `
    <div class="${styles.entry}">
      <div class="${styles.entryTitle}">${escapeHtml(title || 'Role')}</div>
      ${meta ? `<div class="${styles.entryMeta}">${escapeHtml(meta)}</div>` : ''}
      ${body ? `<div class="${styles.entryBody}">${body}</div>` : ''}
    </div>
  `;
};

const renderProjectEntry = (entry: ProjectEntry, styles: TemplateStyles): string => {
  const title = entry.name || 'Project';
  const meta = renderDateRange(entry.startDate, entry.endDate);
  const body = [entry.description, renderBullets([...(entry.achievements ?? []), ...(entry.responsibilities ?? []), ...(entry.technologies ?? [])])]
    .filter((x): x is string => Boolean(x))
    .join('');
  return `
    <div class="${styles.entry}">
      <div class="${styles.entryTitle}">${escapeHtml(title)}</div>
      ${meta ? `<div class="${styles.entryMeta}">${escapeHtml(meta)}</div>` : ''}
      ${body ? `<div class="${styles.entryBody}">${body}</div>` : ''}
    </div>
  `;
};

const renderEducationEntry = (entry: EducationEntry, styles: TemplateStyles): string => {
  const title = [entry.degree, entry.institution].filter((x): x is string => Boolean(x)).join(' @ ');
  const meta = renderDateRange(entry.startDate, entry.endDate, entry.isCurrent);
  const body = renderBullets([...(entry.achievements ?? []), ...(entry.description ? [entry.description] : [])]);
  return `
    <div class="${styles.entry}">
      <div class="${styles.entryTitle}">${escapeHtml(title || 'Degree')}</div>
      ${meta ? `<div class="${styles.entryMeta}">${escapeHtml(meta)}</div>` : ''}
      ${body ? `<div class="${styles.entryBody}">${body}</div>` : ''}
    </div>
  `;
};

const renderCertificationEntry = (entry: CertificationEntry, styles: TemplateStyles): string => {
  const title = entry.name || 'Certification';
  const meta = [entry.issuer, entry.issueDate].filter((x): x is string => Boolean(x)).join(' · ');
  return `
    <div class="${styles.entry}">
      <div class="${styles.entryTitle}">${escapeHtml(title)}</div>
      ${meta ? `<div class="${styles.entryMeta}">${escapeHtml(meta)}</div>` : ''}
    </div>
  `;
};

const renderSkillsSection = (groups: SkillGroup[], uncategorized: SkillItem[], styles: TemplateStyles): string => {
  const uncategorizedItems = uncategorized.map(s => s.name).filter((x): x is string => Boolean(x));
  let html = '';
  if (uncategorizedItems.length > 0) {
    html += `<div class="${styles.skillsUncategorized}">${uncategorizedItems.map(name => escapeHtml(name)).join(' · ')}</div>`;
  }
  for (const group of groups) {
    const skills = group.skills.map(s => s.name).filter((x): x is string => Boolean(x));
    html += `
      <div class="${styles.entry}">
        <div class="${styles.skillsGroupTitle}">${escapeHtml(group.title)}</div>
        <div class="${styles.skillsGroupItems}">${skills.map(name => escapeHtml(name)).join(' · ')}</div>
      </div>
    `;
  }
  return html;
};

const renderCustomSection = (data: CustomSectionData, styles: TemplateStyles): string => {
  let html = '';
  if (data.content) {
    html += `<div class="${styles.customContent}">${escapeHtml(data.content)}</div>`;
  }
  if (data.entries && data.entries.length > 0) {
    for (const entry of data.entries) {
      html += `
        <div class="${styles.customEntry}">
          ${entry.title ? `<div class="${styles.customEntryTitle}">${escapeHtml(entry.title)}</div>` : ''}
          ${entry.content ? `<div class="${styles.customEntryBody}">${escapeHtml(entry.content)}</div>` : ''}
        </div>
      `;
    }
  }
  return html;
};

export const renderSectionBlock = (section: ResumeSection, styles: TemplateStyles): string => {
  switch (section.type) {
    case 'personalInfo': {
      const d = section.data;
      const displayName = d.fullName?.trim() || [d.firstName, d.lastName].filter((x): x is string => Boolean(x)).join(' ') || '';
      const contactLine = renderContactLine(d);
      let html = '';
      if (displayName) {
        html += `<div class="name">${escapeHtml(displayName)}</div>`;
      }
      if (contactLine) {
        html += `<div class="contact-line">${contactLine}</div>`;
      }
      return html;
    }
    case 'intro': {
      const d = section.data;
      let html = '';
      if (d.headline) {
        html += `<div class="headline">${escapeHtml(d.headline)}</div>`;
      }
      if (d.summary) {
        html += `<div class="summary">${escapeHtml(d.summary)}</div>`;
      }
      return html;
    }
    case 'experience':
      return section.entries.map(e => renderExperienceEntry(e, styles)).join('');
    case 'projects':
      return section.entries.map(e => renderProjectEntry(e, styles)).join('');
    case 'education':
      return section.entries.map(e => renderEducationEntry(e, styles)).join('');
    case 'certifications':
      return section.entries.map(e => renderCertificationEntry(e, styles)).join('');
    case 'skills':
      return renderSkillsSection(section.groups, section.uncategorized, styles);
    case 'custom':
      return renderCustomSection(section.data, styles);
    default:
      return '';
  }
};
