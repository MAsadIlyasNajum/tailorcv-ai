# Phase 5 — Production-Quality Resume Builder UX Plan

## 1. Audit Summary

**What I inspected:** `ResumeEditorScreen`, `SectionShell`, `SectionAdder`, `RepeatableSectionEditor`, all section editors (`ExperienceSection`, `ProjectsSection`, `EducationSection`, `SkillsSection`, `CertificationsSection`, `PersonalInfoSection`, `IntroSection`, `CustomSection`), `ContactsEditor`, `AssociationPicker`, `RepeatableStrings`, `ResumePreviewScreen`, `ResumeExtractionReviewScreen`, `useResumeContent`, `useSectionOps`, `useEntryOps`, Zustand store, MMKV persistence, content mutators, section factory, types, styles, navigation, and all 21 test files.

**Critical finding — AI safety:** `acceptResumeSuggestion()` in `src/store/useResumeStore.ts:350` **replaces entire sections by type**. If a user has 20 experience entries and accepts an AI extraction that proposes 3 new experiences, all 20 user entries are wiped out. This is the exact data-loss scenario in requirement #17.

**Other UX gaps found:**
- `ResumeEditorScreen` shows raw extracted text even for from-scratch resumes and has no onboarding guidance for empty resumes.
- `SectionAdder` is missing preset custom sections (Languages, Awards, Publications, Volunteer Experience).
- `RepeatableSectionEditor` entry header packs 5 actions (↑ ↓ Hide Duplicate Delete) into one row — will overflow on mobile.
- "Hide" on entries means "collapse," not "hide from output," creating confusion with section-level "Hide."
- `ContactsEditor` has no reordering.
- `SkillsSection` has no reordering of skills within groups or groups themselves.
- `ExperienceSection` is missing the `links` field in the UI despite it being in the type.
- `PersonalInfoData` has no `firstName` / `lastName` split.
- Preview excludes hidden sections entirely with no indicator that some sections are hidden.
- Persistence is immediate and reliable, but there is no user-facing confirmation that changes are saved.

**What is solid:**
- Canonical data model (discriminated unions, dynamic sections, canonical project→experience association).
- Immediate MMKV persistence — no data loss on restart.
- Content mutators are pure, well-tested, and handle large collections.
- AI suggestion lifecycle is correctly isolated (`aiSuggestions` is write-only until user accepts).
- Existing tests cover migration, large-scale mutations, and AI suggestion storage.

---

## 2. Key Decisions

| Decision | Rationale |
|---|---|
| **AI merge strategy: preserve + append for repeatables, field-level merge for singletons** | Smallest robust fix. Existing entries are never removed. AI entries are appended. For skills, deduplicate by name within groups. This satisfies "never silently replace unrelated manual edits." |
| **Add `firstName` / `lastName` to `PersonalInfoData`** | Genuine limitation for a production resume builder. Both fields optional; existing `fullName` is preserved for backward compatibility and as a fallback when first/last are empty. |
| **Preset custom sections via `SectionAdder`** | Meets req #11 without creating new `SectionType` values. Languages, Awards, Publications, Volunteer Experience are created as `custom` sections with preset titles. |
| **Rename entry "Hide" → "Collapse"** | Eliminates confusion with section-level visibility. Entry collapse stays as a UX affordance; section visibility remains a separate concern. |
| **No debounced autosave** | Current immediate persistence is already reliable. Adding debounce introduces sync complexity without a proven UX benefit for this app. A subtle "Saved" indicator is sufficient. |
| **No drag-and-drop** | React Native drag-and-drop requires heavy dependencies. Reorder buttons are the standard RN pattern. We improve touch target size instead. |
| **Name sync direction: first/last → fullName only** | Editing first name or last name derives `fullName`. Editing `fullName` does NOT populate first/last. This avoids ambiguous split logic and keeps the source of truth simple. If both first/last are empty, `fullName` is displayed as-is. If user clears a first/last name field after it contributed to `fullName`, `fullName` updates to reflect the remaining value (or empty string). |
| **Empty-state trigger: always show when minimal** | The onboarding card appears when the resume has exactly 2 sections (`personalInfo` + `intro`) and no other sections. It reappears if the user later removes all other sections and returns to this minimal state. This is simpler than tracking a historical flag and is helpful whenever the resume is empty. |
| **Preset custom deduplication** | If a custom section with the same title already exists, `SectionAdder` does NOT add another. This prevents duplicate "Languages" sections. Matching is case-insensitive. |
| **Hidden-section preview: show placeholder cards** | Hidden sections are excluded from output but shown in preview as dimmed placeholder cards labeled "Hidden: [title]" so users know content exists but is excluded. |
| **AI singleton merge: arrays are atomic** | For singleton sections (`personalInfo`, `intro`), proposed arrays (`emails`, `phoneNumbers`, etc.) only replace existing arrays when the proposed array is non-empty. An empty array `[]` from AI does NOT wipe out user data. Strings follow the same rule: only non-empty strings override. |
| **Save indicator: 300ms debounce** | The "Saved" indicator appears after a 300ms quiet period following a mutation. This prevents flickering during rapid typing while still providing timely feedback. |

