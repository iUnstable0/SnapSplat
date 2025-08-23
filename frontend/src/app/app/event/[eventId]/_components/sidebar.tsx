"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import clsx from "clsx";

import deleteEvent from "@/actions/event/deleteEvent";
import leaveEvent from "@/actions/event/leaveEvent";
import archiveEvent from "@/actions/event/archiveEvent";

import {
  FolderLock,
  House,
  Images,
  LogOut,
  ArrowLeft,
  UsersRound,
  Cog,
  LinkIcon,
  Wrench,
  Icon,
  Check,
  Trash2,
  Archive,
  ImageIcon,
  Aperture,
} from "lucide-react";

// import { layoutGridPlus } from "@lucide/lab";
import { AnimatePresence, motion } from "motion/react";

import {
  Sidebar as Ace_Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/ace_sidebar";

import { Magnetic } from "@/components/ui/mp_magnetic";

import { useBlurContext } from "@/components/blur-context";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import Spinner from "@/components/spinner";
import { KeybindButton, T_Keybind } from "@/components/keybind";
import Confirmation from "@/components/confirmation";

import PhotoUpload from "./photo-upload";

import ManageEvent from "@/components/panels/manage-event";

import lib_role from "@/modules/role";

// import clsx from "clsx";

import styles from "./sidebar.module.css";

import { T_Event, T_EventInvite, T_EventMembership, T_User } from "@/gql/types";

export default function Sidebar({
  children,
  event,
}: {
  children?: React.ReactNode;
  event: T_Event & {
    hostMember: T_User;
    memberships: T_EventMembership[];
    myMembership: T_EventMembership;
    invites: T_EventInvite[];
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathname = usePathname();

  const { isBlurred, setIsBlurred } = useBlurContext();

  // const rootPath = pathname.split("/").slice(0, 4).join("/");
  // const pathDirec = `/${pathname.split("/")[4] ?? ""}`;

  // const [page, setPage] = useState(pathDirec);

  const [open, setOpen] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [renderChildren, setRenderChildren] = useState(true);
  const [targetPath, setTargetPath] = useState<string>(pathname);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const [manageEventVisible, setManageEventVisible] = useState(false);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteConfirmationLoading, setDeleteConfirmationLoading] =
    useState(false);

  const [leaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false);
  const [leaveConfirmationLoading, setLeaveConfirmationLoading] =
    useState(false);

  const [archiveConfirmationOpen, setArchiveConfirmationOpen] = useState(false);
  const [archiveConfirmationLoading, setArchiveConfirmationLoading] =
    useState(false);

  const [menuItemsLoading, setMenuItemsLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const [overlayDisabled, setOverlayDisabled] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");

  // TODO: Point
  // useEffect(() => {
  //   if (manageEventVisible) {
  //     setIsBlurred(true);
  //   } else {
  //     setIsBlurred(false);
  //   }
  // }, [manageEventVisible]);

  useEffect(() => {
    if (eventMenuOpen) {
      setShowMobileMenu(false);
    } else {
      setTimeout(() => {
        setShowMobileMenu(true);
      }, 500);
    }
  }, [eventMenuOpen]);

  useEffect(() => {
    if (eventMenuOpen) {
      setShowMenu(false);
    } else {
      setTimeout(() => {
        setShowMenu(true);
      }, 50);
    }
  }, [eventMenuOpen]);

  useEffect(() => {
    if (targetPath !== pathname) {
      setRenderChildren(false);
    } else {
      setRenderChildren(true);
    }
  }, [targetPath, pathname]);

  useEffect(() => {
    if (renderChildren) {
      // alert("Loaded, clear spinner");
      setShowSpinner(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (!renderChildren) {
        // alert("Loading too long, showing spinner");
        setShowSpinner(true);
        // } else {
        //   setShowSpinner(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [renderChildren]);

  const goBack = () => {
    router.push(searchParams.get("back") ?? "/app/me");
  };

  const eventMenuItems: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    keybinds: T_Keybind[];
    loadingId?: string;
    loadingText?: string;
    dangerous?: boolean;
  }[] = [
    {
      label: "Back to My Events",
      icon: <ArrowLeft />,
      onClick: goBack,
      // keybinds: [T_Keybind.enter],
      keybinds: [],
    },
    {
      label: "Members",
      icon: <UsersRound />,
      onClick: () => {
        const members = event.memberships.map(
          (member) => member.displayNameAlt
        );

        alert(`Members (${members.length}): ${members.join(", ")}`);
      },
      // keybinds: [T_Keybind.m],
      keybinds: [],
    },
    {
      label: "Invite / Share",
      icon: <LinkIcon />,
      onClick: () => {
        const invites = event.invites.map((invite) => invite.inviteCode);

        alert(`Invites (${invites.length}): ${invites.join(", ")}`);
      },
      // keybinds: [T_Keybind.e],
      keybinds: [],
    },
    // {
    //   label: "Preferences",
    //   icon: <Cog />,
    //   onClick: () => {
    //     alert("Under construction");
    //   },
    //   keybinds: [T_Keybind.p],
    // },
  ];

  // COHOST & HOST
  if (lib_role.event_hasRole(event.myMembership, "COHOST")) {
    eventMenuItems.push({
      label: "Manage Event",
      icon: <Wrench />,
      onClick: () => {
        setManageEventVisible(true);
      },
      // keybinds: [T_Keybind.shift, T_Keybind.m],
      keybinds: [],
    });

    // if (event.isDraft) {
    //   eventMenuItems.push({
    //     label: "Publish Event",
    //     icon: <Check />,
    //     onClick: () => {
    //       alert("Under construction");
    //     },
    //   });
    // }
  }

  // NOT HOST
  if (!lib_role.event_hasRole(event.myMembership, "HOST")) {
    eventMenuItems.push({
      label: "Leave Event",
      icon: <LogOut />,
      onClick: async () => {
        setOverlayDisabled(true);
        setMenuItemsLoading((prev) => ({
          ...prev,
          delete: true,
        }));

        setLeaveConfirmationOpen(true);

        // await leaveEvent("captchaDemo", event.eventId);

        // router.push("/app/me");
        // goBack();
      },
      keybinds: [],
      dangerous: true,
      loadingId: "leave",
      loadingText: "Leaving Event...",
    });
  }

  // HOST
  if (lib_role.event_hasRole(event.myMembership, "HOST")) {
    if (event.isDraft) {
      eventMenuItems.push({
        label: "Delete Event",
        icon: <Trash2 />,
        onClick: async () => {
          setOverlayDisabled(true);
          setMenuItemsLoading((prev) => ({
            ...prev,
            delete: true,
          }));
          setDeleteConfirmationOpen(true);
        },
        keybinds: [],
        loadingId: "delete",
        loadingText: "Deleting Event...",
        dangerous: true,
      });
    } else {
      eventMenuItems.push({
        label: "Archive Event",
        icon: <Archive />,
        onClick: () => {
          setOverlayDisabled(true);
          setMenuItemsLoading((prev) => ({
            ...prev,
            archive: true,
          }));

          setArchiveConfirmationOpen(true);
        },
        keybinds: [],
        loadingId: "archive",
        loadingText: "Archiving Event...",
        dangerous: true,
      });
    }
  }

  // if (!) {
  //   eventMenuItems.push({
  //     label: "Leave Event",
  //     icon: <LogOut />,
  //     href: "#",
  //     className: styles.eventMenuLeaveButton,
  //   });
  // }

  const navigate = (path: string) => {
    setTargetPath(path);

    setTimeout(() => {
      const searchParamsString = searchParams.toString();

      router.push(`${path}?${searchParamsString}`);
    }, 250);
  };

  const sidebarItems = [
    {
      label: "Home",
      icon: <House className={styles.sidebarLinkIcon} />,
      href: "/home",
      onClick: () => {
        // setPage("/home");
        // change url bar without reloading

        navigate(`/app/event/${event.eventId}/home`);
      },
    },
    {
      label: "My Photos",
      icon: <Aperture className={styles.sidebarLinkIcon} />,
      href: "/my-photos",
      onClick: () => {
        // setPage("/my-gallery");
        navigate(`/app/event/${event.eventId}/my-photos`);
      },
    },
    {
      label: "Gallery",
      icon: <Images className={styles.sidebarLinkIcon} />,
      href: "/gallery",
      onClick: () => {
        // setPage("/gallery");
        navigate(`/app/event/${event.eventId}/gallery`);
      },
    },
    // {
    //   label: "Public Board",
    //   icon: (
    //     <Icon iconNode={layoutGridPlus} className={styles.sidebarLinkIcon} />
    //   ),
    //   href: "/board",
    //   onClick: () => {
    //     // setPage("/board");
    //     navigate(`/app/event/${event.eventId}/board`);
    //   },
    // },
    // {
    //   label: "Members",
    //   icon: <UsersRound className={styles.sidebarLinkIcon} />,
    //   href: "#",
    // },
  ];

  return (
    <PhotoUpload event={event} disabled={manageEventVisible}>
      <div
        style={{
          userSelect: "none",
        }}
      >
        <AnimatePresence>
          {deleteConfirmationOpen && (
            <Confirmation
              parentClassName={styles.sidebarConfirmationContainer}
              title="Are you sure?"
              description="You can't undo this action."
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
                  // setDeleteConfirmationLoading(false);
                  setMenuItemsLoading((prev) => ({
                    ...prev,
                    delete: false,
                  }));

                  // setOverlayDisabled(false);
                  // setOverlayOpen(false);

                  // router.push("/app/me");
                  goBack();
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
              dim={true}
              confirmationLoading={deleteConfirmationLoading}
              setConfirmationLoading={setDeleteConfirmationLoading}
              dangerous={true}
            />
          )}

          {archiveConfirmationOpen && (
            <Confirmation
              parentClassName={styles.sidebarConfirmationContainer}
              title="Are you sure?"
              description="You can't undo this action."
              confirmText="Archive"
              confirmLoadingText="Archiving..."
              // confirmIcon={<Trash2 />}
              // cancelIcon={<X />}
              forcetheme="dark"
              confirmKeybinds={[T_Keybind.shift, T_Keybind.enter]}
              onConfirm={async () => {
                await archiveEvent("captchaDemo", event.eventId);

                setArchiveConfirmationOpen(false);

                setTimeout(() => {
                  // setDeleteConfirmationLoading(false);
                  setMenuItemsLoading((prev) => ({
                    ...prev,
                    archive: false,
                  }));

                  // setOverlayDisabled(false);
                  // setOverlayOpen(false);

                  // router.push("/app/me");
                  goBack();
                }, 1000);
              }}
              onCancel={() => {
                setArchiveConfirmationOpen(false);

                setTimeout(() => {
                  // setOverlayLoading(false);
                  setMenuItemsLoading((prev) => ({
                    ...prev,
                    archive: false,
                  }));

                  setOverlayDisabled(false);
                }, 1000);
              }}
              dim={true}
              confirmationLoading={archiveConfirmationLoading}
              setConfirmationLoading={setArchiveConfirmationLoading}
              dangerous={true}
            />
          )}
        </AnimatePresence>

        <Ace_Sidebar
          open={open}
          setOpen={setOpen}
          eventMenuOpen={eventMenuOpen}
          setEventMenuOpen={setEventMenuOpen}
        >
          <SidebarBody>
            {/* <motion.div
            className={styles.sidebarOverlayCover}
            initial={{
              width: "70px",
            }}
            animate={{
              width: open ? "300px" : "70px",
            }}
            transition={{
              type: "spring",
              stiffness: 210,
              // neat little trick
              damping: open ? 20 : 30,
              mass: 1,
              restDelta: 0.01,
              restSpeed: 10,
            }}
          /> */}

            <motion.div
              className={styles.sidebarOverlay}
              onClick={() => setEventMenuOpen(false)}
              initial={{
                width: isMobile ? "100%" : "70px",
                y: eventMenuOpen ? "-100%" : "0",
                backdropFilter: isMobile ? "blur(0px)" : "blur(0px)",
              }}
              animate={{
                // Size of sidebar body
                // 60px + 10px (invisible content border)
                ...(!isMobile && {
                  width: open ? "300px" : "70px",
                  backdropFilter: eventMenuOpen ? "blur(12px)" : "blur(0px)",
                }),

                opacity: isMobile ? 0 : eventMenuOpen ? 1 : 0,

                y: eventMenuOpen ? "0" : "-100%",
              }}
              transition={{
                // duration: 0.2,
                // ease: "easeInOut",

                type: "spring",
                stiffness: 210,
                // neat little trick
                damping: open ? 20 : 30,
                mass: 1,
                restDelta: 0.01,
                restSpeed: 10,
              }}
            />

            <div className={styles.sidebarOverlayContent}>
              <AnimatePresence>
                {eventMenuOpen &&
                  eventMenuItems.map((item, index) => (
                    <motion.div
                      key={`item_${item.label}_${index}`}
                      initial={{ opacity: 0, transform: "scale(0.95)" }}
                      animate={{ opacity: 1, transform: "scale(1)" }}
                      exit={{ opacity: 0, transform: "scale(0.95)" }}
                      transition={{
                        delay: isMobile
                          ? index * 0.07 + 0.2
                          : showMenu
                            ? index * 0.07 + 0.2
                            : 0,
                      }}
                      onClick={() => {
                        if (overlayDisabled) {
                          return;
                        }

                        item.onClick();
                      }}
                    >
                      <Magnetic
                        intensity={0.1}
                        springOptions={{ bounce: 0.1 }}
                        actionArea="global"
                        className={clsx(
                          styles.sidebarOverlayMagnet,
                          item.dangerous &&
                            styles.sidebarOverlayMagnetDangerous,
                          overlayDisabled && styles.sidebarOverlayMagnetDisabled
                          // activeEventMenuItem === item.label &&
                          //   styles.sidebarOverlayMagnet_active,
                          // activeEventMenuItem !== item.label &&
                          //   styles.sidebarOverlayMagnet_free
                        )}
                        range={175}
                      >
                        {/* <div className={styles.sidebarOverlayButtonIcon}>
                        {item.icon}
                      </div> */}

                        <AnimatePresence mode="popLayout">
                          {!item.loadingText && (
                            <motion.div
                              className={styles.sidebarOverlayButtonIcon}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.icon}
                            </motion.div>
                          )}

                          {item.loadingText &&
                            !menuItemsLoading[item.loadingId ?? ""] && (
                              <motion.div
                                className={styles.sidebarOverlayButtonIcon}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.icon}
                              </motion.div>
                            )}
                        </AnimatePresence>

                        {item.loadingText &&
                          typeof menuItemsLoading[item.loadingId ?? ""] ===
                            "boolean" && (
                            <Spinner
                              id={`keybind-${item.loadingId ?? ""}`}
                              loading={menuItemsLoading[item.loadingId ?? ""]}
                              size={24}
                              preload={false}
                              dangerous={item.dangerous}
                            />
                          )}

                        <span className={styles.sidebarOverlayButtonText}>
                          {item.label}
                        </span>
                      </Magnetic>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
            <div className={styles.sidebarContent}>
              <a
                href="#"
                className={styles.logoLink}
                onClick={() => setEventMenuOpen(!eventMenuOpen)}
              >
                <Image
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                    event.name
                  )}`}
                  alt="SnapSplat"
                  width={24}
                  height={24}
                  className={styles.logoImage}
                />

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: open ? 1 : 0 }}
                  className={styles.logoText}
                >
                  {event.name}
                </motion.span>
              </a>

              {isMobile && (
                <div className={styles.linksContainerMobile}>
                  <AnimatePresence>
                    {showMobileMenu &&
                      sidebarItems.map((item, index) => (
                        <motion.div
                          key={`item_${item.label}_${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            delay: index * 0.05,
                          }}
                        >
                          <SidebarLink
                            key={`item_${item.label}_${index}`}
                            link={item}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}

              {!isMobile && (
                <div className={styles.linksContainer}>
                  {sidebarItems.map((item, index) => (
                    <SidebarLink
                      key={`item_${item.label}_${index}`}
                      link={item}
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <div
                className={styles.sidebarSeperator}
                style={{
                  right: open ? "0" : "-5px",
                }}
              />
              <SidebarLink
                className={styles.avatarLink}
                link={{
                  label: event.myMembership.displayNameAlt,
                  href: "#",
                  avatar: true,
                  icon: (
                    <img
                      src={event.myMembership.avatarAlt}
                      className={styles.avatarImage}
                      // width={50}
                      // height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Ace_Sidebar>

        <motion.div
          className={styles.mainContent}
          // className={cn(styles.mainContent, "")}
          animate={{
            marginLeft: open ? "300px" : "60px",
            // media tag
            // backgroundColor: open ? "red" : "blue",
          }}
          transition={{
            // different type for open and close
            type: "spring",
            stiffness: 210,
            // neat little trick
            damping: open ? 20 : 30,
            mass: 1,
            restDelta: 0.01,
            restSpeed: 10,
          }}
        >
          <AnimatePresence>
            {showSpinner && (
              <motion.div
                key={"sidebarspinner"}
                initial={{ opacity: 0, transform: "scale(0.99)" }}
                // animate={{ opacity: isBlurred ? 0.5 : 1, scale: 1 }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.99)" }}
                transition={{
                  type: "spring",
                  stiffness: 210,
                  damping: 20,
                  opacity: {
                    duration: 0.2,
                  },
                }}
                className={styles.galleryTitle}
              >
                <Spinner id="rendersidebarspin" loading={true} size={32} />
              </motion.div>
            )}

            {renderChildren && (
              <motion.div
                key={"sidebarpage"}
                initial={{ opacity: 0, transform: "scale(0.99)" }}
                // TODO: Point
                // animate={{ opacity: isBlurred ? 0.5 : 1, scale: 1 }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.99)" }}
                transition={{
                  type: "spring",
                  stiffness: 210,
                  damping: 20,
                  opacity: {
                    duration: 0.2,
                  },
                }}
                className={styles.mainContentChildren}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {manageEventVisible && (
            <ManageEvent
              event={event}
              setManageEventVisible={setManageEventVisible}
            />
          )}
        </AnimatePresence>
        {/* <Dashboard /> */}
      </div>
    </PhotoUpload>
  );
}
