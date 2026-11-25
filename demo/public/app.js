const STORAGE_KEY = "tts-director-demo-settings-v1";

const el = (id) => document.getElementById(id);

const fields = {
  provider: () => document.querySelector('input[name="provider"]:checked').value,
  claudeApiKey: el("claudeApiKey"),
  claudeModel: el("claudeModel"),
  openaiBaseURL: el("openaiBaseURL"),
  openaiApiKey: el("openaiApiKey"),
  openaiModel: el("openaiModel"),
  fishApiKey: el("fishApiKey"),
  fishVoiceId: el("fishVoiceId"),
  fishModel: el("fishModel"),
  elevenApiKey: el("elevenApiKey"),
  elevenVoiceId: el("elevenVoiceId"),
  elevenModel: el("elevenModel"),
  maxTokens: el("maxTokens"),
};

const PERSISTED_FIELD_KEYS = [
  "claudeApiKey", "claudeModel",
  "openaiBaseURL", "openaiApiKey", "openaiModel",
  "fishApiKey", "fishVoiceId", "fishModel",
  "elevenApiKey", "elevenVoiceId", "elevenModel",
  "maxTokens",
];

const PRESETS = {
  daily: "今天出门有点晚，公交差点没赶上。路上倒是遇到卖糖炒栗子的，排队买了一小包，边走边吃，手都是热的。到公司才发现钥匙忘拿了，还好前台在，帮我开了门。中午随便吃了碗面，加了个煎蛋，也还挺满足的。",
  mismatch: "又感冒了？跟你说了多穿点，不听。行吧，粥给你煮上了，趁热喝。别用那种委屈巴拉的眼神看我，我就是刚好想煮粥而已，跟你没关系。哦对了，你上次念叨想看的那本书，我顺路买了，放你桌上了，不谢。",
  explain: "可以试试。冷藏和冷冻针对的问题其实不一样——冷藏主要是减缓细菌繁殖，但没法完全停住，熟食放冷藏也就三四天；冷冻是把水分变成冰晶，让细菌基本停止活动，能放更久，只是口感会打点折扣。这两天就吃，冷藏够了；想留久一点，就放冷冻。",
};

// ---- 图标（自绘 SVG，currentColor 上色） ----

