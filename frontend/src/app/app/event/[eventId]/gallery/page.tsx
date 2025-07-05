import { Images } from "lucide-react";

import styles from "./page.module.css";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>Public Gallery</div>

        <div className={styles.galleryTitle}>
          <Images className={styles.galleryTitleIcon} />
          <span className={styles.galleryTitleText}>No photos yet</span>
        </div>

        <div className={styles.galleryContainer}></div>
      </div>
    </div>
  );
}
