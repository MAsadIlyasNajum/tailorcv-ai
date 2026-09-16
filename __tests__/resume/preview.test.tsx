import {renderContactLine} from '../../src/templates/renderResumeToHtml';
import type {PersonalInfoData} from '../../src/types/resume';

describe('renderContactLine', () => {
  const buildInfo = (overrides: Partial<PersonalInfoData> = {}): PersonalInfoData => ({
    fullName: 'Jane Doe',
    emails: [{id: 'e1', value: 'jane@example.com'}],
    phoneNumbers: [{id: 'p1', value: '+1 555 000 0000'}],
    addresses: [],
    links: [{id: 'l1', value: 'https://example.com', label: 'GitHub'}],
    ...overrides,
  });

  it('includes addresses in the contact line', () => {
    const info = buildInfo({
      addresses: [
        {id: 'a1', value: '123 Main St'},
        {id: 'a2', value: 'City, Country'},
      ],
    });
    const line = renderContactLine(info);
    expect(line).toContain('123 Main St');
    expect(line).toContain('City, Country');
    expect(line).toContain('jane@example.com');
    expect(line).toContain('+1 555 000 0000');
    expect(line).toContain('GitHub: https://example.com');
  });

  it('filters out empty values', () => {
    const info = buildInfo({
      addresses: [
        {id: 'a1', value: ''},
        {id: 'a2', value: 'City, Country'},
      ],
    });
    const line = renderContactLine(info);
    expect(line).not.toContain('· ·');
    const parts = line.split(' · ');
    expect(parts).not.toContain('');
  });

  it('preserves order of multiple addresses', () => {
    const info = buildInfo({
      addresses: [
        {id: 'a1', value: 'Home'},
        {id: 'a2', value: 'Work'},
        {id: 'a3', value: 'Remote'},
      ],
    });
    const line = renderContactLine(info);
    expect(line).toBe('jane@example.com · +1 555 000 0000 · Home · Work · Remote · GitHub: https://example.com');
  });

  it('returns empty string when no contacts', () => {
    const info: PersonalInfoData = {
      emails: [],
      phoneNumbers: [],
      addresses: [],
      links: [],
    };
    expect(renderContactLine(info)).toBe('');
  });

  it('escapes HTML special characters', () => {
    const info = buildInfo({
      emails: [{id: 'e1', value: 'test@<script>.com'}],
    });
    const line = renderContactLine(info);
    expect(line).toContain('&lt;script&gt;');
    expect(line).not.toContain('<script>');
  });
});
