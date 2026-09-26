import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    excerpt: z.string(),
    category: z.string().default("未分类"),
    tags: z.array(z.string()).default([]),
    mood: z.string().optional(),
    top: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
