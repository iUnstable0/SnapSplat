"use client";

import { useEffect, useState, useRef, useMemo } from "react";

import Image from "next/image";

import { Plus } from "lucide-react";

import { clamp } from "@/lib/utils";

import styles from "./canvas.module.scss";

export default function Canvas() {
  const WORLD = { width: 1800, height: 1300 };
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;

  const [scale, setScale] = useState<number>(1);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const scaled = useMemo(
    () => ({
      width: Math.max(1, Math.round(WORLD.width * scale)),
      height: Math.max(1, Math.round(WORLD.height * scale)),
    }),
    [WORLD.width, WORLD.height, scale],
  );

  const clientToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const world = worldRef.current;

    if (!canvas || !world) {
      return { x: 0, y: 0 };
    }

    const worldRect = world.getBoundingClientRect();

    const px = canvas.scrollLeft + (clientX - worldRect.left);
    const py = canvas.scrollTop + (clientY - worldRect.top);

    return {
      x: px / scale - WORLD.width / 2,
      y: py / scale - WORLD.height / 2,
    };
  };

  const clientToCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const canvasRect = canvas.getBoundingClientRect();

    return {
      x: clientX - canvasRect.left + canvas.scrollLeft,
      y: clientY - canvasRect.top + canvas.scrollTop,
    };
  };

  return (
    <div
      className={styles.canvas}
      ref={canvasRef}
      onMouseMove={(e) => {
        const stuff = clientToCanvas(e.clientX, e.clientY);
        console.log(stuff);
      }}
      onWheel={(e) => {
        // For some reason this throws an error
        //
        // e.preventDefault();
        //

        const zoomKey = e.ctrlKey || e.metaKey;

        if (!zoomKey) {
          return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const cursor_x = e.clientX;
        const cursor_y = e.clientY;

        const before = clientToWorld(cursor_x, cursor_y);
        const px = (before.x + WORLD.width / 2) * scale;
        const py = (before.y + WORLD.height / 2) * scale;

        const zoomStep = e.deltaY > 0 ? 0.98 : 1.02;
        const next = clamp(scale * zoomStep, MIN_ZOOM, MAX_ZOOM);

        if (next === scale) {
          // console.log("max zoom reached");
          return;
        }

        setScale(next);

        requestAnimationFrame(() => {
          const canvasRect = canvas.getBoundingClientRect();

          const offset_x = cursor_x - canvasRect.left;
          const offset_y = cursor_y - canvasRect.top;

          const targetScrollLeft = px * next - offset_x;
          const targetScrollTop = py * next - offset_y;

          canvas.scrollTo({ left: targetScrollLeft, top: targetScrollTop });
        });
      }}
    >
      <div
        ref={worldRef}
        className={styles.world}
        style={{
          width: scaled.width,
          height: scaled.height,
        }}
      >
        <div
          ref={overlayRef}
          className={styles.overlay}
          style={{
            transform: `scale(${scale})`,
            width: WORLD.width,
            height: WORLD.height,
          }}
        >
          <div
            className={styles.content}
            style={{
              left: WORLD.width / 2,
              top: WORLD.height / 2,
            }}
          >
            <div className={styles.crosshair}>
              <Plus />
            </div>

            <img
              className={styles.image}
              src="/test.jpeg"
              // width={100}
              // height={100}
              alt={"Test"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
