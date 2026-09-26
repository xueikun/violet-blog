# 薇尔莉特 · Violet Evergarden

> 自动手记人偶的书桌 —— 一个二次元风格的个人博客。
> 记录技术笔记、生活随笔与追番感想。

线上地址:**https://xueikun.github.io/violet-blog/**

---

## 它长什么样

- **书信气质**:标题走衬线字体,圆角贴纸卡片 + 硬投影,紫罗兰 / 火漆金配色
- **深浅双主题**:跟随系统,可手动切换,无闪烁
- **二次元糖**:樱花花瓣粒子、卡片 3D 悬停倾斜、标题打字机、滚动淡入、阅读进度条
- **站内搜索**:`Ctrl/Cmd + K` 唤起,前端全文检索,零后端
- **评论**:接入 giscus,数据存在自己的 GitHub 仓库里

## 技术栈

| 项 | 值 |
| --- | --- |
| 框架 | **Astro 5**(静态输出) |
| 依赖总数 | **1 个**(只有 `astro`) |
| 样式 | 原生 CSS + CSS 变量 |
| 交互 | 原生 JavaScript,无框架 |
| 内容 | Markdown(Content Collections) |
| 评论 | giscus(GitHub Discussions) |
| 部署 | GitHub Pages + GitHub Actions |

没有 React、没有 Vue、没有 UI 库,也没有 `@astrojs/*` 系列插件 —— RSS / sitemap / robots / 搜索索引全部是手写的 API Route。

## 快速开始

```bash
npm install
npm run dev -- --port 4321 --host 127.0.0.1
```

访问 **http://localhost:4321/violet-blog/**

> ⚠️ 三个必须记住的细节:
> 1. 必须带 `/violet-blog/` 前缀 —— 站点部署在子路径下,访问根路径打不开是正常的
> 2. 必须加 `--host 127.0.0.1` —— 否则只监听 IPv6,用 `127.0.0.1` 访问不通
> 3. 本机 curl 探测要加 `--noproxy '*'` —— 否则会走系统代理返回 502

### 全部脚本

```bash
npm run dev       # 开发服务器
npm run build     # 构建到 dist/(20 页 + 4 个端点)
npm run preview   # 预览构建产物
npm run og        # 重新生成分享卡片图 public/og-default.png
npm run shot      # 页面截图,视觉验收用(见下)
```

`npm run shot` 用无头 Chromium 截图,零依赖,可以顺手做响应式和深色模式的回归:

```bash
npm run shot -- http://127.0.0.1:4321/violet-blog/tags/ shot/tags.png 1280 900
npm run shot -- http://127.0.0.1:4321/violet-blog/ shot/mobile.png 390 780
SHOT_DARK=1 npm run shot -- http://127.0.0.1:4321/violet-blog/ shot/dark.png
```

最后一个参数还支持塞一段 JS 用于交互后再截(内部走 CDP,支持 async/await):

```bash
npm run shot -- http://127.0.0.1:4321/violet-blog/ shot/search.png 1280 800 \
  "(async()=>{document.querySelector('#search-open').click(); await new Promise(r=>setTimeout(r,900));})()"
```

截图输出到 `shot/`,该目录已 git 忽略。

## 目录结构

```
├── astro.config.mjs          site / base / 代码高亮
├── scripts/
│   ├── og-card.html          ★ 分享卡片模板(1200×630)
│   ├── find-browser.mjs      定位系统里的 Chromium
│   ├── build-og.mjs          ★ 用它渲染出 public/og-default.png
│   └── shot.mjs              页面截图(视觉验收)
├── public/
│   ├── favicon.svg
│   └── og-default.png
├── docs/                     全部文档
└── src/
    ├── styles/
    │   ├── tokens.css        ★ 全站唯一的颜色定义处
    │   └── global.css        重置、贴纸卡片、按钮、正文排版
    ├── layouts/BaseLayout.astro   ★ 页面外壳(主题脚本 / OG / JSON-LD / 搜索)
    ├── components/
    │   ├── Header.astro      导航 + 搜索入口 + 主题切换
    │   ├── PostCard.astro    文章卡片
    │   ├── Search.astro      ★ Ctrl+K 搜索浮层
    │   ├── Petals.astro      花瓣粒子(canvas)
    │   └── ...
    ├── pages/
    │   ├── index.astro / about / archive / guestbook / 404
    │   ├── posts/index.astro          文章列表(标签前端筛选)
    │   ├── posts/[...slug].astro      文章详情
    │   ├── tags/index.astro           标签总览 + 分类
    │   ├── tags/[tag].astro           单个标签的文章列表
    │   └── rss.xml.ts / sitemap.xml.ts / robots.txt.ts / search-index.json.ts
    ├── content.config.ts      文章字段定义与校验
    ├── content/posts/*.md     文章正文
    ├── data/
    │   ├── site.json          站名、作者、简介
    │   └── comments.json      giscus 配置
    └── utils/
        ├── url.ts             ★ 路径工具(自动带 base 前缀)
        ├── tags.ts            ★ 标签 / 分类汇总与 slug
        └── date.ts            日期格式化、阅读时长
```

