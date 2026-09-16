# TailorCV AI — Master Product Specification

## Document Control

| Field | Value |
|---|---|
| Specification Version | 1.1 |
| Last Updated | 2026-08-28 |
| Current Product Status | MVP 2 Approved / Implementation in Progress |
| Product/App Name | TailorCV AI |
| Master Specification Status | Updated baseline |
| Source of Truth | This document for the current approved product state |

> **Update note:** MVP 2 was formally approved on 2026-08-28. The previous MVP 2 section was only proposed; it has now been replaced by the approved MVP 2 requirements below. Historical values remain recorded in Change History.

---

# 1. Product Overview

## Product Description

TailorCV AI is an AI-powered career/resume application designed to help job seekers adapt their resume to a specific job description.

The core product journey is:

**Resume + Job Description → AI Analysis → Match Insights + Improvement Recommendations → Tailored Resume → Application-ready Output**

## Product Goal

TailorCV AI should reduce the work required to tailor a resume for each job application and create a useful repeat-usage workflow.

The product is developed incrementally through independently deliverable MVPs.

## Important Product Principles

- Start with focused MVPs rather than building the complete career platform immediately.
- Protect MVP scope.
- Preserve useful future-oriented architecture without prematurely implementing future MVPs.
- Prioritize user value and repeat usage.
- AI-generated recommendations must not encourage users to fabricate qualifications or experience.
- User-approved edits must remain under the user's control.
- Final tailored resume content must remain grounded in the source resume and approved user edits.

---

# 2. Global Product Standards

Global standards remain unchanged unless explicitly approved elsewhere.

MVP 2 must reuse approved global UI/UX, theme, terminology, architecture, privacy, and trust principles.

In particular:

- Use **TailorCV AI** as the product name.
- Use **Resume Match** as the current match-score terminology.
- Do not present Resume Match as a guarantee of ATS success.
- Do not claim that AI processing is local when an external AI provider is used.
- AI must not fabricate employment, skills, certifications, qualifications, achievements, or experience.
- Resume content is sensitive and must be handled carefully.

---

# 3. MVP Registry

| MVP | Name | Objective | Status | Scope Summary |
|---|---|---|---|---|
| MVP 1 | Core Resume Tailoring / AI Analysis | Validate usefulness of AI resume-vs-job analysis | **Complete** | Resume upload/extraction, JD input, Gemini analysis, match insights, recommendations, local persistence |
| MVP 2 | Product Growth / Tailored Resume Workflow | Improve repeat usage by turning one-shot analysis into a reusable job-specific tailoring workflow | **Approved / Implementation in Progress** | Multiple resumes, history, structured editing, lightweight job applications, keyword coverage, complete tailored resume, PDF export |
| MVP 3 | Monetization / Premium Product | Introduce revenue-generating capabilities | **Proposed / Not Fully Approved** | Subscriptions, premium limits and premium functionality |

Runtime estimates remain estimates and are not commitments.

---

# 4. MVP 2 — Detailed Specification

## 4.1 Status

**APPROVED**

MVP 2 is now a formally approved MVP.

Implementation status is separate from product approval. Approved requirements may still be incomplete in the current implementation.

## 4.2 Objective

Turn TailorCV AI from a primarily one-shot resume analyzer into a recurring, job-specific resume tailoring tool.

The primary retention loop is:

**Select Resume → Add Job → Analyze → Review Match/Keywords → Edit Suggestions → Generate Tailored Resume → Export/Share → Save Application → Return for Next Job**

The MVP should make the result useful enough that users have a reason to return for another job application.

## 4.3 User Need

A job seeker may have multiple resumes and repeatedly apply to different jobs. They need to:

- Reuse existing resumes.
- Keep previous analyses.
- Compare a resume against a specific job.
- Understand important keyword gaps.
- Review and edit AI recommendations.
- Produce a complete tailored resume.
- Save the job-specific work for later.
- Export the final resume in a usable format.

## 4.4 Approved Scope

### A. Multiple Resumes

Users can:

