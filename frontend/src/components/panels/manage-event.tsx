import { useCallback, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import { useDropzone } from "react-dropzone";

import toast from "react-hot-toast";

import publishEvent from "@/actions/event/publishEvent";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import Toaster from "@/components/toaster";
import EventBanner from "@/components/event-banner";
import Confirmation from "@/components/confirmation";

import styles from "./manage-event.module.css";

import { T_Event } from "@/gql/types";

const MAX_SIZE = 1024 * 1024 * 10; // 10MB

export default function ManageEvent({
  event,
  setManageEventVisible,
}: {
  event: T_Event;
  setManageEventVisible: (visible: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [manageEventDisabled, setManageEventDisabled] =
    useState<boolean>(false);

  const [publishConfirmationOpen, setPublishConfirmationOpen] =
    useState<boolean>(false);
  const [publishConfirmationLoading, setPublishConfirmationLoading] =
    useState<boolean>(false);

  const [discardConfirmationOpen, setDiscardConfirmationOpen] =
    useState<boolean>(false);

  const [footerItemLoading, setFooterItemLoading] = useState<string | null>(
    null,
  );

  const [edited, setEdited] = useState<boolean>(false);
  const [saveDisabled, setSaveDisabled] = useState<boolean>(false);

  const [mode, setMode] = useState<"close" | "openevent" | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_SIZE,
  });

  // alert(event.name);
  return (
    <motion.div
      className={styles.manageEvent}
      initial={{ opacity: 0, transform: "scale(0.98)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      exit={{ opacity: 0, transform: "scale(0.98)" }}
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 20,
        opacity: {
          duration: 0.2,
          ease: "easeInOut",
        },
      }}
      onClick={() => {
        setManageEventVisible(false);
      }}
    >
      <div
        className={styles.manageEventContainer}
        {...getRootProps()}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.manageEventContent}>
          <AnimatePresence>
            {/* {publishConfirmationOpen && (
              <motion.div
                className={styles.blurOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                key={"publish-confirmation-blur-overlay"}
              />
            )} */}

            {publishConfirmationOpen && (
              <Confirmation
                dim={true}
                // key={"publish-confirmation"}
                title="Are you sure?"
                description="You can't undo this action."
                confirmText="Publish"
                confirmLoadingText="Publishing..."
                // confirmIcon={<Trash2 />}
                // cancelIcon={<X />}
                forcetheme={"dark"}
                onConfirm={async () => {
                  const publishResult = await publishEvent(
                    "captchaDemo",
                    event.eventId,
                  );
                  setPublishConfirmationOpen(false);
                  setTimeout(() => {
                    setFooterItemLoading(null);
                    setManageEventDisabled(false);
                    if (publishResult.success) {
                      setManageEventVisible(false);
                      router.push(`/app/me`);
                    } else {
                      toast.error(publishResult.message);
                    }
                  }, 1000);
                }}
                onCancel={() => {
                  setPublishConfirmationOpen(false);

                  setTimeout(() => {
                    setFooterItemLoading(null);

                    setManageEventDisabled(false);
                  }, 1000);
                }}
                confirmationLoading={publishConfirmationLoading}
                setConfirmationLoading={setPublishConfirmationLoading}
                dangerous={false}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {discardConfirmationOpen && (
              <Confirmation
                dim={true}
                title="Unsaved changes"
                description="You have unsaved changes. Are you sure you want to discard them?"
                confirmText="Discard"
                cancelText="Keep editing"
                forcetheme="dark"
                onConfirm={() => {
                  // setCloseConfirmationOpen(false);

                  if (mode === "close") {
                    setManageEventVisible(false);
                  } else if (mode === "openevent") {
                    router.push(`/app/event/${event.eventId}`);
                  }
                  // setManageEventDisabled(false);
                }}
                onCancel={() => {
                  setDiscardConfirmationOpen(false);
                  setManageEventDisabled(false);
                }}
                // confirmationLoading={closeConfirmationLoading}
                // setConfirmationLoading={setCloseConfirmationLoading}
                dangerous={true}
              />
            )}
          </AnimatePresence>

          <Toaster />

          <ProgressiveBlur
            direction={"bottom"}
            className={styles.bottomBlur}
            blurIntensity={1}
          />

          <div className={styles.manageEventActionButtons}>
            <div className={styles.manageEventActionButtonsLeft}>
              <KeybindButton
                keybinds={[T_Keybind.escape]}
                onPress={() => {
                  if (edited) {
                    setManageEventDisabled(true);

                    // setFooterItemLoading("close");

                    setDiscardConfirmationOpen(true);

                    setMode("close");
                  } else {
                    setManageEventVisible(false);
                  }
                }}
                disabled={manageEventDisabled}
                // loadingText={edited ? "Closing..." : undefined}
                // loading={footerItemLoading === "close"}
              >
                Close
              </KeybindButton>

              <AnimatePresence>
                {edited && (
                  <KeybindButton
                    keybinds={[T_Keybind.shift, T_Keybind.s]}
                    onPress={() => {
                      setManageEventDisabled(true);
                      setFooterItemLoading("save");

                      // alert("todo");

                      // await saveEvent(
                      //   "captchaDemo",
                      //   event.eventId,
                      //   event.name,
                      //   event.description
                      // );
                    }}
                    preload={false}
                    disabled={manageEventDisabled || saveDisabled}
                    loadingText="Saving..."
                    loading={footerItemLoading === "save"}
                  >
                    Save Changes
                  </KeybindButton>
                )}
              </AnimatePresence>
            </div>
            <div className={styles.manageEventActionButtonsRight}>
              {event.isDraft && (
                <KeybindButton
                  keybinds={[T_Keybind.shift, T_Keybind.enter]}
                  onPress={() => {
                    setManageEventDisabled(true);
                    setFooterItemLoading("publish");

                    setPublishConfirmationOpen(true);
                  }}
                  disabled={manageEventDisabled}
                  loadingText="Publishing..."
                  loading={footerItemLoading === "publish"}
                >
                  Publish Event
                </KeybindButton>
              )}

              {event.isArchived && (
                <KeybindButton
                  keybinds={[T_Keybind.shift, T_Keybind.enter]}
                  onPress={() => {
                    setManageEventDisabled(true);
                    setFooterItemLoading("unarchive");

                    setPublishConfirmationOpen(true);
                  }}
                  disabled={manageEventDisabled}
                  loadingText="Unarchiving..."
                  loading={footerItemLoading === "unarchive"}
                >
                  Unarchive Event
                </KeybindButton>
              )}

              {!event.isDraft &&
                !event.isArchived &&
                !pathname.startsWith("/app/event") && (
                  <KeybindButton
                    keybinds={[T_Keybind.enter]}
                    onPress={() => {
                      if (edited) {
                        setManageEventDisabled(true);

                        // setFooterItemLoading("close");

                        setDiscardConfirmationOpen(true);

                        setMode("openevent");
                      } else {
                        setManageEventDisabled(true);
                        setFooterItemLoading("open");

                        router.push(`/app/event/${event.eventId}`);
                      }
                    }}
                    disabled={manageEventDisabled}
                    loadingText="Opening..."
                    loading={footerItemLoading === "open"}
                  >
                    Open Event
                  </KeybindButton>
                )}
            </div>
          </div>

          <EventBanner
            event={event}
            edit={true}
            setEdited={setEdited}
            manageEventDisabled={manageEventDisabled}
            setSaveDisabled={setSaveDisabled}
            isParentDragActive={isDragActive}
            MAX_SIZE={MAX_SIZE}
          />

          <ProgressiveBlur
            direction={"top"}
            className={styles.topBlur}
            blurIntensity={1}
          />

          <div className={styles.optionsContainer}>
            <div className={styles.manageEventContentHeader}>
              <div className={styles.manageEventContentHeaderTitle}>
                {event.invites?.length} invite codes:
                {event.invites?.map((invite) => (
                  <div key={invite.inviteId}>
                    Invite code: {invite.inviteCode}
                  </div>
                ))}
                {event.memberships?.length || 0} members:
                {event.memberships?.map((membership) => (
                  <div key={membership.memberId}>
                    Membership: {membership.displayNameAlt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
