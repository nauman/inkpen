# ADR-001: Use esm.sh Instead of jspm.io for TipTap/ProseMirror CDN

**Status:** Accepted
**Date:** 2026-02-15
**Decision makers:** @nauman

## Context

Inkpen uses TipTap (built on ProseMirror) as its rich text editor framework. These libraries are loaded via CDN through Rails importmap for browser-side ESM imports.

### The Problem

The editor stopped working in production with the following browser console error:

```
ReferenceError: Can't find variable: process
  at validation.ts:46
```

This error originated from TipTap modules loaded via jspm.io CDN. The root cause:

1. **jspm.io serves Node.js-compatible builds** - These builds assume a Node.js environment with `process.env` available
2. **Browsers don't have `process`** - The `process` global is a Node.js-specific API that doesn't exist in browsers
3. **TipTap's validation code references `process.env.NODE_ENV`** - This is common in development/production mode detection

### Attempted Solutions

1. **Polyfill approach (rejected)**: Adding `window.process = { env: { NODE_ENV: 'production' } }` to every layout file was considered but rejected because:
   - It's a hack that every host app would need to implement
   - It defeats the purpose of Inkpen being a drop-in replacement
   - It adds complexity to host app integration
   - It could conflict with other libraries' expectations

## Decision

**Switch from jspm.io to esm.sh for all TipTap/ProseMirror CDN imports.**

### Why esm.sh?

| Feature | jspm.io | esm.sh |
|---------|---------|--------|
| Browser polyfills | No - serves Node.js builds | Yes - automatically handles |
| `process.env` handling | Errors in browser | Shimmed automatically |
| Bundle option | No | Yes (`?bundle`) |
| Dependency resolution | Manual | Automatic via `?deps=` |
| TypeScript support | Limited | Full |
| ESM native | Yes | Yes |
| Reliability | Good | Excellent |

### Key esm.sh Features Used

1. **Automatic browser polyfills**: esm.sh automatically replaces Node.js globals with browser-compatible shims
2. **Dependency hints**: Using `?deps=@tiptap/core@2.10.3` ensures version alignment
3. **Bundle mode**: Using `?bundle` for packages with many sub-dependencies (like lowlight)

## Implementation

### Before (jspm.io)
```ruby
pin "@tiptap/core", to: "https://ga.jspm.io/npm:@tiptap/core@2.10.3/dist/index.js"
pin "prosemirror-state", to: "https://ga.jspm.io/npm:prosemirror-state@1.4.3/dist/index.js"
```

### After (esm.sh)
```ruby
pin "@tiptap/core", to: "https://esm.sh/@tiptap/core@2.10.3"
pin "prosemirror-state", to: "https://esm.sh/prosemirror-state@1.4.3"
```

### Files Changed

- `config/importmap.rb` - All TipTap, ProseMirror, and related package URLs updated

## Consequences

### Positive

1. **Editor works in browsers** - No more `process` errors
2. **No host app changes needed** - Inkpen remains a true drop-in replacement
3. **Cleaner URLs** - esm.sh URLs are simpler (no `/dist/index.js` suffix needed)
4. **Better dependency management** - esm.sh handles transitive dependencies better
5. **Future-proof** - esm.sh is actively maintained with good browser support

### Negative

1. **CDN dependency** - Still relies on third-party CDN (same as before)
2. **Potential cache invalidation** - Changing CDN means users re-download all packages (one-time cost)

### Neutral

1. **Performance** - Both CDNs have similar performance characteristics
2. **Version pinning** - Still using exact versions for reproducibility

## Alternatives Considered

### 1. Self-host the packages
- **Pros**: Full control, no external dependency
- **Cons**: Significant maintenance burden, larger gem size, harder updates
- **Verdict**: Rejected - too much overhead for a gem

### 2. Use unpkg.com
- **Pros**: Popular, simple URLs
- **Cons**: Doesn't handle Node.js polyfills, same `process` issue would occur
- **Verdict**: Rejected - doesn't solve the core problem

### 3. Use skypack.dev
- **Pros**: Browser-optimized
- **Cons**: Less maintained than esm.sh, fewer features
- **Verdict**: Considered but esm.sh preferred for better docs and features

## Related

- TipTap documentation: https://tiptap.dev
- esm.sh documentation: https://esm.sh
- ProseMirror: https://prosemirror.net

## Notes

When adding new TipTap extensions or ProseMirror packages in the future, always use esm.sh:

```ruby
# Pattern for TipTap packages
pin "@tiptap/extension-name", to: "https://esm.sh/@tiptap/extension-name@VERSION"

# Pattern for ProseMirror packages
pin "prosemirror-name", to: "https://esm.sh/prosemirror-name@VERSION"

# For packages with TipTap peer dependencies
pin "third-party-ext", to: "https://esm.sh/third-party-ext@VERSION?deps=@tiptap/core@2.10.3"

# For packages with many dependencies (bundle mode)
pin "complex-pkg", to: "https://esm.sh/complex-pkg@VERSION?bundle"
```
