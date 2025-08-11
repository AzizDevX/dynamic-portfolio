import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ProjectDetailModal from "./ProjectDetailModal";
import styles from "./ProjectsPage.module.css";
import { Eye, ExternalLink, ImageOff } from "lucide-react";
// import axios from 'axios'; // Uncomment when ready to use API

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Placeholder data structure - replace with API call later
  const placeholderProjects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
      shortDescription: "Modern e-commerce platform with advanced features",
      image:
        "https://repository-images.githubusercontent.com/384091706/a1614500-e03f-11eb-986a-30f6f0d4f1cc",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      category: "Web Development",
      status: "Completed",
      demoUrl: "https://demo.example.com",
      githubUrl: "https://github.com/example/ecommerce",
      features: [
        "User authentication and authorization",
        "Shopping cart and checkout system",
        "Payment integration with Stripe",
        "Admin dashboard for product management",
        "Responsive design for all devices",
      ],
      challenges:
        "Implementing secure payment processing and optimizing database queries for large product catalogs.",
      solution:
        "Used Stripe for secure payments and implemented database indexing and caching strategies.",
      duration: "3 months",
      teamSize: "Solo project",
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "🗂️ TaskFlow – Smart Task Management App Stay on top of your work and personal life with TaskFlow — a sleek and intuitive task management app designed to boost your productivity 🚀. ✅ Organize Effortlessly – Create, edit, and prioritize tasks in seconds.📅 Plan Ahead – Set deadlines, start dates, and reminders so nothing slips through the cracks.🤝 Collaborate Seamlessly – Share projects with teammates and track progress in real time.🎯 Stay Focused – Break big goals into manageable steps with subtasks.🌙 Work Your Way – Light & dark themes for comfortable viewing anytime.Perfect for students, professionals, and teams, TaskFlow makes productivity feel effortless ✨.🗂️ TaskFlow – Smart Task Management App Stay on top of your work and personal life with TaskFlow — a sleek and intuitive task management app designed to boost your productivity 🚀. ✅ Organize Effortlessly – Create, edit, and prioritize tasks in seconds.📅 Plan Ahead – Set deadlines, start dates, and reminders so nothing slips through the cracks.🤝 Collaborate Seamlessly – Share projects with teammates and track progress in real time.🎯 Stay Focused – Break big goals into manageable steps with subtasks.🌙 Work Your Way – Light & dark themes for comfortable viewing anytime.Perfect for students, professionals, and teams, TaskFlow makes productivity feel effortless ✨.",
      shortDescription: "Real-time collaborative task management",
      image: null, // No image for this project
      technologies: ["React", "Socket.io", "Express", "PostgreSQL"],
      category: "Web Application",
      status: "In Progress",
      demoUrl: "",
      githubUrl: "https://github.com/example/taskmanager",
      features: [
        "Real-time collaboration",
        "Drag and drop task management",
        "Team member assignments",
        "Progress tracking and analytics",
        "File attachments and comments",
      ],
      challenges:
        "Implementing real-time synchronization across multiple users without conflicts.",
      solution:
        "Used Socket.io for real-time communication and implemented conflict resolution algorithms.",
      duration: "2 months",
      teamSize: "2 developers",
    },
    {
      id: 3,
      title: "Portfolio Website",
      description: "A modern portfolio website showcasing projects and skills.",
      shortDescription: "Personal portfolio with modern design",
      image: "/api/placeholder/400/300",
      technologies: ["React", "CSS3", "Framer Motion", "Netlify"],
      category: "Portfolio",
      status: "Completed",
      demoUrl: "https://portfolio.example.com",
      githubUrl: "https://github.com/example/portfolio",
      features: [
        "Responsive design",
        "Smooth animations",
        "Contact form integration",
        "SEO optimization",
        "Fast loading performance",
      ],
      challenges:
        "Creating smooth animations while maintaining performance across all devices.",
      solution:
        "Used Framer Motion for optimized animations and implemented lazy loading for images.",
      duration: "1 month",
      teamSize: "Solo project",
    },
    {
      id: 4,
      title: "Weather Dashboard",
      description:
        "A comprehensive weather dashboard with forecasts and analytics.",
      shortDescription: "Advanced weather tracking dashboard",
      image: "", // Empty string for this project
      technologies: ["Vue.js", "Chart.js", "OpenWeather API", "Tailwind"],
      category: "Dashboard",
      status: "Completed",
      demoUrl: "https://weather.example.com",
      githubUrl: "https://github.com/example/weather",
      features: [
        "Current weather conditions",
        "7-day weather forecast",
        "Interactive weather maps",
        "Historical weather data",
        "Location-based weather alerts",
      ],
      challenges:
        "Handling large amounts of weather data and creating intuitive data visualizations.",
      solution:
        "Implemented data caching and used Chart.js for responsive and interactive charts.",
      duration: "6 weeks",
      teamSize: "Solo project",
    },
    {
      id: 5,
      title: "Social Media Analytics",
      description: "Analytics platform for social media performance tracking.",
      shortDescription: "Comprehensive social media analytics tool",
      image: "/api/placeholder/400/300",
      technologies: ["React", "D3.js", "Python", "FastAPI", "Redis"],
      category: "Analytics",
      status: "In Progress",
      demoUrl: "https://analytics.example.com",
      githubUrl: "https://github.com/example/analytics",
      features: [
        "Multi-platform data aggregation",
        "Custom dashboard creation",
        "Automated reporting",
        "Engagement metrics tracking",
        "Competitor analysis",
      ],
      challenges:
        "Integrating multiple social media APIs and processing large datasets efficiently.",
      solution:
        "Built a robust data pipeline with Redis for caching and FastAPI for high-performance backend.",
      duration: "4 months",
      teamSize: "3 developers",
    },
    {
      id: 6,
      title: "Mobile Fitness App",
      description: "Cross-platform fitness tracking app with workout plans.",
      shortDescription: "Comprehensive fitness tracking mobile app",
      image: undefined, // Undefined for this project
      technologies: ["React Native", "Firebase", "Redux", "Expo"],
      category: "Mobile App",
      status: "Completed",
      demoUrl: "https://fitness.example.com",
      githubUrl: "https://github.com/example/fitness",
      features: [
        "Workout tracking and planning",
        "Progress visualization",
        "Social features and challenges",
        "Nutrition tracking",
        "Offline mode support",
      ],
      challenges:
        "Ensuring smooth performance on both iOS and Android while maintaining native feel.",
      solution:
        "Used React Native with platform-specific optimizations and implemented efficient state management.",
      duration: "5 months",
      teamSize: "2 developers + 1 designer",
    },
  ];

  useEffect(() => {
    // Simulate API call - replace with actual Axios call later
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // TODO: Replace with actual API call
        // const response = await axios.get('YOUR_PROJECTS_API_ENDPOINT');
        // setProjects(response.data);

        // Simulate loading delay
        setTimeout(() => {
          setProjects(placeholderProjects);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load projects");
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
      default:
        return styles.statusDefault;
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.parentNode.classList.add(styles.imageError);
  };

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

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
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
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.githubButton}
                            aria-label={`View source code for ${project.title}`}
                          >
                            <ExternalLink size={24} />
                          </a>
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
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.githubButton}
                            aria-label={`View source code for ${project.title}`}
                          >
                            <ExternalLink size={24} />
                          </a>
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
          </section>
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
