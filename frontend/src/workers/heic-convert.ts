import convert from "heic-convert";

self.onmessage = async (e: MessageEvent) => {
  const {
    taskId,
    arrayBuffer,
    name,
    lastModified,
    quality = 0.9,
  } = e.data as {
    taskId: string;
    arrayBuffer: ArrayBuffer;
    name: string;
    lastModified: number;
    quality?: number;
  };

  try {
    const output = await convert({
      // @ts-expect-error weird ahh
      buffer: new Uint8Array(arrayBuffer),
      format: "JPEG",
      quality,
    });

    const u8 = output as unknown as Uint8Array;

    (self as any).postMessage(
      { ok: true, taskId, name, lastModified, buffer: u8.buffer },
      [u8.buffer]
    );
  } catch (error) {
    (self as any).postMessage({ ok: false, taskId, error: String(error) });
  }
};
