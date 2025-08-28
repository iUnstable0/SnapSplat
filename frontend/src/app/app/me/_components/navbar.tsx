"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import {
  Archive,
  CalendarDays,
  ChevronDown,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import clsx from "clsx";

import { useBlurContext } from "@/components/blur-context";

import styles from "./navbar.module.css";

import { Magnetic } from "@/components/ui/mp_magnetic";
import { TextMorph } from "@/components/ui/mp_text-morph";
// import { TextRoll } from "@/components/ui/mp_text-roll";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { setIsBlurred } = useBlurContext();

  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (overlayOpen) {
      setIsBlurred(true);
      setShowMenu(false);
    } else {
      setIsBlurred(false);
      setTimeout(() => {
        setShowMenu(true);
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayOpen]);

  const menuItems = [
    {
      label: "Upcoming",
      icon: <CalendarDays />,
      href: "/app/me",
      className: styles.menuNormalButton,
    },
    {
      label: "Past Events",
      icon: <RotateCcw />,
      href: "/app/me/past-events",
      className: styles.menuNormalButton,
    },
    {
      label: "Drafts",
      icon: <Pencil />,
      href: "/app/me/drafts",
      className: styles.menuNormalButton,
    },
    {
      label: "Archived",
      icon: <Archive />,
      href: "/app/me/archived",
      className: styles.menuNormalButton,
    },
    // {
    //   label: "Recently Deleted",
    //   icon: <Trash2 />,
    //   href: "/app/me/trash",
    //   className: styles.menuNormalButton,
    // },
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

      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            className={styles.overlayContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              // type: "spring",
              // stiffness: 90,
              // damping: 10,
              // mass: 1,
              // opacity: { duration: 0.2 },
            }}
          >
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div
                  key={`item_${item.label}_${index}`}
                  initial={{ opacity: 0, x: "0", transform: "scale(0.95)" }}
                  animate={{ opacity: 1, x: "0", transform: "scale(1)" }}
                  exit={{ opacity: 0, x: "0", transform: "scale(0.95)" }}
                  transition={{
                    delay: showMenu ? index * 0.1 + 0.1 : 0,
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
                      pathname !== item.href && styles.overlayMagnet_free,
                      // activeEventMenuItem === item.label &&
                      //   styles.sidebarOverlayMagnet_active,
                      // activeEventMenuItem !== item.label &&
                      //   styles.sidebarOverlayMagnet_free
                    )}
                    range={200}
                  >
                    <div className={styles.overlayButtonIcon}>{item.icon}</div>
                    <span className={styles.overlayButtonText}>
                      {item.label}
                    </span>
                  </Magnetic>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.navbar}>
        <div className={styles.navbarContent}>
          <div
            className={clsx(styles.navbarItem, styles.navbarItem_left)}
            onClick={() => setOverlayOpen(!overlayOpen)}
          >
            <div className={styles.navbarTitle}>
              <TextMorph>
                {menuItems.find((item) => item.href === pathname)?.label ||
                  "Upcoming"}
              </TextMorph>
            </div>
            <ChevronDown className={styles.navbarTitleIcon} />
          </div>
        </div>
      </div>
    </>
  );
}
