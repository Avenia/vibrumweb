/**
 * Section background photos, resolved at build time.
 *
 * Each section reads one folder under public/images/backgrounds/ and uses
 * the first image file in it (alphabetical order). Swapping a background is
 * a file operation only — drop the new photo in, delete the old one, no
 * code edit. Keep ONE image per folder; with several, the alphabetically
 * first wins.
 *
 * Folders (one per section) are listed in README "Section background photos".
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public', 'images', 'backgrounds');
const IMAGE_EXTS = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif']);

export function background(section: string): string {
  const dir = path.join(ROOT, section);

  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    throw new Error(
      `[backgrounds] Missing folder public/images/backgrounds/${section}/ — ` +
        `create it and put one photo inside.`,
    );
  }

  const images = files
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  if (images.length === 0) {
    throw new Error(
      `[backgrounds] public/images/backgrounds/${section}/ has no image — ` +
        `put one photo (webp/png/jpg) inside.`,
    );
  }

  return `/images/backgrounds/${section}/${images[0]}`;
}
