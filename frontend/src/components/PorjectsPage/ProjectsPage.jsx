import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ProjectDetailModal from "./ProjectDetailModal";
import styles from "./ProjectsPage.module.css";
import { Eye, ExternalLink, ImageOff } from "lucide-react";
import axios from "axios";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import "../../App.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${Backend_Root_Url}/api/show/projects`
        );

        // Transform API data to match component structure
        const transformedProjects = response.data.map((project) => ({
          id: project._id,
          title: project.Title,
          description: project.Description,
          shortDescription: project.ShortDescription,
          image:
            project.Image === "Nothing"
              ? null
              : `${Backend_Root_Url}/uploads/projectsimg/${project.Image}`,
          technologies: project.Project_technologies || [],
          category: "Project", // Default category since not provided by API
          status: project.Porject_Status,
          demoUrl: project.ProjectLiveUrl || "",
          featured: project.Featured,
        }));

        setProjects(transformedProjects);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
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
      case "archived":
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.parentNode.classList.add(styles.imageError);
  };

  const retryFetch = () => {
    setError(null);
    window.location.reload();
  };

  // Calculate statistics with improved logic
  const calculateStats = () => {
    const totalWorks = projects.length;

    const successfulStatuses = [
      "completed",
      "archived",
      "launched",
      "passed",
      "awarded",
      "achievement",
    ];

    const activeStatuses = ["in progress", "prototype", "on hold"];

    const pausedStatuses = ["planning", "planned"];

    const failedStatuses = ["canceled"];

    const workableStatuses = [
      ...successfulStatuses,
      ...activeStatuses,
      ...failedStatuses,
    ];

    const workableProjects = projects.filter((p) =>
      workableStatuses.includes(p.status.toLowerCase())
    );

    const successfulProjects = projects.filter((p) =>
      successfulStatuses.includes(p.status.toLowerCase())
    ).length;

    const projectsWithLiveUrl = projects.filter(
      (p) => p.demoUrl && p.demoUrl.trim() !== ""
    ).length;

    // Get unique technologies across all projects
    const allTechnologies = projects.flatMap((p) => p.technologies);
    const uniqueTechnologies = [...new Set(allTechnologies)].length;

    const successRate =
      workableProjects.length > 0
        ? Math.round((successfulProjects / workableProjects.length) * 100)
        : 0;

    return {
      totalWorks,
      successfulProjects,
      uniqueTechnologies,
      projectsWithLiveUrl,
      successRate,
      workableProjectsCount: workableProjects.length,
      activeProjectsCount: projects.filter((p) =>
        activeStatuses.includes(p.status.toLowerCase())
      ).length,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading projects...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Section */}
          <section className={styles.headerSection}>
            <div className={styles.headerContent}>
              <span className={styles.greeting}>💼 Project Collection</span>
              <h1 className={styles.title}>My Projects</h1>
              <p className={styles.subtitle}>
                A curated selection of projects that represent my professional
                journey, showcasing the diverse skills and experience I've
                gained over time.
              </p>
            </div>
          </section>

          {/* Projects Grid */}
          <section className={styles.projectsSection}>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>No Projects Available Yet</h3>
                <p className={styles.emptyDescription}>
                  New exciting projects are coming soon! Stay tuned for updates
                  as I continue to build and create innovative solutions.
                </p>
                <div className={styles.emptyActions}>
                  <button className={styles.refreshButton} onClick={retryFetch}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="23,4 23,10 17,10" />
                      <polyline points="1,20 1,14 7,14" />
                      <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <div key={project.id} className={styles.projectCard}>
                    <div className={styles.projectImage}>
                      {project.image && project.image.trim() !== "" ? (
                        <>
                          <img
                            src={project.image}
                            alt={project.title}
                            onError={handleImageError}
                          />
                          <div className={styles.projectOverlay}>
                            <button
                              className={styles.viewButton}
                              onClick={() => handleProjectClick(project)}
                              aria-label={`View details for ${project.title}`}
                            >
                              <Eye size={24} />
                            </button>
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.githubButton}
                                aria-label={`View live demo for ${project.title}`}
                              >
                                <ExternalLink size={24} />
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <div className={styles.placeholderIcon}>
                            <ImageOff size={48} />
                          </div>

                          <div className={styles.placeholderOverlay}>
                            <button
                              className={styles.viewButton}
                              onClick={() => handleProjectClick(project)}
                              aria-label={`View details for ${project.title}`}
                            >
                              <Eye size={24} />
                            </button>
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.githubButton}
                                aria-label={`View live demo for ${project.title}`}
                              >
                                <ExternalLink size={24} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.projectContent}>
                      <div className={styles.projectHeader}>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <span
                          className={`${styles.statusBadge} ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <p className={styles.projectDescription}>
                        {project.shortDescription}
                      </p>

                      <div className={styles.projectTechnologies}>
                        {project.technologies.map((tech, index) => (
                          <span key={index} className={styles.techTag}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Stats Section - Only show when there are projects */}
          {projects.length > 0 && (
            <section className={styles.statsSection}>
              <div className={styles.statsHeader}>
                <h2 className={styles.statsTitle}>Projects Statistics</h2>
                <p className={styles.statsSubtitle}>
                  Overview of my project portfolio and achievements
                </p>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{stats.totalWorks}</div>
                  <div className={styles.statLabel}>Total Works</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {stats.successfulProjects}
                  </div>
                  <div className={styles.statLabel}>Successful Works</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    {stats.uniqueTechnologies}
                  </div>
                  <div className={styles.statLabel}>Technologies Used</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{stats.successRate}%</div>
                  <div className={styles.statLabel}>Success Rate</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* Project Detail Modal */}
      {isModalOpen && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
