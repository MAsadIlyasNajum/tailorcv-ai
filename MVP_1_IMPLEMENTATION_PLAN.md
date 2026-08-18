# TailorCV AI — MVP 1 Implementation Plan

## Goal
Deliver a complete MVP 1 local-first ATS analysis flow from PDF upload to structured AI result, with all required validation and persistence in place, while explicitly preventing drift into MVP 2 or MVP 3 scope.

## Scope Guardrails
This plan is strictly limited to MVP 1.

In scope:
- Resume PDF upload
- PDF validation
- Local PDF extraction
- Text normalization
- Job description input and validation
- Gemini integration
- Prompt generation
- Response parsing and validation
- ATS score rendering
- Suggested summary / skills / keywords / improvements / ATS tips
- Loading and error states
- MMKV persistence for latest analysis
- Final MVP 1 validation

Out of scope:
- Firebase / cloud sync
- Auth / login / registration
- Crashlytics
- RevenueCat / subscriptions
- Multiple resumes
- History / dashboard
- PDF export
- Cover letters
- LinkedIn optimization
- Any MVP 2 or MVP 3 features

## Current Status
- MVP 1A — Foundation: complete
- MVP 1B — PDF upload + local extraction: complete
- MVP 1C — remaining implementation and final validation: pending

## Execution Principle
Follow the order below strictly:
1. Small change
2. Compile
3. Test
4. Verify
5. Proceed to next change

Do not combine unrelated refactors with feature work.
Do not rewrite working code for style-only reasons.
Keep the existing architecture stable.

## Workstream 1 — Finalize Job Description Flow
### Tasks
- Review existing `JobDescriptionScreen` and confirm behavior
- Confirm resume text and JD are both required before analysis
- Add or polish validation helper for empty / whitespace / too-short input
- Ensure user-facing error messages are friendly and specific
- Add clear action and counter
- Connect button state to analysis readiness
- Prevent duplicate analyzes while loading

### Acceptance
- Resume text exists
- JD exists and passes validation
- Analyze button disabled when invalid
- Clear action resets JD and error state
- Input remains scroll-friendly and professional

## Workstream 2 — AI Service Architecture
### Tasks
- Preserve service-layer direction: Screen → Use Case / Store → AIService → GeminiService
- Confirm `AIService` abstraction remains clean and reusable
- Keep UI unaware of Gemini implementation details
- Validate `geminiService.ts` is the only direct API integration point

### Acceptance
- No direct Gemini calls from screens or Zustand state
- Service architecture remains testable and extensible

## Workstream 3 — Gemini Integration
### Tasks
- Confirm `GEMINI_API_KEY` comes from configuration, not hardcoding
- Use existing `react-native-config` convention if already present
- Ensure no secret is printed in logs
- Ensure no resume text, JD text, or raw API response is logged
- Build request payload cleanly and safely
- Add timeout and HTTP error handling

### Acceptance
- No hardcoded secrets
- Safe error handling
- Request flow is isolated to the AI service layer

## Workstream 4 — Prompt and Response Contract
### Tasks
- Review `promptBuilder.ts`
- Confirm prompt includes resume text and job description clearly
- Require JSON-only AI output with truthful instructions
- Validate output shape via parser
- Reject malformed or fabricated results
- Ensure numeric score remains 0–100

### Acceptance
- Prompt enforces truthful ATS optimization only
- Parser strips code fences / wrapper text safely
- Invalid responses fail gracefully with user-friendly error

## Workstream 5 — Structured Result Model
### Tasks
- Verify `AnalysisResult` matches the MVP 1 contract
- Ensure types support:
  - `matchScore`
  - `missingKeywords`
  - `suggestedSummary`
  - `suggestedSkills`
  - `experienceImprovements`
  - `atsTips`
  - `jobDescription`
- Ensure state updates are saved to store as soon as result is accepted

### Acceptance
- UI receives only valid typed result data
- Corrupt model output cannot reach the UI

## Workstream 6 — Analysis Flow and State
### Tasks
- Review `analyzeResumeUseCase.ts`
- Confirm validation order:
  - resume exists
  - JD valid
  - set loading
  - call AI service
  - validate parsed response
  - save result
  - persist latest analysis
  - clear loading
- Prevent duplicate requests while running
- Ensure errors are surfaced clearly without leaking raw API details

### Acceptance
- Happy path works
- No double-submit
- Error path is clear and user-friendly

## Workstream 7 — Result Screen Rendering
### Tasks
- Review `AnalysisResultScreen.tsx`
- Render:
  - ATS match score
  - missing keywords
  - suggested summary
  - suggested skills
  - experience improvements
  - ATS tips
