let _pool: HeicWorkerPool | null = null;

function makeWorker() {
  return new Worker(new URL("./heic-convert.ts", import.meta.url), {
    type: "module",
    name: "heic-convert",
  });
}

type Task = {
  taskId: string;
  arrayBuffer: ArrayBuffer;
  name: string;
  lastModified: number;
  quality: number;
  resolve: (v: {
    buffer: ArrayBuffer;
    name: string;
    lastModified: number;
  }) => void;
  reject: (e: any) => void;
};

class HeicWorkerPool {
  private size: number;
  private idle: Worker[] = [];
  private queue: Task[] = [];
  private listeners = new Map<Worker, (e: MessageEvent) => void>();

  constructor(size: number) {
    this.size = size;

    for (let i = 0; i < size; i++) {
      const w = makeWorker();
      const handler = (e: MessageEvent) => this.handleMessage(w, e);

      w.addEventListener("message", handler);

      this.listeners.set(w, handler);
      this.idle.push(w);
    }
  }

  run(input: {
    arrayBuffer: ArrayBuffer;
    name: string;
    lastModified: number;
    quality?: number;
  }): Promise<{ buffer: ArrayBuffer; name: string; lastModified: number }> {
    const taskId = crypto.randomUUID();

    const task: Task = {
      taskId,
      arrayBuffer: input.arrayBuffer,
      name: input.name,
      lastModified: input.lastModified,
      quality: input.quality ?? 0.9,
      resolve: () => {},
      reject: () => {},
    };

    const p = new Promise<{
      buffer: ArrayBuffer;
      name: string;
      lastModified: number;
    }>((res, rej) => {
      task.resolve = res;
      task.reject = rej;
    });

    this.queue.push(task);
    this.pump();

    return p;
  }

  private pump() {
    while (this.idle.length && this.queue.length) {
      const w = this.idle.pop()!;
      const task = this.queue.shift()!;

      try {
        w.postMessage(
          {
            taskId: task.taskId,
            arrayBuffer: task.arrayBuffer,
            name: task.name,
            lastModified: task.lastModified,
            quality: task.quality,
          },
          [task.arrayBuffer]
        );

        (w as any).__currentTask = task;
      } catch (err) {
        task.reject(err);
        this.idle.push(w);
      }
    }
  }

  private handleMessage(w: Worker, e: MessageEvent) {
    const cur: Task | undefined = (w as any).__currentTask;

    if (!cur) return;

    const { taskId, ok, buffer, name, lastModified, error } = e.data || {};

    if (taskId !== cur.taskId) return;

    (w as any).__currentTask = undefined;

    this.idle.push(w);

    if (!ok) {
      cur.reject(new Error(error || "HEIC convert failed"));
    } else {
      cur.resolve({ buffer, name, lastModified });
    }

    this.pump();
  }

  terminate() {
    for (const [w, handler] of this.listeners) {
      w.removeEventListener("message", handler);
      w.terminate();
    }

    this.listeners.clear();
    this.idle = [];
    this.queue = [];
  }
}

export function getHeicPool(concurrency?: number) {
  if (typeof window === "undefined") return null;

  if (!_pool) {
    const maxHW = Math.max(
      2,
      Math.min(8, (navigator as any).hardwareConcurrency || 4)
    );
    const size = Math.min(concurrency ?? 4, maxHW);
    _pool = new HeicWorkerPool(size);

    // Idk if i should keep this
    window.addEventListener("beforeunload", () => {
      _pool?.terminate();
      _pool = null;
    });
  }

  return _pool;
}
