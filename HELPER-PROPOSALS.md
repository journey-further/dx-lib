# Helper-surface mining: jf-conversion builds → dx-lib proposals

**Date:** 2026-07-03
**Scope:** DOM utilities, formatting, viewport/scope checks, and other per-build repeated patterns with **no QA-observability angle**. QA-relevant helpers (hydration wait, tracking facade, tracked listeners/teardown, registration core) are explicitly excluded — they belong to the QA-hooks workstream. `waitForNuxtStable` and `ddEvent`/`ddError` recur heavily in recent builds but are out of scope here for that reason.
**Status:** proposal for review. No dx-lib code was written.

## Coverage

- Estate: 152 builds with ID ≥ 012900 across the 7 active clients (Toolstation, GHD, ITC, FundingCircle, Bayfields, Ancile, Parkdean).
- Mined: the **45 newest builds (ID ≥ 013150)** — including builds newer than the confirmed-recent set: TOS_013282, GHD_013313–315, PRK_013262, BAY_013271, ANC_013211 — plus **7 older probes** (~012929–013036, one per client) used only to confirm durability, never to source patterns. 52/52 extractions returned.
- Rules: all five active-client rule files under `.cursor/rules/clients/` were read for mandated patterns.
- Verification: every candidate below was re-checked by a fresh-context agent that opened the cited files. Build lists show **verified** citations only; where a clustering claim failed verification, that is stated.

The headline is that the estate is clean: 45 recent builds yielded only 84 hand-rolled utility functions in scope, and most builds lean entirely on jf-lib. The helper surface is mostly adequate — hence a short list.

---

## Proposals

### 1. `storage` (namespace: `storage.local` / `storage.session`, each with `get`/`set`/`del`)

- **Pattern:** read/write sessionStorage or localStorage with `JSON.parse`/`stringify` wrapped in try/catch and a fallback value. Used for session-seen flags, dismissed banners, previously-viewed product lists.
- **Proposed API** (single `storage.ts`, one internal factory, two instances):
  ```ts
  const makeStore = (backing: () => Storage) => ({
    get: <T>(key: string, fallback: T): T => { ... },   // try/catch JSON.parse
    set: <T>(key: string, value: T): void => { ... },
    del: (key: string): void => { ... },
  });

  export const storage = {
    local: makeStore(() => window.localStorage),
    session: makeStore(() => window.sessionStorage),
  };
  // usage: storage.session.get("key", {}); storage.local.set("key", value);
  ```
- **API-shape decision (agreed on review):** namespace object, not a class and not flat `getStorageJSON`/`setStorageJSON` functions. Rationale: jf-conversion's JS ruleset discourages `class` constructors; `customEvents` returning `{ emit, on }` is the in-lib precedent; bare `local`/`session` top-level exports would risk shadowing build-local variables (Ancile's ruleset example already uses `const session = {...}`), so both live under one `storage` export. Two entry points (`storage`, `cookies`) with symmetric `get`/`set`/`del` keeps the AI-agent vocabulary predictable. Backing storage is resolved lazily inside methods and try/catch-guarded — `window.localStorage` access itself can throw in some privacy modes. Tree-shaking cost of the namespace is negligible at this size.
- **Verified occurrences (3 builds, 2 clients):**
  - `GHD_013167/common.js:103–114` (`getViewedProducts` — sessionStorage + JSON.parse in try/catch, `[]` fallback)
  - `GHD_013181/localStorage.js:5–46` (`storePreviouslyViewed` and reader — localStorage + JSON)
  - `FUN_013341/indexA.js:33–44` (`loadState` — sessionStorage + JSON.parse in try/catch, `{}` fallback)
  - Note: the clustering pass also cited GHD_013169; verification **rejected** that citation (it only removes GHD_013167's keys). Honest count is 3, not 4.
- **Rule-mandated:** not directly, but two client rulesets document the pattern as the local convention — Ancile ("Common pattern for session-based state management", `session.setModalShown`/`checkModalShown`) and Parkdean ("Common patterns for persisting data": `JSON.parse(window.localStorage.getItem("key")) || null`). The rulesets are already propagating hand-rolled variants; a helper gives them one import to point at instead.
- **Rationale:** highest verified frequency of anything found, two clients plus two rulesets, and the unguarded variant (`JSON.parse(getItem(...))` with no try/catch, as in the Parkdean rule) is a live test-killing bug when storage holds junk.

### 2. `loadExternalAsset`

- **Pattern:** dynamically load an external script/stylesheet (typically a CDN lib like Swiper): check a dedup signal first (existing tag id, `document.styleSheets` scan, or the resulting global like `window.Swiper`), inject `<script>`/`<link>` into `head`, resolve on `onload`/reject on `onerror`.
- **Proposed signature:**
  ```ts
  loadExternalAsset(url: string, type: "script" | "style", options?: { checkExisting?: () => boolean }): Promise<boolean>
  ```
- **Verified occurrences (2 builds, 2 clients, independent implementations):**
  - `ITC_013228/indexA.js:56–99` (`loadSwiperAssets` — tag-id + `window.Swiper` dedup, ~44 lines)
  - `FUN_012989/indexA.js:13–56` (`loadCSS`/`loadJS` — `document.styleSheets` href scan dedup, ~40 lines; this is an older durability probe, showing the mechanic is long-lived rather than a one-off)
- **Rule-mandated:** no.
- **Rationale — and the honest caveat:** frequency is low (2 of 52 sampled builds; only builds pulling third-party libs need it) and it misses the ≥3-build bar, so this is a judgment call rather than a statistics call. What carries it: the two implementations are *independent reinventions* by different clients of the same nontrivial ~40-line mechanic, both clustering lenses surfaced it separately, and the promise/dedup/onerror edge cases are exactly what hand-rolls get wrong. Per-build effort saved is the highest of anything found. If the review wants strict frequency discipline, demote this to Watch — it will come back.

### 3. `cookies` (namespace with `get`/`set`/`del`)

- **Pattern:** read a named cookie (`document.cookie` split + key match + `decodeURIComponent`), write with path/expiry, delete via expired write.
- **Proposed API** (single `cookies.ts`; same namespace-object shape as `storage`, see decision note there):
  ```ts
  export const cookies = {
    get: (name: string): string | null => { ... },
    set: (name: string, value: string, opts?: { days?: number; path?: string; domain?: string }): void => { ... },
    del: (name: string, opts?: { path?: string; domain?: string }): void => { ... },
  };
  // usage: cookies.get("selectedSiteName");
  ```
- **Verified occurrences:** TOS_013197 `indexA.js:39–46` (verified); TOS_013008 (grep); older builds have prior examples. Toolstation ruleset documents the read as "Common pattern for accessing cookies".
- **Rationale:** promoted from Watch on review. Frequency alone doesn't earn it (storage has largely replaced cookies in current builds) — the extraction case is **AI-agent vocabulary**: dx-lib is the mandatory vocabulary for agent-authored builds, and an agent can only reach for a cookie helper that exists. Building the trio now, alongside the storage pair, makes cookie access a valid first-class option instead of a per-build hand-roll when an agent does need it (cross-subdomain state, server-visible flags — the cases storage can't cover). Symmetric `get`/`set`/`del` API with `storage` keeps the vocabulary predictable.

