import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Card, Divider} from 'react-native-paper';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {pickResumePdf} from '../services/pdf/documentPicker';
import {extractTextFromPdfFile} from '../services/pdf/pdfExtractor';
import {useResumeStore} from '../store/useResumeStore';

export const UploadResumeScreen = (): React.JSX.Element => {
  const resumeText = useResumeStore(state => state.resumeText);
  const resumeMetadata = useResumeStore(state => state.resumeMetadata);
  const setResumeMetadata = useResumeStore(state => state.setResumeMetadata);
  const setResumeText = useResumeStore(state => state.setResumeText);
  const [isPicking, setIsPicking] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

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

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="Upload Resume" subtitle="PDF only" />
          <Card.Content>
            <PrimaryButton
              label={resumeMetadata ? 'Replace PDF' : 'Select PDF'}
              onPress={handlePickResume}
              loading={isPicking || isExtracting}
              disabled={isPicking || isExtracting}
            />

            <Divider style={styles.divider} />

            <Text style={styles.label}>Selected file</Text>
            <Text style={styles.fileInfo}>{fileSizeLabel}</Text>

            {extractionError ? (
              <Text style={styles.errorText}>{extractionError}</Text>
            ) : null}

            <Text style={styles.label}>Extracted resume text preview</Text>
            <Text style={styles.preview}>
              {resumeText || 'No extracted text available yet. Select a PDF to begin.'}
            </Text>
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
  preview: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    color: '#334155',
  },
});