---

## 3. Implementation Tasks

### Suggested Execution Order

1. **Task 1** (AI merge) + **Task 2** (AI tests) — highest priority, fixes data-loss bug.
2. **Task 16** (data model: add firstName/lastName) — small type change, unblocks Task 4.
3. **Task 4** (personal info) + **Task 10** (contact reorder) — related, do together.
4. **Task 5** (experience links) — quick win.
5. **Task 6** + **Task 7** (hide/delete clarity + action bar) — related UX fixes.
6. **Task 9** (skills reorder) + content mutator updates.
7. **Task 8** (section adder presets).
8. **Task 3** (empty state) + **Task 12** (save indicator).
9. **Task 11** (preview polish).
10. **Task 13** (accessibility) — sweep pass after UI changes.
11. **Task 14** + **Task 15** (tests) — add alongside each task, final performance test last.

---

### Task 1: Fix AI Acceptance Merge Behavior (Critical)
**Files:** `src/utils/resume/contentMutators.ts`, `src/store/useResumeStore.ts`

1. Add `mergeSections(existing: ResumeSection, proposed: ResumeSection): ResumeSection` to `contentMutators.ts`.
   - **Singletons** (`personalInfo`, `intro`): field-level shallow merge on `data`. Proposed `data` fields override existing fields only when the proposed value is "meaningful":
     - String fields: override only when proposed string is non-empty.
     - Array fields (`emails`, `phoneNumbers`, `addresses`, `links`): override only when proposed array is non-empty. An empty array `[]` from AI does NOT wipe out user data.
     - `null` and `undefined` are never meaningful; they never override existing values.
     - Object fields: shallow merge with the same rule applied recursively.
   - **Repeatables with entries** (`experience`, `projects`, `education`, `certifications`): preserve all existing entries with their original `id` and `order` values intact. Append proposed entries after existing entries. Proposed entries get new `id` values (call `createId`) and their `order` is set to `nextEntryOrder(existingEntries)`. No deduplication by content — if the AI proposes an entry that looks like an existing one, it still gets appended (the user can delete it later).
   - **Skills**: merge `uncategorized` by deduplicating on `name` (case-insensitive). If an AI-proposed skill name matches an existing uncategorized skill, keep the existing one and drop the duplicate. Merge `groups` by matching on `title` (case-insensitive): if a group with the same title exists, merge skills by deduplicating on `name`; if a group title is new, append the entire group. Preserve groups the AI didn't mention, including their existing skills and order.
   - **Custom**: if titles match (case-insensitive), merge `data` shallowly (same meaningful-value override rule as singletons) and append `entries`; if titles differ, keep the existing section unchanged (do not add the proposed section as a duplicate).
