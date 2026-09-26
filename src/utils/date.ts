export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatCnDate(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function readingTime(body: string): number {
  const cn = (body.match(/[\u4e00-\u9fa5]/g) || []).length;
  const en = (body.match(/[a-zA-Z]+/g) || []).length;
  return Math.max(1, Math.round(cn / 350 + en / 200));
}
