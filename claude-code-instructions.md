# Claude Code 使用指南：TTS Director 测试 + Demo 开发

## 一、项目文件清单

在开始之前，把以下文件放到你的 Claude Code 项目目录中：

```
tts-director-project/
├── skill/                          # Skill 核心文件
│   ├── SKILL.md                    # 主指令文件（标注规则）
│   └── references/
│       ├── s2-pro-tags.md          # 标签速查表
│       └── examples.md             # 输入输出示例
│
├── tts-director-demo-spec.md       # Demo 技术规格（给 Claude Code 的 prompt）
│
└── claude-code-instructions.md     # 本文件
```

所有文件都已经在本次对话中生成。下载后按上述结构放置。

---

## 二、用 Claude Code 测试 Skill

### 方法 1：直接在 Claude Code 里测试标注效果

在 Claude Code 中输入以下 prompt：

```
读取 skill/SKILL.md、skill/references/s2-pro-tags.md、skill/references/examples.md 的内容，
然后按照 SKILL.md 中的规则，为以下文本添加 TTS 标签：

"你的测试文本放这里"
```

Claude Code 会读取 skill 文件，理解规则，然后输出标注后的文本。你可以直接把输出粘贴到 Fish Audio 网页端或 API 中测试听感。

### 方法 2：创建自动化测试脚本

让 Claude Code 创建一个测试脚本。输入以下 prompt：

```
请帮我创建一个 Node.js 测试脚本 test-skill.js，功能如下：

1. 读取 skill/ 目录下的 SKILL.md、references/s2-pro-tags.md、references/examples.md
2. 把它们拼接成一个 system prompt
3. 从命令行参数读取测试文本
4. 调用 Anthropic API（使用环境变量 ANTHROPIC_API_KEY），发送测试文本让 Claude 标注
5. 输出标注后的文本

运行方式：node test-skill.js "来，你今天都做了些什么？"
```

---

## 三、用 Claude Code 开发 Demo

### 第一步：让 Claude Code 读取规格文档

```
请读取 tts-director-demo-spec.md，这是一个 TTS 对比 Demo 的完整技术规格。
同时读取 skill/ 目录下的所有文件，这些是需要嵌入到 Demo 中的标注规则。
```

### 第二步：让 Claude Code 开始构建

```
根据 tts-director-demo-spec.md 的规格，构建这个 Demo。

要求：
1. 创建一个单文件 React 组件（.jsx），可以直接作为 Claude artifact 运行
2. 把 skill 的三个文件内容拼接后，作为字符串常量嵌入到代码中（作为 Claude API 的 system prompt）
3. 确保所有 API 调用都有错误处理和加载状态
4. 注意 Fish Audio 和 ElevenLabs 的 API 响应都是音频二进制数据（blob），需要转成 URL 才能播放
```

### 第三步：测试和调试

运行 Demo 后，测试以下场景：
- 只填 Fish Audio key，不填 ElevenLabs key → 右栏应该提示缺少 key
- 输入短文本（一句话）→ 标注应该极度克制
- 输入口非心是文本 → 标注应该包含软化策略
- 编辑标注文本后再朗读 → 应该用编辑后的版本

---

## 四、需要准备的 API Key

1. **Fish Audio API Key**
   - 获取方式：https://fish.audio → 注册 → 个人设置 → API Keys
   - 免费模型 ID：`s2.1-pro-free`（在 API 请求中不需要单独设置，用 reference_id 选择音色）
   - Voice ID（reference_id）：在 Fish Audio 网站上找到喜欢的音色，复制其 ID

2. **ElevenLabs API Key**
   - 获取方式：https://elevenlabs.io → 注册 → Profile → API Keys
   - 免费额度：每月 10,000 字符
   - Voice ID：在 ElevenLabs 网站的 Voices 页面复制喜欢的音色 ID
   - Model ID：`eleven_v3`

3. **Anthropic API Key**
   - 如果在 Claude artifact 内运行，不需要（内置）
   - 如果用 Claude Code 的测试脚本，需要：设置环境变量 `ANTHROPIC_API_KEY`

---

## 五、注意事项

### 关于跨域问题（CORS）

在浏览器中直接调用 Fish Audio 和 ElevenLabs 的 API 可能遇到 CORS（Cross-Origin Resource Sharing，跨域资源共享）限制——浏览器出于安全考虑，默认不允许网页直接调用第三方 API。

解决方案：
- **方案 A（推荐）：** 在 Claude artifact 中运行。artifact 环境可能对 CORS 有特殊处理。先试试直接调用，如果遇到 CORS 错误再考虑方案 B。
- **方案 B：** 用 Claude Code 搭建一个简单的后端代理（Node.js Express），前端调用自己的后端，后端再转发给 Fish Audio / ElevenLabs。
- **方案 C：** 如果只是演示用，可以在本地用浏览器插件临时禁用 CORS（仅限开发环境）。

### 关于 Skill 内容嵌入

SKILL.md + s2-pro-tags.md + examples.md 拼接后大约 450 行。作为 system prompt 嵌入到 React 代码中时，注意：
- 用模板字符串（反引号 ``）包裹，避免转义问题
- 或者把内容存为一个独立的 JS 常量文件再导入

### 关于音频播放

两个 TTS API 返回的都是音频二进制数据。在浏览器中播放的通用模式：

```javascript
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const audio = new Audio(url);
audio.play();
// 播放结束后清理
audio.onended = () => URL.revokeObjectURL(url);
```
