import React, { useState, useEffect } from "react";
import styles from "./DashboardFooter.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import {
  Edit3,
  Save,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Mail,
  Twitch,
  Globe,
  Phone,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

const DashboardFooter = () => {
  // Authentication check
  // useEffect(() => {
  //   if (!verifyJWTToken()) {
  //     window.location.href = "/denied";
  //     return;
  //   }
  // }, []);

  // Available social icons
  const availableIcons = [
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "twitter", label: "Twitter", icon: Twitter },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "github", label: "GitHub", icon: Github },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "twitch", label: "Twitch", icon: Twitch },
    { id: "globe", label: "Globe", icon: Globe },
  ];

  // Footer state
  const [footerData, setFooterData] = useState({
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    socialLinks: [
      { id: 1, platform: "github", url: "https://github.com/johndoe" },
      { id: 2, platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
      { id: 3, platform: "twitter", url: "https://twitter.com/johndoe" },
    ],
  });

  // Slide panel state
  const [slidePanel, setSlidePanel] = useState({
    isOpen: false,
    type: "",
    data: null,
    title: "",
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: "",
    id: null,
    itemName: "",
  });

  // Form states for slide panel
  const [formData, setFormData] = useState({});

  // Slide panel functions
  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({
      isOpen: true,
      type,
      data,
      title,
    });

    if (data) {
      setFormData(data);
    } else {
      setFormData({});
    }
  };

  const closeSlidePanel = () => {
    setSlidePanel({
      isOpen: false,
      type: "",
      data: null,
      title: "",
    });
    setFormData({});
  };

  // Delete confirmation functions
  const openDeleteConfirmation = (type, id, itemName) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      itemName,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: "",
      id: null,
      itemName: "",
    });
  };

  const confirmDelete = () => {
    const { type, id } = deleteConfirmation;

    if (type === "socialLink") {
      setFooterData((prev) => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((link) => link.id !== id),
      }));
    }

    closeDeleteConfirmation();
  };

  // CRUD operations
  const handleSave = () => {
    const { type, data } = slidePanel;

    switch (type) {
      case "editContact":
        setFooterData((prev) => ({ ...prev, ...formData }));
        break;
      case "addSocialLink":
        const newLink = {
          id: Date.now(),
          ...formData,
        };
        setFooterData((prev) => ({
          ...prev,
          socialLinks: [...prev.socialLinks, newLink],
        }));
        break;
      case "editSocialLink":
        setFooterData((prev) => ({
          ...prev,
          socialLinks: prev.socialLinks.map((link) =>
            link.id === data.id ? { ...link, ...formData } : link
          ),
        }));
        break;
    }

    closeSlidePanel();
  };

  // Get icon component by platform
  const getIconComponent = (platform) => {
    const iconData = availableIcons.find((icon) => icon.id === platform);
    return iconData ? iconData.icon : Globe;
  };

  // Get platform label
  const getPlatformLabel = (platform) => {
    const iconData = availableIcons.find((icon) => icon.id === platform);
    return iconData ? iconData.label : platform;
  };

  // Render functions
  const renderDeleteConfirmation = () => {
    if (!deleteConfirmation.isOpen) return null;

    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h3>Confirm Delete</h3>
          <p>
            Are you sure you want to delete "{deleteConfirmation.itemName}"?
            This action cannot be undone.
          </p>
          <div className={styles.modalActions}>
            <button
              className={styles.btnSecondary}
              onClick={closeDeleteConfirmation}
            >
              Cancel
            </button>
            <button className={styles.btnDanger} onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSlidePanel = () => {
    if (!slidePanel.isOpen) return null;

    const { type, title } = slidePanel;

    return (
      <div className={styles.slidePanel}>
        <div className={styles.slidePanelHeader}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={closeSlidePanel}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.slidePanelContent}>
          {type === "editContact" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="City, State/Country"
                />
              </div>
            </div>
          )}

          {(type === "addSocialLink" || type === "editSocialLink") && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Platform</label>
                <select
                  value={formData.platform || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a platform</option>
                  {availableIcons.map((icon) => (
                    <option key={icon.id} value={icon.id}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>URL</label>
                <input
                  type="url"
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/profile"
                />
              </div>

              {formData.platform && (
                <div className={styles.previewSection}>
                  <label>Preview</label>
                  <div className={styles.socialPreview}>
                    {React.createElement(getIconComponent(formData.platform), {
                      size: 20,
                    })}
                    <span>{getPlatformLabel(formData.platform)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.footerSection}>
      <div className={styles.sectionHeader}>
        <h2>Footer Section</h2>
      </div>

      <div className={styles.grid}>
        {/* Contact Information Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Contact Information</h3>
            <button
              className={styles.btnSecondary}
              onClick={() =>
                openSlidePanel(
                  "editContact",
                  footerData,
                  "Edit Contact Information"
                )
              }
            >
              <Edit3 size={16} />
              Edit
            </button>
          </div>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={18} />
              <span>{footerData.email}</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={18} />
              <span>{footerData.phone}</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <span>{footerData.location}</span>
            </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Social Links</h3>
            <button
              className={styles.btnSecondary}
              onClick={() =>
                openSlidePanel("addSocialLink", null, "Add Social Link")
              }
            >
              <Plus size={16} />
              Add Link
            </button>
          </div>
          <div className={styles.socialLinks}>
            {footerData.socialLinks.map((link) => {
              const IconComponent = getIconComponent(link.platform);
              return (
                <div key={link.id} className={styles.socialLinkItem}>
                  <div className={styles.socialLinkInfo}>
                    <IconComponent size={20} />
                    <div className={styles.socialLinkDetails}>
                      <span className={styles.platform}>
                        {getPlatformLabel(link.platform)}
                      </span>
                      <span className={styles.url}>{link.url}</span>
                    </div>
                  </div>
                  <div className={styles.socialLinkActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() =>
                        openSlidePanel(
                          "editSocialLink",
                          link,
                          "Edit Social Link"
                        )
                      }
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() =>
                        openDeleteConfirmation(
                          "socialLink",
                          link.id,
                          getPlatformLabel(link.platform)
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardFooter;
