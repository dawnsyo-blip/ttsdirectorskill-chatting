---
name: TTS Director Demo
description: 给中文文本加情感标签，听 Fish Audio 和 ElevenLabs 读出来的区别
colors:
  ground: "#f2f2f4"
  surface: "#ffffff"
  sunken: "#f6f6f8"
  line: "#e4e2e6"
  line-strong: "#d3d0d8"
  ink: "#2a2418"
  ink-soft: "#6b6354"
  honey: "#ffe7a3"
  honey-soft: "#fff3cf"
  director-bg: "#e7e6eb"
  amber: "#e8930c"
  amber-hover: "#d98508"
  amber-ink: "#8f5200"
  on-amber: "#2a1b00"
  ok: "#2f8f57"
  error: "#b3261e"
  error-bg: "#fdecea"
  tag-emotion: "#8a4100"
  tag-emotion-bg: "#fce3c4"
  tag-para: "#34506b"
  tag-para-bg: "#dce6f0"
  tag-voice: "#6a3590"
  tag-voice-bg: "#ebddf4"
  tag-action: "#a2335c"
  tag-action-bg: "#f9dde7"
  tag-phoneme: "#4a4552"
  tag-phoneme-bg: "#ecebef"
  wave-bar: "#d9d5cc"
typography:
  headline:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 700
    lineHeight: 1.4
  message:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 2.05
  body:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.5
  caption:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.7
  tag:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.01em"
rounded:
  field: "10px"
  segment: "12px"
  button: "14px"
  note: "16px"
  card: "22px"
  bubble: "22px 22px 22px 6px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.button}"
    padding: "14px 18px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.amber-hover}"
  chip-preset:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 13px"
  chip-preset-active:
    backgroundColor: "{colors.honey}"
  tag-emotion:
    backgroundColor: "{colors.tag-emotion-bg}"
    textColor: "{colors.tag-emotion}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
    typography: "{typography.tag}"
  tag-para:
    backgroundColor: "{colors.tag-para-bg}"
    textColor: "{colors.tag-para}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
    typography: "{typography.tag}"
  tag-voice:
    backgroundColor: "{colors.tag-voice-bg}"
    textColor: "{colors.tag-voice}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
    typography: "{typography.tag}"
  tag-action:
    backgroundColor: "{colors.tag-action-bg}"
    textColor: "{colors.tag-action}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
    typography: "{typography.tag}"
  bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "18px 20px 44px"
    typography: "{typography.message}"
  voice-note:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "54px"
    padding: "0 8px"
  voice-play:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.pill}"
    size: "38px"
  field:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 12px"
  settings-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 14px 9px 16px"
  director-message:
    backgroundColor: "{colors.director-bg}"
    textColor: "{colors.ink}"
    rounded: "6px 22px 22px 22px"
    padding: "14px 20px 16px"
---

# Design System: TTS Director Demo

## Overview

**Creative North Star: "语音消息（The Voice Note）"**

每次标注都像有人发来一条消息：标注过的文本是一只对话气泡，生成的语音是挂在气泡下面的一条语音条。整个界面借用即时通讯的语法（圆角气泡、语音条、系统消息），而不是音频工作站或开发者控制台的语法，所以它是暖的；但它只借语法、不借皮肤，底色是中性浅灰、卡片是纯白，所以它是干净的。

温度来自内容和少数几个有意义的颜色，而不是装饰：琥珀只出现在主操作和正在播放的声音上，四种标签墨色只出现在标签本身，蜂蜜黄只用于小面积的选中/待生成状态。气泡本身始终是白底，保证长文本好读。界面里没有渐变、没有玻璃、没有纹理，阴影只用来让卡片和语音条从浅灰底上轻轻浮起。

明确拒绝的两种品类默认：深色底 + 霓虹波形的 TTS playground（太冷），以及米色纸张 + 衬线体的复古风（这个项目改版前的样子）。

**Key Characteristics:**
- 中性浅灰底 + 白色卡片与白色气泡，单一暖色（琥珀）承担操作；标注与否只靠标签胶囊和改写下划线表达。
- 标签是全圆胶囊，按类别固定四种墨色，全站一致。
- 对话气泡带一个 6px 的"尾巴"圆角，暗示是谁说出的话。
- 签名组件是按真实音频解码出波形的语音条。
- Figtree + Noto Sans SC，一套无衬线，靠字重和字号拉层级。

