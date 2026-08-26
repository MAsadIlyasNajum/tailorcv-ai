# Workflow — Working in TailorCV AI

A repeatable operating rhythm that keeps me (and human contributors) from
re-discovering facts and from making assumptions. Always prefer the source code as
truth; this file is navigation + process only.

## The rhythm

```
Understand → Inspect → Verify → Plan → Change → Test → Review → Remember
```

### Understand
- Read the relevant section of `PROJECT_MEMORY.md` first.
- If the task spans a feature, trace it on the navigation map:
  `Home → UploadResume → JobDescription → AnalysisResult → FinalResumeOutput`, and
  note the supporting `ExperienceEditor` + `Settings`.
- Ask: does this touch the **AI contract** (prompt/parser/type)? The experience parsers
  & types live in BOTH `src/types/resume.ts` and `src/services/ai/types.ts` — confirm
  which layer you are extending.

### Inspect
- Localize the change to one concern; identify the smallest set of files.
- For AI changes, the chain is always:
  `geminiService.ts` → `promptBuilder.ts` (prompt) + `callGemini` (HTTP) →
  `<name>Parser.ts` (raw→contract) → `createX` (contract→domain, applies caps) →
  `useResumeStore` → screen.
- Remember: **Gemini is only ever called from `GeminiService.callGemini`**. Any new
  AI touchpoint must go through `analyzeResumeUseCase` + `geminiService`.

### Verify (before editing)
- Confirm facts, do not assume. Use `grep`/`read` to confirm call sites.
  Example: if you need "where is the model name set?", it is
  `geminiService.ts:63` (`gemini-3.6-flash`).
- Check whether something is wired: e.g. `runExperienceImprovementAnalysis` exists but
  is **not** called from any screen (Verified — see PROJECT_MEMORY §11 Risks).

### Plan
- Make the smallest change that adds user value; do not refactor working code for
  style (MVP plans explicitly forbid it).
- State the data flow: which store fields it reads/writes and which caps apply
  (`createAnalysisResult`/`createFinalResumeOutput`).
- If it changes a prompt schema or a persisted type, also update the matching parser
  test and the store hydration path.

### Change
- Match existing conventions (see PROJECT_MEMORY §8): relative imports,
  `StyleSheet.create`, comment-free code, friendly user-facing errors, defensive
  rendering with `?? []`.
- New AI output fields → add to BOTH the prompt JSON schema AND the parser AND the
  contract type AND the domain type (when different). Keep contract→domain bridge in
  the `create*` function so caps are the single enforcement point.
- Do **not** log resume text, job description, raw AI response, or any part of the API
  key (Risk 2). Remove any debug `console.log` of these.

### Test
- Run the gated set (see below). Jest tests mirror `__tests__/` to `src/`.
- For AI/parser changes, the relevant tests are `analysisParser`, `finalOutputParser`,
  `experienceAiParser`, `analyzeResumeUseCase`. They mock `geminiService` — keep them
  mocked; never hit the real API in tests.
- Persistence: `resumeStorePersistence` covers MMKV round-trip; `pdfUpload` covers
  file validation; `FinalResumeOutputScreen` covers render of present/absent state.

### Review
- Re-read your diff for: (a) any new log of PII/key/response, (b) any store mutation
  that bypasses `persistSnapshot`, (c) caps preserved, (d) defensive `??` on nullable
  data in screens.
- Confirm no screen imports Gemini directly and no new top-level network call appears
  outside `GeminiService`.

### Remember (close the loop — keep memory fresh)
After the change is done, update memory:
1. If you changed architecture, data flow, types, or AI contract → edit
   `PROJECT_MEMORY.md` sections that are now stale.
2. If you changed conventions or commands → update `WORKFLOW.md` §Quality Gates.
3. **Always** append a short entry to `DISCOVERIES.md` (date + what changed + what to
   re-check). This is the cheap staleness signal the memory system relies on.
4. If you deferred a known issue (e.g. a security fix), ensure it is listed in
   PROJECT_MEMORY Risks and that DISCOVERIES records it.

## Quality gates (commands)

Preferred sequence — run all three before finishing any change:
```bash
npx tsc --noEmit && npm run lint && npm test -- --runInBand --watch=false
```
A one-shot variant lives at `.kilo/command/run-quality-gates.md`.

## Staleness checklist (run this mentally when picking up the repo again)

- Did `package.json` deps change? (stack in §2)
- Did the store shape or MMKV keys change? (§4)
- Did the AI contract (prompt JSON / parser / model name) change? (§7)
- Did tests move or the test renderer change? (still `react-test-renderer`)
- Is `.env` still tracked? (§11 Risk 1) If you see it is no longer tracked,
  update the memory; if a new secret is committed, record it.
- Do prompts still forbid fabrication and enforce JSON-only output? (§5)
- **Did the product mode shift?** PROJECT_MEMORY §1b records "validation over feature
  completeness" as the CURRENT mode. If the user later asks to add features, that is a
  deliberate mode shift — do not block it with "optimize for learning." Update §1b when the
  mode changes.
- **Did any dormant feature get wired or removed?** Final Output and Experience AI are
  dormant (§5c). If a screen starts calling `runExperienceImprovementAnalysis` or the Final
  Output CTA reappears on Analysis Result, that is a material flow change — update §5/§5c/§11.
- **Did the usefulness signal gain an export?** It is currently MMKV-only (§12b). If an
  aggregation/export is added, update §5b and §12b.

When any answer is "I'm not sure", treat PROJECT_MEMORY as stale and re-inspect.
