import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://xuegungun.cn',
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
