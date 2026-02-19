export async function renderToWav(melody: (string | null)[], chords: string[][], tempo: number) {
  // Try worker-based rendering if supported
  try {
    // @ts-ignore
    const worker = new Worker(new URL("../../workers/render.worker.ts", import.meta.url), { type: "module" });
    return await new Promise<Blob>((resolve, reject) => {
      worker.onmessage = (ev: MessageEvent) => {
        const { type, buffer, error } = ev.data || {};
        if (type === "result") {
          const blob = new Blob([buffer], { type: "audio/wav" });
          resolve(blob);
          worker.terminate();
        } else {
          reject(new Error(error || "Unknown render error"));
          worker.terminate();
        }
      };
      worker.onerror = (e) => {
        reject(e.error || new Error("Worker error"));
        worker.terminate();
      };
      worker.postMessage({ type: "render", payload: { melody, chords, tempo } });
    });
  } catch (err) {
    // Fallback: do simple synthesis on main thread
    console.warn("Worker render failed, falling back to main-thread render", err);
    const { encodeWAV, renderComposition } = await import("./wav.render.fallback");
    const buffer = renderComposition(melody, chords, tempo, 44100);
    const wav = encodeWAV(buffer, 44100);
    return new Blob([wav], { type: "audio/wav" });
  }
}

export default renderToWav;
