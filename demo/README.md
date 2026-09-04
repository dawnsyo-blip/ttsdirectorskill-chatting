# TTS Director Demo

对比 Demo：左栏 Fish Audio S2 Pro、右栏 ElevenLabs v3，中间用 TTS Director skill（`../SKILL.md` 等文件）自动给中文文本打标签。

## 为什么是本地项目，不是 Claude Artifact

Claude Artifact 的网页沙盒只允许对一个白名单 CDN 发请求（字体、几个脚本库），不能直接 fetch Fish Audio / ElevenLabs / 任意 LLM 的 API。所以这个 Demo 做成了一个小的本地 Node 项目：后端负责转发请求（顺便避免把 API key 暴露在浏览器里），前端就是一个普通网页。

## 运行

```bash
cd demo
npm install
npm start
```

然后浏览器打开 http://localhost:3787。

## 使用

1. 点开顶部"⚙️ 设置"：
   - **标注引擎**：选 Claude，或者选"OpenAI 兼容接口"——后者可以填任何兼容 OpenAI `/chat/completions` 格式的服务（OpenAI 官方、DeepSeek、Moonshot、自建网关、本地跑的模型……），填 Base URL、API Key、模型名即可，不锁定某一家。
   - **Fish Audio**：API Key + Voice ID（reference_id，在 fish.audio 网站上找喜欢的音色复制 ID）。
   - **ElevenLabs**：API Key + Voice ID（在 ElevenLabs 网站 Voices 页面复制）。
   - 这些设置只存在你本机浏览器的 `localStorage` 里，不会传到别处；下次打开会自动带出来。
2. 在输入框粘贴中文文本（或者点下面的示例按钮），点"🎯 用 TTS Director 标注"。
3. 标注结果会同时填进左右两栏的文本框——标注前可以直接在框里手动改标签再朗读。
4. 分别点左右两栏的"▶ 朗读"试听、对比两个引擎的效果。

## 给别人用

这是个纯本地项目，没有部署到任何服务器。想让别人也测试你的 skill，把这个 `demo/` 文件夹（连同上一级的 `SKILL.md`、`s2-pro-tags.md`、`examples.md`、`polyphone-checklist.md`）一起分享出去，对方本地 `npm install && npm start`，用他们自己的 API key 就能跑，不需要你提供任何 key。

## 目录结构

```
demo/
├── server/
│   ├── index.js          # Express 入口
│   ├── skillPrompt.js     # 读取上级目录的 skill 文件，拼成 system prompt
│   └── routes/
│       ├── annotate.js    # POST /api/annotate — 转发给 Claude 或 OpenAI 兼容接口
│       └── tts.js         # POST /api/tts/fish、/api/tts/elevenlabs — 转发给对应 TTS API
└── public/                # 前端静态页面（原生 HTML/CSS/JS，无需构建）
```

修改了上一级目录的 `SKILL.md` / `s2-pro-tags.md` / `examples.md` / `polyphone-checklist.md` 后，重启一下 `npm start`（`skillPrompt.js` 只在启动时读一次文件）就会生效。
