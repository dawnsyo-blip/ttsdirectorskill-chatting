# TTS Director — 项目说明

一个 Claude Code skill（`tts-director`），给中文文本自动插入 Fish Audio S2 Pro 的方括号情感/韵律标签，并配了一个本地网页 demo 用来对比 Fish Audio 和 ElevenLabs 的朗读效果。

## 目录结构

```
.
├── SKILL.md                    # skill 主文件（触发条件、标注流程、核心原则）
├── s2-pro-tags.md              # 标签速查表
├── examples.md                 # 输入输出对照样本
├── polyphone-checklist.md      # 多音字音素控制速查表（按需读取，不是每次都要读）
├── 测试文本1/2/3.md             # 实测标注结果的存档，文件内有版本变更记录
├── 测试文本3图片/                # 测试文本3的截图来源
├── claude-code-instructions.md # 早期规划文档，部分内容已过时（见下方"和早期规划文档的出入"）
├── tts-director-demo-spec.md   # 早期规划文档，同上
├── tts-director-roadmap-updated.md
└── demo/                       # 对比测试网页（见下方"demo/ 说明"）
```

**重要：** skill 的四个文件（`SKILL.md`、`s2-pro-tags.md`、`examples.md`、`polyphone-checklist.md`）都在仓库根目录，**不在** `skill/references/` 子目录下。早期版本里 `SKILL.md`/`s2-pro-tags.md` 正文自己还留着 `references/xxx.md` 这种历史遗留写法（指向一个不存在的子目录），已经清理成直接写文件名；`demo/server/skillPrompt.js` 拼接 system prompt 时插入的分隔符标题也同步改了。只有 `claude-code-instructions.md`（早期规划文档，本地保留、未纳入公开仓库）里还留着这种旧写法，纯粹是历史记录，不代表现在的真实路径。

## SKILL.md 的核心设计原则

- **克制优先**：默认不标注，加标签要能说清楚"不加会有什么问题"。
- **表里一致性判断**：标注密度取决于文本表面语义和真实意图的距离，不取决于情绪强度。
- **文本改写和标签插入同等重要**：断句、加语气词、调语序经常比加标签更有效。
- 标签选择经常是**反直觉**的：命令句要用软标签而不是硬标签，全知型人设不能用 `[surprised]`，deadpan 在这个模型上表现不出"嘴硬心软"的反差。
- 完整规则见 `SKILL.md` 正文，标签清单见 `s2-pro-tags.md`——这两个文件已经过一轮精简（原来 58KB → 现在约 36KB，合并了大量重复/散落的小节），不要再无脑地在多处重复写同一条规则，新规则优先判断该放在 SKILL.md（原则/推理）还是 s2-pro-tags.md（纯速查）。

## demo/ 说明

本地 Node/Express + 原生 HTML/CSS/JS 网页，用来一键对比"加了 skill 标注的 Fish Audio"和"原文直读的 ElevenLabs"。

**运行：** `cd demo && npm install && npm start`，浏览器打开 `http://localhost:3787`。改了 `server/` 下的代码要重启进程；`public/` 下的前端静态文件刷新页面就生效，不用重启。

**关键设计决策：**

