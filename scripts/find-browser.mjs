/**
 * 定位一个可用的 Chromium / Chrome / Edge 可执行文件。
 *
 * og 卡片生成和页面截图都靠它,避免路径写死在两个地方。
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function findBrowser() {
  for (const p of [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH]) {
    if (p && existsSync(p)) return p;
  }

  const home = process.env.USERPROFILE || process.env.HOME || "";
  const candidates = [];

  // Playwright 下载的 Chromium 优先(开发机上通常已经有)
  for (const base of [
    join(home, "AppData", "Local", "ms-playwright"),
    join(home, "Library", "Caches", "ms-playwright"),
    join(home, ".cache", "ms-playwright"),
  ]) {
    if (!existsSync(base)) continue;
    for (const dir of readdirSync(base)) {
      if (!dir.startsWith("chromium")) continue;
      candidates.push(
        join(base, dir, "chrome-win64", "chrome.exe"),
        join(base, dir, "chrome-win", "chrome.exe"),
        join(base, dir, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
        join(base, dir, "chrome-linux", "chrome")
      );
    }
  }

  candidates.push(
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    join(home, "AppData", "Local", "Google", "Chrome", "Application", "chrome.exe"),
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  );

  return candidates.find((p) => existsSync(p)) ?? null;
}

/** 找不到时给一句人话提示 */
export function requireBrowser() {
  const browser = findBrowser();
  if (!browser) {
    console.error(
      "[browser] 没找到 Chromium / Chrome / Edge。\n" +
        "          装一个浏览器,或把可执行文件路径写进环境变量 CHROME_PATH 后重试。"
    );
    process.exit(1);
  }
  return browser;
}
