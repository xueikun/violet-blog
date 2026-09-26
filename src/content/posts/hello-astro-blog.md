---
title: "这个博客是怎么搭起来的"
date: 2026-09-26
excerpt: "Astro 打底,配色和排版全部自己定,没用任何现成主题。记录一下取舍。"
category: "技术笔记"
tags: ["Astro", "前端", "建站"]
mood: "元气"
top: true
---

想做一个有点二次元味道的博客,试了几个现成主题,都卡在同一个地方:**能改颜色,但改不动气质**。索性自己写。

## 为什么是 Astro

选它之前列过几个候选,最后按这个站的实际情况做了决定:

| 方案 | 判断 |
| --- | --- |
| Hexo / Hugo + 魔改主题 | 上手快,但想动布局就得跟作者的设计意图打架 |
| Next.js | 能力过剩,这个站没有任何服务端逻辑 |
| Spring Boot + Thymeleaf | 我熟,但用模板引擎写悬停动效太别扭 |
| **Astro** | 静态输出、默认零 JS、Markdown 直接当文章,正好 |

核心优势就一句话:它把"好看的视觉"和"轻的页面"同时给我了。

## 全站只有一处定义颜色

这是我给自己定的第一条规矩。所有色值写在 `tokens.css` 里,组件里一个硬编码的颜色都不许出现:

```css
:root {
  --bg: #fff7f9;
  --primary: #ff8fb1;
  --secondary: #a8d8ea;
  --accent: #ffd166;
  --text: #4a3b47;
}

[data-theme="dark"] {
  --bg: #15151f;
  --primary: #ff6bb5;
  --secondary: #7bd9ff;
  --text: #e8e4f3;
}
```

好处是深色模式几乎白送——只要切换根节点上的 `data-theme`,整站跟着变。

## 防闪烁这一个细节

深色模式最容易翻车的地方是首屏闪一下白。解决办法是在 `<head>` 里同步执行一小段脚本,在渲染前就把主题定下来:

```js
(function () {
  var t = localStorage.getItem("theme");
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
})();
```

这段必须是内联的,不能等打包后的模块加载——那个时刻页面早就画完了。

## 贴纸风卡片

二次元味的来源不是花哨,是**统一的容器语言**。全站卡片都长这样:

- 圆角 16px
- 1.5px 有色描边
- 硬投影 `0 2px 0`,而不是柔和阴影
- 悬停整体上浮 4px,同时描边点亮

```css
.sticker {
  background: var(--bg-elevated);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 0 var(--shadow-sticker);
}
```

硬投影是关键。柔和阴影会立刻把页面拉回"企业官网"的感觉。

## 接下来要做的

- [x] 首页、文章列表、详情、归档
- [ ] 樱花粒子与 3D 倾斜
- [ ] 阅读进度血条
- [ ] 画廊、友链、留言板

> 先把内容跑通,再堆特效。反着做,最后大概率得到一个很酷但没东西的站。
