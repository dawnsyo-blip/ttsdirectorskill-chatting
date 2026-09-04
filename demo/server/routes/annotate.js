import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { SKILL_SYSTEM_PROMPT, USER_INSTRUCTION_PREFIX } from "../skillPrompt.js";

const router = express.Router();

async function streamClaude({ text, apiKey, model, onChunk }) {
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model,
    max_tokens: 8192,
    // system prompt 是固定的大段 skill 规则、每次请求字节都一样，
    // 打上 cache_control 之后同一个 key 在缓存有效期内（默认 5 分钟）重复调用
    // 不用重新处理这几万 token，首字延迟和成本都会明显下降。
    system: [{ type: "text", text: SKILL_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: USER_INSTRUCTION_PREFIX + text }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      onChunk(event.delta.text);
    }
  }
  const final = await stream.finalMessage(); // 把流真正跑完，底层错误（鉴权/限流等）会在这里抛出来
  const u = final.usage;
  console.log(
    `[annotate/claude] input=${u.input_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0} output=${u.output_tokens}`,
  );
}

async function streamOpenAICompatible({ text, apiKey, model, baseURL, onChunk }) {
  const base = baseURL.replace(/\/+$/, "");
  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      stream: true,
      messages: [
        { role: "system", content: SKILL_SYSTEM_PROMPT },
        { role: "user", content: USER_INSTRUCTION_PREFIX + text },
      ],
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`接口返回 ${resp.status}：${body.slice(0, 300)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  // 有些"推理/思考"模型（比如 deepseek 的 flash/reasoner 系列）会先在
  // delta.reasoning_content 里流式吐一段思考过程，思考完才开始吐 delta.content。
  // 这里单独记录一下，好在正文一直是空的时候给出更准确的提示。
  let sawReasoningOnly = false;
  let finishReason = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta;
        if (delta?.content) onChunk(delta.content);
        else if (delta?.reasoning_content) sawReasoningOnly = true;
        if (json?.choices?.[0]?.finish_reason) finishReason = json.choices[0].finish_reason;
      } catch {
        // 有些网关会在 SSE 流里塞心跳/注释行，解析不了就跳过
      }
    }
  }
  return { sawReasoningOnly, finishReason };
}

router.post("/", async (req, res) => {
  const { text, provider, apiKey, model, baseURL } = req.body ?? {};

  if (!text || !text.trim()) return res.status(400).json({ error: "文本不能为空" });
  if (!apiKey) return res.status(400).json({ error: "请先在设置里填写标注引擎的 API Key" });
  if (!model) return res.status(400).json({ error: "请填写模型名称" });
  if (provider === "openai-compatible" && !baseURL) {
    return res.status(400).json({ error: "请填写 OpenAI 兼容接口的 Base URL" });
  }
  if (provider !== "claude" && provider !== "openai-compatible") {
    return res.status(400).json({ error: `未知的 provider: ${provider}` });
  }

  // 只有真的收到第一块内容时才切换成流式响应；
  // 如果一上来就失败（比如 key 无效），这时候还没写过任何东西，可以照常返回 JSON 错误。
  let wroteAny = false;
  const onChunk = (chunk) => {
    if (!wroteAny) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      wroteAny = true;
    }
    res.write(chunk);
  };

  try {
    let diag = null;
    if (provider === "claude") {
      await streamClaude({ text, apiKey, model, onChunk });
    } else {
      diag = await streamOpenAICompatible({ text, apiKey, model, baseURL, onChunk });
    }

    // 请求本身没报错，但一个字都没吐出来——不要静默返回空结果，明确报错。
    if (!wroteAny) {
      let hint = "模型没有返回任何正文内容，请检查模型设置或稍后重试。";
      if (diag?.sawReasoningOnly && diag.finishReason === "length") {
        hint = "模型把 max_tokens 全部用在了思考过程（reasoning_content）上，还没来得及输出正文就被截断了。这类推理/思考模型通常需要更大的 max_tokens，建议换成非推理版本的模型（比如去掉 reasoner/thinking 后缀的版本），或者联系接口方能否调大输出上限。";
      } else if (diag?.finishReason === "length") {
        hint = "模型输出被 max_tokens 截断，一个字都没生成。可以尝试简化输入文本，或联系接口方调大输出上限。";
      }
      throw new Error(hint);
    }

    res.end();
  } catch (err) {
    console.error("[annotate] 失败：", err);
    let message = err.message || "标注失败";
    if (err instanceof Anthropic.AuthenticationError) message = "Claude API Key 无效或已过期";
    else if (err instanceof Anthropic.RateLimitError) message = "Claude 触发限流，稍后再试";
    else if (err instanceof Anthropic.APIError) message = `Claude API 错误（${err.status}）：${err.message}`;

    if (!wroteAny) {
      res.status(502).json({ error: message });
    } else {
      // 流已经开始了，没法再改成 JSON 响应——用前端认得出的哨兵标记把错误信息带过去
      res.write(`\n===STREAM_ERROR===${message}`);
      res.end();
    }
  }
});

export default router;
