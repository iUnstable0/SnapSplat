"use client";

import { useCallback, useRef, useState } from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "motion/react";

import styles from "./event-banner.module.css";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

import type { T_Event } from "@/gql/types";
import { Skeleton } from "@/components/ui/scn_skeleton";
import clsx from "clsx";
import { PencilIcon } from "lucide-react";
import { Magnetic } from "./ui/mp_magnetic";

import { Z_EventName } from "@/modules/parser";

import toast from "react-hot-toast";

export default function EventBanner({
  event,
  edit,
  setEdited,
  manageEventDisabled,
  setSaveDisabled,
}: {
  event: T_Event;
  edit?: boolean;
  setEdited?: (edited: boolean) => void;
  manageEventDisabled?: boolean;
  setSaveDisabled?: (edited: boolean) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIconLoaded, setIsIconLoaded] = useState(false);

  const eventTitleInputRef = useRef<HTMLInputElement>(null);

  const [issues, setIssues] = useState<{
    name: {
      success: boolean;
      reasons: string[];
    };
    description: {
      success: boolean;
      reasons: string[];
    };
  }>({
    name: { success: true, reasons: [] },
    description: { success: true, reasons: [] },
  });

  const checkName = useCallback(() => {
    const eventName = eventTitleInputRef.current?.value;

    const parsedName = Z_EventName.safeParse(eventTitleInputRef.current!.value);

    if (!parsedName.success) {
      let reasons = [];

      if (!eventName) {
        reasons = ["Event name is required"];
      } else {
        reasons = parsedName.error.issues.map((issue) => issue.message);
      }

      setIssues((prev) => ({
        ...prev,
        name: {
          success: false,
          reasons: reasons,
        },
      }));

      return {
        success: false,
        data: parsedName.data,
      };
    }

    setIssues((prev) => ({
      ...prev,
      name: {
        success: true,
        reasons: [],
      },
    }));

    return {
      success: true,
      data: parsedName.data,
    };
  }, []);

  const checkEdited = useCallback(() => {
    const nameResult = checkName();

    if (!nameResult.success) {
      // setEdited?.(false);
      setSaveDisabled?.(true);
      return;
    }

    setSaveDisabled?.(false);

    if (nameResult.data !== event.name) {
      setEdited?.(true);
    } else {
      setEdited?.(false);
    }
  }, [checkName, event.name, setEdited]);

  const checkFields = useCallback(() => {
    if (eventTitleInputRef.current?.value === "") {
      eventTitleInputRef.current!.value = event.name;
      return;
    }
  }, [event.name]);

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
          src={event.banner}
          // src={`https://picsum.photos/seed/eventBanner-${event.eventId}/1400/1400`}
          alt={`Event ${event.eventId}`}
          onLoad={() => {
            // console.log("loaded");
            setIsLoaded(true);
          }}
          className={styles.eventImage}
        />
        {edit && !manageEventDisabled && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            onClick={() => {
              toast.error("Changing event banner is not implemented yet");
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
              src={event.icon}
              // src={`https://picsum.photos/seed/eventIcon-${event.eventId}/128/128`}
              alt={`Event ${event.eventId}`}
              width={128}
              height={128}
              onLoad={() => {
                // console.log("loaded");
                setIsIconLoaded(true);
              }}
              className={styles.eventIconImage}
            />
            {edit && !manageEventDisabled && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  toast.error("Changing event icon is not implemented yet");
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
            <motion.input
              type="text"
              className={clsx(
                styles.eventTitle,
                styles.eventTitleInput,
                !issues.name.success && styles.invalid
              )}
              placeholder={"Event Name"}
              onBlur={() => {
                checkFields();
                checkEdited();
              }}
              onChange={(e) => {
                checkEdited();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              disabled={manageEventDisabled}
              ref={eventTitleInputRef}
              defaultValue={event.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <h1 className={styles.eventTitle}>{event.name}</h1>
          )}
          <AnimatePresence mode="popLayout">
            {!issues.name.success &&
              issues.name.reasons.map((reason, index) => (
                <motion.div
                  key={`eventNameIssues_${index}`}
                  className={styles.invalidText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                  }}
                >
                  {reason}
                  {/* <TextMorph>{reason}</TextMorph> */}
                </motion.div>
              ))}
          </AnimatePresence>

          {!edit && !manageEventDisabled && event.description && (
            <p
              className={clsx(
                styles.eventDescription,
                edit && styles.eventDescriptionEdit
              )}
              onClick={() => {
                if (edit) {
                  toast.error("Editing description is not implemented yet");
                }
              }}
            >
              {event.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
