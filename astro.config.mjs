import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
