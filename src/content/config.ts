import { defineCollection, z } from 'astro:content';

const specsSchema = z.object({
  materials: z.object({
    top: z.string().optional(),
    base: z.string().optional(),
    neck: z.string().optional(),
    fretboard: z.string().optional(),
    headstock_top: z.string().optional(),
    fretmarkers: z.string().optional(),
    nut: z.string().optional(),
    frets: z.string().optional(),
    details: z.string().optional(),
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
    type: z.enum(['electric', 'acoustic', 'bass', 'classical']),
    status: z.enum(['available', 'sold']).default('available'),
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
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    draft: z.boolean().default(false),
  }),
});

const slides = defineCollection({
  type: 'data',
  schema: z.object({
    src: z.string(),
    alt: z.string().default(''),
    // Small mono label shown bottom-right of the hero, e.g. "Pyrocaster · 2024"
    caption: z.string().optional(),
    // Second caption line, e.g. "Electric · Available"
    detail: z.string().optional(),
    // Makes the caption a link, e.g. "/gallery#guitar-pyrocaster"
    url: z.string().optional(),
  }),
});

export const collections = { guitars, stories, slides };
