import { defineCollection, z } from 'astro:content';

// Field order here is also the render order: zod rebuilds each object in schema
// key order, so SpecTable prints the rows in the sequence declared below.
const specsSchema = z.object({
  materials: z.object({
    top: z.string().optional(),
    // Acoustics: soundboard and bracing are usually quoted as one line
    top_and_bracing: z.string().optional(),
    base: z.string().optional(),
    back_and_sides: z.string().optional(),
    neck: z.string().optional(),
    fretboard: z.string().optional(),
    headstock_top: z.string().optional(),
    bridge: z.string().optional(),
    pickguard: z.string().optional(),
    // Acoustic bridge pins
    pins: z.string().optional(),
    fretmarkers: z.string().optional(),
    frets: z.string().optional(),
    details: z.string().optional(),
    nut: z.string().optional(),
    saddle: z.string().optional(),
    // When nut and saddle are cut from the same stock
    nut_and_saddle: z.string().optional(),
    binding: z.string().optional(),
    finish: z.string().optional(),
  }).optional(),
  technical: z.object({
    body_shape: z.string().optional(),
    scale: z.string().optional(),
    nut_width: z.string().optional(),
    radius: z.string().optional(),
    neck_profile: z.string().optional(),
    frets: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
  hardware: z.object({
    pickups: z.string().optional(),
    bridge: z.string().optional(),
    tailpiece: z.string().optional(),
    nut: z.string().optional(),
    pots: z.string().optional(),
    controls: z.string().optional(),
    switch: z.string().optional(),
    tuners: z.string().optional(),
    neck_plate: z.string().optional(),
    strap_locks: z.string().optional(),
    output: z.string().optional(),
    finish: z.string().optional(),
  }).optional(),
}).optional();

const guitars = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['electric', 'acoustic', 'bass', 'jazz']),
    status: z.enum(['available', 'unavailable']).default('available'),
    year: z.number(),
    strings: z.number().optional(),
    electronics: z.enum(['active', 'passive']).optional(),
    coverImage: z.string(),
    images: z.array(z.string()).default([]),
    specs: specsSchema,
    excerpt: z.string(),
  }),
});

const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    coverImage: z.string(),
    guitar: z.string().optional(),
    // Story category: workshop build log, guitars out in the world, or announcements
    category: z.enum(['build-diary', 'in-the-wild', 'news']).default('build-diary'),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const slides = defineCollection({
  type: 'data',
  schema: z.object({
    src: z.string(),
    alt: z.string().default(''),
    // Small mono label shown bottom-right of the hero, e.g. "Example Guitar 1 · 2024"
    caption: z.string().optional(),
    // Second caption line, e.g. "Electric · Available"
    detail: z.string().optional(),
    // Makes the caption a link, e.g. "/gallery"
    url: z.string().optional(),
  }),
});

export const collections = { guitars, stories, slides };
