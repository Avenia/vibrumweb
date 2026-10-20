#!/usr/bin/env node
// Photo helper for workshop stories.
//
//   node photo-sizes.mjs <folder>
//     Lists the WebP photos in a folder with pixel size and orientation,
//     in natural order (photo-2 before photo-10). Use it to plan rows.
//
//   node photo-sizes.mjs --check <built story page .html>
//     Reads a built story page (dist/stories/story-NNN/index.html) and prints
//     every photo row and single photo with dimensions. Exits 1 when a
//     portrait photo stands alone, which the site's layout rules disallow.
import { readdirSync, readFileSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

// Pixel size from a WebP header (VP8X, VP8 and VP8L variants), or null.
function webpSize(path) {
  let fd;
  try {
    fd = openSync(path, 'r');
    const buf = Buffer.alloc(30);
    if (readSync(fd, buf, 0, 30, 0) < 30) return null;
    if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return null;
    const chunk = buf.toString('latin1', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

const orientation = (w, h) => (w >= h ? 'landscape' : 'portrait');
const args = process.argv.slice(2);

if (args[0] === '--check') {
  const file = args[1];
  if (!file) {
    console.error('usage: photo-sizes.mjs --check <built story page .html>');
    process.exit(2);
  }
  const html = readFileSync(file, 'utf8').replace(/\s+/g, ' ');
  const paragraphs = html.match(/<p>(?:<img[^>]*story-float[^>]*> ?)+<\/p>/g) ?? [];
  const lonePortraits = [];
  let rows = 0;
  for (const p of paragraphs) {
    const photos = [...p.matchAll(/<img[^>]*>/g)].map(([tag]) => {
      const name = (/src="([^"]*)"/.exec(tag)?.[1] ?? '?').split('/').pop();
      const w = Number(/width="(\d+)"/.exec(tag)?.[1] ?? 0);
      const h = Number(/height="(\d+)"/.exec(tag)?.[1] ?? 0);
      return { name, w, h, label: w && h ? `${name} ${w}x${h} ${orientation(w, h)}` : `${name} (no size)` };
    });
    if (photos.length > 1) {
      rows++;
      console.log(`row     ${photos.map(p => p.label).join('  |  ')}`);
    } else {
      console.log(`single  ${photos[0].label}`);
      if (photos[0].w && photos[0].h && photos[0].h > photos[0].w) lonePortraits.push(photos[0].name);
    }
  }
  const singles = paragraphs.length - rows;
  console.log(`\n${rows} row(s), ${singles} single(s)`);
  if (lonePortraits.length) {
    console.log(`PROBLEM: portrait photo(s) standing alone: ${lonePortraits.join(', ')}. Pair each with another photo by putting the image lines on consecutive lines.`);
    process.exit(1);
  }
  process.exit(0);
}

const dir = args[0];
if (!dir) {
  console.error('usage: photo-sizes.mjs <folder>  |  photo-sizes.mjs --check <built story page .html>');
  process.exit(2);
}
const files = readdirSync(dir)
  .filter(f => /\.webp$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (files.length === 0) console.log(`no .webp files in ${dir}`);
for (const f of files) {
  const s = webpSize(join(dir, f));
  console.log(s ? `${f}\t${s.width}x${s.height}\t${orientation(s.width, s.height)}` : `${f}\t(not a readable WebP)`);
}
