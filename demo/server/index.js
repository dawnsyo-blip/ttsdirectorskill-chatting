import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ProxyAgent, setGlobalDispatcher } from "undici";
import annotateRouter from "./routes/annotate.js";
import ttsRouter from "./routes/tts.js";

// Node 的 fetch（undici）不会像 curl / 浏览器那样自动读取系统代理。
// 很多网络环境访问 Fish Audio / ElevenLabs / 部分 LLM API 需要走本地代理，
// 这里检测常见的代理环境变量，统一设置成全局 dispatcher——
// 这样所有出站请求（这个后端里用到的 fetch、以及 Anthropic SDK 内部用的 fetch）都会走代理。
const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log(`[proxy] 检测到系统代理 ${proxyUrl}，出站请求（标注 + TTS）将通过它转发`);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "..", "public");

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use("/api/annotate", annotateRouter);
app.use("/api/tts", ttsRouter);

app.use(express.static(publicDir));

const PORT = process.env.PORT || 3787;
app.listen(PORT, () => {
  console.log(`TTS Director Demo 已启动：http://localhost:${PORT}`);
});
