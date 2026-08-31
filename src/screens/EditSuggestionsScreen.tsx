import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppTextInput} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.EDIT_SUGGESTIONS>;

type SectionDraft = {
  suggestedSummary: string;
  suggestedSkills: string;
  experienceImprovements: string;
  atsTips: string;
};

const INITIAL_DRAFT: SectionDraft = {
  suggestedSummary: '',
  suggestedSkills: '',
  experienceImprovements: '',
  atsTips: '',
};

export const EditSuggestionsScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const analysisResults = useResumeStore(state => state.analysisResults);
  const updateAnalysisResult = useResumeStore(state => state.updateAnalysisResult);

  const analysis = useMemo(() => {
    if (route.params?.analysisId) {
      return analysisResults.find(a => a.id === route.params.analysisId) ?? null;
    }
    return null;
  }, [analysisResults, route.params?.analysisId]);

  const [draft, setDraft] = useState<SectionDraft>(INITIAL_DRAFT);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (analysis) {
      setDraft({
        suggestedSummary: analysis.suggestedSummary,
        suggestedSkills: (analysis.suggestedSkills ?? []).join('\n'),
        experienceImprovements: (analysis.experienceImprovements ?? [])
          .map(item => `Original: ${item.original}\nImproved: ${item.improved}`)
          .join('\n\n'),
        atsTips: (analysis.atsTips ?? []).join('\n'),
      });
    }
  }, [analysis]);

  const handleSave = (): void => {
    if (!analysis) {
      return;
    }

    const suggestedSkills = draft.suggestedSkills
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const atsTips = draft.atsTips
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const experienceImprovements = draft.experienceImprovements
      .split('\n\n')
      .map(block => block.trim())
      .filter(Boolean)
      .map(block => {
        const originalMatch = block.match(/Original:\s*(.*)/);
        const improvedMatch = block.match(/Improved:\s*(.*)/);
        const original = originalMatch?.[1]?.trim() ?? '';
        const improved = improvedMatch?.[1]?.trim() ?? '';
        if (!original || !improved) {
          return null;
        }
        return {original, improved};
      })
      .filter((item): item is {original: string; improved: string} => item !== null);

    updateAnalysisResult(analysis.id, {
      suggestedSummary: draft.suggestedSummary,
      suggestedSkills,
      experienceImprovements,
      atsTips,
      userEditedSuggestions: {
        suggestedSummary: draft.suggestedSummary,
        suggestedSkills,
        experienceImprovements,
        atsTips,
      },
      updatedAt: Date.now(),
    });

    setSaved(true);
    trackEvent('suggestion_edited');
  };

  const handleReset = (): void => {
    if (!analysis) {
      return;
    }

    setDraft({
      suggestedSummary: analysis.suggestedSummary,
      suggestedSkills: (analysis.suggestedSkills ?? []).join('\n'),
      experienceImprovements: (analysis.experienceImprovements ?? [])
        .map(item => `Original: ${item.original}\nImproved: ${item.improved}`)
        .join('\n\n'),
      atsTips: (analysis.atsTips ?? []).join('\n'),
    });

    updateAnalysisResult(analysis.id, {
      userEditedSuggestions: undefined,
      updatedAt: Date.now(),
    });

    setSaved(false);
  };

  if (!analysis) {
    return (
      <ScreenContainer scroll>
        <View style={styles.wrapper}>
          <AppCard style={styles.card}>
            <AppCard.Content>
              <Text style={styles.notFound}>Analysis not found.</Text>
              <PrimaryButton label="Back" onPress={() => navigation.goBack()} />
            </AppCard.Content>
          </AppCard>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard style={styles.card}>
          <AppCard.Title title="Edit Suggestions" subtitle="Modify the AI recommendations below. Original outputs are preserved." />
          <AppCard.Content>
            <Text style={styles.label}>Suggested Professional Summary</Text>
            <AppTextInput
              multiline
              value={draft.suggestedSummary}
              onChangeText={value => setDraft({...draft, suggestedSummary: value})}
              style={styles.input}
              numberOfLines={4}
            />

            <Text style={styles.label}>Suggested Skills (one per line)</Text>
            <AppTextInput
              multiline
              value={draft.suggestedSkills}
              onChangeText={value => setDraft({...draft, suggestedSkills: value})}
              style={styles.input}
              numberOfLines={4}
            />

            <Text style={styles.label}>
              Experience Improvements (one per block, separated by blank lines)
            </Text>
            <AppTextInput
              multiline
              value={draft.experienceImprovements}
              onChangeText={value => setDraft({...draft, experienceImprovements: value})}
              style={[styles.input, styles.tallInput]}
              numberOfLines={8}
            />

            <Text style={styles.label}>ATS Tips (one per line)</Text>
            <AppTextInput
              multiline
              value={draft.atsTips}
              onChangeText={value => setDraft({...draft, atsTips: value})}
              style={styles.input}
              numberOfLines={4}
            />

            <View style={styles.actions}>
              <PrimaryButton label={saved ? 'Saved' : 'Save Edits'} onPress={handleSave} />
              <AppButton mode="text" onPress={handleReset}>
                Reset to AI original
              </AppButton>
            </View>

            {saved ? (
              <Text style={styles.savedText}>Your edits have been saved.</Text>
            ) : null}
          </AppCard.Content>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
  },
  notFound: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  tallInput: {
    minHeight: 160,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  savedText: {
    marginTop: 12,
    fontSize: 13,
    color: '#14B8A6',
    fontWeight: '600',
  },
});
