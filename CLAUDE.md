# dx-lib (jf-lib)

dx-lib is a DOM manipulation and SPA lifecycle utility library used by Journey Further's DX team. It is imported in A/B test scripts as `jf-lib` and provides the standard vocabulary for all test code — both human-authored and AI-generated. Tests live in `jf-conversion/client-files/` and are plain JavaScript files that import named exports from this package.

**TypeDoc API reference:** https://journey-further.github.io/dx-lib/

---

## Module tiers

Use these tiers to decide what to reach for. Tier 1 covers the vast majority of test code.

### Tier 1 — Core (used in almost every test)

| Module | Purpose |
|--------|---------|
| `useSPA` | SPA test lifecycle: URL matching, apply/reset callbacks, DOM reset detection, CSS injection |
| `elementReady` | Run a callback each time an element matching a selector appears in the DOM |
| `insertStyle` | Inject a `<style>` tag — prefer the `style` option in `useSPA.init()` which auto-cleans |
| `emitEvent` | Dispatch a custom event; used for error tracking |
| `waitFor` | Poll a function until it returns truthy; short waits only (default 20 × 100ms) |

### Tier 2 — Common patterns

| Module | Purpose |
|--------|---------|
| `useMutationObserver` | Watch for DOM mutations; pooled and SPA-safe (prevents duplicate observers) |
| `waitForElement` | Promise-based element wait; use when you need `.then()`, otherwise prefer `elementReady` |
| `elementRemoved` | Callback when an element leaves the DOM; callback receives `parentElement` |
| `elementUpdated` | Callback when an element's content or attributes change |
| `useEventListener` | Managed `addEventListener` with cleanup; prevents duplicates on SPA re-init |
| `pushToDL` | Push an event object to the analytics data layer |

### Tier 3 — Situational

| Module | Purpose |
|--------|---------|
| `createElement` | Create an element with attributes and content in one call |
| `insertHTML`, `replaceHTML`, `emptyElem` | DOM content manipulation |
| `debounce`, `useSetTimeout` | Timing utilities |
| `generateId` | Generate a unique string ID |
| `getElementByText`, `queryAll`, `findParents` | Element selection helpers |
| `elementInView` | Check if an element is visible in the viewport |
| `isMobile`, `isTouchDevice`, `isIphone` | Device detection |
| `docReady` | Run a callback when the document is ready |
| `preventScroll`, `enableScroll` | Scroll locking |
| `listenForSwipe` | Detect swipe gestures |

### Tier 4 — Rarely needed

`getElementByXPath`, `getElementFromHtmlString`, `getLocaleFromUrl`, `getTimeTo`, `isOldSafari`, `isWtoPreview`, `isInDom`, `parseJsonToFormData`, `redirect`, `waitForNuxtStable` (Nuxt 2 SPAs only).

### Deprecated — do not use

| Module | Use instead |
|--------|-------------|
| `rbTest` | `useSPA` |

---

## Decision table

| I need to… | Use | Notes |
|------------|-----|-------|
| Apply changes when the URL matches a path | `useSPA` | Core of every SPA test. Handles apply/reset/re-init automatically. |
| Wait for an element to appear in the DOM | `elementReady` | Fires per element; always pass an `id` prefixed with the ticket ID |
| Inject test CSS | `useSPA` `style` option | Preferred — auto-removed on reset. Use `insertStyle` only for CSS that lives outside a test lifecycle |
| Watch for DOM mutations on an element | `useMutationObserver` | Pooled; prevents duplicate observers on SPA re-init |
| Poll until a JS condition is true | `waitFor` | Short waits only (max 20 × 100ms by default). Not for long-running conditions |
| Wait for an element — Promise-based | `waitForElement` | Use when you need `.then()`. Otherwise prefer `elementReady` |
| React when an element is removed | `elementRemoved` | Callback receives `parentElement` (the removed element is no longer in DOM) |
| React when element content changes | `elementUpdated` | Fires on attribute or subtree mutation |
| Add an event listener with cleanup | `useEventListener` | Always use instead of raw `addEventListener` — prevents duplicates on re-init |
| Push data to the analytics data layer | `pushToDL` | |
| Dispatch a custom event (e.g. errors) | `emitEvent` | Standard error pattern: `emitEvent("error", jfExperiment, e)` |

---

## Standard test pattern

This is the expected structure for an SPA A/B test. Reproduce this pattern unless the test has a specific reason to deviate.

```js
import { useSPA, elementReady, emitEvent } from "jf-lib";

const TICKET_ID = "CLI_012345";

const test = useSPA(TICKET_ID);

test.init({
  location: "/target-page",       // string, string[], or RegExp matched against pathname
  style: `
    .my-element { color: red; }
  `,
  apply: applyChanges,
  reset: resetChanges,
  screen: { minWidth: 768 },      // optional — omit if test applies to all screen sizes
});

function applyChanges() {
  try {
    elementReady(
      ".my-selector",
      (el) => {
        // modify el
      },
      `${TICKET_ID}--my-element`, // always prefix elementReady id with the ticket ID
    );
  } catch (e) {
    emitEvent("error", { ticketId: TICKET_ID }, e);
  }
}

function resetChanges() {
  // undo manual DOM changes here
  // do NOT remove the injected style — useSPA removes it automatically
}
```

**Rules visible in the pattern:**
- `id` params on `elementReady` (and any other id-accepting function) are always prefixed with the ticket ID to prevent collisions when multiple tests run on the same page
- Errors are caught and routed through `emitEvent` — never `console.error`
- The reset function does not touch `#TICKET_ID--style`

---

## Anti-patterns

| Do not… | Do this instead | Why |
|---------|-----------------|-----|
| Use `rbTest` | Use `useSPA` | `rbTest` is deprecated |
| Use `new MutationObserver(...)` directly | Use `useMutationObserver` | Raw observers are not tracked and leak on SPA page changes |
| Use `addEventListener` directly | Use `useEventListener` | Prevents duplicate listeners on SPA re-init |
| Manually remove `#TICKET_ID--style` in reset | Nothing — `useSPA` removes it | Double-removal causes a silent error |
| Use `waitForElement` for all element waits | Use `elementReady` for continuous watching, `waitForElement` when you need a Promise | `elementReady` survives SPA re-init; `waitForElement` does not |
| Use `waitFor` for long-running conditions | Use `elementReady` or `useMutationObserver` | `waitFor` exhausts after 20 attempts (2 seconds at default settings) |
| Use an `id` without a ticket prefix | Always prefix: `${TICKET_ID}--descriptor` | Unprefixed IDs cause callbacks to silently skip elements if another test claimed the same ID |

---

## Detailed API reference

Each exported function is documented on the [TypeDoc site](https://journey-further.github.io/dx-lib/). For the most commonly used functions, per-parameter detail is also in the Cursor rules at `jf-conversion/.cursor/rules/jf-lib/` — these are the authoritative API contracts used by the code review tool.

---

## Contributing

When adding a new module:
1. Add it to the appropriate tier table above
2. Add a row to the decision table if it fills a distinct scenario
3. Update the anti-patterns table if there is a wrong way to reach for it
4. Add a `.mdc` rule to `jf-conversion/.cursor/rules/jf-lib/` for code review coverage