const ICONS = {
  play: `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.6 2.7v10.6a.7.7 0 0 0 1.07.6l8.2-5.3a.7.7 0 0 0 0-1.2L5.67 2.1a.7.7 0 0 0-1.07.6z" fill="currentColor"/></svg>`,
  pause: `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1.1" fill="currentColor"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1.1" fill="currentColor"/></svg>`,
  download: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2.5v7.6M4.9 7.1 8 10.2l3.1-3.1M3 13.2h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  wave: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2.5 7v2M5 5v6M7.5 2.5v11M10 5.5v5M12.5 6.5v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  refresh: `<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.47-3.54M13 2.6v3.1H9.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  edit: `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M10.5 2.5l3 3L6 13H3v-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  playLg: `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.3-7.2c.6-.4.6-1.3 0-1.7L8.6 3.9C7.9 3.5 7 4 7 4.8z" fill="currentColor"/></svg>`,
  pauseLg: `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><rect x="5.5" y="4" width="4.5" height="16" rx="1.4" fill="currentColor"/><rect x="14" y="4" width="4.5" height="16" rx="1.4" fill="currentColor"/></svg>`,
  check: `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// ---- 标签分类（和 s2-pro-tags.md 对应；没收录的走关键词兜底） ----

const CAT_LABEL = { emotion: "情绪", para: "停顿呼吸", voice: "音色语调", action: "动作", phoneme: "发音校正" };

const TAG_INFO = {
  sad: ["emotion", "低沉、缓慢、带有悲伤"],
  happy: ["emotion", "明快、上扬、带有愉悦"],
  excited: ["emotion", "加速、上扬、带有兴奋能量"],
  curious: ["emotion", "语调上扬、带有探询感"],
  teasing: ["emotion", "轻快、带有调侃意味"],
  "warmly teasing": ["emotion", "温柔的调侃"],
  surprised: ["emotion", "突然的语调变化，带几分错愕"],
  angry: ["emotion", "加重、加快、带有攻击性"],
  pleased: ["emotion", "温和的满足感"],
  doting: ["emotion", "温柔、宠溺"],
  warm: ["emotion", "温暖、亲近"],
  thoughtful: ["emotion", "沉思、若有所思"],
  serious: ["emotion", "语气变认真"],
  worried: ["emotion", "担心"],
  patient: ["emotion", "耐心"],
  pause: ["para", "中等长度停顿"],
  "short pause": ["para", "短停顿"],
  "long pause": ["para", "长停顿"],
  inhales: ["para", "吸气声"],
  "inhales deeply": ["para", "深吸气"],
  "inhales softly": ["para", "轻柔吸气"],
  exhales: ["para", "呼气声"],
  chuckle: ["para", "轻笑"],
  chuckling: ["para", "一边笑一边说"],
  "with a knowing chuckle": ["para", "了然的轻笑"],
  sigh: ["para", "叹气"],
  "with a soft, fond sigh": ["para", "带着宠溺的轻叹"],
  "warm and amused exhale": ["para", "温暖中带着好笑的呼气"],
  cough: ["para", "咳嗽"],
  "laugh softly": ["para", "柔和的笑声"],
  "clear throat": ["para", "清嗓子"],
  "lip-smacking": ["para", "咂嘴声"],
  rushed: ["voice", "加快语速"],
  soft: ["voice", "降低音量，变柔和"],
  "low and steady": ["voice", "低沉且平稳"],
  muttering: ["voice", "含糊的嘟囔"],
  crying: ["voice", "带哭腔"],
  forceful: ["voice", "加重力度"],
  deadpan: ["voice", "无情绪起伏的平板语调"],
  whispers: ["voice", "耳语"],
  whispering: ["voice", "耳语"],
  "draw out the final syllable": ["voice", "拉长最后一个音节"],
  stammering: ["voice", "结巴"],
  "low voice": ["voice", "压低声音"],
  "under breath": ["voice", "小声嘀咕"],
  sobbing: ["voice", "啜泣"],
  emphasis: ["voice", "强调后面的词"],
  "pacing each word": ["voice", "一字一顿"],
  "with a calm, reassuring tone": ["voice", "平静且令人安心"],
  "voice dropping to a low, sultry tone": ["voice", "声音突然压低、带暧昧意味"],
  "voice softening into a low murmur": ["voice", "声音软下来变成低声呢喃"],
  plead: ["action", "恳求、哀求"],
  "to plead": ["action", "恳求、哀求"],
  comfort: ["action", "安慰、抚慰"],
  "to comfort": ["action", "安慰、抚慰"],
  threaten: ["action", "威胁（可以是玩笑式的）"],
  "to threaten": ["action", "威胁（可以是玩笑式的）"],
  "to charm": ["action", "施展魅力、讨好"],
  begging: ["action", "乞求"],
  motivate: ["action", "鼓励、激励"],
  "feel sorry": ["action", "心疼、同情"],
  playful: ["action", "俏皮、逗乐"],
  accuse: ["action", "指责、控诉"],
  praising: ["action", "夸奖"],
  hesitate: ["action", "犹豫不决"],
  hesitation: ["action", "犹豫不决"],
  complain: ["action", "抱怨"],
  demanding: ["action", "要求"],
  seduce: ["action", "诱惑、撩拨"],
  shame: ["action", "羞愧感、使对方不好意思"],
  punish: ["action", "惩罚（可以是玩笑式的）"],
  dominate: ["action", "强势、主导、压制"],
  intention: ["action", "表达决心、意图坚定"],
  "gently nudging": ["action", "温柔地推动、催促"],
};

function classifyTag(raw) {
  const t = raw.trim().toLowerCase();
  const base = t.replace(/^(slightly|very|extremely|a bit|a little|somewhat|really|quite)\s+/, "");
  const info = TAG_INFO[t] || TAG_INFO[base];
  if (info) return { cat: info[0], desc: info[1] };
  let cat = "emotion";
  if (/(pause|inhal|exhal|sigh|chuckl|laugh|giggl|breath|cough|throat|smack|gasp|sniff|yawn)/.test(t)) cat = "para";
  else if (/(whisper|soft|low|voice|tone|mutter|murmur|emphasis|pacing|slow|rushed|syllable|stammer|sob|cry|loud|quiet|volume)/.test(t)) cat = "voice";
  else if (/^(to |gently )|ing$/.test(t)) cat = "action";
  return { cat, desc: "" };
}

// ---- 标注文本解析 + 和原文逐字比对 ----
// 标签前后紧贴的空格一并吞掉（标签语法要求 `[tag] 文本`，原文里没有这个空格，不吞会被当成改写）。

const TOKEN_RE = /[ \t]*\[([^\[\]\n]{1,80})\][ \t]*|<\|phoneme_start\|>([^<]{1,16})<\|phoneme_end\|>/g;

function tokenize(text) {
  const items = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(text))) {
    for (const ch of text.slice(last, m.index)) items.push({ type: "char", ch });
    items.push(m[1] !== undefined ? { type: "tag", text: m[1] } : { type: "phoneme", text: m[2] });
    last = TOKEN_RE.lastIndex;
  }
  for (const ch of text.slice(last)) items.push({ type: "char", ch });
  return items;
}

function stripTags(text) {
  return tokenize(text).filter((it) => it.type === "char").map((it) => it.ch).join("");
}

function pushSeg(segs, type, text) {
  const prev = segs[segs.length - 1];
  if (prev && prev.type === type && (type === "eq" || type === "ins" || type === "del")) prev.text += text;
  else segs.push({ type, text });
}

function plainSegments(text) {
  const segs = [];
  for (const it of tokenize(text)) {
    if (it.type === "char") pushSeg(segs, "eq", it.ch);
    else segs.push({ type: it.type, text: it.text });
  }
  return segs;
}

const DIFF_CELL_LIMIT = 4_000_000; // 超过就不做改写比对（避免长文本卡顿），只显示标签

function diffChars(a, b) {
  const n = a.length;
  const m = b.length;
  if (n * m > DIFF_CELL_LIMIT) return null;
  const W = m + 1;
  const dp = new Uint16Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * W + j] = a[i] === b[j]
        ? dp[(i + 1) * W + j + 1] + 1
        : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ t: "eq", i, j }); i++; j++; }
    else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) { ops.push({ t: "del", i }); i++; }
    else { ops.push({ t: "ins", j }); j++; }
  }
  while (i < n) ops.push({ t: "del", i: i++ });
  while (j < m) ops.push({ t: "ins", j: j++ });
  return ops;
}

// 返回同一份「原文 + 标注」的合并片段：eq 两边都有，ins 只在标注里（改写），del 只在原文里，tag/phoneme 只在标注里。
// 切换原文/标注时只是给容器换 class，句子原地不动。
function buildSegments(original, annotated) {
  const items = tokenize(annotated);
  const bChars = [];
  const tagsBefore = new Map();
  for (const it of items) {
    if (it.type === "char") bChars.push(it.ch);
    else {
      const k = bChars.length;
      if (!tagsBefore.has(k)) tagsBefore.set(k, []);
      tagsBefore.get(k).push(it);
    }
  }
  const aChars = Array.from(original);
  const ops = diffChars(aChars, bChars);
  if (!ops) return null;

  const segs = [];
  const flushTags = (k) => {
    const list = tagsBefore.get(k);
    if (!list) return;
    for (const t of list) segs.push({ type: t.type, text: t.text });
    tagsBefore.delete(k);
  };
  for (const op of ops) {
    if (op.t === "del") pushSeg(segs, "del", aChars[op.i]);
    else {
      flushTags(op.j);
      pushSeg(segs, op.t, bChars[op.j]);
    }
  }
  flushTags(bChars.length);
  return segs;
}

function makeTagChip(seg) {
  const span = document.createElement("span");
  if (seg.type === "phoneme") {
    span.className = "tag tag-phoneme";
    span.textContent = seg.text;
    span.title = `${CAT_LABEL.phoneme}：读作 ${seg.text}`;
  } else {
    const { cat, desc } = classifyTag(seg.text);
    span.className = `tag tag-${cat}`;
    span.textContent = seg.text;
    span.title = `[${seg.text}]  ${CAT_LABEL[cat]}${desc ? " · " + desc : ""}`;
  }
  return span;
}

function renderSegments(view, segs) {
  const frag = document.createDocumentFragment();
  for (const seg of segs) {
    if (seg.type === "eq") frag.append(document.createTextNode(seg.text));
    else if (seg.type === "ins" || seg.type === "del") {
      const span = document.createElement("span");
      span.className = seg.type === "ins" ? "seg-ins" : "seg-del";
      if (seg.type === "ins") span.title = "skill 改写过的字句";
      span.textContent = seg.text;
      frag.append(span);
    } else frag.append(makeTagChip(seg));
  }
  view.replaceChildren(frag);
}

// ---- 设置：读取/保存到 localStorage ----

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.provider) {
      const radio = document.querySelector(`input[name="provider"][value="${saved.provider}"]`);
      if (radio) radio.checked = true;
    }
    for (const key of PERSISTED_FIELD_KEYS) {
      if (saved[key] !== undefined && fields[key]) fields[key].value = saved[key];
    }
    if (saved.elevenAnnotateEnabled !== undefined) {
      el("elevenAnnotateToggle").checked = saved.elevenAnnotateEnabled;
    }
    if (saved.fishAnnotateEnabled !== undefined) {
      el("fishAnnotateToggle").checked = saved.fishAnnotateEnabled;
    }
  } catch (err) {
    console.warn("读取本地设置失败", err);
  }
}

function saveSettings() {
  const data = {
    provider: fields.provider(),
    elevenAnnotateEnabled: el("elevenAnnotateToggle").checked,
    fishAnnotateEnabled: el("fishAnnotateToggle").checked,
  };
  for (const key of PERSISTED_FIELD_KEYS) {
    data[key] = fields[key].value;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("保存本地设置失败", err);
  }
}

document.querySelectorAll("#settingsBody input").forEach((input) => {
  input.addEventListener("change", () => {
    saveSettings();
    updateSettingsStatus();
  });
  input.addEventListener("input", updateSettingsStatus);
});

// ---- 设置面板开合 + 就绪状态 ----

function setSettingsOpen(open) {
  el("settingsBody").hidden = !open;
  el("settingsToggle").setAttribute("aria-expanded", String(open));
}

el("settingsToggle").addEventListener("click", () => {
  setSettingsOpen(el("settingsBody").hidden);
});
el("settingsClose").addEventListener("click", () => {
  setSettingsOpen(false);
  el("settingsToggle").focus();
});
el("engineChange").addEventListener("click", () => {
  setSettingsOpen(true);
  el("settingsBody").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector('input[name="provider"]:checked').focus({ preventScroll: true });
});

function readiness() {
  const annotator = fields.provider() === "claude"
    ? Boolean(fields.claudeApiKey.value.trim())
    : Boolean(fields.openaiApiKey.value.trim() && fields.openaiModel.value.trim() && fields.openaiBaseURL.value.trim());
  const fish = Boolean(fields.fishApiKey.value.trim() && fields.fishVoiceId.value.trim());
  const eleven = Boolean(fields.elevenApiKey.value.trim() && fields.elevenVoiceId.value.trim());
  return { annotator, fish, eleven, count: Number(annotator) + Number(fish) + Number(eleven) };
}

function updateSettingsStatus() {
  const r = readiness();
  const missing = 3 - r.count;
  el("settingsDot").classList.toggle("is-ready", missing === 0);
  el("settingsToggleLabel").textContent =
    missing === 0 ? "设置 · 已就绪" : r.count === 0 ? "设置 · 先填 API key" : `设置 · 还差 ${missing} 项`;

  const isClaude = fields.provider() === "claude";
  el("engineSummary").textContent = isClaude
    ? `Claude · ${fields.claudeModel.value.trim() || "claude-sonnet-5"}`
    : `OpenAI 兼容 · ${fields.openaiModel.value.trim() || "还没填模型"}`;
  el("fishModelLabel").textContent = fields.fishModel.value.trim() || "s2.1-pro-free";
  el("elevenModelLabel").textContent = fields.elevenModel.value.trim() || "eleven_v3";
}

function updateProviderFieldsVisibility() {
  const isClaude = fields.provider() === "claude";
  el("claudeFields").hidden = !isClaude;
  el("openaiFields").hidden = isClaude;
}

document.querySelectorAll('input[name="provider"]').forEach((radio) => {
  radio.addEventListener("change", updateProviderFieldsVisibility);
});

// ---- 两栏气泡：渲染标签胶囊 + 改写下划线 ----

let lastOriginalText = "";
let lastAnnotatedText = "";

const columns = {
  fish: { text: el("fishText"), view: el("fishView"), toggle: el("fishAnnotateToggle"), renderKey: null },
  eleven: { text: el("elevenText"), view: el("elevenView"), toggle: el("elevenAnnotateToggle"), renderKey: null },
};

function renderColumn(engine) {
  const col = columns[engine];
  const value = col.text.value;
  let key;
  let segs = null;
  let mode = "annotated";

  const isPair = lastOriginalText && lastAnnotatedText && (value === lastAnnotatedText || value === lastOriginalText);
  if (isPair) {
    key = `pair\u0000${lastOriginalText}\u0000${lastAnnotatedText}`;
    mode = value === lastAnnotatedText ? "annotated" : "raw";
    if (col.renderKey !== key) {
      segs = buildSegments(lastOriginalText, lastAnnotatedText);
      if (!segs) {
        key = `plain\u0000${value}`;
        segs = plainSegments(value);
        mode = "annotated";
      }
    }
  } else {
    key = `plain\u0000${value}`;
    if (col.renderKey !== key) segs = plainSegments(value);
  }

  const view = col.view;
  if (segs) {
    // 首次渲染不播放收起/展开动画，只在同一份内容切换模式时播放
    view.classList.add("no-anim");
    view.classList.toggle("is-raw", mode === "raw");
    view.classList.toggle("is-annotated", mode === "annotated");
    renderSegments(view, segs);
    col.renderKey = key;
    void view.offsetWidth;
    view.classList.remove("no-anim");
  } else {
    view.classList.toggle("is-raw", mode === "raw");
    view.classList.toggle("is-annotated", mode === "annotated");
  }
}

const pendingRender = new Set();
function scheduleRender(engine) {
  if (pendingRender.has(engine)) return;
  pendingRender.add(engine);
  requestAnimationFrame(() => {
    pendingRender.delete(engine);
    renderColumn(engine);
  });
}

function setEditing(engine, editing) {
  const col = columns[engine];
  const btn = document.querySelector(`.edit-btn[data-engine="${engine}"]`);
  if (editing) {
    col.view.hidden = true;
    col.text.hidden = false;
    col.text.focus();
  } else {
    col.text.hidden = true;
    col.view.hidden = false;
    renderColumn(engine);
  }
  btn.setAttribute("aria-pressed", String(editing));
  btn.innerHTML = `${editing ? ICONS.check : ICONS.edit}<span>${editing ? "完成" : "编辑"}</span>`;
}

document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.setAttribute("aria-pressed", "false");
  btn.addEventListener("click", () => setEditing(btn.dataset.engine, btn.getAttribute("aria-pressed") !== "true"));
});

for (const engine of Object.keys(columns)) {
  columns[engine].text.addEventListener("input", () => scheduleRender(engine));
}

// ---- 标注 / 原文开关 ----
// Fish 开（默认）：读 TTS Director 标注后的文本；关：读原文，方便对比同一个引擎标注前后的效果。
// ElevenLabs 关（默认）：读原文，作为"没有 skill"的对照组；开：读同一份标注，对比同一份标注在两个引擎上的差异。

// 开关本身就是「标注 | 原文」两段式，选中哪段由 CSS 根据 checked 画出来，不需要另外改文字。
function onToggle(engine) {
  saveSettings();
  if (lastOriginalText || lastAnnotatedText) {
    columns[engine].text.value = columns[engine].toggle.checked ? lastAnnotatedText : lastOriginalText;
  }
  renderColumn(engine);
}

el("fishAnnotateToggle").addEventListener("change", () => onToggle("fish"));
el("elevenAnnotateToggle").addEventListener("change", () => onToggle("eleven"));

// ---- 预设示例 ----

const presetButtons = document.querySelectorAll(".preset-btn");
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    el("inputText").value = PRESETS[btn.dataset.preset] || "";
    presetButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  });
});
el("inputText").addEventListener("input", () => {
  presetButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
});

// ---- Notes：把标注策略说明拆成一条条要点 ----
// 模型通常写成一段话，用句号/分号隔开；也可能自己写成多行或带 "- " 前缀。
// 引号和括号里的标点不断句（比如「行吧。」里的句号）。

const NOTE_OPEN = "「『“‘（(《【";
const NOTE_CLOSE = "」』”’）)》】";

function splitStrategy(text) {
  const items = [];
  for (const line of text.split(/\n+/)) {
    let depth = 0;
    let asciiQuote = false;
    let buf = "";
    for (const ch of line) {
      buf += ch;
      if (ch === '"') asciiQuote = !asciiQuote;
      else if (NOTE_OPEN.includes(ch)) depth++;
      else if (NOTE_CLOSE.includes(ch)) depth = Math.max(0, depth - 1);
      else if (depth === 0 && !asciiQuote && "。；;！？!?".includes(ch)) {
        items.push(buf);
        buf = "";
      }
    }
    items.push(buf);
  }
  return items
    .map((s) => s.trim().replace(/^[-*•·]\s*|^\d+[.、)]\s*/, "").replace(/[；;。]$/, "").trim())
    .filter((s) => s && !/^[。！？!?]+$/.test(s));
}

function renderStrategyNote(text) {
  const list = el("strategyNoteText");
  const frag = document.createDocumentFragment();
  for (const item of splitStrategy(text)) {
    const li = document.createElement("li");
    li.textContent = item;
    frag.append(li);
  }
  list.replaceChildren(frag);
}

// ---- 标注 ----

function setAnnotateStatus(message, isError = false) {
  const status = el("annotateStatus");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

el("annotateBtn").addEventListener("click", async () => {
  const text = el("inputText").value.trim();
  if (!text) {
    setAnnotateStatus("先写一段中文文本，或者点下面的示例。", true);
    el("inputText").focus();
    return;
  }

  const provider = fields.provider();
  const payload = { text, provider };
  const maxTokens = parseInt(fields.maxTokens.value, 10);
  if (Number.isFinite(maxTokens) && maxTokens > 0) payload.maxTokens = maxTokens;
  if (provider === "claude") {
    payload.apiKey = fields.claudeApiKey.value.trim();
    payload.model = fields.claudeModel.value.trim();
  } else {
    payload.apiKey = fields.openaiApiKey.value.trim();
    payload.model = fields.openaiModel.value.trim();
    payload.baseURL = fields.openaiBaseURL.value.trim();
  }

  if (!payload.apiKey) {
    setAnnotateStatus("还没填标注引擎的 API Key，已经帮你打开设置。", true);
    setSettingsOpen(true);
    return;
  }

  const btn = el("annotateBtn");
  btn.disabled = true;
  btn.setAttribute("aria-label", "正在标注…");
  select("fish");
  setAnnotateStatus(""); // 清掉上一次的报错；进行中和完成都不另外提示，结果直接出现在气泡里
  el("strategyNote").hidden = true;
  if (el("fishText").hidden === false) setEditing("fish", false);
  el("fishText").value = "";
  renderColumn("fish");

  const START_MARKER = "===ANNOTATED===";
  const STRATEGY_MARKER = "===STRATEGY===";
  const END_MARKER = "===END===";
  const ERROR_MARKER = "===STREAM_ERROR===";

  try {
    const resp = await fetch("/api/annotate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      // 流还没开始就失败了（比如 key 无效），走的是普通 JSON 错误响应
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || "标注失败");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let phase = "preamble"; // preamble -> annotated -> strategy -> done
    let strategyText = "";
    let streamError = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      if (phase === "preamble") {
        const idx = buffer.indexOf(START_MARKER);
        if (idx === -1) continue;
        buffer = buffer.slice(idx + START_MARKER.length);
        phase = "annotated";
      }

      if (phase === "annotated") {
        const errIdx = buffer.indexOf(ERROR_MARKER);
        const stratIdx = buffer.indexOf(STRATEGY_MARKER);
        if (errIdx !== -1 && (stratIdx === -1 || errIdx < stratIdx)) {
          el("fishText").value = buffer.slice(0, errIdx).trim();
          streamError = buffer.slice(errIdx + ERROR_MARKER.length).trim();
          phase = "done";
        } else if (stratIdx !== -1) {
          el("fishText").value = buffer.slice(0, stratIdx).trim();
          buffer = buffer.slice(stratIdx + STRATEGY_MARKER.length);
          phase = "strategy";
        } else {
          el("fishText").value = buffer.trimStart(); // 边生成边往气泡里填，体感快很多
        }
        scheduleRender("fish");
      }

      if (phase === "strategy") {
        const endIdx = buffer.indexOf(END_MARKER);
        strategyText = endIdx !== -1 ? buffer.slice(0, endIdx).trim() : buffer.trim();
        if (endIdx !== -1) phase = "done";
      }
    }

    if (streamError) throw new Error(streamError);

    if (phase === "preamble") {
      // 模型没按格式来、连 ===ANNOTATED=== 都没出现，把已收到的内容原样当结果，好过报错
      el("fishText").value = buffer.trim();
    } else if (phase === "annotated") {
      el("fishText").value = el("fishText").value.trim();
    }

    lastOriginalText = text;
    lastAnnotatedText = el("fishText").value; // 流式收到的完整标注结果，先存下来，两边的开关都要用
    // 各自的开关决定这一栏显示标注文本还是原文
    el("fishText").value = el("fishAnnotateToggle").checked ? lastAnnotatedText : lastOriginalText;
    el("elevenText").value = el("elevenAnnotateToggle").checked ? lastAnnotatedText : lastOriginalText;
    renderColumn("fish");
    renderColumn("eleven");

    if (strategyText) {
      renderStrategyNote(strategyText);
      el("strategyNote").hidden = false;
    }
  } catch (err) {
    setAnnotateStatus(`标注失败：${err.message}`, true);
    scheduleRender("fish");
  } finally {
    btn.disabled = false;
    btn.setAttribute("aria-label", "开始标注");
  }
});

// ---- 生成 / 播放 ----

const engineConfig = {
  fish: {
    endpoint: "/api/tts/fish",
    label: "fish-audio",
    textEl: () => el("fishText"),
    audioEl: () => el("fishAudio"),
    statusEl: () => el("fishStatus"),
    buildPayload: () => ({
      apiKey: fields.fishApiKey.value.trim(),
      voiceId: fields.fishVoiceId.value.trim(),
      model: fields.fishModel.value.trim() || "s2.1-pro-free",
    }),
    missingKeyMsg: "还没填 Fish Audio 的 API Key，已经帮你打开设置。",
  },
  eleven: {
    endpoint: "/api/tts/elevenlabs",
    label: "elevenlabs",
    textEl: () => el("elevenText"),
    audioEl: () => el("elevenAudio"),
    statusEl: () => el("elevenStatus"),
    buildPayload: () => ({
      apiKey: fields.elevenApiKey.value.trim(),
      voiceId: fields.elevenVoiceId.value.trim(),
      model: fields.elevenModel.value.trim() || "eleven_v3",
    }),
    missingKeyMsg: "还没填 ElevenLabs 的 API Key，已经帮你打开设置。",
  },
};

const voiceState = {
  fish: { duration: 0, blob: null, url: null },
  eleven: { duration: 0, blob: null, url: null },
};

const q = (selector, engine) => document.querySelector(`${selector}[data-engine="${engine}"]`);

function setStatus(engine, message, isError = false) {
  const statusEl = engineConfig[engine].statusEl();
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// 还没生成时是带文字的「生成语音」；生成之后（ready / regenerating）CSS 会把它缩成图标，文字只留给读屏
const GEN_LABELS = {
  gen: [ICONS.wave, "生成语音"],
  loading: [ICONS.wave, "生成中…"],
  regen: [ICONS.refresh, "重新生成"],
  regenerating: [ICONS.refresh, "正在重新生成…"],
};

function setGenLabel(engine, state) {
  const btn = q(".gen-btn", engine);
  const [icon, label] = GEN_LABELS[state];
  btn.innerHTML = `${icon}<span class="gen-label">${label}</span>`;
  btn.title = state === "regen" || state === "regenerating" ? label : "";
}

// ---- 时长：解码真实音频拿到准确时长（metadata 还没到时也能先显示） ----

let decodeCtx = null;

async function analyzeAudio(blob) {
  try {
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctx) throw new Error("no audio context");
    decodeCtx = decodeCtx || new Ctx(1, 1, 44100);
    const buf = await decodeCtx.decodeAudioData(await blob.arrayBuffer());
    return { duration: buf.duration };
  } catch (err) {
    console.warn("解析音频时长失败，等 audio 元素自己读", err);
    return { duration: 0 };
  }
}

function updateProgress(engine) {
  const audio = engineConfig[engine].audioEl();
  const wave = q(".voice-wave", engine);
  const duration = Number.isFinite(audio.duration) ? audio.duration : voiceState[engine].duration;
  if (!voiceState[engine].blob) return;
  const ratio = duration > 0 ? Math.min(1, audio.currentTime / duration) : 0;
  const pct = `${ratio * 100}%`;
  wave.querySelector(".scrub-fill").style.width = pct;
  wave.querySelector(".scrub-knob").style.left = pct;
  wave.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
  wave.setAttribute("aria-valuetext", `${formatDuration(audio.currentTime)} / ${formatDuration(duration)}`);
  q(".voice-time", engine).textContent = formatDuration(audio.currentTime);
  q(".voice-left", engine).textContent = `-${formatDuration(Math.max(0, duration - audio.currentTime))}`;
}

// 播放器四种状态：empty（还没生成）→ loading（第一次生成中）→ ready ⇄ regenerating（保留旧音频，重新生成中）
function setVoiceState(engine, state) {
  const note = q(".voice-note", engine);
  const wave = q(".voice-wave", engine);
  const hasAudio = state === "ready" || state === "regenerating";
  note.dataset.state = state;
  q(".voice-play", engine).disabled = state !== "ready";
  wave.tabIndex = state === "ready" ? 0 : -1;
  q(".download-btn", engine).disabled = !hasAudio;
  if (hasAudio) updateProgress(engine);
  else {
    wave.querySelector(".scrub-fill").style.width = "0%";
    wave.querySelector(".scrub-knob").style.left = "0%";
  }
}

// ---- 同一时间只播一条；开始播放的那张卡会被选中（耳机挂过去） ----

const historyAudios = new Set();

function pauseAllExcept(keep) {
  for (const engine of Object.keys(engineConfig)) {
    const a = engineConfig[engine].audioEl();
    if (a !== keep && !a.paused) a.pause();
  }
  for (const a of historyAudios) if (a !== keep && !a.paused) a.pause();
}

for (const engine of Object.keys(engineConfig)) {
  const audio = engineConfig[engine].audioEl();
  const play = q(".voice-play", engine);
  const compare = el("compare");

  audio.addEventListener("play", () => {
    pauseAllExcept(audio);
    select(engine);
    play.innerHTML = ICONS.pauseLg;
    play.setAttribute("aria-label", play.getAttribute("aria-label").replace("播放", "暂停"));
    compare.dataset.listening = engine;
  });
  const onStop = () => {
    play.innerHTML = ICONS.playLg;
    play.setAttribute("aria-label", play.getAttribute("aria-label").replace("暂停", "播放"));
    if (compare.dataset.listening === engine) delete compare.dataset.listening;
    updateProgress(engine);
  };
  audio.addEventListener("pause", onStop);
  audio.addEventListener("ended", onStop);
  audio.addEventListener("timeupdate", () => updateProgress(engine));
  audio.addEventListener("loadedmetadata", () => updateProgress(engine));

  play.innerHTML = ICONS.playLg;
  play.addEventListener("click", () => {
    if (audio.paused) audio.play().catch((err) => setStatus(engine, `播放失败：${err.message}`, true));
    else audio.pause();
  });

  const wave = q(".voice-wave", engine);
  const seekTo = (ratio) => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : voiceState[engine].duration;
    if (!voiceState[engine].blob || !duration) return;
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
    updateProgress(engine);
  };
  wave.addEventListener("click", (e) => {
    const rect = wave.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  });
  wave.addEventListener("keydown", (e) => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : voiceState[engine].duration;
    if (!duration) return;
    const ratio = audio.currentTime / duration;
    const keys = { ArrowLeft: ratio - 0.05, ArrowDown: ratio - 0.05, ArrowRight: ratio + 0.05, ArrowUp: ratio + 0.05, Home: 0, End: 1 };
    if (e.key in keys) {
      e.preventDefault();
      seekTo(keys[e.key]);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      play.click();
    }
  });

  const dl = q(".download-btn", engine);
  dl.innerHTML = ICONS.download;
  dl.addEventListener("click", () => {
    const blob = voiceState[engine].blob;
    if (blob) downloadBlob(blob, buildFilename(engine));
  });

  const gen = q(".gen-btn", engine);
  setGenLabel(engine, "gen");
  gen.addEventListener("click", () => generate(engine));

  setVoiceState(engine, "empty");
}

async function generate(engine) {
  const cfg = engineConfig[engine];
  const text = cfg.textEl().value.trim();
  const extra = cfg.buildPayload();

  if (!text) return setStatus(engine, "这一栏还没有文本：先点「开始标注」，或者点气泡里的「编辑」自己写。", true);
  if (!extra.apiKey) {
    setSettingsOpen(true);
    return setStatus(engine, cfg.missingKeyMsg, true);
  }
  if (!extra.voiceId) {
    setSettingsOpen(true);
    return setStatus(engine, "还没填 Voice ID，已经帮你打开设置。", true);
  }

  const gen = q(".gen-btn", engine);
  const hadVoice = Boolean(voiceState[engine].blob);
  const audio = cfg.audioEl();
  if (!audio.paused) audio.pause();
  gen.disabled = true;
  setStatus(engine, "");
  setGenLabel(engine, hadVoice ? "regenerating" : "loading");
  setVoiceState(engine, hadVoice ? "regenerating" : "loading");

  try {
    const resp = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, ...extra }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || `请求失败（${resp.status}）`);
    }
    const blob = await resp.blob();
    const { duration } = await analyzeAudio(blob);

    const state = voiceState[engine];
    if (state.url) URL.revokeObjectURL(state.url);
    state.url = URL.createObjectURL(blob);
    state.blob = blob;
    state.duration = duration;

    audio.src = state.url;
    setVoiceState(engine, "ready");
    audio.play().catch(() => {});
    addHistory(engine, blob, text, duration);
  } catch (err) {
    setStatus(engine, err.message, true);
    setVoiceState(engine, hadVoice ? "ready" : "empty");
  } finally {
    gen.disabled = false;
    setGenLabel(engine, voiceState[engine].blob ? "regen" : "gen");
  }
}

// ---- 下载 ----

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildFilename(engine, date = new Date()) {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `${engineConfig[engine].label}-${stamp}.mp3`;
}

// ---- 最近生成（每个引擎最近 5 条，内存中保存，刷新页面会清空） ----

const MAX_HISTORY = 5;
const historyState = { fish: [], eleven: [] };

function formatClock(date) {
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

function addHistory(engine, blob, text, duration) {
  const url = URL.createObjectURL(blob);
  const list = historyState[engine];
  list.unshift({ url, blob, text, duration, timestamp: new Date(), audio: null });
  while (list.length > MAX_HISTORY) {
    const removed = list.pop();
    if (removed.audio) {
      removed.audio.pause();
      historyAudios.delete(removed.audio);
    }
    URL.revokeObjectURL(removed.url);
  }
  renderHistory(engine);
}

function renderHistory(engine) {
  const container = el(engine === "fish" ? "fishHistoryList" : "elevenHistoryList");
  const engineName = engine === "fish" ? "Fish Audio" : "ElevenLabs";
  const list = historyState[engine];

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = `${engineName}：暂无生成记录`;
    container.replaceChildren(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  for (const entry of list) {
    const item = document.createElement("div");
    item.className = "history-item";

    const play = document.createElement("button");
    play.type = "button";
    play.className = `history-play ${engine === "fish" ? "is-fish" : "is-eleven"}`;
    const letter = engine === "fish" ? "F" : "E";
    const isPlaying = entry.audio && !entry.audio.paused;
    play.innerHTML = isPlaying ? ICONS.pause : letter;
    play.classList.toggle("is-playing", Boolean(isPlaying));
    play.setAttribute("aria-label", `播放这条 ${engineName} 历史语音`);
    play.addEventListener("click", () => {
      if (!entry.audio) {
        entry.audio = new Audio(entry.url);
        historyAudios.add(entry.audio);
        const reset = () => {
          play.innerHTML = letter;
          play.classList.remove("is-playing");
        };
        entry.audio.addEventListener("play", () => {
          pauseAllExcept(entry.audio);
          play.innerHTML = ICONS.pause;
          play.classList.add("is-playing");
        });
        entry.audio.addEventListener("pause", reset);
        entry.audio.addEventListener("ended", reset);
      }
      if (entry.audio.paused) entry.audio.play().catch(() => {});
      else entry.audio.pause();
    });

    const textSpan = document.createElement("span");
    textSpan.className = "history-item-text";
    // 列表里只显示去掉标签后的文字，完整的标注文本放在悬停提示里
    textSpan.textContent = stripTags(entry.text).replace(/\s+/g, " ").trim() || entry.text;
    textSpan.title = entry.text;

    const meta = document.createElement("span");
    meta.className = "history-item-meta";
    meta.textContent = `${entry.duration ? formatDuration(entry.duration) + " · " : ""}${formatClock(entry.timestamp)}`;

    const dlBtn = document.createElement("button");
    dlBtn.type = "button";
    dlBtn.className = "history-download-btn";
    dlBtn.innerHTML = ICONS.download;
    dlBtn.title = "下载这条历史语音";
    dlBtn.setAttribute("aria-label", `下载这条 ${engineName} 历史语音`);
    dlBtn.addEventListener("click", () => downloadBlob(entry.blob, buildFilename(engine, entry.timestamp)));

    item.append(play, textSpan, meta, dlBtn);
    frag.append(item);
  }
  container.replaceChildren(frag);
}

// ---- 耳机：选中哪张输出卡，耳机就挂到哪张两侧；耳机线经分线器连回手机 ----
// 动作：朝哪边走哪边那只先动 → 停在挂点外上方一点 → 定一下 → 沿斜线慢慢挂上去（不回弹）。

const stage = el("stage");
const cables = el("cables");
const cards = { fish: document.querySelector('.engine-col[data-engine="fish"]'), eleven: document.querySelector('.engine-col[data-engine="eleven"]') };
const stacked = window.matchMedia("(max-width: 1179px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const BUD_SVG = (id) => `<svg viewBox="0 0 60 150">
  <defs><radialGradient id="bud-h-${id}" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="var(--bud)"/><stop offset=".75" stop-color="var(--bud)"/><stop offset="1" stop-color="var(--bud-edge)"/></radialGradient></defs>
  <rect x="20" y="34" width="12" height="90" rx="6" fill="var(--bud)" stroke="var(--bud-edge)" stroke-width=".9"/>
  <rect x="20" y="118" width="12" height="17" rx="4.5" fill="var(--bud)" stroke="var(--bud-edge)" stroke-width=".9"/>
  <path d="M46 10.7 Q50.8 25 46 39.3 Z" fill="var(--bud-flat)" stroke="var(--bud-edge)" stroke-width=".9" stroke-linejoin="round"/>
  <path d="M47.2 15.5 Q49.4 25 47.2 34.5" fill="none" stroke="#a99c95" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M46 10.7 A23 23 0 1 0 46 39.3 Z" fill="url(#bud-h-${id})" stroke="var(--bud-edge)" stroke-width=".9" stroke-linejoin="round"/>
  <rect x="10" y="22" width="10" height="5.6" rx="2.8" fill="#4a3a37"/>
</svg>`;

const BUD_W = 41, EXIT_Y = 91.6, HOOK = 9;
const buds = [
  { el: el("budL"), dir: 1, ex: 17.8, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, fx: 0, fy: 0, wob: 0, phase: null },
  { el: el("budR"), dir: -1, ex: 23.2, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, fx: 0, fy: 0, wob: 1.7, phase: null },
];
buds[0].el.innerHTML = BUD_SVG("l");
buds[1].el.innerHTML = BUD_SVG("r");

let currentEngine = null;

function budTargets(card) {
  const y = card.offsetTop + card.offsetHeight * 0.3;
  return [
    { x: card.offsetLeft - BUD_W - 16, y },
    { x: card.offsetLeft + card.offsetWidth + 16, y },
  ];
}

function select(engine, instant = false) {
  if (currentEngine === engine) return;
  const first = currentEngine === null;
  currentEngine = engine;
  for (const [name, card] of Object.entries(cards)) card.classList.toggle("is-dim", name !== engine);
  const t = budTargets(cards[engine]);
  const jump = instant || first || reducedMotion.matches || stacked.matches;
  const movingRight = t[0].x > buds[0].x;
  buds.forEach((b, i) => {
    const go = () => {
      if (currentEngine !== engine) return; // 140ms 内又换了卡：作废这次迟到的起步
      b.fx = t[i].x; b.fy = t[i].y;
      if (jump) { b.x = b.tx = b.fx; b.y = b.ty = b.fy; b.vx = b.vy = 0; b.phase = null; return; }
      b.tx = b.fx - b.dir * HOOK; b.ty = b.fy - HOOK;
      b.phase = "approach";
    };
    // 朝哪边走，哪边那只先动：往右时右耳先走，往左时左耳先走
    const lead = (i === 1) === movingRight;
    if (jump || lead) go(); else setTimeout(go, 140);
  });
}

for (const [engine, card] of Object.entries(cards)) {
  card.addEventListener("mouseenter", () => select(engine));
  card.addEventListener("focusin", () => select(engine));
}

function drawCables() {
  const composer = document.querySelector(".composer");
  const phone = el("phone");
  const px = composer.offsetLeft + phone.offsetLeft + phone.offsetWidth / 2;
  const py = composer.offsetTop + phone.offsetTop + phone.offsetHeight;
  const [l, r] = buds.map((b) => ({ x: b.x + b.ex, y: b.y + EXIT_Y }));
  const jx = (l.x + r.x) / 2;
  const card = cards.fish;
  const slack = Math.min(40, (Math.abs(buds[0].vx) + Math.abs(buds[1].vx)) * 0.02);
  const jy = card.offsetTop + card.offsetHeight + 92 + slack * 0.6;
  cables.innerHTML = `
    <g fill="none" stroke="var(--cable)" stroke-width="2.2" stroke-linecap="round">
      <path d="M${l.x} ${l.y} C${l.x} ${l.y + 120 + slack}, ${jx - 34} ${jy - 76}, ${jx} ${jy}"/>
      <path d="M${r.x} ${r.y} C${r.x} ${r.y + 120 + slack}, ${jx + 34} ${jy - 76}, ${jx} ${jy}"/>
      <path d="M${jx} ${jy + 20} C${jx} ${jy + 150 + slack}, ${px} ${py + 190}, ${px} ${py + 28}"/>
    </g>
    <rect x="${jx - 5}" y="${jy - 3}" width="10" height="24" rx="5" fill="var(--bud)" stroke="var(--bud-edge)" stroke-width="1.2"/>
    <rect x="${px - 8}" y="${py + 1}" width="16" height="28" rx="4" fill="var(--bud)" stroke="var(--bud-edge)" stroke-width="1.2"/>
    <rect x="${px - 4}" y="${py - 3}" width="8" height="6" rx="1.5" fill="var(--phone-b)"/>`;
}

let lastFrame = performance.now();
function budFrame(now) {
  const dt = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!stacked.matches) {
    const playing = currentEngine && el("compare").dataset.listening === currentEngine;
    for (const b of buds) {
      let rot = 0;
      if (!reducedMotion.matches) {
        // 临界阻尼弹簧：直接到位，不回弹
        const k = 320, c = 2 * Math.sqrt(k);
        b.vx += (k * (b.tx - b.x) - c * b.vx) * dt;
        b.vy += (k * (b.ty - b.y) - c * b.vy) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        rot = Math.max(-10, Math.min(10, -b.vx * 0.012)); // 被线拖着走，微微后仰
        if (b.phase === "approach" && Math.hypot(b.tx - b.x, b.ty - b.y) < 2 && Math.hypot(b.vx, b.vy) < 40) {
          b.phase = "hold"; b.until = now + 220;
        } else if (b.phase === "hold" && now >= b.until) {
          b.phase = "hook"; b.start = now; b.sx = b.x; b.sy = b.y;
        }
        if (b.phase === "hook") {
          const p = Math.min(1, (now - b.start) / 560);
          const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          b.x = b.sx + (b.fx - b.sx) * e;
          b.y = b.sy + (b.fy - b.sy) * e;
          b.vx = b.vy = 0;
          if (p >= 1) { b.tx = b.fx; b.ty = b.fy; b.phase = null; }
        }
        if (playing) rot += Math.sin((now / 1000) * 46 + b.wob) * 0.7; // 播放时耳机轻微震动
      } else {
        b.x = b.tx = b.fx; b.y = b.ty = b.fy;
      }
      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${rot}deg)`;
    }
    drawCables();
  }
  requestAnimationFrame(budFrame);
}

