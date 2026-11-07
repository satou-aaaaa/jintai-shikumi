// アプリのアイコン（icon-192.png・icon-512.png）を作る。藍の地に、生成りのハート（心臓）。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）。maskable でも欠けないよう、絵は真ん中の円（直径80%）に収める
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#1f3a5c"/>
      <path d="M50 76 L28 52 A12 12 0 0 1 50 34 A12 12 0 0 1 72 52 Z" fill="#f6f1e7"/>
      <path d="M36 52 h8 l3 -7 l5 13 l3 -6 h9" stroke="#b8402a" stroke-width="3" fill="none" stroke-linejoin="round"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
