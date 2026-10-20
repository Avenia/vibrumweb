import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { openSync, readSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));

// Pixel size of a WebP under public/, read from the file header (VP8X, VP8
// and VP8L variants). Returns null for anything else, and that image is then
// laid out without dimensions.
function webpSize(src) {
  const path = src.split(/[?#]/)[0];
  if (!path.startsWith('/') || !path.toLowerCase().endsWith('.webp')) return null;
  let fd;
  try {
    fd = openSync(publicDir + path.slice(1), 'r');
    const buf = Buffer.alloc(30);
    if (readSync(fd, buf, 0, 30, 0) < 30) return null;
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
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

// Tags markdown images as story photos: lazy-loaded, and .story-float so the
// story page can style them in the text flow and open them in its lightbox.
// Photos under public/ also get their pixel size: as width/height, so the
// page does not shift while they load, and as --ar (width ÷ height), which
// the row layout uses to give each photo in a row a width proportional to
// its shape. Runs before Astro's own image-marker plugin, so these props are
// carried through image optimization onto the final <img>.
function storyImages() {
  return {
    name: 'story-images',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const prev = node.properties?.className;
        const classes = Array.isArray(prev)
          ? prev
          : typeof prev === 'string' ? prev.split(/\s+/).filter(Boolean) : [];
        ctx.setProperty(node, 'loading', 'lazy');
        ctx.setProperty(node, 'decoding', 'async');
        ctx.setProperty(node, 'className', [...classes, 'story-float']);

        const size = webpSize(String(node.properties?.src ?? ''));
        if (size) {
          ctx.setProperty(node, 'width', size.width);
          ctx.setProperty(node, 'height', size.height);
          ctx.setProperty(node, 'style', `--ar:${(size.width / size.height).toFixed(4)}`);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://www.vibrumguitars.com',
  integrations: [sitemap(), icon()],
  output: 'static',

  markdown: {
    processor: satteri({ hastPlugins: [storyImages] }),
  },

  vite: {
    server: {
      allowedHosts: [
        'nikole-existential-nongratifyingly.ngrok-free.dev'
      ]
    }
  }
});