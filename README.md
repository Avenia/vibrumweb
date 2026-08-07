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
  - [7. Replacing the current placeholders](#7-replacing-the-current-placeholders)
- [Project structure](#project-structure)

---

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev       # local dev server at localhost:4321
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

Pushing to `main` triggers a GitHub Actions build and deploys automatically.

---

# Adding content

Four kinds of content, all edited as plain files — no CMS, no admin login:

| What | Where | Images go in |
|---|---|---|
| Hero slides | `src/content/slides/NN.json` | `public/images/slideshow/` |
| Guitars | `src/content/guitars/slug.md` | `public/images/guitars/slug/` |
| Stories | `src/content/stories/YYYY-MM-slug.md` | `public/images/stories/slug/` |
| Section backgrounds | drop the photo in its folder — see [Section background photos](#5-section-background-photos) | `public/images/backgrounds/<section>/` |

Astro validates every frontmatter field against the schemas in [src/content/config.ts](src/content/config.ts). A typo in a field name, a wrong type, or a missing required field **fails the build** — run `npm run build` before pushing and read the errors.

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

Same filenames, same aspect ratio, no crop — [GuitarModal.astro:676-678](src/components/GuitarModal.astro#L676-L678) derives the thumb path from the full path, so **`.md` files never mention `thumbs/`**. A folder with no `thumbs/` still works: the strip 404s once per photo and falls back to the full file. Slow, not broken.

Only guitar folders need this. Slideshow, story, and about photos are never shown as thumbnails.

### Crop reference — where each photo gets cut

Every slot uses `object-fit: cover`, so the image is cropped to the slot's aspect ratio. Shoot or crop accordingly; the important part of the frame must survive.

| Slot | Ratio | Crop centre | Defined in |
|---|---|---|---|
| Hero slide | full-bleed, 540–820 px tall | `58% 45%` | [HeroShow.astro:99-100](src/components/HeroShow.astro#L99-L100) |
| Gallery card | **9 / 16** (tall portrait) | centre | [GuitarCard.astro:48](src/components/GuitarCard.astro#L48) |
| Home guitar strip card | **3 / 4** (portrait) | centre | [GuitarStrip.astro:121](src/components/GuitarStrip.astro#L121) |
| Story card | **16 / 10** (landscape) | centre | [WorkshopStoryCard.astro:53](src/components/WorkshopStoryCard.astro#L53) |
| Newsletter band photo | **16 / 10** | centre | [BenchLetter.astro:287](src/components/BenchLetter.astro#L287) |
| About team portrait | **1 / 2** (very tall) | centre | [about.astro:196](src/pages/about.astro#L196) |
| Modal photo viewer | none — `object-fit: contain` | — | [GuitarModal.astro:150](src/components/GuitarModal.astro#L150) |
| Modal thumbnail strip | none — uncropped, 10 across | — | [GuitarModal.astro:657-688](src/components/GuitarModal.astro#L657-L688) |

Practical consequence: a guitar's `coverImage` is shown at 9/16 and 3/4, so it must be a **vertical, full-instrument shot with the guitar centred**. A landscape cover image gets its neck and headstock cut off. The other `images` are only ever shown uncropped in the modal, so any orientation is fine there.

### Storage ceiling

GitHub recommends keeping repos under 1 GB. At ~250 KB per WebP, 100 guitars × 27 photos ≈ 675 MB. Past ~120 guitars, move image hosting to a CDN (Cloudinary free tier: 25 GB, zero config) and keep only markdown here.

---

## 2. Hero slides

The homepage hero rotates through background slides driven by JSON files in [src/content/slides/](src/content/slides/). One file per slide, **sorted by filename** — so `01.json`, `02.json`, `03.json` … Renumber the files to reorder.

```json
{
  "src": "/images/slideshow/pyrocaster-bench.webp",
  "alt": "Pyrocaster on the workbench under a window",
  "caption": "Pyrocaster · 2024",
  "detail": "Electric · Available",
  "url": "/gallery#guitar-pyrocaster"
}
```

| Field | Required | Notes |
|---|---|---|
| `src` | yes | Path under `public/`, starts with `/images/slideshow/` |
| `alt` | no | Defaults to `""`. The hero is decorative, so empty is acceptable |
| `caption` | no | Small mono label, bottom-right of the hero |
| `detail` | no | Second caption line |
| `url` | no | Turns the caption into a link |

Arrows and dots appear automatically once there is more than one slide.

The hero's fixed copy (headline, lead, CTA buttons) lives in [HeroShow.astro:25-36](src/components/HeroShow.astro#L25-L36) — edit it there, not in content files.

### Slide photo geometry

Export slides at **1800 × 1350 (4:3)**. This is the one place a specific aspect ratio is required, because the hero slot changes shape drastically between screens and the crop is unforgiving.

The slot is `clamp(540px, 100svh - 70px, 820px)` tall by full viewport width ([HeroShow.astro:4](src/components/HeroShow.astro#L4)) — that is **2.34:1 on a 1920 desktop and 0.5:1 on a phone in portrait**. No source fits both, so a phone throws away roughly 64% of the frame's width. A taller source loses less of it:

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

**Subject zone: x 731–1248, y 353–938** — 516 × 584 px. That rectangle is what every visitor sees on every screen. The guitar goes inside it. Its centre sits at 55% / 48% of the frame, which is where `object-position: 58% 45%` ([HeroShow.astro:100](src/components/HeroShow.astro#L100)) points.

Three overlay constraints, all from the shade gradient at [HeroShow.astro:89-96](src/components/HeroShow.astro#L89-L96):

- **Left 42% of the frame** sits under `rgba(10,9,6,0.85–0.94)` — effectively black, because the headline is there. Whatever you put in it will not be seen. Unlit wall, shadow, dark bench.
- **Right of x 1260 (70%)** is where the shade thins to 12% and the photo reads brightest — but phones crop it off entirely. Atmosphere only: hanging clamps, a plane, the dim edge of a window. Never the subject.
- **Bottom-right, roughly x 1300–1600 / y 920–1030** is where the `caption` and `detail` text land in light type. Keep it dark and quiet. Wood grain is fine; a bright window is not.

Expose the whole frame **1 to 1.5 stops under** what you'd deliver as a normal photo. The shade only darkens — it cannot recover blown highlights, and the hero type is light on dark.

The Ken Burns animation ([HeroShow.astro:62-80](src/components/HeroShow.astro#L62-L80)) zooms 1.06–1.14× over 8 s and pans ±1.5%, direction varying by slide position. Its margin is already accounted for in the numbers above — no extra headroom needed.

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

Slug = the `.md` filename = the URL fragment. Lowercase, hyphens, no year in it. `SLUG=ironveil` below; change that one line and the rest is copy-paste.

**Step 1 — folder and raw photos**

```bash
SLUG=ironveil
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

Push to `main` — it appears in the gallery automatically, sorted by `year` descending. The home page strip picks up the 6 newest.

### Frontmatter template

```yaml
---
title: "Guitar Name"
type: "electric"          # electric | acoustic | bass | classical
status: "available"       # available | sold  — defaults to available
year: 2025                # required, a number, not a string
strings: 6                # optional — drives the gallery filter (4/5/6/7)
electronics: "passive"    # optional — passive | active
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

**Filters** in the gallery sidebar read `status`, `type`, `strings`, `electronics` ([gallery.astro:38-91](src/pages/gallery.astro#L38-L91)). Omit `strings` or `electronics` and the guitar simply won't match those filters. Note `type: "classical"` is valid in the schema but has **no filter checkbox** — add one in [gallery.astro:48-62](src/pages/gallery.astro#L48-L62) if a classical guitar is ever added.

**Deep links.** There are no per-guitar pages — guitars open in a modal on the gallery page. Link to one with `/gallery#guitar-<slug>`, e.g. `/gallery#guitar-pyrocaster`. Append `-pN` to open a specific photo: `/gallery#guitar-pyrocaster-p3` opens photo 3 (1-based). The modal opens on load from that hash and keeps the hash in sync while browsing photos, so the URL in the address bar is always shareable ([GuitarModal.astro:724-739](src/components/GuitarModal.astro#L724-L739)). Use this in slide `url` fields and in story text.

**Escaping.** Inch marks must be escaped inside double-quoted YAML: `scale: "25.5\""`. Apostrophes in `excerpt` and `title` are fine inside double quotes.

---

## 4. Stories

1. Create `src/content/stories/YYYY-MM-title.md`. The date prefix keeps the folder readable; **the filename is also the URL slug**, so `2025-11-driftwood-om-complete.md` publishes at `/stories/2025-11-driftwood-om-complete`.
2. Put any images in `public/images/stories/your-story/` (create the folder — it doesn't exist yet), or reuse a guitar's photos.
3. Fill in the frontmatter:

```yaml
---
title: "Driftwood OM: First Sound"
date: 2025-11-18           # required — YYYY-MM-DD, unquoted, parsed as a date
coverImage: "/images/stories/driftwood-om-first-sound/hero.webp"
guitar: "driftwood-om"     # optional — must match a guitar filename exactly
category: build-diary      # optional — build-diary | in-the-wild | news; defaults to build-diary
excerpt: "Short teaser shown on the home page card and used as the meta description."
draft: false
---

Story content in markdown here. `##` headings render as section headings.

![The braced spruce top before closing](/images/stories/driftwood-om-first-sound/bracing.webp)

Markdown images become the story's photos — see below.
```

4. Push to `main`.

**Where stories surface:**

- The **newest** story (by `date`) becomes the full-bleed "From the bench" feature band on the home page — its title, excerpt, and link. The band's background photo is *not* the story's `coverImage`; it comes from `public/images/backgrounds/home-bench/` (see [Section background photos](#5-section-background-photos)).
- All others fill the paginated "More from the workshop" grid — 6 per page desktop, 4 mobile.
- Each gets its own page at `/stories/<slug>`.

**Photos in the story body.** Drop plain markdown images between paragraphs: `![alt text](/images/stories/your-story/photo.webp)`. Lazy loading is added automatically. How they render:

- **Phones** — full-width, in the text flow, exactly where you placed them.
- **Desktop (≥ 768 px)** — pulled out of the text into the right-hand photo column next to the article, in document order.
- **Click** — if the story has a `guitar:`, any photo opens the guitar modal on that photo (story photos are appended to the guitar's own photo list). Without a `guitar:`, a built-in lightbox opens with prev/next arrows.

Place each image after the paragraph it belongs to, not mid-sentence. No `thumbs/` needed for story folders.

**`guitar:`** must match a guitar's filename without `.md`. If it matches, the story page gets a "Featured instrument" panel with a **View all photos** button that opens the full guitar modal — specs, description, and every photo — and the story's own photos become clickable into that same modal. The schema uses a plain string, not an Astro `reference()`, so a **misspelled slug does not fail the build** — the panel is silently omitted. Open the story page and confirm the button is there.

**`category`** is display-only — no filtering exists. It renders uppercased with hyphens as spaces, as the mono kicker line on cards and the story hero: `SEPTEMBER 2025 · BUILD DIARY`. Three values: `build-diary` (workshop build logs), `in-the-wild` (finished guitars out with players), `news` (announcements).

**`coverImage`** is used two ways: story card at 16/10, and the Open Graph share image for the story's page. Pick a landscape frame that reads at both.

**`draft: true`** commits the file without publishing it — excluded from the home page, the story list, and `getStaticPaths`, so no page is generated.

---

## 5. Section background photos

Every section background is a **drop-in folder** under `public/images/backgrounds/` — one folder per section, one photo inside. The build ([src/lib/backgrounds.ts](src/lib/backgrounds.ts)) picks the first image file in the folder (alphabetical order), so swapping a background is a file operation, no code edit:

```bash
# Example: new photo for the contact page header
cp new-shot.webp public/images/backgrounds/contact/
rm public/images/backgrounds/contact/old-shot.webp
```

Any filename works (lowercase, no spaces — same rules as everywhere). Keep **one image per folder**: with several, the alphabetically first wins and the rest are dead weight shipped to the site. An **empty or missing folder fails the build** with a message naming the folder.

| Folder in `public/images/backgrounds/` | Where it shows | Crop centre | `object-position` lives in |
|---|---|---|---|
| `home-bench/` | Home — "From the bench" feature band | `center 40%` | [index.astro](src/pages/index.astro) |
| `home-guitars/` | Home — "Recent guitars" band | `center 40%` | [index.astro](src/pages/index.astro) |
| `home-workshop/` | Home — "More from the workshop" band | `center 62%` | [index.astro](src/pages/index.astro) |
| `stay-in-tune/` | "Stay in tune" newsletter band — background. Same photo on **home, about, and contact pages** (shared component) | `center 55%` | [BenchLetter.astro](src/components/BenchLetter.astro) |
| `stay-in-tune-photo/` | "Stay in tune" band — the inset photo next to the copy (16/10 crop) | centre | [BenchLetter.astro](src/components/BenchLetter.astro) |
| `gallery-commissions/` | Gallery — "Commissions" CTA band | `center 32%` | [gallery.astro](src/pages/gallery.astro) |
| `contact/` | Contact — "Get in touch" page header | `center 40%` | [contact.astro](src/pages/contact.astro) |

Not folder-driven: the Open Graph share image stays `/images/og-logo.png` ([BaseLayout.astro:27](src/layouts/BaseLayout.astro#L27)).

The current files are `example-*` placeholders — replace them with real photos.

Each background sits under a dark shade overlay with light text on top, so pick frames that are already dark, or at least busy-free where the text lands. Best backgrounds are **wide workshop/detail shots**, not full-instrument portraits: wood grain, tools on the bench, hands working, a body under a lamp. Full guitars get awkwardly cropped by the band heights. The `stay-in-tune` band appears on more pages than any other background — worth a good workshop shot. The `stay-in-tune-photo` inset is the one non-background slot here: it's a framed photo next to the newsletter copy, cropped 16/10, so a person at the bench works well.

Convert to WebP q82 / 1800 px like everything else (section 1). After swapping, check the section in `npm run dev` — if the subject sits wrong, adjust `object-position` in the `<style>` block of the file listed above.

---

## 6. About page

Copy and photos are both hardcoded in [about.astro](src/pages/about.astro):

- Three sections of prose — "The Story", "The Team", "The Work" ([about.astro:18-90](src/pages/about.astro#L18-L90)).
- Three team portraits at `/images/about/ProfilePhoto_0{1,2,3}.webp`, labelled Martin, Bratislav, Ognjen ([about.astro:43-62](src/pages/about.astro#L43-L62)).

Portraits are cropped **1 / 2** — extremely tall. Supply vertical frames, subject centred, and update the `alt` text and `width`/`height` attributes if the source dimensions change.

---

## 7. Replacing the current placeholders

The repo currently ships placeholder content. Inventory as of this writing:

**Guitars** — 11 files in [src/content/guitars/](src/content/guitars/), but only 3 have real photo folders (`pyrocaster`, `ironveil`, `driftwood-om`, 27 `.png` each). The other 8 (`ashfall`, `cinderblock-5`, `fieldstone`, `greyline-bass`, `kewa`, `lowline-j`, `redgate`, `saltmarsh`) point their `coverImage` at those three folders. Delete the ones that aren't real instruments — an unbuilt guitar with borrowed photos is worse than an empty gallery.

**Stories** — 10 files, of which 3 are literal duplicates left over from testing and must be deleted:

```bash
rm "src/content/stories/2024-12-pyrocaster-build copy.md" \
   "src/content/stories/2025-03-ironveil-build copy.md" \
   "src/content/stories/2025-03-ironveil-build copy 2.md"
```

**Slideshow** — all 7 files are Instagram screenshots (`Screenshot 2026-03-30 at 22-35-20 Instagram.png`). Screenshots are the wrong resolution and wrong aspect for a full-bleed hero. Replace with originals, converted per section 1.

**Format** — every guitar and slideshow photo is still `.png`. Convert to `.webp` and update the paths in the `.md`/`.json` files. Sanity check after:

```bash
grep -rn '\.png' src/content/    # should match nothing
```

**Thumbnails** — no guitar folder has a `thumbs/` subfolder yet, so the modal strip is still falling back to full-size files. Backfill every folder in one pass once the photos are final:

```bash
for d in public/images/guitars/*/; do
  mkdir -p "$d/thumbs"
  for f in "$d"photo-*.webp; do
    [ -e "$f" ] || continue
    magick "$f" -resize '200x200>' -quality 75 "$d/thumbs/$(basename "$f")"
  done
done
```

---

## Project structure

```
src/
  content/
    guitars/      ← one .md file per guitar (filename = slug)
    stories/      ← one .md file per story (filename = slug)
    slides/       ← one .json file per hero slide, sorted by filename
    config.ts     ← collection schemas — the source of truth for valid fields
  layouts/
    BaseLayout.astro    ← <html>, <head>, fonts, meta, Open Graph
    PageLayout.astro    ← nav + footer wrapper
  components/
    Nav.astro
    Footer.astro
    HeroShow.astro           ← hero (rotating slides + fixed copy)
    GuitarCard.astro         ← gallery grid card (9/16)
    GuitarStrip.astro        ← horizontal guitar strip on home (3/4)
    GuitarModal.astro        ← guitar detail overlay + #guitar-<slug> deep links
    SpecTable.astro          ← guitar specs table
    WorkshopStoryCard.astro  ← story card (16/10)
    BenchLetter.astro        ← newsletter band (home, about, contact pages)
    PageLogoBg.astro         ← faint inline-SVG logo watermark
  pages/
    index.astro         ← home (hero, feature story, guitars, stories, newsletter)
    gallery.astro       ← all guitars + filters; details open in a modal
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
      stay-in-tune/         newsletter band background (home + about + contact)
      stay-in-tune-photo/   newsletter band inset photo
      gallery-commissions/  gallery "Commissions" CTA band
      contact/              contact page header
    guitars/            ← one subfolder per guitar, photo-1…photo-N
    stories/            ← story images (create as needed)
    about/              ← team portraits
    slideshow/          ← hero slide images
    og-logo.png         ← Open Graph share image (pngquant-crushed; original in originals/images/)
    og-logo.webp        ← same logo as WebP, for in-site use
    bimi-logo.svg       ← BIMI logo for email clients
  fonts/                ← TERMINAT.TTF (logo wordmark) — text fonts are self-hosted
                          via @fontsource packages, bundled at build (BaseLayout.astro)
  favicon/              ← all sizes + site.webmanifest
  CNAME                 ← custom domain for GitHub Pages
```
