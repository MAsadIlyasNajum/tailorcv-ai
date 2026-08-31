# React Native Optimization Plan — TailorCV AI

> Status: PLAN ONLY (analysis + implementation plan). No source/config changes made yet.
> Generated from deep inspection of the repository. Measurements marked **(estimate)** are not yet measured; they require an Android release build during implementation.

---

## 0. Premise correction (important)
The task states "only 3 screens." The actual app has **14 screen files** and a 4-tab bottom navigation plus ~9 stack screens (`src/app/navigation/AppNavigator.tsx`). The optimization strategy still applies, but the "small 3-screen app" framing understates surface area. Paper usage is spread across many screens.

---

## 1. Environment (verified)
- React Native **0.84.1**, React **19.2.3** (New Architecture **enabled**).
- **Hermes enabled** (`hermesEnabled=true`), JSC fallback available.
- `gradle.properties`: `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64` → **4 ABIs built**, including emulator-only `x86`/`x86_64`.
- `android/app/build.gradle`: `enableProguardInReleaseBuilds=false`.
- Entry: `index.js` imports `react-native-gesture-handler` and `react-native-reanimated` as side effects; `App.tsx` wraps app in `SafeAreaProvider > PaperProvider > NavigationContainer`.
- Only `index.android.js`/Metro entry is `index.js`; no extra bundling config.

---

## 2. react-native-paper — Inventory & Verdict

**Dependency nature:** `react-native-paper` is **JS-only** (no native `.so`). Runtime deps are tiny: `@callstack/react-theme-provider`, `color`, `use-latest-callback`. Therefore Paper contributes **only to JS bundle size**, not to native library size or native startup cost. `PaperProvider` is a lightweight context provider (no native init).

**Components actually used** (13 files import from `react-native-paper`):

| Component | Used in | Approx. instances | Primitive replacement |
|---|---|---|---|
| `Button` (+`mode` contained/outlined/text, `icon`, `loading`) | `PrimaryButton`, `AnalysisResultScreen`, `ResumesScreen`, `ResumeDetailScreen`, `FinalResumeOutputScreen`, `JobDescriptionScreen`, `HistoryScreen`, `EditSuggestionsScreen`, `ExperienceEditorScreen` | ~30 | `Pressable` |
| `Card` / `Card.Title` / `Card.Content` | 11 screens | ~40 | `View` |
| `TextInput` (`mode="outlined"`, `multiline`, `error`) | `ResumesScreen`, `UploadResumeScreen`, `JobDescriptionScreen`, `EditSuggestionsScreen`, `ExperienceEditorScreen` | ~12 | RN `TextInput` + label/error `Text` |
| `Chip` (`compact`) | `AnalysisResultScreen`, `FinalResumeOutputScreen` | ~4 | `View` |
| `Divider` | `HomeScreen`, `ResumeDetailScreen`, `JobApplicationDetailScreen`, `UploadResumeScreen`, `ResumesScreen` | ~7 | `View` w/ border |
| `Switch` | `ExperienceEditorScreen` | 1 | RN `Switch` |
| `ActivityIndicator` | `PrimaryButton` (loading state) | 1 | RN `ActivityIndicator` |

No Paper `IconButton`, `Dialog`, `Snackbar`, `Modal`, `Portal`, `Menu`, or icon fonts are used. Tab icons are plain Unicode glyphs (`AppNavigator.tsx`), not Paper. Theme is only `MD3LightTheme` colors extended (`src/app/theme/theme.ts`).

**Verdict:** Removing Paper is **reasonable and recommended (P1)** for long-term dependency/upgrade simplicity and a **modest JS-bundle reduction**. It is **NOT** the main APK driver — native modules are. Be honest: expected APK reduction from removing Paper alone is small (single-digit %).

---

## 3. Dependency Analysis (significant deps)

