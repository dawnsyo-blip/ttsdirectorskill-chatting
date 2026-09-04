# TTS Director

一个给中文文本自动插入 [Fish Audio S2 Pro](https://fish.audio/) 的情感/韵律标签的skill，能够让机在对话的时候更像真人说话。标签语法是 Fish Audio S2 Pro 专用的，因为这个模型目前可以免费用，哈哈。为了直观看效果，还做了一个本地网页 demo，可以一键对比"加了标注的 Fish Audio"和"原文直读的 ElevenLabs"。


## 核心设计原则
- **专为chatting调整**：这个skill是针对情感陪伴chatting的情境做的，所以会尽量减少负面情绪的表达。
- **克制优先**：默认不标注，加标签要能说清楚"不加会有什么问题"，不是标签越多越好。
- **表里一致性判断**：要不要标、标多密，取决于文本表面语义和说话人真实意图之间的距离。离得越远（比如嘴上嫌弃心里关心），越需要标签把潜台词标出来；表里一致的平铺陈述，几乎不用标。
- **文本改写和标签插入同等重要**：断句、加语气词、调语序，经常比堆标签更有效。
- 标签选择经常是**反直觉**的：命令句通常要用软标签而不是硬标签，一本正经的冷面吐槽在 Fish Audio S2 Pro 上很难读出"嘴硬心软"的反差。

完整规则见 [SKILL.md](SKILL.md)，标签速查表见 [s2-pro-tags.md](s2-pro-tags.md)，输入输出对照样本见 [examples.md](examples.md)，多音字/多音词的发音修正见 [polyphone-checklist.md](polyphone-checklist.md)（按需读取，不是每次都要加载）。

## 目录结构

```
.
├── SKILL.md                    # skill 主文件：触发条件、标注流程、核心原则
├── s2-pro-tags.md               # 标签速查表
├── examples.md                  # 输入输出对照样本
├── polyphone-checklist.md       # 多音字音素控制速查表
├── tts-director-roadmap-updated.md  # 早期规划文档，部分内容已过时（见 CLAUDE.md）
├── CLAUDE.md                    # 给 Claude Code 看的项目说明 / 踩坑记录
└── demo/                        # 本地对比测试网页，见 demo/README.md
```

skill 的四个文件都平铺在仓库根目录，**不在** `skill/references/` 子目录下——如果你在别处看到引用 `references/xxx.md` 的写法，那是历史遗留路径，实际文件就在根目录。

## 怎么用这个 skill

在 Claude Code 里，把 `SKILL.md`、`s2-pro-tags.md`、`examples.md`、`polyphone-checklist.md` 这四个文件放进你项目（或用户级）的 skills 目录下（比如 `.claude/skills/tts-director/`），保持文件名不变即可——`SKILL.md` 的 frontmatter 里已经声明了 `name: tts-director`。之后在对应项目里让 Claude 处理需要合成语音的中文文本，符合触发条件时就会自动套用这套标注规则；具体的 skill 目录约定以 [Claude Code 官方文档](https://code.claude.com/docs)为准。

## 落地场景：接入到自己的聊天前端里

Kelivo 目前还没法直接把这个 skill 装进去。更适合的是自建前端：因为需要在"模型生成回复"和"喂给 TTS"之间，自己插入一次额外的标注调用。

具体怎么接，`demo/` 这个项目本身就是一份可以照抄的参考实现：`demo/server/skillPrompt.js` 在启动时读取仓库根目录的四份 skill 文件、拼接成一段 system prompt；`demo/server/routes/annotate.js` 拿这段 system prompt 配合固定的输出格式说明，去调用任意 Claude / OpenAI 兼容接口，解析出标注后的文本。放到你自己的产品里，链路大致是：

1. 用户消息 → 你的聊天模型 → 生成回复文本（这一步不变）。
2. 回复文本 → **额外一次** API 调用（system prompt = 拼接后的 skill 文件内容）→ 标注后的文本。
3. 标注后的文本 → Fish Audio S2 Pro API → 音频。

第 2 步的标注调用和生成聊天回复的模型是两次完全独立的 API 请求，模型可以选得不一样：聊天用你觉得效果好的主力模型，标注这一步换成更便宜/更快的模型也没问题，这样能省下一部分 token 成本。demo 里实测过用 `deepseek-v4-flash` 做标注模型，效果不错（注意如果用的是推理/思考模型，流式接口里的思考过程走的是 `reasoning_content` 字段而不是 `content`，`max_tokens` 建议留够余量，不然可能出现思考用完 token、正文却没输出的情况——`demo/server/routes/annotate.js` 里已经处理了这种情况并会明确报错）。

## Demo：对比 Fish Audio 和 ElevenLabs

`demo/` 是一个本地 Node/Express + 原生 HTML/CSS/JS 的网页，用来实际听一下标注前后的差别：

```bash
cd demo
npm install
npm start
```

打开 `http://localhost:3787`，配好 Fish Audio / ElevenLabs / 标注引擎的 API Key 后：

- 一键用 skill 规则给输入文本打标签，流式返回，Fish Audio 栏边生成边显示。
- 标注引擎不锁定 Claude——设置里可以选 Claude，也可以填任意 OpenAI 兼容接口（DeepSeek、Moonshot、自建网关……）。
- ElevenLabs 栏默认原文直读、不加标签，作为"没有 skill"的对照组；也可以打开"同步标注"开关让它读同一份标注文本，对比同一份标注在两个引擎上的音色差异。
- 生成的语音可以下载，页面底部还留着每个引擎最近 5 条的生成历史，也能单独下载。
- 所有 API Key 只存在你本机浏览器的 `localStorage` 里，服务端不落盘——这个 demo 可以整个分享给别人，对方用自己的 Key 本地跑。

详细说明见 [demo/README.md](demo/README.md)；项目里踩过的坑和一些实现上的取舍记录在 [CLAUDE.md](CLAUDE.md)。
