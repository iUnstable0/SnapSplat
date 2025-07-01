import Image from "next/image";

import { ChevronDown } from "lucide-react";

import styles from "./navbar.module.css";

import type { T_User } from "@/gql/types";

export default function Navbar({ user }: { user: T_User }) {
  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContent}>
        <div className={styles.navbarItem}>
          <div className={styles.navbarTitle}>Upcoming</div>
          <ChevronDown className={styles.navbarTitleIcon} />
        </div>
        <div className={styles.navbarItem}>
          <div className={styles.createEvent}>create</div>
          <div className={styles.profile}>
            <Image
              src={user.avatar}
              alt="avatar"
              width={50}
              height={50}
              className={styles.profileAvatar}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
