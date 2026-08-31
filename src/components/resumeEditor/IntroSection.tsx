import React from 'react';
import {AppTextInput} from '../index';
import type {ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {useResumeContent, useSectionOps} from './useResumeContent';
import {updateIntro} from '../../utils/resume/contentMutators';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const IntroSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const {update} = useResumeContent(resumeId);

  if (section.type !== 'intro') {
    return null;
  }
  const data = section.data;

  return (
    <SectionShell
      title="Introduction"
      hidden={!section.visible}
      removable={false}
      canMoveUp={ops.canMoveUp}
      canMoveDown={ops.canMoveDown}
      onMoveUp={ops.moveUp}
      onMoveDown={ops.moveDown}
      onToggleVisible={ops.toggleVisible}
      onRemove={ops.remove}>
      <AppTextInput
        label="Professional headline"
        value={data.headline ?? ''}
        onChangeText={value => update(prev => updateIntro(prev, section.id, {headline: value}))}
        placeholder="Senior Software Engineer"
      />
      <AppTextInput
        label="Professional summary"
        value={data.summary ?? ''}
        onChangeText={value => update(prev => updateIntro(prev, section.id, {summary: value}))}
        placeholder="Brief introduction shown at the top of your resume"
        multiline
        numberOfLines={4}
      />
    </SectionShell>
  );
};
