# Phase 7 — ATS Scoring, Keyword Optimization & Resume Enhancement

## 1. Audit Summary

**Reuse:**
- `AnalysisResult` type with `matchScore`, `matchingKeywords`, `missingKeywords` (`src/types/resume.ts`)
- `keywordCoverage.ts` weighted coverage calculation (`src/utils/validation/keywordCoverage.ts`)
- `promptBuilder.ts` with existing Gemini prompt (`src/services/ai/promptBuilder.ts`)
- Structured resume editor with full CRUD (`src/components/resumeEditor/`)
- `ResumeContent` model with sections (`src/types/resume.ts`)
- `useResumeStore` with `updateResumeContent` action

**Gaps:**
- No category-level ATS score breakdown (only overall score)
- No keyword integration suggestions (where to place keywords in resume)
- No "Apply to Resume" workflow connecting AI suggestions to structured editor
- No before/after ATS score comparison
- Missing keyword density analysis
- No gap analysis between current resume and JD requirements

## 2. Architecture

### 2.1 Enhanced ATS Scoring

```typescript
// src/services/ats/atsScorer.ts
export interface AtsScoreBreakdown {
  overall: number;
  keywords: number;        // Keyword match score (0-100)
  skills: number;          // Skills match score (0-100)
  experience: number;      // Experience relevance score (0-100)
  education: number;       // Education match score (0-100)
  formatting: number;      // Format/structure score (0-100)
}

export interface KeywordGap {
  term: string;
  importance: KeywordImportance;
  present: boolean;
  suggestedLocation?: string;  // e.g., "summary", "experience", "skills"
}

export interface OptimizationSuggestion {
  type: 'add_keyword' | 'rephrase' | 'add_detail' | 'reorder';
  section: SectionType;
  description: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}
```

### 2.2 Keyword Optimizer Service

```typescript
// src/services/ats/keywordOptimizer.ts
export const analyzeKeywordGaps = (
  content: ResumeContent,
  jobDescription: string,
  analysisResult: AnalysisResult,
): KeywordGap[] => { ... };

export const suggestKeywordPlacements = (
  gap: KeywordGap,
  content: ResumeContent,
): string[] => { ... };

export const calculateKeywordDensity = (
  content: ResumeContent,
  keywords: string[],
) => { ... };
```

### 2.3 Resume Enhancement Actions

Connect AI suggestions to the structured resume editor:
- `applySuggestionToResume(resumeId, suggestion)` - applies an optimization suggestion
- `previewSuggestion(resumeId, suggestion)` - shows before/after preview
- `dismissSuggestion(resumeId, suggestionId)` - dismisses a suggestion

## 3. Feature: Enhanced ATS Dashboard

### 3.1 Score Breakdown Visualization

Replace the single overall score with a category breakdown:

| Category | Score | Weight |
|----------|-------|--------|
| Keywords | 75/100 | 30% |
| Skills | 60/100 | 25% |
| Experience | 80/100 | 25% |
| Education | 90/100 | 10% |
| Formatting | 70/100 | 10% |

### 3.2 Keyword Gap Analysis

Show missing keywords with suggested locations:
- **Required keywords** missing from resume
- **Suggested placement** for each keyword (summary, experience bullets, skills section)
- **One-click apply** to add keyword suggestion

### 3.3 Optimization Suggestions Panel

Actionable suggestions sorted by impact:
1. **High Impact** - Adding required keywords
2. **Medium Impact** - Rephrasing for better ATS match
3. **Low Impact** - Minor formatting improvements

## 4. Feature: Apply Suggestions to Resume

### 4.1 Integration Points

```
AnalysisResultScreen → "Optimize Resume" → ResumeEditorScreen (with suggestions panel)
```

### 4.2 Suggestion Application Flow

1. User views analysis results
2. Clicks "Optimize Resume" button
3. Navigates to ResumeEditorScreen with suggestions panel
4. Each suggestion shows:
   - Description of change
   - Section affected
   - Impact level
   - Apply/Dismiss buttons
5. Applying a suggestion updates the resume content
6. ATS score recalculates after each change

### 4.3 Suggestion Types

| Type | Action | Example |
|------|--------|---------|
| `add_keyword` | Insert keyword into section | Add "React Native" to skills |
| `rephrase` | Replace text with ATS-friendly version | "Built app" → "Developed React Native application" |
| `add_detail` | Add missing detail | Add quantified achievement |
| `reorder` | Move section up for priority | Move key experience to top |

## 5. Feature: Before/After Score Comparison

### 5.1 Score History

Track score changes over time:
```typescript
interface ScoreSnapshot {
  timestamp: number;
  overall: number;
  breakdown: AtsScoreBreakdown;
  appliedSuggestions: string[];  // IDs of applied suggestions
}
```

### 5.2 Visual Comparison

