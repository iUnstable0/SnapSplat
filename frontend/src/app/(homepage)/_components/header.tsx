"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import clsx from "clsx";

import styles from "./header.module.css";

import { ChevronLeft } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const showArrow = pathname !== "/";

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerLogo}>
        <Image
          src="/snapsplat-transparent-removebg.png"
          alt="SnapSplat"
          width={32}
          height={32}
          className={styles.headerLogoImage}
        />
        <span>SnapSplat</span>
      </div>

      {/* <nav className={styles.headerNav}>
        <motion.div
          // layout
          initial={{
            opacity: showArrow ? 1 : 0,
            scale: showArrow ? 1 : 0,
            width: showArrow ? "auto" : 0,
          }}
          animate={{
            opacity: showArrow ? 1 : 0,
            scale: showArrow ? 1 : 0,
            width: showArrow ? "auto" : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            overflow: "hidden",
            display: "flex",
          }}
        >
          <Link
            href="/"
            className={styles.backButtonLink}
            tabIndex={showArrow ? 0 : -1}
            aria-hidden={!showArrow}
            prefetch={true}
          >
            <ChevronLeft className={styles.icon} />
          </Link>
        </motion.div>
        <Link
          href="/about"
          className={clsx(
            styles.headerNavLink,
            pathname === "/about" && styles.active
          )}
          prefetch={true}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={clsx(
            styles.headerNavLink,
            pathname === "/contact" && styles.active
          )}
          prefetch={true}
        >
          Contact
        </Link>
      </nav> */}
    </header>
  );
}
