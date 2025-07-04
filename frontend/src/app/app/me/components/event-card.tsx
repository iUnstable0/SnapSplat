"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { FolderOpen, LayoutDashboard, Trash2 } from "lucide-react";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";
import Keybind, { T_Keybind } from "@/components/keybind";

import { useBlurContext } from "./blur-context";

import styles from "./event-card.module.css";

import type { T_Event } from "@/gql/types";
import { Magnetic } from "@/components/ui/mp_magnetic";

export default function EventCard({ event }: { event: T_Event }) {
  const router = useRouter();

  const { isBlurred } = useBlurContext();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (overlayOpen) {
      setShowMenu(false);
    } else {
      setTimeout(() => {
        setShowMenu(true);
      }, 50);
    }
  }, [overlayOpen]);

  const menuItems = [
    {
      label: "Open",
      dangerous: false,
      icon: <FolderOpen />,
      onClick: () => {
        router.push(`/app/event/${event.eventId}`);
      },
      keybinds: [T_Keybind.enter],
    },
    {
      label: "Delete",
      dangerous: true,
      icon: <Trash2 />,
      onClick: () => {
        alert("delete");
      },
      keybinds: [T_Keybind.shift, T_Keybind.backspace],
    },
  ];

  return (
    <motion.div
      className={styles.eventCard}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: isBlurred ? 0.3 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
      }}
      onHoverStart={() => {
        console.log("hover start");
        setOverlayOpen(true);
      }}
      onHoverEnd={() => {
        console.log("hover end");
        setOverlayOpen(false);
      }}
      whileHover={{ scale: 1.02 }}
      layout="position"
      layoutId={event.eventId}
    >
      <Image
        src={`https://picsum.photos/seed/${encodeURIComponent(
          event.name
        )}-${event.eventId}/420/300`}
        alt={event.name}
        width={420}
        height={300}
        objectFit="cover"
        className={styles.eventImage}
      />

      <div
        className={styles.eventCardBlurOverlay}
        style={{
          opacity: overlayOpen ? 1 : 0,
        }}
      />

      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.eventCardMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={`ecmitem_${item.label}_index`}
                onClick={item.onClick}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  delay: showMenu ? index * 0.1 + 0.2 : 0,
                }}
                className={styles.eventCardMenuButton}
              >
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.overlayMagnet,
                    item.dangerous && styles.overlayMagnetDangerous
                  )}
                  range={130}
                >
                  <div className={styles.overlayButtonIcon}>{item.icon}</div>
                  <span className={styles.overlayButtonText}>{item.label}</span>
                  <Keybind
                    keybinds={item.keybinds}
                    className={styles.createEventFormKeybind}
                    onPress={() => {
                      item.onClick();
                    }}
                    disabled={false}
                    dangerous={item.dangerous}
                    forcetheme={"dark"}
                  />
                </Magnetic>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ProgressiveBlur className={styles.eventTitleBlur} blurIntensity={2} />
      <div className={styles.eventDetails}>
        <h1 className={styles.eventTitle}>{event.name}</h1>
        <p className={styles.eventDescription}>{event.description.trim()}</p>
      </div>
    </motion.div>
  );
}
