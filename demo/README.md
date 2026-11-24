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

1. 点顶栏右上角的"设置"（第一次打开、还没填任何 key 时会自动展开）：
   - **标注引擎**：选 Claude，或者选"OpenAI 兼容接口"——后者可以填任何兼容 OpenAI `/chat/completions` 格式的服务（OpenAI 官方、DeepSeek、Moonshot、自建网关、本地跑的模型……），填 Base URL、API Key、模型名即可，不锁定某一家。
   - **Fish Audio**：API Key + Voice ID（reference_id，在 fish.audio 网站上找喜欢的音色复制 ID）+ 模型（`s2.1-pro-free` / `s2.1-pro` / `s2-pro` / `s1`，不填默认免费的 `s2.1-pro-free`）。
   - **ElevenLabs**：API Key + Voice ID（在 ElevenLabs 网站 Voices 页面复制）+ 模型（`eleven_v3` / `eleven_multilingual_v2` / `eleven_flash_v2_5` / `eleven_turbo_v2_5`，不填默认 `eleven_v3`）。
   - 这些设置只存在你本机浏览器的 `localStorage` 里，不会传到别处；下次打开会自动带出来。设置按钮上会显示"已就绪"或"还差 N 项"。
2. 在左边"待标注文本"里粘贴中文文本（或者点下面的示例），点"开始标注"。
3. 标注结果会流式出现在 Fish Audio 的气泡里：标签显示成按类别着色的小胶囊（情绪 / 停顿呼吸 / 音色语调 / 动作，鼠标悬停看中文说明），skill 改写过的字句带下划线，下方的"导演备注"是标注策略说明。ElevenLabs 栏默认填入原文（不加标签，作为对照组）。两栏标题旁都有"标注 / 原文"开关，切换时句子原地不动、只有标签收起或展开，不用重新标注。想手动改标签，点气泡右下角的"编辑"。
4. 分别点两栏的"生成语音"，结果是一条带波形的语音条，可以播放/暂停、点波形跳到任意位置、下载；同一时间只播一条，正在听的那栏亮着，另一栏变淡。页面最下面的"最近生成"留着每个引擎最近 5 条记录，可以单独播放和下载。

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
