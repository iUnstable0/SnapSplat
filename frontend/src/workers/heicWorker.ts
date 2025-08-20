let _worker: Worker | null = null;

export function getHeicWorker() {
  if (typeof window === "undefined") return null;
  if (_worker) return _worker;

  _worker = new Worker(new URL("./heic-convert.ts", import.meta.url), {
    type: "module",
    name: "heic-convert",
  });

  return _worker;
}
