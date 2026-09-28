import {updatePersonalInfo, moveContact, addSection} from '../../src/utils/resume/contentMutators';
import {createSection} from '../../src/utils/resume/sectionFactory';
import {deriveFullNameFromParts} from '../../src/components/resumeEditor/PersonalInfoSection';
import type {ResumeContent} from '../../src/types/resume';

const baseContent = (): ResumeContent => ({sections: []});

describe('personalInfo', () => {
  it('updates personalInfo fields via the mutator', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);

    content = updatePersonalInfo(content, pi.id, {fullName: 'Jane Doe'});
    const data = (content.sections[0] as any).data;
    expect(data.fullName).toBe('Jane Doe');
  });

  it('stores firstName and lastName when provided', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);

    content = updatePersonalInfo(content, pi.id, {firstName: 'Jane', lastName: 'Doe'});
    const data = (content.sections[0] as any).data;
    expect(data.firstName).toBe('Jane');
    expect(data.lastName).toBe('Doe');
  });

  it('does not derive fullName from firstName/lastName in the mutator', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);

    content = updatePersonalInfo(content, pi.id, {firstName: 'Jane', lastName: 'Doe'});
    const data = (content.sections[0] as any).data;
    expect(data.fullName).toBeUndefined();
  });

  it('preserves existing fields when patching', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);
    content = updatePersonalInfo(content, pi.id, {
      fullName: 'Jane Doe',
      emails: [{id: 'e1', value: 'jane@example.com'}],
    });

    content = updatePersonalInfo(content, pi.id, {fullName: 'Jane Smith'});
    const data = (content.sections[0] as any).data;
    expect(data.fullName).toBe('Jane Smith');
    expect(data.emails).toHaveLength(1);
    expect(data.emails[0].value).toBe('jane@example.com');
  });

  it('supports multiple contacts and reorder', () => {
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

    content = moveContact(content, pi.id, 0, 1);
    let data = (content.sections[0] as any).data;
    expect(data.emails[0].value).toBe('b@example.com');
    expect(data.emails[1].value).toBe('a@example.com');
    expect(data.emails[2].value).toBe('c@example.com');

    content = moveContact(content, pi.id, 2, -1);
    data = (content.sections[0] as any).data;
    expect(data.emails[1].value).toBe('c@example.com');
    expect(data.emails[2].value).toBe('a@example.com');
  });

  it('derives fullName from first and last name in the UI helper', () => {
    expect(deriveFullNameFromParts('Jane', 'Doe')).toBe('Jane Doe');
    expect(deriveFullNameFromParts('', '')).toBe('');
    expect(deriveFullNameFromParts('Jane', '')).toBe('Jane');
    expect(deriveFullNameFromParts('', 'Doe')).toBe('Doe');
    expect(deriveFullNameFromParts(undefined, undefined)).toBe('');
  });

  it('preserves legacy fullName when first/last are absent', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);
    content = updatePersonalInfo(content, pi.id, {fullName: 'Jane Doe'});
    const data = (content.sections[0] as any).data;
    expect(data.fullName).toBe('Jane Doe');
    expect(data.firstName).toBeUndefined();
    expect(data.lastName).toBeUndefined();
  });

  it('editing fullName directly does not populate firstName/lastName', () => {
    let content = baseContent();
    const pi = createSection('personalInfo', 0);
    content = addSection(content, pi);
    content = updatePersonalInfo(content, pi.id, {fullName: 'Jane Doe'});
    const data = (content.sections[0] as any).data;
    expect(data.fullName).toBe('Jane Doe');
    expect(data.firstName).toBeUndefined();
    expect(data.lastName).toBeUndefined();
  });

  it('UI fullName lifecycle: enter first/last, clear first, clear last, no stale fullName', () => {
    // Simulate the UI handleNameChange behavior
    let data: Record<string, unknown> = {};

    // Step 1: user enters first and last name
    let next = {...data, firstName: 'John', lastName: 'Smith'};
    next.fullName = deriveFullNameFromParts(next.firstName, next.lastName);
    data = next;
    expect(data.fullName).toBe('John Smith');

    // Step 2: user clears first name
    next = {...data, firstName: ''};
    next.fullName = deriveFullNameFromParts(next.firstName, next.lastName);
    data = next;
    expect(data.fullName).toBe('Smith');

    // Step 3: user clears last name
    next = {...data, lastName: ''};
    next.fullName = deriveFullNameFromParts(next.firstName, next.lastName);
    data = next;
    expect(data.fullName).toBe('');
  });
});
