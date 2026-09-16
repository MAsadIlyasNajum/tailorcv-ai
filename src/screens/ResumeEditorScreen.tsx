import React, {useMemo, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {AppCard} from '../components/index';
import {AppButton} from '../components/index';
import {SaveIndicator} from '../components/common/SaveIndicator';
import {SuggestionsPanel} from '../components/resumeEditor/SuggestionsPanel';
import {useResumeStore} from '../store/useResumeStore';
import {runStructuredExtraction} from '../services/ai/extractResumeUseCase';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import type {ResumeSection, SectionType} from '../types/resume';
import {useResumeContent} from '../components/resumeEditor/useResumeContent';
import {addSection, ensureContent} from '../utils/resume/contentMutators';
import {createSection, nextOrder} from '../utils/resume/sectionFactory';
import {calculateAtsAnalysis} from '../services/ats/atsAnalysis';
import {SectionAdder} from '../components/resumeEditor/SectionAdder';
import {PersonalInfoSection} from '../components/resumeEditor/PersonalInfoSection';
import {IntroSection} from '../components/resumeEditor/IntroSection';
import {ExperienceSection} from '../components/resumeEditor/ExperienceSection';
import {ProjectsSection} from '../components/resumeEditor/ProjectsSection';
import {EducationSection} from '../components/resumeEditor/EducationSection';
import {SkillsSection} from '../components/resumeEditor/SkillsSection';
import {CertificationsSection} from '../components/resumeEditor/CertificationsSection';
import {CustomSection} from '../components/resumeEditor/CustomSection';
import {editorStyles} from '../components/resumeEditor/styles';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_EDITOR>;

const renderSection = (
  resumeId: string,
  section: ResumeSection,
  index: number,
  count: number,
): React.ReactNode => {
  const props = {resumeId, section, index, count};
  switch (section.type) {
    case 'personalInfo':
      return <PersonalInfoSection {...props} />;
    case 'intro':
      return <IntroSection {...props} />;
    case 'experience':
      return <ExperienceSection {...props} />;
    case 'projects':
      return <ProjectsSection {...props} />;
    case 'education':
      return <EducationSection {...props} />;
    case 'skills':
      return <SkillsSection {...props} />;
    case 'certifications':
      return <CertificationsSection {...props} />;
    case 'custom':
      return <CustomSection {...props} />;
    default:
      return null;
  }
};

export const ResumeEditorScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation();
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);
  const setCurrentResume = useResumeStore(state => state.setCurrentResume);
  const updateResumeContent = useResumeStore(state => state.updateResumeContent);
  const isExtracting = useResumeStore(state => state.isExtracting);
  const extractionError = useResumeStore(state => state.extractionError);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const currentAnalysisId = useResumeStore(state => state.currentAnalysisId);
  const applyOptimizationSuggestion = useResumeStore(state => state.applyOptimizationSuggestion);
  const dismissOptimizationSuggestion = useResumeStore(state => state.dismissOptimizationSuggestion);
  const {content} = useResumeContent(resumeId);
  const [showRaw, setShowRaw] = useState(false);

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUpdatedAt = useRef(resume?.updatedAt ?? 0);

  const analysisResult = useMemo(
    () => analysisResults.find(r => r.id === currentAnalysisId) ?? null,
    [analysisResults, currentAnalysisId],
  );

  const optimizationSuggestions = useMemo(() => {
    if (!analysisResult || !content) {
      return [];
    }
    const analysis = calculateAtsAnalysis(content, analysisResult);
    const appliedIds = resume?.appliedSuggestions || [];
    return analysis.optimizationSuggestions.map(s => ({
      ...s,
      applied: appliedIds.includes(s.id),
    }));
  }, [analysisResult, content, resume?.appliedSuggestions]);

  const handleApplySuggestion = (suggestion: import('../types/resume').OptimizationSuggestion): void => {
    applyOptimizationSuggestion(resumeId, suggestion);
  };

  const handleDismissSuggestion = (suggestion: import('../types/resume').OptimizationSuggestion): void => {
    dismissOptimizationSuggestion(resumeId, suggestion.id);
  };

  useEffect(() => {
    if (resume && resume.updatedAt !== prevUpdatedAt.current) {
      prevUpdatedAt.current = resume.updatedAt;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => setSavedAt(Date.now()), 300);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.updatedAt]);

  const showSaved = savedAt !== null && Date.now() - savedAt < 1500;

  const handleExtract = async (): Promise<void> => {
    const proposal = await runStructuredExtraction();
    if (proposal) {
      navigation.navigate(ROUTES.RESUME_EXTRACTION_REVIEW as never, {resumeId} as never);
    }
  };

  const sections = useMemo(
    () => [...content.sections].sort((a, b) => a.order - b.order),
    [content.sections],
  );

  const isMinimalResume = content.sections.length === 2 &&
    content.sections.every(s => s.type === 'personalInfo' || s.type === 'intro');

  if (!resume) {
    return (
      <ScreenContainer>
        <AppCard>
          <Text style={styles.notFound}>Resume not found.</Text>
          <PrimaryButton label="Back" onPress={() => navigation.goBack()} />
        </AppCard>
      </ScreenContainer>
    );
  }

  const handleAddSection = (type: SectionType, title?: string): void => {
    const ordered = ensureContent(resume?.content).sections;
    updateResumeContent(resumeId, prev => addSection(prev, createSection(type, nextOrder(ordered), title ? {title} : {})));
  };

  const rawText = resume.text?.trim();

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard>
          <View style={editorStyles.editorHeader}>
            <View>
              <Text style={editorStyles.editorTitle}>{resume.name}</Text>
              <Text style={editorStyles.editorSubtitle}>Structured Resume Editor</Text>
            </View>
            <SaveIndicator visible={showSaved} />
          </View>
        </AppCard>

        {optimizationSuggestions.length > 0 ? (
          <SuggestionsPanel
            suggestions={optimizationSuggestions}
            onApply={handleApplySuggestion}
            onDismiss={handleDismissSuggestion}
          />
        ) : null}

        {rawText ? (
          <AppCard>
            <AppCard.Content>
              <Text style={styles.rawHeader}>Original extracted text (preserved)</Text>
              <Text style={styles.link} onPress={() => setShowRaw(value => !value)}>
                {showRaw ? 'Hide' : 'Show'} raw text
              </Text>
              {showRaw ? <Text style={styles.rawText}>{rawText}</Text> : null}
            </AppCard.Content>
          </AppCard>
        ) : null}

        {isMinimalResume ? (
          <AppCard style={editorStyles.emptyStateCard}>
            <Text style={styles.emptyTitle}>Start building your resume</Text>
            <Text style={styles.emptyBody}>
              Add sections to create a structured resume that you can edit, preview, and export.
            </Text>
            <View style={styles.emptyActions}>
              <AppButton
                mode="outlined"
                compact
                onPress={() => handleAddSection('experience')}>
                + Experience
              </AppButton>
              <AppButton
                mode="outlined"
                compact
                onPress={() => handleAddSection('projects')}>
                + Projects
              </AppButton>
              <AppButton
                mode="outlined"
                compact
                onPress={() => handleAddSection('education')}>
                + Education
              </AppButton>
              <AppButton
                mode="outlined"
                compact
                onPress={() => handleAddSection('skills')}>
                + Skills
              </AppButton>
            </View>
          </AppCard>
        ) : (
          sections.map((section, index) => (
            <View key={section.id}>
              {renderSection(resumeId, section, index, sections.length)}
            </View>
          ))
        )}

        <SectionAdder sections={sections} onAdd={handleAddSection} />

        {extractionError ? (
          <AppCard>
            <AppCard.Content>
              <Text style={styles.errorText}>{extractionError}</Text>
            </AppCard.Content>
          </AppCard>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Extract with AI"
            loading={isExtracting}
            onPress={handleExtract}
          />
          <PrimaryButton
            label="Preview"
            onPress={() => navigation.navigate(ROUTES.RESUME_PREVIEW as never, {resumeId} as never)}
          />
          <PrimaryButton
            label="Done"
            onPress={() => {
              setCurrentResume(resumeId);
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  notFound: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  rawHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  link: {
    fontSize: 13,
    color: '#2563EB',
    marginTop: 6,
    fontWeight: '600',
  },
  rawText: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