Show score improvement:
```
Before: 65/100 → After: 78/100 (+13 points)
├── Keywords: 60 → 75 (+15)
├── Skills: 55 → 65 (+10)
└── Experience: 70 → 75 (+5)
```

## 6. UI Changes

### 6.1 EnhancedAnalysisResultScreen

Extend the existing AnalysisResultScreen with:
- Category score breakdown (radial or bar chart)
- Keyword gap list with suggested locations
- "Optimize Resume" CTA button
- Before/after score comparison (when history exists)

### 6.2 SuggestionsPanel (in ResumeEditorScreen)

New component showing:
- List of pending suggestions
- Filter by impact/type
- Apply/Dismiss actions
- Progress indicator (X of Y applied)

### 6.3 ScoreIndicator Component

Reusable component for displaying:
- Overall score with color coding
- Category breakdown
- Trend indicator (improving/declining)

## 7. Data Model Changes

### 7.1 Extend AnalysisResult

```typescript
// Add to AnalysisResult interface
export interface AnalysisResult {
  // ... existing fields
  scoreBreakdown?: AtsScoreBreakdown;
  keywordGaps?: KeywordGap[];
  optimizationSuggestions?: OptimizationSuggestion[];
}
```

### 7.2 Resume Content Tracking

```typescript
// Add to Resume interface
export interface Resume {
  // ... existing fields
  scoreHistory?: ScoreSnapshot[];
  appliedSuggestions?: string[];
}
```

## 8. Implementation Task Order

1. **Create ATS scorer** (`src/services/ats/atsScorer.ts`)
   - Calculate category-level scores
   - Implement weighted scoring algorithm
   - Add score breakdown generation

2. **Create keyword optimizer** (`src/services/ats/keywordOptimizer.ts`)
   - Analyze keyword gaps
   - Suggest keyword placements
   - Calculate keyword density

3. **Extend AnalysisResult type** (`src/types/resume.ts`)
   - Add `scoreBreakdown` field
   - Add `keywordGaps` field
   - Add `optimizationSuggestions` field

4. **Update analysis parser** (`src/services/ai/analysisParser.ts`)
   - Generate score breakdown from analysis
   - Create keyword gap list
   - Generate optimization suggestions

5. **Create ScoreIndicator component** (`src/components/ats/ScoreIndicator.tsx`)
   - Radial or bar chart display
   - Category breakdown
   - Color coding

6. **Create SuggestionsPanel component** (`src/components/resumeEditor/SuggestionsPanel.tsx`)
   - List of suggestions
   - Filter by impact/type
   - Apply/Dismiss actions

7. **Update AnalysisResultScreen** (`src/screens/AnalysisResultScreen.tsx`)
   - Add score breakdown visualization
   - Add keyword gap list
   - Add "Optimize Resume" CTA

8. **Update ResumeEditorScreen** (`src/screens/ResumeEditorScreen.tsx`)
   - Integrate SuggestionsPanel
   - Handle suggestion application
   - Show score improvement

9. **Add store actions** (`src/store/useResumeStore.ts`)
   - `applyOptimizationSuggestion`
   - `dismissOptimizationSuggestion`
   - `calculateAtsScore`

10. **Write tests** (`__tests__/ats/`)
    - ATS scorer unit tests
    - Keyword optimizer unit tests
    - Suggestions panel component tests
    - Integration tests

## 9. Test Plan

### 9.1 Unit Tests (ats.test.ts)
- ATS scorer calculates correct category scores
- Weighted scoring produces expected results
- Keyword gap analysis identifies missing terms
- Keyword placement suggestions are relevant
- Score breakdown sums to overall score

### 9.2 Component Tests (ScoreIndicator.test.tsx)
- Renders without crashing
- Displays correct score
- Shows category breakdown
- Applies color coding correctly

### 9.3 Integration Tests (optimization.test.ts)
- Applying suggestion updates resume content
- Score recalculates after suggestion applied
- Suggestion marked as applied after action
- Dismissed suggestions don't reappear

### 9.4 Data Integrity Tests
- AnalysisResult immutability after operations
- Score history correctly tracks changes
- Suggestion application doesn't corrupt resume content
- Section references remain valid after edits

## 10. Validation Commands

```bash
pnpm install  # if new dependencies added
npx tsc --noEmit
npm run lint
npm test -- --runInBand --watch=false
```

## 11. Deferred (Out of Scope)

- Real-time JD comparison during editing
- Industry-specific scoring models
- Resume versioning with full history
- A/B testing different resume versions
- Cover letter generation
- LinkedIn profile optimization

## 12. Post-Implementation Memory Update

After code changes, append to PROJECT_MEMORY.md:
- Tech stack: add ATS scoring services
- Capabilities: add "Enhanced ATS scoring with category breakdown", "Keyword gap analysis with placement suggestions", "One-click apply AI suggestions to resume"
- Dependencies: any new packages added
