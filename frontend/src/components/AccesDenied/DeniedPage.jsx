import React from "react";
import styles from "./DeniedPage.module.css";

const DeniedPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⛔ Your Session Has Expired</h1>
      <p className={styles.message}>
        You are not authorized to view this page. Please login again.
      </p>
      <a href="/" className={styles.homeLink}>
        Go to Home
      </a>
    </div>
  );
};

export default DeniedPage;
