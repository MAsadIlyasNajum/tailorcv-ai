import {parseExtractionResponse} from '../../src/services/ai/extractionParser';
import type {ResumeContent, ResumeSection} from '../../src/types/resume';

describe('parseExtractionResponse', () => {
  it('parses a valid AI response into canonical ResumeContent', () => {
    const json = JSON.stringify({
      unmapped: '',
      sections: [
        {
          type: 'personalInfo',
          data: {
            fullName: 'Jane Doe',
            emails: [{value: 'jane@example.com'}],
            phoneNumbers: [{value: '+1 555 000 0000'}],
          },
        },
        {
          type: 'intro',
          data: {headline: 'Engineer', summary: 'Experienced engineer.'},
        },
        {
          type: 'experience',
          entries: [
            {
              company: 'Acme',
              role: 'Developer',
              startDate: '2020',
              endDate: null,
              achievements: ['Shipped feature'],
            },
          ],
        },
      ],
    });

    const content = parseExtractionResponse(json);
    const types = content.sections.map(s => s.type);
    expect(types).toContain('personalInfo');
    expect(types).toContain('intro');
    expect(types).toContain('experience');

    const personal = content.sections.find(s => s.type === 'personalInfo') as ResumeSection;
    if (personal.type !== 'personalInfo') {
      throw new Error('expected personalInfo');
    }
    expect(personal.data.fullName).toBe('Jane Doe');
    expect(personal.data.emails[0].value).toBe('jane@example.com');
    // IDs are regenerated, never trusted from AI
    expect(personal.id).not.toBe('');
  });

  it('leaves missing/uncertain fields empty (no fabrication)', () => {
    const json = JSON.stringify({
      sections: [
        {
          type: 'experience',
          entries: [{company: 'Acme', role: 'Dev'}],
        },
      ],
    });
    const content = parseExtractionResponse(json);
    const exp = content.sections.find(s => s.type === 'experience') as ResumeSection;
    if (exp.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(exp.entries[0].startDate).toBeUndefined();
    expect(exp.entries[0].endDate).toBeUndefined();
    expect(exp.entries[0].company).toBe('Acme');
  });

  it('drops unknown section types instead of corrupting structure', () => {
    const json = JSON.stringify({
      sections: [
        {type: 'experience', entries: [{company: 'Acme'}]},
        {type: 'totallyUnknown', foo: 'bar'},
      ],
    });
    const content = parseExtractionResponse(json);
    expect(content.sections).toHaveLength(1);
    expect(content.sections[0].type).toBe('experience');
  });

  it('preserves custom sections and unmapped text', () => {
    const json = JSON.stringify({
      unmapped: 'Some award text that does not fit.',
      sections: [
        {
          type: 'custom',
          title: 'Awards',
          data: {content: 'Won a prize.', entries: [{title: 'Prize', content: '2023'}]},
        },
      ],
    });
    const content = parseExtractionResponse(json);
    const custom = content.sections.find(s => s.type === 'custom') as ResumeSection;
    if (custom.type !== 'custom') {
      throw new Error('expected custom');
    }
    expect(custom.title).toBe('Awards');
    expect(custom.data.content).toBe('Won a prize.');
    expect(content.unmapped).toContain('award text');
  });

  it('maps project experience associations via indices safely', () => {
    const json = JSON.stringify({
      sections: [
        {
          type: 'experience',
          entries: [{company: 'A', role: 'RA'}, {company: 'B', role: 'RB'}],
        },
        {
          type: 'projects',
          entries: [
            {name: 'P1', associatedExperienceIndices: [0, 1]},
            {name: 'P2', associatedExperienceIndices: [5]},
          ],
        },
      ],
    });
    const content = parseExtractionResponse(json);
    const experience = content.sections.find(s => s.type === 'experience') as ResumeSection;
    const projects = content.sections.find(s => s.type === 'projects') as ResumeSection;
    if (experience.type !== 'experience' || projects.type !== 'projects') {
      throw new Error('section type mismatch');
    }
    const expIds = experience.entries.map(e => e.id);
    expect(projects.entries[0].associatedExperienceIds).toEqual(expIds);
    // out-of-range index ignored
    expect(projects.entries[1].associatedExperienceIds).toEqual([]);
  });

  it('handles large collections without data loss', () => {
    const experiences = Array.from({length: 20}, (_, i) => ({company: `C${i}`}));
    const projects = Array.from({length: 50}, (_, i) => ({name: `P${i}`}));
    const education = Array.from({length: 10}, (_, i) => ({institution: `S${i}`}));
    const skills = Array.from({length: 100}, (_, i) => `Skill${i}`);
    const json = JSON.stringify({
      sections: [
        {type: 'experience', entries: experiences},
        {type: 'projects', entries: projects},
        {type: 'education', entries: education},
        {type: 'skills', data: {uncategorized: skills, groups: []}},
      ],
    });
    const content: ResumeContent = parseExtractionResponse(json);
    const get = (t: string) => content.sections.find(s => s.type === t) as ResumeSection;
    expect((get('experience') as any).entries.length).toBe(20);
    expect((get('projects') as any).entries.length).toBe(50);
    expect((get('education') as any).entries.length).toBe(10);
    expect((get('skills') as any).uncategorized.length).toBe(100);
  });

  it('throws on malformed JSON', () => {
    expect(() => parseExtractionResponse('{not json')).toThrow();
  });

  it('throws when there is no structured content and no unmapped text', () => {
    expect(() => parseExtractionResponse(JSON.stringify({sections: []}))).toThrow();
  });
});
