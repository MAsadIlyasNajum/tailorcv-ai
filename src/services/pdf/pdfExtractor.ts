import {extractText} from 'react-native-pdf-text-extractor';

import {normalizeResumeText} from '../../utils/text/normalizeResumeText';

export const extractTextFromPdfFile = async (
  fileUri: string,
): Promise<string> => {
  if (!fileUri) {
    throw new Error('No PDF URI provided for extraction.');
  }

  try {
    const text = await extractText(fileUri);
    return normalizeResumeText(text);
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
};