- **不是 Claude Artifact**：Artifact 沙盒的 CSP 只放行白名单 CDN，fetch 不了 Fish Audio / ElevenLabs / 任意 LLM API，所以必须做成本地项目，后端负责转发请求。
- **标注引擎不锁定某一家**：设置里可选 Claude（走官方 `@anthropic-ai/sdk`）或"OpenAI 兼容接口"（自填 Base URL + Key + 模型名，走原始 `fetch`，兼容 DeepSeek/Moonshot/自建网关等）。Claude 路径加了 prompt caching（`cache_control: ephemeral`）。
- **标注输出格式是分隔符文本，不是 JSON**：`===ANNOTATED===...===STRATEGY===...===END===`。最早用 JSON 格式让模型自己写，结果模型对标注文本里的换行/引号转义不可靠，经常吐出无效 JSON——换成不需要转义的纯文本分隔符更稳。
- **标注是流式返回的**：前端边收边把文字填进 Fish Audio 那栏，体感更快；也顺带避免了长输出的超时问题。
- **API key 全部是浏览器 localStorage + 每次请求带过去，服务端不落盘**——所以这个 demo 可以整个分享给别人，对方用自己的 key 本地跑。
- **代理**：Node 的 `fetch`（undici）不会像 curl/浏览器那样自动读系统代理。`server/index.js` 里检测 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量，用 `undici` 的 `ProxyAgent` + `setGlobalDispatcher` 统一接管所有出站请求。如果之后又遇到"curl 能连、Node fetch 连不上/超时"的情况，先查这里。
- **Fish Audio 模型选择是 HTTP header**（`model` 头，不是 body 字段！），可选 `s2.1-pro` / `s2.1-pro-free`（demo 里默认，因为免费）/ `s2-pro` / `s1`。**ElevenLabs 模型选择是 body 里的 `model_id`**，可选 `eleven_v3` / `eleven_multilingual_v2` / `eleven_flash_v2_5` / `eleven_turbo_v2_5`。两边设置里都是 `<input list>` + `<datalist>`，预设候选 + 允许手打任意值。
- **ElevenLabs 默认展示原文、不加标签**——设计意图是对比"skill 标注过的 Fish Audio" vs "完全没有标注、ElevenLabs 自己处理"。但 ElevenLabs 栏标题旁有个"同步标注"开关（`#elevenAnnotateToggle`），打开后 ElevenLabs 也会用和 Fish Audio 相同的标注文本（方便对比同一份标注在两个引擎上的音色差异），关闭（默认）则保持原文直读。开关状态存 localStorage；`app.js` 里用 `lastOriginalText`/`lastAnnotatedText` 两个模块级变量缓存最近一次标注结果的原文/标注文本对，切换开关时不用重新调用标注接口就能实时切换 `elevenText` 的内容。
- **生成的语音可以下载，也有历史记录**：Fish Audio / ElevenLabs 播放区旁各有一个"下载"按钮（下载当次生成的音频），下面还有"生成历史"区，两个引擎分别保留最近 5 条（超出自动淘汰最早的，同时 `URL.revokeObjectURL` 释放内存），每条历史都能单独下载。历史只存在内存里（`historyState` 变量），刷新页面会清空，没做持久化——音频 blob 不适合塞进 localStorage。下载统一走 `downloadBlob()`：造一个临时 `<a download>` 触发点击，而不是依赖 `<audio>` 当前的 `src`（那个 object URL 可能已经被后续操作替换/回收）。
- **UI 主题**：tweakcn 的 "Vintage Paper" 预设（从 `github.com/jnsahaj/tweakcn` 的 `utils/theme-presets.ts` 里直接抄的色值），字体 Libre Baskerville / Lora / IBM Plex Mono。图标全部是手动传入的 SVG（`fill="currentColor"` + CSS `color: var(--primary)` 上色），不用 emoji、不用图标字体库。

**踩过的坑（下次遇到类似症状直接查这里，不用重新排查）：**

