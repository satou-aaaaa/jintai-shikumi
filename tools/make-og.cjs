// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、心臓・肺・胃の形の絵だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const art = `
    <path d="M75 132 L30 82 A24 24 0 0 1 75 52 A24 24 0 0 1 120 82 Z" fill="#b8402a"/>
    <path d="M230 40 v30" stroke="#5b6f80" stroke-width="10" stroke-linecap="round"/>
    <path d="M222 66 q-46 4 -50 60 q22 12 50 -4 z" fill="#d98c7a"/><path d="M238 66 q46 4 50 60 q-22 12 -50 -4 z" fill="#d98c7a"/>
    <path d="M360 40 q-10 30 20 40 q50 10 40 50 q-60 10 -80 -30 q-10 -30 10 -60 z" fill="#e0a35a"/>`;
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:56px 64px;background:#f6f1e7;color:#2a2420;display:flex;flex-direction:column;gap:36px;justify-content:center">
    <div>
      <div style="font-size:32px;color:#86291a;letter-spacing:.06em">心臓は何をする？食べ物はどこを通る？</div>
      <div style="font-size:112px;font-weight:900;margin-top:4px;color:#1f3a5c;white-space:nowrap">人体の<span style="color:#b8402a">しくみ</span></div>
      <div style="font-size:30px;margin-top:8px;white-space:nowrap">器官のはたらき・からだの数・通る順番を当てる1日5問</div>
    </div>
    <svg width="470" height="150" viewBox="0 0 470 150" style="align-self:flex-end;transform:scale(1.3);transform-origin:right bottom">${art}</svg>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