- Add CTA like copy summary if appropriate
- Ensure empty-state and fallback states are clean and truthful

### Acceptance
- No placeholder-only UI remains
- Final result view matches the actual result contract

## Workstream 8 — Persistence and Hydration
### Tasks
- Review `useResumeStore.ts` and `storage.ts`
- Confirm latest analysis persists in MMKV
- Confirm app hydrate restores analysis state on reopen
- Ensure invalid persisted payloads do not crash the app
- Preserve resume text + JD + analysis result snapshot pattern

### Acceptance
- Latest analysis survives app close and reopen
- App remains stable if persisted data is malformed

## Workstream 9 — Testing
### Required tests
- JD validation tests
  - empty
  - whitespace-only
  - too short
  - valid
- Text normalization tests
- AI parser tests
  - valid JSON
  - code fences
  - malformed JSON
  - missing fields
  - invalid score
  - wrong types
- Score boundary tests
  - 0
  - 50
  - 100
  - -1
  - 101

### Integration checks
- Resume text → JD → analysis → parsed result → store → persistence
- App restart restores latest analysis
- Mock Gemini API in tests; do not call real API

### Acceptance
- All MVP 1 tests pass
- Regression tests for existing MVP 1B behaviors still pass

## Workstream 10 — Final Validation and Quality Gates
### Tasks
Run and verify all relevant commands:
- `npx tsc --noEmit`
- `npm test -- --runInBand --watch=false`
- `npm run lint`
- Android debug build / launch readiness

### Acceptance
- TypeScript passes
- Tests pass
- Lint passes
- Android debug build is ready to run
- Final manual happy-path check is completed

## Final Acceptance Checklist
The work is only complete when all are true:
- Resume upload works
- PDF validation works
- Extraction works
- Resume text is normalized
- Resume text persists
- JD validation works
- Analyze is blocked correctly when inputs are missing
- Analyze can run when inputs are valid
- Gemini service works inside the app flow
- AI response is safely validated
- ATS score renders correctly
- Missing keywords render correctly
- Suggested summary renders correctly
- Suggested skills render correctly
- Experience improvements render correctly
- ATS tips render correctly
- Error states work
- Retry behavior works
- Latest analysis persists
- Analysis survives app restart
- MVP 1B tests still pass
- New tests pass
- TypeScript passes
- Lint passes
- Android debug build readiness is confirmed

## Files to Keep in Focus
- [App.tsx](App.tsx)
- [src/store/useResumeStore.ts](src/store/useResumeStore.ts)
- [src/services/ai/analyzeResumeUseCase.ts](src/services/ai/analyzeResumeUseCase.ts)
- [src/services/ai/geminiService.ts](src/services/ai/geminiService.ts)
- [src/services/ai/promptBuilder.ts](src/services/ai/promptBuilder.ts)
- [src/services/ai/analysisParser.ts](src/services/ai/analysisParser.ts)
- [src/screens/JobDescriptionScreen.tsx](src/screens/JobDescriptionScreen.tsx)
- [src/screens/AnalysisResultScreen.tsx](src/screens/AnalysisResultScreen.tsx)
- [src/utils/validation/jobDescriptionValidation.ts](src/utils/validation/jobDescriptionValidation.ts)
- [src/types/resume.ts](src/types/resume.ts)

## Stop Conditions
Stop and do not continue past MVP 1 if any of the following are true:
- Lint fails
- TypeScript fails
- Tests fail
- Android build is not ready
- Live Gemini integration is unverified
- App restart persistence is unverified
- The task starts drifting into MVP 2 or MVP 3 features

## Final Decision Rule
Only declare completion when all final validation checks pass.

If all checks pass:
- Final result: MVP 1 — CORE VALIDATION COMPLETE

If not:
- Final result: MVP 1 — NOT COMPLETE
- List blockers clearly and do not hide failures

## Ready-to-Use Start Prompt
Use this exact prompt when beginning implementation:

You are a Principal React Native CLI + TypeScript Mobile Architect working inside this project:

/Users/asad/Desktop/Etiqa/apps/tailorcv-ai

Current status:
- MVP 1A — Foundation: COMPLETE
- MVP 1B — PDF Upload + Local Extraction: COMPLETE
- MVP 1C — remaining implementation and final validation: pending

Follow the MVP 1 implementation plan in MVP_1_IMPLEMENTATION_PLAN.md.

Scope strictly to MVP 1 only. Do not implement Firebase, auth, cloud sync, multiple resumes, history, subscriptions, cover letters, PDF export, or any MVP 2/3 functionality.

Preserve the existing working architecture and avoid unnecessary refactors.

Complete the remaining MVP 1 tasks in order, verify with TypeScript and tests, and only declare completion after the final validation gate passes.
