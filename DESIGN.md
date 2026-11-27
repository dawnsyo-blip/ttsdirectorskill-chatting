---
name: TTS Director Demo
description: 给中文文本加情感标签，听 Fish Audio 和 ElevenLabs 读出来的区别
colors:
  ground: "#ede6e1"
  surface: "#fcfaf8"
  card: "#fdfbf9"
  sunken: "#f5f0ec"
  line: "#e3dad3"
  line-strong: "#cfc3b8"
  ink: "#3a2726"
  ink-soft: "#6b5653"
  honey: "#e6dcd6"
  director-bg: "#f6f1ed"
  amber: "#7a4544"
  amber-hover: "#633736"
  amber-ink: "#7a4544"
  on-amber: "#ffffff"
  ok: "#6c7a6e"
  error: "#a3302a"
  error-bg: "#f8e1de"
  tag-emotion: "#8e4f4b"
  tag-emotion-bg: "#f2dedb"
  tag-para: "#645b48"
  tag-para-bg: "#e9e4d7"
  tag-voice: "#7e5641"
  tag-voice-bg: "#f0e1d7"
  tag-action: "#4c6266"
  tag-action-bg: "#dfe6e6"
  tag-phoneme: "#6b5653"
  tag-phoneme-bg: "#eee7e2"
  track: "#dacfc7"
  cable: "#b5a296"
  bud: "#f6f2ef"
typography:
  headline:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  title:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.03rem"
    fontWeight: 600
    lineHeight: 1.35
  message:
    fontFamily: "Figtree, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.95
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
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  field: "10px"
  segment: "12px"
  menu: "18px"
  panel: "24px"
  bubble: "26px 26px 26px 8px"
  card: "32px"
  phone: "50px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  gutter: "36px"
components:
  send-button:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.pill}"
    size: "40px"
  input-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "18px 20px 14px 22px"
  preset-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.menu}"
    padding: "12px 18px"
  player-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "22px 24px 18px"
    typography: "{typography.message}"
  mode-switch:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  gen-button:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
  tag-emotion:
    backgroundColor: "{colors.tag-emotion-bg}"
    textColor: "{colors.tag-emotion}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.tag}"
  tag-para:
    backgroundColor: "{colors.tag-para-bg}"
    textColor: "{colors.tag-para}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.tag}"
  tag-voice:
    backgroundColor: "{colors.tag-voice-bg}"
    textColor: "{colors.tag-voice}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.tag}"
  tag-action:
    backgroundColor: "{colors.tag-action-bg}"
    textColor: "{colors.tag-action}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.tag}"
  field:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 12px"
  settings-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  director-note:
    backgroundColor: "{colors.director-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "18px 24px 20px"
---

# Design System: TTS Director Demo

## Overview

**Creative North Star: "耳机（The Earphones）"**

左边是一部被虚化的手机，聊天页面全是模糊的色块，只有一只聊天气泡是清晰的——它就是原文输入框。右边是两张像手机播放页的音频卡，分别是 Fish Audio 和 ElevenLabs 的输出。一副有线耳机挂在被选中的那张卡两侧，耳机线经过分线器连回手机：鼠标移到哪张卡，耳机就挂到哪张卡上，像是把耳机换到另一边去听。这个比喻把"同一段话，听两个版本"直接画了出来。

配色是 Aurora 灰调：砂岩、珍珠白、陶土腮红和一点玫瑰在背景里大片晕染，卡片和气泡保持实色。唯一的操作色是檀木红（Sandalwood），只给发送、生成、播放和进度。标签胶囊按类别用四种低饱和墨色。温度来自背景晕染和耳机这个具体的物件，而不是装饰性纹理。

明确拒绝的品类默认：深色底 + 霓虹波形的 TTS playground（太冷）、米色纸张 + 衬线体的复古风（改版前的样子）、以及通用 AI 模板的渐变紫。

**Key Characteristics:**
- 舞台式构图：1400×800 的固定画布，模糊手机 + 清晰气泡在左，两张音频卡在右，耳机和耳机线把两边连起来。
- 背景是四角大面积径向晕染（Aurora 灰调），卡片、气泡、菜单都是实色或半透明实色。
- 檀木红是唯一的操作色；标签是全圆胶囊，按类别固定四种墨色。
- 输出卡借 iPhone 播放页的结构：顶部引擎名，中间文本，下面细进度条、时间和三个按钮。
- 签名动效是耳机换边：朝哪边走哪边先动，停在挂点外上方，再沿斜线慢慢"挂住"，不回弹。
- Figtree + Noto Sans SC，一套无衬线，靠字重和字号拉层级。

## Colors

一套带暖粉调的灰米色底，加一个檀木红主色，和四种只给标签用的低饱和分类墨色。

