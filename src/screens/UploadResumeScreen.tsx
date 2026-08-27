import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Card, Divider, TextInput} from 'react-native-paper';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {pickResumePdf} from '../services/pdf/documentPicker';
import {extractTextFromPdfFile} from '../services/pdf/pdfExtractor';
import {normalizeResumeText} from '../utils/text/normalizeResumeText';
import {useResumeStore} from '../store/useResumeStore';

const MIN_PASTED_RESUME_LENGTH = 50;

export const UploadResumeScreen = (): React.JSX.Element => {
  const resumeText = useResumeStore(state => state.resumeText);
  const resumeMetadata = useResumeStore(state => state.resumeMetadata);
  const setResumeMetadata = useResumeStore(state => state.setResumeMetadata);
  const setResumeText = useResumeStore(state => state.setResumeText);
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

      setResumeMetadata(selectedFile);
      setIsExtracting(true);

      const extractedText = await extractTextFromPdfFile(selectedFile.uri);

      if (!extractedText || extractedText.trim().length === 0) {
        setExtractionError(
          'The PDF was selected but no readable text was found. Please try another resume file.',
        );
        setResumeText('');
        return;
      }

      setResumeText(extractedText);
    } catch (error) {
      setResumeText('');
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

    setResumeText(normalized);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="Add Resume" subtitle="Upload a PDF or paste your resume text" />
          <Card.Content>
            <PrimaryButton
              label={resumeMetadata ? 'Replace PDF' : 'Select PDF'}
              onPress={handlePickResume}
              loading={isPicking || isExtracting}
              disabled={isPicking || isExtracting}
            />

            <Divider style={styles.divider} />

            <Text style={styles.label}>Or paste resume text</Text>
            <TextInput
              mode="outlined"
              multiline
              value={pastedResume}
              onChangeText={value => {
                setPastedResume(value);
                setPasteError(null);
              }}
              placeholder="Paste your full resume text here..."
              numberOfLines={8}
              style={styles.pasteInput}
              onFocus={() => setPasteError(null)}
              autoCapitalize="sentences"
              textAlignVertical="top"
              contentStyle={styles.pasteInputContent}
            />
            {pasteError ? (
              <Text style={styles.errorText}>{pasteError}</Text>
            ) : null}
            <PrimaryButton
              label="Use pasted resume"
              onPress={handleUsePastedResume}
              disabled={!pastedResume.trim()}
            />

            <Divider style={styles.divider} />

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
          </Card.Content>
        </Card>
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
