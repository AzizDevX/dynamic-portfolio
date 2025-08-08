import React, { useEffect, useState } from "react";
import styles from "./SlideNavbar.module.css";
import { useNavigate } from "react-router-dom";
import { verifyJWTToken } from "../utils/authUtils";

import {
  Home,
  User,
  Briefcase,
  FileText,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const SlideNavbar = ({
  activeSection,
  setActiveSection,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Track viewport changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = async (sectionId) => {
    try {
      const isValid = await verifyJWTToken();

      if (isValid === false) {
        navigate("/denied");
        return;
      }

      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("❌ JWT verification error:", error);
      console.log("🚨 Error details:", error.message, error.stack);
      navigate("/denied");
    }
  };

  // Universal click handler - handles ALL scenarios
  const handleUniversalClick = (sectionId) => {
    handleNavClick(sectionId);
  };

  // Navigation sections
  const sections = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Zap },
    { id: "cv", label: "CV", icon: FileText },
    { id: "footer", label: "Footer", icon: Settings },
  ];

  return (
    <div
      className={`${styles.sidebar} ${
        sidebarCollapsed ? styles.collapsed : ""
      } ${mobileMenuOpen ? styles.mobileOpen : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <Zap size={24} />
          {!sidebarCollapsed && <span>Portfolio Admin</span>}
        </div>
        <button
          className={`${styles.collapseBtn} ${styles.desktopOnly}`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu size={20} />
        </button>
        <button
          className={`${styles.collapseBtn} ${styles.mobileOnly}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUniversalClick(section.id);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleUniversalClick(section.id);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleUniversalClick(section.id);
              }}
              style={{
                cursor: "pointer",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "rgba(59, 130, 246, 0.2)",
                touchAction: "manipulation",
                position: "relative",
                zIndex: 10,
              }}
            >
              <Icon size={20} />
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <span>{section.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div
          className={styles.logoutBtn}
          onClick={onLogout}
          style={{
            cursor: "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <LogOut size={20} />
          {(!sidebarCollapsed || mobileMenuOpen) && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default SlideNavbar;
