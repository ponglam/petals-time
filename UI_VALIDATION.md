# PETALS studio UI validation — 2026-09-30

## Scope and source

Target: `_AI/_ASTRA/_07_TheSlience`. Visual reference: `_AI/_ASTRA/_geo_art`.
The initially mentioned `_OPUS/_06_petals_time_now` and the discovered `_06_petals_time_prev` were not modified or used as the application source.

The target's own latest release, `versions/0.6.0/index.html`, supplies the engine and UI behavior. The engine section was extracted without edits into `studio/src/renderer.js`. All released versions remain untouched; the original root router and edited documentation are backed up in `backups/ui-before-geo-20260930/`.

## Aligned rules

- Cormorant Garamond Regular 400, locally served, serif heading and body, small tracked section labels.
- Paper #eae7df, ink #252c29, fine #cecec3 dividers, rust #ae4b31 accents. Muted text uses the reference's darker lede color #62695f for readability.
- 88px header, 4% outer margin, three-column origin / canvas / impression hierarchy, restrained portrait shadow, flat rectangular controls, underlined inputs.
- Shared spacing and semantic color tokens, reusable button/input/panel/disclosure classes, no copied cascade of CSS overrides.
- Two columns on intermediate screens; single column on phones. Controls have a 44px minimum target, focus rings, hover/pressed/disabled/busy states. Optional studio controls collapse below the artwork.
- Paper is the default. PETALS atmosphere, explicit dark and system appearance remain available without entering artwork identity.

## PETALS preserved

900×1200 canvas, WebGL2 shaders, genome, seed mapping, six style families plus mixed family, birth-time anchor, playback pace, daily steps, material controls, PNG and identity JSON exports. Renderer version stays 0.6.0.

The default timeline spans canonical days 5476–9126 (±5 years around day 7301). It does not squeeze the old 40-year development curve into ten years. Full ±20 years remain selectable. URL state retains exact age/seed/family/birth; older links continue to use frozen versions. New `ui=geo` links select the refreshed UI. Out-of-window saved moments expand the visible window instead of changing the saved age.

## Verified

Automated local Chrome / WebGL2 test (`tests/ui-smoke.cjs`):

- Exact same-browser PNG pixel equality between original 0.6.0 and new studio for seed G3 / family 2 / Now.
- Distinct past/future frames; exact return to Now after reverse and out-of-order scrubbing.
- Visible endpoints, day stepping, Shift + arrow years, pointer scrub, play/pause, and ±20-year availability.
- Birthday 2000-01-01 at 12:34 reproduces the original birth seed.
- Paper/tint/dark/system changes leave artwork pixels unchanged.
- Family and material controls affect output; reset restores it and preserves the seed field.
- PNG and JSON downloads; JSON seed and renderer version verified.
- Old version routing and same-page hash identity restoration.
- No horizontal overflow at 320, 390, 640, 768, 1024 or 1440 CSS pixels, with the tuning panel open.
- No uncaught page errors.

Desktop and mobile screenshots were visually reviewed. The full browser suite passed through an HTTP localhost preview and again through the installed project’s direct `file://` root index.html. The installed project is also served at http://127.0.0.1:8792/ for review. All three archived HTML files were byte-compared with the inspected originals after installation; the extracted renderer section also matches exactly.

## Limits

Browser validation uses installed Chrome on this Mac. Safari, Firefox, physical iOS/Android devices and cross-GPU pixel equality were not tested. The existing renderer's GPU support/performance requirements remain. Archived HTML files retain their original UI and remote-font behavior. No publication or GitHub changes were made.
