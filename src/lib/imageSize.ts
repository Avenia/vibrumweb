/**
 * Pixel size of an image under public/, read from the file header without
 * decoding the image. Handles WebP (VP8X, VP8 and VP8L variants) and PNG.
 * Returns null for any other path or format, or when the file is missing.
 *
 * Used by the markdown image plugin in astro.config.mjs (width/height and
 * row layout for story photos) and by BaseLayout for og:image:width/height.
 */
import { openSync, readSync, closeSync } from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export interface ImageSize {
  width: number;
  height: number;
}

export function imageSize(src: string): ImageSize | null {
  const clean = src.split(/[?#]/)[0];
  if (!clean.startsWith('/')) return null;

  const ext = path.extname(clean).toLowerCase();
  if (ext !== '.webp' && ext !== '.png') return null;

  let fd: number | undefined;
  try {
    fd = openSync(path.join(PUBLIC_DIR, clean.slice(1)), 'r');
    const buf = Buffer.alloc(30);
    if (readSync(fd, buf, 0, 30, 0) < 30) return null;
    return ext === '.png' ? pngSize(buf) : webpSize(buf);
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

// PNG: 8-byte signature, then the IHDR chunk with width and height as
// big-endian 32-bit integers at offsets 16 and 20.
function pngSize(buf: Buffer): ImageSize | null {
  if (buf.toString('latin1', 1, 4) !== 'PNG' || buf.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function webpSize(buf: Buffer): ImageSize | null {
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('latin1', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }
  return null;
}
