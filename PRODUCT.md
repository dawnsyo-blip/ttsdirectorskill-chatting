# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要是外部访客：从 GitHub README 或在线链接（Render 部署）第一次来到 demo 页，想直观感受 TTS Director skill 的效果。他们多半是对中文 TTS、情感陪伴类聊天前端、Fish Audio / ElevenLabs 有兴趣的开发者或爱好者，用自己的 API key 试用。作者本人也会用它调试 skill，但页面设计以"第一次来也能看懂"为先。主要在桌面浏览器使用，手机能用即可。

## Product Purpose

把一段中文文本交给 TTS Director（一个 Claude Code skill）自动插入 Fish Audio S2 Pro 的方括号情感/韵律标签，然后用 Fish Audio 朗读标注后的文本、用 ElevenLabs 朗读原文（或同一份标注），让访客听出差别。成功的标志：访客能一眼看清 skill 加了哪些标签、改了哪些字句，读懂"为什么这样标"的策略说明，再通过对听确认效果。

## Positioning

不是又一个 TTS 平台，而是给 TTS 当"导演"：skill 判断表面语义和真实意图之间的距离来决定标多少、怎么标，克制优先，文本改写和标签插入同等重要。页面要展示的是这份"导演判断"，而不只是两段音频。

## Operating Context

- 流程：配置 API key（标注引擎 Claude / 任意 OpenAI 兼容接口，Fish Audio，ElevenLabs）→ 输入中文文本或点示例 → 流式返回标注结果和标注策略 → 两栏分别生成、播放、下载 → 生成历史（各引擎最近 5 条，内存中）。
- 两栏都有"标注 / 原文"开关，可做跨引擎对比或同引擎前后对比。
- 设置只存在浏览器 localStorage，后端只转发不落盘；页面上有一段说明这一点的隐私文字，访客需要看到。
- 场景语境是情感陪伴型聊天：skill 刻意减少负面情绪表达。

## Capabilities and Constraints

- 本地 Node/Express 后端 + 原生 HTML/CSS/JS 前端，无构建步骤；`demo/public/` 的静态文件改完刷新即生效。
- 不能做成 Claude Artifact（CSP 限制），必须由后端转发 API 请求。
- 标注输出是分隔符文本（`===ANNOTATED===` / `===STRATEGY===` / `===END===`），流式填入 Fish Audio 栏。
- 标签语法是 Fish Audio S2 Pro 的方括号标签，例如 `[sigh]`、`[pause]`、`[whispering]`；完整清单见 `s2-pro-tags.md`。
- 两栏的标注文本框都允许访客手动编辑后再朗读。
- 界面语言是中文。

## Brand Commitments

- 用户明确要求：告别当前的复古（Vintage Paper）风格，参考 ateve.ai 那种简洁、精致的方向，但要保有温度，因为这是情感标注工具。
- 用户明确不想要：太冷（像开发者控制台）、太花（装饰和动效多过功能）、回到米色纸张 + 衬线体的复古、通用 AI 模板感（渐变紫、玻璃卡片）。
- 图标用手写/手动传入的 SVG，不用 emoji、不用图标字体库（沿用现有约定）。

## Evidence on Hand

- 三个内置示例文本：日常闲聊、口非心是、知识解释（`demo/public/app.js` 的 `PRESETS`）。
- 实测标注存档：`测试文本1/2/3.md`；输入输出样本：`examples.md`。
- 现有页面截图：`docs/demo-screenshot.png`。
- 没有用户评价、使用数据或评测分数，不得编造。

## Product Principles

1. 让"导演判断"可见：标签和策略说明是页面的主角，音频是验证手段。
2. 克制即品味：界面像 skill 本身一样，不加没有理由的东西。
3. 第一次来的人不读文档也能走完一遍：配置、输入、标注、对听的路径清晰。
4. 温度来自内容和细节，而不是装饰。
