import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Tags markdown images as story photos: lazy-loaded, and .story-float so the
// story page can restyle them (in-flow on phones, right column on desktop).
function rehypeStoryImages() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const props = node.properties ?? (node.properties = {});
        props.loading = 'lazy';
        props.decoding = 'async';
        const prev = Array.isArray(props.className)
          ? props.className
          : typeof props.className === 'string' ? props.className.split(/\s+/) : [];
        props.className = [...prev, 'story-float'];
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://www.vibrumguitars.com',
  integrations: [sitemap(), icon()],
  output: 'static',

  markdown: {
    rehypePlugins: [rehypeStoryImages],
  },

  vite: {
    server: {
      allowedHosts: [
        'nikole-existential-nongratifyingly.ngrok-free.dev'
      ]
    }
  }
});