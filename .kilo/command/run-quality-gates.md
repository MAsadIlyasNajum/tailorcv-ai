# Run Quality Gates

Runs the full verification suite used by MVP 1/2/3 plans. Run from the project root.

```bash
npx tsc --noEmit && npm run lint && npm test -- --runInBand --watch=false
```

## What this checks
- `npx tsc --noEmit` — TypeScript strict type-check.
- `npm run lint` — ESLint (`@react-native` config).
- `npm test` — Jest unit tests (mocked native modules + mocked `geminiService`;
  never hits the real API).

## Notes for this repo
- Package manager is pnpm; `npm <script>` works because pnpm proxies scripts, but
  `pnpm <script>` is equivalent.
- `react-native-mmkv`, `@react-native-documents/picker`, `react-native-paper`,
  `react-native-safe-area-context`, `react-native-gesture-handler`,
  `react-native-screens`, `react-native-reanimated`, `react-native-worklets`, and
  `@react-navigation/*` are mocked per-test (not globally) — see individual `__tests__`
  files. If you add a screen test, mock these the same way `App.test.tsx` does.
- Jest config (`jest.config.js`) sets `transformIgnorePatterns` to transpile the
  listed native deps; if you add a dependency that ships ESM JS, add it there.
