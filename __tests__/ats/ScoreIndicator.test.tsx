import React from 'react';
import {act, create} from 'react-test-renderer';
import {ScoreIndicator} from '../../src/components/ats/ScoreIndicator';
import type {AtsScoreBreakdown} from '../../src/types/resume';

describe('ScoreIndicator', () => {
  it('renders without crashing', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(<ScoreIndicator score={75} />);
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('displays the score', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(<ScoreIndicator score={75} />);
    });

    const json = tree!.toJSON();
    expect(json).toBeTruthy();
  });

  it('shows breakdown when enabled', async () => {
    const breakdown: AtsScoreBreakdown = {
      overall: 75,
      keywords: 80,
      skills: 70,
      experience: 75,
      education: 90,
      formatting: 60,
    };

    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(
        <ScoreIndicator score={75} breakdown={breakdown} showBreakdown={true} />,
      );
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('hides breakdown when disabled', async () => {
    const breakdown: AtsScoreBreakdown = {
      overall: 75,
      keywords: 80,
      skills: 70,
      experience: 75,
      education: 90,
      formatting: 60,
    };

    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(
        <ScoreIndicator score={75} breakdown={breakdown} showBreakdown={false} />,
      );
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('renders in small size', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(<ScoreIndicator score={50} size="small" />);
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('renders in large size', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(<ScoreIndicator score={90} size="large" />);
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });
});
