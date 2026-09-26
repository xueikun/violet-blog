import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages 默认地址:https://xueikun.github.io/violet-blog/
  site: 'https://xueikun.github.io',
  base: '/violet-blog',
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
    },
  },
});
