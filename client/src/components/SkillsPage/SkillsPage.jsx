import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./SkillsPage.module.css";
import axios from "axios";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import "../../../src/App.css";

const SkillsPage = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${Backend_Root_Url}/api/show/skills`);

        // Transform API data to match component structure
        const apiSkills = response.data.SkillsData || [];

        // Group skills by category
        const groupedSkills = apiSkills.reduce((acc, skill) => {
          const category = skill.Category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({
            name: skill.SkillName,
            level: skill.Skill_Level,
          });
          return acc;
        }, {});

        // Convert to array format expected by component
        const formattedSkills = Object.entries(groupedSkills).map(
          ([category, skills]) => ({
            category,
            skills,
          })
        );

        setSkillsData(formattedSkills);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError("Failed to load skills data. Please try again later.");
      } finally {
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

  const calculateStats = () => {
    const totalSkills = skillsData.reduce(
      (total, category) => total + category.skills.length,
      0
    );
    const allSkills = skillsData.flatMap((category) => category.skills);
    const averageLevel =
      allSkills.length > 0
        ? Math.round(
            allSkills.reduce((sum, skill) => sum + skill.level, 0) /
              allSkills.length
          )
        : 0;
    const expertSkills = allSkills.filter((skill) => skill.level >= 75).length;
    const categories = skillsData.length;

    return { totalSkills, averageLevel, expertSkills, categories };
  };

  const stats = calculateStats();
  const retryFetch = () => {
    setError(null);
    window.location.reload();
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

  if (skillsData.length === 0) {
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
                  A comprehensive overview of my technical skills and
                  proficiency levels across various technologies and tools.
                </p>
              </div>
            </section>

            {/* No Skills Message */}
            <section className={styles.noSkillsSection}>
              <div className={styles.noSkillsContainer}>
                <div className={styles.noSkillsIcon}>
                  <svg
                    className={styles.calendarIcon}
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </div>
                <h3 className={styles.noSkillsTitle}>Skills Coming Soon!</h3>
                <p className={styles.noSkillsText}>
                  I'm currently building an amazing portfolio of skills and
                  technologies. Check back soon to see my expertise in action!
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
            </section>
          </div>
        </main>
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

          {/* Stats Section */}
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.totalSkills}</div>
                <div className={styles.statLabel}>Total Skills</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.categories}</div>
                <div className={styles.statLabel}>Categories</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.expertSkills}</div>
                <div className={styles.statLabel}>High-Level</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.averageLevel}%</div>
                <div className={styles.statLabel}>Average Level</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SkillsPage;
