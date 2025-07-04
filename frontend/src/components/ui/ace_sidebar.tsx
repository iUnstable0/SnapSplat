"use client";

import clsx from "clsx";
import React, { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { Menu, X } from "lucide-react";

import styles from "./ace_sidebar.module.css";

interface Links {
  label: string;
  href: string;
  onClick?: () => void;
  avatar?: boolean;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  eventMenuOpen: boolean;
  setEventMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  eventMenuOpen: eventMenuOpenProp,
  setEventMenuOpen: setEventMenuOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  eventMenuOpen?: boolean;
  setEventMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  const eventMenuOpen =
    eventMenuOpenProp !== undefined ? eventMenuOpenProp : false;
  const setEventMenuOpen =
    setEventMenuOpenProp !== undefined ? setEventMenuOpenProp : () => {};

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        eventMenuOpen,
        setEventMenuOpen,
        animate: animate,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  eventMenuOpen,
  setEventMenuOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  eventMenuOpen?: boolean;
  setEventMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider
      open={open}
      setOpen={setOpen}
      eventMenuOpen={eventMenuOpen}
      setEventMenuOpen={setEventMenuOpen}
      animate={animate}
    >
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
  // className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate, setEventMenuOpen } = useSidebar();

  return (
    <>
      <motion.div
        className={styles.desktopSidebar}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        transition={{
          type: "spring",
          stiffness: 210,
          damping: 30,
          mass: 1,
          restDelta: 0.01,
          restSpeed: 10,
        }}
        onMouseEnter={() => {
          setOpen(true);
          // setEventMenuOpen(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
          setEventMenuOpen(false);
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  // className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen, setEventMenuOpen } = useSidebar();
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
                onClick={() => {
                  setOpen(!open);
                  setEventMenuOpen(false);
                }}
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
  link: info,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  // const router = useRouter();
  const pathname = usePathname();
  const { open, animate } = useSidebar();

  const pathDirec = `/${pathname.split("/")[4] ?? ""}`;
  // const rootPath = pathname.split("/").slice(0, 4).join("/");

  return (
    <div
      onClick={info.onClick}
      className={clsx(
        styles.sidebarLink,
        className,
        pathDirec === info.href &&
          (open ? styles.sidebarLinkFull_active : styles.sidebarLink_active)
      )}
      {...props}
    >
      {info.avatar && info.icon}

      {!info.avatar && (
        <div className={styles.sidebarLinkIcon}>{info.icon}</div>
      )}

      {/* {link.label !== "" && ( */}
      {/* <motion.span
        animate={
          {
            // display: link.label !== "" ? "inline-block" : "none",
            // display: animate ? (open ? "inline-block" : "none") : "inline-block",
            // opacity: animate ? (open ? 1 : 0) : 1,
          }
        } */}
      <span
        style={{
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={styles.sidebarLinkText}
      >
        {info.label}
      </span>
      {/* </motion.span> */}
      {/* )} */}
    </div>
  );
};
