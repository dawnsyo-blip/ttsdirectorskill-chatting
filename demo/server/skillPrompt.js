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

// 核心规则 + 标签速查表 + 示例，始终拼进 system prompt。
// polyphone-checklist.md 按 skill 自己的说明是"按需读取"，
// 但在这个 demo 里我们一次性把它也拼进去——demo 场景下每次都是新对话，
// 没有"多轮里按需检索"的机制，为了让多音字修正稳定生效，直接常驻。
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

export const SKILL_SYSTEM_PROMPT = [
  SKILL_MD,
  "\n\n---\n\n# references/s2-pro-tags.md\n\n",
  TAGS_MD,
  "\n\n---\n\n# references/examples.md\n\n",
  EXAMPLES_MD,
  "\n\n---\n\n# references/polyphone-checklist.md\n\n",
  POLYPHONE_MD,
  OUTPUT_FORMAT_INSTRUCTION,
].join("");

export const USER_INSTRUCTION_PREFIX = "请按照 TTS Director 规则，为以下中文文本添加 Fish Audio S2 Pro 标签：\n\n";
