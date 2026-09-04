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
};

const PERSISTED_FIELD_KEYS = [
  "claudeApiKey", "claudeModel",
  "openaiBaseURL", "openaiApiKey", "openaiModel",
  "fishApiKey", "fishVoiceId", "fishModel",
  "elevenApiKey", "elevenVoiceId", "elevenModel",
];

const PRESETS = {
  daily: "今天出门有点晚，公交差点没赶上。路上倒是遇到卖糖炒栗子的，排队买了一小包，边走边吃，手都是热的。到公司才发现钥匙忘拿了，还好前台在，帮我开了门。中午随便吃了碗面，加了个煎蛋，也还挺满足的。",
  mismatch: "又感冒了？跟你说了多穿点，不听。行吧，粥给你煮上了，趁热喝。别用那种委屈巴拉的眼神看我，我就是刚好想煮粥而已，跟你没关系。哦对了，你上次念叨想看的那本书，我顺路买了，放你桌上了，不谢。",
  explain: "可以试试。冷藏和冷冻针对的问题其实不一样——冷藏主要是减缓细菌繁殖，但没法完全停住，熟食放冷藏也就三四天；冷冻是把水分变成冰晶，让细菌基本停止活动，能放更久，只是口感会打点折扣。这两天就吃，冷藏够了；想留久一点，就放冷冻。",
};

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

document.querySelectorAll("#settingsBody input").forEach((input) => {
  input.addEventListener("change", saveSettings);
});

// ---- 设置面板折叠 ----

el("settingsToggle").addEventListener("click", () => {
  const body = el("settingsBody");
  const collapsed = body.hidden;
  body.hidden = !collapsed;
  el("settingsToggleLabel").textContent = collapsed ? "设置（点击收起）" : "设置（点击展开）";
});

function updateProviderFieldsVisibility() {
  const isClaude = fields.provider() === "claude";
  el("claudeFields").hidden = !isClaude;
  el("openaiFields").hidden = isClaude;
}

document.querySelectorAll('input[name="provider"]').forEach((radio) => {
  radio.addEventListener("change", updateProviderFieldsVisibility);
});

// ---- ElevenLabs 同步标注开关 ----
// 关：ElevenLabs 栏保持原文直读，作为"没有 skill"的对照组（demo 原本的设计）。
// 开：ElevenLabs 也读 Fish Audio 那份 TTS Director 标注后的文本，方便对比同一份标注在两个引擎上的音色差异。

let lastOriginalText = "";
let lastAnnotatedText = "";

function updateElevenToggleLabel() {
  el("elevenToggleLabel").textContent = el("elevenAnnotateToggle").checked ? "+ TTS Director 标注" : "原文直读";
}

el("elevenAnnotateToggle").addEventListener("change", () => {
  updateElevenToggleLabel();
  saveSettings();
  if (lastOriginalText || lastAnnotatedText) {
    el("elevenText").value = el("elevenAnnotateToggle").checked ? lastAnnotatedText : lastOriginalText;
  }
});

// ---- Fish Audio 标注开关 ----
// 开（默认）：Fish Audio 栏显示 TTS Director 标注后的文本（demo 原本的设计）。
// 关：Fish Audio 栏也显示原文，方便对比同一个引擎标注前后的效果。

function updateFishToggleLabel() {
  el("fishToggleLabel").textContent = el("fishAnnotateToggle").checked ? "+ TTS Director 标注" : "原文直读";
}

el("fishAnnotateToggle").addEventListener("change", () => {
  updateFishToggleLabel();
  saveSettings();
  if (lastOriginalText || lastAnnotatedText) {
    el("fishText").value = el("fishAnnotateToggle").checked ? lastAnnotatedText : lastOriginalText;
  }
});

// ---- 预设示例 ----

document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    el("inputText").value = PRESETS[btn.dataset.preset] || "";
  });
});

// ---- 标注 ----

