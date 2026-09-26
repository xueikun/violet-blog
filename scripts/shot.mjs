/**
 * 页面截图 —— 视觉验收用。
 *
 *   npm run shot -- <url> <out.png> [宽] [高] [截图前执行的JS] [等待毫秒]
 *
 * 例:
 *   npm run shot -- http://127.0.0.1:4321/violet-blog/tags/ shot/tags.png 1280 900
 *   npm run shot -- http://127.0.0.1:4321/violet-blog/ shot/mobile.png 390 780
 *   SHOT_DARK=1 npm run shot -- http://127.0.0.1:4321/violet-blog/ shot/dark.png
 *
 * 需要交互时把 JS 塞进来(内部用 CDP Runtime.evaluate,支持 async/await):
 *   npm run shot -- URL shot/search.png 1280 800 \
 *     "(async()=>{document.querySelector('#search-open').click(); await new Promise(r=>setTimeout(r,900));})()"
 *
 * 为什么不用 playwright:项目约定只装 astro 一个依赖。这里直接用 Node 内置的
 * WebSocket 走 CDP,零依赖,浏览器复用系统里已有的 Chromium。
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { requireBrowser } from "./find-browser.mjs";

const [url, out, w = "1440", h = "900", js = "", delay = "800"] =
  process.argv.slice(2);

if (!url || !out) {
  console.error(
    "用法: npm run shot -- <url> <out.png> [宽] [高] [JS] [等待毫秒]"
  );
  process.exit(1);
}

const CHROME = requireBrowser();
const PORT = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(resolve(tmpdir(), "shot-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

try {
  /* 1. 等 devtools 端口,顺便开一个页面 */
  let pageWs = null;
  for (let i = 0; i < 80 && !pageWs; i++) {
    try {
      const r = await fetch(
        `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,
        { method: "PUT" }
      );
      if (r.ok) pageWs = (await r.json()).webSocketDebuggerUrl;
    } catch {
      /* 端口还没起来,继续等 */
    }
    if (!pageWs) await sleep(250);
  }
  if (!pageWs) throw new Error("devtools 没起来,检查浏览器是否可执行");

  /* 2. 连上页面会话 */
  const ws = new WebSocket(pageWs);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });

  let seq = 0;
  const pending = new Map();
  const onLoad = { fn: null };

  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { resolve: ok, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : ok(m.result);
    } else if (m.method === "Page.loadEventFired" && onLoad.fn) {
      onLoad.fn();
      onLoad.fn = null;
    }
  });

  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => reject(new Error(`timeout: ${method}`)), 25000);
    });

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: Number(w),
    height: Number(h),
    deviceScaleFactor: 1,
    mobile: Number(w) < 500,
  });
  await call("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-color-scheme",
        value: process.env.SHOT_DARK ? "dark" : "light",
      },
    ],
  });

  /* 3. 导航并等 load */
  const loaded = new Promise((r) => (onLoad.fn = r));
  await call("Page.navigate", { url });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(Number(delay));

  /* 4. 可选:截图前跑一段 JS */
  if (js) {
    const r = await call("Runtime.evaluate", {
      expression: js,
      awaitPromise: true,
      returnByValue: true,
    });
    const value = r.result?.value;
    console.log(`[shot] eval → ${JSON.stringify(value ?? null)}`);
    await sleep(1000);
  }

  /* 5. 出图 */
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const { data } = await call("Page.captureScreenshot", { format: "png" });
  writeFileSync(out, Buffer.from(data, "base64"));
  console.log(`[shot] 已保存 ${out} (${w}×${h})`);
} finally {
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* 临时目录清不掉无所谓 */
  }
}
