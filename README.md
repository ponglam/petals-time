# PETALS / TIME

A deterministic, browser-native living botanical artwork in WebGL2. One seed (or one birthday and birth time) defines an organism; a timeline from −20 years to +20 years reveals how it grows, opens, folds and remembers.

Open `index.html` in a browser. It opens the geo_art-aligned studio, or the frozen renderer named by an older versioned link. The studio defaults to −5y / Now / +5y; a time-window selector retains access to the full ±20-year lifespan.

```
_07_TheSlience/
├── index.html              version router (edit VERSIONS and LATEST when releasing)
├── PETALS_TIME_SPEC.md     spec, with section 53 describing these builds
├── CHANGELOG.md
├── DEMO.md                 ready-made demo links
├── publish_to_github.sh    one-time setup: git history with a tag per version, then push
├── references/             the six reference images
└── versions/
    ├── 0.4.0/index.html    first renderer
    ├── 0.5.0/index.html    gladiolus family
    └── 0.6.0/index.html    birthday seed (latest)
```

## Keeping past takes

1. Copy the newest folder: `cp -r versions/0.6.0 versions/0.7.0`
2. In the copy, change `RENDERER_VERSION` to `"0.7.0"` and make your changes there.
3. Add `"0.7.0"` to `VERSIONS` in `index.html` and set `LATEST = "0.7.0"`.
4. Add an entry to `CHANGELOG.md`.

Never edit an older folder after it is released. Every link and every saved identity (JSON)
records its renderer version, so it can always be reopened in the renderer that made it.

## Running locally

Each version is one self-contained HTML file and opens by double-clicking. For the router,
a local server is more reliable: run `python3 -m http.server` in this folder and open
`http://localhost:8000`. The current studio includes a local Cormorant Garamond font and works offline. Archived versions retain their original Google Fonts references.

## GitHub

First time, from inside this folder:

```
bash publish_to_github.sh                  # private repo named petals-time
bash publish_to_github.sh petals-time public
```

This creates one commit and one tag per released version (`v0.4.0`, `v0.5.0`, `v0.6.0`).
With the GitHub CLI (`gh`) logged in, it also creates the repository and pushes.
Without it, the script prints the two remaining commands.

For each later version, after releasing it as described above:

```
git add -A
git commit -m "PETALS / TIME 0.7.0: what changed"
git tag -a v0.7.0 -m "Renderer 0.7.0"
git push && git push --tags
```

### Live page with GitHub Pages
Repository → Settings → Pages → Build and deployment → Source: *Deploy from a branch*,
Branch: `main`, folder `/ (root)`. The site appears at
`https://YOUR-USERNAME.github.io/petals-time/`, and every version stays reachable through
the router. Pages on a private repository needs a paid GitHub plan; on a free plan the
repository must be public for Pages to work.


## Current studio (UI refresh, renderer still 0.6.0)

The new `studio/` is a UI-only layer over the exact original 0.6.0 renderer.
`versions/0.4.0/`, `0.5.0/`, and `0.6.0/` remain unchanged.

- `studio/styles/tokens.css`: geo_art-derived paper/ink/accent, Cormorant typography, spacing, control size and theme tokens.
- `studio/styles/components.css`: reusable buttons, inputs, panels, disclosure, focus, disabled and busy states.
- `studio/styles/studio.css`: three-column studio, responsive layouts, canvas, PETALS timeline and material tuning.
- `studio/src/renderer.js`: byte-for-byte extraction of the renderer section in `versions/0.6.0/index.html`; seed, grammar, shaders and rendering constants are unchanged.
- `studio/src/app.js`: existing UI behavior adapted to the new controls, bounded time window, local themes, hash navigation and export/loading/error feedback.
- `studio/fonts/`: Cormorant Garamond Regular and its OFL license, from geo_art.

The ±5-year window selects canonical days 5476–9126 around Now = 7301. It does **not** rescale morphology or change artwork identity. The original ±20-year range is available through the selector; old moments outside ±5 automatically open the wider window. Changing from ±20 to ±5 clamps the displayed moment to the nearest visible endpoint. Slider arrows step a day; Shift + arrows step a year; Home/End select the visible endpoints. Playback stops at the visible upper endpoint.

New studio URLs record `ui=geo` and `window=5|20` alongside the original identity parameters. Legacy `v=0.6.0` links without `ui=geo` still open the frozen original UI. The “Original studio” link preserves the currently selected seed, family, age and birth anchor.

Paper is the default geo_art appearance; Artwork tint retains PETALS' seed-derived atmosphere. Dark and System appearances preserve dark-mode access. Appearance is saved only in local browser storage and never changes rendering. Tune remains a local study control; exported JSON includes `studyTuning`, as before.

### Browser regression check

With Playwright and local Chrome available:

```sh
node tests/ui-smoke.cjs
```

If Playwright lives elsewhere, set `PLAYWRIGHT_MODULE` to its absolute module directory. To exercise a local server instead of double-click/file URLs, set `PETALS_BASE_URL=http://127.0.0.1:8000/`. The test compares new and original renderer pixels in the same browser, then checks timeline, birth identity, themes, exports, historical links and responsive layouts. See `UI_VALIDATION.md` for observed results and limits.
