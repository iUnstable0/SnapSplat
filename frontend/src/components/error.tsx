import Link from "next/link";
import styles from "./error.module.css";

export default function Error({
  title,
  description,
  link,
}: {
  title: string;
  description?: string;
  link?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorMessage}>{title}</h1>
      <p className={styles.errorDescription}>{description}</p>
      {link && (
        <Link className={styles.errorLink} href={link.href}>
          {link.label}
        </Link>
      )}
    </div>
  );
}
