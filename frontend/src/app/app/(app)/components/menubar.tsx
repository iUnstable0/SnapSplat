"use client";

import { useState, useEffect } from "react";

import { AnimatePresence, motion } from "motion/react";

import Image from "next/image";

import styles from "./menubar.module.css";

import type { T_User } from "@/gql/types";

export default function MenuBar({ user }: { user: T_User }) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (overlayOpen) {
      setShowForm(false);
    } else {
      setTimeout(() => {
        setShowForm(true);
      }, 50);
    }
  }, [overlayOpen]);

  return (
    <>
      <div className={styles.menuBar}>
        <div className={styles.menuBarContent}>
          <div className={styles.menuBarItem}>
            <div
              className={styles.createEvent}
              onClick={() => setOverlayOpen(!overlayOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={styles.createEventIcon}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 5l0 14" />
                <path d="M5 12l14 0" />
              </svg>
            </div>
            <div className={styles.profile}>
              <Image
                src={user.avatar}
                alt="avatar"
                width={42}
                height={42}
                className={styles.profileAvatar}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.blurOverlay}
            initial={{
              clipPath: `circle(0px at ${viewportDimensions.width}px 0px)`,
              opacity: 0,
            }}
            animate={{
              clipPath: `circle(${Math.hypot(viewportDimensions.width, viewportDimensions.height)}px at ${viewportDimensions.width}px 0px)`,
              opacity: 1,
            }}
            exit={{
              clipPath: `circle(0px at ${viewportDimensions.width}px 0px)`,
              opacity: 0,
            }}
            onClick={() => setOverlayOpen(false)}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 10,
              mass: 1,
              opacity: { duration: 0.2 },
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.overlayContent}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              ...(showForm && {
                type: "spring",
                stiffness: 120,
                damping: 20,
              }),
              ...(!showForm && {
                duration: 0.2,
                ease: "easeInOut",
              }),
              delay: showForm ? 0.2 : 0,
            }}
          >
            <div className={styles.createEventForm}>
              <div className={styles.createEventFormHeader}>
                <input
                  className={styles.createEventFormEventName}
                  // text limit
                  maxLength={50}
                  type="text"
                  placeholder="Event Name"
                />
              </div>
              <div className={styles.createEventFormContent}>
                <textarea
                  className={styles.createEventFormDescription}
                  // max 1000
                  maxLength={500}
                  style={{
                    height: "100%",
                  }}
                  placeholder="Description"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* <AnimatePresence>
        {createFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
              // opacity: {
              //   duration: 0.2,
              // },
            }}
            className={styles.createForm}
            onClick={() => setCreateFormOpen(false)}
          >
            <div className={styles.createFormContent}>
              <div className={styles.createFormHeader}>
                <h1>Create Event</h1>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
}