2. Update `acceptResumeSuggestion` in the store to use `mergeSections` instead of replacing sections wholesale. The section ordering logic remains: merged sections are re-indexed sequentially.
3. Update `ResumeExtractionReviewScreen` — no changes needed; it already calls `acceptResumeSuggestion` per section or for all.

### Task 2: AI Safety Tests
**File:** `__tests__/resume/extractionSuggestion.test.ts`

Add tests:
- Accepting an experience section when 20 entries already exist preserves all 20 and appends AI entries at the end with new IDs.
- Accepting a skills section merges groups and deduplicates skills by name (case-insensitive).
- Accepting a singleton (personalInfo) merges fields without wiping unrelated fields. Empty AI fields do not overwrite existing values.
- Accepting a custom section with a different title leaves the existing custom section untouched.
- "Accept all" on a resume with pre-existing manual edits in multiple sections preserves all manual content.
- Accepting a section twice (double-accept) is idempotent: no duplicate entries are created.

---

### Task 16: Data Model — Add firstName/lastName
**File:** `src/types/resume.ts`

Add optional `firstName?: string` and `lastName?: string` to `PersonalInfoData`. `fullName` remains optional. Both new fields default to `undefined`. No migration needed — MMKV stores JSON; missing fields deserialize as `undefined`.

---

### Task 4: Personal Information — First/Last Name
**Files:** `src/components/resumeEditor/PersonalInfoSection.tsx`

