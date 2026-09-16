# Phase 6 — Resume Templates, Professional Preview & PDF Export

## 1. Audit Summary

**Reuse:**
- `ResumePreviewScreen` (`src/screens/ResumePreviewScreen.tsx`) — basic card preview; its exported `renderSection()` is used only internally and will be replaced.
- `react-native-html-to-pdf` (`src/services/pdf/pdfGenerator.ts`, `src/services/pdf/pdfTemplates.ts`) — existing PDF generation + share pipeline.
- Zustand store (`src/store/useResumeStore.ts`) — `updateResume(id, partial)` persists full `Resume` objects via MMKV.
- `Resume` type (`src/types/resume.ts`) — has `content?: ResumeContent`; no `templateId` yet.
- Navigation — `ResumePreviewScreen` registered as `ROUTES.RESUME_PREVIEW` with `{resumeId}`. Reached from `ResumeEditorScreen`.

**Gaps:**
- No template selection.
- No `ResumeContent` → PDF path.
- No professional preview / pagination.
- No `templateId` on `Resume`.

## 2. Architecture

### 2.1 Template ID Storage
Add `templateId?: string` to `Resume` in `src/types/resume.ts`.
- **Not** in `ResumeContent`. Presentation state stays separate from content.
- Default is `'classic'` (implicit when undefined).
- Persisted automatically because `updateResume` writes the full `Resume` object and `saveResumes()` serializes it.

**No new store action needed.** Existing `updateResume(resumeId, {templateId})` is sufficient.

### 2.2 Template Abstraction
```typescript
// src/templates/templateRegistry.ts
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  render: (content: ResumeContent, resume: Resume) => string;
}
export const TEMPLATES: Record<string, ResumeTemplate> = { ... };
export const DEFAULT_TEMPLATE_ID = 'classic';
```
Templates are pure: `render()` returns an HTML string, never mutates inputs.

### 2.3 Preview: WebView
Use `react-native-webview` to render the template's HTML.
- **Why:** Requirement states "PDF must visually match the selected template preview as closely as practical." Rendering the same HTML in WebView (preview) and `react-native-html-to-pdf` (export) guarantees zero layout drift.
- **New dependency:** `react-native-webview` v13+ (autolinked; compatible with RN CLI 0.84.1 + New Architecture).
- **Mock required:** Add to `__tests__/App.test.tsx`.

### 2.4 PDF Export
New service `src/services/pdf/resumePdfExporter.ts`:
- Reads `resume.templateId ?? DEFAULT_TEMPLATE_ID`.
- Looks up template, calls `render()`.
- Passes HTML to existing `generatePdfFromHtml()`.
- File name based on `resume.name` (sanitized), fallback to `Resume.pdf`.
- Uses `sharePdf()` for platform share sheet.
- **Links:** HTML uses `<a href="...">` for web URLs. Clickability in the generated PDF is platform-dependent (iOS PDFKit preserves links; Android `PdfDocument` may not). Document this limitation in the PDF export error message or tooltip.
- **Photos:** HTML includes `<img src={photoUri}>` when present. WebView will display it. PDF rendering of local file URIs is **not guaranteed** across platforms — do not block export if the image fails to render. Document this limitation.

## 3. Templates

### 3.1 Classic (`classic`)
- Name centered, 20pt bold.
- Headline below, centered.
- Contact block centered.
- Section headers: 11pt bold, ALL CAPS, 1px bottom border `#E2E8F0`.
- Entry title 10.5pt bold, meta 9.5pt gray.
- Body 10pt, line-height 1.45, bullet indent 14pt.
- No columns, sidebars, icons, photos, progress bars.
- `@page { margin: 0.65in; size: letter; }` + `page-break-inside: avoid`.

