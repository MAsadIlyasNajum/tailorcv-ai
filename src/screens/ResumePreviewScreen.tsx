import React from 'react';
import {Alert, ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView} from 'react-native-webview';
import {AppButton} from '../components/index';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {TEMPLATES, DEFAULT_TEMPLATE_ID} from '../templates/templateRegistry';
import {exportResumeToPdf} from '../services/pdf/resumePdfExporter';
import {ensureContent} from '../utils/resume/contentMutators';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_PREVIEW>;

const TEMPLATE_IDS = [DEFAULT_TEMPLATE_ID, 'modern', 'europass'] as const;

export const ResumePreviewScreen = ({route}: Props): React.ReactElement => {
  const navigation = useNavigation();
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);
  const updateResume = useResumeStore(state => state.updateResume);

  const [templateId, setTemplateId] = React.useState(resume?.templateId ?? DEFAULT_TEMPLATE_ID);
  const [html, setHtml] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    if (!resume) return;
    setTemplateId(resume.templateId ?? DEFAULT_TEMPLATE_ID);
  }, [resume]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHtml('');

    try {
      const content = ensureContent(resume?.content);
      const sorted = [...content.sections].sort((a, b) => a.order - b.order);
      const visibleSections = sorted.filter(s => s.visible);
      const template = TEMPLATES[templateId];
      if (!template) {
        throw new Error(`Unknown template: ${templateId}`);
      }
      const filteredContent = {...content, sections: visibleSections};
      const generatedHtml = template.render(filteredContent, resume!);
      if (!cancelled) {
        setHtml(generatedHtml);
        setLoading(false);
      }
    } catch (err) {
      if (!cancelled) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setLoading(false);
        Alert.alert('Preview failed', message);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [resume, templateId]);

  const handleTemplateChange = (newId: string): void => {
    setTemplateId(newId);
    updateResume(resumeId, {templateId: newId});
  };

  const handleExport = async (): Promise<void> => {
    if (!resume) return;
    try {
      setExporting(true);
      const content = ensureContent(resume.content);
      await exportResumeToPdf(resume, content);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      Alert.alert('Export failed', message);
    } finally {
      setExporting(false);
    }
  };

  if (!resume) {
    return (
      <ScreenContainer>
        <View>
          <Text>Resume not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Preview failed: {error}</Text>
          <AppButton
            label="Retry"
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <AppButton
            label="< Back"
            onPress={() => navigation.goBack()}
            mode="text"
            compact
          />
          <Text style={styles.title}>Resume Preview</Text>
          <View />
        </View>

        <View style={styles.selectorRow}>
          {TEMPLATE_IDS.map(id => {
            const template = TEMPLATES[id];
            const selected = templateId === id;
            return (
              <AppButton
                key={id}
                label={template.name}
                onPress={() => handleTemplateChange(id)}
                mode={selected ? 'contained' : 'outlined'}
                fullWidth={false}
                compact
              />
            );
          })}
        </View>

        <View style={styles.webviewContainer}>
          <WebView
            key={templateId}
            source={{html}}
            originWhitelist={['*']}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
              </View>
            )}
            onLoadEnd={() => setLoading(false)}
            startInLoadingState
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <AppButton
            label="Export PDF"
            onPress={handleExport}
            loading={exporting}
            disabled={loading || !!error}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});
