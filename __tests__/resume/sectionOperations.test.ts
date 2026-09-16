import {
  addSection,
  removeSection,
  reorderSections,
  setSectionVisible,
  renameSection,
} from '../../src/utils/resume/contentMutators';
import {createSection} from '../../src/utils/resume/sectionFactory';
import type {ResumeContent} from '../../src/types/resume';

const baseContent = (): ResumeContent => ({sections: []});

describe('sectionOperations', () => {
  it('adds and removes sections', () => {
    let content = baseContent();
    const exp = createSection('experience', 0);
    content = addSection(content, exp);
    expect(content.sections).toHaveLength(1);
    expect(content.sections[0].type).toBe('experience');

    content = removeSection(content, exp.id);
    expect(content.sections).toHaveLength(0);
  });

  it('reorders sections by id array', () => {
    let content = baseContent();
    const a = createSection('education', 0);
    const b = createSection('experience', 1);
    content = addSection(content, a);
    content = addSection(content, b);

    content = reorderSections(content, [b.id, a.id]);
    expect(content.sections.map(s => s.type)).toEqual(['experience', 'education']);
    expect(content.sections[0].order).toBe(0);
    expect(content.sections[1].order).toBe(1);
  });

  it('toggles section visibility', () => {
    let content = baseContent();
    const section = createSection('experience', 0);
    content = addSection(content, section);

    content = setSectionVisible(content, section.id, false);
    expect((content.sections[0] as any).visible).toBe(false);

    content = setSectionVisible(content, section.id, true);
    expect((content.sections[0] as any).visible).toBe(true);
  });

  it('renames custom sections', () => {
    let content = baseContent();
    const section = createSection('custom', 0, {title: 'Languages'});
    content = addSection(content, section);

    content = renameSection(content, section.id, 'New Title');
    expect((content.sections[0] as any).title).toBe('New Title');
  });

  it('does not rename non-custom sections', () => {
    let content = baseContent();
    const section = createSection('experience', 0);
    content = addSection(content, section);

    content = renameSection(content, section.id, 'New Title');
    expect((content.sections[0] as any).title).toBeUndefined();
  });

  it('adds preset custom sections with deduplication', () => {
    let content = baseContent();
    const lang = createSection('custom', 0, {title: 'Languages'});
    content = addSection(content, lang);

    const lang2 = createSection('custom', 1, {title: 'Languages'});
    content = addSection(content, lang2);

    const customSections = content.sections.filter(s => s.type === 'custom');
    expect(customSections).toHaveLength(2);
  });

  it('adds duplicate sections of the same type', () => {
    let content = baseContent();
    const exp = createSection('experience', 0);
    content = addSection(content, exp);
    content = addSection(content, createSection('experience', 1));
    expect(content.sections.filter(s => s.type === 'experience')).toHaveLength(2);
  });

  it('removes a section and preserves others', () => {
    let content = baseContent();
    const a = createSection('experience', 0);
    const b = createSection('education', 1);
    content = addSection(content, a);
    content = addSection(content, b);

    content = removeSection(content, a.id);
    expect(content.sections).toHaveLength(1);
    expect(content.sections[0].type).toBe('education');
  });
});
