import {addSection, addEntry, removeEntry, reorderSections, reorderEntries, moveSkill, removeSkillGroup} from '../../src/utils/resume/contentMutators';
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
});
