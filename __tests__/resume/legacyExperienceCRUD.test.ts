import {useResumeStore} from '../../src/store/useResumeStore';
import type {ProfessionalExperience} from '../../src/types/resume';

const createLegacyResume = (): string => {
  const id = useResumeStore.getState().createEmptyResume();
  return id;
};

const findResume = (id: string) => useResumeStore.getState().resumes.find(r => r.id === id)!;

describe('legacy professionalExperiences CRUD', () => {
  beforeEach(() => {
    useResumeStore.getState().clearAll();
  });

  it('addProfessionalExperience updates legacy array only, not content.sections', () => {
    const resumeId = createLegacyResume();
    const experience: ProfessionalExperience = {
      id: 'legacy-1',
      jobTitle: 'Engineer',
      company: 'Acme',
      location: 'NYC',
      startDate: '2020-01',
      endDate: '2021-01',
      isCurrentRole: false,
      summary: 'Built things.',
      bulletPoints: ['Shipped APIs'],
      keywords: ['Node.js'],
      generatedSuggestions: [],
    };

    useResumeStore.getState().addProfessionalExperience(experience);
    const resume = findResume(resumeId);

    expect(resume.professionalExperiences).toHaveLength(1);
    expect(resume.professionalExperiences[0].id).toBe('legacy-1');
    expect(resume.content?.sections.find(s => s.type === 'experience')).toBeUndefined();
  });

  it('updateProfessionalExperience modifies legacy array only', () => {
    const resumeId = createLegacyResume();
    useResumeStore.getState().addProfessionalExperience({
      id: 'legacy-1',
      jobTitle: 'Engineer',
      company: 'Acme',
      location: '',
      startDate: '',
      endDate: null,
      isCurrentRole: false,
      summary: '',
      bulletPoints: [],
      keywords: [],
      generatedSuggestions: [],
    });

    useResumeStore.getState().updateProfessionalExperience('legacy-1', {
      jobTitle: 'Senior Engineer',
    });

    const resume = findResume(resumeId);
    expect(resume.professionalExperiences[0].jobTitle).toBe('Senior Engineer');
    expect(resume.content?.sections.find(s => s.type === 'experience')).toBeUndefined();
  });

  it('removeProfessionalExperience removes from legacy array only', () => {
    const resumeId = createLegacyResume();
    useResumeStore.getState().addProfessionalExperience({
      id: 'legacy-1',
      jobTitle: 'Engineer',
      company: 'Acme',
      location: '',
      startDate: '',
      endDate: null,
      isCurrentRole: false,
      summary: '',
      bulletPoints: [],
      keywords: [],
      generatedSuggestions: [],
    });

    useResumeStore.getState().removeProfessionalExperience('legacy-1');
    const resume = findResume(resumeId);
    expect(resume.professionalExperiences).toHaveLength(0);
  });

  it('modern structured editor does not use legacy CRUD', () => {
    // Verify that the modern editor path (updateResumeContent) does not
    // touch professionalExperiences.
    const resumeId = createLegacyResume();
    const store = useResumeStore.getState();

    store.updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'structured-exp',
          type: 'experience',
          visible: true,
          order: prev.sections.length,
          entries: [
            {
              id: 'se1',
              company: 'Structured Co',
              role: 'Dev',
              startDate: '',
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as any,
      ],
    }));

    const resume = findResume(resumeId);
    expect(resume.content?.sections.some(s => s.type === 'experience')).toBe(true);
    expect(resume.professionalExperiences).toHaveLength(0);
  });
});
