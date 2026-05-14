# Inkpen importmap — single vendored bundle, no third-party CDN.
#
# Before 0.8.0 this file pinned ~70 modules to a third-party module CDN.
# Three production incidents on 2026-05-14 caused by CDN flakiness
# prompted vendoring everything into a single ESM bundle.
# Plan: 107-inkpen-docs/plans/05-vendor-bundle-cdn-decoupling.md
#
# The bundle is built from app/assets/javascripts/inkpen/index.js via
# `npm run build` and committed to the repo so consumers don't need to
# run the build themselves. Source map ships alongside for debugging.
#
# Host-provided externals (kept out of the bundle):
#   @hotwired/stimulus       — host registers controllers
#   @hotwired/turbo-rails    — host owns Turbo
#
# All other dependencies (TipTap@2.10.3, ProseMirror@1.x, lowlight,
# highlight.js, tippy.js, popperjs, linkifyjs, etc.) are inlined.

pin "inkpen", to: "inkpen.bundle.js"
