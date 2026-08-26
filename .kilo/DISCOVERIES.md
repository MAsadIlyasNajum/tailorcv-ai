# Discoveries Log

Append-only record of findings, decisions, and change signals. This file exists so
future sessions can detect architecture / AI / dependency / convention drift without
re-reading every file. Newest entries at the top.

---

## 2026-08-23 — Memory maintenance (validation-tuned build)

**Scope:** Memory-only task. No application source code was modified. Inspected the full
`src/` tree to verify the existing `.kilo/` memory against current code, then added the
sections the user requested for future-session understanding.

- **Verified the existing memory is accurate.** Re-read `geminiService.ts`, `promptBuilder.ts`,
  `analysisParser.ts`, `finalOutputParser.ts`, `experienceImprovementParser.ts`,
  `analyzeResumeUseCase.ts`, `types/resume.ts`, `services/ai/types.ts`, `AppNavigator.tsx`,
  all screens, all validators, `storage.ts`, `useResumeStore.ts`. The prior memory correctly
  described the architecture, AI pipeline, caps, dormant features, and flow. No corrections
  needed to existing facts.
- **Added to PROJECT_MEMORY.md:**
  - **§1b Product Philosophy** — records "validation over feature completeness" / "optimize for
    learning, not building" as the CURRENT mode, with the explicit caveat that this is temporary
    and must NOT be used to auto-refuse future feature requests.
  - **§5b Current Capabilities Summary** — a concise checklist of what actually works right now
    (resume input, JD input, AI analysis, output/feedback, persistence, local-first).
  - **§5c Dormant Functionality** — explicit section for Final Output + Experience AI +
    removed Recommendations card, with the rule "dormant ≠ deleted ≠ broken; do not clean up
    unless asked."
  - **§12b Current Limitations** — functional gaps by design (no usefulness export, single-resume,
    no retry queue, ATS precision risk, dormant features not discoverable, iOS unverified).
  - **Enhanced §10 AI quality note** — made the "runtime-validated evidence, not a guarantee"
    distinction explicit: the pipeline CAN produce great output; real-world quality must still be
    monitored; do not relax caps.
- **Added to WORKFLOW.md staleness checklist:** checks for product-mode shifts, dormant-feature
  wiring/removal, and usefulness-signal export changes.
- **Re-check next time:** if the user asks for a feature, evaluate it on architecture + explicit
    request — not against §1b's "optimize for learning." If dormant features get wired or removed,
  update §5/§5c/§11.

## 2026-08-22 — Restore quality gates (TypeScript + tests)

**Scope:** Make `npx tsc --noEmit`, `npm run lint`, and `npm test` all green. No product
redesign; left AI/type duplication, experience-AI wiring, README, unused-dep cleanup for
separate tasks. Also removed the now-resolved `tsc` manual action from PROJECT_MEMORY.

- **TypeScript root cause (1 error → ~282 cascade):** `tsconfig.json` extended
  `@react-native/typescript-config/tsconfig.json`, but that subpath is NOT in the package's
  `exports` map (only `.` and `./strict`). Resolution failed (TS6053), so the base
  config's `jsx`, `esModuleInterop`, `moduleResolution` were never applied → ~282 JSX /
  default-import cascade errors. **Fix:** extend `@react-native/typescript-config` (the
  root `.` export). This is the canonical, intended path — not a config weakening.
- **Genuine remaining type errors, fixed at source (not suppressed):**
  - `react-native-dotenv` has no usable types. `@types/react-native-dotenv@0.2.2` uses
    `export = env` (CommonJS index signature), which does NOT satisfy our named import
    `import {GEMINI_API_KEY}`. **Fix:** ambient `src/types/react-native-dotenv.d.ts`
    declaring the two whitelisted keys as `string`. (Verified 0.2.2 incompatible before
    choosing this.)
  - `storage.ts` `isStorageReady()` returned `boolean`, which doesn't narrow the `storage`
    union → TS18047 on 3 call sites. **Fix:** parameter type-guard
    `isStorageReady(instance): instance is NonNullable<typeof storage>`; call sites pass
    `storage`. No behavior change.
  - `PrimaryButton` `icon?: React.ReactNode` is wider than paper's `icon?: IconSource`
    → TS2322. `IconSource` is not publicly re-exported from `react-native-paper`. **Fix:**
    `icon?: ButtonProps['icon']` (public). No behavior change.