| Dependency | Native? | Used? | Notes / Verdict |
|---|---|---|---|
| `react-native-reanimated` | **Yes (.so)** | **No** (only `index.js` side-effect import) | **Removable. Heavy.** 3.1 GB node_modules (C++ src). Big .so + startup native init. |
| `react-native-worklets` | **Yes (.so)** | **No** | **Removable.** 1.6 GB node_modules. Companion to reanimated. |
| `@react-native-async-storage/async-storage` | **Yes (.so)** | **No** (storage uses MMKV) | **Removable.** 54M. Dead dependency. |
| `react-native-share` | **Yes (.so)** | **No** (code uses RN `Share`) | **Removable.** `pdfGenerator.ts` imports `Share` from `react-native`. |
| `@sentry/react-native` | **Yes (.so)** | Yes (`crashReporting.ts`, inits at startup) | **Keep or product-decide.** Large (2.0 GB node_modules) + startup cost. Feature shown in Settings. |
| `react-native-mmkv` | Yes (.so, small) | Yes (storage) | Keep. |
| `react-native-gesture-handler` | Yes | Indirect (react-navigation) | Keep (required by navigation). |
| `react-native-screens` | Yes | Yes (navigation) | Keep. |
| `react-native-safe-area-context` | Yes | Yes | Keep. |
| `@react-native-documents/picker` | Yes | Yes | Keep (core: resume upload). |
| `react-native-html-to-pdf` | Yes | Yes | Keep (core: PDF export). |
| `react-native-pdf-text-extractor` | Yes | Yes | Keep (core: text extraction). |
| `react-native-blob-util` | Yes | Yes | Keep (PDF file stat). |
| `react-native-paper` | **No (JS)** | Yes (subset) | Removable (P1). See §2. |
| `@react-navigation/*` | No (JS) | Yes | Keep. |
| `zustand` | No (JS) | Yes (store) | Keep (tiny). |
| `react-native-dotenv` | Build-time | Yes | Keep. |

**Summary:** 4 unused native modules can be removed outright with **zero functional loss**. These are the real, safe APK/startup wins.

---

## 4. APK / Startup Baseline (to measure at implementation)
No release build was produced during analysis (analysis phase must not modify config/build). Capture at implementation:
- Release **APK** size (all 4 ABIs) and **AAB** size.
- Per-ABI `.so` sizes under `android/app/build/**/jni/`.
- JS bundle / Hermes bytecode size (`android/app/src/main/assets/index.android.bundle`).
- `app:assembleRelease` time / startup TTID (e.g., Android `adb shell am start` + logcat, or Sentry/trace).

**Estimate:** Native `.so` dominates APK. Removing the 4 unused native modules + dropping x86 ABIs should cut native size substantially (est. **15–30% APK**, highly dependent on ABI count). Paper removal alone: est. **<5% APK** (JS only).

---

## 5. Prioritized Optimization Opportunities

### P0 — High impact / low risk
1. **Remove `react-native-reanimated` + `react-native-worklets`.**
   - Reason: unused; heavy native `.so`; native startup init via `index.js` import.
   - APK impact: **high (est. large native reduction)**. Startup: **positive** (no native module init). Risk: low (no source uses them). Complexity: trivial (edit `index.js`, remove from `package.json`, reinstall). Recommendation: **Do it.**
2. **Remove `@react-native-async-storage/async-storage`.**
   - Reason: unused (MMKV used). APK: small/medium native. Risk: none. Recommendation: **Do it.**
3. **Remove `react-native-share`.**
   - Reason: unused (RN `Share` used instead). APK: small/medium native. Risk: none. Recommendation: **Do it.**
4. **Drop emulator ABIs from release build.**
   - Reason: `x86`/`x86_64` only run on emulators; shipping them in a distributed APK doubles native payload. Add `ndk { abiFilters "arm64-v8a", "armeabi-v7a" }` to the `release` buildType (or build/publish as **AAB**, which splits per-ABI automatically).
   - APK impact: **high** for raw APK. Startup: neutral. Risk: low (devices are arm). Complexity: trivial. Recommendation: **Do it (prefer AAB).**

