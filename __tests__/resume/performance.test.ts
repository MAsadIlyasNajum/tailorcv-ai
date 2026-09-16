import {
  addSection,
  addEntry,
  removeEntry,
  reorderEntries,
  reorderSections,
} from '../../src/utils/resume/contentMutators';
import {createSection, createExperienceEntry, createProjectEntry, createEducationEntry, createCertificationEntry, createSkillItem, createSkillGroup} from '../../src/utils/resume/sectionFactory';
import type {ResumeContent, ResumeSection} from '../../src/types/resume';

const baseContent = (): ResumeContent => ({sections: []});

describe('performance', () => {
  const buildLargeResume = (): ResumeContent => {
    let content = baseContent();
    const exp = createSection('experience', 0);
    const proj = createSection('projects', 1);
    const edu = createSection('education', 2);
    const skills = createSection('skills', 3);
    const certs = createSection('certifications', 4);
    content = addSection(content, exp);
    content = addSection(content, proj);
    content = addSection(content, edu);
    content = addSection(content, skills);
    content = addSection(content, certs);

    for (let i = 0; i < 20; i++) {
      content = addEntry(content, exp.id, createExperienceEntry(i));
    }
    for (let i = 0; i < 50; i++) {
      content = addEntry(content, proj.id, createProjectEntry(i));
    }
    for (let i = 0; i < 10; i++) {
      content = addEntry(content, edu.id, createEducationEntry(i));
    }
    for (let i = 0; i < 100; i++) {
      content = addEntry(content, certs.id, createCertificationEntry(i));
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

    for (let i = 0; i < 5; i++) {
      const group = createSkillGroup(`Group ${i}`);
      for (let j = 0; j < 10; j++) {
        content = {
          ...content,
          sections: content.sections.map(s =>
            s.type === 'skills'
              ? {...s, groups: [...s.groups, {...group, skills: [...group.skills, createSkillItem(`Skill ${i}-${j}`)]}]}
              : s,
          ),
        };
      }
    }

    for (let i = 0; i < 5; i++) {
      const custom = createSection('custom', content.sections.length + i, {title: `Custom ${i}`});
      const customData = (custom as any).data;
      customData.entries = Array.from({length: 10}, (_, k) => ({
        id: `custom-${i}-${k}`,
        title: `Item ${k}`,
        content: `Content ${k}`,
      }));
      content = addSection(content, custom);
    }

    return content;
  };

  it('addEntry completes in under 50ms', () => {
    const content = buildLargeResume();
    const section = content.sections.find(s => s.type === 'experience') as ResumeSection;
    const start = performance.now();
    const result = addEntry(content, section.id, createExperienceEntry(999));
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(50);
    expect((result.sections.find(s => s.type === 'experience') as any).entries).toHaveLength(21);
  });

  it('removeEntry completes in under 50ms', () => {
    const content = buildLargeResume();
    const section = content.sections.find(s => s.type === 'experience') as ResumeSection;
    const entryId = (section as any).entries[0].id;
    const start = performance.now();
    const result = removeEntry(content, section.id, entryId);
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(50);
    expect((result.sections.find(s => s.type === 'experience') as any).entries).toHaveLength(19);
  });

  it('reorderEntries completes in under 50ms', () => {
    const content = buildLargeResume();
    const section = content.sections.find(s => s.type === 'experience') as ResumeSection;
    const ids = (section as any).entries.map((e: any) => e.id).reverse();
    const start = performance.now();
    reorderEntries(content, section.id, ids);
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(50);
  });

  it('addSection completes in under 50ms', () => {
    const content = buildLargeResume();
    const start = performance.now();
    const result = addSection(content, createSection('experience', content.sections.length));
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(50);
    expect(result.sections).toHaveLength(content.sections.length + 1);
  });

  it('reorderSections completes in under 50ms', () => {
    const content = buildLargeResume();
    const ids = content.sections.map(s => s.id).reverse();
    const start = performance.now();
    reorderSections(content, ids);
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(50);
  });

  it('JSON round-trip completes in under 100ms', () => {
    const content = buildLargeResume();
    const start = performance.now();
    const json = JSON.stringify(content);
    const parsed = JSON.parse(json) as ResumeContent;
    const delta = performance.now() - start;
    expect(delta).toBeLessThan(100);
    expect(parsed.sections.length).toBe(content.sections.length);
  });
});
