import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./SkillsPage.module.css";
// import axios from 'axios'; // Uncomment when ready to use API

const SkillsPage = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder data structure - replace with API call later
  const placeholderSkills = [
    {
      category: "Frontend Development",
      skills: [
        { name: "React", level: 90 },
        { name: "JavaScript", level: 95 },
        { name: "HTML/CSS", level: 98 },
        { name: "TypeScript", level: 85 },
        { name: "Vue.js", level: 75 },
      ],
    },
    {
      category: "Backend Development",
      skills: [
        { name: "Node.js", level: 88 },
        { name: "Python", level: 92 },
        { name: "Express.js", level: 85 },
        { name: "MongoDB", level: 80 },
        { name: "PostgreSQL", level: 78 },
      ],
    },
    {
      category: "Design & Tools",
      skills: [
        { name: "Figma", level: 90 },
        { name: "Adobe Photoshop", level: 85 },
        { name: "Git/GitHub", level: 95 },
        { name: "Docker", level: 70 },
        { name: "AWS", level: 75 },
      ],
    },
    {
      category: "Mobile Development",
      skills: [
        { name: "React Native", level: 82 },
        { name: "Flutter", level: 70 },
        { name: "iOS Development", level: 65 },
        { name: "Android Development", level: 68 },
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call - replace with actual Axios call later
    const fetchSkills = async () => {
      try {
        setLoading(true);

        // TODO: Replace with actual API call
        // const response = await axios.get('YOUR_API_ENDPOINT');
        // setSkillsData(response.data);

        // Simulate loading delay
        setTimeout(() => {
          setSkillsData(placeholderSkills);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load skills data");
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const getSkillLevelColor = (level) => {
    if (level >= 90) return styles.expert;
    if (level >= 75) return styles.advanced;
    if (level >= 60) return styles.intermediate;
    return styles.beginner;
  };

  const getSkillLevelText = (level) => {
    if (level >= 90) return "Expert";
    if (level >= 75) return "Advanced";
    if (level >= 60) return "Intermediate";
    return "Beginner";
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading skills...</p>
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
              <span className={styles.greeting}>👋 My Expertise</span>
              <h1 className={styles.title}>Skills & Technologies</h1>
              <p className={styles.subtitle}>
                A comprehensive overview of my technical skills and proficiency
                levels across various technologies and tools.
              </p>
            </div>
          </section>

          {/* Skills Grid */}
          <section className={styles.skillsSection}>
            <div className={styles.skillsGrid}>
              {skillsData.map((category, categoryIndex) => (
                <div key={categoryIndex} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryTitle}>
                      {category.category}
                    </h3>
                    <div className={styles.categoryIcon}>
                      <span className={styles.iconNumber}>
                        {category.skills.length}
                      </span>
                    </div>
                  </div>

                  <div className={styles.skillsList}>
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className={styles.skillItem}>
                        <div className={styles.skillHeader}>
                          <span className={styles.skillName}>{skill.name}</span>
                          <div className={styles.skillLevel}>
                            <span
                              className={`${
                                styles.levelBadge
                              } ${getSkillLevelColor(skill.level)}`}
                            >
                              {getSkillLevelText(skill.level)}
                            </span>
                            <span className={styles.levelPercentage}>
                              {skill.level}%
                            </span>
                          </div>
                        </div>

                        <div className={styles.progressContainer}>
                          <div className={styles.progressBar}>
                            <div
                              className={`${
                                styles.progressFill
                              } ${getSkillLevelColor(skill.level)}`}
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SkillsPage;
