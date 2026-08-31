import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {AppCard} from '../components/index';
import {useResumeStore} from '../store/useResumeStore';
import {runStructuredExtraction} from '../services/ai/extractResumeUseCase';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import type {ResumeSection, SectionType} from '../types/resume';
import {useResumeContent} from '../components/resumeEditor/useResumeContent';
import {addSection, ensureContent} from '../utils/resume/contentMutators';
import {createSection, nextOrder} from '../utils/resume/sectionFactory';
import {SectionAdder} from '../components/resumeEditor/SectionAdder';
import {PersonalInfoSection} from '../components/resumeEditor/PersonalInfoSection';
import {IntroSection} from '../components/resumeEditor/IntroSection';
import {ExperienceSection} from '../components/resumeEditor/ExperienceSection';
import {ProjectsSection} from '../components/resumeEditor/ProjectsSection';
import {EducationSection} from '../components/resumeEditor/EducationSection';
import {SkillsSection} from '../components/resumeEditor/SkillsSection';
import {CertificationsSection} from '../components/resumeEditor/CertificationsSection';
import {CustomSection} from '../components/resumeEditor/CustomSection';

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
  const {content} = useResumeContent(resumeId);
  const [showRaw, setShowRaw] = useState(false);

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

  const handleAddSection = (type: SectionType): void => {
    const ordered = ensureContent(resume?.content).sections;
    updateResumeContent(resumeId, prev => addSection(prev, createSection(type, nextOrder(ordered))));
  };

  const rawText = resume.text?.trim();

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard>
          <AppCard.Title title={resume.name} subtitle="Structured Resume Editor" />
        </AppCard>

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

        {sections.map((section, index) => (
          <View key={section.id}>
            {renderSection(resumeId, section, index, sections.length)}
          </View>
        ))}

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
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
