/**
 * Link-preview images, rendered after the build.
 *
 * Facebook, WhatsApp, LinkedIn, Slack and iMessage cut the og:image to a
 * 1200 × 630 card, and LinkedIn (plus some mail clients) will not show a
 * WebP at all. So BaseLayout never points og:image at a photo directly: a
 * photo at /images/x/photo-5.webp is referenced as /images/x/photo-5.preview.jpg,
 * and this integration renders that file into dist/ once the pages exist.
 *
 * A wide photo is cropped to the card. A portrait or square one is placed
 * whole on a blurred, darkened copy of itself, so a full-length guitar shot
 * still shows the whole guitar. Only missing files are rendered: a
 * hand-made photo-5.preview.jpg in public/ wins. Nothing is written to
 * public/ and nothing is committed. `astro dev` skips this, so previews
 * only resolve on a built site.
 */
import type { AstroIntegration } from 'astro';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Imported up front on purpose: this module is loaded through Vite with the
// config, and by the time astro:build:done runs, that loader is closed, so a
// dynamic import() inside the hook fails.
import sharp from 'sharp';

export const PREVIEW_SUFFIX = '.preview.jpg';

const CARD = { width: 1200, height: 630 };
// Wider than this is cropped to the card; narrower is shown whole.
const CROP_ASPECT = 1.4;
// Breathing room around a portrait photo on its blurred background.
const INSET = 30;
const SOURCE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];

export default function ogPreviewImages(): AstroIntegration {
  return {
    name: 'og-preview-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const wanted = new Map<string, string>(); // preview file → source photo

        for (const file of readdirSync(out, { recursive: true })) {
          if (typeof file !== 'string' || !file.endsWith('.html')) continue;
          const html = readFileSync(path.join(out, file), 'utf8');
          for (const [, content] of html.matchAll(/<meta property="og:image" content="([^"]+)"/g)) {
            const pathname = decodeURIComponent(new URL(content).pathname);
            if (!pathname.endsWith(PREVIEW_SUFFIX)) continue;
            const target = path.join(out, pathname);
            if (existsSync(target) || wanted.has(target)) continue;
            const stem = target.slice(0, -PREVIEW_SUFFIX.length);
            const source = SOURCE_EXTENSIONS.map(ext => stem + ext).find(existsSync);
            if (!source) {
              logger.warn(`${file}: no photo found for og:image ${pathname}`);
              continue;
            }
            wanted.set(target, source);
          }
        }

        if (wanted.size === 0) return;
        for (const [target, source] of wanted) {
          await renderCard(source, target);
        }
        logger.info(`${wanted.size} link-preview image(s) rendered`);
      },
    },
  };
}

async function renderCard(source: string, target: string) {
  const { width = 1, height = 1 } = await sharp(source).metadata();
  const jpeg = { quality: 85, mozjpeg: true };

  if (width / height >= CROP_ASPECT) {
    await sharp(source).resize(CARD.width, CARD.height, { fit: 'cover' }).jpeg(jpeg).toFile(target);
    return;
  }

  const backdrop = await sharp(source)
    .resize(CARD.width, CARD.height, { fit: 'cover' })
    .blur(40)
    .modulate({ brightness: 0.45 })
    .toBuffer();
  const photo = await sharp(source)
    .resize({ height: CARD.height - 2 * INSET, fit: 'inside' })
    .toBuffer();
  await sharp(backdrop)
    .composite([{ input: photo, gravity: 'centre' }])
    .jpeg(jpeg)
    .toFile(target);
}
