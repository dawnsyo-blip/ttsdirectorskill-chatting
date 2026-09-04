import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
// 项目目录结构：<repo root>/demo/server/skillPrompt.js
// skill 文件在 <repo root>/ 下（demo/ 的上一级）
const skillRoot = path.resolve(here, "..", "..");

function readSkillFile(name) {
  const p = path.join(skillRoot, name);
  try {
    return fs.readFileSync(p, "utf-8");
  } catch (err) {
    console.warn(`[skillPrompt] 找不到 ${p}，跳过。（${err.message}）`);
    return "";
  }
}

const SKILL_MD = readSkillFile("SKILL.md");
const TAGS_MD = readSkillFile("s2-pro-tags.md");
const EXAMPLES_MD = readSkillFile("examples.md");
const POLYPHONE_MD = readSkillFile("polyphone-checklist.md");

const OUTPUT_FORMAT_INSTRUCTION = `
## Demo 输出格式要求

严格按照下面的格式输出，不要输出格式之外的任何文字（不要加对话式的开场白或结束语，不要用 markdown 代码块包裹）：

===ANNOTATED===
（标注后的完整文本，带方括号标签，可直接用于 TTS API 调用；这部分允许换行，原样输出，不需要做任何转义）
===STRATEGY===
（一到两句话，说明你的标注策略和关键决策；只写一行）
===END===

只标注文本本身。如果输入是多人对话，只标注看起来要合成语音的那一方（通常是称为"B"或标了"AI/角色"的一方），忽略视觉排版符号（如棋盘、表情包描述）。`;

// SKILL.md + s2-pro-tags.md + examples.md：每次请求都一样，是 system prompt 里最大的一块，
// 也是最值得被 Claude prompt caching / 各家 OpenAI 兼容接口的自动前缀缓存命中的部分。
const CORE_PROMPT = [
  SKILL_MD,
  "\n\n---\n\n# s2-pro-tags.md\n\n",
  TAGS_MD,
  "\n\n---\n\n# examples.md\n\n",
  EXAMPLES_MD,
].join("");

const POLYPHONE_BLOCK = "\n\n---\n\n# polyphone-checklist.md\n\n" + POLYPHONE_MD;

// polyphone-checklist.md 按 skill 自己的说明是"按需读取"，这里真的做成按需：
// 从表格第一列解析出词条（比如"重要"、"银行"、"睡觉"），只有本次要标注的文本里
// 出现了至少一个词条，才把这几千字节的速查表拼进 system prompt，省掉不需要的场景。
// 解析逻辑会剥掉括号里的说明文字、按 / 、拆开多个候选词——有几行本身就是单字
// （比如"行""晕"），拆出来的触发词会比较宽泛、经常命中，这是有意的：宁可多算
// 几次误判也不想漏掉真正需要多音字校正的文本，省 token 的优先级低于标对读音。
function extractPolyphoneTriggers(md) {
  const triggers = new Set();
  for (const line of md.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const firstCell = trimmed.split("|")[1]?.trim() ?? "";
    if (!firstCell || firstCell === "词" || /^-+$/.test(firstCell)) continue; // 跳过表头/分隔行
    const withoutNotes = firstCell.replace(/[（(][^）)]*[）)]/g, "");
    for (const part of withoutNotes.split(/[/、]/)) {
      const word = part.replace(/^[…。\s]+|[…。\s]+$/g, "");
      if (word) triggers.add(word);
    }
  }
  return [...triggers];
}

const POLYPHONE_TRIGGERS = extractPolyphoneTriggers(POLYPHONE_MD);

function needsPolyphoneChecklist(text) {
  return POLYPHONE_TRIGGERS.some((trigger) => text.includes(trigger));
}

// 给 OpenAI 兼容接口用：一整段字符串。CORE_PROMPT 永远是开头那一段不变的前缀，
// 后面要不要接 polyphone 块不影响这段前缀本身，支持自动前缀缓存的接口（比如
// DeepSeek）依然能对这部分命中缓存。
export function buildSystemPromptString(text) {
  const parts = [CORE_PROMPT];
  if (needsPolyphoneChecklist(text)) parts.push(POLYPHONE_BLOCK);
  parts.push(OUTPUT_FORMAT_INSTRUCTION);
  return parts.join("");
}

// 给 Claude 用：拆成多个 content block，只在 CORE_PROMPT 这一块上打 cache_control
// 断点——这样不管这次要不要带 polyphone 块，CORE_PROMPT 都是逐字节相同的内容，
// 缓存命中率不会因为多了/少了 polyphone 块而受影响。
export function buildSystemBlocks(text) {
  const blocks = [{ type: "text", text: CORE_PROMPT, cache_control: { type: "ephemeral" } }];
  if (needsPolyphoneChecklist(text)) blocks.push({ type: "text", text: POLYPHONE_BLOCK });
  blocks.push({ type: "text", text: OUTPUT_FORMAT_INSTRUCTION });
  return blocks;
}

export const USER_INSTRUCTION_PREFIX = "请按照 TTS Director 规则，为以下中文文本添加 Fish Audio S2 Pro 标签：\n\n";
