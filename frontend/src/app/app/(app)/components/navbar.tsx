"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import {
  CalendarDays,
  ChevronDown,
  Crown,
  Pencil,
  RotateCcw,
  TicketCheck,
  Trash,
  Trash2,
} from "lucide-react";

import clsx from "clsx";

import styles from "./navbar.module.css";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { TextMorph } from "@/components/ui/mp_text-morph";
// import { TextRoll } from "@/components/ui/mp_text-roll";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
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
      setShowMenu(false);
    } else {
      setTimeout(() => {
        setShowMenu(true);
      }, 50);
    }
  }, [overlayOpen]);

  const menuItems = [
    {
      label: "Upcoming",
      icon: <CalendarDays />,
      href: "/app",
      className: styles.menuNormalButton,
    },
    {
      label: "Past Events",
      icon: <RotateCcw />,
      href: "/app/past-events",
      className: styles.menuNormalButton,
    },
    {
      label: "Drafts",
      icon: <Pencil />,
      href: "/app/drafts",
      className: styles.menuNormalButton,
    },
    {
      label: "Recently Deleted",
      icon: <Trash2 />,
      href: "/app/trash",
      className: styles.menuNormalButton,
    },
    // {
    //   label: "Hosting",
    //   icon: <Crown />,
    //   href: "/app/hosting",
    //   className: styles.menuNormalButton,
    // },
    // {
    //   label: "Attending",
    //   icon: <TicketCheck />,
    //   href: "/app/attending",
    //   className: styles.menuNormalButton,
    // },
    // {
    //   label: "Invite / Share",
    //   icon: <Link />,
    //   href: "#",
    //   className: styles.eventMenuNormalButton,
    // },
    // {
    //   label: "Manage Event",
    //   icon: <Wrench />,
    //   href: "#",
    //   className: styles.eventMenuNormalButton,
    // },
    // {
    //   label: "Preferences",
    //   icon: <Cog />,
    //   href: "#",
    //   className: styles.eventMenuNormalButton,
    // },
    // {
    //   label: "Leave Event",
    //   icon: <LogOut />,
    //   href: "#",
    //   className: styles.eventMenuLeaveButton,
    // },
  ];

  return (
    <>
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.blurOverlay}
            initial={{
              clipPath: `circle(0px at 82px 64px)`,
              opacity: 0,
            }}
            animate={{
              clipPath: `circle(${Math.hypot(viewportDimensions.width, viewportDimensions.height)}px at 82px 64px)`,
              opacity: 1,
            }}
            exit={{
              // clipPath: `circle(0px at 82px 64px)`,
              clipPath: `circle(0px at 0px 0px)`,
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

      <div className={styles.overlayContent}>
        <AnimatePresence>
          {overlayOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={`item_${item.label}_${index}`}
                initial={{ opacity: 0, x: "0", scale: 0.95 }}
                animate={{ opacity: 1, x: "0", scale: 1 }}
                exit={{ opacity: 0, x: "0", scale: 0.95 }}
                transition={{
                  delay: showMenu ? index * 0.1 + 0.2 : 0,
                }}
                className={styles.menuButton}
                onClick={() => {
                  setOverlayOpen(false);
                  router.push(item.href);
                }}
              >
                <Magnetic
                  intensity={0.1}
                  springOptions={{ bounce: 0.1 }}
                  actionArea="global"
                  className={clsx(
                    styles.overlayMagnet,
                    item.className,
                    pathname === item.href && styles.overlayMagnet_active,
                    pathname !== item.href && styles.overlayMagnet_free
                    // activeEventMenuItem === item.label &&
                    //   styles.sidebarOverlayMagnet_active,
                    // activeEventMenuItem !== item.label &&
                    //   styles.sidebarOverlayMagnet_free
                  )}
                  range={200}
                >
                  <div className={styles.overlayButtonIcon}>{item.icon}</div>
                  <span className={styles.overlayButtonText}>{item.label}</span>
                </Magnetic>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <div className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div
            className={clsx(styles.navbarItem, styles.navbarItem_left)}
            onClick={() => setOverlayOpen(!overlayOpen)}
          >
            <div className={styles.navbarTitle}>
              <TextMorph>
                {menuItems.find((item) => item.href === pathname)?.label ||
                  "Error"}
              </TextMorph>
            </div>
            <ChevronDown className={styles.navbarTitleIcon} />
          </div>
        </div>
      </div>
    </>
  );
}