1. Show First name and Last name inputs above the fullName input.
2. When the user types in First name or Last name, derive `fullName` as `${firstName} ${lastName}`.trim()` and write it to the store via `updatePersonalInfo`. This is a one-way derivation: editing `fullName` directly does NOT populate first/last.
  3. If both `firstName` and `lastName` are empty, the `fullName` input is editable as before. If either has a value, `fullName` is derived and the `fullName` input is hidden, replaced by a small helper `Text` reading "Auto-generated from first and last name" in `editorColors.muted`.
4. When the user clears a first/last name field after both were populated, `fullName` updates to reflect the remaining value (or becomes empty string if both are cleared).

### Task 10: Contact Reordering
**Files:** `src/utils/resume/contentMutators.ts`, `src/components/resumeEditor/ContactsEditor.tsx`, `src/components/resumeEditor/PersonalInfoSection.tsx`

1. Add `moveContact` to `contentMutators.ts`:
   Swaps the item at `index` with `index + dir` within the specified array. Returns content unchanged if out of bounds.
2. Update `ContactsEditor` props to accept optional `onMoveUp?: (index: number) => void` and `onMoveDown?: (index: number) => void`.
3. When provided, render small ↑ ↓ text buttons (compact, 32×32) on each contact row between the value input and the Remove button. Move Up is disabled when `index === 0`. Move Down is disabled when `index === values.length - 1`.
4. In `PersonalInfoSection`, pass the move callbacks to each `ContactsEditor` instance, wired to `moveContact` with the appropriate field name.

---

### Task 5: Experience Section — Links Field
**File:** `src/components/resumeEditor/ExperienceSection.tsx`

Add a `ContactsEditor` for `entry.links` at the bottom of the experience entry form. Props: `isLink={true}`, `valuePlaceholder="https://..."`. Do NOT use `RepeatableStrings` because `LinkValue` carries an optional `label` field.

---

### Task 6: Hide vs Delete Clarity
**Files:** `src/components/resumeEditor/SectionShell.tsx`, `src/components/resumeEditor/RepeatableSectionEditor.tsx`

1. In `SectionShell`: change the Delete button to `mode="outlined"` with `textColor={editorColors.danger}`. This gives it a bordered danger appearance distinct from the plain-text Show/Hide buttons.
2. In `RepeatableSectionEditor`: rename the "Hide" button label to "Collapse".
3. Verify all Remove/Delete buttons use `textColor={editorColors.danger}`.

---

### Task 7: Entry Action Bar Consolidation (Mobile UX)
**Files:** `src/components/resumeEditor/RepeatableSectionEditor.tsx`, `src/components/resumeEditor/styles.ts`

1. Replace the single header actions row with a wrapped container: `flexDirection: 'row', flexWrap: 'wrap', gap: 4`.
2. Add style `editorStyles.headerAction` with `minWidth: 32, minHeight: 32, paddingHorizontal: 8, paddingVertical: 4`.
3. Primary actions (Collapse, Move Up, Move Down) appear first. Secondary (Duplicate, Delete) follow.
4. Move Up disabled when entry is first. Move Down disabled when entry is last.
5. No overflow menu.

---

### Task 9: Skills Reordering
**Files:** `src/utils/resume/contentMutators.ts`, `src/components/resumeEditor/SkillsSection.tsx`

1. Add `reorderSkillGroup(content, sectionId, groupId, dir)` and `reorderSkill(content, sectionId, groupId, skillId, dir)` to `contentMutators.ts`. Both return content unchanged if out of bounds.
2. In `SkillsSection`:
   - Each group card header gets ↑ ↓ buttons (disabled at boundaries).
   - Each skill chip gets ↑ ↓ buttons to the right of the skill name (disabled at boundaries).
   - Uncategorized skills get the same treatment.
3. Wire up through `useResumeContent`.

---

### Task 8: Section Adder Expansion
**Files:** `src/components/resumeEditor/SectionAdder.tsx`, `src/screens/ResumeEditorScreen.tsx`

1. Add preset custom-section buttons in a "More sections" row: Languages, Awards, Publications, Volunteer Experience.
2. Each button calls `onAdd('custom', title)`. Update `onAdd` signature to `(type: SectionType, title?: string) => void`.
3. In `ResumeEditorScreen.handleAddSection`, pass optional title to `createSection`.
4. Deduplication: disable preset button if a custom section with the same title (case-insensitive) already exists.

---

### Task 3: Empty Resume Experience
**File:** `src/screens/ResumeEditorScreen.tsx`

1. Hide the "Original extracted text" card when `resume.text` is empty or whitespace-only.
2. Show the empty-state card when ALL of the following are true:
   - `content.sections.length === 2`
   - The set of section types is exactly `{'personalInfo', 'intro'}` (order-independent)
   The empty state reappears if the user later removes all other sections and returns to this minimal state.
3. Styling: wrap the empty-state content in an `AppCard`. Add a custom style `styles.emptyStateCard` with `borderTopColor: editorColors.accent, borderTopWidth: 3, backgroundColor: '#F0FDFA'` (light teal tint) to read as an invitation. The card contains a `Text` title "Start building your resume" and a row of `AppButton` components (mode="outlined", compact) for each quick-add section.
4. `SectionAdder` gets a subtle `borderTopWidth: 1, borderTopColor: editorColors.border` to visually connect to the card stack.

---

### Task 11: Preview Polish
**File:** `src/screens/ResumePreviewScreen.tsx`

1. Banner at top: "Previewing visible sections. N sections are hidden." (count `visible === false`).
2. Below visible sections, collapsible "Hidden sections" card (collapsed by default). When expanded, each hidden section renders as a dimmed placeholder: `opacity: 0.5`, label "Hidden: [title]", no entry details.

---

### Task 12: Save UX Indicator
**Files:** `src/components/common/SaveIndicator.tsx` (new), `src/screens/ResumeEditorScreen.tsx`

1. Create `SaveIndicator`: small inline `Text` showing "Saved ✓". Props: `visible: boolean`.
2. In `ResumeEditorScreen`, subscribe to `resumes` and `currentResumeId`. When the current resume's `updatedAt` changes, set local `savedAt` timestamp. Show indicator for 1.5s after a 300ms quiet period (debounce to avoid flicker during typing). Reset when switching resumes.
3. Replace the top `AppCard` header with a custom `View` row (do NOT use `AppCard.Title`). Layout:
   - Left side: `Text` for resume name (`fontSize: 18, fontWeight: '700'`) + `Text` for subtitle "Structured Resume Editor" (`fontSize: 13, color: editorColors.muted`).
   - Right side: `SaveIndicator` aligned to the right.
   Wrap both sides in a `View` with `flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'`. Style the indicator as `fontSize: 12`, `color: editorColors.muted`.

