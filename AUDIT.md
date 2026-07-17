# dx-lib runtime audit — 2026-07-03

Correctness and robustness audit of the shipped runtime (`src/modules`), focused on the
lifecycle paths dx-qa will treat as ground truth: `jf-wx-*`, `jf-pagechange-1.0`,
`jf-reinit-1.0`, `window.jfLib.experiments[].details`, `window.jfLib.pagePath`,
`#<id>--style`. Assessment only — no code changed.

**Method.** Full read of `useSPA`, `emitEvent`, `useMutationObserver`, `elementReady`,
`elementRemoved`/`elementUpdated`, `insertStyle`, `isWtoPreview`, helpers; repo suite run as
baseline (241/241 pass); every High/Medium finding below was verified **empirically** with
throwaway vitest specs run against the real `src/` modules in jsdom (the repo's own suite mocks
the observers, so these paths are otherwise untested), then a fresh-context adversarial agent
attempted to refute each reasoning-only finding. Two candidate findings were refuted in that
pass and are excluded. All three backlog-seeded findings were independently confirmed (H1, H4,
H6 below).

**Ranking** is by expected damage on a live client site: lying to an external observer >
corrupted apply/reset/reapply > swallowed errors > leaks/noise.

---

## Fix-pass status (session 2026-07-03, paused mid-run)

**Done — 15 commits on `fable`, suite green (44 files / 283 tests), all Fixed ✅ rows below have a passing test:**
all C findings, L1–L7, M1–M6, H2–H7, D1, D3–D6, plus shortlist items 2–6 (consoleLog debug-gating,
JfError, destroy verb + handle shapes, compound-id docs, destroyByPrefix sweep). The non-throwing
reporter (`src/helpers/reportError.ts`) dispatches `jf-err-1.0` AND legacy `jf-wx-err` (canary tool
could not be located in the estate → dual-dispatch for one deprecation window was chosen).
Unmocked integration suite lives at `__tests__/integration/lifecycle.spec.ts` (L7).

**Breaking batch — landed (session 2026-07-03 continuation, commits `19c6f1f..88060cc`):**
1. ✅ `emitEvent` rework (H1 + rename) — never-throw error path via reportError; `"test"` API word;
   `jf-test-1.0`/`jf-track-1.0` with legacy `jf-wx-*` dual-dispatch; jfError validation. New spec landed failing-first.
2. ✅ Versioned store migration (shortlist 7) — `jfLib.observers/listeners/timers["1.0"]`,
   `jfLib.experiments["1.0"]`, `jfLib.pageChange["1.0"].pagePath`. All specs migrated.
