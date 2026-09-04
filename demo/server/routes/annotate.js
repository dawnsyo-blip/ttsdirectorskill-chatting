import express from "express";
import dns from "dns";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemBlocks, buildSystemPromptString, USER_INSTRUCTION_PREFIX } from "../skillPrompt.js";

const router = express.Router();

// "OpenAI 兼容接口"的 baseURL 是调用者随便填的，服务器会原样对它发请求——本机跑
// 的时候这只能打到自己，但部署到公网后，任何人都能把 baseURL 填成服务器所在机器
// 的内网地址（比如云厂商的元数据接口 169.254.169.254），让服务器帮忙探测/攻击内网，
// 这是经典的 SSRF。默认拒绝解析到内网/本机地址的 baseURL；如果你是本地跑这个 demo、
// 想指向自己电脑或局域网里的模型服务（Ollama、LM Studio、自建网关……），启动时设置
// 环境变量 ALLOW_PRIVATE_ANNOTATE_TARGETS=true 可以关掉这个限制。
const ALLOW_PRIVATE_TARGETS = process.env.ALLOW_PRIVATE_ANNOTATE_TARGETS === "true";

function isPrivateIPv4(ip) {
  return (
    /^0\./.test(ip) ||
    /^10\./.test(ip) ||
    /^127\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^192\.168\./.test(ip)
  );
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower === "::" ||
    lower.startsWith("fe80:") || // link-local
    lower.startsWith("fc") || // unique-local fc00::/7
    lower.startsWith("fd") ||
    lower.startsWith("::ffff:127.") || // IPv4-mapped 形式，绕过上面 IPv4 的检查
    lower.startsWith("::ffff:10.") ||
    lower.startsWith("::ffff:169.254.") ||
    lower.startsWith("::ffff:192.168.")
  );
}

async function assertPublicHttpUrl(rawUrl) {
  if (ALLOW_PRIVATE_TARGETS) return;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Base URL 不是合法的网址");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Base URL 必须是 http:// 或 https://");
  }
  const hostname = parsed.hostname;
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("出于安全考虑，Base URL 不能指向本机/内网地址（如需本地模型服务，启动服务器时设置 ALLOW_PRIVATE_ANNOTATE_TARGETS=true）");
  }

  let addresses;
  try {
    addresses = await dns.promises.lookup(hostname, { all: true });
  } catch {
    throw new Error("无法解析 Base URL 对应的域名");
  }
  for (const { address, family } of addresses) {
    const isPrivate = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address);
    if (isPrivate) {
      throw new Error("出于安全考虑，Base URL 不能指向本机/内网地址（如需本地模型服务，启动服务器时设置 ALLOW_PRIVATE_ANNOTATE_TARGETS=true）");
    }
  }
}

const DEFAULT_MAX_TOKENS = 8192;
const MIN_MAX_TOKENS = 256;
const MAX_MAX_TOKENS = 65536;

function resolveMaxTokens(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_TOKENS;
  return Math.min(Math.max(Math.round(n), MIN_MAX_TOKENS), MAX_MAX_TOKENS);
}

async function streamClaude({ text, apiKey, model, maxTokens, onChunk }) {
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    // system prompt 拆成了多个 content block，最大的一块（skill 规则+标签表+示例）
    // 每次请求字节都一样，打上 cache_control 之后同一个 key 在缓存有效期内（默认
    // 5 分钟）重复调用不用重新处理这几万 token，首字延迟和成本都会明显下降；
    // polyphone 速查表只在文本命中多音字时才附加，不影响前面那块的缓存。
    system: buildSystemBlocks(text),
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

async function streamOpenAICompatible({ text, apiKey, model, baseURL, maxTokens, onChunk }) {
  await assertPublicHttpUrl(baseURL);
  const base = baseURL.replace(/\/+$/, "");
  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: buildSystemPromptString(text) },
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
  const { text, provider, apiKey, model, baseURL, maxTokens } = req.body ?? {};
  const resolvedMaxTokens = resolveMaxTokens(maxTokens);

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
      await streamClaude({ text, apiKey, model, maxTokens: resolvedMaxTokens, onChunk });
    } else {
      diag = await streamOpenAICompatible({ text, apiKey, model, baseURL, maxTokens: resolvedMaxTokens, onChunk });
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
