"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./page.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerLogo}>
        <Image
          src="/snapsplat.png"
          alt="SnapSplat"
          width={32}
          height={32}
          className={styles.headerLogoImage}
        />
        <span>SnapSplat</span>
      </div>
      <nav className={styles.headerNav}>
        <Link 
          href="/about" 
          className={`${styles.headerNavLink} ${pathname === '/about' ? styles.active : ''}`}
        >
          About
        </Link>
        <Link 
          href="/contact" 
          className={`${styles.headerNavLink} ${pathname === '/contact' ? styles.active : ''}`}
        >
          Contact
        </Link>
      </nav>
    </header>
  );
} 