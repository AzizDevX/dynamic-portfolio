import React from "react";
import styles from "./SlideNavbar.module.css";
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
            <button
              key={section.id}
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ""
              }`}
              onClick={() => {
                setActiveSection(section.id);
                setMobileMenuOpen(false);
              }}
            >
              <Icon size={20} />
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <span>{section.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <LogOut size={20} />
          {(!sidebarCollapsed || mobileMenuOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SlideNavbar;

