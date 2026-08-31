# TailorCV AI — MVP 2 Implementation Audit & Completion Plan

**Saved:** 2026-08-28  
**Scope:** Complete and harden the existing MVP 2 implementation while preserving working MVP 1/MVP 2 functionality.

---

## A. Executive Summary

**Current MVP 2 completion level:** ~65% implemented, ~35% missing or incomplete.

**Strongest existing areas:**
- Multiple resumes with full CRUD (add, rename, delete, select active)
- Resume PDF extraction + text paste
- Professional Experience structured editor with full CRUD
- Suggestion editing with AI-original preservation and reset
- Analysis history with enrichment and delete
- JobApplication entity with proper relationships
- Migration from MVP1 legacy snapshot
- Error handling with user-friendly messages
- 13 existing Jest tests covering core parsers, store persistence, and key screens

**Biggest gaps:**
1. **No PDF export/generation** — Major MVP2 requirement entirely missing
2. **FinalResumeOutput not persisted** — Lost on app restart; no navigation trigger from AnalysisResultScreen
3. **Keyword Coverage lacks importance weighting** — Simple ratio, not weighted coverage as specified
4. **Analytics is in-memory only** — Events disappear on restart; **DECISION: Persist to MMKV** (user confirmed)
5. **No visible "Generate Final Resume" button** — `runFinalOutputGeneration` exists but is unreachable from UI
6. **Gemini model name is a placeholder** (`gemini-3.6-flash`) — **DECISION: Keep existing** (user confirmed). Must be verified against production Google AI API before release or all AI features will fail.
7. **Hardcoded API key in `.env`** — Security risk

**Biggest technical risks:**
- PDF generation native dependency compatibility on Android
- AI output reliability and potential fabrication in final resume
- MMKV persistence correctness for large datasets (50+ history items)
- Sentry/analytics sensitive data leakage if misconfigured

**Recommended implementation strategy:**
Execute in dependency order: data model fixes → persistence → final output flow → PDF export → UX polish → tests → Android runtime validation. Do not rebuild existing working features.

---

## B. Feature Gap Matrix

