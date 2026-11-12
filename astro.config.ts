import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { deployment } from './src/site.config';
import { rehypePrefixBase } from './src/lib/rehype-base';

export default defineConfig({
  site: deployment.url,
  base: deployment.base,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.endsWith('/rss.xml') && !page.endsWith('/robots.txt'),
    }),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypePrefixBase],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
