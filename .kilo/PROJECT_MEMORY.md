# Project Memory — TailorCV AI

This is the verified, authoritative snapshot of the TailorCV AI repository. It is
external memory for future agent sessions (and for human developers). It must NOT
duplicate source code — the code remains the source of truth. Update it when the
codebase changes materially (see [WORKFLOW.md](./WORKFLOW.md)).

Legend: **Verified** = directly confirmed in the repo. **Inferred** = reasonable,
not line-proven. **Unknown** = explicitly not known.

---

## 1. Product & Scope

- **What it is:** A React Native CLI app ("TailorCV AI") that analyzes a resume against a job
  job description using Gemini. Flow: provide resume (PDF upload or paste) → paste job
  description → Analyze → view ATS match score, missing keywords, suggested summary, skills,
  experience improvements, ATS tips → say whether it was useful. A polished Final Resume
  Output screen still exists in code/navigation but is no longer part of the primary flow.
- **Status:** MVP (validation-tuned). The codebase contains `MVP_1/2/3_IMPLEMENTATION_PLAN.md`.
- **Boundaries (do NOT introduce):** No auth, payments, Firebase, cloud sync,
  backend, database, subscriptions, multi-resume history, or LinkedIn/cover-letter
  features. The product is intentionally **local-first and single-resume**.
- **Verified:** `SettingsScreen` subtitle is literally `"MVP 1"` and its help text
  states analytics/sync/account are intentionally excluded. (`SettingsScreen.tsx:13`)
- **Not a platform:** Do not expand into an "AI platform". Keep it a mobile app.

## 1b. Product Philosophy

- **Current mode: validation over feature completeness.** The guiding principle right now is
  "optimize for learning, not building." The app is deliberately scoped to the smallest loop
  that tests the core hypothesis — **"People find AI-powered resume analysis useful"**:
  Resume → Job Description → AI Analysis → User understands the result → User says whether it
  was useful.
- **This is a TEMPORARY optimization, NOT a permanent product doctrine.** Do not turn
  "optimize for learning" into an automatic refusal of features. If the user later asks for a
  feature, evaluate it against the current architecture and the explicit request — not against
  this philosophy. The user can shift the product mode at any time; this section records only
  the current mode.
- **The core Gemini analysis is the product's strongest, runtime-validated asset.** Changes
  should preserve its quality, not dilute it. (See §10 for the runtime-validation note.)

## 2. Tech Stack & Tooling

- **Framework:** React Native 0.84.1 (CLI, NOT Expo), React 19.2.3.
- **Navigation:** `@react-navigation/native` v7 + `native-stack`. Entry: `index.js`
  → `App.tsx` → `AppNavigator`.
- **UI:** `react-native-paper` (MD3 light theme) + `react-native-safe-area-context`.
- **State:** `zustand` v5, single store `useResumeStore` (`src/store/useResumeStore.ts`).
- **Storage:** `react-native-mmkv` (key `latest-analysis`, id `tailorcv-ai-storage`).
- **PDF:** `react-native-html-to-pdf` + `react-native-pdf-text-extractor` (native `extractText(uri)`).
- **WebView:** `react-native-webview` v13+ (renders template HTML for professional preview).
- **ATS Scoring:** Category-level ATS scoring with keyword gap analysis and optimization suggestions.
- **File picker:** `@react-native-documents/picker` (`pick` + `keepLocalCopy`).
- **Resume input:** PDF upload OR plain-text paste (both normalized via `normalizeResumeText`).
- **Env:** `react-native-dotenv` (whitelist: `GEMINI_API_KEY`, `APP_ENV`; path `.env`).
- **Package manager:** pnpm (`pnpm-workspace.yaml`, `node-linker=hoisted`).
- **Testing:** Jest + `react-test-renderer` (NOT @testing-library). Tests in `__tests__/`.
- **Native modules:** auto-linked via `PackageList` (`MainApplication.kt:20`); New Arch
  enabled (`IS_NEW_ARCHITECTURE_ENABLED`); Hermes enabled in debug. `react-native-worklets/plugin`
  is in babel for Reanimated.