## Colors

一套中性冷暖平衡的灰白底色，加上一个琥珀主色、一个小面积使用的蜂蜜黄，和四种只给标签用的分类墨色。

### Primary
- **琥珀 Amber** (#e8930c)：主按钮「开始标注」、语音条的播放键、已播放的波形柱、开关打开态、品牌图标、焦点环。悬停加深为 #d98508。上面的文字用近黑的 On Amber (#2a1b00)。
- **琥珀墨 Amber Ink** (#8f5200)：琥珀色作文字/细线时的可读版本：文字按钮（「更换」）、链接、改写下划线、图例里的改写示意。

### Secondary
- **蜂蜜黄 Honey** (#ffe7a3)：被选中的示例胶囊、语音条里的「生成语音」按钮、历史记录里 Fish Audio 的播放按钮。只做小面积状态色，不铺在大块文字底下。
- **淡蜂蜜 Honey Soft** (#fff3cf)：蜂蜜黄的更淡一级，留给悬停等弱态。

### Tertiary（标签分类墨色）
- **焦糖 Emotion** (#8a4100 on #fce3c4)：情绪类标签，如 warm、teasing、happy。
- **石板蓝 Pause & Breath** (#34506b on #dce6f0)：停顿呼吸类，如 pause、sigh、chuckle。
- **梅紫 Voice & Tone** (#6a3590 on #ebddf4)：音色语调类，如 soft、whispering、under breath。
- **玫红 Action** (#a2335c on #f9dde7)：动词短语类，如 comfort、plead、gently nudging。
- **灰紫 Phoneme** (#4a4552 on #ecebef)：发音校正（`<|phoneme_start|>…`），不是韵律标签，所以用最弱的中性色。

### Neutral
- **雾灰 Ground** (#f2f2f4)：页面底色，也是卡片内次级胶囊（示例、收起按钮）的底。
- **纸白 Surface** (#ffffff)：卡片、两栏的对话气泡、语音条、设置胶囊、历史条目。
- **凹陷 Sunken** (#f6f6f8)：输入框底色。
- **细线 Line** (#e4e2e6) / **强细线 Line Strong** (#d3d0d8)：分隔线、输入框描边 / 关闭态开关轨道。
- **墨 Ink** (#2a2418)：正文，一种带一点暖意的近黑。
- **淡墨 Ink Soft** (#6b6354)：次级文字、说明、占位符、时间。白底上约 5.9:1。
- **导演灰 Director** (#e7e6eb)：导演备注消息的气泡底。
- **波形灰 Wave Bar** (#d9d5cc)：未播放的波形柱。
- 状态色：成功 #2f8f57（设置就绪圆点）、错误 #b3261e on #fdecea。

深色模式（`prefers-color-scheme: dark`）每个 token 都有对应值，见 `.impeccable/design.json` 的 `extensions.darkTheme`；深色下标签胶囊的底色必须明显亮过深色气泡底。

### Named Rules
**The White Reading Surface Rule.** 气泡永远是白底（深色模式下是卡片色），不管有没有标注。标注了什么只靠标签胶囊和改写下划线表达——给整段文字铺彩色底会降低可读性（用户实测后否掉了蜂蜜黄气泡）。

**The One Ink Per Category Rule.** 每个标签类别只有一种墨色，正文、图例、提示里处处相同。新增标签按 `s2-pro-tags.md` 的类别归入这四种之一，不要为单个标签新造颜色。

**The Amber Is Sound and Action Rule.** 琥珀只给主操作和"正在发出的声音"（播放键、已播放的波形）。同一屏上琥珀面积很小，它的稀缺就是它的作用。

## Typography

**Display Font:** 无单独展示字体
**Body Font:** Figtree（拉丁字符），Noto Sans SC（中文），回退 PingFang SC / Microsoft YaHei / system-ui
**Label/Mono Font:** 无等宽字体；标签胶囊也用 Figtree

**Character:** Figtree 是圆润友好的几何无衬线，和 Noto Sans SC 的中性笔画放在一起，像一个亲切但不幼稚的聊天应用。整页只有一个字体家族，层级完全靠字号和字重。

### Hierarchy
- **Headline** (700, 1.3rem, 1.2)：品牌名「TTS Director for Chatting」。
- **Title** (700, 1.02rem, 1.4)：区块标题（待标注文本、最近生成）、引擎名、主按钮文字。
- **Message** (400, 1.02rem, 2.05)：气泡里的文本。行高放大到 2.05 是为了给行内标签胶囊留出上下空间，不让胶囊撑乱行距。导演备注用 1rem / 1.95，正文测量上限 82ch。
- **Body** (400, 15px, 1.6)：其余正文、输入框（0.98rem / 1.8）。
- **Label** (600, 0.85rem)：表单字段名、示例胶囊（500, 0.86rem）。
- **Caption** (400, 0.8rem, 1.7)：隐私说明、帮助文字、历史时间（时间和时长一律 `tabular-nums`）。
- **Tag** (600, 0.74rem, 1.25, +0.01em)：标签胶囊内文字，显示标签原文不带方括号。

### Named Rules
**The One Family Rule.** 整个界面只用 Figtree + Noto Sans SC。不要引入衬线体（那是改版前的复古风），也不要用等宽字体给标签扮"技术感"。

## Layout

两栏工作区：左侧固定宽度的写作卡（`minmax(300px, 384px)`，桌面端 sticky 在顶部 20px），右侧弹性的对比区（右上角只有标签图例，不再放区块标题），间距 32px；页面最大宽 1400px，左右边距 40px。右侧内部是两列严格对位的对话列（同字号、同宽度、同起点，间距 24px），下面依次是与两列同宽的导演备注消息和"最近生成"两列列表。

- **≤1100px**：工作区变单列，写作卡在上，输入框高度压到 132px；761–1100px 之间示例胶囊和主按钮并排在一行，让对比区尽量进首屏。页面边距 24px。
- **≤760px**：页面边距 16px；顶栏允许换行，品牌名不换行，设置胶囊放不下时掉到第二行；图例变成 4 列网格，「改写过的字句」独占第二行；两个引擎上下堆叠，此时不做"另一栏退后"；导演备注去掉头像。
- 节奏：组内 8–12px，组间 16–24px，区块之间 24–32px。

## Elevation & Depth

浅层浮起：浅灰底上的白色元素用柔和的、带偏移的阴影轻轻抬起，而不是用描边分隔。阴影只有两档，都带一点暖墨色调。

### Shadow Vocabulary
- **浮起-低 Lift Low** (`box-shadow: 0 1px 2px rgba(42, 36, 24, 0.06), 0 1px 1px rgba(42, 36, 24, 0.04)`)：原文气泡、设置胶囊静止态、历史条目、导演备注头像。
- **浮起-中 Lift Mid** (`box-shadow: 0 4px 14px rgba(42, 36, 24, 0.07), 0 1px 3px rgba(42, 36, 24, 0.05)`)：写作卡、设置面板、语音条、设置胶囊悬停态。

### Named Rules
**The Listening Focus Rule.** 一栏在播放时，另一栏"退后"：标题行和语音条降到 45% 不透明度，气泡去饱和，正文换成淡墨。不要整栏降不透明度——那会把正文对比度压到 4.5:1 以下。

## Shapes

大圆角、全圆胶囊、聊天气泡尾巴。卡片和气泡 22px，按钮 14px，分段控件 12px（内块 9px），输入框 10px，导演备注灰块 16px，所有胶囊（标签、示例、设置、语音条、开关、导演头像）全圆。对话气泡左下角收成 6px 作为"尾巴"；导演备注消息的尾巴在左上角，指向它左侧的头像。几乎不用描边，唯一的线是区块内的 1px 分隔线和输入框描边。

## Components

### Buttons
- **Shape:** 柔和的圆角矩形 (14px)；次级动作全圆胶囊 (999px)。
- **Primary:** 琥珀底 + 近黑字，700 字重，整宽 (14px 18px)。悬停加深为 #d98508，按下下沉 1px；禁用时 0.7 不透明度并显示进行中文字（「正在标注…」）。
- **Icon:** 36px 雾灰底圆形图标按钮（「收起设置」是一个向上箭头，悬停变成细线色）；无文字的图标按钮都带 `aria-label` 和 `title`。
- **Text:** 琥珀墨文字按钮（「更换」），悬停加下划线。

### Chips
- **示例胶囊：** 雾灰底全圆，选中后变蜂蜜黄并加粗；用户开始输入就取消选中。
- **标签胶囊：** 四色分类（见 Colors），全圆，(3px 9px)，`vertical-align: middle` 对齐正文；悬停显示 `[tag] 类别 · 中文说明`。原文/标注切换时胶囊宽度收到 0 并淡出（0.32s ease-out），句子原地不动——这是整页唯一一处编排过的动效。

### Cards / Containers
- **Corner Style:** 22px。
- **Background:** 纸白。
- **Shadow Strategy:** 浮起-中。
- **Border:** 无。
- **Internal Padding:** 22px（写作卡）/ 24px 28px（设置面板）。

### Inputs / Fields
- **Style:** 凹陷底 + 1px 细线描边，10px 圆角 (9px 12px)；大输入框（待标注文本）14px 圆角、无描边。
- **Focus:** 描边变琥珀，外加 3px 22% 琥珀光晕。
- **分段控件：** 凹陷底轨道，选中块变纸白并带浮起-低。
- **开关：** 36×21 全圆轨道，关闭为强细线色，打开为琥珀。

### Navigation
- **顶栏：** 左侧品牌图标（琥珀聊天气泡里一对方括号）+ 品牌名；右侧只有设置胶囊。顶栏不放说明文字和外链。设置胶囊左侧的圆点：琥珀表示还有 key 没填，绿色表示已就绪；文字随之变成「设置 · 先填 API key / 还差 N 项 / 已就绪」。没填任何 key 时设置面板自动展开。

### Message Bubble（签名组件）
引擎栏的主体。标题行是引擎名 + 模型名 + 「标注 / 原文」开关，不放头像。气泡最小高 280px、最大 520px（超出内部滚动）；右下角是「编辑」按钮，点开后气泡换成可编辑的 textarea。改写过的字句用 2px 琥珀墨下划线（偏移 6px）。

### Voice Note（签名组件）
54px 高的全圆白条：琥珀播放键 → 按真实音频解码出的波形（柱宽 2–4px、间距 3px，已播放部分变琥珀，可点击、可用方向键定位）→ 单个时间（播放中显示已播时长，否则显示总时长）→ 重新生成图标 → 下载图标。还没生成时，时间和下载的位置换成一个带文字的蜂蜜黄「生成语音」胶囊；第一次生成时波形呼吸闪烁；重新生成时保留旧波形并转动刷新图标。

### Director Message
标注策略说明不是一段灰色注释，而是「TTS Director」发来的一条消息：左侧是品牌图标头像，右侧是导演灰气泡，首行是标题「notes」，正文用接近气泡的字号。宽度和上面两栏对齐。

## Do's and Don'ts

### Do:
- **Do** 两栏气泡都用白底，标注与否只靠标签胶囊和改写下划线区分。
- **Do** 新标签按 `s2-pro-tags.md` 的类别归入四种墨色之一，并同步更新 `app.js` 的 `TAG_INFO`。
- **Do** 用浮起-低 / 浮起-中两档阴影区分层级，阴影带偏移和模糊。
- **Do** 所有图标用自绘线性 SVG（1.5–1.7px 描边、`currentColor`），播放/暂停用实心几何形。
- **Do** 时间、时长、计数一律用 `tabular-nums`。
- **Do** 次级文字用淡墨 (#6b6354)，保证在白底上 ≥4.5:1。

### Don't:
- **Don't** 回到米色纸张 + 衬线体的复古风（这是改版前被用户否掉的样子）。
- **Don't** 做成深色底霓虹波形的 playground，或任何"开发者控制台"的冷感。
- **Don't** 用渐变紫、玻璃卡片、模糊背景这类通用 AI 模板手法。
- **Don't** 用 emoji 或图标字体代替图标。
- **Don't** 给标签胶囊用 `vertical-align: <数值>` 去凑对齐——`overflow:hidden` 的 inline-block 以底边为基线，要用 `middle`。
- **Don't** 用整栏降不透明度来表示"退后"，正文对比度必须保持可读。
