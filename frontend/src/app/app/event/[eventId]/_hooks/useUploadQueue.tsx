"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { processFile } from "@/lib/utils";

import toast from "react-hot-toast";

const MAX_BATCH_BYTES = 100 * 1024 * 1024; // 100MB

const needsConversion = (file: File) =>
  file.type === "image/heic" ||
  file.type === "image/heif" ||
  /\.hei[cf]$/i.test(file.name);

type T_FileQueue = {
  id: string;
  fileIn: File;
  fileOut?: File;
  previewUrl?: string;
  status: "processing" | "ready" | "error";
  hash?: string;
  needsConversion: boolean;
};

async function hashFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
}

export function useUploadQueue() {
  const [items, setItems] = useState<T_FileQueue[]>([]);
  const blobsRef = useRef<Set<string>>(new Set());

  const addBlob = (url?: string) => {
    if (url) blobsRef.current.add(url);
  };

  const revokeBlob = (url?: string) => {
    if (!url) return;

    try {
      URL.revokeObjectURL(url);
    } catch {}

    blobsRef.current.delete(url);
  };

  useEffect(
    () => () => {
      for (const url of blobsRef.current) revokeBlob(url);
    },
    []
  );

  const updateItem = (id: string, patch: Partial<T_FileQueue>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;

        if (
          patch.previewUrl &&
          it.previewUrl &&
          patch.previewUrl !== it.previewUrl
        ) {
          revokeBlob(it.previewUrl);
        }

        if (patch.previewUrl) addBlob(patch.previewUrl);

        return { ...it, ...patch };
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);

      if (target?.previewUrl) revokeBlob(target.previewUrl);

      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    setItems((prev) => {
      prev.forEach((i) => revokeBlob(i.previewUrl));

      return [];
    });
  };

  const totalBytes = useMemo(
    () => items.reduce((a, i) => a + (i.fileOut?.size ?? i.fileIn.size), 0),
    [items]
  );

  const canUpload = useMemo(
    () =>
      items.length > 0 &&
      items.every((i) => i.status !== "processing") &&
      totalBytes <= MAX_BATCH_BYTES,
    [items, totalBytes]
  );

  const addFiles = async (files: File[]) => {
    const current = items.reduce((a, i) => a + i.fileIn.size, 0);
    const incoming = files.reduce((a, f) => a + f.size, 0);

    if (current + incoming > MAX_BATCH_BYTES) {
      toast.error("Total batch size cannot exceed 50 MB");

      return;
    }

    const newWithHashes = await Promise.all(
      files.map(async (f) => ({ file: f, hash: await hashFile(f) }))
    );

    const existing = new Set(items.map((i) => i.hash));

    const seenThisBatch = new Set<string>();
    const uniques: { file: File; hash: string }[] = [];

    for (const { file, hash } of newWithHashes) {
      if (existing.has(hash) || seenThisBatch.has(hash)) {
        toast.error(`File already selected: ${file.name}`, {
          id: `dup-${hash}`,
        });

        continue;
      }

      seenThisBatch.add(hash);
      uniques.push({ file, hash });
    }

    if (uniques.length === 0) return;

    const staged = uniques.map(({ file, hash }) => ({
      id: crypto.randomUUID(),
      fileIn: file,
      status: "processing" as const,
      needsConversion: needsConversion(file),
      hash,
      previewUrl: undefined,
      fileOut: undefined,
    }));

    setItems((prev) => [...prev, ...staged]);

    staged.forEach(async (item) => {
      try {
        if (!item.needsConversion) {
          const immediate = URL.createObjectURL(item.fileIn);

          addBlob(immediate);

          updateItem(item.id, {
            previewUrl: immediate,
          });
        }

        const result = await processFile(item.fileIn);

        if (!result.success || !result.data)
          throw new Error("Failed to process file");

        const { file: fileOut, preview } = result.data;

        addBlob(preview);

        updateItem(item.id, {
          status: "ready",
          fileOut,
          previewUrl: preview,
        });
      } catch (error) {
        console.error(error);

        updateItem(item.id, { status: "error" });
      }
    });
  };

  return {
    items,
    addFiles,
    removeItem,
    clearAll,
    canUpload,
    totalBytes,
  };
}