### P1 — Meaningful improvement
5. **Remove `react-native-paper` + add small `App*` component layer.** See §6–§7. APK: small/modest (JS only). Startup: negligible. Risk: medium (must preserve UI/behavior across 13 files). Complexity: medium. Recommendation: **Do it.**
6. **Evaluate `@sentry/react-native`.** Optional removal yields large native reduction + removes startup `Sentry.init`. But it is a stated product feature (Settings → Crash reporting) and currently the only crash/error telemetry. **Recommend keeping unless product accepts losing crash reporting.** If removed: also delete `crashReporting.ts`, `initCrashReporting()` call, Sentry sanitization. Mark as **product decision (P2)**.

### P2 — Optional
7. **Enable R8/ProGuard minify** (`enableProguardInReleaseBuilds=true`). Shrinks Java/Kotlin + may shrink a bit. Risk: needs full regression test (obfuscation can break reflection/codegen). Recommendation: optional, test thoroughly.

### DON'T DO
- Do not remove `gesture-handler`, `screens`, `safe-area-context`, `mmkv`, `documents/picker`, `html-to-pdf`, `pdf-text-extractor`, `blob-util` — all functional/core.
- Do not build a generic design system; only the ~7 components actually needed.
- Do not replace navigation or state (zustand) libraries.

---

## 6. Paper Replacement Strategy (app-specific, minimal)
Create `src/components/common/` primitives using RN built-ins only:

- `AppButton.tsx` — `Pressable` + `ActivityIndicator` (loading) + optional `icon` (Text glyph) + `mode: 'contained' | 'outlined' | 'text'`. Replaces Paper `Button` and `PrimaryButton`.
- `AppTextInput.tsx` — RN `TextInput` wrapped with a label `Text` and error `Text` (replicates `mode="outlined"` look + `error`). Supports `multiline`, `numberOfLines`, `value`, `onChangeText`.
- `AppCard.tsx` — `View` with `title`/`subtitle` header (using `Text`) and `children` (`Card.Content`). Replaces `Card` + `Card.Title` + `Card.Content`.
- `AppChip.tsx` — `View` pill (replaces `Chip compact`).
- `AppDivider.tsx` — `View` with 1px border (replaces `Divider`).
- `AppSwitch.tsx` — RN `Switch` (thin wrapper for consistent styling) — optional (RN `Switch` can be used directly).
- Remove `PaperProvider` from `App.tsx`; delete `src/app/theme/theme.ts` Paper dependency (theme colors move into a plain constants object used by components/nav).

Keep components: small, typed, reusable, accessible (`accessibilityRole`, `accessibilityLabel`), application-specific.

---

## 7. Implementation Plan (after approval)

**Step 1 — What changes**
- `index.js`: remove `react-native-reanimated` import.
- `package.json`: remove `react-native-reanimated`, `react-native-worklets`, `@react-native-async-storage/async-storage`, `react-native-share`, `react-native-paper`.
- `android/app/build.gradle`: add release `abiFilters` (arm64-v8a, armeabi-v7a) OR switch distribution to AAB.
- `App.tsx`: remove `PaperProvider`; use plain theme constants; keep nav theme.
- `src/app/theme/theme.ts`: drop Paper `MD3LightTheme`; export plain color constants.
- Add `src/components/common/App{Button,TextInput,Card,Chip,Divider,Switch}.tsx`.
- Replace all Paper usages across 13 files with `App*` components (preserve `mode`, `loading`, `disabled`, `error`, `multiline`, icons-as-glyphs, keyboard/focus behavior).
- Remove `PrimaryButton.tsx` (fold into `AppButton`) or refactor it to use `AppButton`.