---

## Watch — don't extract yet

| Pattern | Evidence | Why not yet |
|---|---|---|
| `waitForScrollEnd` — rAF loop sampling scroll position until the delta settles, then fire callback | GHD_013313 and GHD_013314, `indexA.js:117–140`, **byte-for-byte identical** (verified) | Generic 24-line mechanic and the copy-paste is a strong tell, but it's 2 builds in 1 client. Extract on first cross-client appearance. |
| `normalizeString` / slugify — lowercase + collapse whitespace + strip brackets/specials to make strings comparable or key-safe | PRK_013178 `stages/stageOne.js:132–137`; BAY_013029 `helpers.js` `storeNameToId` (imported by BAY_013271); Ancile rule documents the same transform for text matching (all verified) | Three clients want it but the implementations diverge (strip-all vs collapse-to-`_` vs keep-spaces); verifier judged one signature can't replace them yet. Needs a settled contract (`toKey` vs `forMatch` modes) before it's a helper rather than a bikeshed. |
| Framework input event dispatch — set input value then `dispatchEvent(new Event("input"/"blur", {bubbles:true}))` (Angular), or find `__reactProps$` key and call `props.onChange` with a synthetic event (React) | GHD ruleset mandates the Angular variant; FundingCircle ruleset mandates the React variant; but only ITC_013319 `custom-select.js` dispatches events in recent code, and no recent build uses `__reactProps$` | Two rulesets document it, which is exactly the propagation mechanism the brief cares about — but the variants are framework-specific and recent code barely hand-rolls it. Revisit if FUN/GHD form tests pick back up. |

## Considered and rejected

- **`getQueryParam`** — native `URLSearchParams(location.search).get(name)` is already a one-liner; the verified instances (GHD_013184 `config.js:115`, PRK_013262 `indexA.js:19–22`) are 1–2-line wrappers plus build-specific coercion. Platform covers it; a helper adds an import for nothing.
- **`matchesPathPattern`** (`isPDP`/`isPLP`) — verified in GHD_013181/GHD_013238 but each is a one-line regex test against GHD's own URL suffix conventions (`-p-\d+`, `-c$`). Client-specific input, trivial mechanic.
- **`parsePriceString`** — GHD_013181 strips a DOM price string to a number; BAY_013029/013271 joins CSV price fragments to a display string. Same theme, different problems, no shared contract. Two builds, incompatible implementations.
- **Google-Sheets-CSV pricing pipeline** (BAY_013029 `helpers.js`) — deeply Bayfields-specific (endpoint, header names, voucher rewrites). Client glue, not a library.

## Side findings (not helper proposals)

1. **Adoption gap beats new surface:** GHD hand-reimplements locale-from-URL detection **4×** in its own shared files (GHD_013167, 013169, 013181, and 013249 via `../GHD_013023/config.js`) — dx-lib already exports `getLocaleFromUrl`. The biggest velocity win found in this mining pass isn't a new helper; it's making the harness/ruleset point at existing exports. Worth folding into the dx-harness codegen-template work as a lint/check: "hand-rolled function shadows a jf-lib export".
2. **Cross-build imports are the mining signal:** builds importing from sibling build dirs (`../GHD_013023/common`, `../BAY_013029/helpers`) are devs manually creating a library. Any future mining or harness telemetry should treat a cross-build import as an automatic extraction candidate flag.
3. **GHD_013169 depends on GHD_013167's storage keys** (`sessionStorage.removeItem("GHD_013167_viewedProducts")`) — cross-build runtime coupling, incidental to this workstream but worth someone's eyebrow.
