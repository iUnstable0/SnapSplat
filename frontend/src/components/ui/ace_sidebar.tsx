"use client";

// import Image from "next/image";

import { cn } from "@/lib/utils";
import clsx from "clsx";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
// import { IconMenu2, IconX } from "@tabler/icons-react";

import { Menu, X } from "lucide-react";

import styles from "./ace_sidebar.module.css";

interface Links {
  label: string;
  href: string;
  avatar?: boolean;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={styles.desktopSidebar}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div className={styles.mobileSidebar} {...props}>
        {/* <div className="flex justify-end z-20 w-full"> */}
        <Menu
          className={styles.mobileSidebarMenuIcon}
          onClick={() => setOpen(!open)}
        />
        {/* </div> */}
        <AnimatePresence>
          {open && (
            <motion.div
              // initial={{ x: "-100%", opacity: 1 }}
              // animate={{ x: 0, opacity: 1 }}
              // exit={{ x: "-100%", opacity: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
                // type: "spring",
                // stiffness: 100,
                // damping: 20,
                // mass: 1,
                // restDelta: 0.01,
                // restSpeed: 10,
              }}
              className={styles.mobileSidebarContent}
            >
              <div
                className={styles.mobileSidebarCloseButton}
                onClick={() => setOpen(!open)}
              >
                <X className={styles.mobileSidebarCloseIcon} />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={clsx(styles.sidebarLink, className)}
      {...props}
    >
      {link.avatar && link.icon}

      {!link.avatar && (
        <div className={styles.sidebarLinkIcon}>{link.icon}</div>
      )}

      {/* {link.label !== "" && ( */}
      <motion.span
        animate={{
          // display: link.label !== "" ? "inline-block" : "none",
          // display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={styles.sidebarLinkText}
      >
        {link.label}
      </motion.span>
      {/* )} */}
    </a>
  );
};
