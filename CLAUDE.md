# TTS Director — 项目说明

一个 Claude Code skill（`tts-director`），给中文文本自动插入 Fish Audio S2 Pro 的方括号情感/韵律标签，并配了一个本地网页 demo 用来对比 Fish Audio 和 ElevenLabs 的朗读效果。

## 目录结构

```
.
├── SKILL.md                    # skill 主文件（触发条件、标注流程、核心原则）
├── s2-pro-tags.md              # 标签速查表
├── examples.md                 # 输入输出对照样本
├── polyphone-checklist.md      # 多音字音素控制速查表（按需读取，不是每次都要读）
├── SKILL-mini.md               # 上面四个文件的浓缩替代版（见下方"SKILL-mini.md"）
├── README.md                   # 公开仓库首页
├── CLAUDE.md                   # 本文件
├── docs/demo-screenshot.png    # README 里用的 demo 截图
├── tts-director-roadmap-updated.md
├── demo/                       # 对比测试网页（见下方"demo/ 说明"）
│
│  ——— 以下文件本地保留、被 .gitignore 排除，不在公开仓库里 ———
├── 测试文本1/2/3.md             # 实测标注结果的存档，文件内有版本变更记录
├── 测试文本3图片/                # 测试文本3的截图来源（真实聊天截图，不公开）
├── 中文音素控制 - Fish Audio.pdf # 第三方参考资料
├── claude-code-instructions.md # 早期规划文档，部分内容已过时（见下方"和早期规划文档的出入"）
└── tts-director-demo-spec.md   # 早期规划文档，同上
```

**重要：** skill 的四个文件（`SKILL.md`、`s2-pro-tags.md`、`examples.md`、`polyphone-checklist.md`）都在仓库根目录，**不在** `skill/references/` 子目录下。早期版本里 `SKILL.md`/`s2-pro-tags.md` 正文自己还留着 `references/xxx.md` 这种历史遗留写法（指向一个不存在的子目录），已经清理成直接写文件名；`demo/server/skillPrompt.js` 拼接 system prompt 时插入的分隔符标题也同步改了。只有 `claude-code-instructions.md`（早期规划文档，本地保留、未纳入公开仓库）里还留着这种旧写法，纯粹是历史记录，不代表现在的真实路径。

## SKILL.md 的核心设计原则

- **克制优先**：默认不标注，加标签要能说清楚"不加会有什么问题"。
- **表里一致性判断**：标注密度取决于文本表面语义和真实意图的距离，不取决于情绪强度。
- **文本改写和标签插入同等重要**：断句、加语气词、调语序经常比加标签更有效。
- 标签选择经常是**反直觉**的：命令句要用软标签而不是硬标签，全知型人设不能用 `[surprised]`，deadpan 在这个模型上表现不出"嘴硬心软"的反差。
- **整体在往"更克制"的方向收**（都是实听反馈驱动的）：堆叠硬上限 2 个、不允许 3 个（原来有"三个不同类别可以破例"的说法，已取消）；`[pause]`、`[whispering]`、呼吸类（`[inhales]` 系列/`[exhales]`）、`[sigh]` 都从"鼓励用"改成了"克制用，只在关键处加"。新加规则时留意这个方向，别又写成鼓励高频使用。
- 完整规则见 `SKILL.md` 正文，标签清单见 `s2-pro-tags.md`——这两个文件已经过一轮精简（原来 58KB → 现在约 36KB，合并了大量重复/散落的小节），不要再无脑地在多处重复写同一条规则，新规则优先判断该放在 SKILL.md（原则/推理）还是 s2-pro-tags.md（纯速查）。
- **改规则时同步检查 `examples.md`**：这个文件里的示例经常自己就在演示旧规则。已经踩过两次——禁止 3 标签堆叠时，示例 7a 的标题和结论正好在推荐三标签堆叠；调停顿规则时，好几处"标注输出/推荐版"里的写法本身就违反新规则。**加/改一条规则之后，顺手 grep 一遍 examples.md，别让示例和规则打架。**
- **实测结论要留住"证据"再改规则**：TTS 生成本身带随机性（`temperature: 0.7`/`top_p: 0.7` 写死在 `demo/server/routes/tts.js`，同一段文本每次结果都不一样），所以"听到一次怪声"不等于"某条规则有问题"。曾经据此加过一条"停顿标签不参与堆叠"的规则，后来发现归因错了，整条 revert 掉了（commit `2878e66`）。判断某个标签用法是否真有问题，最好用同一段文本多跑几次对比，而不是单次听感。

