import {TEMPLATES, DEFAULT_TEMPLATE_ID} from '../../src/templates/templateRegistry';
import type {ResumeContent, Resume} from '../../src/types/resume';

describe('templateRegistry', () => {
  const sampleContent: ResumeContent = {
    sections: [
      {
        id: 'pi',
        type: 'personalInfo',
        visible: true,
        order: 0,
        data: {
          fullName: 'Test User',
          emails: [{id: 'e1', value: 'test@example.com'}],
          phoneNumbers: [],
          addresses: [],
          links: [],
        },
      },
    ],
  };

  const sampleResume: Resume = {
    id: 'r1',
    name: 'Test Resume',
    sourceType: 'text',
    text: '',
    professionalExperiences: [],
    content: sampleContent,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUsedAt: Date.now(),
  };

  it('has exactly 3 templates', () => {
    expect(Object.keys(TEMPLATES)).toHaveLength(3);
  });

  it('DEFAULT_TEMPLATE_ID is classic', () => {
    expect(DEFAULT_TEMPLATE_ID).toBe('classic');
  });

  it('all templates have required properties', () => {
    for (const template of Object.values(TEMPLATES)) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(typeof template.render).toBe('function');
    }
  });

  it('render returns valid HTML document', () => {
    for (const template of Object.values(TEMPLATES)) {
      const html = template.render(sampleContent, sampleResume);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    }
  });

  it('does not mutate input content', () => {
    const contentBefore = JSON.stringify(sampleContent);
    for (const template of Object.values(TEMPLATES)) {
      template.render(sampleContent, sampleResume);
    }
    expect(JSON.stringify(sampleContent)).toBe(contentBefore);
  });

  it('does not mutate input resume', () => {
    const resumeBefore = JSON.stringify(sampleResume);
    for (const template of Object.values(TEMPLATES)) {
      template.render(sampleContent, sampleResume);
    }
    expect(JSON.stringify(sampleResume)).toBe(resumeBefore);
  });
});
