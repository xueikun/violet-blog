import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export interface TagGroup {
  /** 标签原始文字,展示用 */
  tag: string;
  /** URL 片段,小写、空格转连字符;中文保留原字符 */
  slug: string;
  posts: Post[];
}

/**
 * 标签 → URL 片段。
 * 「Spring Boot」⇒「spring-boot」,中文标签保持原样(浏览器会自动编码)。
 * 这个函数是唯一入口,改规则时 /tags/ 全站链接会一起跟着变。
 */
export function tagSlug(tag: string): string {
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[/\\?#%&=+]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || encodeURIComponent(tag);
}

/** 汇总全站标签,按文章数降序、同数量按标签字典序 */
export function buildTags(posts: Post[]): TagGroup[] {
  const map = new Map<string, TagGroup>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      let group = map.get(slug);
      if (!group) {
        group = { tag, slug, posts: [] };
        map.set(slug, group);
      }
      group.posts.push(post);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag, "zh")
  );
}

/** 汇总分类,规则同标签 */
export function buildCategories(posts: Post[]): { name: string; posts: Post[] }[] {
  const map = new Map<string, { name: string; posts: Post[] }>();
  for (const post of posts) {
    const name = post.data.category;
    if (!map.has(name)) map.set(name, { name, posts: [] });
    map.get(name)!.posts.push(post);
  }
  return [...map.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, "zh")
  );
}