**Step 2 — What does NOT change**
- Navigation architecture, screens, business logic, AI/PDF/storage services, analytics (local), MMKV, gesture-handler, screens, safe-area-context, all functional native modules, UI visuals/colors.

**Step 3 — Component replacements** (see §6).

**Step 4 — Files to modify**
- `index.js`, `App.tsx`, `src/app/theme/theme.ts`
- `src/components/common/PrimaryButton.tsx` (rewrite)
- 12 screens: `HomeScreen`, `SettingsScreen`, `FinalResumeOutputScreen`, `JobApplicationDetailScreen`, `AnalysisResultScreen`, `HistoryScreen`, `ResumesScreen`, `ResumeDetailScreen`, `JobDescriptionScreen`, `EditSuggestionsScreen`, `ExperienceEditorScreen`, `UploadResumeScreen`

**Step 5 — New files**
- `src/components/common/AppButton.tsx`, `AppTextInput.tsx`, `AppCard.tsx`, `AppChip.tsx`, `AppDivider.tsx`, `AppSwitch.tsx`

**Step 6 — Dependencies to remove**
- `react-native-reanimated`, `react-native-worklets`, `@react-native-async-storage/async-storage`, `react-native-share`, `react-native-paper` (P1). Update lockfile (pnpm-lock.yaml is primary; package-lock.json also present — reconcile which package manager is authoritative; repo has `pnpm-workspace.yaml` + `pnpm-lock.yaml`).

**Step 7 — Risks**
- ABI change could break emulator testing → keep `x86_64` for debug or test on ARM emulator/device.
- Paper `TextInput` label/error styling must be faithfully replicated (focus ring, error color `#...`).
- `AppButton` `icon` prop type from Paper `ButtonProps['icon']` must be replaced (use string glyph or `React.ReactNode`).
- ProGuard (if enabled) may break codegen — full test pass required.

**Step 8 — Testing strategy**
- `npm test` / `jest` (existing `__tests__`).
- `tsc --noEmit` typecheck; `eslint .`.
- Manual: all 3 primary flows + every screen, forms, keyboard, dialogs/modals, loading/error/disabled states, accessibility (TalkBack), no visual regression vs current UI.

**Step 9 — Measurement strategy**
- `cd android && ./gradlew assembleRelease` (and `bundleRelease` for AAB).
- Record APK/AAB size, per-ABI `.so` sizes, `index.android.bundle` size before/after.
- Startup: `adb shell am start -n com.tailorcvai/.MainActivity` + logcat TTID, or measure via Sentry/perf trace.

**Step 10 — Expected outcome**
- Smaller APK/AAB, fewer dependencies, faster/cleaner startup (no unused native inits), preserved UI/functionality.

---

## 8. Summary

- **Current APK:** Not measured (est. dominated by native .so across 4 ABIs). **(estimate)**
- **Expected APK:** ~15–30% smaller after P0 (4 unused native modules + ABI trim); Paper removal adds est. <5% more. **(estimate)**
- **Current startup:** Not measured. **(estimate)**
- **Expected startup:** Improved (removes reanimated/worklets/async-storage/share native init + Sentry optional). **(estimate)**

**React Native Paper removal:** Recommended (P1) — for maintenance/simplicity and modest JS reduction, but it is **not** the main APK lever.

**Other high-impact optimizations:**
1. Remove unused native modules: `react-native-reanimated`, `react-native-worklets`, `@react-native-async-storage/async-storage`, `react-native-share`.
2. Drop emulator ABIs (x86/x86_64) from release / publish as AAB.
3. (Optional) Enable R8 minify; (Optional/product) reconsider Sentry.

**Remaining opportunities (intentionally not in P0):**
- Sentry removal (product decision).
- ProGuard/R8 enablement (needs thorough testing).
- AAB-only distribution.

**Package manager note:** Repo contains both `pnpm-lock.yaml` (primary, with `pnpm-workspace.yaml`) and `package-lock.json`. Confirm `pnpm` is authoritative before editing lockfile.