带 ★ 的是最该先读的几个文件。

## 写一篇文章

在 `src/content/posts/` 新建一个 `.md`,文件名会成为 URL(`/posts/文件名/`)。

```yaml
---
title: "文章标题"
date: 2026-09-27
excerpt: "一两句话摘要,会显示在卡片上"
category: "技术笔记"
tags: ["Java", "踩坑"]
mood: "元气"        # 元气 / 摸鱼 / 发呆 / 燃 / 平静
top: false          # 置顶
draft: false        # 草稿不会被打包上线
cover: ""           # 封面图路径,可留空
---
```

正文就是普通 Markdown,代码块自动高亮且跟随深浅主题。

> 建议用英文短横线命名文件(如 `springboot-keng.md`),中文文件名会让 URL 变成一长串百分号编码。

写完后:

```bash
git add . && git commit -m "post: 文章标题" && git push
```

推送即自动发布。

## 配置速查

| 想改什么 | 改哪里 |
| --- | --- |
| 站名 / 作者 / 简介 | `src/data/site.json` |
| 配色 | `src/styles/tokens.css`(组件里禁止写死色值) |
| 域名 / 子路径 | `astro.config.mjs` 的 `site` 与 `base` |
| 评论 | `src/data/comments.json` |
| 分享卡片 | `scripts/og-card.html` 改完跑 `npm run og` |
| 导航菜单 | `src/components/Header.astro` 顶部的 `nav` 数组 |

## 站内搜索怎么工作的

构建期由 `src/pages/search-index.json.ts` 把每篇文章压成一条记录(标题 / 摘要 / 分类 / 标签 / 正文纯文本),产出静态 JSON。前端在**第一次唤起时才懒加载**它(见 `Search.astro` 的 `load()`),然后纯内存匹配:

- 打分权重:标题 > 标签 > 分类 > 摘要 > 正文
- 多词是 **AND** 语义(所有词都命中才算)
- 命中位置在结果里高亮

目前是**全量加载 + 内存过滤**。文章量级到几百篇以上,建议改成按需分片,现在没必要。

## 四条必须遵守的约定

1. **颜色只在 `tokens.css` 定义**,组件里一律 `var(--primary)` 这样引用。
2. **站内路径必须走 `url()`**(`src/utils/url.ts`)。手写 `/posts/` 会「本地正常、线上 404」,极难排查。注意客户端脚本里 `import.meta.env.BASE_URL` 是**不带尾斜杠**的,直接拼会得到坏地址。
3. **新增动效要做三重降级**:`prefers-reduced-motion` → 全关;`hover: none`(触屏)→ 关倾斜;≤820px → 关粒子。
4. **卡片倾斜用 CSS 变量 `--rx/--ry/--ty`**,别用 JS 直接写 `transform`,否则会和 `:hover` 上浮打架。

另外两条工程细节:

5. 改动依赖后 **`package-lock.json` 必须一起提交** —— CI 用 `npm ci`,缺 lock 会直接挂。
6. `Search.astro` 里结果区的 DOM 是 JS 注入的,**对应的 CSS 必须用 `:global()`**,否则 Astro 的作用域选择器命中不了。

## 部署

推到 `main` → GitHub Actions 自动构建 → 发布到 GitHub Pages。

首次配置只需一次:

1. 建仓库 `violet-blog`,**必须选 Public**(免费版 Pages 只支持公开仓库)
2. `git remote add origin https://github.com/xueikun/violet-blog.git && git push -u origin main`
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**
4. 等 Actions 变绿

完整步骤(含 Token 用法)见 [`docs/部署说明.md`](docs/部署说明.md)。

## 文档

| 文档 | 内容 |
| --- | --- |
| [`docs/交接文档.md`](docs/交接文档.md) | 项目总览、技术决策与理由、已知的坑 |
| [`docs/开发进度.md`](docs/开发进度.md) | 已完成 / 剩余任务清单 |
| [`docs/部署说明.md`](docs/部署说明.md) | 部署完整步骤 |
| [`docs/评论接入说明.md`](docs/评论接入说明.md) | giscus 从建仓库到填参数 |
| [`docs/二次元博客-项目规划.md`](docs/二次元博客-项目规划.md) | 最初的规划:配色、字体、动效分级、路线图 |

## 环境坑(Windows + WorkBuddy)

| 现象 | 真相 | 解法 |
| --- | --- | --- |
| `npm install` 报 `spawnSync node.exe EBUSY` | Windows 瞬时文件锁,二进制其实已就位 | 忽略,直接 `npm run build` 验证 |
| 构建报 `genie-trash ETIMEDOUT`,退出码 1 | 回收站拦截器超时 | **重试一次**即可 |
| dev 启动报 `SAFE_DELETE_BULK_CONFIRM_REQUIRED` | Vite 要重建依赖缓存,删除动作被批量删除保护拦下 | 先 `rm -rf node_modules/.vite` 再 `npm run dev` |

---

MIT License · 内容版权归作者所有
