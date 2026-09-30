# UI refresh — 2026-09-30

- New geo_art-aligned studio with shared design tokens and component styles; local Cormorant font.
- Original renderer 0.6.0 and every released HTML version preserved.
- Default ±5-year view, with full ±20-year access and unchanged canonical ages.
- Preserved birthday seed, botanical families, forward/backward steps, playback pace, study tuning, PNG/JSON exports, atmosphere and dark appearance.
- Added visible loading/busy/error states, 44px control targets, focus handling for all controls, and same-page hash navigation.
- Root router opens the studio by default and honors historical versioned links.

# PETALS / TIME — changelog

Each version is a frozen, self-contained file in `versions/<version>/index.html`.
Released versions are never edited. A new take starts as a copy of the newest folder.

## 0.6.0 — birthday seed
- Birthday + birth time now form the seed: minutes since 1900-01-01 (floating civil time),
  scrambled by a reversible 30-bit permutation, written as `B` + 6 Crockford base32 characters
  (1984-05-12 06:30 → `BXBAPAR`, 06:31 → `BCS0160`).
- Every minute from 1900 to 2100 has its own seed; no two minutes share one. Tested: 600,000
  consecutive minutes gave 600,000 distinct seeds; 200,000 random round trips gave 0 errors.
- Typing a `B…` seed fills the birthday and time back in. Neighbouring minutes grow unrelated organisms.
- Birthday still anchors Now on the timeline. "New organism" gives a random hex seed and clears the birthday.
- Family is not part of the birth seed, so the same minute can be seen in any family.

## 0.5.0 — gladiolus family
- Family selector (Mixed, or one of six reference families); family is part of identity and the URL.
- Gladiolus bloom family tuned to reference 03: raceme layout opening bottom-up, curling ruffled
  petals, silk striations, orange throat streaks, magenta centre bands, pale rims,
  teal→lavender ground, downward ghosts and bottom stem streaks.
- Default family: gladiolus bloom.

## 0.4.0 — first renderer
- WebGL2 renderer: petals as shape/density/fibre/vein/pigment fields, order-independent translucent
  accumulation with subtractive overlap, ghost layer (screen/multiply), temporal and long-memory
  samples, directional smear, optical blur, bloom, grain.
- Timeline −20y … Now … +20y (ageDays 1–14601, Now = 7301); daily playback at 6/12/24 days per second.
- Six style regions from the references, seeded genome, PNG and JSON export, Tune panel.
