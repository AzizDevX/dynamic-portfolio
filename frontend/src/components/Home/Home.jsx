import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "../../App.css";
import { Backend_Root_Url } from "../../config/AdminUrl.json";
import {
  ArrowRight,
  Download,
  Code,
  Eye,
  Users,
  Star,
  ExternalLink,
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
          `${Backend_Root_Url}/api/home/main/data`
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

  const statsArray = MainHomeData?.Stats?.Stats || [
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
    "Invalide DataBase Connection Url Or Down ?? ",
    "AzizKammoun",
    "AzizDevX",
  ];
  const SlidesData = MainHomeData?.AboutUsSlides?.AboutUsSlides || [
    {
      slideTitle: "Backend Not Running",
      slideDescription:
        "No data available. Please follow the installation guide in the GitHub repo or open an issue if you need help.",
    },
    {
      slideTitle: "Setup Required",
      slideDescription:
        "Your backend is not connected. Check the The Guide On Github for setup instructions.",
    },
    {
      slideTitle: "Need Assistance?",
      slideDescription:
        "Visit our GitHub issues page to report problems : https://github.com/AzizDevX/dynamic-portfolio/issues or ask for AzizDevX The Owner Of Project For Help. ",
    },
  ];
  const SlidesIconsDir = `${Backend_Root_Url}/uploads/aboutimg/`;

  const featuredProjects = MainHomeData?.FeaturedProjects || [
    {
      _id: 1,
      Title: "E-Commerce Platform",
      Description:
        "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
      Image: "/api/placeholder/400/250",
      Project_technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      ProjectLink: "#",
    },

    {
      _id: 2,
      Title: "E-Commerce Platform",
      Description:
        "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
      Image: "/api/placeholder/400/250",
      Project_technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      ProjectLink: "#",
    },

    {
      _id: 3,
      Title: "E-Commerce Platform",
      Description:
        "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
      Image: "/api/placeholder/400/250",
      Project_technologies: ["React", "Node.js", "MongoDB", "Stripe"],
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
                <span>
                  {MainHomeData
                    ? MainHomeData.description
                    : "You Need To Complete Setup The Backend Or Your DataBase Not Connected"}
                </span>
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
                  <span>
                    {" "}
                    {MainHomeData
                      ? MainHomeData.Clients_Counting
                      : "NoData"}{" "}
                    Happy Clients
                  </span>
                </div>
                <div className={styles.socialProofItem}>
                  <Star size={20} />
                  <span>
                    {MainHomeData ? MainHomeData.Rateing : "NoData"} Rating
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.heroImage}>
              <div className={styles.imageContainer}>
                <img
                  src={developerPortrait}
                  alt="Home image "
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
            {statsArray.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statNumber}>
                  {MainHomeData ? stat.StatsNumber : "NoData"}
                </div>
                <div className={styles.statLabel}>
                  {MainHomeData
                    ? stat.StatsLabel
                    : "NoData So BackEnd Not Running Or incomplete Setup Of Backend"}
                </div>
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
                        <img src={SlideIcon}></img>
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
            {featuredProjects.map((project) => (
              <div key={project._id} className={styles.projectCard}>
                <div className={styles.projectImage}>
                  <div className={styles.projectImagePlaceholder}>
                    <Code size={48} />
                  </div>
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectActions}>
                      <a
                        target="_blank"
                        href={project.ProjectLink}
                        className={styles.projectAction}
                      >
                        <Eye size={20} />
                      </a>
                      <a
                        target="_blank"
                        href={project.ProjectLink}
                        className={styles.projectAction}
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles.projectContent}>
                  <h3 className={styles.projectTitle}>{project.Title}</h3>
                  <p className={styles.projectDescription}>
                    {project.Description}
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
            <a href="#projects" className={styles.viewAllButton}>
              View All Projects
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
