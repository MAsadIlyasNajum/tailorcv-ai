# Fix "Maximum update depth exceeded" in Resume Editor

## Goal
Stop the infinite-render loop in the structured resume editor that fires when a user adds an experience entry. Preserve the already-shipped templates, PDF exporter, preview screen, and the 304-test suite.

## Root Cause (verified against code)
The loop is in the Zustand selectors in `src/components/resumeEditor/useResumeContent.ts`, not in the `update` closure the previous attempt patched.

- `useSectionOps` (lines 49–53) and `useEntryOps` (lines 82–89) both subscribe with:
  ```ts
  state.resumes.find(r => r.id === resumeId)?.content?.sections.map(s => s.id) ?? []
  ```
  This returns a **new array reference on every store notification**. Zustand v5's `useStore` uses `useSyncExternalStore` with `Object.is` snapshot equality, so every notification forces a re-render even when the underlying id list is unchanged. Multiple components subscribe to the same selector family, so the cascade trips React's "Maximum update depth" guard during normal use (e.g. typing into a field fires `updateResumeContent` → new `resumes` array → new mapped `orderIds` snapshot → re-render → re-snapshot).
- The previous `useMemo` / `useRef` changes in this hook do not address that, because the unstable value is the selector snapshot itself, not the returned hook value.
- `useShallow` from `zustand/react/shallow` is already installed (`package.json` has `zustand ^5.0.15`; `node_modules/zustand/react/shallow.d.ts` exports `useShallow`) and is the correct primitive: it caches the last returned array and returns the same reference when the shallow comparison is true.

## Files To Change
1. `src/components/resumeEditor/useResumeContent.ts` — wrap the two `orderIds` selectors in `useShallow`, and use a module-level `EMPTY_IDS` constant so the empty case is referentially stable. Remove the no-op `useMemo` on `content`.
2. `src/screens/ResumeEditorScreen.tsx` — no functional change needed; the hook fix above removes the loop. Leave the `useMemo` deps as they are.
3. `src/components/resumeEditor/ExperienceSection.tsx` — no change. `DerivedProjects` already reads the same content reference and will become stable automatically.

No edits to `src/store/useResumeStore.ts`, templates, PDF exporter, or preview screen.

## Implementation Steps (ordered)

1. In `useResumeContent.ts`:
   - Add `import {useShallow} from 'zustand/react/shallow';`
   - Add module constant `const EMPTY_IDS: readonly string[] = Object.freeze([]);` (or just `const EMPTY_IDS: string[] = [];`) at the top of the file.
   - Replace the `orderIds` selector in `useSectionOps` with:
     ```ts
     const orderIds = useResumeStore(
       useShallow(
         state =>
           state.resumes.find(r => r.id === resumeId)?.content?.sections.map(s => s.id) ??
           EMPTY_IDS,
       ),
     );
     ```
   - Same change in `useEntryOps` (entry ids only).
   - In `useResumeContent`, drop the `useMemo` around `content` and return `{content: content ?? EMPTY_CONTENT, update}` directly. Keep the `updateRef` / `update` closure as it stands — the previous fix for function identity is correct and harmless.

2. No other source edits.

## Validation (run from `/Users/apple/Downloads/tailorcv-ai`)
- `npx tsc --noEmit` — must pass.
- `npm test -- --silent` — expect 304 passing tests, no new failures.
- `npm run lint` — must pass.
- Manual smoke (dev device or Metro): Resume Editor → Add section "Experience" → tap "+ Add experience" → no console warning, the new entry card renders, typing in Company / Role does not re-render the screen, Derived Projects line updates only when the projects section actually changes.
- Regression check: adding/removing/renaming sections and entries, moving entries up/down, duplicating, hiding, deleting all still work; preview screen and PDF export unaffected.

## Risks & Edge Cases
- `useShallow` does a shallow compare per notification (O(n) where n = section or entry count, typically < 20). Acceptable.
- The `?? EMPTY_IDS` fallback matters: returning a fresh `[]` would re-introduce the loop in the no-sections case. Keep it.
- The legacy `addProfessionalExperience` flow bypasses `useResumeContent` and is not affected.
- If a future change adds a store action that mutates `resume.content` in place (without producing a new `sections` array), `useShallow` will correctly detect the ids as unchanged and skip re-render — this is desired.

## Out Of Scope
- Migrating the store to `immer` for cheaper diffing.
- Refactoring `DerivedProjects` into the parent.
- Touching the templates / PDF / preview work.