---

### Task 13: Accessibility Pass
**Files:** `src/components/AppButton.tsx`, `src/components/AppTextInput.tsx`, `src/components/resumeEditor/styles.ts`, all editor components, `src/screens/ResumeEditorScreen.tsx`, `src/screens/ResumePreviewScreen.tsx`

1. `AppButton`: accept `accessibilityLabel?: string`, `accessibilityHint?: string`, `accessibilityRole?: string` and forward to `Pressable`.
2. `AppTextInput`: forward `label` as `accessibilityLabel` on `TextInput`. Accept optional `accessibilityHint` and `accessibilityRole`.
3. Editor buttons: add accessibility labels and hints per the list in the Key Decisions table.
4. Verify all `AppTextInput` instances have `label` props.

---

### Task 14: Performance Validation
**File:** `__tests__/resume/performance.test.ts` (new)

1. Build a large resume in memory (20 exp, 50 proj, 10 edu, 100 skills, 50 certs, 5 custom sections with 10 entries each).
2. Assert each pure-function mutation (`addEntry`, `removeEntry`, `reorderEntries`, `addSection`, `reorderSections`) completes in < 50ms using `performance.now()`.
3. Assert JSON round-trip (`JSON.stringify(JSON.parse(JSON.stringify(content)))`) completes in < 100ms.
4. Do NOT assert React render time — test-renderer overhead varies. Assert pure function execution only.

---

### Task 15: Comprehensive Test Coverage
**Files:** Multiple test files

Add/update tests:
- **`__tests__/resume/contentMutators.test.ts`**: `moveContact` for each field; `reorderSkillGroup`; `reorderSkill`.
- **`__tests__/resume/extractionSuggestion.test.ts`**: AI merge safety (see Task 2).
- **`__tests__/resume/sectionOperations.test.ts`** (new): add/remove/reorder sections, toggle visibility, rename custom, preset custom dedup, add/remove/duplicate/reorder entries.
- **`__tests__/resume/personalInfo.test.ts`** (new): first/last derives fullName; fullName edit doesn't split; both empty shows empty fullName; multiple contacts; contact reorder.
- **`__tests__/resume/skillsOperations.test.ts`** (new): group reorder, skill reorder within group, skill reorder in uncategorized, move between groups.

---

### Task 16: Data Model Stability Check
**Files:** `src/types/resume.ts`, `__tests__/resume/migration.test.ts`

1. Verify in `src/types/resume.ts`:
   - `ResumeSection` union matches all switch statements in renderers.
   - `ResumeEntry` union covers all repeatable entry types.
   - `ProjectEntry.associatedExperienceIds` is the sole association field (no duplicate state).
   - `firstName`/`lastName` are optional and require no migration.
2. Add a migration test in `__tests__/resume/migration.test.ts`: deserialize a `PersonalInfoData` JSON blob that lacks `firstName`/`lastName` fields and assert it is valid TypeScript and the new fields are `undefined`.

---

## 4. Validation Plan

1. **Typecheck:** `npx tsc --noEmit`
2. **Lint:** `npm run lint`
3. **Unit tests:** `npm test -- --testPathPattern="resume/"` (runs all resume-related tests)
4. **Full test suite:** `npm test`
5. **Manual smoke test:**
   - Create resume from scratch → verify only PersonalInfo + Intro appear, with clear add-section prompts.
   - Add 20 experiences → verify scroll is smooth, reorder works, collapse works.
   - Add 100 skills in groups → verify reorder works, no lag.
   - Run AI extraction → accept one section → verify existing entries are preserved.
   - Toggle section hide → verify preview reflects hidden state.
   - Delete a section → verify it is gone from content and preview.
   - Reorder sections → verify order persists after app restart.
   - Add contacts → verify reorder works.
   - Split name into first/last → verify fullName stays in sync.
   - Add preset "Languages" section → verify it appears as a custom section titled "Languages".
   - Try to add "Languages" again → verify it is not duplicated.
   - Accept AI suggestion on a resume with 20 manual experiences → verify all 20 remain and AI entries are appended.
   - Collapse an entry → verify it collapses (not hides from output).
   - Hide a section → verify it appears as "Hidden" in preview, not in visible output.
   - Edit a field → verify "Saved" indicator appears briefly.

