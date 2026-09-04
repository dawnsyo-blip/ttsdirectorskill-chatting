# 常见易错多音字速查表（按需读取）

这个文件**不需要每次标注都读**——只在通读文本时发现疑似多音字、又拿不准读音时才查。语法规则见 `s2-pro-tags.md` 的"发音校正：音素控制"章节。

**维护原则**：这不是一本要穷举的词典，穷举既做不完，也没必要每次都加载增加 token 成本。只收录**陪伴对话文本里真实出现过、且验证过容易被模型读错**的字词。遇到新的踩坑字，验证读音正确后按下面的格式追加一行即可。

| 词 | 语境 | 正确读音写法 |
|---|---|---|
| 奇偶数 | "奇"在"奇偶"里读一声，不是 qí | `<\|phoneme_start\|>ji1<\|phoneme_end\|>` |
| 重要 | "重"表示程度 | `<\|phoneme_start\|>zhong4<\|phoneme_end\|><\|phoneme_start\|>yao4<\|phoneme_end\|>` |
| 重庆 | "重"是地名用字 | `<\|phoneme_start\|>chong2<\|phoneme_end\|><\|phoneme_start\|>qing4<\|phoneme_end\|>` |
| 银行 | "行"表示机构 | `<\|phoneme_start\|>yin2<\|phoneme_end\|><\|phoneme_start\|>hang2<\|phoneme_end\|>` |
| 行走 | "行"表示动作 | `<\|phoneme_start\|>xing2<\|phoneme_end\|><\|phoneme_start\|>zou3<\|phoneme_end\|>` |
| 还是 | "还"表示"仍然/或者" | `<\|phoneme_start\|>hai2<\|phoneme_end\|>` |
| 归还 | "还"表示"归还" | `<\|phoneme_start\|>huan2<\|phoneme_end\|>` |
| 数落 | "数"表示"责备" | `<\|phoneme_start\|>shu3<\|phoneme_end\|>` |
| 数字 | "数"表示"数量" | `<\|phoneme_start\|>shu4<\|phoneme_end\|>` |
| 差点 | "差"表示"几乎" | `<\|phoneme_start\|>cha4<\|phoneme_end\|>` |
| 觉得 | "觉"表示"感觉" | `<\|phoneme_start\|>jue2<\|phoneme_end\|>` |
| 睡觉 | "觉"表示"睡眠" | `<\|phoneme_start\|>jiao4<\|phoneme_end\|>` |
| 行（量词/序号，如"第二行"里独立出现的"行"） | 表示"行、列"的"行" | `<\|phoneme_start\|>hang2<\|phoneme_end\|>` |
| 倒在 | "倒"表示"跌倒、落败"（不是"倒是/倒水"的 dào） | `<\|phoneme_start\|>dao3<\|phoneme_end\|>` |
| 睡。觉。（单字拆开强调时） | "觉"单独出现容易被默认读成 jué（感觉），此处要读"睡眠"的音 | `<\|phoneme_start\|>jiao4<\|phoneme_end\|>` |
| 倒是 | "倒"表示转折"反而/其实"（和上面"倒在"的 dǎo 是同一个字、不同语境不同读音） | `<\|phoneme_start\|>dao4<\|phoneme_end\|>` |
| 薄云 / 薄雾 | 描述天气/大气层的"薄"，惯用读法是 bó，不是形容纸张厚度的 báo | `<\|phoneme_start\|>bo2<\|phoneme_end\|>` |
| ……晕（光学意义的"晕"，如冰晶晕、月晕） | "晕"表示光学的"晕圈"，读 yùn，不是"眩晕"的 yūn | `<\|phoneme_start\|>yun4<\|phoneme_end\|>` |
| 当……吃 / 当作 | "当"表示"把……看作"，读 dàng，不是"应当"的 dāng | `<\|phoneme_start\|>dang4<\|phoneme_end\|>` |
| 数数 | 两个"数"字挨在一起、读音还不同：前一个是动词"清点"（shǔ），后一个是名词"数字"（shù） | `<\|phoneme_start\|>shu3<\|phoneme_end\|><\|phoneme_start\|>shu4<\|phoneme_end\|>` |

新增记录时只需要追加一行：`| 词 | 语境说明 | 音素标签 |`，不用改动其他文件。
