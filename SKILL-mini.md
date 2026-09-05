# TTS Director（浓缩版）

给中文文本插入 Fish Audio S2 Pro 情感/韵律标签。这是 `SKILL.md` + `s2-pro-tags.md` + `examples.md` + `polyphone-checklist.md`（合计约 11000 token）的压缩替代版，约 1/7 体量，用于 token 敏感的接入场景。

**取舍说明**：保留了完整标签词表（模型猜不出来的外部事实）和最反直觉的判断规则；砍掉了推理过程、示例和大部分展开解释——这些靠模型自身能力能补回来一部分，但"标注密度感"和边界判断会不如完整版。质量优先的场景仍然用完整版。

## 核心判断

- **克制优先**：默认不标注。加标签前先想"不加会有什么问题"，说不出来就不加。
- **密度取决于表里距离，不取决于情绪强度**：文字表面意思离真实情绪越远（嘴上嫌弃、心里关心），越需要标签点出潜台词；表里一致的平铺陈述几乎不用标。日常闲聊/叙事极度克制，节奏交给标点，"什么都不加"经常就是正确答案；情绪急转弯型每个转折都标；口非心是型重点标"反差点"；知识解释型主要用停顿控节奏，只在切换到关心时标一次。
- **改写文本 > 加标签**：断句、加语气词（嗯/啧/唔/咳咳/哈）、叠词（"好好好"）、缓冲词（"看来""所以说"）、昵称、调语序，往往比堆标签有效；书面化的宣告句先改口语化。
- **标签方向和文字方向一致更稳**：`[praising]` 配"聪明……但是又作弊了"，比 `[accuse]` 配"你又作弊"效果好——先想能不能换个词让文字自己带出态度。

## 反直觉规则（最容易做错的地方）

- **命令句、道别语要用软标签**：字面越硬，标签越轻。"去睡觉""闭嘴""晚安"这类真实情绪通常是宠溺式坚持而不是生气，用 `[soft]`/`[whispering]`/`[gently nudging]`；`[serious]`/`[forceful]` 只留给真的在生气的场合。
- **暧昧/调情靠放轻不靠加重**：调情短句前用 `[whispering]` 或 `[voice dropping to a low, sultry tone]`，效果像"凑近了说悄悄话"。但别滥用，只给真正暧昧的重点句。
- **`[surprised]` vs `[with a knowing chuckle]` 看信息落差方向**：新信息**证实**了说话者本来的判断（点破对方心思）→ `[warm]` + `[with a knowing chuckle]`，用 `[surprised]` 会读成"说话者也不知道"；新信息**推翻**了预期 → `[surprised]` 成立。说话者看得穿的是对方的心思，看不穿的是外部事实和对方超出常规的举动（突然辞职、偷偷准备礼物），别执行成"永远不用 `[surprised]`"。文本痕迹可直接判断："我就知道/果然/早说了吧" → 了然；"真的假的/你什么时候/你居然" → 惊讶。嫌错愕太重降档到 `[slightly surprised]`。
- **避免 `[deadpan]`**：模型表现不出"表面冷、内里暖"的反差，会被读成真冷淡；想要嘴硬心软就直接用 `[chuckling] [warm]` 把温度写出来。
- **动词型标签优于情绪型**：`[comfort]`/`[plead]`/`[threaten]`/`[motivate]` 描述"正在做什么"，隐含语调走向（安慰变柔、恳求下行、威胁加重），比 `[sad]`/`[happy]` 精准。

## 用量约束

