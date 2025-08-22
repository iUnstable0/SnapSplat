import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getHeicPool } from "@/workers/heicPool";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function processFile(file: File) {
  let processedFile = file;
  let previewUrl: string;

  const isHeic =
    file.type === "image/heic" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heif");

  if (isHeic) {
    try {
      const pool = getHeicPool();

      if (!pool) {
        const { default: convert } = await import("heic-convert/browser");

        const outputBuffer = await convert({
          // @ts-expect-error weird err and bruh ts forcing me to write this msg
          buffer: new Uint8Array(await file.arrayBuffer()),
          format: "JPEG",
          quality: 0.9,
        });

        const blob = new Blob([outputBuffer], { type: "image/jpeg" });

        previewUrl = URL.createObjectURL(blob);

        processedFile = new File(
          [blob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          {
            type: "image/jpeg",
            lastModified: file.lastModified,
          }
        );
      } else {
        const arrayBuffer = await file.arrayBuffer();

        const { buffer, name, lastModified } = await pool.run({
          arrayBuffer,
          name: file.name,
          lastModified: file.lastModified,
          quality: 0.9,
        });

        const blob = new Blob([buffer], { type: "image/jpeg" });

        previewUrl = URL.createObjectURL(blob);

        processedFile = new File(
          [blob],
          name?.replace(/\.(heic|heif)$/i, ".jpg") ||
            file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          {
            type: "image/jpeg",
            lastModified: lastModified ?? file.lastModified,
          }
        );
      }
    } catch (error) {
      console.error(error);

      return { success: false, data: null as any };
    }
  } else {
    previewUrl = URL.createObjectURL(file);
  }

  return { success: true, data: { file: processedFile, preview: previewUrl } };
}
