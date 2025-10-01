import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ProjectDetailModal from "../PorjectsPage/ProjectDetailModal";
import "../../App.css";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import {
  ArrowRight,
  Download,
  Code,
  Eye,
  Users,
  Star,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import styles from "./Home.module.css";

const Home = () => {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [MainHomeData, setMainHomeData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const homeResponse = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`
        );
        setMainHomeData(homeResponse.data);

        try {
          const cvResponse = await axios.get(
            `${Backend_Root_Url}/api/show/cv/`
          );
          setCvData(cvResponse.data);
        } catch (cvError) {
          console.log(
            "CV not found (this is normal if no CV is uploaded):",
            cvError.message
          );
          setCvData(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching home data:", error);
        setError("Failed to load data. Showing fallback content.");
        setLoading(false);

        setMainHomeData({
          DisplayName: "You Need To Complete Setup",
          description:
            "You Need To Complete Setup The Backend Or Your DataBase Not Connected",
          MainRoles: {
            role1: "Frontend Developer",
            role2: "Backend Developer",
            role3: "Full Stack Developer",
          },
          Clients_Counting: "NoData",
          Rateing: "NoData",
          Stats: [{ StatsNumber: "NoData", StatsLabel: "Backend Issue" }],
          AboutUs: {
            AboutUsTitle: "Backend Not Running Or Invalid Database Connection",
            AboutUsDescription:
              "No data available. Please follow the installation guide in the GitHub repo or open an issue if you need help. https://github.com/AzizDevX/dynamic-portfolio",
            AboutSkills: [
              "Not Found",
              "Follow Github Guide",
              "Ask For Help",
              "Invalid DataBase Connection Url Or Down ??",
              "AzizKammoun",
              "AzizDevX",
            ],
          },
          AboutUsSlides: {
            AboutUsSlides: [
              {
                slideTitle: "Backend Not Running",
                slideDescription:
                  "No data available. Please follow the installation guide in the GitHub repo or open an issue if you need help.",
                slideImage: "default-icon.png",
              },
              {
                slideTitle: "Setup Required",
                slideDescription:
                  "Your backend is not connected. Check the The Guide On Github for setup instructions.",
                slideImage: "default-icon.png",
              },
              {
                slideTitle: "Need Assistance?",
                slideDescription:
                  "Visit our GitHub issues page to report problems : https://github.com/AzizDevX/dynamic-portfolio/issues or ask for AzizDevX The Owner Of Project For Help.",
                slideImage: "default-icon.png",
              },
            ],
          },
          HomeLogo: "default-logo.png",
          FeaturedProjects: [],
        });

        setCvData(null);
      }
    };

    fetchData();
  }, []);

  const GetRoles = MainHomeData?.MainRoles
    ? Object.values(MainHomeData.MainRoles)
    : [];

  useEffect(() => {
    if (!GetRoles || GetRoles.length === 0 || loading) return;

    const currentRole = GetRoles[currentIndex];
    if (!currentRole || typeof currentRole !== "string") return;

    const typeSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentRole.length) {
          setTypedText(currentRole.slice(0, typedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentRole.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % GetRoles.length);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, currentIndex, isDeleting, GetRoles, loading]);

  const handleDownloadCV = async () => {
    if (cvData?.FindCv?.Cv) {
      setIsDownloading(true);
      try {
        const cvUrl = `${Backend_Root_Url}/uploads/mycv/${cvData.FindCv.Cv}`;

        const link = document.createElement("a");
        link.download = `${MainHomeData?.DisplayName || "CV"}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const response = await fetch(cvUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `${MainHomeData?.DisplayName || "CV"}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading CV:", error);
        window.open(
          `${Backend_Root_Url}/uploads/mycv/${cvData.FindCv.Cv}`,
          "_blank"
        );
      } finally {
        setIsDownloading(false);
      }
    } else {
      console.error("CV not available");
    }
  };

  const handleProjectView = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const retryFetch = () => {
    setError(null);
    window.location.reload();
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.home}>
        <Navbar />
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Loading portfolio...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statsArray = MainHomeData?.Stats || [
    { StatsNumber: "NoData", StatsLabel: "Backend Issue" },
  ];
  const aboutUsData = MainHomeData?.AboutUs || {
    AboutUsTitle: "Backend Not Running Or Invalid Database Connection",
    AboutUsDescription:
      "No data available. Please follow the installation guide in the GitHub repo or open an issue if you need help. https://github.com/AzizDevX/dynamic-portfolio",
  };
  const aboutUsDataSkills = aboutUsData.AboutSkills || [
    "Not Found",
    "Follow Github Guide",
    "Ask For Help",
    "Invalid DataBase Connection Url Or Down ??",
    "AzizKammoun",
    "AzizDevX",
  ];
  const SlidesData = MainHomeData?.AboutUsSlides?.AboutUsSlides || [
    {
      slideTitle: "Backend Not Running",
      slideDescription:
        "No data available. Please follow the installation guide in the GitHub repo or open an issue if you need help.",
      slideImage: "default-icon.png",
    },
    {
      slideTitle: "Setup Required",
      slideDescription:
        "Your backend is not connected. Check the The Guide On Github for setup instructions.",
      slideImage: "default-icon.png",
    },
    {
      slideTitle: "Need Assistance?",
      slideDescription:
        "Visit our GitHub issues page to report problems : https://github.com/AzizDevX/dynamic-portfolio/issues or ask for AzizDevX The Owner Of Project For Help.",
      slideImage: "default-icon.png",
    },
  ];
  const SlidesIconsDir = `${Backend_Root_Url}/uploads/aboutimg/`;
  const HomeLogo = `${Backend_Root_Url}/uploads/logo/` + MainHomeData?.HomeLogo;

  const featuredProjects = (() => {
    const projects = MainHomeData?.FeaturedProjects || [];

    const validFeaturedProjects = projects.filter(
      (project) =>
        project.Featured === true &&
        project.FeaturedDisplayOrder !== null &&
        project.FeaturedDisplayOrder !== undefined
    );

    // Separate valid and invalid projects
    const projectsWithValidOrder = [];
    const projectsWithInvalidOrder = [];
    const usedPositions = new Set();

    validFeaturedProjects.forEach((project) => {
      const order = project.FeaturedDisplayOrder;

      // Check if order is a valid number and not duplicated
      if (
        typeof order === "number" &&
        order >= 0 &&
        !usedPositions.has(order)
      ) {
        projectsWithValidOrder.push(project);
        usedPositions.add(order);
      } else {
        // Invalid or duplicate order - goes to end
        console.warn(
          `Project "${project.Title}" has invalid/duplicate FeaturedDisplayOrder: ${order}`
        );
        projectsWithInvalidOrder.push(project);
      }
    });

    // Sort valid projects by FeaturedDisplayOrder
    projectsWithValidOrder.sort(
      (a, b) => a.FeaturedDisplayOrder - b.FeaturedDisplayOrder
    );

    // Append invalid projects at the end
    return [...projectsWithValidOrder, ...projectsWithInvalidOrder];
  })();

  // Fallback if no featured projects available
  const displayProjects =
    featuredProjects.length > 0
      ? featuredProjects
      : [
          {
            _id: 1,
            Title: "E-Commerce Platform",
            ShortDescription:
              "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
            Image:
              "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/ProjectNotFound.png",
            Project_technologies: ["React", "Node.js", "MongoDB", "Stripe"],
            ProjectLink: "#",
          },
          {
            _id: 2,
            Title: "Task Management App",
            ShortDescription:
              "A collaborative task management application with real-time updates.",
            Image:
              "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/ProjectNotFound.png",
            Project_technologies: [
              "React",
              "Socket.io",
              "Express",
              "PostgreSQL",
            ],
            ProjectLink: "#",
          },
          {
            _id: 3,
            Title: "Weather Dashboard",
            ShortDescription:
              "A modern weather dashboard with location-based forecasts.",
            Image:
              "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/ProjectNotFound.png",
            Project_technologies: ["Vue.js", "OpenWeather API", "Chart.js"],
            ProjectLink: "#",
          },
        ];

  return (
    <div className={styles.home} id="home">
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.greeting}>
                <span className={styles.wave}>👋</span>
                <span>Hello, I'm</span>
              </div>

              <h1 className={styles.heroTitle}>
                <span className={styles.name}>
                  {MainHomeData?.DisplayName || "Developer"}
                </span>
                <span className={styles.role}>
                  {typedText}
                  <span className={styles.cursor}>|</span>
                </span>
              </h1>

              <p className={styles.heroDescription}>
                <span>
                  {MainHomeData?.description ||
                    "Building amazing web experiences"}
                </span>
              </p>

              <div className={styles.heroButtons}>
                <a href="projects" className={styles.primaryButton}>
                  View My Work
                  <ArrowRight size={20} />
                </a>

                {cvData?.FindCv?.Cv ? (
                  <button
                    onClick={handleDownloadCV}
                    className={styles.secondaryButton}
                    disabled={isDownloading}
                  >
                    <Download
                      size={20}
                      className={isDownloading ? styles.spinning : ""}
                    />
                    {isDownloading ? "Downloading..." : "Download CV"}
                  </button>
                ) : (
                  <button
                    className={styles.secondaryButton}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  >
                    <Download size={20} />
                    Resume Available Soon
                  </button>
                )}
              </div>

              <div className={styles.socialProof}>
                <div className={styles.socialProofItem}>
                  <Users size={20} />
                  <span>
                    {MainHomeData?.Clients_Counting || "0"} Happy Clients
                  </span>
                </div>
                <div className={styles.socialProofItem}>
                  <Star size={20} />
                  <span>{MainHomeData?.Rateing || "5.0"} Rating</span>
                </div>
              </div>
            </div>

            <div className={styles.heroImage}>
              <div className={styles.imageContainer}>
                <img
                  src={HomeLogo}
                  alt="Home image"
                  className={styles.profileImage}
                  onError={(e) => {
                    e.target.src =
                      "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/LogoNotFound.png";
                  }}
                />
                <div className={styles.imageGlow}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {statsArray.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statNumber}>{stat.StatsNumber}</div>
                <div className={styles.statLabel}>{stat.StatsLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>About Me</span>
                <h2 className={styles.sectionTitle}>
                  {aboutUsData.AboutUsTitle}
                </h2>
              </div>

              <p className={styles.aboutDescription}>
                {aboutUsData.AboutUsDescription}
              </p>

              <div className={styles.services}>
                {SlidesData.map((AboutUsSlide, index) => {
                  const SlideIcon = SlidesIconsDir + AboutUsSlide.slideImage;
                  return (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.serviceIcon}>
                        <img
                          src={SlideIcon}
                          alt={AboutUsSlide.slideTitle}
                          onError={(e) => {
                            e.target.src =
                              "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/LogoNotFound.png";
                          }}
                        />
                      </div>
                      <div className={styles.serviceContent}>
                        <h3 className={styles.serviceTitle}>
                          {AboutUsSlide.slideTitle}
                        </h3>
                        <p className={styles.serviceDescription}>
                          {AboutUsSlide.slideDescription}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.aboutVisual}>
              <div className={styles.skillsCloud}>
                {aboutUsDataSkills.map((skill, index) => {
                  return (
                    <div key={index} className={styles.skillBubble}>
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className={styles.projects}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Featured Work</span>
            <h2 className={styles.sectionTitle}>Recent Projects</h2>
          </div>

          <div className={styles.projectsGrid}>
            {displayProjects.map((project) => (
              <div key={project._id} className={styles.projectCard}>
                <div className={styles.projectImage}>
                  {project.Image &&
                  project.Image !==
                    "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/ProjectNotFound.png" &&
                  project.Image !== "Nothing" ? (
                    <img
                      src={`${Backend_Root_Url}/uploads/projectsimg/${project.Image}`}
                      alt={project.Title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.classList.add(
                          styles.imagePlaceholderActive
                        );
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <div className={styles.placeholderIcon}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="2" x2="22" y1="2" y2="22" />
                          <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                          <line x1="13.5" x2="6" y1="13.5" y2="21" />
                          <line x1="18" x2="21" y1="12" y2="15" />
                          <path
                            d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0
            1.052-.22 1.41-.59"
                          />
                          <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectActions}>
                      <button
                        onClick={() => handleProjectView(project)}
                        className={styles.projectAction}
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                      {project.ProjectLiveUrl &&
                        project.ProjectLiveUrl.trim() !== "" && (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={project.ProjectLiveUrl}
                            className={styles.projectAction}
                            title="Live Demo"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                    </div>
                  </div>
                </div>

                <div className={styles.projectContent}>
                  <h3 className={styles.projectTitle}>{project.Title}</h3>
                  <p className={styles.projectDescription}>
                    {project.ShortDescription}
                  </p>

                  <div className={styles.projectTech}>
                    {project.Project_technologies.map((tech, index) => (
                      <span key={index} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.projectsCta}>
            <a href="projects" className={styles.viewAllButton}>
              View All Projects
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Show error message if API failed but we have fallback content */}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "rgba(239, 68, 68, 0.9)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "300px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          {error}
          <button
            onClick={retryFetch}
            style={{
              marginLeft: "12px",
              background: "white",
              color: "#ef4444",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={{
            ...selectedProject,
            title: selectedProject.Title,
            shortDescription: selectedProject.ShortDescription,
            description:
              selectedProject.Description || selectedProject.ShortDescription,
            image:
              selectedProject.Image &&
              selectedProject.Image !==
                "https://raw.githubusercontent.com/AzizDevX/dynamic-portfolio/main/public/notfound/ProjectNotFound.png"
                ? `${Backend_Root_Url}/uploads/projectsimg/${selectedProject.Image}`
                : null,
            technologies: selectedProject.Project_technologies || [],
            status: selectedProject.Status,
            demoUrl: selectedProject.ProjectLiveUrl,
            featured: selectedProject.Featured || false,
          }}
          onClose={handleCloseModal}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
