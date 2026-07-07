# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`jf-lib` is a shared browser utility library used across Journey Further DX projects. It is consumed as a git SSH dependency (`"jf-lib": "github:journey-further/dx-lib.git"`) and imported as an ESM module. Everything exported from `src/index.ts` is part of the public API.

## Commands

```bash
npm run build          # compile to dist/ (runs tsc + tsc-alias)
npm test               # run all tests with vitest
npm test -- --coverage  # run tests with coverage report (aim for ≥90% statements/branches)
npm run lint           # eslint with auto-fix
npm run build:docs     # regenerate TypeDoc documentation
npm run index          # regenerate src/index.ts barrel exports (run after adding a new module)
```

To run a single test file:

```bash
npm test -- __tests__/modules/myFunction.spec.ts
```

## Architecture

### One function, one file

Each utility lives in its own file. The filename must exactly match the exported function/class name (camelCase). Tests mirror this in `__tests__/modules/<name>.spec.ts`.

### Module locations

- **`src/modules/`** — the main public utility functions. Exported via `src/modules/index.ts` and re-exported from `src/index.ts`.
- **`src/helpers/`** — internal helpers (type guards, logging, selector validation). Used by modules but not individually part of the public API.
- **`src/types/`** — shared TypeScript types.

### Adding a new module

1. Create `src/modules/<functionName>.ts` with a named export.
2. Add `export * from "./<functionName>";` to `src/modules/index.ts`.
3. Run `yarn index` to regenerate `src/index.ts`.
4. Create `__tests__/modules/<functionName>.spec.ts`.

### Key modules to know

- **`useSPA`** — the primary framework for SPA-aware A/B tests.
- **`customEvents`** — a tiny in-process event bus (`emit`/`on`) for decoupling modules without cross-imports.
- **`pushToDL`** — pushes events into `window.dataLayer` for analytics.
- **`useMutationObserver`** — named, singleton-style MutationObserver wrapper used internally by `useSPA`.
- **`waitForElement` / `elementReady`** — poll/observe the DOM for elements before acting.

### Build

TypeScript is compiled with `tsc` (using `tsconfig.prod.json`) and path aliases are resolved by `tsc-alias`. The output lands in `dist/` with declaration files under `dist/declarations/`. Tests run in a `jsdom` environment via vitest with `@vitest/coverage-v8` for coverage reports.

### Releases

Releases are automated via the `cycjimmy/semantic-release-action` GitHub Action (`.github/workflows/release.yml`) using the Angular conventional commit format. Commit messages drive version bumps — use conventional commit prefixes (`feat:`, `fix:`, etc.). Runs automatically on push to `main` or `staging`.
