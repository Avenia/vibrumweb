import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Tags markdown images as story photos: lazy-loaded, and .story-float so the
// story page can restyle them (in-flow on phones, right column on desktop).
// Runs before Astro's own image-marker plugin, so these props are carried
// through image optimization onto the final <img>.
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