---

## 5. Deferred (Out of Scope for Phase 5)

- ATS scoring
- Job description matching
- Multiple resume templates / template marketplace
- Advanced PDF designer
- Full version history
- Cloud synchronization
- Collaboration
- Drag-and-drop reordering
- Debounced autosave
- Field-level AI diffing UI (we implement automatic safe merge; a manual diff viewer is future work)
- Languages/Awards/etc. as first-class section types (they remain custom sections with preset titles)

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `mergeSections` logic is subtle and could miss edge cases | Write the 6 AI safety tests in Task 2 before implementing the merge. Use property-based testing: create random existing sections, merge with random proposals, assert existing entries are never removed. |
| `firstName`/`lastName` sync creates unexpected `fullName` values | Keep the derivation simple: one-way from first/last → fullName. Never split fullName back. Add tests for clear-after-populate. |
| Empty-state trigger fires unexpectedly | Guard strictly: only when `sections.length === 2` AND types are exactly `personalInfo` + `intro`. Log or test edge cases where user has 2 sections of other types. |
| Save indicator flickers during rapid typing | Use 300ms debounce as specified. If flicker persists in testing, increase to 500ms. |
| Wrapped action buttons still feel cramped on small screens | Test on the smallest supported RN device width (e.g., 320px). If buttons wrap to 3+ rows, consider making Duplicate/Delete a single "More actions" button. (This is the one case where an overflow menu becomes acceptable.) |
| Skills reorder buttons add visual noise | Use compact text buttons (not icon buttons) and rely on `compact` mode + small font. If groups have many skills, consider only showing reorder buttons on hover/focus (RN: `onFocus`/`onBlur`). |

---

## 7. Definition of Done

Phase 5 is complete when:
1. All 16 tasks are implemented.
2. Typecheck passes (`npx tsc --noEmit`).
3. Lint passes (`npm run lint`).
4. Full test suite passes (`npm test`).
5. Manual smoke test items in §4 all pass on a physical device or simulator.
6. No AI acceptance path can wipe out existing user entries (verified by Task 2 tests + manual test).
7. A from-scratch resume shows only PersonalInfo + Intro with an obvious "Start building" prompt.
8. All new reorder, add, and delete flows work for contacts, skills, entries, and sections.
9. Preview shows hidden sections as placeholders.
10. Save indicator appears after edits without flickering during typing.

---

## 8. Implementation Reference (Concrete Patterns)

### 8.1 `mergeSections` Algorithm

