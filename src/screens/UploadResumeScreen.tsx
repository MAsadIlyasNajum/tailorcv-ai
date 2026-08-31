import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {AppCard, AppDivider, AppTextInput} from '../components';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {pickResumePdf} from '../services/pdf/documentPicker';
import {extractTextFromPdfFile} from '../services/pdf/pdfExtractor';
import {normalizeResumeText} from '../utils/text/normalizeResumeText';
import {useResumeStore} from '../store/useResumeStore';
import {trackEvent} from '../services/analytics/analytics';

const MIN_PASTED_RESUME_LENGTH = 50;

export const UploadResumeScreen = (): React.JSX.Element => {
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const addResume = useResumeStore(state => state.addResume);
  const updateResume = useResumeStore(state => state.updateResume);
  const setCurrentResume = useResumeStore(state => state.setCurrentResume);

  const currentResume = useMemo(
    () => resumes.find(r => r.id === currentResumeId) ?? null,
    [resumes, currentResumeId],
  );

  const resumeText = currentResume?.text ?? '';
  const resumeMetadata = useMemo(() => currentResume?.metadata
    ? {
        id: currentResume.id,
        name: currentResume.metadata.fileName ?? currentResume.name,
        uri: currentResume.metadata.uri ?? '',
        size: currentResume.metadata.fileSize ?? 0,
        mimeType: currentResume.metadata.mimeType ?? 'application/pdf',
        extension: currentResume.metadata.extension ?? 'pdf',
        selectedAt: new Date(currentResume.createdAt).toISOString(),
      }
    : null, [currentResume]);

  const [isPicking, setIsPicking] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [pastedResume, setPastedResume] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const fileSizeLabel = useMemo(() => {
    if (!resumeMetadata) {
      return 'No PDF selected yet.';
    }

    const sizeInMb = (resumeMetadata.size / (1024 * 1024)).toFixed(2);
    return `${resumeMetadata.name} • ${sizeInMb} MB`;
  }, [resumeMetadata]);

  const handlePickResume = async (): Promise<void> => {
    try {
      setIsPicking(true);
      setExtractionError(null);
      const selectedFile = await pickResumePdf();

      if (!selectedFile) {
        return;
      }

      const extractedText = await extractTextFromPdfFile(selectedFile.uri);

      if (!extractedText || extractedText.trim().length === 0) {
        setExtractionError(
          'The PDF was selected but no readable text was found. Please try another resume file.',
        );
        return;
      }

      if (currentResume) {
        updateResume(currentResume.id, {
          text: extractedText,
          sourceType: 'pdf',
          metadata: {
            uri: selectedFile.uri,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.mimeType,
            extension: selectedFile.extension,
          },
          updatedAt: Date.now(),
          lastUsedAt: Date.now(),
        });
      } else {
        const newResume = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: selectedFile.name,
          sourceType: 'pdf' as const,
          text: extractedText,
          metadata: {
            uri: selectedFile.uri,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.mimeType,
            extension: selectedFile.extension,
          },
          professionalExperiences: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastUsedAt: Date.now(),
        };
        addResume(newResume);
        setCurrentResume(newResume.id);
        trackEvent('resume_added', {sourceType: 'pdf'});
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to read the selected PDF. Please try another file.';

      setExtractionError(message);
      Alert.alert('Resume extraction issue', message);
    } finally {
      setIsPicking(false);
      setIsExtracting(false);
    }
  };

  const handleUsePastedResume = (): void => {
    setPasteError(null);

    const normalized = normalizeResumeText(pastedResume);
    if (normalized.trim().length < MIN_PASTED_RESUME_LENGTH) {
      setPasteError(
        'Pasted resume text is too short. Please paste your full resume text.',
      );
      return;
    }

    if (currentResume) {
      updateResume(currentResume.id, {
        text: normalized,
        sourceType: 'text',
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
      });
    } else {
      const newResume = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: 'My Resume',
        sourceType: 'text' as const,
        text: normalized,
        metadata: undefined,
        professionalExperiences: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
      };
      addResume(newResume);
      setCurrentResume(newResume.id);
      trackEvent('resume_added', {sourceType: 'text'});
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard style={styles.card}>
          <AppCard.Title title="Add Resume" subtitle="Upload a PDF or paste your resume text" />
          <AppCard.Content>
            <PrimaryButton
              label={resumeMetadata ? 'Replace PDF' : 'Select PDF'}
              onPress={handlePickResume}
              loading={isPicking || isExtracting}
              disabled={isPicking || isExtracting}
            />

            <AppDivider style={styles.divider} />

            <Text style={styles.label}>Or paste resume text</Text>
            <AppTextInput
              multiline
              value={pastedResume}
              onChangeText={value => {
                setPastedResume(value);
                setPasteError(null);
              }}
              placeholder="Paste your full resume text here..."
              numberOfLines={8}
              style={styles.pasteInput}
              autoFocus={false}
              autoCapitalize="sentences"
            />
            {pasteError ? (
              <Text style={styles.errorText}>{pasteError}</Text>
            ) : null}
            <PrimaryButton
              label="Use pasted resume"
              onPress={handleUsePastedResume}
              disabled={!pastedResume.trim()}
            />

            <AppDivider style={styles.divider} />

            <Text style={styles.label}>Selected file</Text>
            <Text style={styles.fileInfo}>{fileSizeLabel}</Text>

            {extractionError ? (
              <Text style={styles.errorText}>{extractionError}</Text>
            ) : null}

            {resumeText ? (
              <View style={styles.extractedSection}>
                <Text style={styles.extractedHeader}>Resume successfully processed.</Text>
                <PrimaryButton
                  label={showExtractedText ? 'Hide extracted text' : 'View extracted text'}
                  onPress={() => setShowExtractedText(value => !value)}
                  fullWidth={false}
                />
                {showExtractedText ? (
                  <Text style={styles.extractedPreview}>{resumeText}</Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.hintText}>
                Select a PDF or paste your resume text above to begin.
              </Text>
            )}
          </AppCard.Content>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
  },
  divider: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  fileInfo: {
    fontSize: 14,
    color: '#334155',
    marginTop: 6,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#B91C1C',
    marginTop: 8,
    marginBottom: 8,
  },
  pasteInput: {
    backgroundColor: '#FFFFFF',
    minHeight: 160,
  },
  pasteInputContent: {
    minHeight: 160,
    paddingTop: 12,
    paddingBottom: 12,
  },
  extractedSection: {
    marginTop: 12,
    gap: 8,
  },
  extractedHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  extractedPreview: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginTop: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 8,
  },
});
