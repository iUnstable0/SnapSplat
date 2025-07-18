"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { FolderOpen, LogOut, Trash2, Wrench, X } from "lucide-react";

import deleteEvent from "@/actions/event/deleteEvent";
import leaveEvent from "@/actions/event/leaveEvent";

import { ProgressiveBlur } from "@/components/ui/mp_progressive-blur";
import { KeybindButton, T_Keybind } from "@/components/keybind";
import Confirmation from "@/components/confirmation";

import { useBlurContext } from "@/components/blur-context";

import styles from "./event-card.module.css";

import type { T_Event, T_EventMembership } from "@/gql/types";

import lib_role from "@/modules/role";
import { Skeleton } from "@/components/ui/scn_skeleton";

type T_EventData = T_Event & {
  myMembership: T_EventMembership;
};

export default function EventCard({
  event,
  manageEvent,
  setManageEvent,
  setManageEventVisible,
}: {
  event: T_EventData & {
    myMembership: T_EventMembership;
  };
  manageEvent: T_EventData | null;
  setManageEvent: (event: T_EventData) => void;
  setManageEventVisible: (visible: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { isBlurred, setIsBlurred } = useBlurContext();

  const [isLoaded, setIsLoaded] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayDisabled, setOverlayDisabled] = useState(false);
  // const [overlayLoading, setOverlayLoading] = useState(false);
  const [menuItemsLoading, setMenuItemsLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const [showMenu, setShowMenu] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationLoading, setDeleteConfirmationLoading] =
    useState(false);

  const [leaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false);
  const [leaveConfirmationLoading, setLeaveConfirmationLoading] =
    useState(false);

  useEffect(() => {
    if (overlayOpen) {
      setShowMenu(false);
    } else {
      setTimeout(() => {
        setShowMenu(true);
      }, 50);
    }
  }, [overlayOpen]);

  // const rootPath = pathname.split("/").slice(0, 4).join("/");

  const menuItems = [
    {
      label: "Open",
      dangerous: false,
      icon: <FolderOpen />,
      onClick: () => {
        setOverlayDisabled(true);
        setMenuItemsLoading((prev) => ({
          ...prev,
          open: true,
        }));

        router.push(
          `/app/event/${event.eventId}/home?back=${encodeURIComponent(pathname)}`
        );
      },
      loadingId: "open",
      loadingText: "Opening...",
      keybinds: [T_Keybind.enter],
    },

    // COHOST & HOST
    ...(lib_role.event_hasRole(event.myMembership, "COHOST")
      ? [
          {
            label: "Manage",
            dangerous: false,
            icon: <Wrench />,
            onClick: () => {
              // if (overlayDisabled) return;
              // router.push(
              //   `/app/event/${event.eventId}/manage?back=${encodeURIComponent(
              //     pathname
              //   )}`
              // );
              // alert("manage event");
              setIsBlurred(true);
              setManageEvent(event);
              setManageEventVisible(true);
            },
            keybinds: [T_Keybind.shift, T_Keybind.m],
          },
        ]
      : []),

    // NOT HOST
    ...(!lib_role.event_hasRole(event.myMembership, "HOST")
      ? [
          {
            label: "Leave",
            dangerous: true,
            icon: <LogOut />,
            onClick: () => {
              setOverlayDisabled(true);
              setMenuItemsLoading((prev) => ({
                ...prev,
                leave: true,
              }));

              setLeaveConfirmationOpen(true);
            },
            loadingId: "leave",
            loadingText: "Leaving...",
            keybinds: [T_Keybind.shift, T_Keybind.backspace],
          },
        ]
      : []),

    // HOST
    ...(lib_role.event_hasRole(event.myMembership, "HOST") && event.isDraft
      ? [
          {
            label: "Delete",
            dangerous: true,
            icon: <Trash2 />,
            onClick: async () => {
              setOverlayDisabled(true);
              setMenuItemsLoading((prev) => ({
                ...prev,
                delete: true,
              }));

              setDeleteConfirmationOpen(true);
            },
            loadingId: "delete",
            loadingText: "Deleting...",
            keybinds: [T_Keybind.shift, T_Keybind.backspace],
          },
        ]
      : []),
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
        // setManageEvent(event);
        setOverlayOpen(true);
      }}
      onHoverEnd={() => {
        // setManageEvent(null);
        if (deleteConfirmationOpen || leaveConfirmationOpen) {
          if (!deleteConfirmationLoading || !leaveConfirmationLoading) {
            setOverlayOpen(false);
            setDeleteConfirmationOpen(false);
            setLeaveConfirmationOpen(false);

            // setOverlayLoading(false);

            setMenuItemsLoading({});

            setOverlayDisabled(false);
          }

          return;
        }

        setOverlayOpen(false);
      }}
      onClick={() => {
        // setManageEvent(event);
        setOverlayOpen(true);
      }}
      whileHover={{ scale: 1.02 }}
      layout="position"
      layoutId={event.eventId}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Skeleton className={styles.eventImageSkeleton} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmationOpen && (
          <Confirmation
            title="Delete Event"
            description="Are you sure you want to delete this event?"
            confirmText="Delete"
            confirmLoadingText="Deleting..."
            // confirmIcon={<Trash2 />}
            // cancelIcon={<X />}
            forcetheme="dark"
            confirmKeybinds={[T_Keybind.shift, T_Keybind.enter]}
            onConfirm={async () => {
              await deleteEvent("captchaDemo", event.eventId);

              setDeleteConfirmationOpen(false);

              setTimeout(() => {
                setMenuItemsLoading((prev) => ({
                  ...prev,
                  delete: false,
                }));

                setOverlayDisabled(false);
                setOverlayOpen(false);

                router.refresh();
              }, 1000);
            }}
            onCancel={() => {
              setDeleteConfirmationOpen(false);

              setTimeout(() => {
                // setOverlayLoading(false);
                setMenuItemsLoading((prev) => ({
                  ...prev,
                  delete: false,
                }));

                setOverlayDisabled(false);
              }, 1000);
            }}
            confirmationLoading={deleteConfirmationLoading}
            setConfirmationLoading={setDeleteConfirmationLoading}
            dangerous={true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {leaveConfirmationOpen && (
          <Confirmation
            title="Leave Event"
            description="Are you sure you want to leave this event? Photos you have uploaded will still be available."
            confirmText="Leave"
            confirmLoadingText="Leaving..."
            forcetheme="dark"
            confirmKeybinds={[T_Keybind.shift, T_Keybind.enter]}
            onConfirm={async () => {
              await leaveEvent("captchaDemo", event.eventId);

              setLeaveConfirmationOpen(false);

              setTimeout(() => {
                setMenuItemsLoading((prev) => ({
                  ...prev,
                  leave: false,
                }));

                setOverlayDisabled(false);
                setOverlayOpen(false);

                router.refresh();
              }, 1000);
            }}
            onCancel={() => {
              setLeaveConfirmationOpen(false);

              setTimeout(() => {
                setMenuItemsLoading((prev) => ({
                  ...prev,
                  leave: false,
                }));

                setOverlayDisabled(false);
              }, 1000);
            }}
            confirmationLoading={leaveConfirmationLoading}
            setConfirmationLoading={setLeaveConfirmationLoading}
            dangerous={true}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={styles.eventImageContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={`https://picsum.photos/seed/eventBanner-${event.eventId}/420/300`}
          alt={event.name}
          width={420}
          height={300}
          className={styles.eventImage}
          onLoad={() => {
            setIsLoaded(true);
          }}
        />
      </motion.div>

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
              // type: "spring",
              // stiffness: 120,
              // damping: 20,
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={`ecmitem_${item.label}_index`}
                onClick={() => {
                  item.onClick();
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  delay: showMenu ? index * 0.1 + 0.2 : 0,
                }}
                style={
                  {
                    // pointerEvents: overlayDisabled ? "none" : "auto",
                  }
                }
                className={styles.eventCardMenuButton}
              >
                <KeybindButton
                  keybinds={item.keybinds}
                  onPress={() => {
                    item.onClick();
                  }}
                  textClassName={styles.overlayButtonText}
                  dangerous={item.dangerous}
                  disabled={overlayDisabled}
                  forcetheme="dark"
                  icon={item.icon}
                  iconClassName={styles.overlayButtonIcon}
                  loading={menuItemsLoading[item.loadingId ?? ""]}
                  loadingText={item.loadingText}
                  // loadingTheme="dangerous"
                >
                  {item.label}
                </KeybindButton>

                {/* <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.overlayMagnet,
                    item.dangerous && styles.overlayMagnetDangerous,
                    overlayDisabled && styles.overlayMagnetDisabled
                  )}
                  range={overlayDisabled ? 0 : 130}
                >
                  {overlayDisabled &&
                    overlayLoading &&
                    item.dangerous === true && (
                      <Spinner
                        loading={overlayLoading}
                        size={24}
                        forcetheme={"dangerous"}
                      />
                    )}
                  <div className={styles.overlayButtonIcon}>{item.icon}</div> */}
                {/* <span className={styles.overlayButtonText}>{item.label}</span> */}

                {/* <div className={styles.overlayButtonText}>
                    <TextMorph>{item.label}</TextMorph>
                  </div> */}

                {/* <Magnetic
                    intensity={0.1}
                    springOptions={{ bounce: 0.1 }}
                    actionArea="global"
                    className={clsx(styles.overlayButtonKeybind)}
                    range={overlayDisabled ? 0 : 90}
                  >
                    <Keybind
                      keybinds={item.keybinds}
                      className={styles.createEventFormKeybind}
                      onPress={() => {
                        // alert(
                        //   overlayDisabled ||
                        //     !overlayOpen ||
                        //     // (manageEvent &&
                        //     //   manageEvent.eventId !== event.eventId)
                        // );
                        item.onClick();
                      }}
                      disabled={
                        overlayDisabled || !overlayOpen
                        //  ||(manageEvent && manageEvent.eventId !== event.eventId)
                      }
                      dangerous={item.dangerous}
                      forcetheme={"dark"}
                    />
                  </Magnetic> */}
                {/* </Magnetic> */}
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
