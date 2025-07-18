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
import Spinner from "./spinner";
import { AnimatePresence, motion } from "motion/react";

const letters = "abcdefghijklmnopqrstuvwxyz.";

export enum T_Keybind {
  shift = "shift",
  enter = "enter",
  escape = "escape",
  backspace = "backspace",
  m = "m",
  p = "p",
  e = "e",
  r = "r",
  s = "s",
  period = ".",
  tab = "tab",
}

export const KeybindButton = ({
  keybinds,
  dangerous,
  onPress,
  textClassName,
  disabled,
  forcetheme,
  children,
  icon,
  iconClassName,
  loading,
  loadingText,
  magnetic = true,
  className,
}: {
  keybinds: T_Keybind[];
  dangerous?: boolean;
  onPress?: () => void;
  textClassName?: string;
  disabled?: boolean;
  forcetheme?: "light" | "dark";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  loading?: boolean;
  loadingText?: string;
  magnetic?: boolean;
  className?: string;
  // loadingTheme?: "light" | "dark" | "dangerous";
}) => {
  let styles;

  if (forcetheme === "light") {
    styles = stylesLight;
  } else if (forcetheme === "dark") {
    console.log("forcetheme", forcetheme);
    styles = stylesDark;
  } else {
    styles = stylesDynamic;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        opacity: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
    >
      <Magnetic
        intensity={0.1}
        springOptions={{ bounce: 0.1 }}
        actionArea="global"
        range={disabled ? 0 : magnetic ? 75 : 0}
        className={className}
      >
        <button
          className={clsx(
            styles.keybindButton,
            dangerous && styles.keybindButtonDangerous,
            dangerous && loading === true && styles.keybindButtonDangerous
          )}
          onClick={() => {
            if (!disabled && !loading) {
              onPress?.();
            }
          }}
          disabled={disabled}
        >
          <AnimatePresence mode="popLayout">
            {!loadingText && icon && (
              <motion.div
                className={clsx(styles.keybindButtonIcon, iconClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}

            {loadingText && !loading && icon && (
              <motion.div
                className={clsx(styles.keybindButtonIcon, iconClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
          </AnimatePresence>

          {loadingText && typeof loading === "boolean" && (
            <Spinner
              id={`keybind-${keybinds.join("-")}`}
              loading={loading}
              size={24}
              dangerous={dangerous}
              forcetheme={forcetheme}
            />
          )}

          <div className={clsx(styles.keybindButtonText, textClassName)}>
            {children}
          </div>

          <Keybind
            keybinds={keybinds}
            dangerous={dangerous}
            onPress={onPress}
            disabled={disabled}
            loading={loading}
            loadingText={loadingText}
            forcetheme={forcetheme}
            magnetic={magnetic}
          />
        </button>
      </Magnetic>
    </motion.div>
  );
};

export default function Keybind({
  keybinds,
  className,
  parentClass,
  dangerous,
  onPress,
  disabled,
  forcetheme,
  loadingText,
  loading,
  magnetic = true,
}: {
  keybinds: T_Keybind[];
  className?: string;
  parentClass?: string;
  dangerous?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  forcetheme?: "light" | "dark";
  loadingText?: string;
  loading?: boolean;
  magnetic?: boolean;
}) {
  let styles = stylesDynamic;

  if (forcetheme === "light") {
    styles = stylesLight;
  } else if (forcetheme === "dark") {
    styles = stylesDark;
  }

  // alert(forcetheme);

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
      const keyeventId = `(${keybinds.join(",")}) ++ ${key}`;

      console.log(keyeventId, "added to animated keys");

      setAnimatedKeys((prev) => new Set(prev).add(key));
    };

    const removeFromAnimatedKeys = (key: string) => {
      const keyeventId = `(${keybinds.join(",")}) -- ${key}`;

      setTimeout(() => {
        if (
          onPress &&
          keybinds.every((key) => heldKeys.has(key)) &&
          keybinds[keybinds.length - 1] === key
        ) {
          if (heldKeys.size === keybinds.length) {
            if (!disabled && !loading) {
              console.log(keyeventId, "keybind activated");
              onPress();
            }
          } else {
            console.log(
              keyeventId,
              "unknown key pressed with keybind",
              Array.from(heldKeys).join(","),
              ". not activating!"
            );
          }
        }

        console.log(keyeventId, "removed from animated keys");

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

      if (e.metaKey) {
        return;
      }

      if (e.ctrlKey) {
        return;
      }

      if (e.repeat) {
        return;
      }

      const keyeventId = `(${keybinds.join(",")}) + ${key}`;

      console.log(keyeventId, "pressed");

      // check if key is in keybinds (keybinds type is T_Keybind[])
      // if (keybinds.includes(key as T_Keybind)) {
      // If it alr contain key then abort!

      setHeldKeys((prev) => new Set(prev).add(key));

      if (keybinds.includes(key as T_Keybind)) {
        addToAnimatedKeys(key);
      }
      // }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.metaKey) {
        return;
      }

      if (e.ctrlKey) {
        return;
      }

      if (e.repeat) {
        return;
      }

      const keyeventId = `(${keybinds.join(",")}) - ${key}`;

      console.log(keyeventId, "released");

      setHeldKeys((prev) => {
        const next = new Set(prev);

        next.delete(key);

        return next;
      });

      if (animatedKeys.has(key) && keybinds.includes(key as T_Keybind)) {
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
  }, [heldKeys, animatedKeys, disabled]);

  return (
    <Magnetic
      intensity={0.1}
      springOptions={{ bounce: 0.1 }}
      actionArea="global"
      className={styles.keybindContainerMagnet}
      range={disabled ? 0 : magnetic ? 75 : 0}
      data-theme={forcetheme}
    >
      {keybinds.map((keybind, index) => (
        <div
          className={clsx(
            styles.keybindContainer,
            loadingText && loading && styles.keybindContainer_loading,
            animatedKeys.has(keybind) && styles.keybindContainer_active,
            animatedKeys.size === keybinds.length &&
              Array.from(animatedKeys).filter((key) =>
                keybinds.includes(key as T_Keybind)
              ).length === keybinds.length &&
              styles.keybindContainer_activeall
          )}
          key={`keybind_${keybind}_${index}`}
        >
          {keybind === T_Keybind.shift && (
            <ArrowBigUp className={clsx(styles.keybindIcon, className)} />
          )}
          {keybind === T_Keybind.enter && (
            <CornerDownLeft className={clsx(styles.keybindIcon, className)} />
          )}
          {keybind === T_Keybind.escape && (
            // <CircleArrowOutUpLeft
            //   className={clsx(styles.keybindIcon, className)}
            // />
            <span className={clsx(styles.keybindText, className)}>esc</span>
          )}
          {keybind === T_Keybind.tab && (
            <span className={clsx(styles.keybindText, className)}>esc</span>
          )}
          {keybind === T_Keybind.backspace && (
            <Delete className={clsx(styles.keybindIcon, className)} />
          )}
          {letters.includes(keybind) && (
            <span className={clsx(styles.keybindText, className)}>
              {keybind.toString()}
            </span>
          )}
        </div>
      ))}
    </Magnetic>
  );
}

// export default function Keybind({
//   keybinds,
//   className,
//   parentClass,
//   dangerous,
//   onPress,
//   disabled,
//   forcetheme,
// }: {
//   keybinds: T_Keybind[];
//   className?: string;
//   parentClass?: string;
//   dangerous?: boolean;
//   onPress?: () => void;
//   disabled?: boolean;
//   forcetheme?: "light" | "dark";
// }) {
//   let styles = stylesDynamic;

//   if (forcetheme === "light") {
//     styles = stylesLight;
//   } else if (forcetheme === "dark") {
//     styles = stylesDark;
//   }

//   // alert(forcetheme);

//   // Set of currently held keys
//   const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
//   const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());

//   // useEffect(() => {
//   //   setTimeout(() => {
//   //     setAnimatedKeys(new Set(heldKeys));
//   //   }, 200);
//   // }, [heldKeys]);

//   useEffect(() => {
//     const addToAnimatedKeys = (key: string) => {
//       setAnimatedKeys((prev) => new Set(prev).add(key));
//     };

//     const removeFromAnimatedKeys = (key: string) => {
//       setTimeout(() => {
//         if (
//           onPress &&
//           keybinds.every((key) => heldKeys.has(key)) &&
//           keybinds[keybinds.length - 1] === key
//         ) {
//           // If heldKeys has a key that doesnt exist in keybind
//           if (heldKeys.size === keybinds.length) {
//             // alert(`keybind removed ${key}`);
//             if (!disabled) {
//               console.log("keybind pressed", keybinds.join(","));
//               onPress();
//             }
//           } else {
//             // alert("kys sybau");
//           }
//         }

//         setAnimatedKeys((prev) => {
//           const next = new Set(prev);
//           next.delete(key);
//           return next;
//         });
//       }, 200);
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       // e.preventDefault();
//       // e.stopPropagation();

//       if (disabled) return;

//       const key = e.key.toLowerCase();

//       console.log(key);

//       // check if key is in keybinds (keybinds type is T_Keybind[])
//       // if (keybinds.includes(key as T_Keybind)) {
//       // If it alr contain key then abort!

//       console.log("key added", key, keybinds.join(","));

//       setHeldKeys((prev) => new Set(prev).add(key));
//       addToAnimatedKeys(key);
//       // }
//     };

//     const handleKeyUp = (e: KeyboardEvent) => {
//       const key = e.key.toLowerCase();

//       if (heldKeys.has(key)) {
//         setHeldKeys((prev) => {
//           const next = new Set(prev);

//           next.delete(key);

//           return next;
//         });

//         removeFromAnimatedKeys(key);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [heldKeys, animatedKeys, disabled]);

//   return (
//     <Magnetic
//       intensity={0.1}
//       springOptions={{ bounce: 0.1 }}
//       actionArea="global"
//       className={styles.buttonKeybindMagnet}
//       range={disabled ? 0 : 75}
//       data-theme={forcetheme}
//     >
//       {keybinds.map((keybind, index) => (
//         <div
//           className={clsx(
//             styles.buttonKeybind,
//             parentClass,
//             animatedKeys.has(keybind) && styles.keybindContainer_active
//             // animatedKeys.has(keybind) &&
//             //   (dangerous
//             //     ? styles.keybindContainerD
//             //     : styles.buttonKeybind_active)
//           )}
//           key={`keybind_${keybind}_${index}`}
//         >
//           {keybind === T_Keybind.shift && (
//             <ArrowBigUp className={clsx(styles.buttonKeybindIcon, className)} />
//           )}
//           {keybind === T_Keybind.enter && (
//             <CornerDownLeft
//               className={clsx(styles.buttonKeybindIcon, className)}
//             />
//           )}
//           {keybind === T_Keybind.escape && (
//             <CircleArrowOutUpLeft
//               className={clsx(styles.buttonKeybindIcon, className)}
//             />
//           )}
//           {keybind === T_Keybind.backspace && (
//             <Delete className={clsx(styles.buttonKeybindIcon, className)} />
//           )}
//           {letters.includes(keybind) && (
//             <span className={clsx(styles.buttonKeybindText, className)}>
//               {keybind.toString()}
//             </span>
//           )}
//         </div>
//       ))}
//     </Magnetic>
//   );
// }