```typescript
// contentMutators.ts
import {createId, nextEntryOrder} from './ids';

const isMeaningful = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const mergeString = (existing: string | undefined, proposed: string | undefined): string =>
  isMeaningful(proposed) ? (proposed as string) : (existing ?? '');

const mergeArray = <T>(existing: T[] | undefined, proposed: T[] | undefined): T[] =>
  isMeaningful(proposed) ? (proposed as T[]) : (existing ?? []);

const mergeData = <T extends Record<string, unknown>>(existing: T, proposed: T): T => {
  const result = {...existing};
  for (const key of Object.keys(proposed) as (keyof T)[]) {
    const pVal = proposed[key];
    if (isMeaningful(pVal)) {
      result[key] = pVal as T[keyof T];
    }
  }
  return result;
};

export const mergeSections = (existing: ResumeSection, proposed: ResumeSection): ResumeSection => {
  if (existing.type !== proposed.type) return existing;

  switch (existing.type) {
    case 'personalInfo':
    case 'intro': {
      const eData = (existing as {data: Record<string, unknown>}).data;
      const pData = (proposed as {data: Record<string, unknown>}).data;
      return {...existing, data: mergeData(eData, pData)} as ResumeSection;
    }
    case 'experience':
    case 'projects':
    case 'education':
    case 'certifications': {
      const eEntries = (existing as {entries: any[]}).entries;
      const pEntries = (proposed as {entries: any[]}).entries;
      const appended = pEntries.map(entry => ({
        ...entry,
        id: createId('entry'),
        order: nextEntryOrder(eEntries),
      }));
      return {...existing, entries: [...eEntries, ...appended]} as ResumeSection;
    }
    case 'skills': {
      const eSkills = existing as {groups: SkillGroup[]; uncategorized: SkillItem[]};
      const pSkills = proposed as {groups: SkillGroup[]; uncategorized: SkillItem[]};

      const mergedUncategorized = [...eSkills.uncategorized];
      for (const s of pSkills.uncategorized) {
        if (!mergedUncategorized.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
          mergedUncategorized.push(s);
        }
      }

      const mergedGroups = [...eSkills.groups];
      for (const pg of pSkills.groups) {
        const idx = mergedGroups.findIndex(g => g.title.toLowerCase() === pg.title.toLowerCase());
        if (idx >= 0) {
          const mergedSkills = [...mergedGroups[idx].skills];
          for (const s of pg.skills) {
            if (!mergedSkills.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
              mergedSkills.push(s);
            }
          }
          mergedGroups[idx] = {...mergedGroups[idx], skills: mergedSkills};
        } else {
          mergedGroups.push(pg);
        }
      }

      return {...existing, uncategorized: mergedUncategorized, groups: mergedGroups} as ResumeSection;
    }
    case 'custom': {
      const eCustom = existing as {title?: string; data: CustomSectionData};
      const pCustom = proposed as {title?: string; data: CustomSectionData};
      if (eCustom.title?.toLowerCase() !== pCustom.title?.toLowerCase()) return existing;
      return {
        ...existing,
        data: {
          ...eCustom.data,
          ...(isMeaningful(pCustom.data.content) ? {content: pCustom.data.content} : {}),
          entries: [...(eCustom.data.entries ?? []), ...(pCustom.data.entries ?? [])],
        },
      } as ResumeSection;
    }
  }
};
```

### 8.2 `acceptResumeSuggestion` with `mergeSections`

In `useResumeStore.ts`, replace the `const merged = [...remaining]; for (const accepted of toAccept) { ... }` block with:

```typescript
const merged: ResumeSection[] = [...remaining];
for (const accepted of toAccept) {
  if (accepted.type === 'custom') {
    const key = accepted.title?.toLowerCase();
    const idx = merged.findIndex(s => s.type === 'custom' && s.title?.toLowerCase() === key);
    if (idx >= 0) {
      merged[idx] = mergeSections(merged[idx], accepted);
    } else {
      merged.push(accepted);
    }
  } else {
    const idx = merged.findIndex(s => s.type === accepted.type);
    if (idx >= 0) {
      merged[idx] = mergeSections(merged[idx], accepted);
    } else {
      merged.push(accepted);
    }
  }
}
```

### 8.3 SaveIndicator Hook Pattern

```typescript
// ResumeEditorScreen.tsx
const [savedAt, setSavedAt] = useState<number | null>(null);
const resumes = useResumeStore(state => state.resumes);
const currentResumeId = useResumeStore(state => state.currentResumeId);
const currentResume = useMemo(() => resumes.find(r => r.id === currentResumeId), [resumes, currentResumeId]);
const prevUpdatedAt = useRef(currentResume?.updatedAt ?? 0);
const debounceRef = useRef<ReturnType<typeof setTimeout>>();

useEffect(() => {
  if (currentResume && currentResume.updatedAt !== prevUpdatedAt.current) {
    prevUpdatedAt.current = currentResume.updatedAt;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSavedAt(Date.now()), 300);
  }
  return () => clearTimeout(debounceRef.current);
}, [currentResume]);

const showSaved = savedAt !== null && Date.now() - savedAt < 1500;
```

