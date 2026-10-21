# Vibrum Guitars — Website

Live at [vibrumguitars.com](https://www.vibrumguitars.com)

Built with [Astro](https://astro.build). Deployed to GitHub Pages via GitHub Actions.

---

## Contents

- [Getting started](#getting-started)
- [Adding content](#adding-content)
  - [1. Prepare the photos first](#1-prepare-the-photos-first)
    - [Format and size](#format-and-size)
    - [Filenames](#filenames)
    - [Converting (macOS)](#converting-macos)
    - [Thumbnails (guitar folders only)](#thumbnails-guitar-folders-only)
    - [Crop reference — where each photo gets cut](#crop-reference--where-each-photo-gets-cut)
    - [Storage ceiling](#storage-ceiling)
  - [2. Hero slides](#2-hero-slides)
    - [Slide photo geometry](#slide-photo-geometry)
  - [3. Guitars](#3-guitars)
    - [The routine, start to finish](#the-routine-start-to-finish)
    - [Frontmatter template](#frontmatter-template)
  - [4. Stories](#4-stories)
  - [5. Section background photos](#5-section-background-photos)
  - [6. About page](#6-about-page)
- [SEO](#seo)
- [Project structure](#project-structure)

---

## Getting started

Requires Node.js 22.12 or newer (Astro 7).

```bash
npm install
npm run dev       # local dev server at localhost:4321
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

Pushing to `main` triggers a GitHub Actions build ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) and deploys automatically. The repository's Pages source must be set to **GitHub Actions** (Settings → Pages → Build and deployment), not to a branch; the custom domain comes from `public/CNAME`.

Content is added as plain files (next section). Build before pushing: schema errors only surface in `npm run build`.

---

# Adding content

Four kinds of content, all edited as plain files — no CMS, no admin login:

| What | Where | Images go in |
|---|---|---|
| Hero slides | `src/content/slides/slide-N.json` | `public/images/slideshow/` |
| Guitars | `src/content/guitars/NNN-slug.md` | `public/images/guitars/<folder>/` |
| Stories | `src/content/stories/story-NNN.md` | `public/images/stories/story-NNN/` |
| Section backgrounds | drop the photo in its folder — see [Section background photos](#5-section-background-photos) | `public/images/backgrounds/<section>/` |

Astro validates every frontmatter field against the schemas in [src/content.config.ts](src/content.config.ts). A typo in a field name, a wrong type, or a missing required field **fails the build** — run `npm run build` before pushing and read the errors.

Broken image paths do *not* fail the build. They render as empty boxes. Check pages in `npm run dev` after adding photos.

---

## 1. Prepare the photos first

### Format and size

All photos: **WebP**, **quality 82**, max **1800 px on the longest edge**.

Aspect ratio is free everywhere except hero slides, which must be exactly **1800 × 1350 (4:3)** — see [Slide photo geometry](#slide-photo-geometry).

| Rule | Why |
|---|---|
| WebP q82 | ~150–300 KB per photo vs 1–4 MB for PNG/JPG — same visual quality |
| 1800 px max | Covers 2× retina on gallery cards and the full-width modal view |
| No multiple sizes | Files in `public/` are served as-is; Astro cannot generate `srcset` for them |

Lazy loading is already wired everywhere — cover images, gallery cards, slideshow, modal thumbnails.

### Filenames

Lowercase, hyphens, no spaces, no capitals, no `Screenshot 2026-03-30 at 22-35-20.png`.
Spaces become `%20` in URLs and break the shell one-liners below.

Guitar photo folders use `photo-1.webp … photo-N.webp`. **Order matters** — that is the order they appear in the modal, so number them in the sequence you want a visitor to see: full front shot first, then body, neck, headstock, hardware, back.

### Converting (macOS)

```bash
# One-time setup
brew install webp imagemagick

# Inside a photo folder — resize to 1800 px long edge and convert
for f in *.jpg *.JPG *.png *.PNG *.jpeg; do
  [ -e "$f" ] || continue
  magick "$f" -resize '1800x1800>' -quality 82 "${f%.*}.webp" && rm "$f"
done

# iPhone HEIC files
for f in *.HEIC *.heic; do
  [ -e "$f" ] || continue
  magick "$f" -resize '1800x1800>' -quality 82 "${f%.*}.webp" && rm "$f"
done

# Then rename to the photo-N convention
i=1; for f in $(ls *.webp | sort -V); do mv "$f" "photo-$i.tmp"; i=$((i+1)); done
for f in *.tmp; do mv "$f" "${f%.tmp}.webp"; done
```

Check the result before committing:

```bash
find public/images -name '*.webp' -size +400k    # anything listed is too big
find public/images -name '* *'                   # anything listed has a space in the name
```

### Thumbnails (guitar folders only)

The modal's thumbnail strip renders each photo at ~64 px on desktop and ~29 px on mobile, ten across. Serving 1800 px files there costs ~2.5 MB per modal open, so every guitar folder gets a `thumbs/` subfolder with 200 px copies (~8 KB each):

```bash
# Inside the guitar's photo folder, after the convert + rename above
mkdir -p thumbs
for f in photo-*.webp; do magick "$f" -resize '200x200>' -quality 75 "thumbs/$f"; done
```

Same filenames, same aspect ratio, no crop — [GuitarModal.astro](src/components/GuitarModal.astro) derives the thumb path from the full path (search for `thumbs/`), so **`.md` files never mention `thumbs/`**. A folder with no `thumbs/` still works: the strip 404s once per photo and falls back to the full file. Slow, not broken.

Only guitar folders need this. Slideshow, story, and about photos are never shown as thumbnails.

### Crop reference — where each photo gets cut

Every slot uses `object-fit: cover`, so the image is cropped to the slot's aspect ratio. Shoot or crop accordingly; the important part of the frame must survive.

| Slot | Ratio | Crop centre | Defined in (search for the rule) |
|---|---|---|---|
| Hero slide | full-bleed, 540–1050 px tall | `58% 45%` | [HeroShow.astro](src/components/HeroShow.astro), `.hero-slide img` |
| Gallery card | **9 / 16** (tall portrait) | centre | [GuitarCard.astro](src/components/GuitarCard.astro), `.guitar-card-image` |
| Home guitar strip card | **3 / 4** (portrait) | centre | [GuitarStrip.astro](src/components/GuitarStrip.astro), `.strip-card` |
| Story card | **16 / 10** (landscape) | centre | [WorkshopStoryCard.astro](src/components/WorkshopStoryCard.astro), `.workshop-card-media` |
| Story hero band | full-bleed, 420 px to 60 vh tall | `center 40%` | [stories/[slug].astro](src/pages/stories/[slug].astro), `.story-hero-img` |
| Guitar page photo grid | **1 / 1** (square) | centre | [guitars/[slug].astro](src/pages/guitars/[slug].astro), `.guitar-grid button` |
| About team portrait | **1 / 2** (very tall) | centre | [about.astro](src/pages/about.astro), `.team-photo-wrap` |
| Modal photo viewer | none — `object-fit: contain` | — | [GuitarModal.astro](src/components/GuitarModal.astro), `.modal-photo-img` |
| Modal thumbnail strip | none — uncropped, 10 across | — | [GuitarModal.astro](src/components/GuitarModal.astro), `.modal-thumbs` |

Practical consequence: a guitar's `coverImage` is shown at 9/16 and 3/4, so it must be a **vertical, full-instrument shot with the guitar centred**. A landscape cover image gets its neck and headstock cut off. The other `images` are shown uncropped in the modal and as square crops on the guitar's own page, so any orientation is fine there as long as the subject is near the centre.

### Storage ceiling

GitHub recommends keeping repos under 1 GB. At ~250 KB per WebP, 100 guitars × 27 photos ≈ 675 MB. Past ~120 guitars, move image hosting to a CDN (Cloudinary free tier: 25 GB, zero config) and keep only markdown here.

---

## 2. Hero slides

The homepage hero rotates through background slides driven by JSON files in [src/content/slides/](src/content/slides/). One file per slide, named `slide-1.json`, `slide-2.json`, … and shown in numeric order (`slide-10` comes after `slide-9`). Renumber the files to reorder.

```json
{
  "src": "/images/slideshow/pyrocaster-bench.webp",
  "alt": "Pyrocaster on the workbench under a window",
  "caption": "Pyrocaster · 2024",
  "detail": "Electric · Available",
  "url": "/guitars/pyrocaster/"
}
```

| Field | Required | Notes |
|---|---|---|
| `src` | yes | Path under `public/`, starts with `/images/slideshow/` |
| `alt` | no | Defaults to `""`. The hero is decorative, so empty is acceptable |
| `caption` | no | Small mono label, bottom-right of the hero |
| `detail` | no | Second caption line |
| `url` | no | Accepted by the schema but not rendered: captions are plain labels, not links |

Arrows and dots appear automatically once there is more than one slide.

The hero's fixed copy (headline, lead, CTA buttons) lives in the markup of [HeroShow.astro](src/components/HeroShow.astro) — edit it there, not in content files.

### Slide photo geometry

Export slides at **1800 × 1350 (4:3)**. This is the one place a specific aspect ratio is required, because the hero slot changes shape drastically between screens and the crop is unforgiving.

The slot is `clamp(540px, 100svh - nav height, 1050px)` tall by full viewport width (`.hero` in [HeroShow.astro](src/components/HeroShow.astro)) — roughly **2.3:1 on a wide desktop and 0.5:1 on a phone in portrait**. No source fits both, so a phone throws away roughly 64% of the frame's width. The figures below were worked out for an 820 px cap and remain a close guide. A taller source loses less of it:

| Source | Visible width on a 390 px phone | Box visible on *every* viewport |
|---|---|---|
| 16:9 — 1800 × 1013 | 41.6 – 69.9% | 387 × 584 px |
| 3:2 — 1800 × 1200 | 38.5 – 72.1% | 459 × 584 px |
| **4:3 — 1800 × 1350** | **36.1 – 73.9%** | **516 × 584 px** |

#### Where the subject goes

```
x:  0        400       731      1248    1500   1800
    ┌─────────────────────────────────────────────┐  y 0
    │  cropped off on every desktop and laptop    │
    ├─────────────────────────────────────────────┤  y 262  (19%)
    │ ░░░░░░░░░░░░░│                │             │
    │ ░ under the  │                │  DESKTOP    │
    │ ░ headline — │   SUBJECT      │  BRIGHT     │
    │ ░ shade is   │   ZONE         │  ZONE       │
    │ ░ 85–94%     │                │  cropped    │
    │ ░ black.     │   always       │  off on     │
    │ ░ Detail     │   visible,     │  phones     │
    │ ░ here is    │   every        │             │
    │ ░ invisible  │   viewport     │░░ caption ░░│  y ~930 (69%)
    ├──────────────┴────────────────┴─────────────┤  y 1030 (76%)
    │  cropped off on every desktop and laptop    │
    └─────────────────────────────────────────────┘  y 1350
                   ↑ 731         ↑ 1248
                   (41%)         (69%)
```

**Subject zone: x 731–1248, y 353–938** — 516 × 584 px. That rectangle is what every visitor sees on every screen. The guitar goes inside it. Its centre sits at 55% / 48% of the frame, which is where `object-position: 58% 45%` (`.hero-slide img`) points.

Three overlay constraints, all from the shade gradient (`.hero-shade` in [HeroShow.astro](src/components/HeroShow.astro)):

- **Left 42% of the frame** sits under `rgba(10,9,6,0.85–0.94)` — effectively black, because the headline is there. Whatever you put in it will not be seen. Unlit wall, shadow, dark bench.
- **Right of x 1260 (70%)** is where the shade thins to 12% and the photo reads brightest — but phones crop it off entirely. Atmosphere only: hanging clamps, a plane, the dim edge of a window. Never the subject.
- **Bottom-right, roughly x 1300–1600 / y 920–1030** is where the `caption` and `detail` text land in light type. Keep it dark and quiet. Wood grain is fine; a bright window is not.

Expose the whole frame **1 to 1.5 stops under** what you'd deliver as a normal photo. The shade only darkens — it cannot recover blown highlights, and the hero type is light on dark.

The Ken Burns animation (`hero-kb-*` keyframes in the same file) zooms 1.06–1.14× over 8 s and pans ±1.5%, direction varying by slide position. Its margin is already accounted for in the numbers above — no extra headroom needed.

#### Converting a slide

```bash
# Fills 1800x1350 and centre-crops the overflow
magick input.jpg -resize '1800x1350^' -gravity center -extent 1800x1350 \
  -quality 82 public/images/slideshow/your-slide.webp
```

`-gravity center` crops symmetrically. If the guitar is not already near the centre of your original, crop it to 4:3 by hand first — otherwise the subject drifts out of the safe box.

---

## 3. Guitars

### The routine, start to finish

Slug = the `.md` filename. Start it with the next running number (`001-zora`, `002-zora-sc`, `003-pyrocaster`, …): within the same `year`, the higher number sorts first on the gallery and the home strip. Lowercase, hyphens, no year in it. The guitar's page drops the number: `003-pyrocaster` publishes at `/guitars/pyrocaster/`. `SLUG=004-ironveil` below; change that one line and the rest is copy-paste.

**Step 1 — folder and raw photos**

```bash
SLUG=004-ironveil
mkdir -p public/images/guitars/$SLUG
# copy the raw camera files into that folder now, then:
cd public/images/guitars/$SLUG
```

**Step 2 — convert to WebP at 1800 px**

```bash
for f in *.jpg *.JPG *.jpeg *.JPEG *.png *.PNG *.HEIC *.heic; do
  [ -e "$f" ] || continue
  magick "$f" -resize '1800x1800>' -quality 82 "${f%.*}.webp" && rm "$f"
done
```

**Step 3 — order the photos, then rename**

Decide the sequence *before* renaming — it is the order the modal shows them in. `photo-1` must be the **vertical, full-instrument, centred** shot, because it becomes `coverImage` and gets cropped to 9/16 and 3/4. Then: body, neck, headstock, hardware, back.

```bash
i=1; for f in $(ls *.webp | sort -V); do mv "$f" "photo-$i.tmp"; i=$((i+1)); done
for f in *.tmp; do mv "$f" "${f%.tmp}.webp"; done
```

**Step 4 — thumbnails**

```bash
mkdir -p thumbs
for f in photo-*.webp; do magick "$f" -resize '200x200>' -quality 75 "thumbs/$f"; done
ls -S *.webp | head -3        # biggest originals — want under ~400 KB
cd -
```

**Step 5 — generate the `images:` list**

Don't type 27 paths. This prints the block, minus `photo-1` (that one goes in `coverImage`):

```bash
ls public/images/guitars/$SLUG/photo-*.webp | sort -V | tail -n +2 \
  | sed 's|^public|  - "|; s|$|"|'
```

**Step 6 — write `src/content/guitars/$SLUG.md`** using the template below, pasting that block under `images:`.

**Step 7 — check it**

```bash
npm run dev        # localhost:4321/gallery
```

Look at: card crop (headstock still attached?), modal photo order, specs table for blank rows, excerpt length on the card.

```bash
npm run build      # schema errors surface here
```

**Step 8 — commit both the content and the photos**

```bash
git add src/content/guitars/$SLUG.md public/images/guitars/$SLUG
git commit -m "Add $SLUG"
```

Push to `main` — it appears in the gallery automatically, newest first: `year` descending, and within the same year the higher filename number wins ([guitarOrder.ts](src/lib/guitarOrder.ts)). The home page strip picks up the 6 newest.

### Frontmatter template

```yaml
---
title: "Guitar Name"
type: "electric"          # electric | acoustic | bass | jazz
status: "available"       # available | unavailable — defaults to available; not displayed yet
year: 2025                # required, a number, not a string
strings: 6                # optional — for the strings filter, currently switched off (see Filters)
electronics: "passive"    # optional — passive | active; same, filter switched off
coverImage: "/images/guitars/your-guitar-name/photo-1.webp"
images:
  - "/images/guitars/your-guitar-name/photo-2.webp"
  - "/images/guitars/your-guitar-name/photo-3.webp"
excerpt: "One-line teaser shown on the gallery card."
specs:
  materials:
    top: "Spruce"                     # acoustic tops
    base: "Swamp Ash"
    neck: "Hard Maple"
    fretboard: "Indian Rosewood"
    headstock_top: "Ebony overlay"
    fretmarkers: "Pearloid dots"
    nut: "Bone, 42mm"
    frets: "Medium Jescar"
    details: "Cream ABS binding"
    finish: "Nitrocellulose"
  technical:
    body_shape: "Single-cut"
    scale: "25.5\""
    nut_width: "42mm"
    radius: "9.5\""
    neck_profile: "C-shape"
    frets: "22"
    weight: "3.2 kg"
  hardware:
    pickups: "Lollar Blackface (neck), Lollar Blonde (bridge)"
    bridge: "Wilkinson VS100N tremolo"
    tailpiece: "Aluminium stopbar"
    nut: "Graph Tech"
    pots: "CTS 500k audio"
    controls: "Master volume, master tone, 5-way selector"
    switch: "Oak Grigsby 5-way"
    tuners: "Gotoh SD90 locking"
    neck_plate: "Engraved steel"
    strap_locks: "Dunlop Straploks"
    output: "Switchcraft mono jack"
    finish: "Nickel"
---

Full description of the guitar in markdown here. This body text renders inside the
gallery modal, under the specs. A few paragraphs is right — why this build exists,
what the wood does, how it plays.
```

**Required fields:** `title`, `type`, `year`, `coverImage`, `excerpt`. Everything else is optional. Every `specs` field is optional and empty sections are skipped — only fill in what is true. Never invent specs to fill the table.

**Filters** in the gallery sidebar currently offer instrument type only: acoustic and electric. The checkbox groups for `status`, `strings` and `electronics`, and a `bass` checkbox, are in [gallery.astro](src/pages/gallery.astro) commented out (the `<aside class="filters">` block); uncomment one when there is something to filter, and add a checkbox for `jazz` if a jazz guitar is ever added. The filter script reads the `data-*` attributes on each card, so no other change is needed.

**Pages.** Every guitar has its own page at `/guitars/<slug>/`, the slug being the filename without its running number: `003-pyrocaster` → `/guitars/pyrocaster/` ([guitars/[slug].astro](src/pages/guitars/[slug].astro)). That is the address to share, link from slides and stories, and the one search engines index. It shows the cover, every other photo in a grid below it, the description, the spec table and every story that features the guitar under "Related stories"; each photo opens the same modal as the gallery, at that photo. Two guitars whose names differ only by the number would collide at the same URL, and the build stops with a message saying so. Gallery cards carry a "Details" link to the page, and the modal a "View more" link under the specs.

**Quick view in a new tab.** Gallery cards, the home strip cards and a story's "View <guitar>" buttons are links to the quick view, `#guitar-<slug>` on the page they sit on. A plain click opens the modal in place ([plainClick.ts](src/lib/plainClick.ts) decides which clicks to intercept); a middle-click, Cmd/Ctrl-click or "open in new tab" opens a new tab on that same page, where the modal opens from the hash on load. Either way the visitor sees the same thing.

**Deep links into the modal.** The gallery modal is the quick view. `/gallery#guitar-<slug>` (full slug, with the number, e.g. `/gallery#guitar-003-pyrocaster`) opens it on load; append `-pN` to open photo N (1-based): `/gallery#guitar-003-pyrocaster-p3`. The same hash works on the guitar's own page. The modal keeps the hash in sync while browsing photos, so the URL in the address bar is always shareable ([GuitarModal.astro](src/components/GuitarModal.astro)).

**Escaping.** Inch marks must be escaped inside double-quoted YAML: `scale: "25.5\""`. Apostrophes in `excerpt` and `title` are fine inside double quotes.

---

## 4. Stories

The full writing routine — collecting the notes, looking at every photo, captions, photo rows, verification — is the `new-story` skill in [.claude/skills/new-story/SKILL.md](.claude/skills/new-story/SKILL.md); in Claude Code, `/new-story` loads it. The essentials:

1. Create `src/content/stories/story-NNN.md` with the next number after the highest one present. **The filename is the URL slug** (`story-004.md` publishes at `/stories/story-004/`) and **the number is the publishing order**: the highest number is featured on the home page, the rest follow in descending order. The `date` is display only.
2. Put the photos in `public/images/stories/story-NNN/` as `photo-N.webp` (section 1 rules; no `thumbs/`).
3. Fill in the frontmatter:

```yaml
---
title: "Pyrocaster: Render to Reality"
date: 2025-12-12           # required — YYYY-MM-DD, unquoted; shown on cards and the story hero
coverImage: "/images/stories/story-003/photo-5.webp"
guitar: "003-pyrocaster"   # optional — one guitar id, or a list: ["001-zora", "002-zora-sc"]
category: build-diary      # optional — build-diary | in-the-wild | news | story; defaults to story
excerpt: "Short teaser shown on the home page and story cards, and used as the meta description."
draft: false
---

Story text in markdown. `##` headings render as section headings.

![Caption — what is in the frame](/images/stories/story-003/photo-1.webp)
```

4. Build, check (below), push to `main`.

**Where stories surface:**

- The **highest-numbered** story becomes the full-bleed "From the bench" feature band on the home page — its title, excerpt, and link. The band's background photo is *not* the story's `coverImage`; it comes from `public/images/backgrounds/home-bench/` (see [Section background photos](#5-section-background-photos)).
- All others fill the paginated "More from the workshop" grid — 6 per page desktop, 4 mobile.
- Each gets its own page at `/stories/story-NNN/`, and is listed under "Related stories" on the page of every guitar named in its `guitar:`.

**Photos in the story body.** Write each as `![caption](/images/stories/story-NNN/photo-N.webp)` directly after the paragraph it illustrates; the caption is the alt text and should say what is in the frame. The markdown plugin in [astro.config.mjs](astro.config.mjs) adds lazy loading and reads each WebP's pixel size from the file, so the page does not shift while photos load. Photos stay in the text flow on every screen size.

- **Rows.** Image lines on consecutive lines, with no blank line between them, render side by side, each as wide as its shape earns, so a landscape beside a portrait works. A blank line between images makes separate single photos. Never leave a portrait photo alone: pair it with another portrait or with a landscape. Phones stack rows of three or more.
- **Click.** Any photo opens the story's lightbox: previous/next, swipe, pinch to zoom, Escape or click outside to close. Each open pushes `#photo-N` to history, so a phone's back button closes the photo instead of leaving the story, and `/stories/story-NNN/#photo-5` deep-links to a photo.

Check the layout after a build:

```bash
node .claude/skills/new-story/scripts/photo-sizes.mjs public/images/stories/story-NNN          # sizes and orientation, for planning rows
node .claude/skills/new-story/scripts/photo-sizes.mjs --check dist/stories/story-NNN/index.html  # prints every row; fails if a portrait stands alone
```

**`guitar:`** is a guitar's filename without `.md` (`003-pyrocaster`), or a list of them for a story that covers several builds. The story page then gets a "Featured instrument" block ("Featured instruments" for several) with one **View <guitar title>** button per guitar. The button opens that guitar's own gallery, description and specs in the modal; the modal's "View more" link leads to the guitar's page. Story photos never go into the guitar's gallery. An id that matches no guitar does not fail the build: Astro prints an `Entry guitars → … was not found` warning and the block is left out, so read the build output.

**`category`** is display-only — no filtering exists. It renders uppercased with hyphens as spaces, as the mono kicker line on cards and the story hero: `DECEMBER 2025 · BUILD DIARY`. Values: `build-diary` (workshop build logs), `in-the-wild` (finished guitars out with players), `news` (announcements), `story` (anything else; the default).

**`coverImage`** is used two ways: the story card at 16/10 and the hero band of the story page, and as the Open Graph share image. Pick a landscape workshop frame with some atmosphere: the hero lays a dark shade and the title over the lower left, so a white-background render goes grey and flat there. A render belongs in the body as the first photo instead.

**`draft: true`** commits the file without publishing it — excluded from the home page, the guitar pages and `getStaticPaths`, so no page is generated.

---

## 5. Section background photos

Every section background is a **drop-in folder** under `public/images/backgrounds/` — one folder per section, one photo inside. The build ([src/lib/backgrounds.ts](src/lib/backgrounds.ts)) picks the first image file in the folder (alphabetical order), so swapping a background is a file operation, no code edit:

```bash
# Example: new photo for the home "More from the workshop" band
cp new-shot.webp public/images/backgrounds/home-workshop/
rm public/images/backgrounds/home-workshop/old-shot.webp
```

Any filename works (lowercase, no spaces — same rules as everywhere). Keep **one image per folder**: with several, the alphabetically first wins and the rest are dead weight shipped to the site. An **empty or missing folder fails the build** with a message naming the folder.

| Folder in `public/images/backgrounds/` | Where it shows | Crop centre | `object-position` lives in |
|---|---|---|---|
| `home-bench/` | Home — "From the bench" feature band | `center 40%` | [index.astro](src/pages/index.astro) |
| `home-guitars/` | Home — "Recent guitars" band | `center 30%` | [index.astro](src/pages/index.astro) |
| `home-workshop/` | Home — "More from the workshop" band | `center 62%` | [index.astro](src/pages/index.astro) |
| `home-stay-in-tune/` | Home — "Stay in tune" newsletter band | `center 55%` | [BenchLetter.astro](src/components/BenchLetter.astro) |

Not folder-driven: the link-preview (Open Graph) image stays `/images/og-default.png` — see [SEO](#seo).

Each background sits under a dark shade overlay with light text on top, so pick frames that are already dark, or at least busy-free where the text lands. Best backgrounds are **wide workshop/detail shots**, not full-instrument portraits: wood grain, tools on the bench, hands working, a body under a lamp. Full guitars get awkwardly cropped by the band heights.

Convert to WebP q82 / 1800 px like everything else (section 1). After swapping, check the section in `npm run dev` — if the subject sits wrong, adjust `object-position` in the `<style>` block of the file listed above.

---

## 6. About page

Copy and photos are both hardcoded in [about.astro](src/pages/about.astro):

- Three sections of prose — "The Story", "The Team", "The Work".
- Three team portraits at `/images/about/ProfilePhoto_0{1,2,3}.webp`, labelled Martin, Bratislav, Ognjen.

Portraits are cropped **1 / 2** — extremely tall. Supply vertical frames, subject centred, and update the `alt` text and `width`/`height` attributes if the source dimensions change.

---

## SEO

Everything a search engine or a link preview reads comes from two places: [src/lib/seo.ts](src/lib/seo.ts) (site constants, the Organization record, the Product builder) and [BaseLayout.astro](src/layouts/BaseLayout.astro) (the `<head>`). Pages pass `title`, `description`, optionally `ogImage` and a `schema` object; the layout does the rest.

**What every page gets:** `<title>`, meta description, canonical URL, Open Graph and Twitter card tags (with image size and alt), and a schema.org `Organization` record (name, logo, Belgrade address, email, phone, Instagram and Facebook) as JSON-LD.

**Per page:**

| Page | Extra structured data | Notes |
|---|---|---|
| Home | `WebSite` | Title and description are `SITE_DESCRIPTION` in seo.ts |
| Gallery | `CollectionPage` → `ItemList` | One entry per guitar, linking to its page. The meta description lists the guitar names. |
| Guitar | `Product` | Name, excerpt, every photo, type, woods, every spec row. Title and description come from the frontmatter `title` and `excerpt`; the cover is the link-preview image. |
| Story | `BlogPosting` + `article:published_time` | Headline, excerpt, cover + every body photo, date, the featured guitars as `about`. The cover is the link-preview image. |
| About / Contact | `AboutPage` / `ContactPage` | |
| Privacy, 404 | `noindex` | Privacy is also left out of the sitemap |

**Files:** `public/robots.txt` (allow all, sitemap pointer), `sitemap-index.xml` (generated by `@astrojs/sitemap` at build), `public/images/og-default.png` (link-preview image for pages without a photo, 1200×630; regenerate from the logo with `magick -size 1200x630 xc:'srgb(21,21,22)' \( public/images/og-logo.png -trim +repage -resize 420x420 \) -gravity center -composite PNG8:public/images/og-default.png`, or replace it with any 1200×630 PNG/JPG).

**Link previews for photos.** A page with a photo of its own (story, guitar) references it as `<photo>.preview.jpg`, and [ogPreviewImages.ts](src/integrations/ogPreviewImages.ts) renders that file into `dist/` after every build: a 1200×630 JPEG (LinkedIn and some mail clients do not show WebP), cropped when the photo is wide, or the whole photo on a blurred copy of itself when it is portrait, so a full-length guitar shot still shows the whole guitar. Nothing is written to `public/` and nothing is committed. To hand-craft one, put `photo-5.preview.jpg` next to `photo-5.webp` in `public/` and the build leaves it alone. `astro dev` does not render previews; they only resolve on a built site (`npm run build && npm run preview`).

**Writing for search:** keep meta descriptions and story excerpts under 160 characters; give every photo alt text that says what is in the frame; one `h1` per page.

**Checking a change:** build, then open a page from `dist/` in the [Rich Results Test](https://search.google.com/test/rich-results) or the [Schema Markup Validator](https://validator.schema.org/) by pasting the HTML. For link previews use [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/) once the page is live; it also clears Facebook's cache of an old preview.

**After publishing (one-time):** verify the domain in [Google Search Console](https://search.google.com/search-console) (DNS record, or drop the HTML verification file into `public/`), submit `https://www.vibrumguitars.com/sitemap-index.xml` there, do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters), and create a Google Business Profile for the workshop — for a local business that listing matters more than anything on the site.

**Contact details** (email, phone, social links) that appear in the structured data are in `CONTACT` in seo.ts. The contact page and footer still carry their own copies; change all three together.

---

## Project structure

```
.github/workflows/deploy.yml  ← build + deploy to GitHub Pages on every push to main
.claude/skills/new-story/     ← the story-writing routine (SKILL.md) and photo-sizes.mjs
astro.config.mjs              ← site URL, sitemap, the story-photo markdown plugin
src/
  content.config.ts   ← collection schemas — the source of truth for valid fields
  content/
    guitars/      ← one .md file per guitar: NNN-slug.md
    stories/      ← one .md file per story: story-NNN.md
    slides/       ← one .json file per hero slide: slide-N.json, numeric order
  layouts/
    BaseLayout.astro    ← <html>, <head>, fonts, meta, Open Graph, JSON-LD
    PageLayout.astro    ← nav + footer wrapper
  integrations/
    ogPreviewImages.ts  ← renders 1200×630 JPEG link-preview cards into dist/ after the build
  lib/
    seo.ts              ← site constants, Organization/WebSite records, Product builder, guitar URLs
    imageSize.ts        ← WebP/PNG pixel size from the file header (story photos, og:image)
    specLabels.ts       ← display labels for guitar types and spec fields
    guitarOrder.ts      ← newest-first sort
    backgrounds.ts      ← section background photo lookup
  components/
    Nav.astro
    Footer.astro
    HeroShow.astro           ← hero (rotating slides + fixed copy)
    GuitarCard.astro         ← gallery grid card (9/16)
    GuitarStrip.astro        ← horizontal guitar strip on home (3/4)
    GuitarModal.astro        ← guitar detail overlay + #guitar-<slug> deep links
    GuitarModalData.astro    ← the hidden <template> the modal reads (photos, specs, description)
    SpecTable.astro          ← guitar specs table (guitar page)
    WorkshopStoryCard.astro  ← story card (16/10)
    BenchLetter.astro        ← newsletter band (home page)
    PageLogoBg.astro         ← faint inline-SVG logo watermark
  pages/
    index.astro         ← home (hero, feature story, guitars, stories, newsletter)
    gallery.astro       ← all guitars + filters; details open in a modal
    guitars/
      [slug].astro      ← guitar page: /guitars/<slug without number>/
    stories/
      [slug].astro      ← story detail page
    about.astro
    contact.astro
    privacy.astro       ← privacy notice (noindex; linked from the contact + newsletter consent lines)
    404.astro
  styles/
    global.css
public/
  images/
    backgrounds/        ← section background photos, one folder per section,
                          ONE image per folder (any name) — see section 5
      home-bench/           home "From the bench" band
      home-guitars/         home "Recent guitars" band
      home-workshop/        home "More from the workshop" band
      home-stay-in-tune/    home "Stay in tune" newsletter band
    guitars/            ← one subfolder per guitar: photo-1…photo-N plus thumbs/
    stories/            ← one subfolder per story: story-NNN/photo-N.webp
    about/              ← team portraits
    slideshow/          ← hero slide images
    og-default.png      ← link-preview (Open Graph) image, 1200×630 — see SEO section
    og-logo.png         ← square logo, 1200×1200: Organization logo in structured data
                          (pngquant-crushed; original in originals/images/)
    og-logo.webp        ← same logo as WebP, for in-site use
    bimi-logo.svg       ← BIMI logo for email clients
  robots.txt            ← allows everything, points crawlers at the sitemap
  fonts/                ← TERMINAT.TTF (logo wordmark) — text fonts are self-hosted
                          via @fontsource packages, bundled at build (BaseLayout.astro)
  favicon.ico           ← 16/32/48 px, what browsers request by default
  favicon/              ← PNG sizes + site.webmanifest
  CNAME                 ← custom domain for GitHub Pages
```
