import BlobUtil from 'react-native-blob-util';

import {normalizeResumeText} from '../../utils/text/normalizeResumeText';

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
};

export const extractTextFromPdfFile = async (
  fileUri: string,
): Promise<string> => {
  if (!fileUri) {
    throw new Error('No PDF URI provided for extraction.');
  }

  let pdfjs: {
    GlobalWorkerOptions: {workerSrc?: string};
    getDocument: (config: {data: Uint8Array}) => {promise: Promise<any>};
  };

  try {
    pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs');
  } catch {
    return '';
  }

  if (pdfjs?.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
  }

  const base64 = await BlobUtil.fs.readFile(fileUri, 'base64');
  const data = base64ToUint8Array(base64);

  const loadingTask = pdfjs.getDocument({data});
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: {str?: string} | {str: string}) => ('str' in item ? item.str : ''))
      .join(' ');

    if (pageText.trim()) {
      pageTexts.push(pageText);
    }
  }

  const combinedText = pageTexts.join('\n');

  return normalizeResumeText(combinedText);
};
