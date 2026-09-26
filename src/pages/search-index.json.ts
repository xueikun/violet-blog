import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { url } from "../utils/url";

/**
 * 站内搜索索引 —— 构建期生成,纯静态 JSON,运行时零后端。
 *
 * 字段刻意用单字母,减小体积:
 *   t 标题 / e 摘要 / c 分类 / g 标签 / d 日期 / u 链接 / b 正文纯文本
 *
 * 正文截断到 MAX_BODY 字,兼顾命中率与首屏加载。
 * 文章量级上去以后(> 300 篇)建议改成按需分片,现在没必要。
 */

const MAX_BODY = 4000;

/** 剥掉 Markdown 语法,只留可检索的纯文本 */
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ") // 围栏代码块(整段丢掉,太长且是噪音)
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`([^`\n]+)`/g, "$1") // 行内代码保留内容 —— 搜 selectList 这类标识符很有用
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接保留可见文字
    .replace(/^\s{0,3}\[[^\]]+\]:\s*\S+.*$/gm, " ") // 引用式链接定义
    .replace(/<[^>]+>/g, " ") // 内联 HTML
    .replace(/^\s{0,3}#{1,6}\s+/gm, " ") // 标题记号
    .replace(/^\s{0,3}>\s?/gm, " ") // 引用记号
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, " ") // 列表记号
    .replace(/^\s{0,3}\|.*\|\s*$/gm, " ") // 表格行
    .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, " ") // 分割线
    .replace(/[*_~]/g, "") // 强调记号
    .replace(/\s+/g, " ")
    .trim();
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const index = posts.map((post) => ({
    t: post.data.title,
    e: post.data.excerpt,
    c: post.data.category,
    g: post.data.tags,
    d: post.data.date.toISOString().slice(0, 10),
    u: url(`posts/${post.id}/`),
    b: toPlainText(post.body ?? "").slice(0, MAX_BODY),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
