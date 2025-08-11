import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Github,
  Linkedin,
  Twitter,
  Globe,
} from "lucide-react";
import styles from "./Contact.module.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormStatus({ loading: true, success: false, error: null });

    try {
      // TODO: Replace with actual API call to backend
      // const response = await axios.post(`${Backend_Root_Url}/api/contact`, formData);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFormStatus({ loading: false, success: true, error: null });
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ loading: false, success: false, error: null });
      }, 5000);
    } catch (error) {
      setFormStatus({
        loading: false,
        success: false,
        error: "Failed to send message. Please try again later.",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@portfolio.com",
      href: "mailto:contact@portfolio.com",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+216 1234567",
      href: "tel:+21651234567",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Tunisia, TN",
      href: "#",
    },
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub", color: "#333" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "#0077b5" },
    { icon: Twitter, href: "#", label: "Twitter", color: "#1da1f2" },
    { icon: Globe, href: "#", label: "Website", color: "#3b82f6" },
  ];

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Section */}
          <section className={styles.headerSection}>
            <div className={styles.headerContent}>
              <span className={styles.greeting}>📧 Get In Touch</span>
              <h1 className={styles.title}>Contact Me</h1>
              <p className={styles.subtitle}>
                Have a project in mind or just want to say hello? I'd love to
                hear from you. Let's discuss how we can work together to bring
                your ideas to life.
              </p>
            </div>
          </section>

          {/* Contact Content */}
          <section className={styles.contactSection}>
            <div className={styles.contactGrid}>
              {/* Contact Form */}
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Send a Message</h2>
                  <p className={styles.formDescription}>
                    Fill out the form below and I'll get back to you as soon as
                    possible.
                  </p>
                </div>

                {formStatus.success && (
                  <div className={styles.successMessage}>
                    <CheckCircle size={20} />
                    <span>
                      Message sent successfully! I'll get back to you soon.
                    </span>
                  </div>
                )}

                {formStatus.error && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={20} />
                    <span>{formStatus.error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name" className={styles.label}>
                        <User size={18} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`${styles.input} ${
                          formErrors.name ? styles.inputError : ""
                        }`}
                        placeholder="Enter your full name"
                        disabled={formStatus.loading}
                      />
                      {formErrors.name && (
                        <span className={styles.errorText}>
                          {formErrors.name}
                        </span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email" className={styles.label}>
                        <Mail size={18} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`${styles.input} ${
                          formErrors.email ? styles.inputError : ""
                        }`}
                        placeholder="Enter your email address"
                        disabled={formStatus.loading}
                      />
                      {formErrors.email && (
                        <span className={styles.errorText}>
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="subject" className={styles.label}>
                      <MessageSquare size={18} />
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`${styles.input} ${
                        formErrors.subject ? styles.inputError : ""
                      }`}
                      placeholder="What's this about?"
                      disabled={formStatus.loading}
                    />
                    {formErrors.subject && (
                      <span className={styles.errorText}>
                        {formErrors.subject}
                      </span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="message" className={styles.label}>
                      <MessageSquare size={18} />
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`${styles.textarea} ${
                        formErrors.message ? styles.inputError : ""
                      }`}
                      placeholder="Tell me about your project or just say hello..."
                      rows="6"
                      disabled={formStatus.loading}
                    ></textarea>
                    {formErrors.message && (
                      <span className={styles.errorText}>
                        {formErrors.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`${styles.submitButton} ${
                      formStatus.loading ? styles.loading : ""
                    }`}
                    disabled={formStatus.loading}
                  >
                    {formStatus.loading ? (
                      <>
                        <div className={styles.spinner}></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className={styles.infoContainer}>
                <div className={styles.infoHeader}>
                  <h2 className={styles.infoTitle}>Let's Connect</h2>
                  <p className={styles.infoDescription}>
                    Prefer to reach out directly? Here are other ways to get in
                    touch with me.
                  </p>
                </div>

                <div className={styles.contactInfoList}>
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <a
                        key={index}
                        href={info.href}
                        className={styles.contactInfoItem}
                      >
                        <div className={styles.contactIcon}>
                          <IconComponent size={24} />
                        </div>
                        <div className={styles.contactDetails}>
                          <h3 className={styles.contactTitle}>{info.title}</h3>
                          <p className={styles.contactValue}>{info.value}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className={styles.socialSection}>
                  <h3 className={styles.socialTitle}>Follow Me</h3>
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
                          style={{ "--social-color": social.color }}
                        >
                          <IconComponent size={20} />
                        </a>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.responseTime}>
                  <div className={styles.responseIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.responseText}>
                    <h4>Quick Response</h4>
                    <p>I typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