- Add multiple resumes.
- Add a resume from PDF.
- Provide resume text where supported by the existing product flow.
- View their resume collection.
- Rename resumes.
- Delete resumes.
- Select/set an active resume.
- See useful resume metadata such as source and last-used information.
- Persist resume data locally.

### B. Resume Management

Resume management is collection-based rather than limited to a single active resume.

The application must preserve relationships between resumes and their associated analyses/applications.

Deleting or changing a resume must not silently corrupt unrelated persisted data.

### C. Analysis History

Users can:

- View previous analyses.
- See the associated resume.
- See job title/company where available.
- See analysis date.
- See Resume Match.
- Open a previous analysis.
- Delete an individual analysis.
- Persist history across app restarts.

History should be ordered consistently, with the most recently relevant items readily accessible.

### D. Lightweight Job Application

`JobApplication` is an MVP 2 entity.

It is intentionally lightweight and represents the context connecting:

- Resume
- Job description
- Company
- Job title
- Analysis
- Tailored resume/output

It is **not** a full job tracker.

MVP 2 does not include a full application pipeline such as:

- Applied
- Interview
- Offer
- Rejected
- Recruiter CRM
- Calendar/follow-up management

Those remain future scope unless assigned to a later MVP.

### E. Editable AI Suggestions

Users can edit AI-generated:

- Professional summary
- Skills
- Experience improvements
- ATS tips where supported by the implementation

The product must preserve the AI-generated/original version separately from the user's edited version.

Users can reset an edited suggestion to its AI original.

Edits must persist locally.

### F. Structured Professional Experience Editor

MVP 2 includes a structured Professional Experience editor, but not a full visual Resume Builder.

Users can manage professional-experience entries sufficiently to:

- Add an entry.
- Edit an entry.
- Remove an entry.
- Edit relevant role/company/date information.
- Edit experience bullets/content.
- Reuse the structured experience in tailored output.

A full drag-and-drop/design-heavy resume builder is out of scope.

### G. Resume Match

Resume Match remains the primary match terminology.

Requirements:

- Score range is 0–100.
- Score must be validated/clamped.
- Score must not be presented as a guarantee of ATS success.
- The explanation should help users understand what the score represents.

### H. Keyword Coverage

Keyword Coverage is an approved MVP 2 metric.

It must be presented transparently rather than as a guaranteed ATS-pass probability.

The metric should reflect the importance of job-description keywords, not merely raw keyword count.

Approved conceptual definition:

**Keyword Coverage = weighted importance of relevant job-description keywords represented in the resume ÷ total weighted importance of identified relevant job-description keywords × 100**

The weighting must distinguish keyword importance, for example:

- Required / high importance → highest weight
- Important / medium importance → medium weight
- Nice-to-have / lower importance → lower weight

The exact implementation weights must be consistent and explainable.

If a keyword is not supported by the source resume, TailorCV must not instruct the user to fabricate the qualification merely to increase coverage.

### I. Complete Tailored Resume

MVP 2 includes both:

1. Editable AI suggestions.
2. A complete final tailored resume.

`FinalResumeOutput` represents the complete tailored resume generated from:

- The original/source resume.
- The target job description.
- AI analysis.
- User-approved edits.

The final output must remain grounded in factual information from the source resume and user-approved changes.

The system must not invent:

- Employers
- Job titles
- Dates
- Skills
- Certifications
- Qualifications
- Achievements
- Experience
- Metrics

The final resume should be coherent as a complete document rather than requiring the user to manually assemble separate AI suggestions.

### J. ATS-Friendly PDF Export

PDF export is an approved MVP 2 requirement.

The initial export target is:

- Professional.
- Clean.
- ATS-friendly.
- Readable.
- Consistent with the approved TailorCV visual direction.

MVP 2 does not require a large template marketplace or a complex visual resume designer.

At least one reliable ATS-friendly PDF output format is required.

The exported PDF should contain the final tailored resume, not merely the analysis suggestions.

### K. Copy and Share

Users can:

