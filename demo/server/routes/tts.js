import express from "express";

const router = express.Router();
const TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function pipeAudioOrError(upstream, res) {
  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    res.status(502).json({ error: `上游返回 ${upstream.status}：${body.slice(0, 300)}` });
    return;
  }
  const arrayBuffer = await upstream.arrayBuffer();
  res.set("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
  res.send(Buffer.from(arrayBuffer));
}

// Fish Audio —— 模型选择是 HTTP header（不是 body 字段）；这个 demo 里不传时兜底成免费的 s2.1-pro-free
// （上游 API 本身不传 header 时默认是付费的 s2.1-pro，这里是我们自己在应用层选的更保守的默认值）
router.post("/fish", async (req, res) => {
  const { text, apiKey, voiceId, model } = req.body ?? {};
  if (!text || !text.trim()) return res.status(400).json({ error: "文本不能为空" });
  if (!apiKey) return res.status(400).json({ error: "请先在设置里填写 Fish Audio API Key" });
  if (!voiceId) return res.status(400).json({ error: "请先在设置里填写 Fish Audio Voice ID（reference_id）" });

  try {
    const upstream = await fetchWithTimeout("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: model || "s2.1-pro-free",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        temperature: 0.7,
        top_p: 0.7,
        prosody: { speed: 1, volume: 0 },
        normalize: true,
        format: "mp3",
        latency: "normal",
      }),
    });
    await pipeAudioOrError(upstream, res);
  } catch (err) {
    const message = err.name === "AbortError" ? "Fish Audio 请求超时（30秒）" : err.message;
    console.error("[tts/fish] 失败：", err);
    res.status(502).json({ error: message });
  }
});

// ElevenLabs —— 模型是 model_id body 字段
router.post("/elevenlabs", async (req, res) => {
  const { text, apiKey, voiceId, model } = req.body ?? {};
  if (!text || !text.trim()) return res.status(400).json({ error: "文本不能为空" });
  if (!apiKey) return res.status(400).json({ error: "请先在设置里填写 ElevenLabs API Key" });
  if (!voiceId) return res.status(400).json({ error: "请先在设置里填写 ElevenLabs Voice ID" });

  try {
    const upstream = await fetchWithTimeout(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: model || "eleven_v3",
          voice_settings: {
            stability: 0.28,
            similarity_boost: 0.75,
            style: 0.9,
            use_speaker_boost: true,
          },
        }),
      },
    );
    await pipeAudioOrError(upstream, res);
  } catch (err) {
    const message = err.name === "AbortError" ? "ElevenLabs 请求超时（30秒）" : err.message;
    console.error("[tts/elevenlabs] 失败：", err);
    res.status(502).json({ error: message });
  }
});

export default router;
