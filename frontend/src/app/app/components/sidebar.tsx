"use client";
// import { IconBrandTabler } from "@tabler/icons-react";

import React, { useState } from "react";

import Image from "next/image";

// import {
//   IconArrowLeft,
//   IconBrandTabler,
//   IconSettings,
//   IconUserBolt,
// } from "@tabler/icons-react";

import { motion } from "motion/react";

import {
  Sidebar as Ace_Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/ace_sidebar";

import clsx from "clsx";

import {
  BookImage,
  CalendarClock,
  Earth,
  FolderLock,
  House,
  Images,
  Users,
  UsersRound,
} from "lucide-react";

import styles from "./sidebar.module.css";
import { cn } from "@/lib/utils";

export default function Sidebar({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <Ace_Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className={styles.sidebarContent}>
            <a href="#" className={styles.logoLink}>
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
            <div className={styles.linksContainer}>
              <SidebarLink
                link={{
                  label: "Home",
                  href: "#",
                  icon: <House className={styles.sidebarLinkIcon} />,
                }}
              />
              <SidebarLink
                link={{
                  label: "My Gallery",
                  href: "#",
                  icon: <FolderLock className={styles.sidebarLinkIcon} />,
                }}
              />
              <SidebarLink
                link={{
                  label: "Public Gallery",
                  href: "#",
                  icon: <Images className={styles.sidebarLinkIcon} />,
                }}
              />
              <SidebarLink
                link={{
                  // Public baord like reddit's r/place
                  label: "Public Board",
                  href: "#",
                  icon: <Earth className={styles.sidebarLinkIcon} />,
                }}
              />
              <SidebarLink
                link={{
                  label: "Participants",
                  href: "#",
                  icon: <UsersRound className={styles.sidebarLinkIcon} />,
                }}
              />
            </div>
          </div>
          <div>
            <SidebarLink
              className={styles.avatarLink}
              link={{
                label: user.displayName,
                href: "#",
                avatar: true,
                icon: (
                  <img
                    src={
                      user.profilePicture === "/placeholder.png"
                        ? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                            user.displayName
                          )}`
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                            user.displayName
                          )}`
                    }
                    className={styles.avatarImage}
                    // width={50}
                    // height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
          {/* <div className={styles.sidebarFooter}>
            <SidebarLink
              link={{
                label: user.displayName,
                href: "#",
                icon: (
                  <img
                    src={
                      user.profilePicture === "/placeholder.png"
                        ? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                            user.displayName
                          )}`
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                            user.displayName
                          )}`
                    }
                    className={styles.avatarImage}
                    // width={50}
                    // height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div> */}
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
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
      {/* <Dashboard /> */}
    </div>
  );
}
