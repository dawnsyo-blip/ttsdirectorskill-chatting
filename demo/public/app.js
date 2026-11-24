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
    ? `标注引擎：Claude · ${fields.claudeModel.value.trim() || "claude-sonnet-5"}`
    : `标注引擎：OpenAI 兼容 · ${fields.openaiModel.value.trim() || "还没填模型"}`;
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
    col.text.style.height = `${Math.max(col.view.offsetHeight, 200)}px`;
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

function updateFishToggleLabel() {
  el("fishToggleLabel").textContent = el("fishAnnotateToggle").checked ? "标注" : "原文";
}

function updateElevenToggleLabel() {
  el("elevenToggleLabel").textContent = el("elevenAnnotateToggle").checked ? "标注" : "原文";
}

function onToggle(engine, updateLabel) {
  updateLabel();
  saveSettings();
  if (lastOriginalText || lastAnnotatedText) {
    columns[engine].text.value = columns[engine].toggle.checked ? lastAnnotatedText : lastOriginalText;
  }
  renderColumn(engine);
}

el("fishAnnotateToggle").addEventListener("change", () => onToggle("fish", updateFishToggleLabel));
el("elevenAnnotateToggle").addEventListener("change", () => onToggle("eleven", updateElevenToggleLabel));

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

// ---- 标注 ----

