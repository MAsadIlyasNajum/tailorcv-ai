import {
  addSection,
  addEntry,
  removeEntry,
  reorderSections,
  reorderEntries,
  moveSkill,
  removeSkillGroup,
  mergeSections,
  moveContact,
  reorderSkillGroup,
  reorderSkill,
  updatePersonalInfo,
} from '../../src/utils/resume/contentMutators';
import {createSection, createExperienceEntry, createSkillGroup, createSkillItem} from '../../src/utils/resume/sectionFactory';
import type {ResumeContent} from '../../src/types/resume';

const baseContent = (): ResumeContent => ({sections: []});

describe('contentMutators', () => {
  it('adds sections and reorders them by id order', () => {
    let content = baseContent();
    const a = createSection('experience', 0);
    const b = createSection('education', 1);
    content = addSection(content, a);
    content = addSection(content, b);

    expect(content.sections.map(s => s.id)).toEqual([a.id, b.id]);

    content = reorderSections(content, [b.id, a.id]);
    expect(content.sections.map(s => s.id)).toEqual([b.id, a.id]);
    expect(content.sections[0].order).toBe(0);
    expect(content.sections[1].order).toBe(1);
  });

  it('adds, reorders, and removes entries within a section (no caps)', () => {
    let content = baseContent();
    const section = createSection('experience', 0);
    content = addSection(content, section);

    const e1 = createExperienceEntry(0);
    const e2 = createExperienceEntry(1);
    content = addEntry(content, section.id, e1);
    content = addEntry(content, section.id, e2);

    const exp = content.sections[0];
    if (exp.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(exp.entries.map(e => e.id)).toEqual([e1.id, e2.id]);

    content = reorderEntries(content, section.id, [e2.id, e1.id]);
    const reordered = content.sections[0];
    if (reordered.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(reordered.entries.map(e => e.id)).toEqual([e2.id, e1.id]);

    content = removeEntry(content, section.id, e2.id);
    const afterRemove = content.sections[0];
    if (afterRemove.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(afterRemove.entries.map(e => e.id)).toEqual([e1.id]);
  });

  it('handles a large dynamic resume without data loss', () => {
    let content = baseContent();
    const exp = createSection('experience', 0);
    const proj = createSection('projects', 1);
    const edu = createSection('education', 2);
    const skills = createSection('skills', 3);
    content = addSection(content, exp);
    content = addSection(content, proj);
    content = addSection(content, edu);
    content = addSection(content, skills);

    for (let i = 0; i < 20; i++) {
      content = addEntry(content, exp.id, createExperienceEntry(i));
    }
    for (let i = 0; i < 50; i++) {
      content = addEntry(content, proj.id, {
        id: `proj-${i}`,
        name: `Project ${i}`,
        order: i,
      });
    }
    for (let i = 0; i < 10; i++) {
      content = addEntry(content, edu.id, {
        id: `edu-${i}`,
        institution: `School ${i}`,
        order: i,
      });
    }
    for (let i = 0; i < 100; i++) {
      content = {
        ...content,
        sections: content.sections.map(s =>
          s.type === 'skills'
            ? {...s, uncategorized: [...s.uncategorized, createSkillItem(`Skill ${i}`)]}
            : s,
        ),
      };
    }

    const get = (type: string): {entries?: {id: string}[]; uncategorized?: {id: string}[]} => {
      const section = content.sections.find(s => s.type === type) as any;
      return section;
    };
    expect(get('experience').entries?.length).toBe(20);
    expect(get('projects').entries?.length).toBe(50);
    expect(get('education').entries?.length).toBe(10);
    expect(get('skills').uncategorized?.length).toBe(100);

    // reorder + delete must preserve the rest (no data loss at scale)
    const projEntries = (content.sections.find(s => s.type === 'projects') as any).entries as {id: string}[];
    const movedIds = [projEntries[projEntries.length - 1].id, ...projEntries.slice(0, -1).map(e => e.id)];
    content = reorderEntries(content, proj.id, movedIds);
    content = removeEntry(content, proj.id, (content.sections.find(s => s.type === 'projects') as any).entries[0].id);
    content = removeEntry(content, exp.id, (content.sections.find(s => s.type === 'experience') as any).entries[0].id);

    expect((content.sections.find(s => s.type === 'projects') as any).entries.length).toBe(49);
    expect((content.sections.find(s => s.type === 'experience') as any).entries.length).toBe(19);
    expect((content.sections.find(s => s.type === 'skills') as any).uncategorized.length).toBe(100);

    // simulate save/reload round-trip (no data silently disappears)
    const roundTripped = JSON.parse(JSON.stringify(content)) as ResumeContent;
    expect((roundTripped.sections.find(s => s.type === 'projects') as any).entries.length).toBe(49);
    expect((roundTripped.sections.find(s => s.type === 'skills') as any).uncategorized.length).toBe(100);
  });

  it('moves a skill between groups and to uncategorized', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);

    const group = createSkillGroup('Languages');
    const skill = createSkillItem('TypeScript');
    content = {
      ...content,
      sections: content.sections.map(s =>
        s.type === 'skills'
          ? {...s, groups: [group], uncategorized: [skill]}
          : s,
      ),
    };

    content = moveSkill(content, skills.id, skill.id, group.id);
    let s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.uncategorized).toHaveLength(0);
    expect(s.groups[0].skills.map(k => k.id)).toEqual([skill.id]);

    content = moveSkill(content, skills.id, skill.id, null);
    s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.uncategorized.map(k => k.id)).toEqual([skill.id]);
    expect(s.groups[0].skills).toHaveLength(0);
  });

  it('removes a skill group and preserves its skills in uncategorized', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    const group = createSkillGroup('Tools');
    const skill = createSkillItem('Git');
    content = {
      ...content,
      sections: content.sections.map(s =>
        s.type === 'skills' ? {...s, groups: [{...group, skills: [skill]}]} : s,
      ),
    };
    content = removeSkillGroup(content, skills.id, group.id);
    const s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.groups).toHaveLength(0);
    expect(s.uncategorized.map(k => k.id)).toEqual([skill.id]);
  });

  it('merges AI experience entries with existing entries (preserve + append)', () => {
    const existing = createSection('experience', 0);
    const existingEntries = (existing as any).entries as any[];
    existingEntries.push({id: 'e1', company: 'Old Co', role: 'Dev', startDate: '', endDate: null, isCurrent: false, summary: '', responsibilities: [], achievements: [], technologies: [], links: [], order: 0});

    const proposed = createSection('experience', 1);
    const proposedEntries = (proposed as any).entries as any[];
    proposedEntries.push({id: 'ai1', company: 'AI Co', role: 'AI Role', startDate: '', endDate: null, isCurrent: false, summary: '', responsibilities: [], achievements: [], technologies: [], links: [], order: 0});

    const merged = mergeSections(existing, proposed);
    if (merged.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(merged.entries).toHaveLength(2);
    expect(merged.entries[0].id).toBe('e1');
    expect(merged.entries[1].company).toBe('AI Co');
    expect(merged.entries[1].id).not.toBe('ai1');
  });

  it('merges AI skills with deduplication by name (case-insensitive)', () => {
    const existing = createSection('skills', 0);
    const existingSkills = existing as any;
    existingSkills.groups = [createSkillGroup('Languages')];
    existingSkills.uncategorized = [createSkillItem('JavaScript')];

    const proposed = createSection('skills', 1);
    const proposedSkills = proposed as any;
    proposedSkills.groups = [createSkillGroup('Languages'), createSkillGroup('Frameworks')];
    proposedSkills.uncategorized = [createSkillItem('javascript'), createSkillItem('Python')];

    const merged = mergeSections(existing, proposed);
    if (merged.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(merged.uncategorized).toHaveLength(2);
    expect(merged.uncategorized.map(s => s.name)).toContain('JavaScript');
    expect(merged.uncategorized.map(s => s.name)).toContain('Python');
    expect(merged.groups).toHaveLength(2);
    expect(merged.groups[0].skills).toHaveLength(0);
    expect(merged.groups[1].skills).toHaveLength(0);
  });

  it('merges AI personalInfo without wiping empty fields', () => {
    const existing = createSection('personalInfo', 0);
    const existingData = (existing as any).data as any;
    existingData.fullName = 'Jane Doe';
    existingData.emails = [{id: 'e1', value: 'jane@example.com'}];
    existingData.phoneNumbers = [];
    existingData.addresses = [];
    existingData.links = [];

    const proposed = createSection('personalInfo', 1);
    const proposedData = (proposed as any).data as any;
    proposedData.fullName = '';
    proposedData.emails = [];
    proposedData.phoneNumbers = [{id: 'ai1', value: '555'}];
    proposedData.addresses = [];
    proposedData.links = [];

    const merged = mergeSections(existing, proposed);
    if (merged.type !== 'personalInfo') {
      throw new Error('expected personalInfo');
    }
    expect(merged.data.fullName).toBe('Jane Doe');
    expect((merged.data as any).emails).toHaveLength(1);
    expect((merged.data as any).phoneNumbers).toHaveLength(1);
  });

  it('leaves custom sections with different titles untouched', () => {
    const existing = createSection('custom', 0);
    (existing as any).title = 'Languages';
    (existing as any).data = {content: 'Spanish', entries: []};

    const proposed = createSection('custom', 1);
    (proposed as any).title = 'Awards';
    (proposed as any).data = {content: 'Nobel', entries: []};

    const merged = mergeSections(existing, proposed);
    if (merged.type !== 'custom') {
      throw new Error('expected custom');
    }
    expect(merged.title).toBe('Languages');
    expect((merged.data as any).content).toBe('Spanish');
  });

  it('moves a contact up and down within personalInfo', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);
    content = updatePersonalInfo(content, pi.id, {
      emails: [
        {id: 'e1', value: 'a@example.com'},
        {id: 'e2', value: 'b@example.com'},
        {id: 'e3', value: 'c@example.com'},
      ],
    });
    content = moveContact(content, pi.id, 1, 1);
    const s = content.sections[0];
    if (s.type !== 'personalInfo') {
      throw new Error('expected personalInfo');
    }
    expect((s.data as any).emails[1].value).toBe('c@example.com');
    expect((s.data as any).emails[2].value).toBe('b@example.com');

    content = moveContact(content, pi.id, 2, -1);
    const s2 = content.sections[0];
    if (s2.type !== 'personalInfo') {
      throw new Error('expected personalInfo');
    }
    expect((s2.data as any).emails[1].value).toBe('b@example.com');
    expect((s2.data as any).emails[2].value).toBe('c@example.com');
  });

  it('reorders skill groups up and down', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    content = {
      ...content,
      sections: content.sections.map(s =>
        s.type === 'skills'
          ? {...s, groups: [createSkillGroup('A'), createSkillGroup('B'), createSkillGroup('C')]}
          : s,
      ),
    };
    content = reorderSkillGroup(content, skills.id, (content.sections[0] as any).groups[1].id, -1);
    const s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.groups[0].title).toBe('B');
    expect(s.groups[1].title).toBe('A');
  });

  it('reorders skills within a group and within uncategorized', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    const group = createSkillGroup('Lang');
    const s1 = createSkillItem('A');
    const s2 = createSkillItem('B');
    const s3 = createSkillItem('C');
    const u1 = createSkillItem('X');
    const u2 = createSkillItem('Y');
    content = {
      ...content,
      sections: content.sections.map(s =>
        s.type === 'skills'
          ? {...s, groups: [{...group, skills: [s1, s2, s3]}], uncategorized: [u1, u2]}
          : s,
      ),
    };
    content = reorderSkill(content, skills.id, group.id, s2.id, 1);
    let s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.groups[0].skills.map(k => k.name)).toEqual(['A', 'C', 'B']);

    content = reorderSkill(content, skills.id, null, u1.id, 1);
    s = content.sections[0];
    if (s.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(s.uncategorized.map(k => k.name)).toEqual(['Y', 'X']);
  });
});