## SKILL-mini.md（浓缩版）

四个 skill 文件合计约 **11000 token**（SKILL.md ≈3800、s2-pro-tags.md ≈2000、examples.md ≈3300、polyphone-checklist.md ≈700）。`SKILL-mini.md` 是它们的压缩替代版，约 **1785 token**（16%，6 倍压缩），给 token 敏感的接入场景用。

**压缩时的取舍逻辑**（以后再压/再改都按这个思路）：

- **不能砍的是标签词表**。模型不知道 S2 Pro 认哪些标签，`[gently nudging]`、`[with a knowing chuckle]` 这种不是通用常识，猜不出来。砍掉词表是**断崖式**退化——模型会生成语法对但引擎不认的标签，甚至冒出 `[wind]` 这类 S2 Pro 根本不生成的环境音标签（所以"不支持的标签类型"那条护栏也必须留）。浓缩版保留了全部 77 个标签，只合并掉 5 个同义写法（`[whispers]`/`[whispering]`、`[plead]`/`[to plead]` 之类）。
- **可以砍的是推理和示例**。原则、判断逻辑这些压成口号后是**渐进**退化，模型能靠自身能力补一部分。最主要的损失是"标注密度感"——那个只有示例教得了。
- 所以 200 token 那种量级做不到：光标签名本身就要三四百 token。1500-2500 token 是性价比拐点。

改了完整版的规则之后，如果那条规则也在浓缩版里，记得同步；反过来浓缩版不需要跟着完整版的每次措辞调整走。

## 发布与部署

- **公开仓库**：https://github.com/dawnsyo-blip/ttsdirectorskill-chatting （main 分支）
- **在线 demo**：https://ttsdirectorskill-chatting.onrender.com （Render 免费档）

**Render 配置（这几项必须是这样，别改回去）：**

| 项 | 值 |
|---|---|
| Root Directory | **留空**（不要填 `demo`） |
| Build Command | `cd demo && npm install` |
| Start Command | `cd demo && npm start` |
| Auto-Deploy | On Commit |

**为什么 Root Directory 必须留空**：Render 的说明写着"code changes outside of this directory do not trigger an auto-deploy"。之前 Root Directory 填的是 `demo`，结果只改根目录 skill 文件（`SKILL.md`/`examples.md`/`s2-pro-tags.md`）的提交**完全不会触发自动部署**，因为改动不在 `demo/` 里——但这些文件恰恰是 `skillPrompt.js` 启动时要读的，Render 不知道这层依赖。表现是"推送了但线上没变化，每次都要手动点 Manual Deploy"。排查时先怀疑这个，而不是 GitHub 授权/Webhook（GitHub 仓库 Settings→Webhooks 页面是空的属于正常：Render 走的是 GitHub App 授权，不是老式仓库 webhook）。

改成 Root Directory 留空 + `cd demo && ...` 之后，整个仓库的改动都会触发部署。注意 `demo/server/index.js` 里所有路径都基于 `import.meta.url` 算，不依赖进程工作目录，所以换目录跑不会出问题。

