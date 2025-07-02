"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";

import clsx from "clsx";

import { AnimatePresence, delay, motion } from "motion/react";

import {
  FolderLock,
  House,
  Images,
  LogOut,
  ArrowLeft,
  UsersRound,
  Cog,
  Link,
  Wrench,
  Icon,
} from "lucide-react";

import { layoutGridPlus } from "@lucide/lab";

import {
  Sidebar as Ace_Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/ace_sidebar";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { useMediaQuery } from "@/components/useMediaQuery";

import lib_role from "@/modules/role";

// import clsx from "clsx";

import styles from "./sidebar.module.css";
export default function Sidebar({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [open, setOpen] = useState(true);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const [activeEventMenuItem, setActiveEventMenuItem] = useState("");

  const isMobile = useMediaQuery("(max-width: 767px)");

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

  const eventMenuItems = [
    {
      label: "Back to My Events",
      icon: <ArrowLeft />,
      href: "#",
      className: styles.eventMenuNormalButton,
    },
    {
      label: "Members",
      icon: <UsersRound />,
      href: "#",
      className: styles.eventMenuNormalButton,
    },
    {
      label: "Invite / Share",
      icon: <Link />,
      href: "#",
      className: styles.eventMenuNormalButton,
    },
    {
      label: "Manage Event",
      icon: <Wrench />,
      href: "#",
      className: styles.eventMenuNormalButton,
    },
    {
      label: "Preferences",
      icon: <Cog />,
      href: "#",
      className: styles.eventMenuNormalButton,
    },
    {
      label: "Leave Event",
      icon: <LogOut />,
      href: "#",
      className: styles.eventMenuLeaveButton,
    },
  ];

  // if (!) {
  //   eventMenuItems.push({
  //     label: "Leave Event",
  //     icon: <LogOut />,
  //     href: "#",
  //     className: styles.eventMenuLeaveButton,
  //   });
  // }

  const sidebarItems = [
    {
      label: "Home",
      icon: <House className={styles.sidebarLinkIcon} />,
      href: "#",
    },
    {
      label: "My Gallery",
      icon: <FolderLock className={styles.sidebarLinkIcon} />,
      href: "#",
    },
    {
      label: "Public Gallery",
      icon: <Images className={styles.sidebarLinkIcon} />,
      href: "#",
    },
    {
      label: "Public Board",
      icon: (
        <Icon iconNode={layoutGridPlus} className={styles.sidebarLinkIcon} />
      ),
      href: "#",
    },
    // {
    //   label: "Members",
    //   icon: <UsersRound className={styles.sidebarLinkIcon} />,
    //   href: "#",
    // },
  ];

  return (
    <div
      style={{
        userSelect: "none",
      }}
    >
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
                    initial={{ opacity: 0, x: "0", scale: 0.95 }}
                    animate={{ opacity: 1, x: "0", scale: 1 }}
                    exit={{ opacity: 0, x: "0", scale: 0.95 }}
                    transition={{
                      delay: isMobile
                        ? index * 0.1 + 0.2
                        : showMenu
                          ? index * 0.1 + 0.2
                          : 0,
                    }}
                    onClick={() => {
                      setActiveEventMenuItem(item.label);

                      setTimeout(() => {
                        setActiveEventMenuItem("");
                      }, 250);
                    }}
                  >
                    <Magnetic
                      intensity={0.1}
                      springOptions={{ bounce: 0.1 }}
                      actionArea="global"
                      className={clsx(
                        styles.sidebarOverlayMagnet,
                        item.className,
                        activeEventMenuItem === item.label &&
                          styles.sidebarOverlayMagnet_active,
                        activeEventMenuItem !== item.label &&
                          styles.sidebarOverlayMagnet_free
                      )}
                      range={200}
                    >
                      <div className={styles.sidebarOverlayButtonIcon}>
                        {item.icon}
                      </div>
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
              {/* <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" /> */}
              <Image
                src="/snapsplat-transparent-removebg.png"
                alt="SnapSplat"
                width={28}
                height={28}
                className={styles.logoImage}
              />

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                className={styles.logoText}
              >
                Test Event
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
                label: user.displayName,
                href: "#",
                avatar: true,
                icon: (
                  <img
                    src={user.avatar}
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
        {children}
      </motion.div>
      {/* <Dashboard /> */}
    </div>
  );
}
