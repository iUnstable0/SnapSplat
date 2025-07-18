"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, Transition, Variants } from "motion/react";
import { useMemo, useId } from "react";

export type TextMorphProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  variants?: Variants;
  transition?: Transition;
};

export function TextMorph({
  children,
  as: Component = "p",
  className,
  style,
  variants,
  transition,
}: TextMorphProps) {
  const uniqueId = useId();

  const characters = useMemo(() => {
    const chars = children.split("");

    // Pre-calculate total counts for each character to enable right-to-left counting
    const totalCharCounts = chars.reduce(
      (acc, char) => {
        const lower = char.toLowerCase();
        acc[lower] = (acc[lower] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const leftCharCounts: Record<string, number> = {};
    const rightCharCounts = { ...totalCharCounts };

    return chars.map((char) => {
      const lowerChar = char.toLowerCase();

      // Left-to-right count
      const leftCount = (leftCharCounts[lowerChar] =
        (leftCharCounts[lowerChar] || 0) + 1);

      // Right-to-left count
      const rightCount = rightCharCounts[lowerChar];
      if (rightCharCounts[lowerChar] !== undefined) {
        rightCharCounts[lowerChar]--;
      }

      return {
        id: `${uniqueId}-${lowerChar}-${leftCount}-${rightCount}`,
        label: char === " " ? "\u00A0" : char,
      };
    });
  }, [children, uniqueId]);

  const defaultVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const defaultTransition: Transition = {
    type: "spring",
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  };

  return (
    <Component className={cn(className)} aria-label={children} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {characters.map((character) => (
          <motion.span
            key={character.id}
            layoutId={character.id}
            className="inline-block"
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants || defaultVariants}
            transition={transition || defaultTransition}
          >
            {character.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </Component>
  );
}