**免费档特性**：长时间无访问会休眠，下次首个请求要等 30-60 秒唤醒。只影响响应速度，不影响跑的是哪个版本的代码。

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
- **两栏标题旁各有一个"标注/原文"开关**（`#fishAnnotateToggle` 默认开、`#elevenAnnotateToggle` 默认关）：默认状态就是原本的设计意图——Fish Audio 读标注版、ElevenLabs 读原文，作为"有 skill vs 没 skill"的对照；但两边都能单独切到对方模式（对比同一份标注在两个引擎上的差异，或者对比同一个引擎标注前后的差异）。开关状态存 localStorage；`app.js` 里用 `lastOriginalText`/`lastAnnotatedText` 两个模块级变量缓存最近一次标注的原文/标注文本对，切换开关时不用重新调标注接口就能实时切换文本框内容。
- **`max_tokens` 是设置里可调的**（`#maxTokens`，默认 8192，预设 8192/16384/32768/65536）：推理/思考模型经常把 token 全花在思考过程上导致正文为空（见下方"踩过的坑"），与其每次改代码写死一个新数字，不如让用户自己调。服务端 `resolveMaxTokens()` 做范围校验（256–65536），非法值兜底回 8192。
- **标注接口有 SSRF 防护**：`/api/annotate` 的 `baseURL` 是调用者随便填的，服务器会原样对它发请求——本地跑无所谓，但部署到公网后任何人都能把它填成服务器内网地址（比如云厂商元数据接口 `169.254.169.254`）。`annotate.js` 里 `assertPublicHttpUrl()` 会解析域名并拒绝内网/本机 IP（含 IPv4-mapped IPv6 形式）。本地想指向自己电脑上的模型服务（Ollama/LM Studio/自建网关）时，启动前设 `ALLOW_PRIVATE_ANNOTATE_TARGETS=true` 可以关掉这个限制。
- **生成的语音可以下载，也有历史记录**：Fish Audio / ElevenLabs 播放区旁各有一个"下载"按钮（下载当次生成的音频），下面还有"生成历史"区，两个引擎分别保留最近 5 条（超出自动淘汰最早的，同时 `URL.revokeObjectURL` 释放内存），每条历史都能单独下载。历史只存在内存里（`historyState` 变量），刷新页面会清空，没做持久化——音频 blob 不适合塞进 localStorage。下载统一走 `downloadBlob()`：造一个临时 `<a download>` 触发点击，而不是依赖 `<audio>` 当前的 `src`（那个 object URL 可能已经被后续操作替换/回收）。
- **UI 主题**：tweakcn 的 "Vintage Paper" 预设（从 `github.com/jnsahaj/tweakcn` 的 `utils/theme-presets.ts` 里直接抄的色值），字体 Libre Baskerville / Lora / IBM Plex Mono。图标全部是手动传入的 SVG（`fill="currentColor"` + CSS `color: var(--primary)` 上色），不用 emoji、不用图标字体库。

**踩过的坑（下次遇到类似症状直接查这里，不用重新排查）：**

