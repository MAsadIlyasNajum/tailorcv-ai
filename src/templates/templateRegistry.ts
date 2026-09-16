import type {ResumeTemplate} from './types';
import {classicTemplate} from './classic';
import {modernTemplate} from './modern';
import {europassTemplate} from './europass';

export const DEFAULT_TEMPLATE_ID = 'classic';

export const TEMPLATES: Record<string, ResumeTemplate> = {
  classic: classicTemplate,
  modern: modernTemplate,
  europass: europassTemplate,
};