el("annotateBtn").addEventListener("click", async () => {
  const text = el("inputText").value.trim();
  if (!text) {
    alert("请先输入中文文本");
    return;
  }

  const provider = fields.provider();
  const payload = { text, provider };
  if (provider === "claude") {
    payload.apiKey = fields.claudeApiKey.value.trim();
    payload.model = fields.claudeModel.value.trim();
  } else {
    payload.apiKey = fields.openaiApiKey.value.trim();
    payload.model = fields.openaiModel.value.trim();
    payload.baseURL = fields.openaiBaseURL.value.trim();
  }

  const btn = el("annotateBtn");
  btn.disabled = true;
  btn.textContent = "正在标注...";
  el("strategyNote").hidden = true;
  el("fishText").value = "";

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
          el("fishText").value = buffer; // 边生成边往框里填，体感快很多
        }
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
    if (strategyText) {
      el("strategyNoteText").textContent = strategyText;
      el("strategyNote").hidden = false;
    }
  } catch (err) {
    alert(`标注失败：${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "用 TTS Director 标注";
  }
});

// ---- 朗读 / 停止 ----

const engineConfig = {
  fish: {
    endpoint: "/api/tts/fish",
    textEl: () => el("fishText"),
    audioEl: () => el("fishAudio"),
    statusEl: () => el("fishStatus"),
    buildPayload: () => ({
      apiKey: fields.fishApiKey.value.trim(),
      voiceId: fields.fishVoiceId.value.trim(),
      model: fields.fishModel.value.trim() || "s2.1-pro-free",
    }),
    missingKeyMsg: "请先在设置中填写 Fish Audio API Key",
  },
  eleven: {
    endpoint: "/api/tts/elevenlabs",
    textEl: () => el("elevenText"),
    audioEl: () => el("elevenAudio"),
    statusEl: () => el("elevenStatus"),
    buildPayload: () => ({
      apiKey: fields.elevenApiKey.value.trim(),
      voiceId: fields.elevenVoiceId.value.trim(),
      model: fields.elevenModel.value.trim() || "eleven_v3",
    }),
    missingKeyMsg: "请先在设置中填写 ElevenLabs API Key",
  },
};

function setStatus(engine, message, isError = false) {
  const statusEl = engineConfig[engine].statusEl();
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
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
  const label = engine === "fish" ? "fish-audio" : "elevenlabs";
  return `${label}-${stamp}.mp3`;
}

function downloadBtnEl(engine) {
  return document.querySelector(`.download-btn[data-engine="${engine}"]`);
}

const DOWNLOAD_ICON_SVG = `<svg class="download-icon" viewBox="0 0 1024 1024" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M511.525926 682.666667c-5.688889 0-11.093333-2.275556-15.075556-6.257778l-170.666666-170.856296c-8.343704-8.343704-8.343704-21.807407 0-30.151112s21.807407-8.343704 30.151111 0l155.591111 155.685926 155.591111-155.685926c8.343704-8.343704 21.807407-8.343704 30.151111 0s8.343704 21.807407 0 30.151112l-170.666667 170.856296c-3.982222 3.982222-9.386667 6.257778-15.075555 6.257778z"/><path fill="currentColor" d="M512 682.192593c-11.757037 0-21.333333-9.576296-21.333333-21.333334V149.333333c0-11.757037 9.576296-21.333333 21.333333-21.333333s21.333333 9.576296 21.333333 21.333333V660.859259c0 11.757037-9.576296 21.333333-21.333333 21.333334z"/><path fill="currentColor" d="M853.333333 853.617778H170.666667c-23.514074 0-42.666667-19.152593-42.666667-42.666667v-182.992592c0-11.757037 9.576296-21.333333 21.333333-21.333334s21.333333 9.576296 21.333334 21.333334v182.992592h682.666666v-182.992592c0-11.757037 9.576296-21.333333 21.333334-21.333334s21.333333 9.576296 21.333333 21.333334v182.992592c0 23.514074-19.152593 42.666667-42.666667 42.666667z"/></svg>`;

// ---- 生成历史（每个引擎最近 5 条，内存中保存，刷新页面会清空） ----

const MAX_HISTORY = 5;
const historyState = { fish: [], eleven: [] };

function truncate(text, max = 24) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatTime(date) {
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

function addHistory(engine, blob, text) {
  const url = URL.createObjectURL(blob);
  const list = historyState[engine];
  list.unshift({ url, blob, text, timestamp: new Date() });
  while (list.length > MAX_HISTORY) {
    const removed = list.pop();
    URL.revokeObjectURL(removed.url);
  }
  renderHistory(engine);
}

function renderHistory(engine) {
  const container = el(engine === "fish" ? "fishHistoryList" : "elevenHistoryList");
  container.innerHTML = "";
  const list = historyState[engine];

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "暂无历史";
    container.appendChild(empty);
    return;
  }

  for (const entry of list) {
    const item = document.createElement("div");
    item.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-item-meta";
    const textSpan = document.createElement("span");
    textSpan.className = "history-item-text";
    textSpan.textContent = truncate(entry.text);
    textSpan.title = entry.text;
    const timeSpan = document.createElement("span");
    timeSpan.className = "history-item-time";
    timeSpan.textContent = formatTime(entry.timestamp);
    meta.append(textSpan, timeSpan);

    const controls = document.createElement("div");
    controls.className = "history-item-controls";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = entry.url;
    const dlBtn = document.createElement("button");
    dlBtn.type = "button";
    dlBtn.className = "history-download-btn";
    dlBtn.innerHTML = DOWNLOAD_ICON_SVG;
    dlBtn.title = "下载这条历史语音";
    dlBtn.addEventListener("click", () => downloadBlob(entry.blob, buildFilename(engine, entry.timestamp)));
    controls.append(audio, dlBtn);

    item.append(meta, controls);
    container.appendChild(item);
  }
}

document.querySelectorAll(".play-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const engine = btn.dataset.engine;
    const cfg = engineConfig[engine];
    const text = cfg.textEl().value.trim();
    const extra = cfg.buildPayload();

    if (!text) return setStatus(engine, "文本为空", true);
    if (!extra.apiKey) return setStatus(engine, cfg.missingKeyMsg, true);
    if (!extra.voiceId) return setStatus(engine, "请先在设置中填写 Voice ID", true);

    btn.disabled = true;
    setStatus(engine, "生成中...");

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
      const url = URL.createObjectURL(blob);
      const audio = cfg.audioEl();
      audio.src = url;
      audio.play();
      setStatus(engine, "");

      cfg.lastBlob = blob;
      downloadBtnEl(engine).disabled = false;
      addHistory(engine, blob, text);
    } catch (err) {
      setStatus(engine, err.message, true);
    } finally {
      btn.disabled = false;
    }
  });
});

document.querySelectorAll(".stop-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const audio = engineConfig[btn.dataset.engine].audioEl();
    audio.pause();
    audio.currentTime = 0;
  });
});

document.querySelectorAll(".download-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const engine = btn.dataset.engine;
    const blob = engineConfig[engine].lastBlob;
    if (!blob) return;
    downloadBlob(blob, buildFilename(engine));
  });
});

loadSettings();
updateProviderFieldsVisibility();
updateElevenToggleLabel();
updateFishToggleLabel();
renderHistory("fish");
renderHistory("eleven");
