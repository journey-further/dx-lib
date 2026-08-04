# Context

Glossary for jf-lib. Terms only — no implementation detail. Decisions live in `adr/`.

## Build

A single deployed experiment's code, identified by a Campaign ID (`GHD_013167`, `ITC_013364`). Authored
in jf-conversion, published to a testing platform, and served as inlined JavaScript. A build is not a
package and cannot be patched centrally — changing one means finding and re-uploading it.

## Vendored copy

The copy of jf-lib inlined into a build at publish time, frozen at whatever version that build was
compiled against. Builds do not share a runtime dependency on the library; each carries its own. This is
why several versions of jf-lib execute on one page simultaneously.

## The estate

Every live build across all clients, taken together — and therefore every vendored copy of jf-lib still
executing in the wild. The estate is permanently heterogeneous: old builds keep running until someone
deliberately re-uploads them, so "the oldest version we support" is a fact about what was published, not
a policy anyone gets to choose.

## The host scope

The function scope inside a testing platform's own code that a build's bundle is pasted into. Ambient
globals are not guaranteed to be the browser's there — Webtrends' `OBF.js` shadows `console` with its
internal debug object, whose methods need their receiver. The library therefore cannot treat an ambient
global as a plain value: no detaching a method off it, no caching a reference to it.

## The registry

`window.jfLib.experiments` — the list of every test running on the current page. Shared by all vendored
copies on that page, so its entries have mixed shapes. See `adr/0001`.

## Consumer compatibility vs coexistence

Two distinct axes for any change to a `window.jfLib` shared surface:

- **Consumer compatibility** — whether builds that import the library still compile and behave. Broken
  by an API change; fixed by rebuilding; signalled by a major version bump.
- **Coexistence** — whether vendored copies *already deployed* still work alongside a newer copy on the
  same page. A version bump does nothing for it, because the old code is already published.

Conflating the two is what caused `adr/0001`.
