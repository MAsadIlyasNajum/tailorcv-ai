import {validateProfessionalExperience} from '../src/utils/validation/experienceValidation';

describe('validateProfessionalExperience', () => {
  it('rejects missing required role data', () => {
    expect(
      validateProfessionalExperience({
        jobTitle: '',
        company: '',
        summary: '',
        startDate: '',
        endDate: null,
        bulletPoints: [],
      }),
    ).toMatchObject({valid: false});
  });

  it('accepts a valid current role with achievements', () => {
    expect(
      validateProfessionalExperience({
        jobTitle: 'Senior Software Engineer',
        company: 'Acme Labs',
        summary: 'Led mobile product work for a B2B platform redesign.',
        startDate: '2023-01',
        endDate: null,
        isCurrentRole: true,
        bulletPoints: ['Improved app performance by 24%.', 'Shipped feature adoption across Android and iOS.'],
      }),
    ).toMatchObject({valid: true});
  });

  it('requires end date when role is not current', () => {
    expect(
      validateProfessionalExperience({
        jobTitle: 'Frontend Engineer',
        company: 'Northwind',
        summary: 'Built internal dashboards for operations teams.',
        startDate: '2020-03',
        endDate: '',
        isCurrentRole: false,
        bulletPoints: ['Improved reporting workflow.'],
      }),
    ).toMatchObject({valid: false});
  });
});