- Copy individual useful sections.
- Copy the complete relevant result.
- Share supported content using the system share mechanism.

Share/copy actions must use the intended content scope and must not accidentally expose unrelated stored data.

### L. Analytics

MVP 2 supports product event tracking for relevant actions, including the implemented events:

- `app_opened`
- `resume_added`
- `analysis_started`
- `analysis_completed`
- `analysis_failed`
- `analysis_viewed`
- `history_opened`
- `resume_deleted`
- `analysis_deleted`
- `suggestion_edited`
- `result_copied`
- `result_shared`

Analytics implementation must not capture sensitive resume/JD content unnecessarily.

### M. Crash Reporting

MVP 2 may use Sentry for crash reporting.

Crash reporting must be configured so that sensitive resume, job-description, AI-response, and user-edited content is not unnecessarily captured.

---

# 5. MVP 2 User Flow

## Primary flow

```text
Open App
   ↓
Select existing resume OR add resume
   ↓
Create/select Job Application
   ↓
Enter company / job title / job description
   ↓
Analyze
   ↓
Resume Match + Keyword Coverage
   ↓
Review:
   - Matching / important keywords
   - Missing / weak keywords
   - Suggested summary
   - Suggested skills
   - Experience improvements
   - ATS tips
   ↓
Edit / approve suggestions
   ↓
Generate complete tailored resume
   ↓
Review final resume
   ↓
Export PDF / Copy / Share
   ↓
Save application + analysis + tailored output
   ↓
Return later through History / Resumes
```

## Repeat-use flow

```text
Open App
   ↓
History / Resumes
   ↓
Select previous resume or application
   ↓
Create a new job-specific analysis
   ↓
Repeat tailoring workflow
```

---

# 6. MVP 2 Screens

Approved MVP 2 screen/flow surfaces include:

- Home
- Resumes
- Resume Detail
- History
- Job Application Detail
- Edit Suggestions
- Tailored Resume / Final Output review
- PDF Export action/flow
- Settings

The exact visual arrangement must follow approved global UX standards and should minimize unnecessary navigation.

The primary product action should remain the job-specific tailoring workflow rather than turning Home into a feature dashboard.

---

# 7. MVP 2 Functional Requirements

## FR-01 — Resume Collection

The system shall support multiple persisted resumes and an active/current resume.

## FR-02 — Resume CRUD

The user shall be able to add, rename, update relevant resume data, select, and delete resumes.

## FR-03 — Analysis Persistence

Analyses shall be persisted and associated with the relevant resume/job context.

## FR-04 — History

The user shall be able to review and delete historical analyses.

## FR-05 — Job Application Context

The system shall persist a lightweight JobApplication linking the relevant resume, JD, analysis, and tailored output.

## FR-06 — Suggestion Editing

The user shall be able to edit supported AI suggestions, preserve the AI original, reset edits, and persist the edited state.

## FR-07 — Professional Experience

The system shall support structured professional-experience editing without becoming a full visual resume builder.

## FR-08 — Resume Match

The system shall display a validated 0–100 Resume Match score without claiming guaranteed ATS success.

## FR-09 — Keyword Coverage

The system shall display a transparent, importance-weighted Keyword Coverage metric.

## FR-10 — Final Resume

The system shall generate a complete tailored resume using the original resume, target JD, AI analysis, and user-approved edits.

## FR-11 — Grounded AI Output

Tailored output shall not fabricate unsupported user qualifications or experience.

## FR-12 — PDF Export

The system shall export the complete final tailored resume as an ATS-friendly PDF.

## FR-13 — Copy/Share

The system shall support intended copy/share actions for relevant output.

## FR-14 — Persistence

Relevant MVP 2 state shall survive application restart.

## FR-15 — Migration

Existing MVP 1 single-resume/single-analysis data shall be migrated into the MVP 2 collection model without unintended duplication or loss.

## FR-16 — Error Handling

AI, persistence, export, and navigation failures shall provide understandable user feedback and retry/recovery where appropriate.

---

# 8. MVP 2 UX/UI Requirements