### 8.4 Empty-State Conditional

```typescript
const isMinimalResume = content.sections.length === 2 &&
  content.sections.every(s => s.type === 'personalInfo' || s.type === 'intro');
```

### 8.5 firstName/lastName Derivation

```typescript
// PersonalInfoSection.tsx
const deriveFullName = (firstName?: string, lastName?: string): string =>
  `${firstName ?? ''} ${lastName ?? ''}`.trim();

// When firstName or lastName changes:
const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
  const next = {...data, [field]: value};
  next.fullName = deriveFullName(next.firstName, next.lastName);
  update(prev => updatePersonalInfo(prev, section.id, next));
};

// Show logic:
const showFullName = !data.firstName && !data.lastName;
```

### 8.6 ContactsEditor Move Buttons

```typescript
// ContactsEditor.tsx - inside the list.map render:
{onMoveUp && (
  <AppButton
    mode="text"
    compact
    disabled={index === 0}
    onPress={() => onMoveUp(index)}
    accessibilityLabel="Move up"
    accessibilityHint="Move this contact earlier"
  />
)}
{onMoveDown && (
  <AppButton
    mode="text"
    compact
    disabled={index === values.length - 1}
    onPress={() => onMoveDown(index)}
    accessibilityLabel="Move down"
    accessibilityHint="Move this contact later"
  />
)}
```

### 8.7 Preview Hidden Sections

```typescript
// ResumePreviewScreen.tsx
const visibleSections = ordered.filter(s => s.visible);
const hiddenSections = ordered.filter(s => !s.visible);
const [showHidden, setShowHidden] = useState(false);

// Render:
{hiddenSections.length > 0 && (
  <AppCard>
    <AppButton compact onPress={() => setShowHidden(v => !v)}>
      {showHidden ? 'Hide' : 'Show'} {hiddenSections.length} hidden section{hiddenSections.length === 1 ? '' : 's'}
    </AppButton>
    {showHidden && hiddenSections.map(s => (
      <View key={s.id} style={{opacity: 0.5, marginTop: 8}}>
        <Text style={styles.entryTitle}>Hidden: {s.title ?? s.type}</Text>
      </View>
    ))}
  </AppCard>
)}
```

### 8.8 Preview Name Display with firstName/lastName

In `ResumePreviewScreen.tsx`, update the personal info renderer:

```typescript
case 'personalInfo': {
  const d = section.data;
  const displayName = d.fullName?.trim() || [d.firstName, d.lastName].filter(Boolean).join(' ') || '';
  // ... rest of rendering uses displayName instead of d.fullName
}
```

### 8.9 Custom Header in ResumeEditorScreen

Replace the existing `<AppCard><AppCard.Title .../></AppCard>` with:

```tsx
<AppCard>
  <View style={styles.editorHeader}>
    <View>
      <Text style={styles.editorTitle}>{resume.name}</Text>
      <Text style={styles.editorSubtitle}>Structured Resume Editor</Text>
    </View>
    <SaveIndicator visible={showSaved} />
  </View>
</AppCard>
```

Where `styles.editorHeader` is `{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12}`. Do NOT wrap this in `AppCard.Content` — it is the card's direct child, replacing `AppCard.Title`.

### 8.10 Preview Edge Case: No Visible Sections

If `visibleSections.length === 0`, render a message: "All sections are hidden. Use the editor to show sections you want in your resume." This prevents a blank preview screen.

### 8.11 Accessibility for SaveIndicator

```tsx
<Text
  accessible
  accessibilityLabel={showSaved ? 'Saved' : 'Not saved'}
  accessibilityRole="status"
  style={...}>
  Saved ✓
</Text>
```

Use `accessibilityRole="status"` so screen readers announce state changes politely.
