"use client";

import { useCallback, useRef, useState } from "react";

import Image from "next/image";

import { useDropzone } from "react-dropzone";
import { Pencil, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import clsx from "clsx";
import toast from "react-hot-toast";

import { processFile } from "@/lib/utils";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";
import { Magnetic } from "@/components/ui/mp_magnetic";
import { Skeleton } from "@/components/ui/scn_skeleton";

import Spinner from "@/components/spinner";

import styles from "./event-banner.module.css";

import type { T_Event } from "@/gql/types";

import { Z_EventName } from "@/modules/parser";

const DragEditIcon = ({
  loading,
  isDragActive,
  isItemDragActive,
  id,
}: {
  loading: boolean;
  isDragActive: boolean;
  isItemDragActive: boolean;
  id: string;
}) => {
  return (
    <AnimatePresence mode="popLayout">
      {loading ? (
        <motion.div
          key={`${id}_loading`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Spinner id={`${id}spin`} loading={loading} size={32} />
        </motion.div>
      ) : isDragActive ? (
        <motion.div
          key={`${id}_upload`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload
            className={clsx(
              styles.eventIconEditIcon,
              isItemDragActive && styles.eventIconEditIconDragging,
            )}
          />
        </motion.div>
      ) : (
        <motion.div
          key={`${id}_pencil`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <Pencil className={styles.eventIconEditIcon} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function EventBanner({
  event,
  edit,
  setEdited,
  manageEventDisabled,
  setSaveDisabled,
  isParentDragActive,
  MAX_SIZE,
}: {
  event: T_Event;
  edit?: boolean;
  setEdited?: (edited: boolean) => void;
  manageEventDisabled?: boolean;
  setSaveDisabled?: (edited: boolean) => void;
  isParentDragActive?: boolean;
  MAX_SIZE?: number;
}) {
  const [isIconLoaded, setIsIconLoaded] = useState<boolean>(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState<boolean>(false);

  const [isIconHidden, setIsIconHidden] = useState<boolean>(false);
  const [isBannerHidden, setIsBannerHidden] = useState<boolean>(false);

  const [iconLoading, setIconLoading] = useState<boolean>(false);
  const [bannerLoading, setBannerLoading] = useState<boolean>(false);

  const eventTitleInputRef = useRef<HTMLInputElement | null>(null);

  const [iconFile, setIconFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [bannerFile, setBannerFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);

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

  const onIconDrop = useCallback(async (acceptedFiles: File[]) => {
    // alert("icon drop");
    if (iconLoading) {
      return;
    }

    console.log("icon drop");

    if (acceptedFiles.length > 1) {
      toast.error("Please select just one file", {
        id: "selectJustOneFileIcon",
      });

      return;
    }

    setIconLoading(true);

    const { success, data } = await processFile(acceptedFiles[0]);

    if (!success) {
      setIconLoading(false);

      toast.error("Failed to process file", {
        id: "processFileIcon",
      });

      return;
    }

    const { file: processedFile, preview: previewUrl } = data!;

    setIsIconHidden(true);
    setIconLoading(false);

    setTimeout(() => {
      setEdited?.(true);

      setIconFile({
        file: processedFile,
        preview: previewUrl,
      });

      // setIconLoading(false);

      setTimeout(() => {
        setIsIconHidden(false);
      }, 250);
    }, 250);
  }, []);

  const onBannerDrop = useCallback(async (acceptedFiles: File[]) => {
    if (bannerLoading) {
      return;
    }

    console.log("banner drop");

    if (acceptedFiles.length > 1) {
      toast.error("Please select just one file", {
        id: "selectJustOneFileBanner",
      });

      return;
    }

    setBannerLoading(true);

    const { success, data } = await processFile(acceptedFiles[0]);

    if (!success) {
      setBannerLoading(false);

      toast.error("Failed to process file", {
        id: "processFileBanner",
      });

      return;
    }

    const { file: processedFile, preview: previewUrl } = data!;

    setIsBannerHidden(true);
    setBannerLoading(false);

    setTimeout(() => {
      setEdited?.(true);

      setBannerFile({
        file: processedFile,
        preview: previewUrl,
      });

      // setBannerLoading(false);

      setIsBannerHidden(false);
    }, 250);
  }, []);

  const {
    getRootProps: getIconRootProps,
    getInputProps: getIconInputProps,
    isDragActive: isIconDragActive,
  } = useDropzone({
    onDrop: onIconDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_SIZE,
  });

  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
    isDragActive: isBannerDragActive,
  } = useDropzone({
    onDrop: onBannerDrop,
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_SIZE,
  });

  return (
    <motion.div
      className={styles.eventBannerContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence>
        {!isBannerLoaded && (
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
        animate={{ opacity: isBannerLoaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isBannerHidden ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={bannerFile?.preview || event.banner}
            // src={`https://picsum.photos/seed/eventBanner-${event.eventId}/1400/1400`}
            alt={`Event ${event.eventId}`}
            // fill
            width={1400}
            height={1400}
            onLoad={() => {
              // console.log("loaded");
              setIsBannerLoaded(true);
            }}
            decoding="async"
            loading="lazy"
            className={styles.eventImage}
          />
        </motion.div>

        {edit && !manageEventDisabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                (isParentDragActive || bannerLoading) && !isIconDragActive
                  ? 1
                  : 0,
            }}
            whileHover={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            onClick={() => {
              if (bannerLoading) {
                return;
              }

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
              <DragEditIcon
                id="bannerdragediticon"
                loading={bannerLoading}
                isDragActive={isParentDragActive || false}
                isItemDragActive={isBannerDragActive}
              />
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
            // className={styles.eventIcon}
            initial={{ opacity: 0 }}
            animate={{ opacity: isIconLoaded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div {...getIconRootProps()} className={styles.eventIcon}>
              <input {...getIconInputProps()} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isIconHidden ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={iconFile?.preview || event.icon}
                  // src={`https://picsum.photos/seed/eventIcon-${event.eventId}/128/128`}
                  alt={`Event ${event.eventId}`}
                  className={styles.eventIconImage}
                  fill
                  // width={128}
                  // height={128}
                  decoding="async"
                  loading="lazy"
                  onLoad={() => {
                    // console.log("loaded");
                    setIsIconLoaded(true);
                  }}
                />
              </motion.div>

              {edit && !manageEventDisabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity:
                      (isParentDragActive || iconLoading) && !isBannerDragActive
                        ? 1
                        : 0,
                  }}
                  whileHover={{ opacity: iconLoading ? 0 : 1 }}
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
                    <DragEditIcon
                      id="icondragediticon"
                      loading={iconLoading}
                      isDragActive={isParentDragActive || false}
                      isItemDragActive={isIconDragActive}
                    />
                  </Magnetic>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <div
          className={clsx(
            styles.eventTitleContainer,
            edit && isParentDragActive && styles.eventTitleContainerDragging,
          )}
        >
          {edit ? (
            <motion.input
              type="text"
              className={clsx(
                styles.eventTitle,
                styles.eventTitleInput,
                !issues.name.success && styles.invalid,
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
                edit && styles.eventDescriptionEdit,
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

      <div
        {...getBannerRootProps()}
        className={styles.eventBannerImageContainer}
      >
        <input {...getBannerInputProps()} />
      </div>
    </motion.div>
  );
}
