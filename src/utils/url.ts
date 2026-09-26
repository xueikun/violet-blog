/**
 * 路径工具 —— 统一处理部署在子路径下的情况
 *
 * 站点部署在 https://xueikun.github.io/violet-blog/,
 * 因此所有站内绝对路径都必须带上 base 前缀。
 * 不要在组件里手写 "/posts/" 这类路径,一律走这里的 url()。
 */

const RAW_BASE = import.meta.env.BASE_URL || "/";

/** 规范化后的 base 前缀,始终以 / 结尾 */
export function basePrefix(): string {
  if (RAW_BASE === "/") return "/";
  return RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`;
}

/** 站内路径 → 带上 base 前缀。url("posts/") ⇒ "/violet-blog/posts/" */
export function url(path: string | number = ""): string {
  const clean = String(path).replace(/^\/+/, "");
  return `${basePrefix()}${clean}`;
}

/** 站内路径 → 完整绝对地址(给 RSS / sitemap 用) */
export function absoluteUrl(origin: string, path: string | number = ""): string {
  const clean = String(path).replace(/^\/+/, "");
  return `${origin.replace(/\/+$/, "")}${basePrefix()}${clean}`;
}
