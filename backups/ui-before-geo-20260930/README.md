# PETALS / TIME

A deterministic, browser-native living botanical artwork in WebGL2. One seed (or one birthday and birth time) defines an organism; a timeline from −20 years to +20 years reveals how it grows, opens, folds and remembers.

Open `index.html` in a browser. It forwards to the newest renderer, or to the version named in the link.

```
_08_TheSlience/
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
`http://localhost:8000`. Fonts load from Google Fonts when online and fall back to system
serifs offline.

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