### Primary
- **檀木 Sandalwood** (#7a4544)：发送按钮（开始标注）、「生成语音」按钮、播放键、进度条已播放部分、焦点环、被选中的示例文字。悬停加深为 #633736。上面的文字用纯白。
- **檀木墨 Amber Ink** (#7a4544)：作文字/细线时同色：链接、改写下划线。

### Secondary
- **珍珠 Honey** (#e6dcd6)：文本选中高亮。

### Tertiary（标签分类墨色）
- **玫瑰 Emotion** (#8e4f4b on #f2dedb)：情绪类标签，如 warm、teasing、happy。
- **砂岩 Pause & Breath** (#645b48 on #e9e4d7)：停顿呼吸类，如 pause、sigh、chuckle。
- **陶土 Voice & Tone** (#7e5641 on #f0e1d7)：音色语调类，如 soft、whispering、under breath。
- **灰青 Action** (#4c6266 on #dfe6e6)：动词短语类，如 comfort、plead、gently nudging。灰青是调色板外补的一色，用来和三种暖色拉开区分。
- **灰褐 Phoneme** (#6b5653 on #eee7e2)：发音校正（`<|phoneme_start|>…`），不是韵律标签，用最弱的中性色。

### Neutral
- **灰米 Ground** (#ede6e1)：页面底色，上面叠四块径向晕染：右上珍珠白、左侧砂岩、右下陶土、左下玫瑰。
- **纸白 Surface** (#fcfaf8)：输入气泡、设置面板、设置胶囊、历史条目、开关选中块。
- **卡片白 Card** (#fdfbf9)：两张输出卡，比 Surface 再亮一点，配更深的阴影和 1px 白边，保证从晕染背景里跳出来。
- **凹陷 Sunken** (#f5f0ec)：输入框、编辑态文本框。
- **细线 Line** (#e3dad3) / **强细线 Line Strong** (#cfc3b8)：分隔线、输入框描边 / 禁用态图标。
- **墨 Ink** (#3a2726)：正文，一种带红调的近黑。
- **淡墨 Ink Soft** (#6b5653)：次级文字、说明、占位符、时间。
- **备注底 Director** (#f6f1ed)：Notes 卡片底。
- **轨道 Track** (#dacfc7)：进度条未播放部分。
- **耳机 Bud** (#f6f2ef) / **耳机线 Cable** (#b5a296)：耳机、分线器、插头和进度条圆点。
- 状态色：就绪 #6c7a6e（设置圆点）、错误 #a3302a on #f8e1de。

深色模式（`prefers-color-scheme: dark`）每个 token 都有对应值，见 `.impeccable/design.json` 的 `extensions.darkTheme`；深色下背景晕染降到很低的透明度，标签胶囊的底色必须明显亮过深色卡片底，耳机保持浅色。

### Named Rules
**The White Reading Surface Rule.** 输出卡的文本区永远是实色白底（深色模式下是卡片色），不管有没有标注。标注了什么只靠标签胶囊和改写下划线表达——给整段文字铺彩色底会降低可读性（用户实测后否掉了蜂蜜黄气泡）。

**The One Ink Per Category Rule.** 每个标签类别只有一种墨色，全站一致。新增标签按 `s2-pro-tags.md` 的类别归入这四种之一，不要为单个标签新造颜色。

**The Sandalwood Is Sound and Action Rule.** 檀木红只给"发出去"和"放出来"：发送、生成、播放、进度。同一屏上它的面积很小，稀缺就是它的作用。

## Typography

**Display Font:** 无单独展示字体
**Body Font:** Figtree（拉丁字符），Noto Sans SC（中文），回退 PingFang SC / Microsoft YaHei / system-ui
**Label/Mono Font:** 无等宽字体；标签胶囊也用 Figtree

**Character:** Figtree 是圆润友好的几何无衬线，和 Noto Sans SC 的中性笔画放在一起，像一个亲切但不幼稚的聊天应用。整页只有一个字体家族，层级完全靠字号和字重。

### Hierarchy
- **Headline** (600, 1rem, 1.3)：品牌名「TTS Director for Chatting」。舞台本身是主角，品牌名刻意做小。
- **Title** (600, 1.03rem, 1.35)：引擎名；Notes、最近生成的小标题用 700 / 0.9–0.95rem。
- **Message** (400, 0.98rem, 1.95)：输出卡里的文本。行高放大是为了给行内标签胶囊留出上下空间。输入气泡用 0.98rem / 1.8。
- **Body** (400, 15px, 1.6)：其余正文。
- **Label** (600, 0.85rem)：表单字段名；示例菜单项 0.94rem / 400，选中变 600。
- **Caption** (400, 0.8rem, 1.7)：隐私说明、帮助文字、模型名、引擎小字、时间（时间和时长一律 `tabular-nums`）。
- **Tag** (600, 0.74rem, 1.3, +0.01em)：标签胶囊内文字，显示标签原文不带方括号。

### Named Rules
**The One Family Rule.** 整个界面只用 Figtree + Noto Sans SC。不要引入衬线体，也不要用等宽字体给标签扮"技术感"。

## Layout

**桌面（≥1180px）**：顶栏下面是一块 1400×800 的固定画布（舞台），所有元素在画布坐标里绝对定位：

- 左：手机外框 290×580（`left 80px`），整体 1.4px 模糊、0.78 不透明度，屏幕内的假聊天再模糊 5px。输入气泡 400px 宽，比手机两侧都宽出一截，下面跟一个 232px 宽的示例菜单。手机底部有插头，耳机线从这里出发。
- 右：两张 330×520 的输出卡，间隔 130px，左右各留出放耳机的空位。
- 耳机挂在选中卡两侧（距卡边 16px，高度在卡片 30% 处）；分线器在卡片底部下方 92px；主线从分线器和手机插头各自垂直往下，在舞台下方兜一个深 U 形，最低点落在 Notes 卡片中间，被 Notes 盖住（Notes 的 z-index 高于舞台）。
- 窗口窄于 1400px 时整块画布用 `transform: scale()` 等比缩小（不放大），用负 `margin-bottom` 补回缩掉的高度。
- 画布下方是 Notes 和「最近生成」两列，最大宽 1328px。

**<1180px**：不再缩放画布，改成上下流式排列：去掉手机、耳机和耳机线；输入气泡全宽（输入框 150px 高），示例菜单变成一排胶囊；两张卡并排（≥761px）或上下堆叠（≤760px），卡片高 500px / 460px；卡片不做"退后"。页面边距 24px / 16px。

## Elevation & Depth

晕染背景上的实色元素靠柔和、带偏移的暖色阴影浮起，阴影分四档。

### Shadow Vocabulary
- **浮起-低 Lift Low** (`0 1px 2px rgba(80, 50, 45, 0.07), 0 1px 1px rgba(80, 50, 45, 0.05)`)：设置胶囊悬停、历史条目、开关选中块。
- **浮起-中 Lift Mid** (`0 6px 18px rgba(80, 50, 45, 0.09), 0 1px 3px rgba(80, 50, 45, 0.06)`)：设置面板、Notes。
- **浮起-气泡 Float** (`0 22px 46px rgba(80, 50, 45, 0.16), 0 2px 6px rgba(80, 50, 45, 0.08)`)：输入气泡，让它从模糊手机上"浮"出来。
- **浮起-卡片 Card** (`0 28px 56px rgba(80, 50, 45, 0.17), 0 6px 14px rgba(80, 50, 45, 0.07), 0 0 0 1px rgba(122, 69, 68, 0.05)`)：输出卡，最深的一档，加一圈极淡的檀木色描边。

### Named Rules
**The Earphones Follow Focus Rule.** 被选中的卡（鼠标悬停、键盘聚焦或正在播放）挂着耳机，另一张退后：不透明度 0.5、缩到 0.985、阴影变浅。耳机和耳机线在卡片下面一层（z-index 低于卡片），移动时从卡片背后穿过，永远不遮挡文本。窄屏没有悬停，不做退后。

## Shapes

大圆角、全圆胶囊、聊天气泡尾巴。输出卡 32px，输入气泡 26px（左下角为直角，由一个 SVG 尾巴接上），设置面板 / Notes 24px，示例菜单 18px，分段控件 12px，输入框 10px，手机外框 50px；按钮、开关、标签、设置胶囊都是全圆。

耳机是自绘 SVG：耳机头是一个被竖着切掉一边的圆，切面画成有厚度的一窄条，中间一道灰色弧线表示格栅；出音孔是一个深色胶囊，在远离切面的一侧；柄等宽、圆头，末端有一节稍短的套管，耳机线从套管底部引出。切面朝向卡片（左耳切在右、右耳切在左）。

## Components

### Buttons
- **发送 Send:** 40px 檀木红圆形，白色向上箭头，在输入气泡右下角；标注进行中换成转圈图标并禁用。
- **生成语音 Gen:** 还没生成时，卡片底部居中一个檀木红全圆按钮（波形图标 + 「生成语音」）；生成后缩成左侧 44px 的「重新生成」图标，重新生成时图标转动。
- **播放 Play:** 60px 无底圆形按钮里一个 34px 的檀木红实心三角 / 暂停；禁用时变强细线色。
- **Icon:** 44px 无底圆形（下载、重新生成），淡墨图标，悬停加 6% 墨色底；36px 凹陷底圆形用于「收起设置」。所有无文字按钮都带 `aria-label`。

### Chips
- **标签胶囊：** 四色分类（见 Colors），全圆，(2px 8px)，`vertical-align: middle` 对齐正文；悬停显示 `[tag] 类别 · 中文说明`。原文/标注切换时胶囊宽度收到 0 并淡出（0.32s ease-out），句子原地不动。
- **示例：** 桌面端是输入气泡下的半透明毛玻璃菜单（三行，每行文字 + 线性图标，行间 1px 细线），选中项变檀木红并加粗；窄屏变成一排半透明胶囊。

### Input Bubble（签名组件）
原文输入框就是一只聊天气泡：纸白底、浮起-气泡阴影、左下尾巴。里面是无边框 textarea（桌面 258px 高），底部一行左边是当前标注引擎的小字（点击打开设置），右边是发送按钮。聚焦时气泡和尾巴外圈一起出现一道 2px 光环（`--focus-ring`，檀木红 35% 混入底色的不透明色）。光环不是 box-shadow，而是两层实色叠出来的：底层是外扩 2px 的光环色形状，上层是纸白形状——这样气泡和尾巴交接处没有接缝色差。

### Player Card（签名组件）
iPhone 播放页式的输出卡：顶部引擎名 + 模型名，右侧「标注 | 原文」两段式开关（一个复选框画成两段，勾上 = 标注）；中间是可滚动的文本（标签胶囊 + 改写下划线），文本下方单独一行是「编辑」按钮；底部是 4px 细进度条（已播放檀木红，圆点 12px 浅色，可点击、可用方向键定位）、左右两个时间（已播 / 剩余），以及「重新生成 / 播放 / 下载」三个按钮。生成中进度条上扫过一道檀木红光。

### Earphones（签名动效）
- **换边：** 朝哪边走，哪边那只先动，另一只晚 140ms 起步。
- **靠近：** 临界阻尼弹簧，直接到位不回弹；移动时被线拖着微微后仰（最多 10°）。
- **挂住：** 先停在挂点外上方 9px，定 220ms，再用 560ms ease-in-out 沿斜线滑进挂点（右耳从右上到左下），停住。
- **播放中：** 耳机以很小的幅度震动。
- `prefers-reduced-motion` 下耳机直接跳到位，没有动效。

### Inputs / Fields
- **Style:** 凹陷底 + 1px 细线描边，10px 圆角 (9px 12px)。
- **Focus:** 描边变檀木红，外加 3px 22% 光晕。
- **分段控件：** 凹陷底轨道，选中块变纸白并带浮起-低。

### Navigation
- **顶栏：** 左边只有品牌名（小号 600），右边只有设置胶囊。设置胶囊：状态圆点（玫瑰色 = 还差 key，灰绿 = 已就绪）+「设置 · 先填 API key / 还差 N 项 / 已就绪」+ 调节图标。首次访问不自动展开设置面板，先让默认示例被看到。

### Director Note
标注策略说明是舞台下方的一张备注卡：备注底色、24px 圆角、浮起-中，首行标题「Notes」，正文按句号/分号拆成要点列表（引号、括号里的标点不断句），0.98rem / 1.85，项目符号用檀木红，测量上限 90ch。

## Do's and Don'ts

### Do:
- **Do** 让输出卡的文本区保持实色白底，标注与否只靠标签胶囊和改写下划线区分。
- **Do** 新标签按 `s2-pro-tags.md` 的类别归入四种墨色之一，并同步更新 `app.js` 的 `TAG_INFO`。
- **Do** 把耳机和耳机线放在卡片下面一层，移动时不遮挡任何文字。
- **Do** 所有图标用自绘线性 SVG（1.6–1.8px 描边、`currentColor`），播放/暂停用实心几何形。
- **Do** 时间、时长、计数一律用 `tabular-nums`。
- **Do** 新加颜色先写成 `style.css` 顶部的 token，并同时给深色模式一个值。

### Don't:
- **Don't** 回到米色纸张 + 衬线体的复古风，或做成深色底霓虹波形的 playground。
- **Don't** 用渐变紫这类通用 AI 模板手法；背景晕染只用 Aurora 灰调里的颜色。
- **Don't** 让耳机动效回弹或反复晃动——用户要的是干脆的"挂住"。
- **Don't** 用 emoji 或图标字体代替图标。
- **Don't** 给标签胶囊用 `vertical-align: <数值>` 去凑对齐——`overflow:hidden` 的 inline-block 以底边为基线，要用 `middle`。
- **Don't** 在窄屏保留手机、耳机和"退后"效果——没有悬停，也放不下。
