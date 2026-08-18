import DocumentPicker, {
  isCancel,
  types,
  type DocumentPickerResponse,
} from 'react-native-document-picker';

export const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface ResumeFileMetadata {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  extension: string;
  selectedAt: string;
}

export type ResumeFileInput = Pick<
  DocumentPickerResponse,
  'name' | 'size' | 'type' | 'uri'
>;

export const createResumeMetadata = (
  file: ResumeFileInput,
): ResumeFileMetadata => {
  const fileName = file.name ?? 'resume.pdf';
  const extension = fileName.split('.').pop()?.toLowerCase() ?? 'pdf';

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: fileName,
    uri: file.uri ?? '',
    size: file.size ?? 0,
    mimeType: file.type ?? 'application/pdf',
    extension,
    selectedAt: new Date().toISOString(),
  };
};

export const validateResumeFile = (
  file: Pick<ResumeFileMetadata, 'name' | 'size' | 'mimeType' | 'extension'>,
): boolean => {
  const normalizedName = file.name.toLowerCase();
  const normalizedMime = file.mimeType.toLowerCase();
  const hasPdfExtension = normalizedName.endsWith('.pdf');
  const hasPdfMime =
    normalizedMime === 'application/pdf' || normalizedMime === 'application/octet-stream';
  const hasValidSize = file.size > 0 && file.size <= MAX_RESUME_FILE_SIZE_BYTES;

  return (
    (hasPdfExtension || file.extension === 'pdf') &&
    hasPdfMime &&
    hasValidSize
  );
};

export const pickResumePdf = async (): Promise<ResumeFileMetadata | null> => {
  try {
    const result = await DocumentPicker.pickSingle({
      type: [types.pdf],
      copyTo: 'cachesDirectory',
    });

    const metadata = createResumeMetadata(result);

    if (!validateResumeFile(metadata)) {
      throw new Error(
        'Selected file must be a valid PDF under 10MB.',
      );
    }

    return metadata;
  } catch (error) {
    if (isCancel(error)) {
      return null;
    }

    throw error;
  }
};
