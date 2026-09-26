/**
 * 生成分享卡片图 public/og-default.png(1200×630)
 *
 * 用无头 Chromium 截图 scripts/og-card.html —— 好处是排版和站点视觉一致,
 * 且不需要引入 sharp / canvas 这类依赖。
 *
 *   npm run og
 *
 * 找不到浏览器时按提示把路径写进环境变量 CHROME_PATH 再重试。
 */
import { execFile } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { requireBrowser } from "./find-browser.mjs";

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "scripts", "og-card.html");
const out = join(root, "public", "og-default.png");
const WIDTH = 1200;
const HEIGHT = 630;

const browser = requireBrowser();
mkdirSync(dirname(out), { recursive: true });

console.log(`[og] 浏览器: ${browser}`);
console.log(`[og] 渲染  : ${src}`);

await run(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--no-sandbox",
    "--no-first-run",
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${out}`,
    pathToFileURL(src).href,
  ],
  { maxBuffer: 1 << 24 }
);

const size = statSync(out).size;
console.log(`[og] 输出  : ${out} (${(size / 1024).toFixed(1)} KB)`);
