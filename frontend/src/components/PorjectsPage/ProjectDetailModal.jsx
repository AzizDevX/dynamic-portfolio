import React, { useEffect } from "react";
import styles from "./ProjectDetailModal.module.css";

const ProjectDetailModal = ({ project, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusCompleted;
      case "in progress":
        return styles.statusInProgress;
      case "planning":
        return styles.statusPlanning;
      case "planned":
        return styles.statusPlanned;
      case "on hold":
        return styles.statusOnHold;
      case "canceled":
        return styles.statusCanceled;
      case "prototype":
        return styles.statusPrototype;
      case "launched":
        return styles.statusLaunched;
      case "metrics":
        return styles.statusMetrics;
      case "awarded":
        return styles.statusAwarded;
      case "passed":
        return styles.statusPassed;
      case "achievement":
        return styles.statusAchievement;
      default:
        return styles.statusDefault;
    }
  };

  if (!project) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.modalContent}>
          {/* Image Section - Conditional rendering with better layout */}
          {project.image ? (
            <div className={styles.projectImageContainer}>
              <img
                src={project.image}
                alt={project.title}
                className={styles.projectImage}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.classList.add(styles.imageError);
                }}
              />
            </div>
          ) : (
            <div className={styles.projectHeaderNoImage}>
              <div className={styles.projectIconPlaceholder}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
            </div>
          )}

          <div className={styles.projectDetails}>
            <div className={styles.projectHeader}>
              <div className={styles.titleStatusRow}>
                <div className={styles.titleStatusLeft}>
                  <h1 className={styles.projectTitle}>{project.title}</h1>
                  {project.status && (
                    <span
                      className={`${styles.statusBadge} ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  )}
                </div>
                {project.demoUrl && project.demoUrl.trim() !== "" && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.liveLinkButton}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <polyline
                        points="15,3 21,3 21,9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="10"
                        y1="14"
                        x2="21"
                        y2="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    Live URL
                  </a>
                )}
              </div>
            </div>

            {project.description && (
              <div className={styles.descriptionSection}>
                <p className={styles.projectDescription}>
                  {project.description}
                </p>
              </div>
            )}

            {project.technologies && project.technologies.length > 0 && (
              <div className={styles.tagsSection}>
                <h3 className={styles.sectionTitle}>Technologies Used</h3>
                <div className={styles.tagsContainer}>
                  {project.technologies.map((tech, index) => (
                    <span key={index} className={styles.techTag}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
