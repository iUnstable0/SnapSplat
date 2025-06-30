import styles from "./error.module.css";

export default function Error({ message }: { message: string }) {
  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorMessage}>{message}</h1>
    </div>
  );
}
