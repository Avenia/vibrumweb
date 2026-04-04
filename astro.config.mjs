import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://www.vibrumguitars.com',
  integrations: [sitemap(), icon()],
  output: 'static',

  vite: {
    server: {
      allowedHosts: [
        'nikole-existential-nongratifyingly.ngrok-free.dev'
      ]
    }
  }
});