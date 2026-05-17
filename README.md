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

## Editing the hero slideshow

The homepage slideshow is driven by JSON files in `src/content/slides/`. Each file (`01.json`, `02.json`, …) is one slide, sorted by filename.

```json
{
  "src": "/images/slideshow/your-image.png",
  "text": "Line one\nLine two.",
  "button": {
    "label": "View Gallery →",
    "url": "/gallery"
  }
}
```

`text` and `button` are optional. Add the image to `public/images/slideshow/` and create a new numbered JSON file to add a slide.

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
    Slideshow.astro     ← hero slideshow
    SpecTable.astro     ← guitar specs table
    StoryCard.astro
  pages/
    index.astro         ← home (story feed + slideshow)
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