- **Dead dependency (Verified):** `react-native-blob-util` is in `package.json` and
  mocked in `__tests__/App.test.tsx` but is **not imported anywhere in `src/`**.
  Safe to remove; harmless to leave. Do not add usage for it.

## 3. Project Layout (source only)

```
.
├── App.tsx                      # Root: providers + AppNavigator; hydrates store on mount
├── index.js                     # RN entrypoint, gesture-handler/reanimated imports
├── app.json                     # name/displayName = "TailorCvAi"
├── babel.config.js              # RN preset + dotenv plugin + worklets + class-static-block
├── jest.config.js               # preset=react-native, transformIgnore for native deps
├── metro.config.js              # + semver shim for reanimated
├── .env                         # GEMINI_API_KEY + APP_ENV  (SEE RISK 1)
├── MVP_1/2/3_IMPLEMENTATION_PLAN.md  # staged roadmap + scope guardrails
├── src/
│   ├── app/
│   │   ├── navigation/AppNavigator.tsx  # native-stack, initial=HOME
│   │   └── theme/theme.ts               # MD3 light + brand colors
│   ├── constants/routes.ts             # route names (single source of truth)
│   ├── components/common/{PrimaryButton,ScreenContainer}.tsx
│   ├── screens/  Home,UploadResume,JobDescription,ExperienceEditor,AnalysisResult,FinalResumeOutput,Settings
│   ├── store/useResumeStore.ts         # zustand: state + MMKV persistence
│   ├── types/resume.ts                 # domain/persisted types
  │   ├── services/
  │   │   ├── ai/{geminiService,promptBuilder,types,analysisParser,
  │   │   │      finalOutputParser,experienceImprovementParser,analyzeResumeUseCase}.ts
  │   │   ├── pdf/{documentPicker,pdfExtractor,pdfGenerator,pdfTemplates,resumePdfExporter}.ts
  │   │   └── storage/storage.ts          # MMKV wrapper
  │   ├── templates/{renderResumeToHtml,templateRegistry,types,classic,modern,europass}.ts
  │   ├── services/ats/{atsScorer,keywordOptimizer,atsAnalysis}.ts
  │   ├── components/ats/ScoreIndicator.tsx
  │   ├── components/resumeEditor/SuggestionsPanel.tsx
│   └── utils/{text/normalizeResumeText, validation/{jobDescription,experience,finalOutput}}
└── __tests__/                   # jest tests (mirror src names)
```

## 4. State & Persistence

- **Single store** (`useResumeStore.ts`), Zustand `create`. Shape:
  `resumeText`, `jobDescription`, `analysisResult`, `finalResumeOutput`,
  `resumeMetadata`, `professionalExperiences[]`, `usefulnessFeedback` (`'yes' | 'no' | null`),
  plus `isAnalyzing`, `isGeneratingFinalOutput`, `analysisError`, `finalOutputError`.
- **Persistence pattern:** Every setter that mutates core data calls `persistSnapshot(get())`
  which calls `storage.saveLatestAnalysis(snapshot)` → JSON-stringified in MMKV.
  `hydrateLatest()` (called in `App.tsx` `useEffect` on mount) restores snapshot.
- **Hydration is defensive:** if MMKV missing/unavailable, it returns early; `getLatestAnalysis`
  `JSON.parse` is wrapped in try/catch and returns `null` on failure.
- **Snapshot shape** (`ResumeStateSnapshot`): `resumeText`, `jobDescription`, `analysisResult`,
  `finalResumeOutput`, `resumeMetadata`, `professionalExperiences[]`, AND `usefulnessFeedback`
  (`'yes' | 'no' | null`) — persisted with the snapshot.
- **`isAnalyzing`/`isGeneratingFinalOutput` and error flags are NOT persisted** (only
  core data is). `hydrateLatest` explicitly resets the error flags to `null`.
- **`setAnalysisResult` clears `finalResumeOutput` AND `usefulnessFeedback`** (a new analysis
  invalidates the old final output and prior feedback).