### 3.2 Modern (`modern`)
- Name left-aligned, 20pt bold, 3px accent underline `#2563EB`.
- Headline 11pt muted, left-aligned.
- Contact as horizontal block with ` · ` separator.
- Section headers: 12pt bold, accent color, 4px left border accent.
- Entry title 11pt bold, meta 9.5pt slate.
- Body 10pt, line-height 1.45, 12pt entry margin.
- No sidebars, skill ratings, excessive decoration.
- Same `@page` margins + `page-break-inside: avoid`.

### 3.3 Europass-inspired (`europass`)
- Name 18pt bold, left-aligned.
- Personal info block with labeled fields (Email:, Phone:, etc.) in compact inline flow.
- Section headers: 11pt uppercase, 0.5px letter-spacing, 1px top border `#E2E8F0`.
- Entries compact: title + institution on one line, dates/location below.
- Skills as inline ` · ` separated text + group titles.
- Denser than Modern, not cramped.
- Same `@page` margins + `page-break-inside: avoid`.

## 4. Shared HTML Infrastructure

`src/templates/renderResumeToHtml.ts` — pure helpers:
- `escapeHtml(text: string | null | undefined): string` — coerces null/undefined to `''`.
- `renderContactLine(info: PersonalInfoData): string`
- `renderDateRange(start?: string, end?: string | null, isCurrent?: boolean): string`
- `renderBullets(items?: string[]): string`
- `renderSectionBlock(section: ResumeSection, styles: TemplateStyles): string`

Each template composes these helpers and supplies its own `<style>` block + header markup.

### 4.1 Empty-state HTML
When `content.sections` has no visible sections, templates render a friendly `<div class="empty">No visible sections</div>` message instead of a blank page.

### 4.2 Sorting contract
Templates receive `content.sections` **already sorted by `order`** (ascending). The preview screen and PDF exporter must sort before passing to `render()`.

## 5. Preview Screen Redesign

### 5.1 `src/screens/ResumePreviewScreen.tsx`
Replace card-based layout with:
- **Header:** `< Back` (navigation.goBack), title "Resume Preview", template selector row, "Export PDF" button.
- **Template selector:** 3 `AppButton` (`fullWidth={false}`) in a row. Selected = `mode="contained"`, unselected = `mode="outlined"`.
- **State:** `templateId` initialized from `resume.templateId ?? DEFAULT_TEMPLATE_ID`. On change: `updateResume(resumeId, {templateId: newId})`.
- **WebView:** `source={{html: htmlString}}`, `originWhitelist={['*']}`. Use `key={templateId}` to force remount on template change (cleaner than updating source prop). Use `renderLoading` with `ActivityIndicator` and `onLoadEnd` to hide the spinner.
- **Error boundary:** Compute HTML inside `useEffect` with `try/catch`. If `template.render()` throws, store the error in state and render a fallback view with `Alert.alert('Preview failed', error.message)` and a retry button. Do not crash the screen. `useMemo` is NOT used here because it cannot recover from thrown errors.
- **Empty state:** If no visible sections, show a friendly "No visible sections" message inside the WebView HTML.
- **Remove** the exported `renderSection()` helper — nothing external imports it.
- **No hidden-section toggle** — hidden sections are completely excluded from the preview per the requirement.

## 6. PDF Export Service

### 6.1 `src/services/pdf/resumePdfExporter.ts`
```typescript
export const exportResumeToPdf = async (resume: Resume, content: ResumeContent): Promise<PdfExportResult> => {
  const templateId = resume.templateId ?? DEFAULT_TEMPLATE_ID;
  const template = TEMPLATES[templateId];
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  const html = template.render(content, resume);
  const fileName = buildFileName(resume);
  return generatePdfFromHtml({fileName, htmlContent: html});
};
```

### 6.2 File Naming
```typescript
const buildFileName = (resume: Resume): string => {
  const name = resume.name?.trim();
  if (name) {
    const sanitized = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').slice(0, 40);
    return `${sanitized}_Resume`;
  }
  return 'Resume';
};
```

## 7. Data Integrity Guarantees

