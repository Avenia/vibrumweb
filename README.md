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
3. Fill in the frontmatter (all spec fields are optional):

```yaml
---
title: "Guitar Name"
type: "electric"          # electric | acoustic | bass | classical
status: "available"       # available | sold | in-progress | commission
year: 2025
coverImage: "/images/guitars/your-guitar-name/hero.webp"
images:
  - "/images/guitars/your-guitar-name/detail-1.webp"
excerpt: "One-line teaser for the gallery card."
specs:
  body:
    wood: "Mahogany"
    finish: "Nitrocellulose"
  neck:
    wood: "Hard Maple"
    scale: "24.75\""
    frets: 22
  hardware:
    tuners: "Gotoh 510"
    bridge: "TOM with stopbar"
  electronics:
    pickups: "Gibson '57 Classic"
    controls: "2x volume, 2x tone, 3-way toggle"
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
coverImage: "/images/stories/your-story/hero.webp"
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

## Project structure

```
src/
  content/
    guitars/      ← one .md file per guitar
    stories/      ← one .md file per story/update
  layouts/
    BaseLayout.astro    ← <html>, <head>, fonts, meta
    PageLayout.astro    ← nav + footer wrapper
  components/
    Nav.astro
    Footer.astro
    GuitarCard.astro
    StoryCard.astro
    SpecTable.astro
  pages/
    index.astro         ← home (story feed)
    gallery/
      index.astro       ← gallery (all guitars)
      [slug].astro      ← guitar detail
    stories/
      [slug].astro      ← story detail
    about.astro
    contact.astro
  styles/
    global.css
public/
  images/
    guitars/            ← guitar images, one subfolder per guitar
    stories/            ← story images
  fonts/
  favicon/
  CNAME
```