- Maintain the approved professional, clean, modern, trustworthy, premium-feeling direction.
- Minimize friction.
- Prioritize the user's next useful action.
- Keep the primary workflow understandable.
- Do not overload Home with every available feature.
- Clearly distinguish AI-generated suggestions from user-edited content.
- Clearly distinguish analysis from final tailored resume output.
- Make export/share actions obvious after final output is ready.
- Avoid misleading ATS or AI capability claims.
- Preserve clear empty states for no resumes, no history, and no applications.
- Use confirmation for destructive actions where appropriate.
- Handle long history lists efficiently.

---

# 9. MVP 2 Technical Requirements

## Architecture

Reuse the MVP 1 architecture where practical:

```text
UI
 ↓
State / Store
 ↓
Service Layer
 ↓
External API / Local Services
```

Do not tightly couple AI logic to screens.

## State

The collection-based state model is approved for MVP 2:

- `resumes[]`
- `jobApplications[]`
- `analysisResults[]`
- current resume/application/analysis identifiers

## Persistence

MMKV + Zustand remains the local persistence approach for MVP 2 unless a later approved decision replaces it.

## Migration

MVP 1 persisted state must be migrated safely into the MVP 2 collection model.

Migration must be idempotent.

## AI

Final tailored output must be grounded in source resume facts and user-approved edits.

AI prompts and parsers must preserve structured output reliability.

## PDF

PDF generation should be implemented as a reusable service boundary so later template/output improvements do not require rewriting the core tailoring workflow.

## Dependencies

MVP 2 builds on:

- MVP 1 resume extraction
- Gemini analysis
- Zustand
- MMKV
- React Navigation
- Existing design system/components
- Native/platform capabilities required for PDF export and system sharing

---

# 10. MVP 2 Constraints

- Do not build a full visual resume builder.
- Do not build a full Job Tracker.
- Do not add cover letters, LinkedIn optimization, interview preparation, or other future career tools unless separately assigned to another MVP.
- Do not introduce unnecessary backend infrastructure solely for MVP 2 convenience.
- Do not compromise factual accuracy for higher keyword coverage.
- Do not present Keyword Coverage or Resume Match as guaranteed ATS outcomes.
- Do not expose sensitive resume/JD data through analytics or crash reporting unnecessarily.
- Preserve extensibility for future MVPs.

---

# 11. MVP 2 Out of Scope

The following are explicitly out of scope for MVP 2:

- Full visual/drag-and-drop Resume Builder
- Resume template marketplace
- Full Job Application Tracker/pipeline
- Cover letter generation
- LinkedIn optimization
- Interview preparation
- Authentication
- Subscription/paywall implementation
- RevenueCat integration
- Premium pricing/limits
- Full cloud account/sync system
- Broad career coaching platform

These may be assigned to future MVPs.

---

# 12. MVP 2 Dependencies & Cross-MVP Impact

## MVP 1 → MVP 2

MVP 2 reuses:

- Existing resume state/foundation
- Existing analysis result model/foundation
- Local persistence
- AI service abstraction
- Existing navigation/theme/components

MVP 1 Professional Experience deferral is now consumed by the approved structured MVP 2 Professional Experience capability.

## MVP 2 → MVP 3

MVP 2 creates the functional foundation for monetization through:

- Multiple resumes
- Analysis history
- Job-specific applications
- Editable tailoring
- Complete tailored output
- PDF export

MVP 3 remains separately scoped and is not automatically expanded by these capabilities.

## Production Security

The existing direct mobile Gemini architecture remains a known production-security concern because a mobile-distributed API credential can potentially be extracted.

This concern must be addressed before or as part of public paid production architecture planning.

The MVP 2 requirement does not silently convert the MVP 1 no-backend decision into a permanent production architecture.

---

# 13. MVP 2 Acceptance Criteria

MVP 2 product approval is recorded, but implementation acceptance remains dependent on verification.

### Core functionality

