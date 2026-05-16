# Inkpen — Documentation Index

What lives where in `docs/`. This is the consumer-facing surface of the
gem; agent-driven planning lives in `02-addons/107-inkpen-docs/`.

## Start here

| Doc | Purpose |
| --- | --- |
| `../README.md` | Repo overview, installation, configuration, public events, extensions, Stimulus contract. Read first. |
| `../CLAUDE.md` | Project rules for AI agents working in this codebase. Patterns + dev workflow + bundle workflow. |
| `CHANGELOG.md` | Release notes. |
| `ROADMAP.md` | Inkpen's own roadmap (legacy / consumer-facing scope). See also the InventList-side planning surface at `02-addons/107-inkpen-docs/ROADMAP.md`. |
| `FEATURES.md` | List of editor features. |
| `VISION.md` | Vision/positioning. |

## Audits (signed, point-in-time)

| Doc | Purpose |
| --- | --- |
| `audits/2026-05-08-markdown-boundary-audit.md` | Short verdict — was Inkpen ready to be a markdown-native editor for Nodepad? (Spoiler: no, at the time.) |
| `audits/2026-05-08-markdown-boundary-and-load-shape.md` | Long audit with full work plan, scoped to: regex importer, eager load shape, event-name mismatch, no JS test harness. Drove specs 01–04. |

## Planning docs (legacy / mixed)

| Doc | Purpose |
| --- | --- |
| `plans/MARKDOWN_MODE.md` | Markdown-mode planning notes (largely superseded; see audit findings). |
| `decisions/` | Architectural decisions captured at the time of writing. |
| `extensions/` | Per-extension notes. |
| `thinking/` | Earlier brainstorming. |

## Where the canonical "current state" lives

For shipped contracts and current behavior, the README is authoritative
(events table, CSS stylesheet caveat, extension-gating notes — all in
`../README.md`).

For aspirational planning, current scope, parked/deferred specs, and
release process, the InventList-side planning surface is canonical:

```
02-addons/107-inkpen-docs/
├── ROADMAP.md
├── INDEX.md
├── plans/
│   ├── 01-markdown-roundtrip-fidelity.md        (parked)
│   ├── 02-lazy-load-and-extension-gating.md     (deferred)
│   ├── 04-public-api-and-docs-hardening.md      (in flight)
│   └── 05-vendor-bundle-cdn-decoupling.md       (✓ shipped + verified)
├── sessions/
├── handoffs/
└── docs/release-process.md
```

If a fact in this gem's `docs/` directory disagrees with one in
`107-inkpen-docs/`, the more recent timestamp wins (and the older one
should be updated to match).
