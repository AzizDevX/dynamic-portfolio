import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowRight,
  Download,
  Code,
  Palette,
  Zap,
  Users,
  Star,
  ExternalLink,
  Github,
} from "lucide-react";
import styles from "./Home.module.css";
import developerPortrait from "../../assets/me.png";

const Home = () => {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [MainHomeData, setMainHomeData] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/home/main/data"
        );
        setMainHomeData(response.data); // assumes your API returns an object
        console.log("Home data fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchHomeData();
  }, []);

  const GetRoles = MainHomeData?.MainRoles
    ? Object.values(MainHomeData.MainRoles)
    : [];

  useEffect(() => {
    if (!GetRoles || GetRoles.length === 0) return;

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
  }, [typedText, currentIndex, isDeleting, GetRoles]);

  // Mock dynamic data - in real app, this would come from backend
  const stats = [
    { number: "50+", label: "Projects Completed" },
    { number: "3+", label: "Years Experience" },
    { number: "25+", label: "Happy Clients" },
    { number: "15+", label: "Technologies" },
  ];

  const services = [
    {
      icon: Code,
      title: "Web Development",
      description:
        "Building responsive and performant web applications using modern technologies and best practices.",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description:
        "Creating intuitive and beautiful user interfaces that provide exceptional user experiences.",
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description:
        "Optimizing applications for speed, accessibility, and search engine visibility.",
    },
  ];

  const featuredProjects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
      image: "/api/placeholder/400/250",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: 2,
      title: "Task Management App",
      description:
        "A collaborative task management application with real-time updates.",
      image: "/api/placeholder/400/250",
      technologies: ["Vue.js", "Firebase", "Tailwind CSS"],
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      id: 3,
      title: "Analytics Dashboard",
      description:
        "A comprehensive analytics dashboard with data visualization.",
      image: "/api/placeholder/400/250",
      technologies: ["React", "D3.js", "Python", "PostgreSQL"],
      liveUrl: "#",
      githubUrl: "#",
    },
  ];

  return (
    <div className={styles.home} id="home">
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
                  {MainHomeData
                    ? MainHomeData.DisplayName
                    : "You Need To Complete Setup"}
                </span>
                <span className={styles.role}>
                  {typedText}
                  <span className={styles.cursor}>|</span>
                </span>
              </h1>

              <p className={styles.heroDescription}>
                I craft exceptional digital experiences through innovative web
                development and thoughtful design. Let's build something amazing
                together.
              </p>

              <div className={styles.heroButtons}>
                <a href="#projects" className={styles.primaryButton}>
                  View My Work
                  <ArrowRight size={20} />
                </a>
                <a href="#contact" className={styles.secondaryButton}>
                  <Download size={20} />
                  Download CV
                </a>
              </div>

              <div className={styles.socialProof}>
                <div className={styles.socialProofItem}>
                  <Users size={20} />
                  <span>25+ Happy Clients</span>
                </div>
                <div className={styles.socialProofItem}>
                  <Star size={20} />
                  <span>5.0 Rating</span>
                </div>
              </div>
            </div>

            <div className={styles.heroImage}>
              <div className={styles.imageContainer}>
                <img
                  src={developerPortrait}
                  alt="Aziz Kammoun - Full Stack Developer"
                  className={styles.profileImage}
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
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
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
                  Passionate about creating digital solutions
                </h2>
              </div>

              <p className={styles.aboutDescription}>
                With over 3 years of experience in web development, I specialize
                in creating modern, responsive, and user-friendly applications.
                I'm passionate about clean code, innovative solutions, and
                continuous learning.
              </p>

              <div className={styles.services}>
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={index} className={styles.serviceItem}>
                      <div className={styles.serviceIcon}>
                        <IconComponent size={24} />
                      </div>
                      <div className={styles.serviceContent}>
                        <h3 className={styles.serviceTitle}>{service.title}</h3>
                        <p className={styles.serviceDescription}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.aboutVisual}>
              <div className={styles.skillsCloud}>
                <div className={styles.skillBubble}>React</div>
                <div className={styles.skillBubble}>Node.js</div>
                <div className={styles.skillBubble}>TypeScript</div>
                <div className={styles.skillBubble}>Python</div>
                <div className={styles.skillBubble}>MongoDB</div>
                <div className={styles.skillBubble}>AWS</div>
                <div className={styles.skillBubble}>Docker</div>
                <div className={styles.skillBubble}>GraphQL</div>
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
            {featuredProjects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.projectImage}>
                  <div className={styles.projectImagePlaceholder}>
                    <Code size={48} />
                  </div>
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectActions}>
                      <a
                        href={project.liveUrl}
                        className={styles.projectAction}
                      >
                        <ExternalLink size={20} />
                      </a>
                      <a
                        href={project.githubUrl}
                        className={styles.projectAction}
                      >
                        <Github size={20} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.projectContent}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectDescription}>
                    {project.description}
                  </p>

                  <div className={styles.projectTech}>
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

          <div className={styles.projectsCta}>
            <a href="#projects" className={styles.viewAllButton}>
              View All Projects
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
