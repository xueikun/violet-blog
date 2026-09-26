import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import site from "../data/site.json";
import { absoluteUrl } from "../utils/url";

const escapeXml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const GET: APIRoute = async (context) => {
  const origin = context.site?.toString() ?? "https://xueikun.github.io";

  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const items = posts
    .map((post) => {
      const link = absoluteUrl(origin, `posts/${post.id}/`);
      return [
        "    <item>",
        `      <title>${escapeXml(post.data.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <category>${escapeXml(post.data.category)}</category>`,
        `      <description>${escapeXml(post.data.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${absoluteUrl(origin, "")}</link>
    <atom:link href="${absoluteUrl(
      origin,
      "rss.xml"
    )}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
