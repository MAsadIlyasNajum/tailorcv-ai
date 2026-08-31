import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {AppCard} from '../components/index';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import type {
  ExperienceEntry,
  ProjectEntry,
  EducationEntry,
  CertificationEntry,
  ResumeSection,
} from '../types/resume';
import {ensureContent} from '../utils/resume/contentMutators';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_PREVIEW>;

const lines = (items?: string[]): React.ReactNode =>
  items?.filter(Boolean).map((item, i) => (
    <Text key={i} style={styles.bullet}>
      • {item}
    </Text>
  )) ?? null;

const renderEntryMeta = (entry: {startDate?: string; endDate?: string | null; isCurrent?: boolean}): string => {
  const end = entry.isCurrent ? 'Present' : entry.endDate || '';
  return [entry.startDate, end].filter(Boolean).join(' – ');
};

const renderSection = (section: ResumeSection): React.ReactNode => {
  switch (section.type) {
    case 'personalInfo': {
      const d = section.data;
      const emails = d.emails.map(e => e.value).filter(Boolean);
      const phones = d.phoneNumbers.map(e => e.value).filter(Boolean);
      const links = d.links.map(e => e.label ? `${e.label}: ${e.value}` : e.value).filter(Boolean);
      return (
        <View>
          {d.fullName ? <Text style={styles.name}>{d.fullName}</Text> : null}
          {lines([...emails, ...phones, ...links])}
        </View>
      );
    }
    case 'intro': {
      const d = section.data;
      return (
        <View>
          {d.headline ? <Text style={styles.headline}>{d.headline}</Text> : null}
          {d.summary ? <Text style={styles.body}>{d.summary}</Text> : null}
        </View>
      );
    }
    case 'experience':
      return (
        <View>
          {section.entries.map((e: ExperienceEntry) => (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryTitle}>
                {e.role || 'Role'} {e.company ? `@ ${e.company}` : ''}
              </Text>
              <Text style={styles.meta}>{renderEntryMeta(e)}</Text>
              {e.summary ? <Text style={styles.body}>{e.summary}</Text> : null}
              {lines(e.achievements)}
              {lines(e.responsibilities)}
              {lines(e.technologies)}
            </View>
          ))}
        </View>
      );
    case 'projects':
      return (
        <View>
          {section.entries.map((e: ProjectEntry) => (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryTitle}>{e.name || 'Project'}</Text>
              <Text style={styles.meta}>{renderEntryMeta(e)}</Text>
              {e.description ? <Text style={styles.body}>{e.description}</Text> : null}
              {lines(e.achievements)}
              {lines(e.technologies)}
            </View>
          ))}
        </View>
      );
    case 'education':
      return (
        <View>
          {section.entries.map((e: EducationEntry) => (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryTitle}>
                {e.degree || 'Degree'} {e.institution ? `@ ${e.institution}` : ''}
              </Text>
              <Text style={styles.meta}>{renderEntryMeta(e)}</Text>
              {lines(e.achievements)}
            </View>
          ))}
        </View>
      );
    case 'certifications':
      return (
        <View>
          {section.entries.map((e: CertificationEntry) => (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryTitle}>{e.name || 'Certification'}</Text>
              <Text style={styles.meta}>
                {[e.issuer, e.issueDate].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'skills': {
      const uncategorized = section.uncategorized.map(s => s.name).filter(Boolean);
      return (
        <View>
          {uncategorized.length ? <Text style={styles.body}>{uncategorized.join(' · ')}</Text> : null}
          {section.groups.map(group => (
            <View key={group.id} style={styles.entry}>
              <Text style={styles.entryTitle}>{group.title}</Text>
              <Text style={styles.body}>
                {group.skills.map(s => s.name).filter(Boolean).join(' · ')}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    case 'custom':
      return (
        <View>
          {section.data.content ? <Text style={styles.body}>{section.data.content}</Text> : null}
          {section.data.entries?.map(e => (
            <View key={e.id} style={styles.entry}>
              <Text style={styles.entryTitle}>{e.title || 'Item'}</Text>
              {e.content ? <Text style={styles.body}>{e.content}</Text> : null}
            </View>
          ))}
        </View>
      );
    default:
      return null;
  }
};

export const ResumePreviewScreen = ({route}: Props): React.ReactElement => {
  const navigation = useNavigation();
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);

  if (!resume) {
    return (
      <ScreenContainer>
        <AppCard>
          <Text style={styles.body}>Resume not found.</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  const content = ensureContent(resume.content);
  const ordered = [...content.sections].sort((a, b) => a.order - b.order).filter(s => s.visible);

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard>
          <AppCard.Title title={resume.name} subtitle="Preview" />
        </AppCard>
        {ordered.map(section => (
          <AppCard key={section.id}>
            <AppCard.Title
              title={section.title ?? section.type}
            />
            <AppCard.Content>{renderSection(section)}</AppCard.Content>
          </AppCard>
        ))}
        <PrimaryButton label="Back to Editor" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 4,
  },
  body: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bullet: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  entry: {
    marginTop: 8,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
});
