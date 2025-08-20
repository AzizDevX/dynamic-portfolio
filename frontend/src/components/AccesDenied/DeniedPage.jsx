import React from "react";
import styles from "./DeniedPage.module.css";
import "../../../src/App.css";

const DeniedPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Access Denied</h1>

      <p className={styles.subtitle}>
        Your session has expired or you don't have permission to access this
        resource.
      </p>

      <p className={styles.message}>
        This could happen if your authentication token has expired, you're
        accessing an unauthorized page, or you have unauthorized access. Please
        log in again as admin or click the button to return to the homepage.
      </p>

      <div className={styles.buttonsContainer}>
        <a href="/" className={styles.homeLink}>
          <span></span>
          Go to Homepage
        </a>
      </div>

      <div className={styles.footer}>
        <p>
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
};

export default DeniedPage;
