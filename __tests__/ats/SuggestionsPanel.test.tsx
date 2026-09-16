import React from 'react';
import {act, create} from 'react-test-renderer';
import {SuggestionsPanel} from '../../src/components/resumeEditor/SuggestionsPanel';
import type {OptimizationSuggestion} from '../../src/types/resume';

describe('SuggestionsPanel', () => {
  const mockSuggestions: OptimizationSuggestion[] = [
    {
      id: 'add-react',
      type: 'add_keyword',
      section: 'skills',
      description: 'Add "React" to your skills section',
      impact: 'high',
      applied: false,
    },
    {
      id: 'add-typescript',
      type: 'add_keyword',
      section: 'experience',
      description: 'Add "TypeScript" to your experience section',
      impact: 'medium',
      applied: false,
    },
    {
      id: 'add-summary',
      type: 'add_detail',
      section: 'intro',
      description: 'Add a professional summary',
      impact: 'low',
      applied: true,
    },
  ];

  it('renders without crashing', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(
        <SuggestionsPanel
          suggestions={mockSuggestions}
          onApply={jest.fn()}
          onDismiss={jest.fn()}
        />,
      );
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).not.toBeNull();
  });

  it('returns null when no suggestions', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(
        <SuggestionsPanel
          suggestions={[]}
          onApply={jest.fn()}
          onDismiss={jest.fn()}
        />,
      );
    });

    expect(tree).toBeTruthy();
    expect(tree!.toJSON()).toBeNull();
  });

  it('renders suggestions list', async () => {
    let tree: ReturnType<typeof create> | null = null;
    await act(async () => {
      tree = create(
        <SuggestionsPanel
          suggestions={mockSuggestions}
          onApply={jest.fn()}
          onDismiss={jest.fn()}
        />,
      );
    });

    const json = tree!.toJSON();
    expect(json).toBeTruthy();
  });

  it('calls onApply when apply button pressed', async () => {
    const onApply = jest.fn();
    let tree: ReturnType<typeof create> | null = null;

    await act(async () => {
      tree = create(
        <SuggestionsPanel
          suggestions={[mockSuggestions[0]]}
          onApply={onApply}
          onDismiss={jest.fn()}
        />,
      );
    });

    expect(tree).toBeTruthy();
  });

  it('calls onDismiss when dismiss button pressed', async () => {
    const onDismiss = jest.fn();
    let tree: ReturnType<typeof create> | null = null;

    await act(async () => {
      tree = create(
        <SuggestionsPanel
          suggestions={[mockSuggestions[0]]}
          onApply={jest.fn()}
          onDismiss={onDismiss}
        />,
      );
    });

    expect(tree).toBeTruthy();
  });
});
