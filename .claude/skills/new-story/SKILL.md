---
name: new-story
description: Write, restructure or polish a workshop story for the Vibrum Guitars site (a build diary, in-the-wild or news post in src/content/stories): file naming, frontmatter, section structure, photo captions, side-by-side photo rows, the featured-guitar link and build verification. Use this whenever the user wants to add, draft, write, polish or re-lay-out a story, caption or arrange story photos, or asks how stories, photo rows, the lightbox or the home page's From the bench section work, even when they only say "let's do the next story" or hand over notes in Serbian.
---

# New workshop story

Stories are Markdown files in `src/content/stories/`, rendered by `src/pages/stories/[slug].astro` with the schema in `src/content.config.ts`. This skill captures how the Pyrocaster story (`story-003.md`) was written and laid out, so the next one matches it without rediscovering the rules. Read that story once before writing a new one to pick up the register.

## Collect before writing

The user usually hands over notes, often in Serbian, plus a photo folder and a guitar entry. Get, or infer from the repo:

- **The guitar entry id**: the file name in `src/content/guitars/` without `.md`, for example `003-pyrocaster`. Its `specs` block is the source of truth for woods, hardware and measurements. Do not invent numbers, weights or durations that neither the notes nor the specs give.
- **The photo folder** under `public/images/stories/`. Photos must be WebP and are referenced by absolute path (`/images/stories/<folder>/photo-N.webp`), because the markdown plugin in `astro.config.mjs` reads each WebP's pixel size from the file and uses it for layout.
- **Who designed or commissioned the guitar**, with their Instagram handle. Credit them by link every time they are named, `[@handle](https://www.instagram.com/handle)`: links render in the accent colour, bare handles do not.
- **Title and date** if the user has them. Otherwise propose three to five titles in the form `Guitar name: Short arc` and let them choose. Keep "Build Diary" out of the title, since the category label already sits above it in the hero.

## Look at every photo first

Read each image with the Read tool, which renders it. Captions have to describe what is actually in the frame, and row planning needs each photo's orientation. For sizes and orientation in one list, run:

```
node .claude/skills/new-story/scripts/photo-sizes.mjs public/images/stories/<folder>
```

## File name and frontmatter

Name the file `story-NNN.md` with the next number after the highest one present. The number is the publishing order: the home page's From the bench section features the highest-numbered non-draft story and lists the rest below it. The `date` is display only. The photo folder may have any name, but for a new story make it match the file name.

```yaml
---
title: "Pyrocaster: From Render to Reality"
date: 2025-12-12
coverImage: "/images/stories/story-003/photo-20.webp"
guitar: "003-pyrocaster"
category: build-diary
excerpt: "One or two sentences. Shown on the home banner, on story cards and as the meta description."
draft: false
---
```

- `category` is one of `build-diary`, `in-the-wild`, `news`.
- `coverImage`: a landscape workshop shot with some atmosphere. The hero band lays a dark shade and the title over the lower left, so a white-background render or studio shot goes grey and flat there. A render belongs in the body as the first photo instead.
- `guitar` is optional: one id, or a list of ids for a story that covers more than one build, for example `guitar: ["001-zora", "002-zora-sc"]`. The page shows a "Featured instrument" block (or "Featured instruments" for several) with one "View <guitar title>" button per guitar, for example "View Pyrocaster". Each button opens that guitar's own gallery, description and specs. Story photos never go into that gallery; they open in the story's lightbox.

## Writing the body

Voice: first person plural, the workshop speaking. Short declarative sentences, concrete details, no marketing filler. English, whatever language the notes came in.

Structure the body with `##` headings in build order. The Pyrocaster story uses: The idea, From pixels to millimetres, Wood and routing, The neck and fingerboard, Small things, Finish, Strings on. Adapt the set to the build and merge any section that would be thin.

Points the user has asked for before, which apply to every story:

- Name what the build grew from early. For the Pyrocaster it was the Evertune bridge, and the hardware was chosen around it.
- Say who created the design, and that the collaboration ran through the whole build.
- Give weight to hand work and material choice: a single-piece body, how a top was selected, why a neck is laminated. Credit the CNC honestly for what it did (fret slots, pockets, engraving) and the bench for the rest.
- Describe body shapes neutrally, for example "a single-cutaway body", never by another maker's model name.
- Close with thanks to the designer and a link to the guitar in the gallery: `/gallery#guitar-<guitar id>`.

## Placing photos

Write each photo as `![caption](/images/stories/<folder>/photo-N.webp)` directly after the paragraph it illustrates. The caption is the alt text and should say what is in the frame, not repeat the paragraph.

**Rows.** Image lines written on consecutive lines, with no blank line between them, render side by side, each as wide as its shape earns, so a landscape beside a portrait works. A blank line between images makes separate single photos. Three in a row is fine on desktop; phones stack rows of three or more.

Rules the user has settled on:

- A landscape photo may stand alone. Never leave a portrait photo alone: pair it with another portrait or with a landscape.
- Keep photos in build order and use every photo in the folder unless told otherwise.
- The first photo is usually the render or the starting point, on its own.

## Verify

Run `npm run build`, then check three things:

1. The build prints no schema error and no `Entry guitars → ... was not found` warning for this story.
2. The photo layout is as planned. This prints each row and single, with dimensions, and fails if a portrait stands alone:

   ```
   node .claude/skills/new-story/scripts/photo-sizes.mjs --check dist/stories/story-NNN/index.html
   ```

3. The home page features the story if it carries the highest number: its title appears in the From the bench section of `dist/index.html`.

A running `astro dev` server does not always pick up new or renamed content files, especially after a build has run alongside it. Suggest restarting it before judging the result in the browser.

Do not commit unless asked.

## How the story page behaves

Useful when the user asks why something looks the way it does.

- Desktop: text and photos take the left three quarters, the featured-instrument block the right quarter behind a thin divider, sticky below the nav. Phones: a single column with the block after the text.
- Clicking a photo opens a lightbox with previous and next, swipe, Escape and click-outside to close. Each open pushes `#photo-N` to history, so the phone's back button closes the photo instead of leaving the story, and `/stories/story-NNN/#photo-5` deep-links to a photo.
- Single photos are capped at 58% of the viewport height on desktop; the photos in a row share one height.
- Links in the prose render in the accent colour with a thin underline, the same as in the guitar modal.
