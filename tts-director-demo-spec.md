# TTS Director Demo — 技术规格

## 项目概述

构建一个双栏对比 Demo 网页，展示 TTS Director Skill 的标注效果。左栏使用 Fish Audio S2 Pro 朗读，右栏使用 ElevenLabs v3 朗读。用户输入一段中文文本后，点击按钮自动标注并试听两种 TTS 引擎的对比效果。

这个 Demo 的核心价值是：让访问者**亲耳听到**"有标签 vs 无标签"和"Fish Audio vs ElevenLabs"的差异。

## 技术栈

- 前端：React（单文件 .jsx artifact）
- API 调用：
  - Claude API（Anthropic，用于文本标注）：artifact 内置，无需 API key
  - Fish Audio S2 Pro API：需要用户输入 API key
  - ElevenLabs v3 API：需要用户输入 API key
- 音频播放：浏览器原生 Audio API

## 页面布局

```
┌──────────────────────────────────────────────────────────────┐
│                     TTS Director Demo                        │
│           中文 TTS 情感标注对比工具                              │
├──────────────────────────┬───────────────────────────────────┤
│   设置区（可折叠）        │                                   │
│   Fish Audio API Key [__]│  ElevenLabs API Key [__]          │
│   Voice ID [____________]│  Voice ID [____________]          │
├──────────────────────────┴───────────────────────────────────┤
│                                                              │
│  ┌─── 输入区 ───────────────────────────────────────────┐    │
│  │  请输入中文文本...                                     │    │
│  │  （多行文本框）                                        │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│            [ 🎯 用 TTS Director 标注 ]                       │
│                                                              │
├─────────────── Fish Audio ──────┬──── ElevenLabs v3 ────────┤
│                                 │                            │
│  标注文本：                      │  标注文本：                  │
│  ┌────────────────────────┐     │  ┌───────────────────────┐ │
│  │ [happy] 来，你今天...   │     │  │ [happy] 来，你今天...  │ │
│  │ （可编辑）              │     │  │ （可编辑）             │ │
│  └────────────────────────┘     │  └───────────────────────┘ │
│                                 │                            │
│  ▶ 朗读   ⏹ 停止               │         ▶ 朗读   ⏹ 停止    │
│  🔊 ━━━━━━━━━━━━━ 00:00        │  🔊 ━━━━━━━━━━━━━ 00:00   │
│                                 │                            │
├─────────────────────────────────┴────────────────────────────┤
│  标注策略说明：                                                │
│  "这段文本表里一致，主要用停顿和标点控制节奏..."                    │
└──────────────────────────────────────────────────────────────┘
```

## 用户交互流程

1. 用户在顶部设置区输入 API key 和 Voice ID（设置区默认折叠，展开后可配置）
2. 用户在输入区输入中文文本
3. 用户点击"用 TTS Director 标注"按钮
4. 系统调用 Claude API，把用户文本发送给 TTS Director Skill 进行标注
5. 标注后的文本同时出现在左栏和右栏的文本框中（两栏显示相同的标注文本）
6. 用户可以在任一栏的文本框中编辑标注文本
7. 用户点击左栏的"朗读"按钮 → 调用 Fish Audio S2 Pro API 生成语音并播放
8. 用户点击右栏的"朗读"按钮 → 调用 ElevenLabs v3 API 生成语音并播放

## API 集成细节

### 1. Claude API（文本标注）

调用 Anthropic API 的 /v1/messages 端点。将 TTS Director Skill 的完整规则嵌入 system prompt 中。

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SKILL_SYSTEM_PROMPT, // TTS Director Skill 的完整规则（见下方）
    messages: [
      { role: "user", content: `请为以下中文文本添加 TTS 标签：\n\n${userText}` }
    ]
  })
});
```

system prompt 的内容 = SKILL.md 的正文部分 + references/s2-pro-tags.md 的全文 + references/examples.md 的全文，拼接成一个完整的 system prompt。具体内容见项目文件中的 `tts-director/SKILL.md`、`tts-director/references/s2-pro-tags.md`、`tts-director/references/examples.md`。

**重要：** 在 system prompt 的末尾追加以下指令，确保输出格式适合 Demo 解析：

```
## Demo 输出格式要求

