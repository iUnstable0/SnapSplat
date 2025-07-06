"use client";

import { useRef, useState } from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "motion/react";

import styles from "./event-banner.module.css";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

import type { T_Event } from "@/gql/types";
import { Skeleton } from "@/components/ui/scn_skeleton";
import clsx from "clsx";
import { PencilIcon } from "lucide-react";
import { Magnetic } from "./ui/mp_magnetic";

import { Toast } from "react-hot-toast";

export default function EventBanner({
  data,
  edit,
}: {
  data: { event: T_Event };
  edit?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIconLoaded, setIsIconLoaded] = useState(false);

  const eventTitleInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className={styles.eventBannerContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Skeleton className={styles.eventBannerImageSkeleton} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.eventBannerImageContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={`https://picsum.photos/seed/eventBanner-${data.event.eventId}/1400/1400`}
          alt={`Event ${data.event.eventId}`}
          onLoad={() => {
            // console.log("loaded");
            setIsLoaded(true);
          }}
          className={styles.eventImage}
        />
      </motion.div>
      <ProgressiveBlur className={styles.eventBannerBlur} blurIntensity={2} />
      <div className={styles.eventDetails}>
        <div className={styles.eventIconContainer}>
          <AnimatePresence>
            {!isIconLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Skeleton className={styles.eventIconSkeleton} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className={styles.eventIcon}
            initial={{ opacity: 0 }}
            animate={{ opacity: isIconLoaded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={`https://picsum.photos/seed/eventIcon-${data.event.eventId}/128/128`}
              alt={`Event ${data.event.eventId}`}
              width={128}
              height={128}
              onLoad={() => {
                // console.log("loaded");
                setIsIconLoaded(true);
              }}
              className={styles.eventIconImage}
            />
            {edit && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  alert("clicked");
                }}
                className={styles.eventIconEdit}
              >
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={styles.eventIconEditIconMagnet}
                  range={175}
                >
                  <PencilIcon className={styles.eventIconEditIcon} />
                </Magnetic>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className={styles.eventTitleContainer}>
          {edit ? (
            <input
              type="text"
              className={clsx(styles.eventTitle, styles.eventTitleInput)}
              placeholder={"Event Name"}
              onBlur={() => {
                if (eventTitleInputRef.current?.value === "") {
                  eventTitleInputRef.current!.value = data.event.name;
                }
              }}
              onChange={(e) => {
                console.log(e.target.value);
              }}
              ref={eventTitleInputRef}
              defaultValue={data.event.name}
            />
          ) : (
            <h1 className={styles.eventTitle}>{data.event.name}</h1>
          )}

          {data.event.description && (
            <p className={styles.eventDescription}>{data.event.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
