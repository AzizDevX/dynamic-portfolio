import React, { useState, useEffect } from "react";
import styles from "./Dashboard_Restructured.module.css";
import { verifyJWTToken, logout } from "../utils/authUtils";
import SlideNavbar from "../slideNavBar/SlideNavbar";
import DashboardHome from "../Dashboardhome/DashboardHome";
import DashboardAbout from "../DashboardAbout/DashboardAbout";
import DashboardProjects from "../DashboardProjects/DashboardProjects";
import DashboardSkills from "../DashboardSkills/DashboardSkills";
import DashboardCV from "../DashboardCV/DashboardCV";
import DashboardFooter from "../DashboardFooter/DashboardFooter";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";
import "../../../../src/App.css";

import axios from "axios";

const Dashboard = () => {
  // Authentication state
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User data state
  const [userData, setUserData] = useState(null);

  // Navigation state
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to generate initials from display name
  const generateInitials = (displayName) => {
    if (!displayName) return "UN"; // Unknown User

    const words = displayName.trim().split(/\s+/);

    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words: take first letter of first 2 words
      return words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`,
          {
            withCredentials: true,
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      setIsAuthenticated(isValid);
      if (isValid === false) {
        navigate("/denied");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest(".sidebar")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Render top bar
  const renderTopBar = () => (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <button
          className={`${styles.mobileMenuBtn} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={20} />
        </button>
        <h1 className={styles.pageTitle}>{getSectionTitle(activeSection)}</h1>
      </div>
      <div className={styles.topBarRight}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {userData?.HomeLogo ? (
              <img
                src={`${Backend_Root_Url}/uploads/logo/${userData.HomeLogo}`}
                alt="User Avatar"
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={styles.avatarInitials}
              style={{ display: userData?.HomeLogo ? "none" : "flex" }}
            >
              {generateInitials(userData?.DisplayName)}
            </div>
          </div>
          <span className={styles.userName}>
            {userData?.DisplayName || "Unknown User"}
          </span>
        </div>
      </div>
    </div>
  );

  // Get section title
  const getSectionTitle = (sectionId) => {
    const sections = {
      home: "Home",
      about: "About",
      projects: "Projects",
      skills: "Skills",
      cv: "CV",
      footer: "Footer",
    };
    return sections[sectionId] || "Dashboard";
  };

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return <DashboardHome />;
      case "about":
        return <DashboardAbout />;
      case "projects":
        return <DashboardProjects />;
      case "skills":
        return <DashboardSkills />;
      case "cv":
        return <DashboardCV />;
      case "footer":
        return <DashboardFooter />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <SlideNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={handleLogout}
      />

      <div
        className={`${styles.mainContent} ${
          sidebarCollapsed ? styles.collapsed : ""
        }`}
      >
        {renderTopBar()}
        <div className={styles.content}>{renderActiveSection()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
