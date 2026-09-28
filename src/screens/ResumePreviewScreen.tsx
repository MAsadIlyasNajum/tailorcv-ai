import React, {useMemo} from 'react';
import {ActivityIndicator, Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WebView} from 'react-native-webview';
import {
  AppButton,
  IconSymbol,
  InfoBanner,
  StickyActionBar,
  StickyActionButton,
  Toast,
} from '../components';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {TEMPLATES, DEFAULT_TEMPLATE_ID} from '../templates/templateRegistry';
import {exportResumeToPdf} from '../services/pdf/resumePdfExporter';
import {ensureContent} from '../utils/resume/contentMutators';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_PREVIEW>;

const TEMPLATE_IDS = [DEFAULT_TEMPLATE_ID, 'modern', 'europass'] as const;

export const ResumePreviewScreen = ({route, navigation}: Props): React.ReactElement => {
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);
  const updateResume = useResumeStore(state => state.updateResume);
  const analysisResults = useResumeStore(state => state.analysisResults);

  const [templateId, setTemplateId] = React.useState(resume?.templateId ?? DEFAULT_TEMPLATE_ID);
  const [html, setHtml] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [showHidden, setShowHidden] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [fullView, setFullView] = React.useState(false);

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
      const visibleSections = sorted.filter(section => section.visible);
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
  }, [resume, templateId, retryKey]);

  React.useEffect(() => {
    if (!exportMessage) return;
    const timer = setTimeout(() => setExportMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [exportMessage]);

  const handleTemplateChange = (newId: string): void => {
    setTemplateId(newId);
    updateResume(resumeId, {templateId: newId});
  };

  const handleCycleTemplate = (): void => {
    const index = TEMPLATE_IDS.indexOf(templateId as (typeof TEMPLATE_IDS)[number]);
    const next = TEMPLATE_IDS[(index + 1) % TEMPLATE_IDS.length];
    handleTemplateChange(next);
  };

  const handleEditContent = (): void => {
    navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId});
  };

  const handleToggleFullView = (): void => {
    setFullView(value => !value);
  };

  const latestMatchScore = useMemo(() => {
    const matches = analysisResults
      .filter(result => result.resumeId === resumeId)
      .map(result => result.matchScore);
    return matches.length > 0 ? Math.max(...matches) : null;
  }, [analysisResults, resumeId]);

  const handleExport = async (): Promise<void> => {
    if (!resume) return;
    try {
      setExporting(true);
      const content = ensureContent(resume.content);
      await exportResumeToPdf(resume, content);
      setExportMessage('Resume exported successfully.');
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
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Resume not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <InfoBanner
            title="Preview unavailable"
            message={`Preview failed: ${error}`}
            icon="!"
            tone="neutral"
          />
          <AppButton
            label="Retry"
            onPress={() => {
              setError(null);
              setLoading(true);
              setRetryKey(value => value + 1);
            }}
          />
        </View>
      </ScreenContainer>
    );
  }


  const sortedSections = [...(resume.content?.sections ?? [])].sort((a, b) => a.order - b.order);
  const visibleSections = sortedSections.filter(section => section.visible);
  const hiddenSections = sortedSections.filter(section => !section.visible);
  const selectedTemplate = TEMPLATES[templateId];

  const renderPreview = (keySuffix: string): React.JSX.Element => (
    <>
      <WebView
        key={`${templateId}-${keySuffix}`}
        source={{html}}
        originWhitelist={['*']}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Rendering resume…</Text>
          </View>
        )}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        style={styles.webview}
      />
      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </>
  );

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrapper}>
        <Toast
          visible={!!exportMessage}
          message={exportMessage ?? ''}
          subtitle="Your PDF file is ready."
          type="success"
        />

        <View style={fullView ? styles.headerHidden : styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <IconSymbol name="back" size={28} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title} numberOfLines={1}>{resume.name}</Text>
            <Text style={styles.metadata} numberOfLines={1}>
              {visibleSections.length} of {sortedSections.length} sections visible · {selectedTemplate?.name ?? templateId}
            </Text>
          </View>
        </View>

        <View style={styles.watermarkRow}>
          <Text style={styles.watermarkText}>{templateId.toUpperCase()}</Text>
          {latestMatchScore !== null ? (
            <View style={styles.readabilityBadge}>
              <Text style={styles.readabilityBadgeText}>ATS {latestMatchScore}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.optionsPanel}>
          <View style={styles.selectorRow}>
            {TEMPLATE_IDS.map(id => {
              const template = TEMPLATES[id];
              const selected = templateId === id;
              return (
                <AppButton
                  key={id}
                  label={template.name}
                  onPress={() => handleTemplateChange(id)}
                  mode="outlined"
                  fullWidth={false}
                  style={[styles.templateButton, selected && styles.templateButtonSelected]}
                  labelStyle={styles.templateButtonLabel}
                  textColor={selected ? colors.amberText : colors.primaryDark}
                  icon={selected ? <IconSymbol name="check" size={12} color={colors.amberText} /> : undefined}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable
            onPress={handleEditContent}
            accessibilityRole="button"
            accessibilityLabel="Edit Content"
            style={[styles.quickPill, styles.quickPillNeutral]}>
            <Text style={styles.quickPillLabel}>Edit Content</Text>
          </Pressable>
          <Pressable
            onPress={handleCycleTemplate}
            accessibilityRole="button"
            accessibilityLabel="Change Template"
            style={[styles.quickPill, styles.quickPillViolet]}>
            <Text style={styles.quickPillLabel}>Change Template</Text>
          </Pressable>
          <Pressable
            onPress={handleToggleFullView}
            accessibilityRole="button"
            accessibilityLabel="Full View"
            accessibilityState={{selected: fullView}}
            style={[styles.quickPill, styles.quickPillNeutral]}>
            <Text style={styles.quickPillLabel}>{fullView ? 'Exit Full View' : 'Full View'}</Text>
          </Pressable>
        </View>

        {visibleSections.length === 0 ? (
          <InfoBanner
            title="No visible sections"
            message="All sections are hidden. Use the editor to show the sections you want in your resume."
            icon="i"
            tone="neutral"
          />
        ) : null}

        {hiddenSections.length > 0 ? (
          <View style={styles.hiddenCard}>
            <InfoBanner
              title="Some content is hidden"
              message={`${hiddenSections.length} hidden section${hiddenSections.length === 1 ? '' : 's'} will not appear in the preview or export.`}
              icon="i"
              tone="primary"
            />
            <View style={styles.hiddenHeader}>
              <Text style={styles.hiddenCount}>
                {hiddenSections.length} hidden section{hiddenSections.length === 1 ? '' : 's'}
              </Text>
              <AppButton
                label={showHidden ? 'Hide list' : 'Show list'}
                icon={showHidden ? '↑' : '↓'}
                onPress={() => setShowHidden(value => !value)}
                mode="text"
                compact
              />
            </View>
            {showHidden ? hiddenSections.map(section => (
              <View key={section.id} style={styles.hiddenPlaceholder}>
                <Text style={styles.hiddenPlaceholderText}>
                  {section.title ?? section.type}
                </Text>
              </View>
            )) : null}
          </View>
        ) : null}

        {fullView ? (
          <View style={styles.fullViewOverlay} testID="fullViewOverlay">
            <View style={styles.fullViewBar}>
              <Text style={styles.fullViewTitle} numberOfLines={1}>{resume.name}</Text>
              <Pressable
                onPress={handleToggleFullView}
                accessibilityRole="button"
                accessibilityLabel="Exit full view"
                style={styles.fullViewClose}
                testID="fullViewClose">
                <IconSymbol name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.fullViewPaper}>{renderPreview('full')}</View>
          </View>
        ) : (
          <View style={styles.previewStage}>
            <View style={styles.paperFrame}>{renderPreview('page')}</View>
          </View>
        )}

        <StickyActionBar style={fullView ? styles.actionBarHidden : styles.actionBar}>
          <StickyActionButton
            label={exporting ? 'Exporting…' : 'Download PDF'}
            onPress={handleExport}
            disabled={loading || !!error || exporting}
            variant="primary"
            minHeight={48}
            radius={12}
          />
        </StickyActionBar>
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
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    padding: spacing.lg,
    ...shadows.header,
  },
  backButton: {
    width: 32,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    fontFamily: 'Inter',
    color: colors.textTertiary,
  },
  backAction: {
    width: 72,
    flexGrow: 0,
    flexShrink: 0,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: 4,
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.6,
    fontFamily: 'Inter',
    color: colors.textTertiary,
  },
  readabilityBadge: {
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readabilityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    fontFamily: 'Inter',
    color: colors.greenStrong,
  },
  optionsPanel: {
    gap: spacing.md,
    paddingHorizontal: 4,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateButton: {
    minHeight: 44,
    borderRadius: 9999,
    backgroundColor: colors.surfaceTint,
    borderColor: colors.surfaceTint,
    paddingHorizontal: 16,
  },
  templateButtonSelected: {
    backgroundColor: colors.violetTint,
    borderColor: colors.violetTint,
  },
  templateButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  quickPill: {
    minHeight: 44,
    borderRadius: 9999,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  quickPillNeutral: {
    backgroundColor: '#F2F3FF',
  },
  quickPillViolet: {
    backgroundColor: '#EADDFF',
  },
  quickPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.12,
    color: colors.textPrimary,
  },
  fullViewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  headerHidden: {
    height: 0,
    overflow: 'hidden',
  },
  fullViewPaper: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  fullViewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  fullViewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.textPrimary,
  },
  fullViewClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTint,
  },
  hiddenCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  hiddenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  hiddenCount: {
    ...typography.bodySemi,
    color: colors.textSecondary,
  },
  hiddenPlaceholder: {
    backgroundColor: colors.surfaceTint,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hiddenPlaceholderText: {
    ...typography.bodySemi,
    color: colors.textSecondary,
  },
  previewStage: {
    flex: 1,
    minHeight: 260,
    backgroundColor: colors.surfaceTint,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  paperFrame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    ...shadows.cardElevated,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  loadingText: {
    ...typography.bodySemi,
    color: colors.textTertiary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  actionBar: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
  },
  actionBarHidden: {
    height: 0,
    overflow: 'hidden',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
