import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getScoreColor, getScoreLabel} from '../../services/ats/atsScorer';
import type {AtsScoreBreakdown} from '../../types/resume';

interface ScoreIndicatorProps {
  score: number;
  breakdown?: AtsScoreBreakdown;
  showBreakdown?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ScoreIndicator = ({
  score,
  breakdown,
  showBreakdown = false,
  size = 'medium',
}: ScoreIndicatorProps): React.JSX.Element => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const scoreSize = size === 'large' ? 44 : size === 'medium' ? 32 : 24;

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <Text style={[styles.score, {color, fontSize: scoreSize}]}>{score}</Text>
        <Text style={[styles.outline, {fontSize: scoreSize * 0.4}]}>/100</Text>
      </View>
      <Text style={[styles.label, {color}]}>{label}</Text>
      {showBreakdown && breakdown ? (
        <View style={styles.breakdown}>
          <ScoreBar label="Keywords" value={breakdown.keywords} color={getScoreColor(breakdown.keywords)} />
          <ScoreBar label="Skills" value={breakdown.skills} color={getScoreColor(breakdown.skills)} />
          <ScoreBar label="Experience" value={breakdown.experience} color={getScoreColor(breakdown.experience)} />
          <ScoreBar label="Education" value={breakdown.education} color={getScoreColor(breakdown.education)} />
          <ScoreBar label="Format" value={breakdown.formatting} color={getScoreColor(breakdown.formatting)} />
        </View>
      ) : null}
    </View>
  );
};

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
}

const ScoreBar = ({label, value, color}: ScoreBarProps): React.JSX.Element => (
  <View style={styles.scoreBar}>
    <Text style={styles.scoreBarLabel}>{label}</Text>
    <View style={styles.scoreBarTrack}>
      <View style={[styles.scoreBarFill, {width: `${value}%`, backgroundColor: color}]} />
    </View>
    <Text style={styles.scoreBarValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  score: {
    fontWeight: '700',
  },
  outline: {
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  breakdown: {
    marginTop: 16,
    width: '100%',
    gap: 8,
  },
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBarLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 70,
    textAlign: 'right',
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreBarValue: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
});