- **Test root cause (corrected prior diagnosis):** Prior memory blamed
  `react-native-safe-area-context` for the "null tree". The REAL root cause is React 19.2 +
  react-test-renderer 19.x: it renders **concurrently**, and `renderer.create(...).toJSON()`
  returns `null` unless flushed with `React.act`. The correct pattern is to capture the
  renderer instance inside `act` and read `toJSON()` AFTER `act` resolves:
  `const r = await React.act(() => renderer.create(<X />)); /* then */ r.toJSON()`.
  Reading `toJSON()` *inside* the callback yields `null`. `App.test` passed earlier only
  because it never read the tree.
- **Test harness fixes:** Added missing native/module mocks to `App.test.tsx`
  (`react-native-pdf-text-extractor`, `react-native-safe-area-context`,
  `react-native-paper` with `MD3LightTheme:{colors:{}}` so `theme.ts` loads) and to
  `FinalResumeOutputScreen.test.tsx` (`react-native-safe-area-context`); converted all three
  component tests to the `await React.act` capture-then-read pattern.
- **Verification:** `tsc` exit 0; lint exit 0; tests 12 suites / 30 tests pass.
- **Diff is scoped:** only `tsconfig.json`, `storage.ts`, `PrimaryButton.tsx`, the new
  `src/types/react-native-dotenv.d.ts`, and the two test files. `.gitignore` /
  `geminiService.ts` changes in the tree are from the prior security task (not this one).
- **Re-check next time:** the `await React.act` capture-then-read pattern is mandatory for
  any new component test in this repo — a test that calls `.toJSON()` synchronously will
  see `null`.

**Scope:** Re-validated the memory system against source; no source changes. Findings
that refined (not overturned) the initial picture, consolidated into PROJECT_MEMORY.

- **`AnalysisResult` is duplicated** in `src/types/resume.ts` and `src/services/ai/types.ts`
  (structurally identical). analysisParser returns the `ai/types.ts` copy; store/service
  use the `resume.ts` copy. Structural compatibility masks drift risk. (→ PROJECT_MEMORY §7 Risk 5)
- **`normalizeStringArray` is copy-pasted** in all 3 parsers (dedup only in finalOutput).
- **Model `gemini-3.6-flash` is hardcoded inline** (`geminiService.ts:63`); no config/const
  abstraction; not verifiable from repo → UNKNOWN. (→ Risk 3)
- **`.env` confirmed still tracked** (`git ls-files .env` returns it; not ignored; no
  `.env` rule in `.gitignore` at HEAD). (→ Risk 1)
- **Logging narrowed:** key *preview* (4+4 chars) + length logged at `:56`/`:21` — a real
  secret exposure; response status (`:80`) and Gemini error payload (`:96`) are also
  logged (borderline). (→ Risk 2)
- **Vestigial/unused items verified:** `resumeId`, `jobTitle`, `company` on `AnalysisResult`
  and `analysisId` on `FinalResumeOutput` are set but never read; `ExperienceOptimizationSuggestion`
  is never imported. (→ §4 + Risk 6)
- **Unreachable confirmed:** `runExperienceImprovementAnalysis`/`analyzeProfessionalExperience`
  have zero UI callers; only the main analysis flow + final-output generation are reachable.

## 2026-08-22 — Security hardening (this task)

**Scope:** Secure the Gemini API key + audit Gemini model/config. No unrelated cleanup.

- **`.env` untracked + gitignored (Verified/Remediated).** `git rm --cached .env` (staged;
  working file retained → local dev still works). Added `.env` to root `.gitignore`.
  `git ls-files .env` now empty; `git check-ignore .env` matches. ⚠️ Key was in git history →
  **rotate at provider** (manual). Do NOT re-commit a `.env`.
- **API-key logging removed (Verified/Remediated).** Dropped module-load log (`:21`), key
  preview+length log (`:55-56`), and Gemini error-payload log (`:96`) from
  `geminiService.ts`. Only the HTTP-status log (`:72`) remains (operational, non-secret).
  No code logs resume text / JD / prompt / raw response / key.
- **Gemini model verified valid.** `gemini-3.6-flash` (`geminiService.ts:63`) is a real
  GA-stable Gemini model (Google docs, July 2026; 1M in / 65K out tokens). No change.
