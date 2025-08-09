import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./404page.module.css";

const NotFoundPage = () => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);

    return () => {
      clearInterval(glitchInterval);
    };
  }, []);

  const handleGoHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  // Memoized particles array to prevent recreation
  const particles = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        id: i,
        delay: i * 0.3,
        duration: 4 + Math.random() * 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
      })),
    []
  );

  return (
    <div className={styles.container}>
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div
          className={styles.floatingElement}
          style={{ "--delay": "0s" }}
        ></div>
        <div
          className={styles.floatingElement}
          style={{ "--delay": "2s" }}
        ></div>
        <div
          className={styles.floatingElement}
          style={{ "--delay": "4s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.errorCode}>
          <span
            className={`${styles.digit} ${glitchActive ? styles.glitch : ""}`}
          >
            4
          </span>
          <div className={styles.zeroContainer}>
            <div className={styles.orbit}>
              <div className={styles.planet}></div>
            </div>
            <span className={`${styles.digit} ${styles.zero}`}>0</span>
          </div>
          <span
            className={`${styles.digit} ${glitchActive ? styles.glitch : ""}`}
          >
            4
          </span>
        </div>

        <div className={styles.messageContainer}>
          <h1 className={styles.title}>Oops! Page Not Found</h1>
          <p className={styles.subtitle}>
            The page you're looking for seems to have vanished into the digital
            void.
          </p>
          <p className={styles.description}>
            Don't worry, even the best explorers sometimes take a wrong turn in
            cyberspace.
          </p>
        </div>

        <div className={styles.actionContainer}>
          <button className={styles.homeButton} onClick={handleGoHome}>
            <span className={styles.buttonText}>Take Me Home</span>
            <div className={styles.buttonGlow}></div>
          </button>

          <div className={styles.suggestions}>
            <p>Or try these options:</p>
            <div className={styles.linkContainer}>
              <a href="/projects" className={styles.link}>
                Projects
              </a>
              <a href="/skills" className={styles.link}>
                Skills
              </a>
              <a href="/contact" className={styles.link}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Particle System */}
      <div className={styles.particles}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              "--delay": `${particle.delay}s`,
              "--duration": `${particle.duration}s`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default NotFoundPage;
