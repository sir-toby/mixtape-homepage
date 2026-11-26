// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import links from './src/lib/satteri-links.mjs';

// Deploy target comes from the environment, so the same code builds for
// GitHub Pages (https://sir-toby.github.io/mixtape-homepage/) and later for the own domain.
const site = process.env.SITE_URL ?? 'https://mixtape-vocal.de';
const base = process.env.BASE_PATH ?? '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/prototypen/') })],
  markdown: {
    processor: satteri({ hastPlugins: [links({ base })] }),
  },
});