- 堆叠**最多 2 个**（一个定音量 + 一个定情绪，如 `[soft] [worried]`），不要堆到 3 个；句中不堆叠，选最贴合的一个。
- 停顿类（`[pause]`/`[short pause]`/`[long pause]`）**默认不加**：日常对话短句多，句号逗号已经产生停顿，一句一个 `[pause]` 会读成一顿一顿的朗读腔。只在真正的语义转折、情绪落点上加；`[short pause]` 太短，撑不起句子级转折。
- 呼吸/叹气类（`[inhales]` 系列、`[exhales]`、`[sigh]`）**默认不加**：模型自己就会换气，人为补的呼吸是叠在已有呼吸上，听感是多一声刻意的气音。只在明显段落/话题分界、或这个呼吸本身承载情绪（下决心前的深吸气）时才写。
- **一个衔接点只放一次"呼吸/静默"事件**：停顿标签自带一次起音前的吸气，后面再跟一个也要靠呼吸实现的标签（`[inhales]` 系列/`[exhales]`/`[sigh]`/`[hesitate]`）会连续两次呼吸、变成失真喘息。实测出问题：`[long pause] [inhales softly]`、`[long pause] [hesitate]`、`[long pause] [exhales] [low voice]`。选一个，且优先留呼吸标签（呼吸自带停顿，反之不成立）；`——` 和 `......` 后面同样不接停顿标签。
- 标点本身就是韵律工具：`......` 制造犹豫/拖长（尤其放在"但是""不过"后面），`——` 制造转折，`~` 软化，`！` 加强。
- 标签内容用英文，标签和文本之间留一个空格：`[happy] 你好`。
- 强度用程度副词微调：`[slightly sad]` < `[sad]` < `[very excited]` < `[extremely nervous]`。

## 标签表

**情绪类**：`[sad]` `[happy]` `[excited]` `[curious]` `[teasing]` `[angry]` `[pleased]` `[doting]` `[worried]` `[warm]`（温暖亲近，温柔宠溺型说话者的底色）`[praising]` `[surprised]`（见上方信息落差判据）`[thoughtful]`（需搭配"嗯……"才稳定）`[serious]`（只用于真严肃；堆叠时按情绪类计）

**动词型（优先选这类）**：`[comfort]` `[plead]` `[begging]` `[threaten]` `[motivate]` `[feel sorry]` `[playful]` `[accuse]` `[seduce]` `[shame]` `[punish]` `[dominate]` `[to charm]` `[complain]` `[demanding]` `[hesitate]` `[intention]` `[gently nudging]`（温柔催促）`[pacing each word]`（一字一顿）

**副语言/结构类**：`[pause]` `[short pause]` `[long pause]` `[inhales]` `[inhales deeply]` `[inhales softly]` `[exhales]` `[sigh]` `[chuckle]` `[laugh softly]` `[cough]` `[clear throat]` `[lip-smacking]` `[rushed]`（加快语速）

**语音语调类**：`[soft]` `[whispering]` `[low voice]` `[low and steady]` `[muttering]` `[under breath]` `[crying]` `[sobbing]` `[stammering]`（情绪冲垮语言组织能力，≠`[hesitate]` 的犹豫。**主入口是接在 `[surprised]` 后面**——判定为真惊讶就鼓励写成 `[surprised] [stammering]`，`[slightly surprised]` 那一档不接；也可用于说难以启齿的话、气到说不出话。只标一句，下句即恢复）`[emphasis]`（强调后面的词）`[draw out the final syllable]`（拉长尾音，撒娇/意犹未尽）`[forceful]`（只用于真生气）`[deadpan]`（尽量别用）

**复合描述型**（表现力强、稳定性略低，用于复杂情绪）：`[with a knowing chuckle]`（了然轻笑，说话者早就料到时用）`[warmly teasing]` `[with a soft, fond sigh]` `[warm and amused exhale]` `[with a calm, reassuring tone]` `[chuckling]` `[voice dropping to a low, sultry tone]` `[voice softening into a low murmur]`（撒娇、示弱）

## 发音校正

多音字用 `<|phoneme_start|>拼音+声调数字<|phoneme_end|>` 包住**单个**汉字（声调 1-5，5 为轻声），多字词每个字各包一层，标点留在标签外。只在拿不准读音时用，别滥用。

常错字：奇偶数 ji1、重要 zhong4、重庆 chong2、银行 hang2、行走 xing2、还是 hai2、归还 huan2、数落 shu3、数字 shu4、差点 cha4、觉得 jue2、睡觉 jiao4、倒在 dao3、倒是 dao4、薄雾 bo2、月晕 yun4、当作 dang4、数数 shu3+shu4。

## 不支持

环境音标签（`[wind]`/`[rain]`/`[water sloshing]` 等——S2 Pro 只生成人声）、XML 风格标签（`<emphasis>` 等，那是 Drama 3 的语法）。

## 输出

只输出标注后的文本本身，不加解释。如果输入是多人对话，只标注要合成语音的那一方。
