import {
  addSection,
  addSkillGroup,
  addSkill,
  moveSkill,
  reorderSkillGroup,
  reorderSkill,
} from '../../src/utils/resume/contentMutators';
import {createSection} from '../../src/utils/resume/sectionFactory';
import type {ResumeContent} from '../../src/types/resume';

const baseContent = (): ResumeContent => ({sections: []});

describe('skillsOperations', () => {
  it('reorders skill groups up and down', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    content = addSkillGroup(content, skills.id, 'A');
    content = addSkillGroup(content, skills.id, 'B');
    content = addSkillGroup(content, skills.id, 'C');

    const s = content.sections[0];
    if (s.type !== 'skills') throw new Error('expected skills');
    const groupB = s.groups[1];
    content = reorderSkillGroup(content, skills.id, groupB.id, -1);

    const s2 = content.sections[0];
    if (s2.type !== 'skills') throw new Error('expected skills');
    expect(s2.groups[0].title).toBe('B');
    expect(s2.groups[1].title).toBe('A');
  });

  it('reorders skills within a group', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    content = addSkillGroup(content, skills.id, 'Lang');
    const s = content.sections[0];
    if (s.type !== 'skills') throw new Error('expected skills');
    const groupId = s.groups[0].id;
    content = addSkill(content, skills.id, 'A', groupId);
    content = addSkill(content, skills.id, 'B', groupId);
    content = addSkill(content, skills.id, 'C', groupId);

    const s2 = content.sections[0];
    if (s2.type !== 'skills') throw new Error('expected skills');
    const skillB = s2.groups[0].skills[1];
    content = reorderSkill(content, skills.id, groupId, skillB.id, 1);

    const s3 = content.sections[0];
    if (s3.type !== 'skills') throw new Error('expected skills');
    expect(s3.groups[0].skills.map(k => k.name)).toEqual(['A', 'C', 'B']);
  });

  it('reorders skills in uncategorized', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    content = addSkill(content, skills.id, 'X');
    content = addSkill(content, skills.id, 'Y');
    content = addSkill(content, skills.id, 'Z');

    const s = content.sections[0];
    if (s.type !== 'skills') throw new Error('expected skills');
    const skillY = s.uncategorized[1];
    content = reorderSkill(content, skills.id, null, skillY.id, 1);

    const s2 = content.sections[0];
    if (s2.type !== 'skills') throw new Error('expected skills');
    expect(s2.uncategorized.map(k => k.name)).toEqual(['X', 'Z', 'Y']);
  });

  it('moves skills between groups', () => {
    let content = baseContent();
    const skills = createSection('skills', 0);
    content = addSection(content, skills);
    content = addSkillGroup(content, skills.id, 'Lang');
    content = addSkillGroup(content, skills.id, 'Tools');
    const s = content.sections[0];
    if (s.type !== 'skills') throw new Error('expected skills');
    const group1 = s.groups[0].id;
    const group2 = s.groups[1].id;
    content = addSkill(content, skills.id, 'TS', group1);

    const s2 = content.sections[0];
    if (s2.type !== 'skills') throw new Error('expected skills');
    const ts = s2.groups[0].skills[0];
    content = moveSkill(content, skills.id, ts.id, group2);

    const s3 = content.sections[0];
    if (s3.type !== 'skills') throw new Error('expected skills');
    expect(s3.groups[0].skills).toHaveLength(0);
    expect(s3.groups[1].skills.map(k => k.name)).toEqual(['TS']);
  });
});
