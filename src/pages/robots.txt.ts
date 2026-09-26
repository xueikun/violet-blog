import type { APIRoute } from "astro";

export const GET: APIRoute = (context) => {
  const origin =
    context.site?.toString().replace(/\/$/, "") ?? "https://example.com";

  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
};
