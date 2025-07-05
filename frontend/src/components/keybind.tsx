import React, { useEffect, useState } from "react";
// import useSound from "use-sound";
import clsx from "clsx";

import {
  ArrowBigUp,
  CircleArrowOutUpLeft,
  CornerDownLeft,
  Delete,
} from "lucide-react";

import stylesDynamic from "./keybind-dyn.module.css";
import stylesLight from "./keybind-light.module.css";
import stylesDark from "./keybind-dark.module.css";

import { Magnetic } from "./ui/mp_magnetic";

const letters = "abcdefghijklmnopqrstuvwxyz.";

export enum T_Keybind {
  shift = "shift",
  enter = "enter",
  escape = "escape",
  backspace = "backspace",
  m = "m",
  p = "p",
  e = "e",
  period = ".",
}

export default function Keybind({
  keybinds,
  className,
  parentClass,
  dangerous,
  onPress,
  disabled,
  forcetheme,
}: {
  keybinds: T_Keybind[];
  className?: string;
  parentClass?: string;
  dangerous?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  forcetheme?: "light" | "dark";
}) {
  let styles = stylesDynamic;

  if (forcetheme === "light") {
    styles = stylesLight;
  } else if (forcetheme === "dark") {
    styles = stylesDark;
  }

  // Set of currently held keys
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());

  // useEffect(() => {
  //   setTimeout(() => {
  //     setAnimatedKeys(new Set(heldKeys));
  //   }, 200);
  // }, [heldKeys]);

  useEffect(() => {
    const addToAnimatedKeys = (key: string) => {
      setAnimatedKeys((prev) => new Set(prev).add(key));
    };

    const removeFromAnimatedKeys = (key: string) => {
      setTimeout(() => {
        if (
          onPress &&
          keybinds.every((key) => heldKeys.has(key)) &&
          keybinds[keybinds.length - 1] === key
        ) {
          // If heldKeys has a key that doesnt exist in keybind
          if (heldKeys.size === keybinds.length) {
            // alert(`keybind removed ${key}`);
            if (!disabled) {
              onPress();
            }
          } else {
            // alert("kys sybau");
          }
        }

        setAnimatedKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 200);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // e.preventDefault();
      // e.stopPropagation();

      if (disabled) return;

      const key = e.key.toLowerCase();

      console.log(key);

      // check if key is in keybinds (keybinds type is T_Keybind[])
      // if (keybinds.includes(key as T_Keybind)) {
      // If it alr contain key then abort!

      console.log("key added", key, keybinds.join(","));

      setHeldKeys((prev) => new Set(prev).add(key));
      addToAnimatedKeys(key);
      // }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (heldKeys.has(key)) {
        setHeldKeys((prev) => {
          const next = new Set(prev);

          next.delete(key);

          return next;
        });

        removeFromAnimatedKeys(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldKeys, animatedKeys]);

  return (
    <Magnetic
      intensity={0.1}
      springOptions={{ bounce: 0.1 }}
      actionArea="global"
      className={styles.buttonKeybindMagnet}
      range={disabled ? 0 : 75}
      data-theme={forcetheme}
    >
      {keybinds.map((keybind, index) => (
        <div
          className={clsx(
            styles.buttonKeybind,
            parentClass,
            animatedKeys.has(keybind) &&
              (dangerous
                ? styles.buttonKeybindDangerous_active
                : styles.buttonKeybind_active)
          )}
          key={`keybind_${keybind}_${index}`}
        >
          {keybind === T_Keybind.shift && (
            <ArrowBigUp className={clsx(styles.buttonKeybindIcon, className)} />
          )}
          {keybind === T_Keybind.enter && (
            <CornerDownLeft
              className={clsx(styles.buttonKeybindIcon, className)}
            />
          )}
          {keybind === T_Keybind.escape && (
            <CircleArrowOutUpLeft
              className={clsx(styles.buttonKeybindIcon, className)}
            />
          )}
          {keybind === T_Keybind.backspace && (
            <Delete className={clsx(styles.buttonKeybindIcon, className)} />
          )}
          {letters.includes(keybind) && (
            <span className={clsx(styles.buttonKeybindText, className)}>
              {keybind.toString()}
            </span>
          )}
        </div>
      ))}
    </Magnetic>
  );
}
