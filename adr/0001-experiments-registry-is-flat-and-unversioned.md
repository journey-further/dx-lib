---
status: accepted
date: 2026-08-04
---

# `window.jfLib.experiments` is flat and unversioned; entry shape is marked per-entry

Every build vendors and inlines its own copy of jf-lib, so several versions of the library run on the
same page at once, indefinitely — a build published two years ago cannot be recalled or rebuilt out of
existence. `window.jfLib.experiments` is the one registry of every test on the page, shared by all of
them, so it stays a **flat, unversioned `JfSPA[]` forever**. Entries carry `details.schema` to declare
their own shape (`3` = the `JfSPA` public API; `undefined` = a pre-3.0 lib's raw internal state, where
the reset callback lives at `options.reset` and `details` is only `{isRunning, id}`).

This works because every version of the library only ever reads `details.id` off entries it did not
create — that is the stable cross-estate intersection, and it is what makes dedupe and destroy
interoperate across vendored copies.

## The rule this exists to prevent breaking

**Adding a new `window.jfLib` key is safe. Changing an existing key's shape in place is not.**

Backwards compatibility on this surface has two axes, and only one of them is covered by semver:

- **Consumers** — builds that import the library need rebuilding. A major version bump handles this.
- **Coexistence** — older copies already deployed on the page keep running against the shared global.
  **A major version bump does nothing for this**, because the old code is already out there.

v3.0.0 (`60faa4c`) moved `experiments` from `JfSPA[]` to `{"1.0": JfSPA[]}`. It was correctly flagged
as breaking and correctly took the major bump — but that only addressed the first axis. Pre-3.0 copies
call `experiments.find(...)` directly, so as soon as a 3.x test initialised first on a shared page, the
older test threw `TypeError: window.jfLib.experiments.find is not a function` and died. Observed live
on GHD_013167.

Note the contrast within that same commit: `jfObservers`/`jfListeners`/`jfTimers` moved to **new** keys
under `jfLib`, so old copies kept reading their own flat globals and nothing collided. `experiments`
was the only key reshaped in place, and it was the only one that broke.

So: if a shared structure's shape must change, add a new key or mark the shape per-entry. Never re-key
the container.

## Considered options

- **Version-keyed container** (`{"1.0": [...]}`) — what 3.0.0 shipped. Rejected: crashes older copies,
  and splits the registry so nothing has a single view of the tests on the page. The version key also
  never earned its keep — `EXPERIMENTS_VERSION` was only ever `"1.0"`, with no version-negotiation code
  anywhere, and it isolates 3.x from a hypothetical v4 while doing nothing about v2, the version
  actually in the estate.
- **Array base with version buckets hung off it**, plus a `defineProperty` accessor to re-hang the
  buckets when a pre-3.0 destroy reassigns the array. Rejected: it works, but it is ~25 lines of
  coexistence scaffolding, and `experiments.find(...)` then silently misses 3.x tests instead of
  listing them — a quieter failure that is harder to debug than the crash it replaced.
- **Flat array + `details.schema`** — chosen. This was already the recommendation in `AUDIT.md`
  ("Version/capability-stamp the surface... rather than sniffing shapes") and was not taken at the time.

## Consequences

- Dedupe and destroy are cross-version, since both match on `details.id`. A pre-3.0 test and a 3.x test
  sharing an id will now block each other on setup, and a 3.x destroy will evict both **records**
  (records only — it does not touch the other copy's DOM, listeners, or observers). Duplicate ids on one
  page were always a bug; this surfaces it as a `Test already setup` warning instead of hiding it.
- Anything reading the registry must branch on `details.schema` before touching a field beyond
  `details.id`. Calling `.reset()` blind on a pre-3.0 entry will fail — it has no such method.
- **Every other `jfLib` key stays versioned.** Those were new keys in 3.0.0 and carry no coexistence
  risk. `experiments` is a deliberate exception, not an oversight — do not "tidy" it into line with its
  neighbours.
