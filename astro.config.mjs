import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { imageSize } from './src/lib/imageSize';
import ogPreviewImages from './src/integrations/ogPreviewImages';

// Tags markdown images as story photos: lazy-loaded, and .story-float so the
// story page can style them in the text flow and open them in its lightbox.
// Photos under public/ also get their pixel size (read from the file header
// by src/lib/imageSize.ts): as width/height, so the page does not shift
// while they load, and as --ar (width ÷ height), which the row layout uses
// to give each photo in a row a width proportional to its shape. Runs before
// Astro's own image-marker plugin, so these props are carried through image
// optimization onto the final <img>.
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

        const size = imageSize(String(node.properties?.src ?? ''));
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
  integrations: [
    sitemap({
      // The privacy page is noindex (see src/pages/privacy.astro); listing a
      // page in the sitemap while asking crawlers not to index it is a mixed
      // signal that Search Console flags.
      filter: page => new URL(page).pathname !== '/privacy/',
    }),
    icon(),
    // Renders the 1200 × 630 JPEG link-preview cards into dist/ after the build.
    ogPreviewImages(),
  ],
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