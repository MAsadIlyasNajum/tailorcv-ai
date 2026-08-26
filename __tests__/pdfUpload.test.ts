jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  default: {
    pickSingle: jest.fn(),
  },
  isErrorWithCode: jest.fn(),
  keepLocalCopy: jest.fn(),
  types: {
    pdf: 'com.adobe.pdf',
  },
}));

import {createResumeMetadata, validateResumeFile} from '../src/services/pdf/documentPicker';

describe('PDF upload validation', () => {
  it('accepts a valid PDF file', () => {
    const metadata = createResumeMetadata({
      name: 'resume.pdf',
      size: 512000,
      type: 'application/pdf',
      uri: 'file:///tmp/resume.pdf',
    });

    expect(metadata).toMatchObject({
      name: 'resume.pdf',
      extension: 'pdf',
      mimeType: 'application/pdf',
    });
    expect(validateResumeFile(metadata)).toBe(true);
  });

  it('rejects non-PDF files and oversized documents', () => {
    const invalidPdf = createResumeMetadata({
      name: 'resume.png',
      size: 200,
      type: 'image/png',
      uri: 'file:///tmp/resume.png',
    });

    expect(validateResumeFile(invalidPdf)).toBe(false);

    const oversized = createResumeMetadata({
      name: 'large.pdf',
      size: 15 * 1024 * 1024,
      type: 'application/pdf',
      uri: 'file:///tmp/large.pdf',
    });

    expect(validateResumeFile(oversized)).toBe(false);
  });
});
