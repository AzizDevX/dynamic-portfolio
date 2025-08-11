import React from "react";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contact@portfolio.com", label: "Email" },
  ];

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "CV", href: "#cv" },
    { name: "Contact", href: "#contact" },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "contact@portfolio.com",
      href: "mailto:contact@portfolio.com",
    },
    { icon: Phone, text: "+216 1234567", href: "tel:+21651234567" },
    { icon: MapPin, text: "Tunisia, Tn", href: "#" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Portfolio</span>
              <span className={styles.logoDot}>.</span>
            </div>
            <p className={styles.brandDescription}>
              Crafting digital experiences with passion and precision. Let's
              build something amazing together.
            </p>
            <div className={styles.socialLinks}>
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linksList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className={styles.footerLink}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Get In Touch</h3>
            <div className={styles.contactList}>
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.href}
                    className={styles.contactItem}
                  >
                    <IconComponent size={18} />
                    <span>{contact.text}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterSection}>
            <h3 className={styles.sectionTitle}>Stay Updated</h3>
            <p className={styles.newsletterDescription}>
              Subscribe to get notified about new projects and updates.
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.emailInput}
              />
              <button className={styles.subscribeButton}>Subscribe</button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            <p>© {currentYear} Portfolio. All rights reserved.</p>
          </div>
          <div className={styles.madeWith}>
            <p>
              Made By <Heart size={16} className={styles.heartIcon} />
              <Link to="https://github.com/AzizDevX/dynamic-portfolio">
                AzizDevX
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