- **Quality-gate verification (no regressions):** lint `PASS` (exit 0). `tsc` fails with
  308 pre-existing errors (all in untouched files/config: `tsconfig.json:2` TS6053 base
  config unresolvable → JSX cascade; `react-native-dotenv` missing `@types` TS7016;
  `storage.ts` null TS18047) — the only `geminiService` error is the pre-existing TS7016
  on the unchanged dotenv import; my diff adds 0 type errors. Tests: 10/12 suites pass;
  the 2 failures (`App.test` unmocked pdf-text-extractor; `FinalResumeOutputScreen.test`
  unmocked safe-area-context) are pre-existing test-harness gaps, neither importing
  `geminiService`.
- **Diff is surgical:** `.gitignore` (+3) + `geminiService.ts` (−9) + staged `.env`
  removal. No other source/test/config files changed.

## 2026-08-22 — Initial repository investigation

**Scope of this session:** Created the project-memory system (`PROJECT_MEMORY.md`,
`WORKFLOW.md`, this log). No source code was modified. All findings below are
**Verified** unless explicitly marked otherwise.

- **Framework:** React Native CLI 0.84.1 + React 19.2.3, NOT Expo. Entrypoint
  `index.js` → `App.tsx` → `AppNavigator`.
- **State:** single Zustand store `useResumeStore` (src/store/useResumeStore.ts);
  persists to MMKV under key `latest-analysis`.
- **PDF pipeline:** picker → `keepLocalCopy` (caches) → `react-native-pdf-text-extractor`
  `extractText` → `normalizeResumeText`. 10 MB max, PDF-only via
  `validateResumeFile`.
- **AI pipeline:** `geminiService.ts` is the ONLY Gemini touchpoint. 30s AbortController
  timeout. Model name **`gemini-3.6-flash`** (geminiService.ts:63). **Unknown** whether this
  is a currently-listed public Gemini model — needs verification against the live API
  model list.
- **Three prompts** in `promptBuilder.ts` (resume analysis, experience improvement,
  final output), all JSON-only with strict anti-fabrication rules.
- **Two type layers:** `src/types/resume.ts` (domain/persisted) and
  `src/services/ai/types.ts` (AI contracts). Bridge via `createAnalysisResult` and
  `createFinalResumeOutput`, which also enforce caps (score 0–100; ≤25 keywords/skills;
  ≤5 improvements; ≤10 tips; ≤20 final keywords; ≤6 sections; ≤5 bullets/section; etc.).
- **Wiring gap (Verified):** `runExperienceImprovementAnalysis` and
  `geminiService.analyzeProfessionalExperience` are implemented + unit-tested
  (experienceAiParser.test.ts) but are **not invoked from any screen**. The Analysis
  Result "Professional Experience Recommendations" card reads `professionalExperiences`
  from the store, so it is empty until a user manually adds roles in the Experience
  Editor.
- **Dead dependency (Verified):** `react-native-blob-util` is listed in `package.json`
  and mocked in `__tests__/App.test.tsx` but is not imported anywhere in `src/`.
- **Security risk (Verified):** `.env` is still tracked in git (`git ls-files .env`
  returns it; `git check-ignore .env` exits non-zero). It contains
  `GEMINI_API_KEY=...`. A prior commit "Remove tracked .env and update gitignore" did
  not actually untrack it. **Recommend:** `git rm --cached .env` + add `.env` to
  `.gitignore` + rotate the key.
- **Logging risk (Verified):** `geminiService.ts` logs the API key length + a
  4-char/4-char key preview (lines 21, 56) and the Gemini response HTTP status + error
  payload (80, 96). This violates MVP_1's own "no secret in logs" guardrail.
- **MVP roadmap present:** `MVP_1/2/3_IMPLEMENTATION_PLAN.md` define staged scope.
  Current code already implements MVP 1 + substantial MVP 2/3 (experience editor, final
  output). `SettingsScreen` literally says "MVP 1" and states local-only by design.
- **Package manager:** pnpm (`pnpm-workspace.yaml`, `node-linker=hoisted`);
  `node_modules` is pnpm-structured.
- **Tests:** Jest + `react-test-renderer` (not @testing-library). Tests at repo root
  path `__tests__/` and import via `../src/...`. Jest config has no `rootDir` so default
  (project root) applies.

**Re-check next time:** whether any of the following changed: the Gemini model name,
`.env` tracking status, the single-store/single-MMKV-key persistence model, the
contract-vs-domain type split, or whether `runExperienceImprovementAnalysis` got wired
to UI.