- Templates receive `ResumeContent` by value; they construct new strings/arrays. No mutation.
- Preview screen changes `resume.templateId` only via `updateResume`. `ResumeContent.sections` is untouched.
- Section ordering is taken from `content.sections` sorted by `order` once. Templates do not reorder.
- Hidden sections (`visible === false`) are filtered before template rendering.

## 8. Implementation Task Order

1. **Add `templateId?: string` to `Resume`** (`src/types/resume.ts`)
2. **Add `react-native-webview`** to `package.json` dependencies.
3. **Create shared HTML utilities** (`src/templates/renderResumeToHtml.ts`)
4. **Create template registry** (`src/templates/templateRegistry.ts`)
5. **Implement Classic** (`src/templates/classic.ts`)
6. **Implement Modern** (`src/templates/modern.ts`)
7. **Implement Europass** (`src/templates/europass.ts`)
8. **Create PDF exporter** (`src/services/pdf/resumePdfExporter.ts`)
9. **Rewrite `ResumePreviewScreen`** with WebView + selector (`src/screens/ResumePreviewScreen.tsx`)
10. **Add WebView mock** in `__tests__/App.test.tsx`.
11. **Run `pnpm install`** + **`npx pod-install`** (iOS) to install native dependency.

## 9. Test Plan

### 9.1 Unit Tests (small representative data)
- **Registry:** 3 templates present, `DEFAULT_TEMPLATE_ID === 'classic'`, `render()` returns `<!DOCTYPE html>`, input immutability.
- **HTML utilities:** `escapeHtml` (null/undefined/empty/special chars), `renderContactLine` (name, headline, emails, phones, addresses, links — omits empty), `renderDateRange` (handles null endDate + isCurrent).
- **Templates (per template):** Renders personal info, intro, experience (3 entries), projects (3), education (3), skills (groups + uncategorized), certifications (3), custom section. Hidden sections excluded. Section order preserved. Empty fields produce no labels.

### 9.2 Stress Tests (separate file, `__tests__/templates/stress.test.ts`)
- Build resume with 20 exp, 50 proj, 10 edu, 100 skills, 30 certs, 10 custom sections.
- Assert each template's `render()` completes and HTML contains all entries (count assertions or substring checks for first/last entry of each section).
- Assert no truncation markers or artificial limits.

### 9.3 PDF Exporter
- `generatePdfFromHtml` called with correct HTML for each template.
- File name sanitization.
- Error propagation when `generatePDF` throws.

### 9.4 Preview Screen
- Renders without crashing.
- Template selector shows 3 buttons.
- Switching template updates WebView source (via `key` prop).
- Loading state visible during initial render.

### 9.5 Data Integrity
- Deep equality of `ResumeContent` before/after template switch.
- Section order unchanged.
- Visibility flags unchanged.

### 9.6 Old Preview Test Migration
- Replace `__tests__/resume/preview.test.tsx` content with contact-line tests against the new `renderContactLine` utility.

## 10. Validation Commands

```bash
pnpm install
npx pod-install # iOS only; safe to run on macOS
npx tsc --noEmit
npm run lint
npm test -- --runInBand --watch=false
```

## 11. Deferred (Out of Scope)
- ATS scoring / keyword optimization (Phase 7).
- Template marketplace / user-created templates.
- Drag-and-drop design editor.
- Font / accent color / spacing customization panel.
- Zoom / page navigation controls in preview.
- Guaranteed photo embedding in PDF (local-only privacy model; embedding attempted but not guaranteed across platforms).
- Guaranteed clickable links in PDF (platform-dependent; document limitation).

## 12. Post-Implementation Memory Update
After code changes, append to `PROJECT_MEMORY.md`:
- Tech stack: add `react-native-webview`.
- Capabilities: add "Professional resume preview with 3 templates (Classic, Modern, Europass)" and "PDF export from structured resume content".
- Dependencies: add `react-native-webview` to the package list.