3. ✅ Internal core id separators (shortlist 5 tail) — `elementReady--1.0` etc., `<id>--removal` (folded into 2's commit).
4. ✅ `pushToDL(action, label, event?)` (shortlist 9), failing-first spec.
5. ✅ Dead surface deletion (shortlist 10 + D2 + D7 JSDoc note) — jfTests/JfTests/JfLegacyTest,
   el.jfRemoved/jfUpdated gone; dataLayer declaration in globals.d.ts; D2's BREAKING footer carried.

6. ✅ Wrap-up — barrel regen (no new exports; formatting churn reverted), coverage 93.85% statements /
   90.87% branches (consoleLog spec added to clear the branch bar), `eslint src` clean.
7. ✅ Verification pass — six fresh-context Sonnet verifiers re-checked every Fixed row against its
   failure scenario (adversarial repro specs, run then deleted). 30/32 validated outright; two PARTIAL
   gaps found and closed same-session with failing-first tests (commit `f2a86bd`): H5 destroy() during an
   in-flight apply could still write `isApplied=true`; H6 `jf-reinit-1.0` didn't reset the removal-loop cap.

**Fix pass complete (2026-07-03): all 32 findings Fixed ✅ and Validated ✅. Suite 297 tests green.**

**Working agreements:** failing-first tests per finding; commits map to finding IDs; breaking commits carry
BREAKING CHANGE footers; don't widen fixes past their finding.

---

## Findings index (tracking for the validate → fix pass)

Verification: **E** = empirically reproduced (runnable spec against real modules),
**A** = adversarial agent code-trace, **R** = direct code read. Tick ✅ as each lands.

| ID | Sev | Finding | Verified | Validated | Fixed |
|---|---|---|---|---|---|
| H1 | High | emitEvent error path throws, swallows original error | E | ✅ | ✅ |
| H2 | High | No internal jf-wx-err; post-init errors are silent rejections | A | ✅ | ✅ |
| H3 | High | isApplied lies: apply un-awaited, stuck true on reset reject | E | ✅ | ✅ |
| H4 | High | Page-change needs meta/canonical; pathname-only | E | ✅ | ✅ |
| H5 | High | destroy() leaves listeners — zombie re-apply | E | ✅ | ✅ |
| H6 | High | watchForRemoval cap is per-session; dead >=6 guard | E | ✅ | ✅ |
| H7 | High | reInit singleton ignores later removedNode options | E | ✅ | ✅ |
| M1 | Med | elementReady marks survive reset — reapply won't re-fire | E | ✅ | ✅ |
| M2 | Med | Throwing elementReady callback starves other experiments | E | ✅ | ✅ |
| M3 | Med | Resize dead zone at exact min/max widths | E | ✅ | ✅ |
| M4 | Med | Documented init try/catch catches nothing | A | ✅ | ✅ |
| M5 | Med | checkPageUrl forces "gi" regex flags | A | ✅ | ✅ |
| M6 | Med | Unconditional production console logging | A | ✅ | ✅ |
| L1 | Low | Stale observer handle re-observes untracked | E | ✅ | ✅ |
| L2 | Low | insertStyle unescaped id + swallowed errors | E | ✅ | ✅ |
| L3 | Low | bindReInitListener clobbers reInit versions | A | ✅ | ✅ |
| L4 | Low | setupTest mutates caller's screen object | A | ✅ | ✅ |
| L5 | Low | elementReady pause/destroy TypeError on jfLib wipe | A | ✅ | ✅ |
| L6 | Low | LIB_INIT shared mutable module state | A | ✅ | ✅ |
| L7 | Low | Suite mocks observers — lifecycle paths untested | R | ✅ | ✅ |
| D1 | High | customEvents listeners leak across reset/reapply | E | ✅ | ✅ |
| D2 | High | rbTest removal ships as minor (refactor: commit) | R | ✅ | ✅ |
| D3 | High | waitForNuxtStable hangs in background tabs | A | ✅ | ✅ |
| D4 | Med | customEvents getBus throws after jfLib wipe | A | ✅ | ✅ |
| D5 | Med | waitForNuxtStable silent false; Nuxt 3 no-op | A | ✅ | ✅ |
| D6 | Med | $nextTick rejection breaks boolean contract | A | ✅ | ✅ |
| D7 | Low | Notes: jfTests type-only; fromId no replay; delta coverage | A | ✅ | ✅ |
| C1 | High | preventScroll class mismatch — doesn't lock scroll | R | ✅ | ✅ |
| C2 | Med | elementUpdated fires despite textContent opt-out | R | ✅ | ✅ |
| C3 | Low | Stray console.log in elementInView | R | ✅ | ✅ |
| C4 | Low | useSPA error re-wrapping mangles originals | R | ✅ | ✅ |
| C5 | Low | Type/contract lies batch (XPath, waitForElement, …) | R | ✅ | ✅ |

Standardisation moves (Round 2 Part B shortlist, items 1–10) are tracked separately — they're
design decisions, not defects.

---

## High

### H1. `emitEvent` error path throws instead of reporting — the reporter can destroy the report
**Location:** `src/modules/emitEvent.ts:46-54` (validation), `:57` (`err.message` on undefined)
**Failure scenario:** A build's catch block calls `emitEvent("error", exp, err)`. If
`exp.ticketId`/`variant` is malformed (typo, `CONTROL` lowercase, wrong format) the validation
*throws inside the error path* — the original production error is swallowed, `jf-wx-err` never
dispatches, and the new throw is itself unhandled. Calling `emitEvent("error", exp)` with no
`err` argument throws `TypeError` at `:57` (`err.message` on `undefined`) the same way. Verified:
malformed ticketId → throw, zero `jf-wx-err` dispatched; omitted `err` → TypeError.
**QA surface:** Yes — `jf-wx-err` is dx-qa's primary error signal; this makes it structurally
unreliable exactly when it matters.
**Fix direction:** Error-type calls must never throw: validate, but on failure emit a
best-effort `jf-wx-err` with whatever fields exist (plus a `malformed: true` flag) and
`console.warn` the rest; guard `err ?? "unknown error"`.

### H2. The library never emits `jf-wx-err` itself; post-init lifecycle errors are invisible unhandled rejections
**Location:** `src/modules/useSPA.ts:948-971` (`handlePageChange`/`handleReInit` catch →
`throwError` → throw inside async event listener), `:757-773`; `emitEvent` is imported nowhere
in `src/` (public entry point only).
**Failure scenario:** A site redeploy removes a selector; on the next SPA navigation the
re-apply throws. The throw lands in an async event-listener callback → unhandled promise
rejection. No `jf-wx-err`, no callback into build code (the error never reaches the author's
catch), monitoring keyed on `jf-wx-*` reports the experiment healthy while every SPA-navigated
visitor sees the broken variant. Adversarially confirmed: the only softening is that
`details.isApplied` stays `false` after a failed re-apply, so a poller *could* infer sickness.
**QA surface:** Yes — the wire surface lies by omission for every error after first apply.
**Fix direction:** Route `throwError` on post-init paths through a non-throwing reporter
(dispatch `jf-wx-err`/future `jf-lifecycle` event, then log) instead of rethrowing into the void.

### H3. `details.isApplied` lies: async `apply()` is fired-and-forgotten, and a rejecting `reset()` leaves `isApplied` stuck `true`
**Location:** `src/modules/useSPA.ts:1068-1070` (`STATE.options.apply()` not awaited;
`isApplied = true` set immediately); `:733-736` (a rejecting user `reset()` skips the state
writes); floating `resetTest()` calls at `:663`, `:671`, `:684`, `:693`, `:995`, `:1003`.
**Failure scenario:** Builds routinely pass async `apply` (hydration waits are the norm in SPA
tests). Verified: `isApplied` becomes `true` while `apply`'s promise is still pending and stays
`true` after it rejects — the rejection is unhandled and invisible. Mirror image on reset:
`reset()` *is* awaited, so if it rejects, `isApplied=false`/`isReset=true` never execute and the
rejection escapes via the six un-awaited `resetTest()` call sites.
**QA surface:** Yes — `isApplied`/`isReset` are exactly the fields dx-qa §8 reads as ground truth.
**Fix direction:** `await Promise.resolve(STATE.options.apply())` in a try/catch; set
`isApplied` only on success; set reset state in `finally`; await (or `.catch`) every
`resetTest()` call site.

### H4. Page-change detection requires a `meta[name=description]` or `link[rel=canonical]` and only watches `pathname` *(seeded — confirmed)*
**Location:** `src/modules/useSPA.ts:540-551`
**Failure scenario:** Verified: on a page with neither tag, SPA navigations never dispatch
`jf-pagechange-1.0` — tests neither reset off matched pages nor apply on newly matched ones,
and `window.jfLib.pagePath` goes permanently stale. Also inherent in the design: query-string
and hash navigations (`?page=2`, PLP filters) are invisible because only `pathname` is compared,
and detection fires only if some DOM mutation happens *after* the URL change.
**QA surface:** Yes — `jf-pagechange-1.0` and `pagePath` silently absent/stale on affected
clients; dx-qa cannot tell "no navigation" from "detection dead".
**Fix direction:** Drop the meta/canonical presence gate (it's a proxy, not a signal); compare
full location (path+search+hash, configurable); consider patching `history.pushState`/
`popstate` as the primary signal with the observer as fallback.

### H5. `destroy()` doesn't remove listeners — destroyed tests zombie-reapply
**Location:** `src/modules/useSPA.ts:744-749`; listeners bound at `:435-441`, `:450-451`;
per-test `_<id>_` observer (`:1089`) never disconnected.
**Failure scenario:** Verified: after `Test.destroy()`, `window.jfLib.experiments` is empty but
the instance's `jf-pagechange`/`jf-reinit`/`resize` listeners and removal observer survive; the
next `jf-pagechange-1.0` re-runs `initTest()` and **re-applies the test** (`apply` called again,
styles re-inserted). The JSDoc ("completely removes the test and cleans up any registered
listeners") is false. Same for public `reset()`: nothing stops the next event re-applying, which
is intended for SPA flow but means neither API can actually stop a test.
**QA surface:** Yes — registry (`experiments[]`) says gone while DOM changes reappear; an
external observer sees an experiment that doesn't exist mutating the page.
**Fix direction:** `removeTest` must `removeEventListener` all three handlers, disconnect the
`_<id>_` observer, and set a `destroyed` flag checked at the top of `initTest`.

### H6. `watchForRemoval` loop guard: lifetime cap of 5, dead `>= 6` branch, then a user `reset()` per removal forever *(seeded — confirmed)*
**Location:** `src/modules/useSPA.ts:1108` (`>= 6`, unreachable), `:1116-1121` (`>= 5` resets
without incrementing — `loopCount` pins at 5 and never resets anywhere)
**Failure scenario:** Verified end-to-end: the SPA re-renders the watched element; reapplies cap
at exactly 5 (correct per docs), but because `loopCount` never resets — not on page change, not
on reinit — the cap is **per session, not per loop**. After it's hit, the experiment is
permanently off for that visitor, and every subsequent site re-render of the watched element
triggers another full `resetTest()` (user `reset()` re-executed each time; observed 5+ extra
resets). Five legitimate re-renders over a long browsing session kill the test silently.
**QA surface:** Partial — `isApplied` honestly reads `false`, but no event explains why; dx-qa
sees an experiment that stopped applying with no error.
**Fix direction:** Reset `loopCount` on page change / successful settle (make the cap "5 rapid
reapplies", e.g. within a time window); delete the dead `>= 6` branch; stop re-running
`resetTest` per removal after the cap (once is enough).

### H7. The `jf-reinit` observer is a global singleton that closes over the *first* test's `removedNode`
**Location:** `src/modules/useSPA.ts:488-521` (guard at `:491`, `STATE.options.removedNode`
read at `:503` — first binder's STATE only)
**Failure scenario:** Verified: test A inits with default `MAIN`; test B inits with
`removedNode: "app-root"`. Re-adding `<app-root>` fires nothing — B never re-applies after the
SPA wipes its DOM. Re-adding `<main>` fires (proving the observer works, for A's config only).
Any build whose SPA lacks `<main>` and relies on the documented `removedNode` option gets a
dead option whenever any other test (or an earlier copy of the lib) bound the singleton first.
**QA surface:** Yes — `jf-reinit-1.0` never fires for the affected configuration.
**Fix direction:** The singleton should watch a *registry* of node names
(`window.jfLib.reInit["1.0"].nodeNames` set, added to per instance) instead of one closure's
option.

---

## Medium

### M1. `elementReady` marks survive `useSPA` reset — reapply never re-decorates surviving elements
**Location:** `src/modules/useSPA.ts:720-731` (reset filters `<id>--`-prefixed callbacks but
leaves element `jfReady` marks); `src/modules/elementReady.ts:222-232` (marked elements skipped)
**Failure scenario:** Verified: apply registers `elementReady(".target", cb, "<id>--x")`, cb
fires and marks the element; `reset()` removes the callback (and the build's reset undoes the
DOM changes); a `jf-reinit` re-applies the test, `elementReady` re-registers — but the surviving
element is still marked, so the callback **never re-fires**. Test re-applies "successfully"
(`isApplied: true`) with undecorated DOM. The lib's own reset teardown creates this: it does the
callback half of `destroy()` without the unmark half (`elementReady.ts:383-397`).
**QA surface:** Indirect but nasty — details claim applied; the page says otherwise.
**Fix direction:** The reset teardown at `useSPA.ts:720-731` must also clear matching `jfReady`
marks (reuse `elementReady`'s destroy logic rather than reimplementing the filter).

### M2. One throwing `elementReady` callback starves every later-registered experiment's callback
**Location:** `src/modules/elementReady.ts:282-286` (unguarded `cb.callback(node)` in shared
observer loop), `:231-237` (element marked ready *before* callback runs)
**Failure scenario:** Verified: experiments A and B both watch `.hero`; A registered first and
its callback throws. B's callback never runs for that mutation — cross-experiment interference
through the shared `elementReady-1.0` observer. And because the element is marked before the
callback executes, A never retries either: one transient throw = permanently skipped element.
**QA surface:** Indirect (broken variants with healthy-looking state).
**Fix direction:** try/catch around each `cb.callback(...)` in the observer loop; mark ready
*after* the callback returns (or unmark on throw).

### M3. Resize boundary dead zone — exact `minWidth`/`maxWidth` widths do nothing
**Location:** `src/modules/useSPA.ts:985` (`>` / `<` strict) vs `:660`/`:668` (`<` / `>` on init)
**Failure scenario:** Verified with `screen: {minWidth: 601, maxWidth: 1023}`: initial load at
601px applies; *resizing* to exactly 601px does nothing (no apply, no reset) because the resize
handler's in-bounds check is strict while init's out-of-bounds checks are strict the other way.
Real devices land on exact breakpoints (768, 1024): rotate an iPad and the test neither applies
nor resets. State then depends on resize history, not current width.
**QA surface:** Indirect — `isApplied` diverges from what the config says should be true at the
current viewport.
**Fix direction:** Make the resize handler's bounds test `>= minWidth && <= maxWidth` to mirror
`initTest`, or better, share one `isInBounds()` between both paths.

### M4. The documented `init` error-handling pattern catches nothing
**Location:** `src/modules/useSPA.ts:1189-1197` (`init` is async → never throws synchronously)
vs the JSDoc example `:288-314` (sync try/catch, no `await`)
**Failure scenario:** Every build following the documented example: a typo'd `location` or
missing `apply` rejects the un-awaited promise; the example's `catch (e)` is dead code. The
validation error surfaces only as an unhandled rejection — no `jf-wx-err`, no build-side
handling; the test silently no-ops. Adversarially confirmed (`useSPA(id)` itself cannot throw,
so nothing in the example's try block ever throws).
**QA surface:** Yes — setup failures are invisible to the wire.
**Fix direction:** Fix the JSDoc to `await Test.init(...)` inside an async IIFE (doc change,
zero code risk); longer-term have `init` report through the H2 reporter before rejecting.

### M5. `checkPageUrl` rebuilds user regexes with forced `"gi"` flags
**Location:** `src/modules/useSPA.ts:577` (`new RegExp(match, "gi")`)
**Failure scenario:** A deliberately case-sensitive `location: /\/Products\//` also matches
`/products/` — variant applied on the wrong template. User's own flags (`m`, `s`, `u`) are
silently dropped, which can change `^`/`$` semantics. (No `lastIndex` statefulness — the RegExp
is rebuilt per call and tested once; adversarially confirmed.)
**QA surface:** Indirect (test applied on pages the config says it shouldn't match).
**Fix direction:** Use the user's RegExp as-is (`match.test(...)`); if case-insensitivity is
wanted as default, apply it only to string matches.

### M6. Unconditional styled console logging on production client sites
**Location:** `src/helpers/consoleLog.ts` (all levels are `console.log`); `debug`-param
semantics in `useSPA.ts:345-348` / `useMutationObserver.ts:137-140` (`debug=false` ⇒ always
log); always-on calls at `useSPA.ts:374, 698, 717, 1063, 1086` and
`useMutationObserver.ts:159, 182, 193`
**Failure scenario:** Every visitor on every client site gets 4–6 styled console lines per page
view per running test ("Creating Test", "Page matched!", "Applying Test"…), leaking experiment
IDs to anyone who opens devtools (including competitors and the client's own QA); "error"-level
lib logs go through `console.log`, so they're invisible to error-tracking that hooks
`console.error`/`window.onerror`.
**QA surface:** Minor (noise, plus lib "errors" invisible to console-based collectors).
**Fix direction:** Default all lib logging to debug-gated (`isDebug()`); route genuine errors
through `console.warn`/`error`.

---

## Low

### L1. `useMutationObserver`: a disconnected handle can re-observe into an untracked observer, allowing duplicates per id
**Location:** `src/modules/useMutationObserver.ts:187-194` (disconnect removes registry entry
but the closure keeps `observerObject`), `:165-184` (stale handle re-observes)
**Failure scenario:** Verified: `observe → disconnect → observe` yields a live observer absent
from `window.jfObservers`; a fresh `useMutationObserver(sameId)` then creates a second live
observer for the same id — the exact duplicate/leak the registry exists to prevent.
**Fix direction:** `observe` should re-register in `window.jfObservers` if missing (or
disconnect should mark the handle dead).

### L2. `insertStyle`: unescaped id in `querySelector` sits *outside* the try/catch; all real failures are swallowed
**Location:** `src/modules/insertStyle.ts:28` (throws for ids needing CSS escaping, e.g.
leading digit — verified rejection), `:44-46` (all insertion errors `console.warn`'d, promise
resolves successfully)
**Failure scenario:** A test id starting with a digit rejects the promise (un-awaited and
uncaught from `useSPA.ts:1167` → unhandled rejection, no styles, `isApplied` still true). Any
other failure resolves "successfully" having warned to console — callers can't detect missing
styles.
**Fix direction:** Use `getElementById(id)` (no selector parsing), move the check inside try,
and rethrow (or return a success boolean) instead of swallowing.

### L3. `bindReInitListener` clobbers the whole `reInit` object for other versions
**Location:** `src/modules/useSPA.ts:495` (`window.jfLib.reInit = {}` after the guard only
checked *this* version's key)
**Failure scenario:** Two jf-lib copies at different versions on one page (normal: each build
vendors the lib): the older copy initialising second wipes the newer version's `reInit`
bookkeeping. Records only — live observers survive in `window.jfObservers` — but the versioned
namespace dx-qa reads becomes untrustworthy. Contrast `bindPageChangeListener:531`, which gets
it right.
**Fix direction:** Delete line 495 (the `||= {}` at `:489` already did the job).

### L4. `setupTest` mutates the caller's `screen` options object
**Location:** `src/modules/useSPA.ts:444-447` (defaults written onto the user's object by
reference)
**Failure scenario:** A frozen/shared config object throws `TypeError` in strict mode → `init`
rejects invisibly (see M4). Otherwise benign.
**Fix direction:** `STATE.options.screen = { minWidth: 0, maxWidth: 99999, ...screen }`.

### L5. `elementReady.pause()/destroy()` throw (as rejections) if `window.jfLib` was wiped
**Location:** `src/modules/elementReady.ts:346`, `:374` (`getObserver().callbacks` unguarded;
`removeCallback:361` one function away guards the full chain)
**Failure scenario:** Tag-manager cleanup nulls `window.jfLib`; a build's teardown calls
`e.destroy()` → rejected promise, `jfReady` marks never cleared. Narrow trigger (external wipe
only — construction-time failure paths can't produce a live handle; adversarially narrowed).
**Fix direction:** Same optional-chain guard as `removeCallback`.

### L6. `LIB_INIT` is shared mutable module state
**Location:** `src/modules/useSPA.ts:21-24`, `:365`
**Failure scenario:** `window.jfLib` becomes the module-level `LIB_INIT` object and all runtime
state mutates it; if third-party code deletes `window.jfLib`, re-init resurrects the polluted
object (stale `experiments`, `pagePath`, observer records). Adversarial review showed the
recovery path mostly *works* despite this (window listeners rebind unconditionally at
`:435-441`; observers survive in `window.jfObservers`) — the main residue is missed page
changes while `jfLib` is absent (`:544` throws inside the observer callback) and resurrected
stale `experiments` entries. Hygiene, not an active bug.
**Fix direction:** `window.jfLib = window.jfLib || { pagePath: ..., experiments: [] }` (fresh
object per assignment).

### L7. Test-suite blind spot: the real observer/lifecycle paths are untested
**Location:** `__tests__/modules/useSPA.spec.ts:24-53` (pageChange/reInit observers replaced
with `vi.fn()` mocks); repo test run emits an uncaught `ReferenceError: window is not defined`
from `elementUpdated.ts:95` firing after environment teardown — live evidence the shared
observers have no teardown path.
**Failure scenario:** Every High finding above sits on a code path the suite cannot reach; all
were verified only by standing up unmocked specs. The QA-hooks work will need exactly such a
harness.
**Fix direction:** Add an unmocked integration spec file (real observers, real events, per-file
isolation — the verification specs written for this audit are a ready-made starting point).

---

## The pinned `jf-lib@2.0.11` surface (do not break)

Confirmed against `git show v2.0.11`:

- **`window.jfLib.experiments[]` holds different shapes across the estate.** v2.0.11 pushes the
  internal `STATE` object (`{options, loopCount, details}` — `options` exposes the raw
  `apply`/`reset` functions); HEAD pushes `publicApi` (`{details, init, reset, destroy}`).
- **`details` on 2.0.11 is only `{isRunning, id}`.** `pageMatched`/`isApplied`/`isReset` do not
  exist there. The stable cross-estate intersection dx-qa can rely on is exactly
  `details.id` + `details.isRunning`; everything else must be feature-detected.
- **Event names and the `#<id>--style` convention are identical** in both versions — safe
  signals estate-wide (subject to H4's detection gaps, which exist in 2.0.11 too; all High
  findings except the `resetTest` callback-teardown interaction (M1) predate HEAD and are live
  in 2.0.11).
- **Consequently:** fixes for H3/H5/H6 that change *when* `details` fields flip, or any reshape
  of `experiments[]` entries, alter observable behaviour on HEAD-consumers only — the estate
  stays heterogeneous. Version/capability-stamp the surface (e.g. `details.schema = 2` or
  `window.jfLib.capabilities`) rather than sniffing shapes, per the backlog note.

---

## Cross-cutting recommendation for the QA-hooks design

Three of the seven High findings (H1, H2, M4) are one architectural gap: **the library has no
non-throwing error channel.** Every error path either throws into an async void or requires the
build author to call a validator that itself throws. The QA-hooks registration core should make
"report without throwing" the invariant — a single internal reporter that dispatches the wire
event best-effort, logs, and never propagates — and every lifecycle path (H2's handlers, H3's
apply/reset, M4's init) routes through it. That one primitive retires the whole top of this list.

---
---

# Round 2 — staging delta + library-wide consistency (2026-07-03)

Two additional scopes, same evidence bar as round 1 (file:line + concrete failure scenario;
empirical verification where feasible; adversarial agent review of reasoned findings).

Context updates from Sam: the jf-conversion `2.0.11` pin is expected to be lifted — the staging
delta below is the de facto next release those consumers absorb. dx-qa is still in planning, so
its event-surface expectations can be fed changes before it's built: naming fixes can be clean
breaks rather than dual-dispatch (the only remaining `jf-wx-*` listener to check is the existing
canary tool).

Note: `staging` and `origin/main` have **no `src` difference** — the unreleased delta is
v2.0.11 → HEAD, carried by both branches. Staging sits at `2.1.0-staging.2`.

---

## Part A — the unreleased delta (v2.0.11 → HEAD)

Delta contents: `customEvents` (new), `waitForNuxtStable` (new), `useSPA` introspection changes
(audited in round 1: `details` gained `pageMatched/isApplied/isReset`; `experiments[]` now holds
`publicApi` instead of raw `STATE`; the reset callback-teardown block `useSPA.ts:720-731` is
new — round-1 finding M1 is delta-introduced), `rbTest` removed, barrel/globals updates.

### D1. High — customEvents listeners leak across every reset/reapply cycle *(verified empirically)*
**Location:** `src/modules/customEvents.ts:59-66` vs `src/modules/useSPA.ts:720-731`
**Failure scenario:** Verified: a handler subscribed via `on()` inside `apply()` fires **twice**
after one reset/reapply cycle — `resetTest`'s teardown prunes elementReady/Removed/Updated
callbacks by `<id>--` prefix but nothing in the codebase cleans `jfLib.customEvents` (grep
confirms zero external references). On an `alwaysReset` test, every SPA soft-navigation stacks
another listener: N navigations → N-times-duplicated analytics pushes, DOM mutations, and
unbounded closure retention of detached DOM.
**QA surface:** Yes — duplicate `track`/dataLayer events corrupt metrics.
**Fix direction:** Registry listeners per experiment id (the namespace already encodes it) and
sweep them in `resetTest` alongside the element* callbacks — or expose `offAll()` and call it
there.

### D2. High — `rbTest` removal ships as a *minor* under a `refactor:` commit
**Location:** `src/modules/index.ts` (barrel export gone; present in
`git show v2.0.11:src/modules/index.ts`), commit `3ac9e98`, `package.json:3`
(`2.1.0-staging.2` — confirmed no major will be cut: the Angular preset never bumps major for
`refactor:`)
**Failure scenario:** Any consumer importing `rbTest`/`RBTest` (value or type) gets a build
failure — or `undefined is not a function` in loosely-bundled JS — the moment they unpin from
2.0.11 and rebuild. Deployed bundles are safe (code is inlined at build time); rebuilds of old
rbTest-based experiments are not. No residual `rbTest` references remain in `src/` itself.
**Fix direction:** Before merging to main, grep jf-conversion for `rbTest` imports; land the
removal with a `BREAKING CHANGE:` footer so semantic-release cuts v3.0.0 and the estate's
version number tells the truth.

### D3. High — `waitForNuxtStable` can hang forever in background tabs
**Location:** `src/modules/waitForNuxtStable.ts:27-31` — the promise resolves *only* inside a
double `requestAnimationFrame`; there is no other resolve path and no timeout on that phase.
**Failure scenario:** User opens the client site in a background tab (or the page is
speculation-rules prerendered): rAF callbacks are suspended while hidden, so
`await waitForNuxtStable()` never settles and the experiment silently never applies until the
tab gains visibility — skewing exposure and stalling anything downstream of the await. Invisible
to the suite because jsdom fires rAF regardless of visibility
(`__tests__/modules/waitForNuxtStable.spec.ts:74-92` passes for the wrong reason).
**QA surface:** Yes — test never applies, no event, no error.
**Fix direction:** Race the double-rAF against a `setTimeout` fallback, or skip the rAF phase
when `document.visibilityState === "hidden"` (its before-paint purpose is moot in a hidden tab).

### D4. Medium — `customEvents` `getBus()` throws if `window.jfLib` is wiped after creation
**Location:** `src/modules/customEvents.ts:13` (unguarded
`window.jfLib.customEvents[VERSION].bus`), hit by `emit` (`:48`), `on` (`:64`), and every
previously returned unsubscribe (`:65`)
**Failure scenario:** A tag-manager script replaces `window.jfLib` mid-session; the next
`emit()` inside a click handler throws a TypeError, killing the rest of the handler. Same
failure class as round-1 L5 (elementReady) — the delta repeats the pattern instead of fixing it.
**Fix direction:** Make `getBus()` call the (idempotent) `initBus()` before reading.

### D5. Medium — `waitForNuxtStable` communicates failure only as a silent `false`
**Location:** `src/modules/waitForNuxtStable.ts:18-31`
**Failure scenario:** Natural call shape is `await waitForNuxtStable(); mutateDOM();` — the
boolean is ignored. On slow connections (hydration > 2s) and on **every Nuxt 3 site**
(`window.$nuxt` never exists) the call burns 2s, resolves `false` with no log, and the build
mutates the still-hydrating page — exactly the failure the module exists to prevent.
**Fix direction:** `log`/`console.warn` on timeout at minimum; document the Nuxt-2-only scope in
the name or make it detect-and-warn on Nuxt 3.

### D6. Medium — a rejecting `$nextTick` breaks the `Promise<boolean>` contract
**Location:** `src/modules/waitForNuxtStable.ts:23` (unguarded `await window.$nuxt.$nextTick()`)
**Failure scenario:** Vue 2's promise-form `$nextTick` rejects if a render error fires in that
tick — `waitForNuxtStable` then rejects instead of returning the documented boolean, an
unhandled rejection in build code written against the true/false API. Plausible-but-untested
(needs a Vue render error in that exact tick).
**Fix direction:** try/catch the `$nextTick` and fall through to the rAF phase.

### D7. Notes (Low)
- **`window.jfTests` / `JfLegacyTest` typing change is runtime-neutral** — nothing in `src/`
  reads or writes `jfTests` anymore; the declaration exists so old inlined bundles still
  type-check. The `RBTest` *type* import breaking for upgraders folds into D2's major-bump case.
- **`customEvents` cross-experiment `fromId` has no replay** (`customEvents.ts:60`): B
  subscribing after A emitted misses the event silently. Document the ordering requirement;
  consider last-value replay for state-like events.
- **Delta test coverage:** both new modules' specs cover happy paths only — none of D1, D3, D4,
  D6 is reachable by the current suite.

---

## Part B — library-wide consistency audit

Full-catalogue pass over all 41 modules + 5 helpers (two parallel cataloguing agents; correctness
claims below re-verified by direct read). The library is in visibly distinct generations:
pure utilities → flat `window.jf*` arrays → versioned `window.jfLib` namespaces → `customEvents`.
The `window.jfLib` versioned store is the pattern worth finishing.

### New correctness findings surfaced by the sweep

**C1. High — `preventScroll` doesn't prevent scrolling (except on iPhone)**
`src/modules/preventScroll.ts:18` injects the rule `.JFCRO-no-scroll{overflow:hidden}` (hyphen)
but `:27-28` add the class `JFCRO_no-scroll` (underscore) to body/html. The selector never
matches, so on Android/desktop the overflow lock does nothing — only iPhone works, via the
unrelated inline `position:fixed` path (`:23-25`). Any experiment modal relying on it fails to
lock background scroll for most visitors. Fix: one character; pick a name and add a regression
test that asserts computed overflow, not class presence. (Also: `enableScroll.ts:19-21` does
`parseInt` string-surgery on `body.style.top` that yields `NaN` scroll-restore if called without
a prior `preventScroll` on iPhone.)

**C2. Medium — `elementUpdated` fires for `textContent` updates the caller opted out of**
`src/modules/elementUpdated.ts:281-291`: when `options.textContent` is falsy the code logs
"Ignored: textContent" but is missing the `return false` — it falls through and returns `true`,
so callbacks fire for text mutations on a listener configured `{attributes: true}` only.
Verified by read; every other branch in the function returns correctly. Fix: add the `return
false`.

**C3. Low — stray debug `console.log(window.innerHeight)` on every `elementInView` call**
`src/modules/elementInView.ts:18` — unconditional, production, no prefix. Delete.

**C4. Low — `useSPA` error re-wrapping mangles originals twice**
`useSPA.ts:469` `throw new Error(e)` stringifies the caught Error (stack lost, message becomes
`"Error: …"`); `useSPA.ts:772` passes `errorObj?.details` as `Error`'s second argument where an
`{cause}` options object is expected, so the cause is silently dropped. Also `validateOptions`'
`return false` after every `throwError(...)` (`:787-935`) is dead code — `throwError` always
throws. Fix: `throw e` / `{ cause: errorObj?.details }`.

**C5. Low — type/contract lies (batch)**
`getElementByXPath.ts:11-13` declared `HTMLElement`, returns `undefined` (siblings return
`null`); `waitForElement.ts:17` casts the *resolved value* `as Promise<Element|null>`;
`parseJsonToFormData.ts:13`'s object check passes `null` and arrays; `typeGuards.ts` `isObject`
returns true for `null`. One-line fixes each.

### The consistency picture (condensed catalogue)

**Global state — four generations coexist:**
| Pattern | Modules | Teardown |
|---|---|---|
| `window.jfLib.<key>["1.0"]` versioned | elementReady/Removed/Updated, useSPA pageChange/reInit, customEvents | partial→none; shared observers never disconnect even at zero callbacks |
| `window.jfLib` flat keys | useSPA `experiments`, `pagePath` | destroy removes own entry only |
| Flat top-level window arrays | `jfObservers` (useMutationObserver.ts:145), `jfListeners` (useEventListener.ts:75), `jfTimers` (useSetTimeout.ts:55) | good — all three have working `disconnect` |
| None/DOM-as-state | insertStyle/insertHTML (dedupe by DOM id), preventScroll (class+style), elementReady's `el.jfReady` element marks | mixed |

Ironies worth fixing: `window.jfObservers` — the *substrate* the versioned modules are built on —
is itself unversioned; `el.jfRemoved`/`el.jfUpdated` are declared in `globals.d.ts:96-97` but
never used (false symmetry with `jfReady`); `window.jfTests` is dead surface; `useEventListener`/
`useSetTimeout`/`pushToDL` carry inline `declare global` blocks instead of `globals.d.ts`.

**Handle shapes — teardown vocabulary is split four ways** (`destroy` vs `disconnect` vs
anonymous unsubscribe closure vs paired standalone `enableScroll`), `pause` exists only on
elementReady, `details` introspection exists only on useSPA/useMutationObserver (flattened
inline on useEventListener/useSetTimeout, absent on the element* trio — no way to ask "is this
listener active?"), and `listenForSwipe` returns nothing at all — its outer listeners are
unremovable for the page's lifetime (`listenForSwipe.ts:85-86`). Async split: element* trio's
`pause`/`destroy` are async solely to house an undocumented 50ms delay (and their interface
signatures omit the delay param the implementations take); useSPA `destroy` is sync, `reset`
async; all `disconnect`s sync.

**Failure sentinels** in the promise/value family: `null` (waitFor, waitForElement) vs `false`
(docReady, waitForNuxtStable, insertHTML) vs silent void (insertStyle) vs `undefined`
(getElementByXPath). Same concept, four contracts.

**Error/validation dialects — at least seven message styles** across throwing modules
("Parameter 1" / "Parameter one" / "Arg 1" / "arg two" / "Argument 1" / "Provide a … as arg 1" /
useSPA's structured `[id] CODE: message`), plus three failure regimes: throw-descriptive (most
small utils), log-real-reason-then-throw-generic (`"elementReady setup failed"` — the real cause
never reaches the exception; elementReady.ts:149-188 ×3 clones), and swallow-into-console
(insertStyle). `pushToDL` alone uses `TypeError` (and has an optional-with-default *first*
parameter before two required ones — `pushToDL.ts:19`). `replaceHTML.ts:13-16` mixes two throw
syntaxes and two dialects in four lines.

**Logging:** the debug-gated `log` wrapper is copy-pasted five times (elementReady.ts:136,
elementRemoved.ts:118, elementUpdated.ts:145, useMutationObserver.ts:137, useSPA.ts:345), the
polarity means default-always-on in production (round-1 M6), and all levels route to
`console.log`. useSPA's "Page URL not matched" logs at *error* level on every non-matching page
change of every SPA session.

**Naming:** family misfits — `elementInView` is an `is*` predicate in `element*` clothing,
`docReady` is a `waitFor*`, `queryAll` is a `get*`, `customEvents` is a noun-named `use*`
factory, `emptyElem` abbreviates what everything else spells out, `findParents` (plural) returns
one element. Id argument position drifts across arg 1 / arg 2 / arg 3 by module. The generic
`FunctionWithArgs` type lives in `listenForSwipe.ts` and is imported by `debounce`.

### Event naming — `jf-wx-*` → `jf-*` standardisation

Complete wire-event inventory (nothing else in `src` dispatches):
`jf-wx-err`/`jf-wx-test`/`jf-wx-track` (emitEvent.ts:69,82,93 — unversioned, legacy, and the
API/wire words already disagree: caller type `"load"` dispatches `jf-wx-test`);
`jf-pagechange-1.0`/`jf-reinit-1.0` (useSPA — versioned family); `${id}:${type}` (customEvents —
private bus, version lives in the storage key instead).

**Recommendation:** adopt the versioned family as the one convention — `jf-err-1.0`,
`jf-test-1.0`, `jf-track-1.0` (matching `jf-pagechange-1.0` and the planned `jf-lifecycle-1.0`),
and align the `emitEvent` API word with the wire word (`"load"` → `"test"`, or rename the wire
event to `jf-load-1.0`). Since dx-qa is pre-build, this is a clean break on the listener side —
the only consumer to reconcile is the existing canary tool: if it can be updated in lockstep, no
dual-dispatch needed; if not, dual-dispatch `jf-wx-*` for one deprecation window and drop it in
the next major. Fold the H1 fix (never-throwing error path) into the same `emitEvent` rework so
the surface changes once, not twice.

### Standardisation shortlist (merged, ordered by value ÷ breakage)

1. **One-character and one-line correctness fixes first**: C1 preventScroll class, C2
   elementUpdated `return false`, C3 stray console.log, C4 error re-wrapping, C5 contract lies.
2. **`consoleLog`: route warn/error levels to `console.warn`/`console.error`**, and flip the
   default to debug-gated (kills round-1 M6). One helper, whole library benefits; extract the
   five copy-pasted wrappers into it.
3. **One error style**: generalise useSPA's coded-error shape to a `JfError` used library-wide;
   thrown setup errors carry the reason currently only logged; converge the seven message
   dialects. Pairs with the round-1 non-throwing-reporter recommendation — build both into
   `emitEvent`'s rework.
4. **One teardown verb (`destroy`), one handle shape (`{details, init, pause?, destroy}`)**:
   alias `disconnect` → `destroy` (keep old name as deprecated alias — zero breakage), add
   `details` + `pause` to the element* trio, give `listenForSwipe` a handle, name customEvents'
   unsubscribe. Standard contract: idempotent, sync, never throws.
5. **Codify the `<ownerId>--<childId>` compound-id convention** (it already silently governs
   useSPA's reset sweep and style ids) and document it on every id-taking module; switch
   internal core ids (`elementReady-1.0`) to the same separator.
6. **One teardown sweep**: a `destroyByPrefix(prefix)` over all registries — element* callbacks
   (already done), customEvents listeners (fixes D1), `jfListeners`, `jfTimers`, `jfObservers` —
   called from `resetTest`/`removeTest`. This is the QA-hooks "auto-tracked resources" feature
   growing out of the leak fixes; also gives the element* trio a place to finally disconnect
   their shared observers at zero callbacks.
7. **Migrate the flat window arrays under versioned `jfLib` keys** (`jfObservers`/`jfListeners`/
   `jfTimers`), and fold `experiments`/`pagePath` under a versioned key — breaking, so batch
   into the same major as D2's rbTest removal.
8. **One failure sentinel** (`null`) for the waitFor family; give insertStyle/insertHTML a
   common inserted-element-or-null result instead of silent-void vs sync-boolean.
9. **`pushToDL(action, label, event?)`** — fix the optional-first signature (tiny, mechanical,
   breaking; same major).
10. **Delete dead surface**: `window.jfTests` writes nowhere, `el.jfRemoved`/`jfUpdated`
    declarations, legacy `RBTest` type residue; move inline `declare global` blocks into
    `globals.d.ts`.

Items 1–6 are non-breaking (or additive) and could ship as the next minor alongside the delta;
7–10 batch into the major that D2 already justifies.
