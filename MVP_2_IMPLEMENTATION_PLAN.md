# TailorCV AI — MVP 2 Implementation Plan

## Goal
Build the next product layer after MVP 1: a more complete professional resume experience focused on professional history and resume improvement workflows, while keeping the architecture mobile-first, local-first, and production-oriented.

## Scope Guardrails
This plan is strictly for MVP 2 only.

In scope:
- Professional experience editing and enhancement
- Resume experience section management
- Experience timeline / role history improvements
- Better ATS scoring for professional experience
- Enhancement suggestions for responsibilities and achievements
- Suggested wording refresh for work history
- Improved result UX for experience-oriented recommendations
- Local persistence for professional-editing state
- Resume analysis refinements tied to experience achievements
- Final MVP 2 validation and tests

Out of scope:
- Firebase / cloud sync
- Auth / login / registration
- RevenueCat / subscriptions
- Cover letters
- LinkedIn generators
- PDF export
- History dashboard beyond MVP 2 needs
- Any MVP 1 or MVP 3 features that are not explicitly required here

## Current Status
- MVP 1: complete only when final validation passes
- MVP 2: not started

## Execution Principle
Follow this order strictly:
1. Small change
2. Compile
3. Test
4. Verify
5. Next change

Do not refactor unrelated working code.
Do not add infrastructure not required for MVP 2.
Do not start implementing MVP 3 features.

## Workstream 1 — MVP 2 Product Definition
### Objectives
Define the user flow for professional experience enhancements, including:
- editing work history inputs
- enhancing bullet points
- improving impact/achievement language
- integrating recommendations back into a resume-friendly draft

### Deliverables
- Professional experience editing screen or section
- Experience form model
- Validation for role title, company, dates, and responsibilities
- Output that is usable for ATS improvement

## Workstream 2 — Experience Data Model
### Tasks
Define or extend the data model for:
- job title
- company name
- location
- start date / end date
- role summary
- bullet achievements
- keywords relevant to job target
- generated improvement suggestions

### Acceptance
- Experience objects are typed and consistent
- Data is saved to store or persistence layer
- Data supports ATS optimization workflows

## Workstream 3 — Experience Editing UX
### Tasks
- Create a professional experience editor
- Allow adding/editing multiple roles
- Support structured fields for job details
- Allow bullet point management
- Offer a clear save and cancel flow

### Acceptance
- User can add and edit role history without confusion
- Data stays consistent and valid
- Data persists locally between app sessions

## Workstream 4 — ATS Enhancement for Experience
### Tasks
- Use AI analysis to improve:
  - bullet wording
  - measurable impact language
  - missing role keywords
  - action verbs
  - achievement framing
- Keep recommendations truthful and evidence-based
- Never fabricate responsibilities or metrics

### Acceptance
- Recommendations increase ATS quality without inventing content
- Output remains grounded in the actual resume data

## Workstream 5 — AI Prompt and Response Design for MVP 2
### Tasks
- Extend prompt builder to support professional experience optimization
- Add structured output for improvements on work history items
- Validate content before it reaches the UI
- Keep AI response contract separate from UI contract

### Acceptance
- Prompt clearly targets experience-level improvement
- Structured result is validated before rendering

## Workstream 6 — Result Experience UI
### Tasks
- Add a dedicated experience-oriented result section
- Show improved role summary and bullets
- Show keyword alignment and impact opportunities
- Display pre/post improvement examples clearly

### Acceptance
- User can compare original and optimized experience text
- Output is easy to understand and act on

## Workstream 7 — Persistence and Rehydration
### Tasks
- Persist professional experience data and latest improvement suggestions
- Restore them after app restart
- Ensure invalid or stale persisted data does not crash the app

### Acceptance
- Experience data remains available after reopening the app

## Workstream 8 — MVP 2 Testing
### Required tests
- Experience form validation
- Experience model serialization / persistence
- Prompt and parser validation for experience improvements
- ATS improvement rendering
- Regression checks for MVP 1 flows if reused

### Acceptance
- All MVP 2 tests pass
- MVP 1 behavior remains intact if it is reused by the new flow

## Workstream 9 — Final MVP 2 Validation
### Tasks
Run and verify:
- `npx tsc --noEmit`
- `npm test -- --runInBand --watch=false`
- `npm run lint`
- Android debug build / launch readiness

### Acceptance
- Project compiles
- Tests pass
- Lint passes
- Android build is ready

## Final Acceptance Checklist
MVP 2 is only complete when all are true:
- User can add professional experience entries
- User can edit experience details
- Experience validation works
- Experience suggestions are grounded in actual resume data
- AI output is validated before rendering
- Expanded ATS experience results render clearly
- Experience suggestions persist locally
- Data survives app reopen
- Tests pass
- TypeScript passes
- Lint passes
- Android build is ready

## Files to Keep in Focus
- [src/screens](src/screens)
- [src/store/useResumeStore.ts](src/store/useResumeStore.ts)
- [src/services/ai](src/services/ai)
- [src/types](src/types)
- [src/utils](src/utils)
- [App.tsx](App.tsx)

## Stop Conditions
Stop and do not continue beyond MVP 2 if:
- the task drifts into MVP 3
- architecture grows beyond the mobile-local-first scope
- tests or build checks fail
- functionality is not grounded in actual resume data

## Final Decision Rule
If validation checks pass:
- Final result: MVP 2 — PROFESSIONAL EXPERIENCE COMPLETE

If not:
- Final result: MVP 2 — NOT COMPLETE
- List blockers clearly

## Ready-to-Use Start Prompt
Use this exact prompt when beginning implementation:

You are a Principal React Native CLI + TypeScript Mobile Architect working inside this project:

/Users/asad/Desktop/Etiqa/apps/tailorcv-ai

Current status:
- MVP 1: complete only after final validation passes
- MVP 2: not started

Follow the MVP 2 implementation plan in MVP_2_IMPLEMENTATION_PLAN.md.

Scope strictly to MVP 2 only.

Implement the professional experience enhancement workflow, including:
- professional experience data model
- experience editing UX
- ATS improvement suggestions for work history
- AI prompt/response design for experience optimization
- result rendering for improved experience content
- local persistence and hydration
- validation and testing

Do not implement:
- Firebase
- auth
- cloud sync
- subscriptions
- cover letters
- LinkedIn generators
- PDF export
- any MVP 3 features
- any unrelated MVP 1 expansion beyond what is required for MVP 2

Preserve the existing architecture and avoid unnecessary refactors.

Validate the work by running:
- `npx tsc --noEmit`
- `npm test -- --runInBand --watch=false`
- `npm run lint`
- Android debug build readiness check

Do not declare MVP 2 complete unless all checks pass.
