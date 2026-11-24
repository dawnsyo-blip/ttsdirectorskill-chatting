---
version: 1
slug: "demo-public-index-html"
primary_target: "demo/public/index.html"
related_targets: ["demo/public/style.css","demo/public/app.js"]
---

# Surface brief: demo 对比页（demo/public/index.html）

## Scope and mode

Operate。单页工具：外部访客第一次来，配置 key → 输入/选示例 → 标注 → 两栏对听 → 下载/历史。桌面优先，手机能用。

## Audience, job, constraints

- 访客要一眼看清 skill 加了哪些标签、改了哪些字句，读懂标注策略，再用耳朵验证。
- 不能太冷（开发者控制台感）、太花、回到米色+衬线的复古、或像通用 AI 模板（渐变紫、玻璃卡片）。
- 保留全部现有功能：两家 TTS 设置与模型 datalist、标注引擎切换、max tokens、两栏标注/原文开关、手动编辑文本、流式标注、策略说明、生成/停止/下载、各引擎 5 条历史、隐私说明、localStorage 持久化。

## Direction contract

THESIS: 每次标注都像有人发来一条消息：标注文本是气泡，生成的语音是挂在气泡下的语音条。拒绝深色波形 playground 和米色纸张复古这两种品类默认。

OWN-WORLD: 中性浅灰底（#F2F2F4），白色卡片与气泡，气泡一律白底（用户要求：标注后不变黄，保证可读性），蜂蜜黄（#FFE7A3）只用于选中/待生成等小面积状态，琥珀（#E8930C）只给主操作和正在播放的波形。标签是四色小胶囊：情绪（焦糖）、停顿呼吸（石板蓝）、音色语调（梅紫）、动作（玫红），全站一致。圆角大（气泡 22px、胶囊全圆），Figtree + Noto Sans SC，自绘线性 SVG 图标。

STORY: 访客看到「待标注文本」和示例，点一下就能标注；右侧两条对话里标签以彩色胶囊出现、改写处有下划线，导演备注解释为什么；点语音条对听，正在听的一栏亮起、另一栏退后。

FIRST VIEWPORT: 顶栏左品牌（不放说明文字和 GitHub 链接，用户要求删除），右侧设置胶囊显示 key 就绪状态（未配置时设置面板自动展开）。左栏 ~390px 写作卡：文本框、示例胶囊、整宽琥珀主按钮、标注引擎行（隐私说明只留在设置面板里，用户要求删除）。右栏右上角四色图例（「听听区别」标题按用户要求删除），两列严格对位的对话列（引擎名、模型、标注开关、气泡、语音条；头像和气泡小计按用户要求删除），下方导演备注，再下方最近生成。

FORM: 聊天语音消息（候选清单第 5 位，抽签指定）。seed:43c646320bd83afa。Signature move：按真实音频解码画出的波形语音条，可点击定位，替换原生 audio 控件。Raises：焦点跟着耳朵走（播放栏抬起、另一栏变淡，来自流媒体海报墙）；原文/标注切换时句子原地不动，只有标签和改写收起展开（来自像素字样本）；标签分类固定墨色（来自午夜地铁图）；两栏同字号同行宽对位（来自植物图谱）。

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- 文本较长时气泡高度策略（当前：自适应，最高后内部滚动）。
