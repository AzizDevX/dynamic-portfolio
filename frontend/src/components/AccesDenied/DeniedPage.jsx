import React from "react";
import styles from "./DeniedPage.module.css";

const DeniedPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⛔ Access Denied</h1>
      <p className={styles.message}>
        You are not authorized to view this page.
      </p>
      <a href="/" className={styles.homeLink}>
        Go to Home
      </a>
    </div>
  );
};

export default DeniedPage;