- **`setUsefulnessFeedback`** persists the snapshot. A `clearAll` / new analysis resets it.
- **`clearFinalResumeOutput`** clears final output + its error.
     but never read anywhere; `AnalysisResult.jobTitle` and `company` are always set to
     `undefined` and never read by any screen; `FinalResumeOutput.analysisId` is set
     (`finalOutputParser.ts:109`) but never read by `FinalResumeOutputScreen`. They are
     harmless but unused — safe to ignore, do not rely on them.

## 5. Core User Flow (verified end-to-end)

Navigation is a native stack, `initialRouteName = HOME`.

1. **Home** (`HomeScreen.tsx`) → buttons: Upload Resume, Paste Job Description, Professional
   Experience, Settings. (The duplicate "Start Analysis" button was removed; Home no longer
   advertises a separate analysis entry.) A "Latest Analysis" card shows the last result summary.
2. **Upload Resume** (`UploadResumeScreen.tsx`) → two input options:
   - **PDF upload** → `pickResumePdf` (`documentPicker.ts`):
     - `pick({type:[types.pdf], allowMultiSelection:false})`
     - `keepLocalCopy({destination:'cachesDirectory'})`.
     - `createResumeMetadata` + `validateResumeFile` (PDF, MIME `application/pdf` or
       `application/octet-stream`, size >0 and ≤ **10 MB** = `MAX_RESUME_FILE_SIZE_BYTES`).
     - `extractTextFromPdfFile(uri)` (`pdfExtractor.ts`) → `extractText` (native
       `react-native-pdf-text-extractor`) → `normalizeResumeText` (see §6).
     - Guards: if extraction returns empty/whitespace → set `extractionError` and
       `setResumeText('')`. Cancelled pick → returns `null`.
   - **Paste text** → multiline `TextInput`; "Use pasted resume" normalizes via
     `normalizeResumeText` and requires ≥ 50 chars (`MIN_PASTED_RESUME_LENGTH`), else `pasteError`.
   - On success: `setResumeMetadata`/`setResumeText` (auto-persisted).
3. **Job Description** (`JobDescriptionScreen.tsx`) → controlled `TextInput`. Validation
   (`jobDescriptionValidation.ts`): 80 ≤ length ≤ 12000 chars. "Analyze" disabled unless
   `resumeText.trim()` AND `validation.valid` AND not `isAnalyzing`.
   `handleAnalyze` → `runResumeAnalysis()` → on success (new result id differs) →
   navigate to **Analysis Result**.