function setAnnotateStatus(message, isError = false) {
  const status = el("annotateStatus");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

el("annotateBtn").addEventListener("click", async () => {
  const text = el("inputText").value.trim();
  if (!text) {
    setAnnotateStatus("先写一段中文文本，或者点上面的示例。", true);
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
  btn.textContent = "正在标注…";
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
      el("strategyNoteText").textContent = strategyText;
      el("strategyNote").hidden = false;
    }
  } catch (err) {
    setAnnotateStatus(`标注失败：${err.message}`, true);
    scheduleRender("fish");
  } finally {
    btn.disabled = false;
    btn.textContent = "开始标注";
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
  fish: { peaks: null, duration: 0, blob: null, url: null },
  eleven: { peaks: null, duration: 0, blob: null, url: null },
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

// ---- 波形：按真实音频解码出的振幅画柱子 ----

const PEAK_RESOLUTION = 160;
let decodeCtx = null;

async function analyzeAudio(blob) {
  try {
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctx) throw new Error("no audio context");
    decodeCtx = decodeCtx || new Ctx(1, 1, 44100);
    const buf = await decodeCtx.decodeAudioData(await blob.arrayBuffer());
    const data = buf.getChannelData(0);
    const size = Math.max(1, Math.floor(data.length / PEAK_RESOLUTION));
    const peaks = [];
    for (let b = 0; b < PEAK_RESOLUTION; b++) {
      let max = 0;
      const end = Math.min((b + 1) * size, data.length);
      for (let i = b * size; i < end; i += 8) {
        const v = Math.abs(data[i]);
        if (v > max) max = v;
      }
      peaks.push(max);
    }
    const top = Math.max(...peaks) || 1;
    return { peaks: peaks.map((p) => Math.max(0.08, p / top)), duration: buf.duration };
  } catch (err) {
    console.warn("解析音频波形失败，改用占位波形", err);
    return { peaks: null, duration: 0 };
  }
}

function placeholderPeaks(count, seed = 7) {
  const out = [];
  let x = seed;
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    out.push(0.25 + (x / 233280) * 0.5);
  }
  return out;
}

function resamplePeaks(peaks, count) {
  if (!peaks || peaks.length === 0) return new Array(count).fill(0.12);
  const out = [];
  const step = peaks.length / count;
  for (let i = 0; i < count; i++) {
    let max = 0;
    const end = Math.min(peaks.length, Math.ceil((i + 1) * step));
    for (let j = Math.floor(i * step); j < end; j++) max = Math.max(max, peaks[j]);
    out.push(max);
  }
  return out;
}

function renderBars(wave, peaks) {
  const width = wave.clientWidth || 240;
  const count = Math.max(12, Math.min(64, Math.floor(width / 6)));
  const values = resamplePeaks(peaks, count);
  const frag = document.createDocumentFragment();
  for (const v of values) {
    const bar = document.createElement("span");
    bar.style.height = `${Math.round(4 + v * 26)}px`;
    frag.append(bar);
  }
  wave.replaceChildren(frag);
}

function updateProgress(engine) {
  const audio = engineConfig[engine].audioEl();
  const wave = q(".voice-wave", engine);
  const time = q(".voice-time", engine);
  const duration = Number.isFinite(audio.duration) ? audio.duration : voiceState[engine].duration;
  if (!voiceState[engine].blob) return;
  const ratio = duration > 0 ? Math.min(1, audio.currentTime / duration) : 0;
  const bars = wave.children;
  const played = Math.round(ratio * bars.length);
  for (let i = 0; i < bars.length; i++) bars[i].classList.toggle("is-played", i < played);
  wave.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
  wave.setAttribute("aria-valuetext", `${formatDuration(audio.currentTime)} / ${formatDuration(duration)}`);
  // 像语音消息一样只显示一个时间：播放中显示已播时长，否则显示总时长，宽度稳定不挤波形
  const started = (!audio.paused || audio.currentTime > 0.05) && !audio.ended;
  time.textContent = formatDuration(started ? audio.currentTime : duration);
}

// 语音条四种状态：empty（还没生成）→ loading（第一次生成中）→ ready ⇄ regenerating（保留旧波形，重新生成中）
function barsFor(engine, state) {
  if (state === "ready" || state === "regenerating") return voiceState[engine].peaks || placeholderPeaks(64);
  if (state === "loading") return placeholderPeaks(64, engine.length * 11);
  return null;
}

function setVoiceState(engine, state) {
  const note = q(".voice-note", engine);
  const wave = q(".voice-wave", engine);
  const play = q(".voice-play", engine);
  const hasAudio = state === "ready" || state === "regenerating";
  note.dataset.state = state;
  renderBars(wave, barsFor(engine, state));
  play.disabled = state !== "ready";
  wave.tabIndex = state === "ready" ? 0 : -1;
  q(".download-btn", engine).disabled = !hasAudio;
  if (hasAudio) updateProgress(engine);
}

// ---- 焦点跟着耳朵走：同一时间只播一条，正在播的那栏亮着，另一栏退后 ----

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
    play.innerHTML = ICONS.pause;
    play.setAttribute("aria-label", play.getAttribute("aria-label").replace("播放", "暂停"));
    compare.dataset.listening = engine;
  });
  const onStop = () => {
    play.innerHTML = ICONS.play;
    play.setAttribute("aria-label", play.getAttribute("aria-label").replace("暂停", "播放"));
    if (compare.dataset.listening === engine) delete compare.dataset.listening;
    updateProgress(engine);
  };
  audio.addEventListener("pause", onStop);
  audio.addEventListener("ended", onStop);
  audio.addEventListener("timeupdate", () => updateProgress(engine));
  audio.addEventListener("loadedmetadata", () => updateProgress(engine));

  play.innerHTML = ICONS.play;
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
    const { peaks, duration } = await analyzeAudio(blob);

    const state = voiceState[engine];
    if (state.url) URL.revokeObjectURL(state.url);
    state.url = URL.createObjectURL(blob);
    state.blob = blob;
    state.peaks = peaks;
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

// 窗口变宽变窄时按新宽度重画波形柱子数量
if ("ResizeObserver" in window) {
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const engine = entry.target.dataset.engine;
      renderBars(entry.target, barsFor(engine, q(".voice-note", engine).dataset.state));
      updateProgress(engine);
    }
  });
  document.querySelectorAll(".voice-wave").forEach((w) => ro.observe(w));
}

// ---- 初始化 ----
// loadSettings() 直接给 checked/value 赋值，不会触发 change 事件，所以这里要手动把依赖这些状态的 UI 同步一遍。

loadSettings();
updateProviderFieldsVisibility();
updateElevenToggleLabel();
updateFishToggleLabel();
updateSettingsStatus();
renderColumn("fish");
renderColumn("eleven");
renderHistory("fish");
renderHistory("eleven");
if (readiness().count === 0) setSettingsOpen(true);
