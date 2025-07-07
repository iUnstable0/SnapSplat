import { Hammer } from "lucide-react";

import styles from "@/app/(homepage)/page.module.css";

export default function Contact() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <section className={styles.mainContent}>
          <Hammer
            className={styles.mainContentIcon}
            style={{
              color: "#FEC05E",
            }}
          />
          <h1>Under construction.</h1>
          <p className={styles.subtitle}>Check back soon for updates!</p>
        </section>
      </main>
    </div>
  );
}