4. **Analysis Result** (`AnalysisResultScreen.tsx`) → renders `analysisResult` via a
   defensive `viewModel` (`Math.max(0,Math.min(100,score))`, `?? []`/defaults). Cards:
   - **ATS Match Score** — score (%) plus an explanation that it is an AI-estimated match
     (not scientific precision), and "ATS" is explained in the card subtitle ("Applicant
     Tracking System — the software recruiters use to filter resumes").
   - **Missing Keywords**, **Suggested Summary** (with Copy), **Suggested Skills**,
     **Experience Improvements** (Original/Improved pairs), **ATS Tips**.
   - **"Was this analysis helpful?"** — 👍 Yes / 👎 No signal at the bottom. Selecting a
     value calls `setUsefulnessFeedback('yes'|'no')` (persisted with the snapshot) and shows
     a "Thanks for your feedback." confirmation. Hidden when there is no `analysisResult`.
   - **DEMOTED:** the "Generate Final Resume Output" CTA was removed from this screen to keep
     the validation journey on a single AI call. The Final Resume Output screen/route/code
     remain in the app (reachable only via deep navigation, not part of the primary flow).
   - **HIDDEN:** the "Professional Experience Recommendations" card was removed because it
     implied AI-generated recommendations while the Experience AI call is not wired.
5. **Final Resume Output** (`FinalResumeOutputScreen.tsx`) — still in code and registered in the
   navigator, but no longer reachable from the primary Analysis Result flow. Renders
   `finalResumeOutput` (sections + summary copy buttons + "Copy full package"); empty state if
   `null`. Intentionally dormant in the validation journey (see §11 Risk 4).
6. **Experience Editor** (`ExperienceEditorScreen.tsx`) — reachable from Home. Add/edit/delete
    `ProfessionalExperience` entries; entries persist in store.

## 5b. Current Capabilities Summary

The actual, working capabilities of the app right now:

**Resume input:**
- PDF upload via native document picker (`@react-native-documents/picker`) → `keepLocalCopy`
  to caches dir → local text extraction (`react-native-pdf-text-extractor`) → normalization.
- Plain-text paste fallback (same normalization path). Requires ≥ 50 chars.
- PDF validation: `.pdf` extension, `application/pdf` or `application/octet-stream` MIME, size
  > 0 and ≤ 10 MB.

**Job Description input:**
- Multiline input with live char counter, Clear button, validation (80–12000 chars).
- "Analyze" disabled unless resume is present AND job description is valid.

**AI analysis (single Gemini call):**
- ATS match score (0–100), missing keywords, suggested professional summary, suggested skills,
  experience improvements (Original/Improved pairs), ATS tips.

**Resume preview & PDF export:**
- Professional preview screen with 3 templates (Classic, Modern, Europass) rendered via
  `react-native-webview` using the same HTML pipeline as PDF export.
- PDF export from structured resume content (`ResumeContent`) via `resumePdfExporter.ts`
  → `react-native-html-to-pdf` → platform share sheet.
- Template selection persisted in `Resume.templateId` (defaults to `classic`).
- Photo rendering in Modern/Europass templates (local `photoUri` only; PDF embedding is
  platform-dependent and non-blocking).

**ATS scoring & optimization:**
- Category-level ATS scoring (keywords, skills, experience, education, formatting) with
  weighted overall score via `src/services/ats/atsScorer.ts`.
- Keyword gap analysis identifying missing keywords with suggested placement locations
  via `src/services/ats/keywordOptimizer.ts`.
- Optimization suggestions (add keyword, rephrase, add detail, reorder) with impact levels
  and apply/dismiss actions.
- "Optimize Resume" CTA on Analysis Result screen navigates to editor with suggestions panel.
- Suggestions panel integrated into Resume Editor for one-click application.

**Output & feedback:**
- ATS score shown with explanation (AI-estimated, not scientific precision); "ATS" explained
  in the UI.
- Suggested summary is copyable to clipboard.
- "Was this analysis helpful?" 👍/👎 usefulness signal, local-only, persisted in MMKV.

**Persistence:**
- Single MMKV snapshot (`latest-analysis`), hydrated defensively on app launch.

**Local-first design:**
- No auth, no backend, no analytics, no cloud sync. AI is the only network call.

## 5c. Dormant Functionality (intentionally NOT wired)

These features are fully implemented and tested but intentionally not part of the primary
validation journey. **Dormant ≠ deleted ≠ broken.** Do not delete or "clean up" dormant code
unless explicitly asked. They can be re-enabled.

- **Final Resume Output** (`FinalResumeOutputScreen.tsx`, `runFinalOutputGeneration` in
  `analyzeResumeUseCase.ts`, `buildFinalOutputPrompt`, `parseFinalOutputResponse`,
  `createFinalResumeOutput`, `validateFinalResumeOutput`): second Gemini call producing a
  polished, resume-ready package (refined summary, prioritized keywords, polished experience
  sections, final recommendations, cautions). Its CTA was **removed from Analysis Result** to
  keep the journey on a single AI call. The screen + route + code remain; reachable only via
  deep navigation.
- **Experience AI** (`runExperienceImprovementAnalysis`, `geminiService.analyzeProfessionalExperience`,
  `buildExperienceImprovementPrompt`, `parseExperienceImprovementResponse`): third Gemini call
  that enriches saved `ProfessionalExperience` entries (summary/keywords/suggestions). Implemented
  + unit-tested (`experienceAiParser.test.ts`) but **invoked from no screen**. Fully dormant.
- **Professional Experience Recommendations card**: removed from Analysis Result because it
  implied AI enrichment that isn't wired. The underlying Experience Editor CRUD + persistence
  is intact and reachable from Home.

**Why dormant:** The validation build is scoped to one AI call. Re-enable only when the user
explicitly asks.

## 6. PDF Processing

- Flow: pick PDF → `keepLocalCopy` to caches dir → `extractText(uri)` (native module) →
  `normalizeResumeText(text)`.
- `normalizeResumeText` (`normalizeResumeText.ts`) cleans raw PDF text:
  - strips `Page N of M` markers
  - strips `Resume`/`CV`/`Curriculum Vitae` header lines
  - `\r\n`→`\n`; `\u00a0`→space; tabs/form-feed→space
  - collapses whitespace/newlines to single `\n`, collapses 2+ spaces to 1
  - normalizes bullet `•` spacing; collapses 3+ newlines to `\n\n`
- If extraction throws, `pdfExtractor` catches, logs to console.error, and returns `''`.

## 7. AI Analysis Pipeline (the core contract)

**Architecture:** `Screen → use-case (analyzeResumeUseCase.ts) → geminiService.ts → Gemini`.
Gemini is contacted ONLY from `GeminiService.callGemini`. No screen/store touches the API.

**Inputs:** `resumeText` (normalized) + `jobDescription` (trimmed). For final output also
`analysisResult` + `professionalExperiences`.

**Single HTTP call** (`geminiService.ts:45`):
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/<MODEL>:generateContent?key=...`
- **Model name:** `gemini-3.6-flash` (at `geminiService.ts:55`). **Verify** this is a real,
  current Gemini model before relying on it — it is not a widely-known public name
  (possible future/private model or typo). Record here as-is from code.
- Timeout: 30s via `AbortController`. 429→"temporarily busy"; 5xx→"unavailable"; other
  non-2xx → parse `error.message` from body; `AbortError`→"took too long".
- Response parse: `payload.candidates[0].content.parts[0].text`. Empty → throw.

**Prompt construction** (`promptBuilder.ts`) — three pure functions, each returns JSON-only
instructions with strict "never fabricate" rules and an exact JSON schema in the prompt:
- `buildGeminiPrompt` → `matchScore, missingKeywords, suggestedSummary, suggestedSkills,
  experienceImprovements[], atsTips` (contract = `GeminiResponseContract`).
- `buildExperienceImprovementPrompt` → `experienceSummaries[]` (contract implicit; not typed
  in `types.ts` but parsed by `experienceImprovementParser`).
- `buildFinalOutputPrompt` → `refinedSummary, prioritizedKeywords, polishedExperienceSections[],
  finalRecommendations, cautions` (contract = `FinalOutputResponseContract`).

**Parsing** (belt-and-suspenders; AI text → contract → domain):
- All three parsers strip leading/trailing ``` ``` ``` / ```` ```json ```` fences, then
  `JSON.parse`. Arrays normalized via `normalizeStringArray` (trim, drop non-strings,
  drop empties). `finalOutputParser` dedups arrays via `Set`.
- `createAnalysisResult` caps: missingKeywords≤25, suggestedSkills≤25, experienceImprovements≤5,
  atsTips≤10; clamps score to 0–100 (rounds). Adds `id`, `resumeId`, `createdAt`.
- `createFinalResumeOutput` caps: prioritizedKeywords≤20, sections≤6, bullets≤5/section,
  finalRecommendations≤12, cautions≤8; adds `id`, analysisId, createdAt.
   - Validation throws are surfaced as `analysisError`/`finalOutputError` → shown in UI.

**Two type files — and a duplication to watch:**
   - `src/types/resume.ts` = domain/persisted types: `ProfessionalExperience`,
     `ExperienceImprovement`, `AnalysisResult`, `FinalResumeOutputSection`,
     `FinalResumeOutput`, `ResumeMetadata`, `ResumeStateSnapshot`.
   - `src/services/ai/types.ts` = AI response contracts: `GeminiResponseContract`,
     `FinalOutputResponseContract`.
   - **⚠ Verified duplication:** `AnalysisResult` is defined **identically** in BOTH
     `resume.ts:29` and `ai/types.ts:1` (same fields, same optionality). The store and
     `geminiService` import the `resume.ts` version; `analysisParser` imports the
     `ai/types.ts` version (and `createAnalysisResult` returns it). They are structurally
     compatible so TS accepts it, but they can silently drift. Do not add fields to one
     without mirroring the other. `FinalResumeOutput` is NOT duplicated (only in `resume.ts`).
   - **Two distinct "experience improvement" concepts (Verified):**
     (a) `experienceImprovements: [{original, improved}]` is part of the **main** analysis
     contract (`buildGeminiPrompt` → `analysisParser` → `AnalysisResult`) and IS rendered
     on the Analysis Result screen. This is active.
     (b) `runExperienceImprovementAnalysis` / `analyzeProfessionalExperience` is a SEPARATE
     AI call (`buildExperienceImprovementPrompt` → `parseExperienceImprovementResponse`)
     that enriches saved `ProfessionalExperience` entries (summary/keywords/suggestions) —
     see §11 Risk 4: it is implemented and tested but **not wired to any UI**.

## 8. Conventions

- **Imports:** relative, `@/` alias NOT used in practice (tsconfig has it, but all
  source uses `../..` relative imports); keep consistent with existing style.
- **Styles:** `StyleSheet.create` per-component, tailwind-free, hardcoded hex palette
  (`#0F172A` slate-900, `#2563EB` blue-600, `#14B8A8` teal-500, `#F8FAFC` bg, etc.).
- **Components:** presentational only; state lives in Zustand. `ScreenContainer` wraps
  `SafeAreaView`+`KeyboardAvoidingView`+optional `ScrollView`; `PrimaryButton` renders
  `react-native-paper` Button with `ActivityIndicator` while loading.
- **Validation:** centralized in `src/utils/validation/*`; each returns `{valid, trimmed,
  message?}`. Use cases call these before hitting AI.
- **Errors:** user-facing messages are friendly & specific; raw API errors are mapped.
  Store errors in `analysisError`/`finalOutputError` and render inline.
   - **Defensive rendering:** screens use `?? []`/`?? ''` and `useMemo` view-models; never
     render raw nullable data.
   - **Shared helper duplication:** `normalizeStringArray` (trim → drop non-strings → drop
     empties) is copy-pasted identically in `analysisParser`, `experienceImprovementParser`,
     and `finalOutputParser`; only `finalOutputParser` adds `Set` de-dup. If adding a new
     parser, consider importing a shared helper rather than copy-pasting again.
   - **No comments** in source (per the AI coding rules) — keep new code comment-free;
     explain intent in memory instead.

## 9. Quality Gates (commands)

From MVP plan "Final Validation" sections:
- `npx tsc --noEmit` — TypeScript (strict). **Passes** (restored this session): the
  base-config resolution failure (`tsconfig.json` couldn't resolve
  `@react-native/typescript-config/tsconfig.json` because that subpath isn't in the
  package's `exports` map) was fixed by extending `@react-native/typescript-config`
  (the root `.` export). The remaining genuine errors were fixed at source:
  `react-native-dotenv` has no usable `@types` (the 0.2.x DT package uses
  `export = env`, incompatible with named imports), so an ambient
  `src/types/react-native-dotenv.d.ts` declares `GEMINI_API_KEY`/`APP_ENV`;
  `storage.ts` null checks became a parameter type-guard
  (`isStorageReady(instance): instance is NonNullable<...>`); `PrimaryButton`'s
  `icon` prop is typed as the public `ButtonProps['icon']`. All three gates now
  pass; new code must not regress them.
- `npm test -- --runInBand --watch=false` — Jest. **Passes** (12 suites / 30 tests,
  restored this session). ⚠️ **React 19 concurrent-render testing rule:**
  `react-test-renderer` 19.x renders concurrently, so `renderer.create(...).toJSON()`
  reads `null` unless the render is flushed with `React.act`. The correct pattern
  is `const r = await React.act(() => renderer.create(<X />)); r.toJSON()` —
  capture the renderer instance *inside* `act`, then read the tree **after** `act`
  resolves. Reading `toJSON()` *inside* the act callback returns `null`. The two
  suites that render components (`App.test.tsx`, `FinalResumeOutputScreen.test.tsx`)
  use this pattern and mock every native/module dependency that touches the render
  chain: `react-native-pdf-text-extractor`, `react-native-dotenv`,
  `react-native-safe-area-context` (SafeAreaProvider/SafeAreaView → stubbed host
  elements), and `react-native-paper` (PaperProvider/Button/Text → stubbed; note
  the theme needs `MD3LightTheme: {colors:{}}`). `IS_REACT_ACT_ENVIRONMENT` and
  `IS_REACT_NATIVE_TEST_ENVIRONMENT` are both set by the react-native jest preset.
- `npm run lint` — ESLint (`@react-native` config). **Passes.**

## 10. Decisions (already made; preserve)

- Single Zustand store + MMKV, not Redux/Context — keep it.
- Local-only (no backend) — `SettingsScreen` codifies this.
- Service-layer separation (use-case → service → parser) — screens never call Gemini.
- Truthfulness enforced in prompts + post-parse validation/caps — do not relax caps.
- MMKV stores only ONE snapshot ("latest"); not a history. Keep single-snapshot model.
- **Validation-tuned flow (this session):** the primary journey is deliberately scoped to a
  single AI call (Analysis). The Final Output CTA and the "Professional Experience
  Recommendations" card were removed from the Analysis Result screen; the underlying code is
  left in place (not deleted) so it can be re-enabled. The usefulness signal was added to
  measure the core hypothesis ("people find AI-powered resume analysis useful").
- **AI quality runtime-verified (this session):** the core Gemini analysis was validated
  end-to-end against the real Gemini API with realistic synthetic resume/JD data. The analysis
  output (match score, keywords, summary, skills, improvements, tips) was high-value, specific,
  JD-aligned, and not fabricated (anti-fabrication cautions fired correctly). This is the
  product's strongest asset — preserve its prompts/parsing/caps.
  - **⚠ Evidence, not a guarantee:** This was a point-in-time validation on synthetic data.
  It demonstrates the pipeline CAN produce excellent output and that the quality safeguards work.
  It does NOT guarantee every future real-world input will produce equally good output. Real
  users will submit messy, ambiguous, or adversarial resumes/JDs — treat quality as something
  to monitor, not assume. Do not relax caps or anti-fabrication rules.

## 11. Risks (verified)

 1. **`.env` tracking → remediated in working tree (Verified).** As of this session
    `.env` was untracked (`git rm --cached .env`, staged deletion, working file retained so
    local dev continues) and `.env` was added to root `.gitignore`. `git ls-files .env` no
    longer returns it; `git check-ignore .env` matches `.gitignore`. ⚠️ The previous key
    was committed to history, so **untracking alone does not invalidate it** — manual
    rotation at the provider is still required (see §13 Manual Actions). Commit the
    staged `.gitignore` + `.env` deletion to finalize.
 2. **API key logging → remediated (Verified).** Removed: the module-load log
    (`geminiService.ts:21`), the `apiKeyPreview` const + key-preview/length log (`:55-56`),
    and the Gemini error-payload log (`:96`). The only remaining `console` is the
    HTTP **status** log (`:72`), which is operational and non-secret. No code path logs
    resume text, job description, prompts, raw response, or any part of the API key.
    `pdfExtractor.ts:16` still logs the extraction error object (non-secret, left as-is).
    **Security rule for future work:** never log the API key (length/preview/contents),
    resume text, JD, prompt, or raw AI response.
  3. **Gemini model → verified valid.** `gemini-3.6-flash` (`geminiService.ts:55`) is a real,
  GA-stable Gemini model (released July 2026; model code `gemini-3.6-flash`; 1,048,576
  input / 65,536 output tokens; available via Gemini API & AI Studio). Verified against
    Google's official docs/cMODEL card. No code change needed; do not "fix" this name.
  4. **Two dormant AI features (Verified).** (a) `runExperienceImprovementAnalysis`
     (`analyzeResumeUseCase.ts:40`) → `geminiService.analyzeProfessionalExperience` →
     `buildExperienceImprovementPrompt` / `parseExperienceImprovementResponse` are
     implemented + unit-tested (`experienceAiParser.test.ts`) but **not invoked from any
     screen**. (b) Final Resume Output (`runFinalOutputGeneration`, `FinalResumeOutputScreen`)
     is implemented + tested but its CTA was **removed from the Analysis Result screen** so the
     second AI call is not part of the validation journey. Both remain in code; the Experience
     AI call is fully dormant, and Final Output is reachable only via deep navigation.
  5. **Type duplication / drift risk (Verified).** `AnalysisResult` is defined in both
    `resume.ts` and `ai/types.ts` (structurally identical today). Adding a field to one
    without the other would silently diverge what the store expects vs. what the parser
    returns.
 6. **Unused exports (Verified, minor).** `ExperienceOptimizationSuggestion` (resume.ts:6)
    is defined but never imported; `resumeId`/`jobTitle`/`company` on `AnalysisResult`
    and `analysisId` on `FinalResumeOutput` are set but never read by the UI. Dead data,
    not dead code paths — ignore unless removing.

## 12. Unknowns / needs real-user validation

- **Core hypothesis untested with real users:** "People find AI-powered resume analysis useful."
  The AI quality is runtime-verified, but whether real users find the analysis actionable is
  unknown. The 👍/👎 usefulness signal is the local-only measurement — it is NOT yet wired to
  any export/aggregation, so it currently only persists per-device in MMKV.
- **ATS score usefulness:** the score is kept to test whether users find it meaningful; no
  conclusion yet.
- **Resume text paste uptake:** unknown whether users prefer paste over PDF upload.
- Whether the app currently builds/launches on iOS (Android verified this session).
- Whether `ExperienceOptimizationSuggestion` was a planned-but-abandoned type — intent unknown.
- **No cover letter, LinkedIn tools, PDF generation, multi-resume history, model selection, or
  advanced prompt controls** (all intentionally out of scope; see §1).

## 12b. Current Limitations (Verified)

Functional gaps that exist by current design (not bugs):

- **Usefulness signal has no export/aggregation.** The 👍/👎 response is stored per-device in
  MMKV. There is no API, dashboard, or export to tally responses across users. A future
  session wanting to read these must add an explicit extraction mechanism (the user has not
  asked for one yet).
- **Single-resume model.** MMKV holds one snapshot; re-running analysis overwrites the previous
  result. No history.
- **AI is the only network call; no retry queue** beyond the 30s timeout + error mapping.
- **ATS score precision risk.** The score is a precise-looking number from the model with no
  breakdown; it is presented with an explanation, but whether users trust/understand it is
  unmeasured.
- **Dormant features are not user-discoverable.** Final Output and Experience AI exist in code
  but are not surfaced in the UI. A user cannot find them without deep navigation (Final Output)
  or at all (Experience AI).
- **iOS build not verified this session** (Android build verified).
- **PDF photo embedding is platform-dependent.** Modern/Europass templates include `<img>` tags
  for local `photoUri`, but `react-native-html-to-pdf` may or may not render local file URIs
  on iOS/Android. Export does not fail if the image is omitted.
- **PDF link clickability is platform-dependent.** HTML `<a href>` links are preserved by
  iOS PDFKit but may be dropped by Android `PdfDocument`.

## 13. Manual Actions

These cannot be completed by editing code alone and must be done by a human / CI:

1. **Commit the staged `.gitignore` + `.env` deletion** to finalize untracking (do NOT
   commit a new `.env`).
2. **Rotate the exposed `GEMINI_API_KEY`.** The key has been in git history; untracking
   does not invalidate it. Create a fresh key in Google AI Studio / Google Cloud, write
   it to the local `.env` (now gitignored), and revoke the old key at the provider.

---

*Maintain via the workflow in [WORKFLOW.md](./WORKFLOW.md). Append material changes to
[DISCOVERIES.md](./DISCOVERIES.md).*
