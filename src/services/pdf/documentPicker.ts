import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';

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
    normalizedMime === 'application/pdf' ||
    normalizedMime === 'application/octet-stream';
  const hasValidSize =
    file.size > 0 && file.size <= MAX_RESUME_FILE_SIZE_BYTES;

  return (
    (hasPdfExtension || file.extension === 'pdf') &&
    hasPdfMime &&
    hasValidSize
  );
};

export const pickResumePdf = async (): Promise<ResumeFileMetadata | null> => {
  try {
    const [result] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
    });

    if (!result) {
      return null;
    }

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri: result.uri,
          fileName: result.name ?? 'resume.pdf',
        },
      ],
      destination: 'cachesDirectory',
    });

    if (localCopy.status !== 'success') {
      throw new Error(
        localCopy.copyError ?? 'Failed to copy the selected PDF to cache.',
      );
    }

    const metadata = createResumeMetadata({
      ...result,
      uri: localCopy.localUri,
    });

    if (!validateResumeFile(metadata)) {
      throw new Error('Selected file must be a valid PDF under 10MB.');
    }

    return metadata;
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === errorCodes.OPERATION_CANCELED
    ) {
      return null;
    }

    throw error;
  }
};