// 人体のしくみ の問題（ブラウザと node の両方で使う）。
// からだの器官のはたらき・属する系・読み方・からだの数・食べ物や血液の通る順番を当てる。医療の助言にはしない。
// 中身は国立がん研究センター（がん情報サービス）・厚生労働省・日本赤十字社・各学会の一般向けページから（出どころは SRC。確かめ方は共有フォルダ games/jintai-sources.md）。
// 問題は決まった種から全部ここで作る（BANK）。1問は「種類|番号」の key を持ち、同じ key ならいつも同じ問題になる。
// 作り方・表を変えると、過去の日の問題も変わる。変えた PR に一言書く。QA は表を別に持って答えを確かめる。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ日なら、どの端末でも同じ問題になる。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出どころ（短い名前と URL）
  const SRC = {
    liver: ["国立がん研究センター「肝臓の知識」", "https://www.ncc.go.jp/jp/information/knowledge/liver/001/index.html"],
    kidney: ["日本腎臓学会「腎臓の構造と働き」", "https://jsn.or.jp/general/kidneydisease/symptoms01.php"],
    stomach: ["がん情報サービス「胃がん」", "https://ganjoho.jp/public/cancer/stomach/print.html"],
    esoph: ["がん情報サービス「食道がんについて」", "https://ganjoho.jp/public/cancer/esophagus/about.html"],
    pancreas: ["がん情報サービス「膵臓がん」", "https://ganjoho.jp/public/cancer/pancreas/print.html"],
    spleen: ["がん情報サービス 用語集「脾臓」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/hizo.html"],
    colon: ["がん情報サービス「大腸がん」", "https://ganjoho.jp/public/cancer/colon/print.html"],
    small: ["がん情報サービス「小腸がん」", "https://ganjoho.jp/public/cancer/small_intestine_cancer/index.html"],
    jsge: ["日本消化器病学会「消化器のひろば」", "https://www.jsge.or.jp/citizens/hiroba28_08/"],
    lung: ["がん情報サービス「肺がんについて」", "https://ganjoho.jp/public/cancer/lung/about.html"],
    thyroid: ["がん情報サービス「甲状腺がんについて」", "https://ganjoho.jp/public/cancer/thyroid/about.html"],
    bladder: ["がん情報サービス「膀胱がん」", "https://ganjoho.jp/public/cancer/bladder/print.html"],
    marrow: ["がん情報サービス 用語集「骨髄」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/kotsuzui.html"],
    rbc: ["がん情報サービス 用語集「赤血球」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/sekkekkyu.html"],
    plt: ["がん情報サービス 用語集「血小板」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/kesshoban.html"],
    wbc: ["がん情報サービス 用語集「白血球」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/hakkekkyu.html"],
    heart: ["日本心臓財団「不整脈を知ろう」", "https://www.jhf.or.jp/topics/2016/000930/"],
    ncvc: ["国立循環器病研究センター「心臓・肺の構造と働き」", "https://www.ncvc.go.jp/hospital/pub/knowledge/disease/pph-index/"],
    teeth: ["日本歯科医師会「歯の形・数・色」", "https://www.jda.or.jp/park/trouble/index14_01.html"],
    water: ["厚生労働省「日本人の食事摂取基準」水", "https://www.mhlw.go.jp/content/10904750/000586571.pdf"],
    blood: ["日本赤十字社「血液の基礎知識」", "https://www.jrc.or.jp/donation/first/knowledge/"],
    eye: ["日本眼科学会「眼の構造」", "https://www.nichigan.or.jp/public/disease/structure/item01.html"],
    ear: ["日本耳鼻咽喉科頭頸部外科学会「バランス」", "https://www.jibika.or.jp/owned/healthy-aging/balancing.php"],
    hair: ["厚生労働省 e-ヘルスネット「有毛細胞」", "https://kennet.mhlw.go.jp/information/information/dictionary/sensory-organ/ys-01.html"],
    brain: ["がん情報サービス「脳腫瘍〈成人〉について」", "https://ganjoho.jp/public/cancer/brain_adult/about.html"],
    cord: ["がん情報サービス 用語集「脊髄」", "https://ganjoho.jp/public/qa_links/dictionary/dic01/modal/sekizui.html"],
    skin: ["がん情報サービス「基底細胞がん」", "https://ganjoho.jp/public/cancer/basal/index.html"],
    bile: ["がん情報サービス「胆道がん」", "https://ganjoho.jp/public/cancer/biliary_tract/print.html"],
    bone: ["厚生労働省 e-ヘルスネット「骨密度」", "https://kennet.mhlw.go.jp/information/information/dictionary/exercise/ys-027.html"],
    mouth: ["厚生労働省 e-ヘルスネット「歯・口の機能」", "https://kennet.mhlw.go.jp/information/information/teeth/h-01-001.html"],
  };

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

  // からだの系（グループ）。札と「どの系」の問題に使う
  const SYS = ["消化器", "循環器", "血液", "呼吸器", "泌尿器", "神経", "目", "耳", "骨", "免疫", "内分泌", "皮膚"];
  const SYSW = { 消化器: "消化器（食べ物を消化・吸収する）", 循環器: "循環器（血液をめぐらせる）", 血液: "血液の成分", 呼吸器: "呼吸器（息をする）", 泌尿器: "泌尿器（尿をつくって出す）", 神経: "神経（脳と神経）", 目: "目（見る）", 耳: "耳（聞く・バランス）", 骨: "骨", 免疫: "免疫（体を守る）", 内分泌: "内分泌（ホルモン）", 皮膚: "皮膚（体をおおう）" };
  // 器官。n 名前・y 読み・s 系（2つにまたがるものは s2 も持ち、「どの系」の問題に出さない）・w はたらき（40字以内）・r 出どころ
  // 足すときは最後に足す（並べ替え・途中の削除をすると過去の日の問題が変わる）
  const O = (n, y, s, w, r, s2) => ({ n, y, s, w, r, s2: s2 || null });
  const ORGANS = [
    O("心臓", "しんぞう", "循環器", "全身に血液を送り出すポンプ。4つの部屋に分かれる", "heart"),
    O("肝臓", "かんぞう", "消化器", "栄養を体に必要な成分に変え、解毒し、胆汁をつくる", "liver"),
    O("胆のう", "たんのう", "消化器", "肝臓でつくられた胆汁をため、十二指腸へ送り出す", "bile"),
    O("口", "くち", "消化器", "かんで食べ物をくだく。だ液がデンプンを麦芽糖に分解する", "mouth"),
    O("食道", "しょくどう", "消化器", "口から食べた食べ物を胃に送る（消化はしない）", "esoph"),
    O("胃", "い", "消化器", "食べ物をため、胃液とまぜて消化し、少しずつ腸へ送る", "stomach"),
    O("小腸", "しょうちょう", "消化器", "栄養素を消化・吸収する。十二指腸・空腸・回腸からなる", "jsge"),
    O("大腸", "だいちょう", "消化器", "主に水分を吸収し、食べ物の残りを便にする", "colon"),
    O("すい臓", "すいぞう", "消化器", "消化を助けるすい液と、血糖値を調節するインスリンをつくる", "pancreas", "内分泌"),
    O("肺", "はい", "呼吸器", "酸素を取り入れ、いらなくなった二酸化炭素を外に出す", "lung"),
    O("肺胞", "はいほう", "呼吸器", "気管支の先にたくさんついている小さな袋", "lung"),
    O("腎臓", "じんぞう", "泌尿器", "血液をろ過して尿をつくる", "kidney"),
    O("糸球体", "しきゅうたい", "泌尿器", "毛細血管が毛糸の球のように丸まったもの。腎臓の中にある", "kidney"),
    O("ぼうこう", "ぼうこう", "泌尿器", "尿を一時的にため、ある程度たまったら体の外に出す", "bladder"),
    O("尿管", "にょうかん", "泌尿器", "腎臓でつくられた尿をぼうこうへ運ぶ通り道", "bladder"),
    O("脳", "のう", "神経", "大脳・小脳・脳幹に分かれ、脊髄とあわせて中枢神経系をつくる", "brain"),
    O("小脳", "しょうのう", "神経", "平衡感覚をとり、姿勢を保ち、体の動きを調節する", "brain"),
    O("脳幹", "のうかん", "神経", "意識・呼吸・循環などを調節して生命を維持する", "brain"),
    O("脊髄", "せきずい", "神経", "背骨の中にある太い神経の束。脳と体を結ぶ", "cord"),
    O("角膜", "かくまく", "目", "黒目の表面。水晶体とともに光を屈折させる", "eye"),
    O("水晶体", "すいしょうたい", "目", "カメラのレンズにあたり、光を屈折させる", "eye"),
    O("虹彩", "こうさい", "目", "カメラの絞りにあたり、目に入る光の量を調節する（茶目）", "eye"),
    O("網膜", "もうまく", "目", "フィルムにあたり、光を電気信号に変えて視神経から脳へ伝える", "eye"),
    O("蝸牛", "かぎゅう", "耳", "聞こえの感覚器。音の振動を電気信号に変える", "hair"),
    O("三半規管", "さんはんきかん", "耳", "3つの輪のような形をした、バランスに関係する感覚器", "ear"),
    O("皮膚", "ひふ", "皮膚", "表面に近い方から表皮・真皮・皮下組織に分かれる", "skin"),
    O("骨", "ほね", "骨", "体をつくって内臓を守る。カルシウムをたくわえる", "bone"),
    O("骨髄", "こつずい", "骨", "骨の中のスポンジのような組織。赤血球・白血球・血小板をつくる", "marrow", "血液"),
    O("ひ臓", "ひぞう", "免疫", "リンパ球や抗体をつくり、古くなった赤血球をこわす", "spleen"),
    O("甲状腺", "こうじょうせん", "内分泌", "甲状腺ホルモンを出し、成長や代謝をうながす", "thyroid"),
    O("赤血球", "せっけっきゅう", "血液", "ヘモグロビンで、肺から全身へ酸素を運ぶ", "rbc"),
    O("白血球", "はっけっきゅう", "血液", "細菌やウイルスなどの外敵から体を守る", "wbc", "免疫"),
    O("血小板", "けっしょうばん", "血液", "出血したとき、血液を固めて出血を止める", "plt"),
    O("血しょう", "けっしょう", "血液", "血液の液体の部分。約90%が水分で、栄養を運ぶ", "blood"),
  ];
  // はたらきが似ていて、まちがいの選び肢にすると答えが2つに見える組（同じ問題に入れない）
  const NEAR = [["腎臓", "糸球体"], ["角膜", "水晶体"], ["肺", "肺胞"], ["脳", "小脳"], ["脳", "脳幹"], ["骨", "骨髄"], ["骨髄", "赤血球"], ["骨髄", "白血球"], ["骨髄", "血小板"], ["ひ臓", "白血球"], ["ひ臓", "赤血球"], ["肝臓", "胆のう"], ["網膜", "蝸牛"], ["腎臓", "ぼうこう"], ["尿管", "ぼうこう"], ["尿管", "腎臓"], ["小脳", "三半規管"], ["肺", "赤血球"], ["ひ臓", "骨髄"], ["心臓", "血しょう"]];
  const near = (a, b) => NEAR.some(([x, y]) => (x === a.n && y === b.n) || (x === b.n && y === a.n));
  const clean = ORGANS.filter((x) => !x.s2); // 系が1つに決まる器官
  const KIN = { 血液: "循環器" }; // 近い仲間（「どの仲間」の問題で、いっしょに選び肢にしない）

  // 数（資料にはっきり書いてある値だけ）。t 問題・a 答え・d まちがいの候補・why・r 出どころ
  const F = (t, a, d, why, r) => ({ t, a, d, why, r });
  const FACTS = [
    F("乳歯は全部で何本？", "20本", ["12本", "16本", "24本", "28本", "32本"], "乳歯は20本、永久歯は28本です（親知らずを入れると最大32本）。", "teeth"),
    F("永久歯は、親知らずを入れないと何本？", "28本", ["20本", "24本", "30本", "36本", "40本"], "永久歯は28本で、親知らずを入れると最大32本です。乳歯は20本です。", "teeth"),
    F("体の水分は、体重のおよそ何%？", "およそ60%", ["およそ10%", "およそ30%", "およそ85%", "およそ95%", "およそ5%"], "水は体重のおよそ60%をしめます（年齢などでちがいます）。", "water"),
    F("体の中の血液の量は、体重のどれくらい？", "約13分の1", ["約2分の1", "約3分の1", "約100分の1", "約1000分の1", "約4分の1"], "血液の量は、体重の約13分の1といわれています。", "blood"),
    F("血しょうの水分は約何%？", "約90%", ["約10%", "約30%", "約50%", "約5%", "約20%"], "血しょうの約90%は水分で、固形の成分は約10%です。", "blood"),
    F("赤血球は、血管の中で約何日はたらく？", "約120日", ["約1日", "約3日", "約10日", "約3年", "約10年"], "赤血球は約120日はたらいたあと、ひ臓でこわされます。", "rbc"),
    F("心臓は、いくつの部屋に分かれている？", "4つ", ["1つ", "2つ", "3つ", "6つ", "8つ"], "上の2つが心房（右・左）、下の2つが心室（右・左）です。", "heart"),
    F("大人の肝臓の重さは？", "約1kg以上", ["約1g", "約10g", "約100g", "約1t", "約100kg"], "肝臓は大人で約1kg以上にもなる、体の中でいちばん大きな臓器です。", "liver"),
    F("小腸の長さは？", "6〜7mほど", ["10cmほど", "30cmほど", "60mほど", "600mほど", "6cmほど"], "小腸は胃と大腸の間にある、6〜7mほどの消化管です。", "small"),
    F("大腸の長さは？", "1.5〜2mほど", ["1.5〜2cmほど", "15〜20cmほど", "15〜20mほど", "150〜200mほど", "1.5〜2kmほど"], "大腸は長さ1.5〜2mほどの臓器です。", "colon"),
    F("すい臓の長さは？", "20cmほど", ["2mmほど", "2cmほど", "2mほど", "20mほど", "200mほど"], "すい臓は長さ20cmほどの、細長い形をした臓器です。", "pancreas"),
    F("肺はいくつの部分（葉）に分かれている？", "右3つ・左2つ", ["右2つ・左3つ", "右1つ・左1つ", "右2つ・左2つ", "右4つ・左4つ", "右5つ・左5つ"], "右の肺は上葉・中葉・下葉の3つ、左の肺は上葉・下葉の2つです。", "lung"),
    F("1つの腎臓に、糸球体は約いくつ？", "約100万個", ["約10個", "約100個", "約1万個", "約1000億個", "約1000個"], "1つの腎臓に、糸球体は約100万個あります。", "kidney"),
    F("糸球体でろ過された尿（原尿）は、1日におよそ何L？", "およそ150L", ["およそ0.15L", "およそ1.5L", "およそ15000L", "およそ150000L", "およそ0.015L"], "原尿は1日におよそ150Lになり、その約99%がまた吸収されます。", "kidney"),
    F("原尿のうち、また吸収されるのは約何%？", "約99%", ["約1%", "約10%", "約30%", "約50%", "約5%"], "原尿の約99%は尿細管でまた吸収されます。", "kidney"),
    F("体のカルシウムのうち、骨にたくわえられているのは？", "99%以上", ["1%ほど", "10%ほど", "30%ほど", "50%ほど", "5%ほど"], "骨は、体の中にあるカルシウムの99%以上をたくわえています。", "kidney"),
    F("耳の有毛細胞は、片耳に約いくつ並んでいる？", "約15,000個", ["約15個", "約150個", "約1500万個", "約15億個", "約1.5個"], "有毛細胞は片耳に約15,000個並び、音を電気信号に変えます。", "hair"),
  ];

  // 通り道の順番（資料の並びのとおり）。t 名前・q 何が通るか・x 順番・r 出どころ
  const SEQS = [
    { id: "shoka", t: "食べ物の通り道", q: "食べ物", x: ["口", "食道", "胃", "小腸", "大腸", "肛門"], r: ["esoph", "small", "colon"] },
    { id: "ketsu", t: "心臓と肺をめぐる血液の流れ", q: "血液", x: ["大静脈", "右心房", "右心室", "肺動脈", "肺", "肺静脈", "左心房", "左心室", "大動脈"], r: ["ncvc", "heart"] },
    { id: "nyo", t: "尿の通り道", q: "尿", x: ["腎臓", "腎杯", "腎盂", "尿管", "ぼうこう", "尿道"], r: ["bladder"] },
    { id: "oto", t: "音が聞こえるまで", q: "音", x: ["外耳", "中耳", "蝸牛", "聴神経", "脳"], r: ["hair"] },
    { id: "shoku2", t: "小腸の中の順番", q: "食べ物", x: ["十二指腸", "空腸", "回腸"], r: ["small"] },
  ];
  const SEQW = [...new Set(SEQS.flatMap((s) => s.x))];

  // 問題をためる。key は「種類|番号」。同じ種類の中で、文と選び肢が同じ問題は入れない
  const B = [], seen = new Set();
  function add(kind, id, q) {
    const sig = kind + "|" + q.scene.text + "|" + q.opts.slice().sort().join("/");
    if (seen.has(sig)) return false; seen.add(sig);
    if (q.opts.length !== 4 || !q.opts.includes(q.ans) || new Set(q.opts).size !== q.opts.length) throw new Error("bad question " + kind + id);
    B.push({ key: kind + "|" + id, kind, ...q }); return true;
  }
  const Q = (text) => ({ t: "q", text });
  const at = (...xs) => xs.map((x) => ORGANS.indexOf(x));
  const S = (...xs) => [...new Set(xs.map((x) => x.r))];
  const loop = (kind, n, fn) => { for (let i = 0, id = 0; i < n * 30 && id < n; i++) if (fn(rng(seedOf(`gen:${kind}:${i}`)), String(id))) id++; };
  // まちがいの選び肢：x と系がちがい、たがいに近すぎない器官から3つ
  const others = (R, x, same) => pickN(R, ORGANS.filter((y) => y !== x && !near(x, y) && (same ? y.s === x.s : y.s !== x.s && y.s2 !== x.s && y.s !== x.s2)), 3);

  // ── やさしい ──
  // はたらき → 器官（ほかの3つは別の系）
  ORGANS.forEach((x, i) => { for (let v = 0; v < 2; v++) { const ds = others(rng(seedOf(`gen:hataraki:${i}:${v}`)), x, false);
    add("hataraki", `${i}-${v}`, { scene: Q(`「${x.w}」。このはたらきをするのは？`), opts: [x.n, ...ds.map((d) => d.n)], ans: x.n, at: at(x), src: S(x), why: `${x.n}（${x.y}）のはたらきです。${SYSW[x.s]}の仲間です。` }); } });
  // 器官 → 系（系が1つに決まる器官だけ）
  clean.forEach((x) => { const i = ORGANS.indexOf(x); for (let v = 0; v < 2; v++) { const ds = pickN(rng(seedOf(`gen:kei:${i}:${v}`)), SYS.filter((s) => s !== x.s && !(KIN[s] === x.s || KIN[x.s] === s)), 3);
    add("kei", `${i}-${v}`, { scene: Q(`「${x.n}」は、どの仲間？`), opts: [x.s, ...ds].map((s) => SYSW[s]), ans: SYSW[x.s], at: at(x), src: S(x), why: `${x.n}は${SYSW[x.s]}の仲間です。` }); } });
  // 器官 → 読み方
  ORGANS.forEach((x, i) => { if (x.y === x.n) return; const ds = pickN(rng(seedOf("gen:yomi:" + i)), ORGANS.filter((y) => y !== x && y.y !== y.n), 3);
    add("yomi", String(i), { scene: Q(`「${x.n}」の読み方は？`), opts: [x.y, ...ds.map((d) => d.y)], ans: x.y, at: at(x), src: S(x), why: `${x.n}は「${x.y}」と読みます。${SYSW[x.s]}の仲間です。` }); });
  // 系 → 器官（ほかの3つは別の系）
  const BIG = SYS.filter((s) => clean.filter((x) => x.s === s).length >= 2);
  loop("nakama", 40, (R, id) => { const s = BIG[Math.floor(R() * BIG.length)], x = pickN(R, clean.filter((y) => y.s === s), 1)[0], ds = pickN(R, ORGANS.filter((y) => y.s !== s && y.s2 !== s && !near(x, y)), 3);
    return add("nakama", id, { scene: Q(`次のうち、「${SYSW[s]}」の仲間はどれ？`), opts: [x.n, ...ds.map((d) => d.n)], ans: x.n, at: at(x, ...ds), src: S(x),
      why: `${x.n}が${s}です。ほかは、${ds.map((d) => `${d.n}＝${d.s}`).join("・")}です。` }); });

  // ── ふつう ──
  // 器官 → はたらき（ほかの3つは別の系の器官のはたらき）
  ORGANS.forEach((x, i) => { for (let v = 0; v < 2; v++) { const ds = others(rng(seedOf(`gen:setsumei:${i}:${v}`)), x, false);
    add("setsumei", `${i}-${v}`, { scene: Q(`「${x.n}」のはたらきは？`), opts: [x.w, ...ds.map((d) => d.w)], ans: x.w, at: at(x), src: S(x), why: `${x.n}（${x.y}）は${SYSW[x.s]}の仲間です。` }); } });
  // 読み → 書き方
  ORGANS.forEach((x, i) => { if (x.y === x.n) return; const ds = pickN(rng(seedOf("gen:kanji:" + i)), ORGANS.filter((y) => y !== x && y.y !== y.n), 3);
    add("kanji", String(i), { scene: Q(`「${x.y}」と読むのは？`), opts: [x.n, ...ds.map((d) => d.n)], ans: x.n, at: at(x), src: S(x), why: `「${x.y}」は${x.n}と書きます。${SYSW[x.s]}の仲間です。` }); });
  // 通り道の次・前
  SEQS.forEach((q) => q.x.forEach((w, j) => { for (const dir of [1, -1]) { const k = j + dir; if (k < 0 || k >= q.x.length) continue;
    const ans = q.x[k], R = rng(seedOf(`gen:tsugi:${q.id}:${j}:${dir}`)), pool = q.x.filter((y) => y !== ans && y !== w), more = SEQW.filter((y) => !q.x.includes(y));
    const ds = pickN(R, pool, 3); if (ds.length < 3) ds.push(...pickN(R, more, 3 - ds.length));
    add("tsugi", `${q.id}-${j}${dir > 0 ? "n" : "p"}`, { scene: Q(`${q.t}で、「${w}」の${dir > 0 ? "次" : "前"}は？`), opts: [ans, ...ds], ans, at: [], src: q.r, why: `${q.q}は ${q.x.join("→")} の順に進みます。` }); } }));
  // 1つだけ系がちがう器官
  const BIG3 = SYS.filter((s) => clean.filter((x) => x.s === s).length >= 3);
  loop("chigau", 40, (R, id) => { const s = BIG3[Math.floor(R() * BIG3.length)], three = pickN(R, clean.filter((y) => y.s === s), 3), odd = pickN(R, ORGANS.filter((y) => y.s !== s && y.s2 !== s), 1)[0];
    return add("chigau", id, { scene: Q("次のうち、1つだけ仲間がちがうのは？"), opts: [odd.n, ...three.map((d) => d.n)], ans: odd.n, at: at(odd, ...three), src: S(odd, ...three),
      why: `${odd.n}は${odd.s}です。ほかの3つ（${three.map((d) => d.n).join("・")}）は${s}です。` }); });

  // ── むずかしい ──
  // はたらき → 器官（まちがいの選び肢も同じ系から。足りなければ別の系で埋める）
  ORGANS.forEach((x, i) => { for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:onaji:${i}:${v}`)); let ds = others(R, x, true); if (ds.length < 3) ds = ds.concat(others(R, x, false).filter((d) => !ds.some((e) => near(d, e))).slice(0, 3 - ds.length));
    add("onaji", `${i}-${v}`, { scene: Q(`「${x.w}」。どれのはたらき？（同じ仲間から選ぶ）`), opts: [x.n, ...ds.map((d) => d.n)], ans: x.n, at: at(x, ...ds), src: S(x), why: `${x.n}のはたらきです。同じ${x.s}でも、${ds.filter((d) => d.s === x.s).map((d) => d.n).join("・") || "ほか"}とははたらきがちがいます。` }); } });
  // からだの数
  FACTS.forEach((f, i) => { for (let v = 0; v < 2; v++) { const ds = pickN(rng(seedOf(`gen:kazu:${i}:${v}`)), f.d, 3);
    add("kazu", `${i}-${v}`, { scene: Q(f.t), opts: [f.a, ...ds], ans: f.a, at: [], src: [f.r], why: f.why }); } });
  // 通り道の順に3つ並べる（正しい並びは1つ）
  const perm3 = ([a, b, c]) => [[a, b, c], [c, b, a], [b, a, c], [a, c, b]];
  const LONG = SEQS.filter((q) => q.x.length >= 4);
  loop("narabe", 30, (R, id) => { const q = LONG[Math.floor(R() * LONG.length)], idx = pickN(R, q.x.map((_, j) => j), 3).sort((a, b) => a - b), three = idx.map((j) => q.x[j]);
    const [good, ...bad] = perm3(three).map((w) => w.join(" → "));
    return add("narabe", id, { scene: Q(`${q.t}で、通る順に正しく並んでいるのは？`), opts: [good, ...bad], ans: good, at: [], src: q.r, why: `${q.q}は ${q.x.join("→")} の順に進みます。` }); });
  // 器官とはたらきの正しい組み合わせ（3つは別の器官のはたらきと入れかえてある）
  loop("kumi", 40, (R, id) => { const four = pickN(R, ORGANS, 4); if (four.some((a, i) => four.some((b, j) => i < j && (near(a, b) || a.s === b.s)))) return false;
    const [x, ...ys] = four, ws = ys.map((y, j) => ys[(j + 1) % 3].w); // 3つのはたらきをずらして、どれも自分のはたらきにしない
    const short = (w) => w.split("。")[0];
    return add("kumi", id, { scene: Q("器官とはたらきの組み合わせで、正しいのは？"), opts: [`${x.n}：${short(x.w)}`, ...ys.map((y, j) => `${y.n}：${short(ws[j])}`)], ans: `${x.n}：${short(x.w)}`, at: at(...four), src: S(x),
      why: `${x.n}は「${short(x.w)}」。ほかの3つは、はたらきを入れかえてあります。` }); });

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）
  const KINDS = [
    { id: "hataraki", lv: 0, name: "はたらきから", look: "食べ物・血液・息・尿・見る・聞くのどれの話かを考えましょう。" },
    { id: "kei", lv: 0, name: "どの仲間", look: "その器官が、からだのどんな仕事を手伝っているかを考えましょう。" },
    { id: "yomi", lv: 0, name: "読み方", look: "1字ずつの読み方（心＝しん、臓＝ぞう など）を合わせましょう。" },
    { id: "nakama", lv: 0, name: "仲間さがし", look: "その仲間が、からだのどんな仕事をしているかを思い出しましょう。" },
    { id: "setsumei", lv: 1, name: "はたらきを選ぶ", look: "名前の字（肺＝息、腎＝尿、胃・腸＝食べ物）を手がかりにしましょう。" },
    { id: "kanji", lv: 1, name: "書き方", look: "読みを1字ずつに分けて、合う字を考えましょう。" },
    { id: "tsugi", lv: 1, name: "次はどこ", look: "はじめから順に、通るところを1つずつ思い出しましょう。" },
    { id: "chigau", lv: 1, name: "仲間はずれ", look: "4つのうち3つが同じ仲間です。何の仕事をするかを見くらべましょう。" },
    { id: "onaji", lv: 2, name: "同じ仲間から", look: "同じ仲間でも、はたらきの細かいちがいに注目しましょう。" },
    { id: "kazu", lv: 2, name: "からだの数", look: "けたのちがう数がならんでいます。大きさの見当をつけましょう。" },
    { id: "narabe", lv: 2, name: "通る順", look: "まず、いちばんはじめに通るところを決めましょう。" },
    { id: "kumi", lv: 2, name: "正しい組み合わせ", look: "名前とはたらきが合っているかを、1つずつ確かめましょう。" },
  ];
  B.forEach((q) => { q.lv = KINDS.find((k) => k.id === q.kind).lv; });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const BANK = Object.fromEntries(B.map((q) => [q.key, q]));
  const keysOf = (kind) => B.filter((q) => q.kind === kind).map((q) => q.key);
  // key から問題を作る（選び肢の並びは key の種で混ぜる）
  function make(tag) {
    if (!Object.prototype.hasOwnProperty.call(BANK, tag)) return null; const q = BANK[tag];
    const k = BY[q.kind], opts = q.fix ? q.opts.slice() : pickN(rng(seedOf(tag)), q.opts, q.opts.length);
    return { tag, kind: q.kind, lv: k.lv, name: k.name, look: k.look, scene: q.scene, text: q.text || "", opts, ans: q.ans, why: q.why, at: q.at, src: q.src.map((s) => (Array.isArray(s) ? s : SRC[s])) };
  }
  const pickKey = (R, kind) => { const ks = keysOf(kind); return ks[Math.floor(R() * ks.length)]; };
  // 今日の5問：やさしい2・ふつう2・むずかしい1（種類は重ねない）。日付の種で決まり、だれでも同じ
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), m = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...m, ...h].map((k) => pickKey(R, k));
  }
  // 上級：むずかしい3問（今日のむずかしいと別の種類）
  function hardTags(date) {
    const dh = BANK[dailyTags(date)[4]].kind, R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((k) => pickKey(R, k));
  }
  const G = { KINDS, BY, LV, SRC, SYS, SYSW, ORGANS, NEAR, FACTS, SEQS, BANK, keysOf, kindsOf, seedOf, rng, make, dailyTags, hardTags, pickN };
  if (typeof module === "object" && module.exports) module.exports = G; else root.JINTAI = G;
})(typeof window !== "undefined" ? window : globalThis);
