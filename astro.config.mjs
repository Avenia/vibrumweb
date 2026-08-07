import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Markdown images become floating story photos: alternate right/left, or force a
// side with the title — ![alt](src "left"). Also sets lazy loading.
function rehypeStoryImages() {
  return (tree) => {
    let count = 0;
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        const props = node.properties ?? (node.properties = {});
        const title = typeof props.title === 'string' ? props.title.toLowerCase() : '';
        const side = title === 'left' || title === 'right'
          ? title
          : count % 2 === 0 ? 'right' : 'left';
        count += 1;
        delete props.title;
        props.loading = 'lazy';
        props.decoding = 'async';
        const prev = Array.isArray(props.className)
          ? props.className
          : typeof props.className === 'string' ? props.className.split(/\s+/) : [];
        props.className = [...prev, 'story-float', `story-float--${side}`];
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