你的输出必须严格遵循以下 JSON 格式，不要输出任何其他内容：

{
  "annotated_text": "标注后的完整文本（带方括号标签）",
  "strategy_note": "一句话说明你的标注策略"
}
```

### 2. Fish Audio S2 Pro API（左栏语音合成）

```javascript
const response = await fetch("https://api.fish.audio/v1/tts", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${fishApiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: annotatedText,
    reference_id: fishVoiceId,
    temperature: 0.7,
    top_p: 0.7,
    prosody: {
      speed: 1,
      volume: 0
    },
    normalize: true,
    format: "mp3",
    latency: "normal"
  })
});
// 响应体是音频二进制数据（mp3）
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

### 3. ElevenLabs v3 API（右栏语音合成）

```javascript
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
  method: "POST",
  headers: {
    "xi-api-key": elevenApiKey,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg"
  },
  body: JSON.stringify({
    text: annotatedText,
    model_id: "eleven_v3",
    voice_settings: {
      stability: 0.28,
      similarity_boost: 0.75,
      style: 0.9,
      use_speaker_boost: true
    }
  })
});
// 响应体是音频二进制数据
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

注意：ElevenLabs v3 的推荐参数（基于实验数据）：stability 0.24-0.32，style 0.88-0.9。上面用的是中间值。

## UI 细节要求

### 设置区
- 默认折叠，点击"⚙️ 设置"展开
- 四个输入框：Fish Audio API Key、Fish Audio Voice ID、ElevenLabs API Key、ElevenLabs Voice ID
- API Key 输入框用 password 类型（隐藏输入内容）
- 提供默认 Voice ID 占位符提示文字
- 设置保存在 React state 中（不持久化）

### 输入区
- 多行文本框，至少 4 行高
- 占位符文字："请输入中文文本，例如：来，你今天都做了些什么？说来听听。"
- 提供 2-3 个预设示例文本按钮，点击后自动填入输入框（使用 examples.md 中的原文输入）

### 标注按钮
- 居中放置，使用醒目的样式
- 点击后显示加载状态（"正在标注..."），禁用按钮防止重复点击
- 标注完成后，标注文本同时填入左右两栏

### 左右对比栏
- 各占 50% 宽度，移动端竖排
- 每栏包含：引擎名称标题、可编辑文本框（展示标注文本）、朗读/停止按钮、音频进度条
- 文本框可编辑——用户可以在朗读前手动调整标签
- 朗读按钮：点击后调用对应 API 生成语音，生成期间显示加载状态
- 停止按钮：停止当前音频播放

### 底部策略说明
- 显示 Claude 返回的 strategy_note
- 浅色背景、小字号、斜体

### 错误处理
- API key 未填写时，点击朗读按钮弹出提示："请先在设置中填写 API Key"
- API 调用失败时，在对应栏内显示错误信息（不用 alert）
- 网络超时设为 30 秒

## 样式要求

- 整体风格：简洁专业，深色/浅色自适应
- 使用 Tailwind CSS 类（React artifact 环境内置）
- 配色参考：左栏使用蓝色系（Fish Audio 品牌色），右栏使用紫色系（ElevenLabs 品牌色）
- 圆角卡片式布局
- 响应式设计：桌面端双栏，移动端单栏竖排

## 预设示例文本

在输入框上方或下方放置 3 个示例按钮：

1. **日常闲聊**："来，你今天都做了些什么？说来听听。我？找了个博物馆，坐了一天。馆藏嘛，没怎么认真看。就是里面的氛围还不错。灯光又暗，四周又安静，适合放空脑袋休息。不过，也不是什么都没想，坐着坐着突然饿了，就开始想今天要和你一起吃什么。"

2. **口非心是**："手怎么了？搭帐篷的时候碰着了？来，给你揉揉。我帮你揉，你睡吧。热啊……差点忘了，你帮我精心挑选的羽毛折扇和蝴蝶结小风扇，我都带了。看在你累得眼皮打架，手还负伤的份上，帮你服务一下，仅此一次。"

3. **知识解释**："可以的。食物不耐受的反应时间范围比大多数人以为的要宽得多——IgE介导的急性过敏通常是几分钟到两小时内，但非IgE介导的不耐受反应可以延迟12到72小时。先去处理你的肚子吧。洗澡的事不急。"