- **`hidden` 属性被 CSS 覆盖**：如果某个元素同时有 `hidden` 属性和一条设了 `display: flex/block` 的 class 规则，且这条 class 规则和浏览器默认的 `[hidden]{display:none}` 优先级打平，author 样式会赢，导致 `hidden` 形同虚设。全局补了一条 `[hidden] { display: none !important; }` 兜底。新加类似的可切换显示/隐藏的元素时留意这个。
- **JS 里 `el.checked = true` 不会触发 `change` 事件**：`loadSettings()` 从 localStorage 恢复 radio/checkbox 选中状态时是直接赋值，不会触发依赖 `change` 事件联动的显示/隐藏/文案逻辑。所以任何"页面加载时要根据已保存状态同步 UI"的地方，都要在赋值后手动调用一次同步函数（`updateProviderFieldsVisibility()`、`updateElevenToggleLabel()` 这些），不能指望事件监听器自动触发。**每加一个新的持久化开关/单选，都要检查有没有补这一步。**
- **`<label>` 自定义 flex 布局，一定要显式写 `flex-direction`**：全局有条给设置表单用的通用规则 `label { display: flex; flex-direction: column; font-size: 0.85rem; ... }`。任何新的 `.xxx-label`/`.toggle-row` 之类的自定义 class，只要本身是个 `<label>` 标签，只覆盖了 `display` 而没覆盖 `flex-direction`（以及 `font-size`/`color` 等），那些没覆盖的属性会被这条通用规则渗透——这个坑在这个项目里已经复现过不止一次（`.input-area-label` 一次，`.toggle-row` 又一次），根源是 CSS 覆盖是按属性生效、不是按规则整体生效。**结论：以后凡是新写一个包裹 `<label>` 的自定义 class，直接把 `display`/`flex-direction`/`align-items`/`gap`/`font-size`/`color` 这几个属性一次性显式写全，不要只改"看起来不对"的那一个属性，也不要等出问题了再一条条补。**
- **CSS 规则忘记覆盖某个属性会被更早/更通用的规则渗透**：上面那条是这个更通用问题的一个具体案例，凡是新加覆盖性 class 都要留意，不限于 `<label>`。
- **标注请求"成功"但结果是空的，且不报错**：`server/routes/annotate.js` 里 `res.end()` 只要没抛异常就算成功，但如果模型一个 token 都没吐（比如 DeepSeek 的 `xxx-flash`/`xxx-reasoner` 这类推理模型，把 `max_tokens` 全部花在了流式返回的 `delta.reasoning_content`（思考过程）上，还没轮到 `delta.content`（正文）就因为 `finish_reason: "length"`被截断），前端会拿到一个 200 但空 body 的响应，`fishText` 静默留空、`elevenText` 却正常填入原文，表现得像"什么都没做但也没报错"。现在已经修了：`streamOpenAICompatible()` 会识别 `reasoning_content` 和 `finish_reason`，router 里如果 `!wroteAny`（一个字节都没往前端写过）就主动抛一个能说明原因的错误，不再静默成功；同时把两边的 `max_tokens` 从 4096 调到了 8192，给推理模型留思考空间。**排查同类"标注栏空白但没报错"的问题，先看这里。**
- **本地起的 `npm start` 进程忘了关，下次再起会 `EADDRINUSE`**：Windows 上关掉终端窗口不一定会杀掉子进程 `node.exe`，尤其是之前用 Claude Code 的后台任务（`run_in_background`）起过一次服务、会话被压缩（`/compact`）之后就跟丢了那个后台任务的引用，进程本身还占着 3787 端口。排查方法：`Get-NetTCPConnection -LocalPort 3787 | Select OwningProcess`，找到 PID 后 `Get-Process -Id <PID>` 确认是 `node.exe`（不是别的占用了这个端口的东西），确认后 `Stop-Process -Id <PID> -Force` 再重新 `npm start`。

## 和早期规划文档的出入

`claude-code-instructions.md`、`tts-director-demo-spec.md`、`tts-director-roadmap-updated.md` 是项目早期（demo 开工之前）写的规划文档，和实际实现有几处出入，读的时候注意：

- 规划文档假设 demo 能做成 Claude Artifact；实际因为 CSP 限制改成了本地 Node 项目（见上）。
- 规划文档假设标注固定调用 Anthropic API；实际做成了可选 Claude / 任意 OpenAI 兼容接口。
- 规划文档假设输出格式是 JSON；实际改成了分隔符文本格式（原因见上）。
- 规划文档里 skill 文件路径是 `skill/SKILL.md` + `skill/references/*.md`；实际都在仓库根目录平铺。

以上几点以本文件和 `demo/README.md` 为准。
