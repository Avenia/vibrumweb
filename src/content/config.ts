import { defineCollection, z } from 'astro:content';

const specsSchema = z.object({
  body: z.object({
    wood: z.string().optional(),
    finish: z.string().optional(),
    binding: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
  neck: z.object({
    wood: z.string().optional(),
    profile: z.string().optional(),
    scale: z.string().optional(),
    frets: z.number().optional(),
    radius: z.string().optional(),
    nut: z.string().optional(),
    finish: z.string().optional(),
  }).optional(),
  fingerboard: z.object({
    wood: z.string().optional(),
    inlays: z.string().optional(),
  }).optional(),
  hardware: z.object({
    tuners: z.string().optional(),
    bridge: z.string().optional(),
    tailpiece: z.string().optional(),
    finish: z.string().optional(),
  }).optional(),
  electronics: z.object({
    pickups: z.string().optional(),
    controls: z.string().optional(),
    output: z.string().optional(),
  }).optional(),
}).optional();

const guitars = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['electric', 'acoustic', 'bass', 'classical']),
    status: z.enum(['available', 'sold', 'in-progress', 'commission']).default('available'),
    year: z.number(),
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
    text: z.string().default(''),
    button: z.object({
      label: z.string(),
      url: z.string(),
    }).optional(),
  }),
});

export const collections = { guitars, stories, slides };