| Area | Status | Existing Implementation | Gap | Required Action | Verification |
|------|--------|------------------------|-----|-----------------|--------------|
| Multiple Resumes | COMPLETE | `ResumesScreen`, store CRUD, sorted by lastUsedAt | None | — | Runtime verify add/select/rename/delete |
| Resume CRUD | PARTIAL | Add, rename, delete, view detail exist | **DECISION: Auto-delete analyses when resume is deleted** (user confirmed); no duplicate detection | Implement cascade delete; verify referential integrity | Runtime verify |
| Resume from PDF | COMPLETE | `@react-native-documents/picker` + `react-native-pdf-text-extractor` + normalization | None | — | Runtime verify on Android |
| Resume from text | COMPLETE | Paste flow with 50-char minimum | None | — | Runtime verify |
| Resume metadata | COMPLETE | `sourceType`, `lastUsedAt`, file metadata | None | — | — |
| History | COMPLETE | Enriched timeline, view/delete, sorted by updatedAt | None | — | Runtime verify 50+ items performance |
| JobApplication | COMPLETE | Entity, store, screen, relationships | None | — | Runtime verify |
| Suggestion Editing | COMPLETE | Edit summary, skills, experience improvements, ATS tips; reset to AI original | None | — | Runtime verify persist edits across restart |
| Professional Experience | COMPLETE | Full CRUD editor with bullets, dates, current role switch | None | — | Runtime verify reuse in final output |
| Resume Match | PARTIAL | AI-generated 0-100, clamped, explanation copy | No custom validation beyond clamp; score is AI-dependent | Verify AI prompt enforces truthful scoring | Runtime verify edge cases |
| Keyword Coverage | PARTIAL | Simple ratio `matching / total * 100` | **No importance weighting** as specified; treated as informational only | Implement weighted coverage or document as informational metric | Code review + runtime verify |
| FinalResumeOutput | PARTIAL | Type, parser, generation use case, screen exist | **Not persisted to MMKV**; **no "Generate" button on AnalysisResultScreen**; navigation unreachable | Add persistence; add button + flow | Runtime verify persist across restart |
| Tailored Resume UI | PARTIAL | `FinalResumeOutputScreen` exists | No navigation trigger from analysis; user cannot reach it in normal flow | Wire navigation from AnalysisResultScreen | Runtime verify flow |
| PDF Export | MISSING | No library, no service, no screen | Complete implementation needed | Add `react-native-html-to-pdf` or similar; build service + screen | Runtime verify on Android |
| Copy/Share | PARTIAL | Copy sections + full analysis; Share via `react-native-share` | No copy/share on FinalResumeOutputScreen (because it's unreachable) | Wire up when FinalResumeOutput is reachable | Runtime verify |
| Analytics | PARTIAL | In-memory event logger, 12 events defined | **DECISION: Persist to MMKV** (user confirmed) | Add MMKV persistence for events | Runtime verify events survive restart |
| Sentry | PARTIAL | `@sentry/react-native` initialized with empty DSN fallback | DSN likely empty in production; no sensitive data filtering configured | Configure DSN; add `beforeSend` to strip resume/JD text | Runtime verify |
| Persistence | PARTIAL | MMKV stores resumes, apps, analyses, current IDs | `finalResumeOutput` not persisted; no version field for future migrations | Add `finalResumeOutput` to MMKV; add schema version key | Runtime verify restart |
| Migration | COMPLETE | MVP1 `ResumeStateSnapshot` → collection model; idempotent detection | None | — | Runtime verify with legacy data |
| Error Handling | COMPLETE | Validation-first, user-friendly messages, try/catch, loading states | None | — | Runtime verify AI failures |
| Android Validation | NEEDS RUNTIME VERIFICATION | Native config looks correct | PDF export, share, PDF extraction untested on device | Build + run on Android emulator/device | Android runtime |
| Tests | PARTIAL | 13 test files, Jest configured | Missing tests for: FinalResumeOutput persistence, PDF service, migration edge cases, Android share | Add tests for gaps | Run `npm test` |

---

## C. Codebase Map

### Navigation
- `src/app/navigation/AppNavigator.tsx` — Root `NativeStackNavigator` + `BottomTabNavigator`
- `src/constants/routes.ts` — Route name constants

### Screens
- `src/screens/HomeScreen.tsx` — Dashboard with resume/JD status + latest analysis summary
- `src/screens/UploadResumeScreen.tsx` — PDF picker + text paste
- `src/screens/ResumesScreen.tsx` — Resume list, select, rename, delete
- `src/screens/ResumeDetailScreen.tsx` — Resume text, metadata, related analyses
- `src/screens/JobDescriptionScreen.tsx` — JD input, validation, trigger analysis
- `src/screens/ExperienceEditorScreen.tsx` — Professional Experience CRUD
- `src/screens/AnalysisResultScreen.tsx` — Match score, keywords, suggestions, copy/share
- `src/screens/EditSuggestionsScreen.tsx` — Edit AI suggestions with reset
- `src/screens/FinalResumeOutputScreen.tsx` — Display final polished output
- `src/screens/JobApplicationDetailScreen.tsx` — Application details + related analysis
- `src/screens/HistoryScreen.tsx` — Timeline of past analyses
- `src/screens/SettingsScreen.tsx` — Privacy info, roadmap

### Store
- `src/store/useResumeStore.ts` — Single Zustand store for all entities; manual MMKV persistence via `persistCollections()`

### Persistence
- `src/services/storage/storage.ts` — MMKV wrapper, keys, migration helpers

### AI Service
- `src/services/ai/geminiService.ts` — Gemini API calls with 30s timeout
- `src/services/ai/analyzeResumeUseCase.ts` — Orchestration: analysis, experience improvement, final output generation
- `src/services/ai/promptBuilder.ts` — Three prompt builders (analysis, experience, final output)
- `src/services/ai/analysisParser.ts` — Parse + validate analysis JSON
- `src/services/ai/finalOutputParser.ts` — Parse + validate final output JSON
- `src/services/ai/experienceImprovementParser.ts` — Parse experience improvements
- `src/services/ai/types.ts` — AI response contracts

### PDF Services
- `src/services/pdf/documentPicker.ts` — PDF file picking + validation
- `src/services/pdf/pdfExtractor.ts` — PDF text extraction via `react-native-pdf-text-extractor`

### Other Services
- `src/services/analytics/analytics.ts` — In-memory event tracker
- `src/services/analytics/crashReporting.ts` — Sentry wrapper

### Validation
- `src/utils/validation/jobDescriptionValidation.ts` — JD length validation
- `src/utils/validation/experienceValidation.ts` — Experience entry validation
- `src/utils/validation/finalOutputValidation.ts` — Final output validation

### Types
- `src/types/resume.ts` — All domain models

### Tests
- `__tests__/` — 13 test files

### Android
- `android/build.gradle` — Project-level build config
- `android/app/build.gradle` — App-level build config
- `android/app/src/main/AndroidManifest.xml` — Permissions + activity config

---

## D. Data Model Audit

### Current Models

```
Resume
  ├── id: string
  ├── name: string
  ├── sourceType: 'pdf' | 'text'
  ├── text: string
  ├── metadata?: { uri, fileName, fileSize, mimeType, extension }
  ├── professionalExperiences: ProfessionalExperience[]
  ├── createdAt: number
  ├── updatedAt: number
  └── lastUsedAt: number

ProfessionalExperience
  ├── id: string
  ├── jobTitle: string
  ├── company: string
  ├── location?: string
  ├── startDate: string
  ├── endDate?: string | null
  ├── isCurrentRole?: boolean
  ├── summary: string
  ├── bulletPoints: string[]
  ├── keywords: string[]
  └── generatedSuggestions: string[]

JobApplication
  ├── id: string
  ├── resumeId: string
  ├── jobDescription: string
  ├── companyName?: string
  ├── jobTitle?: string
  ├── status: 'active' | 'archived'
  ├── createdAt: number
  └── updatedAt: number

AnalysisResult
  ├── id: string
  ├── resumeId: string
  ├── jobApplicationId: string
  ├── jobDescription: string
  ├── companyName?: string
  ├── jobTitle?: string
  ├── matchScore: number
  ├── matchingKeywords: string[]
  ├── missingKeywords: string[]
  ├── suggestedSummary: string
  ├── suggestedSkills: string[]
  ├── experienceImprovements: ExperienceImprovement[]
  ├── atsTips: string[]
  ├── userEditedSuggestions?: UserEditedSuggestions
  ├── createdAt: number
  └── updatedAt: number

FinalResumeOutput
  ├── id: string
  ├── analysisId: string
  ├── refinedSummary: string
  ├── prioritizedKeywords: string[]
  ├── polishedExperienceSections: FinalResumeOutputSection[]
  ├── finalRecommendations: string[]
  ├── cautions: string[]
  └── createdAt: number
```

### Relationship Diagram

```
Resume (1) ──→ (N) JobApplication
Resume (1) ──→ (N) AnalysisResult
JobApplication (1) ──→ (1) AnalysisResult  [current: 1:1, but schema allows N:1]
AnalysisResult (1) ──→ (1) FinalResumeOutput
Resume (1) ──→ (N) ProfessionalExperience
```

### Issues

1. **FinalResumeOutput not in MMKV** — `persistCollections()` excludes it. Lost on restart.
2. **No schema version key** — Future migrations lack version detection.
3. **JobApplication 1:1 assumption** — `HistoryScreen` filters to one analysis per app, but schema allows multiple. Current code creates a new app if none exists during analysis.
4. **No cascade delete for Resume** — Deleting a resume leaves orphaned `AnalysisResult` records. **DECISION: Auto-delete associated analyses** when resume is deleted (user confirmed).
5. **ID generation** — Uses `Date.now()-random` which is collision-resistant but not UUID. Acceptable for local-first.
6. **No `ResumeMetadata` union** — `ResumeMetadata` interface exists in types but is inlined in `Resume.metadata` rather than referenced.

### Recommended Minimal Changes

- Add `finalResumeOutput` to MMKV persistence (`final-resume-output` key)
- Add `schemaVersion` key (version `1`)
- Add `analytics-events` MMKV key for persisted event log
- Implement cascade delete: when `removeResume()` is called, also remove all `AnalysisResult` records with matching `resumeId`
- No model restructuring needed

---

## E. Primary User Flow Audit

### Trace: Open App → Select/Add Resume → Create Job Application → Enter Job → Analyze → Review Match → Review Keywords → Edit Suggestions → Generate Tailored Resume → Review Final Resume → Export PDF → Share → Return through History

| Step | Existing Screen | Existing State | Existing Service | Missing Functionality |
|------|----------------|----------------|------------------|----------------------|
| Open App | HomeScreen | Hydrated from MMKV | `hydrateLatest()`, migration | None |
| Select/Add Resume | ResumesScreen + UploadResumeScreen | `currentResumeId` set | `addResume`, `setCurrentResume` | None |
| Create Job Application | JobDescriptionScreen (auto-creates) | `currentJobApplicationId` set | `addJobApplication` | No explicit "create app" screen — auto-created on JD paste |
| Enter Job | JobDescriptionScreen | JD in state + store | `validateJobDescription` | None |
| Analyze | JobDescriptionScreen → AnalysisResultScreen | `analysisResults` appended | `runResumeAnalysis` → Gemini | None |
| Review Match | AnalysisResultScreen | `matchScore`, `matchingKeywords`, `missingKeywords` | Display only | None |
| Review Keywords | AnalysisResultScreen | Same as above | Display only | None |
| Edit Suggestions | EditSuggestionsScreen | `userEditedSuggestions` stored | Text editing + `updateAnalysisResult` | None |
| Generate Tailored Resume | **BROKEN** — no button on AnalysisResultScreen | `runFinalOutputGeneration` exists | `geminiService.generateFinalResumeOutput` | **No UI trigger; user cannot reach FinalResumeOutputScreen** |
| Review Final Resume | FinalResumeOutputScreen | `finalResumeOutput` in store only | Display only | **Not persisted; unreachable from normal flow** |
| Export PDF | **MISSING** | — | — | **No PDF service or screen** |
| Share | AnalysisResultScreen only | Clipboard + `react-native-share` | `Share.share` | No share on FinalResumeOutputScreen |
| Return through History | HistoryScreen | Enriched list | Navigation | None |

**Key finding:** The primary flow breaks at "Generate Tailored Resume." The function exists in the service layer but has no UI entry point. This is the single largest functional gap.

---

## F. Final Tailored Resume Audit

### 1. Does a complete final resume actually exist today?
**PARTIAL.** The `FinalResumeOutput` type, parser, and screen exist. The `runFinalOutputGeneration` use case exists. But the user cannot trigger it from the UI.

### 2. Is it generated from structured source data?
**YES.** Prompt receives: resume text, job description, analysis result, and structured `ProfessionalExperience[]`. Parser enforces non-empty sections.

### 3. Are user edits incorporated?
**NO.** `runFinalOutputGeneration` uses `currentAnalysis` directly, not `userEditedSuggestions`. If the user edited suggestions, those edits are NOT passed to the final output generator.

### 4. Are AI originals preserved?
**YES.** `userEditedSuggestions` stores the edited version alongside the original AI fields.

### 5. Is source grounding enforced?
**PARTIAL.** Prompts explicitly forbid fabrication. Parser validates structure. But there is no post-generation verification that the final output doesn't invent new employers, dates, or metrics.

### 6. Could AI invent unsupported facts?
**YES, theoretically.** Prompts instruct against it, but LLMs can still hallucinate. No secondary validation pass exists.

### 7. Can the user review the final resume?
**YES, IF they can reach it.** `FinalResumeOutputScreen` displays all sections. But unreachable from normal flow.

### 8. Is the final output persisted?
**NO.** `finalResumeOutput` is store-only, not written to MMKV. Lost on restart.

### 9. Can it be exported?
**NO.** No PDF export exists anywhere.

### 10. What exactly remains to be implemented?
1. Add "Generate Tailored Resume" button to `AnalysisResultScreen`
2. Persist `finalResumeOutput` to MMKV
3. Pass `userEditedSuggestions` (or merged result) to `runFinalOutputGeneration`
4. Add post-generation validation for fabrication signals (optional but recommended)
5. Wire navigation from analysis → final output → PDF export

---

## G. PDF Export Plan

### Current State
**MISSING.** No PDF generation library. No PDF service. No export screen.

### Recommended Architecture

**Dependency:** `react-native-html-to-pdf` (or `expo-print` if Expo is adopted, but current project is bare React Native).

**Service layer:** `src/services/pdf/pdfGenerator.ts`

```ts
export interface PdfExportOptions {
  fileName: string;
  htmlContent: string;
}

export interface PdfExportResult {
  filePath: string;
  fileSize?: number;
}

export const generatePdfFromHtml = async (options: PdfExportOptions): Promise<PdfExportResult>;
export const sharePdf = async (filePath: string): Promise<void>;
```

**Input:** `FinalResumeOutput` rendered to clean, ATS-friendly HTML string.

**HTML template requirements:**
- Standard fonts (Arial/Helvetica, sans-serif)
- No tables for layout (ATS-unfriendly)
- Clear section headings with bold + larger font
- Bullet points for experience
- Conservative margins (0.5-0.75in)
- Page break control (`page-break-inside: avoid` for sections)
- Black text on white background
- No headers/footers with graphics

**File handling:**
- Write to `react-native-blob-util` cache directory (already a dependency)
- File naming: `TailorCV-{company}-{date}.pdf`
- Use `react-native-share` for share sheet (already a dependency)

**Android considerations:**
- Add `WRITE_EXTERNAL_STORAGE` if targeting API < 29, or use scoped storage
- For API 29+, cache directory is sufficient for share intent
- Test with `react-native-html-to-pdf` on API 24+ (minSdk 24)

**ATS considerations:**
- Single-column layout
- Standard section names: "Professional Summary", "Skills", "Experience", "Education"
- No images, no text boxes, no headers/footers with text
- Embedded fonts or system fonts only

**Testing strategy:**
- Unit test HTML generation from `FinalResumeOutput`
- Integration test PDF generation on Android emulator
- Verify text is selectable/searchable in PDF viewer
- Verify long resumes don't truncate

**Failure handling:**
- Catch generation errors, show user-friendly message
- Offer "Copy text" fallback if PDF generation fails
- Log failure to Sentry (without content)

---

## H. Migration Plan

### Current State
MVP1 data stored under `latest-analysis` key as `ResumeStateSnapshot`.

### Migration Flow (Already Implemented)

```
App.tsx on mount
  ↓
hasMigrated() checks if new keys have data
  ↓
If not migrated + legacy snapshot exists
  ↓
migrateLegacySnapshot(snapshot)
  ↓
  - Create Resume from snapshot
  - Create JobApplication from snapshot
  - Create AnalysisResult from snapshot
  - Set current IDs
  - Delete legacy key
  ↓
hydrateLatest() loads all collections
```

### Status: COMPLETE
The migration is implemented, idempotent (`hasMigrated` prevents re-run), and safe (deletes legacy key after migration).

### Remaining Risk
- If migration partially fails (e.g., MMKV write fails mid-migration), legacy data is deleted but new data is incomplete.
- **Current implementation risk:** `migrateLegacySnapshot` writes sequentially (resume → app → analysis → delete legacy). If write 2 of 3 fails, legacy key is already deleted, leaving orphaned data.
- **Mitigation:** Rewrite `migrateLegacySnapshot` to use in-memory staging:
  1. Parse legacy snapshot into memory objects
  2. Write all three collections to MMKV
  3. Verify all three writes succeeded (check non-empty)
  4. Only then delete legacy key
  5. If any write fails, do NOT delete legacy key — allow retry on next launch

### Testing Cases
1. Fresh install → no legacy data → no migration
2. Upgrade from MVP1 with legacy data → migration runs → legacy deleted
3. Upgrade from MVP1, migration fails mid-way → legacy still present → retry on next launch
4. Already migrated → `hasMigrated()` returns true → skip
5. Corrupted legacy data → `getLatestAnalysis()` returns null → no migration, legacy key untouched

---

## I. Implementation Plan

### Phase 0 — Audit / Baseline (This Document)
**Status:** Complete.

### Pre-Flight Verification (Before Phase 1)

**CRITICAL — must complete before any implementation:**

1. **Verify Gemini model name:**
   - Test `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=YOUR_KEY` with a minimal request
   - If 404 or model not found: update `geminiService.ts` to use correct model name before proceeding
   - All AI features (analysis, experience improvement, final output) depend on this endpoint
   - **Do not proceed to Phase 2+ until model endpoint is confirmed working**

2. **Verify PDF library compatibility:**
   - Check `react-native-html-to-pdf` v6+ GitHub for RN 0.84 + new architecture support
   - Check Hermes compatibility
   - Check Android minSdk 24 compatibility
   - Document findings before Phase 4 implementation

### Phase 1 — Data Model & Persistence Fixes
**Objective:** Ensure all state survives app restart.

**Files affected:**
- `src/types/resume.ts`
- `src/services/storage/storage.ts`
- `src/store/useResumeStore.ts`

**Concrete tasks:**
1. In `storage.ts`, add:
   - `FINAL_RESUME_OUTPUT_KEY = 'final-resume-output'`
   - `saveFinalResumeOutput(result)` — `storage.set(FINAL_RESUME_OUTPUT_KEY, safeStringify(result))`
   - `getFinalResumeOutput()` — returns `FinalResumeOutput | null`
   - `SCHEMA_VERSION_KEY = 'schema-version'`, `getSchemaVersion()`, `setSchemaVersion(1)`
2. In `useResumeStore.ts`:
   - Add `finalResumeOutput` to `persistCollections()` type + implementation
   - In `hydrateLatest()`, load `finalResumeOutput` via `storage.getFinalResumeOutput()`
   - In `clearAllData()`, delete `FINAL_RESUME_OUTPUT_KEY`
3. In `App.tsx`, after `hydrateLatest()`, call `storage.setSchemaVersion(1)` if not already set

**Dependencies:** None

**Risks:** Low — straightforward addition

**Verification:** Unit test: set final output → hydrate → verify state persists. Runtime: generate final output → restart app → verify output still visible.

---

### Phase 2 — Final Tailored Resume Flow
**Objective:** Make final output generation reachable and functional.

**Files affected:**
- `src/screens/AnalysisResultScreen.tsx`
- `src/services/ai/analyzeResumeUseCase.ts`
- `src/screens/FinalResumeOutputScreen.tsx`
- `src/app/navigation/AppNavigator.tsx`

**Concrete tasks:**
1. **Update `AppNavigator.tsx`**: Change `FinalResumeOutput` route param to accept optional `analysisId?: string` (currently `undefined`). This allows deep-linking to a specific analysis's final output.
2. **Add button to `AnalysisResultScreen`**:
   - Add "Generate Tailored Resume" button below "Edit Suggestions" button
   - Button state: disabled if `isGeneratingFinalOutput`, loading spinner during generation
   - On press: call `runFinalOutputGeneration()` from store
   - On success: navigate to `ROUTES.FINAL_RESUME_OUTPUT` (optionally pass `analysisId`)
   - On error: show error card with "Try Again" + "Edit Job Description" actions
3. **Update `runFinalOutputGeneration` in `analyzeResumeUseCase.ts`**:
   - Accept optional `userEditedSuggestions` override, or derive from `currentAnalysis.userEditedSuggestions`
   - If `userEditedSuggestions` exists, merge it into the analysis data passed to the Gemini prompt:
     - Use `userEditedSuggestions.suggestedSummary` instead of `analysis.suggestedSummary`
     - Use `userEditedSuggestions.suggestedSkills` instead of `analysis.suggestedSkills`
     - Use `userEditedSuggestions.experienceImprovements` instead of `analysis.experienceImprovements`
     - Use `userEditedSuggestions.atsTips` instead of `analysis.atsTips`
   - This ensures the final output reflects user edits, not just the original AI suggestions
4. **Update `FinalResumeOutputScreen`**:
   - Add "Export PDF" button (primary action)
   - Add "Share" button using `react-native-share`
   - Add "Copy full package" button (already partially exists)
   - Show `analysisId` link back to AnalysisResultScreen
   - Handle empty state with clear CTA: "Go back to Analysis Result and generate your polished final output."

**Dependencies:** Phase 1 (persistence)

**Risks:** Medium — AI generation may fail or produce incomplete output; need error handling

**Verification:** Runtime verify full flow: analyze → edit suggestions → generate → review → copy

---

### Phase 3 — Keyword Coverage Weighting
**Objective:** Implement importance-weighted keyword coverage per MVP2 spec.

**Files affected:**
- `src/services/ai/promptBuilder.ts`
- `src/services/ai/types.ts`
- `src/services/ai/analysisParser.ts`
- `src/screens/AnalysisResultScreen.tsx`
- `src/utils/validation/jobDescriptionValidation.ts` (or new `src/utils/validation/keywordCoverage.ts`)

**Concrete tasks:**
1. **Update prompt** in `promptBuilder.ts`:
   - Change `matchingKeywords` and `missingKeywords` to objects: `{ term: string, importance: 'required' | 'important' | 'nice-to-have' }`
   - Add explicit instruction: "Assign importance based on how prominently the keyword appears in the job description: 'required' for must-have qualifications, 'important' for preferred qualifications, 'nice-to-have' for bonus qualifications."
2. **Update types** in `types.ts`:
   - Add `KeywordWithImportance` interface
   - Update `GeminiResponseContract` to use `matchingKeywords: KeywordWithImportance[]` and `missingKeywords: KeywordWithImportance[]`
3. **Update parser** in `analysisParser.ts`:
   - Parse new keyword format; if old string format is received, treat all as `importance: 'important'` (fallback)
   - Validate `importance` is one of the three allowed values
4. **Create coverage calculator** in new `src/utils/validation/keywordCoverage.ts`:
   ```ts
   export const calculateWeightedKeywordCoverage = (
     matching: KeywordWithImportance[],
     missing: KeywordWithImportance[],
   ): number => {
     const weights = { required: 3, important: 2, 'nice-to-have': 1 };
     const matchedWeight = matching.reduce((sum, k) => sum + (weights[k.importance] ?? 2), 0);
     const totalWeight = [...matching, ...missing].reduce((sum, k) => sum + (weights[k.importance] ?? 2), 0);
     if (totalWeight === 0) return 0;
     return Math.round((matchedWeight / totalWeight) * 100);
   };
   ```
5. **Update UI** in `AnalysisResultScreen.tsx`:
   - Show "Keyword Coverage: X%" (weighted) as the primary metric
   - Keep simple ratio as secondary or remove it
   - Add tooltip/explanation: "Weighted by keyword importance in the job description"
   - Handle empty keyword sets: show "—" instead of "0%"

**Dependencies:** Phase 2 (flow must work first)

**Risks:** Medium — AI may not reliably return importance labels; fallback to `'important'` weight (2) for all keywords if format is legacy

**Verification:** Unit tests for coverage calculation with all importance combinations; runtime verify with various JD/resume combos

---

### Phase 4 — PDF Export
**Objective:** Implement ATS-friendly PDF generation and export.

**Files affected:**
- `package.json` (new dependency)
- `src/services/pdf/pdfGenerator.ts` (new)
- `src/services/pdf/pdfTemplates.ts` (new)
- `src/screens/FinalResumeOutputScreen.tsx`
- `android/app/build.gradle` (if native config needed)

- **Primary:** `react-native-html-to-pdf` v6+ (supports RN 0.72+; RN 0.84 compatibility unconfirmed — verify before adding)
- **Fallback:** If `react-native-html-to-pdf` fails on RN 0.84, use `expo-print` (requires Expo modules plugin) or `react-native-print` as alternatives
- **Do NOT use:** Image-based PDF generation (fails ATS text extraction)

**Concrete tasks:**
1. Add `react-native-html-to-pdf` to `dependencies` in `package.json`
2. Run `npx pod-install` (iOS) and verify Android autolinking succeeds
3. Create `src/services/pdf/pdfGenerator.ts`:
   ```ts
   export const generatePdfFromHtml = async (html: string, fileName: string): Promise<PdfExportResult>
   export const sharePdf = async (filePath: string): Promise<void>
   ```
4. Create `src/services/pdf/pdfTemplates.ts`:
  - `renderFinalResumeToHtml(output: FinalResumeOutput, jobTitle?: string, companyName?: string): string`
  - **PDF template includes ONLY resume-ready sections** (refinedSummary, prioritizedKeywords, polishedExperienceSections). Does NOT include finalRecommendations or cautions — those are user-facing meta-advice, not employer-facing content.
  - HTML structure:
     ```html
     <html>
       <head>
         <style>
           @page { margin: 0.6in; size: letter; }
           body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; line-height: 1.4; }
           h1 { font-size: 16pt; margin-bottom: 4pt; }
           h2 { font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; border-bottom: 1px solid #ccc; }
           .section { margin-bottom: 10pt; page-break-inside: avoid; }
           .bullet { margin-left: 14pt; text-indent: -14pt; padding-left: 14pt; margin-bottom: 2pt; }
         </style>
       </head>
       <body>
         <h1>{jobTitle || 'Professional Profile'}{companyName ? ` — ${companyName}` : ''}</h1>
         <div class="section">
           <h2>Professional Summary</h2>
           <p>{refinedSummary}</p>
         </div>
         <div class="section">
           <h2>Key Skills</h2>
           {prioritizedKeywords.map(k => `<div class="bullet">• {k}</div>`)}
         </div>
         {polishedExperienceSections.map(section => `
           <div class="section">
             <h2>{section.heading}</h2>
             <p>{section.polishedSummary}</p>
             {section.polishedBullets.map(b => `<div class="bullet">• ${b}</div>`)}
           </div>
         `)}
       </body>
     </html>
     ```
    - Constraints: NO tables for layout, NO images, NO text boxes, standard fonts only, single column, black on white
 5. **Screen vs PDF distinction:**
    - `FinalResumeOutputScreen` continues to display ALL 5 sections (including finalRecommendations and cautions) for user review
    - PDF export includes ONLY sections 1-3 (refinedSummary, prioritizedKeywords, polishedExperienceSections)
    - This ensures the exported document is employer-ready, not a mix of resume content and AI meta-advice
 6. Add "Export PDF" button to `FinalResumeOutputScreen`:
   - Primary button, disabled during generation
   - Shows spinner + "Generating PDF..." during generation
   - On success: automatically opens share sheet with PDF
   - On error: shows "Copy text instead" fallback button
6. File handling:
   - Write PDF to `react-native-blob-util` cache directory
   - File naming: `TailorCV-{company}-{YYYY-MM-DD}.pdf` (sanitize company name: remove special chars, replace spaces with hyphens)
   - Use `react-native-share` `Share.open({ url: `file://${filePath}` })` for share sheet
7. Error handling:
   - Catch generation errors, show user-friendly message
   - Log failure to Sentry without PDF content
   - Always offer "Copy text" as fallback

**Dependencies:** Phase 2 (final output must exist)

**Risks:** HIGH — native dependency compatibility with RN 0.84; HTML rendering quality; ATS compliance

**Verification:** Android runtime: generate PDF, verify text is selectable/searchable in PDF viewer, verify layout on device, verify long resumes don't truncate

---

### Phase 5 — Persistence / Error Hardening
**Objective:** Harden persistence and error handling.

**Files affected:**
- `src/store/useResumeStore.ts`
- `src/services/storage/storage.ts`
- `src/screens/JobDescriptionScreen.tsx`
- `src/screens/AnalysisResultScreen.tsx`
- `src/services/analytics/crashReporting.ts`

**Concrete tasks:**
 1. **Cascade delete in store:**
    - In `removeResume()`: before removing the resume, also remove all `analysisResults` with matching `resumeId`
    - For each removed analysis, also remove any `FinalResumeOutput` with matching `analysisId`
    - Also remove any `jobApplications` linked only to this resume (if `jobApplication.resumeId` matches and no other analyses reference it)
    - `ProfessionalExperience` entries are nested in `Resume.professionalExperiences`, so they are automatically removed when the resume is removed
    - **DECISION: Auto-delete associated data** (user confirmed: "if user delete then auto delete")
    - Show confirmation dialog before delete: "This will delete the resume and all associated analyses. This action cannot be undone."
2. **Sentry `beforeSend` sanitization:**
   - Add `beforeSend` to `Sentry.init()` in `crashReporting.ts`
   - Strip these fields from event contexts/extra:
     - `resumeText`
     - `jobDescription`
     - `aiResponse`
     - `userEditedSuggestions`
     - `professionalExperiences`
   - Keep: error type, message, stack trace, component name, screen name
   - Example:
     ```ts
     beforeSend(event, hint) {
       const sensitiveKeys = ['resumeText', 'jobDescription', 'aiResponse', 'userEditedSuggestions'];
       if (event.contexts) {
         Object.keys(event.contexts).forEach(key => {
           if (sensitiveKeys.includes(key)) {
             event.contexts[key] = '[REDACTED]';
           }
         });
       }
       if (event.extra) {
         sensitiveKeys.forEach(key => {
           if (key in event.extra) {
             event.extra[key] = '[REDACTED]';
           }
         });
       }
       return event;
     }
     ```
3. **Error recovery UX:**
   - In `JobDescriptionScreen`: when `analysisError` is set, show error card with:
     - Error message
     - "Try Again" button (re-runs analysis)
     - "Edit Job Description" button (focuses JD input)
   - In `AnalysisResultScreen`: when `finalOutputError` is set, show error card with:
     - Error message
     - "Try Again" button
     - "Back to Analysis" button
4. **Loading states:** Ensure all async store actions (`isAnalyzing`, `isGeneratingFinalOutput`) disable relevant buttons and show spinners. Audit all screens for missing loading indicators.

**Dependencies:** Phases 1-4

**Risks:** Low for UX changes; Medium for Sentry config (must verify in test environment)

**Verification:** Runtime verify error states; Sentry test event inspection

---

### Phase 6 — UX Polish
**Objective:** Align navigation and UX with approved flow.

**Files affected:**
- `src/screens/HomeScreen.tsx`
- `src/screens/ResumesScreen.tsx`
- `src/screens/AnalysisResultScreen.tsx`
- `src/screens/FinalResumeOutputScreen.tsx`
- `src/screens/HistoryScreen.tsx`

**Concrete tasks:**
1. **HomeScreen "Start New Application" flow:**
   - Add primary "Start New Application" button
   - On press: if `currentResumeId` exists, navigate directly to `JobDescriptionScreen`
   - If no resume selected, navigate to `ResumesScreen` with a "Select a resume first" hint
2. **HomeScreen status display:**
   - Show active resume name (not just "Resume text added")
   - Show current job title/company if available
3. **AnalysisResultScreen post-generation:**
   - After `finalResumeOutput` is generated, change "Generate Tailored Resume" button to "View Final Resume" button that navigates to `FinalResumeOutputScreen`
   - Keep "Generate Tailored Resume" available until generation succeeds
4. **HistoryScreen deep links:**
   - "View" button navigates to `AnalysisResult` with `analysisId`
   - Add "Edit Suggestions" button on each history card that navigates to `EditSuggestions`
   - Add "View Final Resume" button if `finalResumeOutput` exists for that analysis
5. **Empty states:**
   - `ResumesScreen`: "No resumes yet" + "Add Resume" button
   - `HistoryScreen`: "No analyses yet" + "Start Analysis" button → navigates to `UploadResume`
   - `JobApplicationDetailScreen`: "No analysis yet" + "Run Analysis" button → navigates to `JobDescription`

**Dependencies:** Phases 2-4

**Risks:** Low

**Verification:** Runtime verify complete user flow end-to-end

---

### Phase 7 — Testing / Android Validation
**Objective:** Achieve acceptance criteria verification.

**Concrete tasks:**
1. **Add unit tests:**
   - `__tests__/finalResumeOutputPersistence.test.ts`: Test save/load/clear of `FinalResumeOutput` via storage
   - `__tests__/keywordCoverage.test.ts`: Test weighted coverage calculation with all importance levels + fallback
   - `__tests__/pdfTemplates.test.ts`: Test HTML generation from `FinalResumeOutput` (verify no tables, no images, standard sections)
   - `__tests__/migrationAtomicity.test.ts`: Test that `migrateLegacySnapshot` writes all three collections before deleting legacy key
 2. **Add integration tests:**
    - `__tests__/finalOutputFlow.test.ts`: Mock Gemini, test full flow from analysis → edit → generate final output → verify store state
 3. **Update existing tests:**
    - `__tests__/AnalysisResultScreen.test.tsx`: Update assertion that currently expects "Generate Final Resume Output" button to NOT exist. After Phase 2, this button will exist, so the test must be updated.
 4. **Run quality gates:**
   - `npm run lint` — fix any issues
   - `npx tsc --noEmit` — fix any type errors
   - `npm test` — ensure all tests pass, coverage not required but no regressions
4. **Android build + runtime:**
   - `cd android && ./gradlew assembleDebug` — verify build succeeds
   - `npx react-native run-android` — install on emulator/device
   - **Runtime verification checklist:**
     - [ ] Full flow: add resume → paste JD → analyze → view match → edit suggestions → generate final → review → export PDF → share
     - [ ] PDF export generates valid file with selectable text
     - [ ] Share sheet opens with PDF attached
     - [ ] 50+ history items render without lag (scroll performance)
     - [ ] App restart preserves all data (resumes, apps, analyses, final output, edits)
     - [ ] Offline: app loads without crash when Gemini is unreachable
     - [ ] PDF extraction from resume works on device

**Dependencies:** All previous phases

**Risks:** Medium — Android native issues may require debugging; RN 0.84 + new architecture may expose library incompatibilities

---

### Phase 8 — Privacy / Analytics / Sentry Review
**Objective:** Ensure no sensitive data leakage and implement analytics persistence.

**Files affected:**
- `src/services/analytics/analytics.ts`
- `src/services/storage/storage.ts`
- `src/services/analytics/crashReporting.ts`

**Concrete tasks:**
1. **Analytics persistence (MMKV):**
   - Add `analytics-events` MMKV key in `storage.ts`
   - Modify `trackEvent()` in `analytics.ts` to append events to in-memory array AND persist to MMKV on each call
   - On app start (`App.tsx`), load persisted events into memory
   - Keep events bounded: if array exceeds 1000 events, trim oldest
   - Events are local-only, never sent to external service
2. **Analytics event audit:**
   - Review all `trackEvent` calls in `src/screens/` and `src/services/`
   - Confirm properties contain ONLY: `sourceType` ('pdf'|'text'), `section` (which section was copied), boolean flags
   - Confirm NO properties contain: resume text, job description, AI response, user edits, keywords, scores
3. **Sentry `beforeSend` sanitization:**
   - Implement as specified in Phase 5
   - Test by triggering a test exception and inspecting event in Sentry dashboard
   - Verify no resume text, JD, or AI response appears in event
4. **`.env` security:**
   - Verify `.env` is in `.gitignore`
   - Document that `GEMINI_API_KEY` must be set per-environment and never committed
   - Consider moving to `react-native-config` or native secure storage for production
5. **Settings privacy copy verification:**
   - Confirm Settings screen claims match actual behavior:
     - "Local-first" — YES, all data in MMKV
     - "AI-only data flow" — YES, resume/JD sent only during analysis
     - "PDF extraction on device" — YES, `react-native-pdf-text-extractor` is local
     - "Crash reports never include resume text" — YES, after `beforeSend` fix
     - "No raw resume text in analytics" — YES, confirmed above

**Dependencies:** Phase 5

**Risks:** Low for analytics persistence; Medium for Sentry config (must verify in test environment)

**Verification:** Code review + Sentry test event inspection + `.gitignore` audit + runtime verify events survive restart

---

## J. Prioritization

### P0 — Required for MVP 2 completion (blocks release)

1. **Persist FinalResumeOutput to MMKV** — Data loss on restart
2. **Add "Generate Tailored Resume" button + flow** — The primary flow is broken without it
3. **PDF Export** — Explicitly required by MVP2 spec
4. **Wire navigation from Analysis → Final Output → PDF** — Complete the user journey
5. **Android runtime validation** — Required for acceptance

### P1 — Important (should be completed before release)

6. **Analytics persistence to MMKV** — User confirmed; events must survive restart
7. **Pass user edits to final output generation** — User expectations
8. **Keyword Coverage weighting** — Spec requires importance-weighted calculation
9. **Sentry `beforeSend` sanitization** — Privacy requirement
10. **Error handling + retry UX** — "Try Again" / "Edit Job Description" patterns
11. **Test coverage for new features** — PDF service, final output flow, migration edge cases
12. **Analytics event consistency audit** — Ensure events fire at correct points (currently safe but unverified)

### P2 — Polish (useful but not release-blocking)

13. **Schema version key** — Future-proofing
14. **Loading skeletons** — UX polish
15. **Home screen "Start New Application" CTA** — UX improvement
16. **History deep links to Edit Suggestions / Final Resume** — UX improvement

---

## K. Acceptance Checklist

```text
[ ] Multiple resumes — verified
[ ] Resume CRUD — verified
[ ] Resume from PDF — verified
[ ] Resume from text — verified
[ ] Analysis history — verified
[ ] JobApplication — verified
[ ] Suggestion editing — verified
[ ] Suggestion reset — verified
[ ] Persistence across restart — PARTIAL (FinalResumeOutput missing)
[ ] Professional Experience — verified
[ ] Resume Match — PARTIAL (AI-dependent, no custom validation)
[ ] Keyword Coverage — PARTIAL (no weighting)
[ ] FinalResumeOutput — PARTIAL (exists but not persisted, unreachable)
[ ] Grounding/no fabrication — PARTIAL (prompt-level only)
[ ] Tailored Resume review — PARTIAL (screen exists, unreachable)
[ ] PDF export — NOT VERIFIED (missing)
[ ] ATS-friendly output — NOT VERIFIED (missing)
[ ] Copy — PARTIAL (analysis only)
[ ] Share — PARTIAL (analysis only)
[ ] Analytics privacy — PARTIAL (in-memory, no sensitive data in events)
[ ] Sentry privacy — PARTIAL (no beforeSend sanitization)
[ ] Migration — verified
[ ] Error/retry — verified
[ ] Automated tests — PARTIAL (13 tests, gaps identified)
[ ] Lint — NOT VERIFIED
[ ] TypeScript — NOT VERIFIED
[ ] Android build — NOT VERIFIED
[ ] Android runtime — NOT VERIFIED
[ ] PDF runtime — NOT VERIFIED
[ ] Share runtime — NOT VERIFIED
[ ] 50+ history performance — NOT VERIFIED
```

---

## L. Risk Register

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| AI fabricates resume content in final output | HIGH | Medium | High — user submits false information | Prompts forbid fabrication; add post-gen validation for new entities; clearly label as "AI-suggested, verify before use" |
| PDF generation fails on Android | HIGH | Medium | High — blocks core export feature | Add `react-native-html-to-pdf`; test on emulator + physical device; provide "Copy text" fallback |
| Keyword Coverage weighting unreliable | MEDIUM | Medium | Medium — metric may be misleading | Fallback to simple ratio if AI doesn't return importance labels; document calculation method in UI |
| FinalResumeOutput data loss on restart | HIGH | High (current) | High — user loses generated output | Phase 1: persist to MMKV |
| Sensitive data in Sentry events | HIGH | Low | High — privacy breach | Add `beforeSend` sanitization; audit all capture calls |
| MMKV serialization errors with large data | MEDIUM | Low | Medium — app crash or data loss | `safeParseJson`/`safeStringify` wrappers already exist; add size warnings |
| Gemini API key exposed in repo | HIGH | High (current) | High — quota theft, cost | Move to environment-specific config; add `.env` to `.gitignore` if missing |
| 50+ history items cause UI lag | MEDIUM | Medium | Medium — poor UX | Use `FlashList` or `FlatList` with `getItemLayout` if needed; current implementation uses simple map |
| Migration partial failure | MEDIUM | Low | Medium — orphaned legacy data | Write all three collections before deleting legacy key |
| PDF text not selectable/searchable | MEDIUM | Medium | Medium — ATS fails to read | Verify with `react-native-html-to-pdf` default settings; avoid image-based PDFs |

---

## M. Do Not Do

- Do NOT rebuild existing working screens (Resumes, History, Experience Editor, Edit Suggestions)
- Do NOT add authentication, subscriptions, RevenueCat, or backend
- Do NOT build a full job tracker, cover letters, LinkedIn optimization, or template marketplace
- Do NOT replace Zustand/MMKV
- Do NOT add drag-and-drop resume builder
- Do NOT make keyword coverage more aggressive at the expense of factual accuracy
- Do NOT redesign the product from scratch
- Do NOT implement changes during this planning phase
- Do NOT add analytics persistence — in-memory event logging is sufficient for MVP2 (events are for product insight, not user-facing features) — **DECISION OVERTURNED: Analytics WILL be persisted to MMKV per user instruction**
- Do NOT add cloud sync — explicitly out of scope per MVP2 spec
- Do NOT use image-based PDF generation — fails ATS text extraction requirements

---

## N. Implementation Order (Recommended)

```
Phase 1 (Persistence fixes)
    ↓
Phase 2 (Final output flow) ← **Critical path**
    ↓
Phase 3 (Keyword weighting)
    ↓
Phase 4 (PDF export)        ← **Highest risk**
    ↓
Phase 5 (Error hardening)
    ↓
Phase 6 (UX polish)
    ↓
Phase 7 (Tests + Android validation)
    ↓
Phase 8 (Privacy review)
```

**Critical path:** Phase 1 → Phase 2 → Phase 4. Without these, MVP2 cannot be released.

**Parallelizable:** 
- Phase 3 (keyword weighting) can run in parallel with Phase 4 if resources allow
- Phase 5 (error hardening) can start after Phase 2 completes, before Phase 4
- Phase 6 (UX polish) can be staged after Phase 2
- Phase 8 (privacy + analytics persistence) should be done before release but doesn't block feature completion

**Runtime risk:** The Gemini model name `gemini-3.6-flash` is a placeholder. If it does not resolve to a valid endpoint in production, all AI features will fail. This must be verified against the actual Google AI API before release.

---

## O. Files Changed Summary (Estimated)

| File | Phase | Change Type |
|------|-------|-------------|
| `src/types/resume.ts` | 1 | Add optional fields if needed |
| `src/services/storage/storage.ts` | 1 | Add `final-resume-output` key, getters, setters |
| `src/store/useResumeStore.ts` | 1 | Persist `finalResumeOutput` |
| `src/screens/AnalysisResultScreen.tsx` | 2 | Add "Generate Tailored Resume" button |
| `src/services/ai/analyzeResumeUseCase.ts` | 2 | Pass user edits to final output generation |
| `src/screens/FinalResumeOutputScreen.tsx` | 2, 4 | Add share buttons; wire PDF export |
| `src/services/ai/promptBuilder.ts` | 3 | Add `keywordImportance` to analysis prompt |
| `src/services/ai/analysisParser.ts` | 3 | Parse importance labels |
| `src/services/ai/types.ts` | 3 | Update `GeminiResponseContract` |
| `src/utils/validation/` | 3 | Add coverage calculation utility |
| `src/services/pdf/pdfGenerator.ts` | 4 | New file: PDF generation service |
| `package.json` | 4 | Add PDF library dependency |
| `src/services/analytics/crashReporting.ts` | 5, 8 | Add `beforeSend` sanitization |
| `src/services/analytics/analytics.ts` | 8 | Add MMKV persistence for events |
| `src/services/storage/storage.ts` | 1, 8 | Add `analytics-events` key, getters, setters |
| `src/screens/HomeScreen.tsx` | 6 | Add "Start New Application" flow |
| `__tests__/` | 7 | Add tests for gaps |
| `src/screens/HistoryScreen.tsx` | 6 | Add Edit Suggestions / View Final Resume buttons |
| `src/screens/JobDescriptionScreen.tsx` | 5 | Add error recovery UI |
| `src/screens/AnalysisResultScreen.tsx` | 2, 5, 6 | Generate button, error recovery, View Final Resume toggle |
| `__tests__/finalResumeOutputPersistence.test.ts` | 7 | New: persistence tests |
| `__tests__/keywordCoverage.test.ts` | 7 | New: weighted coverage calculation tests |
| `__tests__/pdfTemplates.test.ts` | 7 | New: HTML template tests |
| `__tests__/migrationAtomicity.test.ts` | 7 | New: migration failure recovery tests |
| `__tests__/finalOutputFlow.test.ts` | 7 | New: end-to-end final output flow test |
| `android/app/build.gradle` | 4 | Add PDF library native config if needed |

---

## P. Resolved Decisions

All open questions from the initial audit have been resolved.

### 1. Gemini Model Name — RESOLVED

**Decision:** Keep existing `gemini-3.6-flash` placeholder.

**User instruction:** "keep existing"

**Risk accepted:** If this model endpoint does not exist in the production Google AI environment, all AI features (analysis, experience improvement, final output) will fail at runtime with 404 errors. This is a product/business decision to resolve with the AI provider.

**Mitigation:** None implemented — model name must be verified against the actual Google AI API before release.

### 2. PDF Library RN 0.84 Compatibility — RESOLVED

**Decision:** Verify `react-native-html-to-pdf` compatibility BEFORE adding to dependencies.

**User instruction:** "verify first"

**Strategy:**
1. Check GitHub issues/README for RN 0.84 + new architecture support
2. Check Hermes compatibility
3. Check Android minSdk 24 compatibility
4. Only add to `package.json` after verification passes
5. If incompatible, fall back to `react-native-print`

**Impact on Phase 4:** PDF export implementation is blocked until compatibility is verified.

### 3. Analytics Persistence — RESOLVED

**Decision:** Persist analytics events to MMKV.

**User instruction:** "persist to MMKV"

**Implementation:**
- Add `analytics-events` MMKV key
- Append events on each `trackEvent()` call
- Load persisted events on app start
- Bound array to 1000 events (trim oldest)
- Events remain local-only, never sent externally

### 4. Resume Delete Behavior — RESOLVED

**Decision:** Auto-delete associated analyses and job applications when a resume is deleted.

**User instruction:** "if user delete then auto delete"

**Implementation:**
- In `removeResume()`: cascade delete all `analysisResults` with matching `resumeId`
- Also delete `jobApplications` that are linked only to this resume (no other analyses reference them)
- This overrides the MVP2 spec wording ("associated analyses will remain") — product decision confirmed by user
