import { useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import { T_Event, T_User } from "@/gql/types";

import publishEvent from "@/actions/event/publishEvent";

import EventBanner from "@/components/event-banner";

import { KeybindButton, T_Keybind } from "@/components/keybind";

import styles from "./manage-event.module.css";
import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";

import Toaster from "@/components/toaster";
import Confirmation from "../confirmation";
import { toast } from "react-hot-toast";

export default function ManageEvent({
  event,
  setManageEventVisible,
}: {
  event: T_Event;
  setManageEventVisible: (visible: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [manageEventDisabled, setManageEventDisabled] = useState(false);

  const [publishConfirmationOpen, setPublishConfirmationOpen] = useState(false);
  const [publishConfirmationLoading, setPublishConfirmationLoading] =
    useState(false);

  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);

  const [footerItemLoading, setFooterItemLoading] = useState<string | null>(
    null
  );

  const [edited, setEdited] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);

  const [onDiscard, setOnDiscard] = useState<() => void>(() => {});

  // alert(event.name);
  return (
    <motion.div
      className={styles.manageEvent}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        opacity: {
          duration: 0.2,
        },
      }}
      onClick={() => {
        setManageEventVisible(false);
      }}
    >
      <motion.div
        className={styles.manageEventContainer}
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
                forcetheme="dark"
                onConfirm={async () => {
                  const publishResult = await publishEvent(
                    "captchaDemo",
                    event.eventId
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

                  onDiscard();
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

                    setOnDiscard(() => {
                      setManageEventVisible(false);
                    });
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

                      alert("todo");

                      // await saveEvent(
                      //   "captchaDemo",
                      //   event.eventId,
                      //   event.name,
                      //   event.description
                      // );
                    }}
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

                        setOnDiscard(() => {
                          router.push(`/app/event/${event.eventId}`);
                        });
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
            setSaveDisabled={setSaveDisabled}
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
      </motion.div>
    </motion.div>
  );
}