- **`hidden` 属性被 CSS 覆盖**：如果某个元素同时有 `hidden` 属性和一条设了 `display: flex/block` 的 class 规则，且这条 class 规则和浏览器默认的 `[hidden]{display:none}` 优先级打平，author 样式会赢，导致 `hidden` 形同虚设。全局补了一条 `[hidden] { display: none !important; }` 兜底。新加类似的可切换显示/隐藏的元素时留意这个。
- **JS 里 `el.checked = true` 不会触发 `change` 事件**：`loadSettings()` 从 localStorage 恢复 radio/checkbox 选中状态时是直接赋值，不会触发依赖 `change` 事件联动的显示/隐藏/文案逻辑。所以任何"页面加载时要根据已保存状态同步 UI"的地方，都要在赋值后手动调用一次同步函数（`updateProviderFieldsVisibility()`、`updateElevenToggleLabel()` 这些），不能指望事件监听器自动触发。**每加一个新的持久化开关/单选，都要检查有没有补这一步。**
- **`<label>` 自定义 flex 布局，一定要显式写 `flex-direction`**：全局有条给设置表单用的通用规则 `label { display: flex; flex-direction: column; font-size: 0.85rem; ... }`。任何新的 `.xxx-label`/`.toggle-row` 之类的自定义 class，只要本身是个 `<label>` 标签，只覆盖了 `display` 而没覆盖 `flex-direction`（以及 `font-size`/`color` 等），那些没覆盖的属性会被这条通用规则渗透——这个坑在这个项目里已经复现过不止一次（`.input-area-label` 一次，`.toggle-row` 又一次），根源是 CSS 覆盖是按属性生效、不是按规则整体生效。**结论：以后凡是新写一个包裹 `<label>` 的自定义 class，直接把 `display`/`flex-direction`/`align-items`/`gap`/`font-size`/`color` 这几个属性一次性显式写全，不要只改"看起来不对"的那一个属性，也不要等出问题了再一条条补。**
- **CSS 规则忘记覆盖某个属性会被更早/更通用的规则渗透**：上面那条是这个更通用问题的一个具体案例，凡是新加覆盖性 class 都要留意，不限于 `<label>`。
- **标注请求"成功"但结果是空的，且不报错**：`server/routes/annotate.js` 里 `res.end()` 只要没抛异常就算成功，但如果模型一个 token 都没吐（比如 DeepSeek 的 `xxx-flash`/`xxx-reasoner` 这类推理模型，把 `max_tokens` 全部花在了流式返回的 `delta.reasoning_content`（思考过程）上，还没轮到 `delta.content`（正文）就因为 `finish_reason: "length"`被截断），前端会拿到一个 200 但空 body 的响应，`fishText` 静默留空、`elevenText` 却正常填入原文，表现得像"什么都没做但也没报错"。现在已经修了：`streamOpenAICompatible()` 会识别 `reasoning_content` 和 `finish_reason`，router 里如果 `!wroteAny`（一个字节都没往前端写过）就主动抛一个能说明原因的错误，不再静默成功；同时把两边的 `max_tokens` 从 4096 调到了 8192，给推理模型留思考空间。**排查同类"标注栏空白但没报错"的问题，先看这里。**
- **`<input list>` + `<datalist>` 预填了 `value`，下拉就只显示匹配项**：原生 datalist 的下拉是按输入框当前文字做前缀过滤的自动补全，不是 `<select>` 那种固定列表。字段里预填了默认值（比如 `value="8192"`）之后，点开下拉只会看到 `8192` 一个选项，`16384`/`32768` 全被过滤掉了，看起来像"预设没加上"。解法是**只写 `placeholder` 不写 `value`**，让输入框空着——前后端本来就对空值有兜底（`fields.xxx.value.trim() || "默认值"`、`resolveMaxTokens()`），行为不变。`fishModel`/`elevenModel`/`maxTokens` 三个字段都按这个改过了。
- **`npm audit` 报的 `qs` 漏洞，`npm audit fix` 修不掉**：express 4.x 系列至今没有发布过升级 body-parser/qs 的新版本（`npm view express@4 version` 最新还是 4.22.2），所以自动修复在不跳到 express 5（大版本、破坏性变更）的前提下无解，会显示"up to date"但漏洞还在。解法是用 `package.json` 的 `overrides` 字段强制整棵依赖树用修好的 `qs@^6.16.0`（同大版本，非破坏性），不动 express 本身。改完 `npm audit` 是 0 漏洞。
- **npm 自己不读系统代理**：这台机器访问 npm 源要走代理，但 `npm audit`/`npm view` 之类的命令不会自动用 `HTTP_PROXY` 环境变量，表现为卡几分钟后 `network timeout at: https://registry.npmjs.org/...`。已经用 `npm config set proxy` / `npm config set https-proxy` 显式配过了（写进了全局 npm 配置，不想要可以 `npm config delete proxy`）。注意这和 `server/index.js` 里那个 undici ProxyAgent 是两套独立的东西——一个管 npm CLI，一个管应用自己的出站请求。
- **需要整页截图时用无头浏览器，别让用户手动截**：`msedge.exe --headless=new --disable-gpu --hide-scrollbars --window-size=1280,1120 --screenshot="out.png" http://localhost:3787`（Edge 在 `C:\Program Files (x86)\Microsoft\Edge\Application\`，Chrome 同理）。**`--window-size` 的高度要贴近页面实际内容高度**——设成 5000 这种远超内容的值，截出来的图会出现整页内容重复渲染两遍的诡异结果。这个 demo 首页大约 1120px 高。缺点是没法模拟点击（展开设置面板之类的状态），要截交互后的状态只能临时改 HTML 默认值截完再改回来。
- **本地起的 `npm start` 进程忘了关，下次再起会 `EADDRINUSE`**：Windows 上关掉终端窗口不一定会杀掉子进程 `node.exe`，尤其是之前用 Claude Code 的后台任务（`run_in_background`）起过一次服务、会话被压缩（`/compact`）之后就跟丢了那个后台任务的引用，进程本身还占着 3787 端口。排查方法：`Get-NetTCPConnection -LocalPort 3787 | Select OwningProcess`，找到 PID 后 `Get-Process -Id <PID>` 确认是 `node.exe`（不是别的占用了这个端口的东西），确认后 `Stop-Process -Id <PID> -Force` 再重新 `npm start`。

## 和早期规划文档的出入

`claude-code-instructions.md`、`tts-director-demo-spec.md`、`tts-director-roadmap-updated.md` 是项目早期（demo 开工之前）写的规划文档，和实际实现有几处出入，读的时候注意：

- 规划文档假设 demo 能做成 Claude Artifact；实际因为 CSP 限制改成了本地 Node 项目（见上）。
- 规划文档假设标注固定调用 Anthropic API；实际做成了可选 Claude / 任意 OpenAI 兼容接口。
- 规划文档假设输出格式是 JSON；实际改成了分隔符文本格式（原因见上）。
- 规划文档里 skill 文件路径是 `skill/SKILL.md` + `skill/references/*.md`；实际都在仓库根目录平铺。

以上几点以本文件和 `demo/README.md` 为准。
