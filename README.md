# Vibrum Guitars — Website

Live at [vibrumguitars.com](https://www.vibrumguitars.com)

Built with [Astro](https://astro.build). Deployed to GitHub Pages via GitHub Actions.

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

## Image guidelines

### Format and size

All photos must be **WebP** format at **quality 82**, maximum **1800 px on the longest edge**.

| Scenario | Why |
|---|---|
| WebP q82 | ~150–300 KB per photo vs 1–4 MB for PNG — same visual quality |
| 1800 px max | Covers 2× retina on gallery cards and the full-width modal view |
| No multiple sizes | Images in `public/` are served as-is; Astro cannot generate srcset for them |

Lazy loading is already implemented throughout — cover images, gallery cards, slideshow, and modal thumbnails all load on demand.

### Converting photos (macOS)

```bash
# One-time setup
brew install webp

# Run inside a guitar's image folder, e.g. public/images/guitars/pyrocaster/
for f in *.png; do cwebp -q 82 "$f" -o "${f%.png}.webp" && rm "$f"; done

# Do the same for public/images/slideshow/ and public/images/stories/
```

After converting, update the paths in the corresponding `.md` files (`.png` → `.webp`).

### GitHub Pages storage

GitHub recommends keeping repositories under 1 GB. At ~250 KB per WebP photo, 100 guitars × 35 photos ≈ 875 MB — right at the limit. If the collection grows past ~120 guitars, move image hosting to a CDN (Cloudinary free tier: 25 GB storage, zero config) and keep only markdown in this repo.

---

## Adding a new guitar

1. Create a new file in `src/content/guitars/your-guitar-name.md`
2. Add the guitar's images to `public/images/guitars/your-guitar-name/`
3. Fill in the frontmatter (all `specs` fields are optional):

```yaml
---
title: "Guitar Name"
type: "electric"          # electric | acoustic | bass | classical
status: "available"       # available | sold
strings: 6                # optional — defaults to 6
electronics: "passive"    # optional — passive | active
year: 2025
coverImage: "/images/guitars/your-guitar-name/photo-1.png"
images:
  - "/images/guitars/your-guitar-name/photo-2.png"
excerpt: "One-line teaser shown on the gallery card."
specs:
  materials:
    base: "Swamp Ash"
    top: "Spruce"           # acoustic tops
    neck: "Hard Maple"
    fretboard: "Indian Rosewood"
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
    pots: "CTS 500k audio"
    controls: "Master volume, master tone, 5-way selector"
    switch: "Oak Grigsby 5-way"
    tuners: "Gotoh SD90 locking"
    strap_locks: "Dunlop Straploks"
    output: "Switchcraft mono jack"
    finish: "Nickel"
---

Full description of the guitar in markdown here.
```

4. Push to `main` — the guitar appears in the Gallery automatically.

---

## Adding a story / update

1. Create a new file in `src/content/stories/YYYY-MM-title.md`
2. Add any images to `public/images/stories/your-story-name/`
3. Fill in the frontmatter:

```yaml
---
title: "Story title"
date: 2025-06-01
coverImage: "/images/stories/your-story/hero.png"
guitar: "guitar-slug"     # optional — links to a guitar entry
tags: ["build diary", "electric"]
excerpt: "Short teaser shown on the home page card."
draft: false
---

Story content in markdown here.
```

4. Push to `main` — the story appears on the home page sorted by date.

Set `draft: true` to commit without publishing.

---

## Editing the hero show

The homepage hero rotates through background slides driven by JSON files in `src/content/slides/`. Each file (`01.json`, `02.json`, …) is one slide, sorted by filename.

```json
{
  "src": "/images/slideshow/your-image.png",
  "alt": "Optional image alt text",
  "caption": "Pyrocaster · 2024",
  "detail": "Electric · Built to last a lifetime",
  "url": "/gallery#guitar-pyrocaster"
}
```

`alt`, `caption`, `detail`, and `url` are optional. `caption`/`detail` appear bottom-right of the hero while that slide is showing; `url` turns the caption into a link. Add the image to `public/images/slideshow/` and create a new numbered JSON file to add a slide.

The hero's fixed copy (headline, lead, CTAs, availability line) and the stats band live in `src/components/HeroShow.astro`. The instrument count in the stats band is computed from the guitars collection.

---

## Project structure

```
src/
  content/
    guitars/      ← one .md file per guitar
    stories/      ← one .md file per story/update
    slides/       ← one .json file per slideshow slide
    config.ts     ← collection schemas
  layouts/
    BaseLayout.astro    ← <html>, <head>, fonts, meta
    PageLayout.astro    ← nav + footer wrapper
  components/
    Nav.astro
    Footer.astro
    GuitarCard.astro    ← gallery grid card
    GuitarModal.astro   ← guitar detail overlay
    GuitarStrip.astro   ← horizontal guitar strip on home
    HeroShow.astro      ← hero show (rotating slides + stats band)
    SpecTable.astro     ← guitar specs table
    WorkshopStoryCard.astro  ← story card on home
  pages/
    index.astro         ← home (hero, guitars, stories, newsletter)
    gallery/
      index.astro       ← gallery (all guitars)
      [slug].astro      ← guitar detail page
    stories/
      [slug].astro      ← story detail page
    about.astro
    contact.astro
  styles/
    global.css
public/
  images/
    guitars/            ← guitar images, one subfolder per guitar
    stories/            ← story images
    about/              ← about page photos
    slideshow/          ← hero slideshow images
    og-logo.png         ← Open Graph share image
    bimi-logo.svg       ← BIMI logo for email clients
  fonts/
  favicon/              ← all sizes + site.webmanifest
  CNAME                 ← custom domain for GitHub Pages
```
