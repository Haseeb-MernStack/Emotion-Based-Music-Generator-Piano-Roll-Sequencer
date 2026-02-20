import { generateFromEmotion as generateFromEmotionShared } from "../engine/generators/emotion.generator";

self.addEventListener("message", async (ev) => {
  const { type, payload } = ev.data || {} as Record<string, unknown>;
  if (type === "generateFromEmotion") {
    try {
      const root = (payload as Record<string, unknown>).root as string;
      const emotion = (payload as Record<string, unknown>).emotion as string;
      const result = await generateFromEmotionShared(root, emotion as any);
      // Normalize melody values to allow nulls
      if (Array.isArray(result.melody)) result.melody = result.melody.map((m: unknown) => (m ?? null) as string | null);
      // Post back the composition
      postMessage({ type: "result", result });
    } catch (err) {
      postMessage({ type: "error", error: String(err) });
    }
  }
});

export {};