- [ ] User can maintain multiple resumes.
- [ ] User can add a resume from supported input.
- [ ] User can rename, select, and delete resumes.
- [ ] Resume relationships remain valid after CRUD operations.
- [ ] User can view analysis history.
- [ ] User can open and delete individual historical analyses.
- [ ] User can create/view a lightweight JobApplication.
- [ ] JobApplication correctly links resume + JD + analysis + tailored output.
- [ ] User can edit AI suggestions.
- [ ] AI originals are preserved.
- [ ] User can reset edits to AI originals.
- [ ] Edits persist across restart.
- [ ] User can add/edit/remove structured Professional Experience entries.
- [ ] Resume Match is displayed on a validated 0–100 scale.
- [ ] Keyword Coverage is displayed using transparent importance weighting.
- [ ] Keyword Coverage does not encourage unsupported qualifications.
- [ ] FinalResumeOutput produces a complete tailored resume.
- [ ] Final output is grounded in the source resume and user-approved edits.
- [ ] Final output does not invent qualifications, experience, employers, dates, certifications, skills, achievements, or metrics.
- [ ] User can review the final tailored resume.
- [ ] User can export the final tailored resume as an ATS-friendly PDF.
- [ ] PDF output is readable and structurally suitable for ATS processing.
- [ ] User can copy relevant output.
- [ ] User can share relevant output.
- [ ] Sensitive content is not unnecessarily included in analytics/crash payloads.

### Persistence and migration

- [ ] MVP 1 legacy snapshot migration works.
- [ ] Migration is idempotent.
- [ ] Existing user data is not unintentionally duplicated.
- [ ] Relevant data survives app restart.
- [ ] Current IDs remain valid after CRUD operations.
- [ ] Deleting one entity does not corrupt unrelated entities.

### Quality gates

- [ ] Automated tests pass.
- [ ] Lint passes.
- [ ] TypeScript passes.
- [ ] Android debug build passes.
- [ ] Android emulator/device validates the main MVP 2 flow.
- [ ] PDF export is validated on a real supported Android environment.
- [ ] System share is validated.
- [ ] 50+ history items perform acceptably.
- [ ] Navigation transitions and important loading states are validated.
- [ ] Error/retry states are validated.
- [ ] Privacy wording is reviewed.
- [ ] Sentry/analytics payloads are reviewed for sensitive-data leakage.

### Release gate

MVP 2 may be marked **Complete** only after the required implementation and runtime acceptance criteria are verified.

---

# 14. MVP 2 Complexity

**Moderate to High**

The approved scope is broader than the historical MVP 2 proposal because it now includes:

- Collection-based resume management
- History
- Lightweight job applications
- Structured editing
- Complete tailored resume generation
- Keyword coverage
- ATS-friendly PDF export
- Migration
- Native/runtime validation

Complexity and runtime should be re-estimated after implementation of PDF export and final-output validation.

---

# 15. MVP 2 Estimated Runtime

Historical estimate:

**Approximately 1–2 weeks**

This estimate is no longer treated as a commitment because the approved scope has expanded.

**Current estimate: Reassessment required.**

---

# 16. MVP 2 Current Status

**Approved / Implementation in Progress**

The product requirements are approved.

The currently reported implementation already covers a substantial portion of the approved scope, including:

- Multiple resumes
- History
- Lightweight JobApplication
- Editing
- Structured state/persistence
- Analytics
- Crash reporting
- Copy/share
- Resume Match
- Keyword Coverage

However, the following remain implementation/verification items based on the current reported state:

- Complete final tailored resume behavior must be verified against this specification.
- ATS-friendly PDF export must be implemented/verified.
- Android build/runtime must be verified after native dependency changes.
- Large-history performance must be verified.
- Privacy/legal review remains required.
- Runtime end-to-end acceptance must be completed before MVP 2 is declared **Complete**.

---

# 17. MVP 3 — Detailed Specification

**Status: Proposed / Not Fully Approved**

MVP 3 remains separately scoped.

Previously discussed monetization ideas remain proposals unless explicitly approved.

MVP 2 approval does **not** approve:

