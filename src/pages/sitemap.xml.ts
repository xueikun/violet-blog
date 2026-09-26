import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absoluteUrl } from "../utils/url";
import { buildTags } from "../utils/tags";

interface Entry {
  loc: string;
  lastmod?: string;
  priority: string;
}

export const GET: APIRoute = async (context) => {
  const origin = context.site?.toString() ?? "https://xueikun.github.io";

  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const tags = buildTags(posts);

  const entries: Entry[] = [
    { loc: absoluteUrl(origin, ""), priority: "1.0" },
    { loc: absoluteUrl(origin, "posts/"), priority: "0.9" },
    { loc: absoluteUrl(origin, "tags/"), priority: "0.7" },
    { loc: absoluteUrl(origin, "archive/"), priority: "0.6" },
    { loc: absoluteUrl(origin, "guestbook/"), priority: "0.5" },
    { loc: absoluteUrl(origin, "about/"), priority: "0.5" },
    ...tags.map((group) => ({
      // 中文标签要百分号编码,sitemap 里不宜出现裸的非 ASCII 字符
      loc: encodeURI(absoluteUrl(origin, `tags/${group.slug}/`)),
      priority: "0.4",
    })),
    ...posts.map((post) => ({
      loc: absoluteUrl(origin, `posts/${post.id}/`),
      lastmod: post.data.date.toISOString().slice(0, 10),
      priority: "0.8",
    })),
  ];

  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${entry.lastmod}</lastmod>`
        : "";
      return `  <url>\n    <loc>${entry.loc}</loc>${lastmod}\n    <priority>${entry.priority}</priority>\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
};
