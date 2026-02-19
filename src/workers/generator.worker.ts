import { generateFromEmotion as generateFromEmotionShared } from "../engine/generators/emotion.generator";

self.addEventListener("message", async (ev) => {
  const { type, payload } = ev.data || {};
  if (type === "generateFromEmotion") {
    try {
      const result = await generateFromEmotionShared(payload.root, payload.emotion);
      // Normalize melody values to allow nulls
      if (Array.isArray(result.melody)) result.melody = result.melody.map((m: any) => m ?? null);
      // Post back the composition
      // `postMessage` must serialize plain data (no functions)
      // Ensure result is JSON-serializable
      postMessage({ type: "result", result });
    } catch (err) {
      postMessage({ type: "error", error: String(err) });
    }
  }
});

export {};
