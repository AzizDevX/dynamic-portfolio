import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "projects" },
    { name: "Skills", href: "skills" },
    { name: "Full Cv", href: "cv" },
    { name: "Contact", href: "contact" },
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoText}>My Portfolio</span>
          <span className={styles.logoDot}>.</span>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navItems.map((item, index) => (
            <a key={index} href={item.href} className={styles.navLink}>
              {item.name}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className={styles.ctaContainer}>
          <a href="contact" className={styles.ctaButton}>
            Let's Talk
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`${styles.mobileNav} ${
          isMenuOpen ? styles.mobileNavOpen : ""
        }`}
      >
        <div className={styles.mobileNavContent}>
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <a
            href="#contact"
            className={styles.mobileCtaButton}
            onClick={() => setIsMenuOpen(false)}
          >
            Let's Talk
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
