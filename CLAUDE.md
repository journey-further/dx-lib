# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`jf-lib` is a shared browser utility library used across Journey Further DX projects. It is consumed as a git SSH dependency (`"jf-lib": "github:journey-further/dx-lib.git"`) and imported as an ESM module. Everything exported from `src/index.ts` is part of the public API.

## Commands

```bash
yarn build          # compile to dist/ (runs tsc + tsc-alias)
yarn test           # run all tests with jest
yarn test --coverage  # run tests with coverage report (aim for ≥90% statements/branches)
yarn lint           # eslint with auto-fix
yarn build:docs     # regenerate TypeDoc documentation
yarn index          # regenerate src/index.ts barrel exports (run after adding a new module)
```

To run a single test file:

```bash
yarn test __tests__/modules/myFunction.spec.ts
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

- **`useSPA`** — the primary framework for SPA-aware A/B tests. Replaces the deprecated `RBTest` class.
- **`customEvents`** — a tiny in-process event bus (`emit`/`on`) for decoupling modules without cross-imports.
- **`pushToDL`** — pushes events into `window.dataLayer` for analytics.
- **`useMutationObserver`** — named, singleton-style MutationObserver wrapper used internally by `useSPA` and `RBTest`.
- **`waitForElement` / `elementReady`** — poll/observe the DOM for elements before acting.

### Build

TypeScript is compiled with `tsc` (using `tsconfig.prod.json`) and path aliases are resolved by `tsc-alias`. The output lands in `dist/` with declaration files under `dist/declarations/`. Tests use `@swc/jest` for fast transpilation in a `jsdom` environment.

### Releases

Releases are automated via `semantic-release` using the ESLint conventional commit format. Commit messages drive version bumps — use conventional commit prefixes (`feat:`, `fix:`, etc.).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