// 1180px 以上：1400×800 的画布按窗口宽度等比缩小（不放大）；以下改成上下排列，见 style.css
function fitStage() {
  if (stacked.matches) {
    stage.style.transform = "";
    stage.style.marginBottom = "";
    return;
  }
  const scale = Math.min(1, (document.documentElement.clientWidth - 32) / 1400);
  stage.style.transform = `scale(${scale})`;
  stage.style.marginBottom = `${800 * (scale - 1)}px`;
  if (currentEngine) {
    // 布局切换回来后，耳机直接回到当前卡片两侧
    const t = budTargets(cards[currentEngine]);
    buds.forEach((b, i) => { if (!b.phase) { b.x = b.tx = b.fx = t[i].x; b.y = b.ty = b.fy = t[i].y; } });
  }
}
window.addEventListener("resize", fitStage);

// ---- 初始化 ----
// loadSettings() 直接给 checked/value 赋值，不会触发 change 事件，所以这里要手动把依赖这些状态的 UI 同步一遍。

loadSettings();
updateProviderFieldsVisibility();
updateSettingsStatus();
renderColumn("fish");
renderColumn("eleven");
renderHistory("fish");
renderHistory("eleven");
fitStage();
select("fish", true);
requestAnimationFrame(budFrame);
if (readiness().count === 0) setSettingsOpen(true);