- subscription pricing
- free/premium limits
- RevenueCat
- paywalls
- premium feature access

Those remain MVP 3 decisions.

---

# 18. Future MVPs

Future MVPs may include:

- Full Job Application Tracking
- Full Resume Builder / advanced design
- Cover Letters
- LinkedIn optimization
- Interview preparation
- Advanced AI career assistance
- Other career-platform capabilities

These remain future proposals until explicitly assigned and approved.

---

# 19. Approved Product Decisions

| Decision | Scope | Affected MVP | Status |
|---|---|---|---|
| Use TailorCV AI as the product name | Global | All | Approved / Current |
| Develop through independent MVPs | Global | All | Approved |
| MVP count is not limited to 3 | Global | All/Future | Approved |
| MVP-specific requirements remain scoped to their MVP | Global | All | Approved |
| MPS is the source of truth | Global | All | Approved |
| MVP 1 focuses on resume-vs-job AI analysis | MVP 1 | MVP 1 | Approved |
| MVP 1 requires no backend | MVP 1 | MVP 1 | Approved |
| MVP 1 does not require authentication/Firebase/payments | MVP 1 | MVP 1 | Approved |
| Professional Experience is deferred from MVP 1 into MVP 2 capability | MVP 1 → MVP 2 | MVP 2 | Approved |
| MVP 2 supports multiple resumes | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 supports analysis history | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 uses a lightweight JobApplication context | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 supports structured Professional Experience editing, not a full Resume Builder | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 supports editable AI suggestions with originals preserved | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 supports Resume Match and transparent weighted Keyword Coverage | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 generates a complete tailored resume from source resume + JD + user-approved edits | MVP 2 | MVP 2 | **Approved / Current** |
| MVP 2 includes ATS-friendly PDF export | MVP 2 | MVP 2 | **Approved** |
| MVP 2 is intended to strengthen repeat usage through a job-specific tailoring loop | MVP 2 | MVP 2 | **Approved** |

---

# 20. Change History

| Date | Previous Value | New Value | Scope | Reason | Status |
|---|---|---|---|---|---|
| 2026-08-27 | MVP 2 Proposed / Not Fully Approved | MVP 2 Approved / Implementation in Progress | MVP 2 | Formal approval of MVP 2 scope | Approved |
| 2026-08-28 | MVP 2 scope included proposed history/resume management/editor concepts | Multiple resumes + history + lightweight JobApplication + structured experience editing + editable suggestions | MVP 2 | Establish approved recurring tailoring workflow | Approved |
| 2026-08-28 | PDF export unresolved between MVP 2/MVP 3 | ATS-friendly PDF export assigned to MVP 2 | MVP 2 | Provide a usable final paid-product output | Approved |
| 2026-08-28 | Final tailored output not formally defined | Complete FinalResumeOutput grounded in source resume + user-approved edits | MVP 2 | Make the product outcome application-ready | Approved |
| 2026-08-28 | Keyword Coverage not formally defined | Transparent importance-weighted Keyword Coverage | MVP 2 | Make keyword feedback more useful and explainable | Approved |
| 2026-08-28 | Professional Experience editor scope unresolved | Structured experience editor; full visual Resume Builder remains out of scope | MVP 2 | Support meaningful editing without scope expansion | Approved |
| 2026-08-28 | JobApplication scope unresolved | Lightweight Resume + JD + Analysis + Tailored Output context | MVP 2 | Support repeat application workflow without building full Job Tracker | Approved |

---

# 21. Remaining MPS Open Questions

The following remain open and are **not** resolved by MVP 2 approval:

1. Official target countries/markets.
2. Detailed target-user segmentation.
3. Permanent global color-system approval.
4. Official typography/font standard.
5. Localization strategy.
6. Formal privacy policy/consent requirements.
7. Production Gemini/API-key architecture and whether a backend/proxy is mandatory before public paid release.
8. iOS release-validation requirement.
9. MVP 3 monetization model, pricing, limits, RevenueCat, and premium feature set.
