import type { APIRoute } from "astro";
import { absoluteUrl } from "../utils/url";

export const GET: APIRoute = (context) => {
  const origin = context.site?.toString() ?? "https://xueikun.github.io";

  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(origin, "sitemap.xml")}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
};
