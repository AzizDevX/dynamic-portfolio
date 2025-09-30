import React, { useState, useEffect } from "react";
import styles from "./DashboardFooter.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

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
  MessageCircle,
  Send,
  Palette,
  Briefcase,
  Share2,
  Music,
  Camera,
  Video,
  Users,
  Zap,
  Loader2,
} from "lucide-react";

// URL validation utility
const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;

  // Must start with protocol
  if (!/^https?:\/\//i.test(trimmedUrl)) return false;

  try {
    new URL(trimmedUrl); // Built-in validation
  } catch {
    return false;
  }

  // Regex for domain or IP
  const urlPattern =
    /^https?:\/\/((([a-z0-9-]+\.)+[a-z]{2,})|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[^\s]*)?$/i;
  return urlPattern.test(trimmedUrl);
};

// User-friendly messages
const getUrlValidationMessage = (url) => {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "Please enter a URL";
  }

  const originalUrl = url;
  url = url.trim();

  if (originalUrl !== url) {
    return "URL has leading or trailing spaces.";
  }

  if (/\s/.test(url)) {
    return "URL cannot contain spaces";
  }

  if (!/^https?:\/\//i.test(url)) {
    return "URL must start with http:// or https://";
  }

  // Support domains or IPv4
  const domainOrIpPattern =
    /^https?:\/\/((([a-z0-9-]+\.)+[a-z]{2,})|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[^\s]*)?$/i;
  if (!domainOrIpPattern.test(url)) {
    return "Please enter a valid domain or IP address (e.g., https://example.com or https://192.168.1.1)";
  }

  return "Valid URL";
};

const DashboardFooter = () => {
  //Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      if (isValid === false) {
        window.location.href = "/denied";
        return;
      }
    };
    checkAuth();
  }, []);

  // Available social icons (updated with all platforms)
  const availableIcons = [
    // Primary platforms
    { id: "Facebook", label: "Facebook", icon: Facebook },
    { id: "Twitter", label: "Twitter", icon: Twitter },
    { id: "Instagram", label: "Instagram", icon: Instagram },
    { id: "LinkedIn", label: "LinkedIn", icon: Linkedin },
    { id: "Github", label: "GitHub", icon: Github },
    { id: "Youtube", label: "YouTube", icon: Youtube },
    { id: "Mail", label: "Email", icon: Mail },
    { id: "Twitch", label: "Twitch", icon: Twitch },
    { id: "Globe", label: "Website", icon: Globe },

    // Additional platforms
    { id: "Discord", label: "Discord", icon: MessageCircle },
    { id: "Telegram", label: "Telegram", icon: Send },
    { id: "Pinterest", label: "Pinterest", icon: Palette },
    { id: "Fiverr", label: "Fiverr", icon: Briefcase },
    { id: "Reddit", label: "Reddit", icon: Share2 },
    { id: "TikTok", label: "TikTok", icon: Music },
    { id: "Snapchat", label: "Snapchat", icon: Camera },
    { id: "Vimeo", label: "Vimeo", icon: Video },
    { id: "WhatsApp", label: "WhatsApp", icon: MessageCircle },
    { id: "Slack", label: "Slack", icon: Users },
    { id: "Dribbble", label: "Dribbble", icon: Zap },
    { id: "Behance", label: "Behance", icon: Palette },
  ];

  // Footer state
  const [footerData, setFooterData] = useState({
    FooterTitle: "",
    FooterDescription: "",
    OwnerEmail: "",
    OwnerPhone: "",
    OwnerAddress: "",
    socialLinks: [],
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // URL validation state
  const [urlValidation, setUrlValidation] = useState({
    isValid: true,
    message: "",
  });

  // Fetch footer data from API
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`
        );
        const data = response.data;

        setFooterData({
          FooterTitle: data.FooterInfo?.FooterTitle || "",
          FooterDescription: data.FooterInfo?.FooterDescription || "",
          OwnerEmail: data.FooterInfo?.OwnerEmail || "",
          OwnerPhone: data.FooterInfo?.OwnerPhone || "",
          OwnerAddress: data.FooterInfo?.OwnerAddress || "",
          socialLinks: data.footersociallinks?.FooterSocialLinks || [],
        });
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Slide panel functions
  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({
      isOpen: true,
      type,
      data,
      title,
    });

    // Reset URL validation state
    setUrlValidation({
      isValid: true,
      message: "",
    });

    if (data) {
      if (type === "editContact") {
        setFormData({
          FooterTitle: footerData.FooterTitle,
          FooterDescription: footerData.FooterDescription,
          OwnerEmail: footerData.OwnerEmail,
          OwnerPhone: footerData.OwnerPhone,
          OwnerAddress: footerData.OwnerAddress,
        });
      } else {
        setFormData({
          SocialIcon: data.SocialIcon,
          SocialLink: data.SocialLink,
        });
        // Validate existing URL if editing
        if (data.SocialLink) {
          const isValid = isValidUrl(data.SocialLink);
          const message = getUrlValidationMessage(data.SocialLink);
          setUrlValidation({
            isValid,
            message,
          });
        }
      }
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

  const confirmDelete = async () => {
    const { type, id } = deleteConfirmation;

    if (type === "socialLink") {
      try {
        setSaving(true);
        await axios.delete(
          `${Backend_Root_Url}/api/footer/platform/delete/${id}`,
          {
            withCredentials: true,
          }
        );

        // Update local state
        setFooterData((prev) => ({
          ...prev,
          socialLinks: prev.socialLinks.filter((link) => link._id !== id),
        }));
      } catch (error) {
        console.error("Error deleting social link:", error);
        alert("Error deleting social link. Please try again.");
      } finally {
        setSaving(false);
      }
    }

    closeDeleteConfirmation();
  };

  // Handle URL validation
  const handleUrlChange = (url) => {
    setFormData((prev) => ({
      ...prev,
      SocialLink: url,
    }));

    // Validate URL in real-time
    const isValid = isValidUrl(url);
    const message = getUrlValidationMessage(url);

    setUrlValidation({
      isValid: message === "Valid URL" && url !== "",
      message: url === "" ? "" : message,
    });
  };

  // CRUD operations
  const handleSave = async () => {
    const { type, data } = slidePanel;

    // Validate URL before saving for social links
    if (type === "addSocialLink" || type === "editSocialLink") {
      if (!formData.SocialIcon) {
        alert("Please select a platform.");
        return;
      }
      if (!formData.SocialLink) {
        alert("Please enter a URL.");
        return;
      }
      const isValid = isValidUrl(formData.SocialLink);
      const message = getUrlValidationMessage(formData.SocialLink);

      if (message === "URL has leading or trailing spaces.") {
        setUrlValidation({
          isValid: false,
          message: message,
        });
        alert(`Invalid URL: ${message}`);
        return;
      }

      if (!isValid) {
        setUrlValidation({
          isValid: false,
          message: message,
        });
        alert(`Invalid URL: ${message}`);
        return;
      }
    }

    setSaving(true);

    try {
      switch (type) {
        case "editContact":
          await axios.put(
            `${Backend_Root_Url}/api/footer/edit/footerdata`,
            formData,
            {
              withCredentials: true,
            }
          );
          setFooterData((prev) => ({ ...prev, ...formData }));
          break;

        case "addSocialLink":
          await axios.post(
            `${Backend_Root_Url}/api/footer/platform/add`,
            formData,
            {
              withCredentials: true,
            }
          );
          // Refresh data after adding
          const response = await axios.get(
            `${Backend_Root_Url}/api/home/main/data`
          );
          const newData = response.data;
          setFooterData((prev) => ({
            ...prev,
            socialLinks: newData.footersociallinks?.FooterSocialLinks || [],
          }));
          break;

        case "editSocialLink":
          await axios.put(
            `${Backend_Root_Url}/api/footer/platform/edit/${data._id}`,
            formData,
            {
              withCredentials: true,
            }
          );
          setFooterData((prev) => ({
            ...prev,
            socialLinks: prev.socialLinks.map((link) =>
              link._id === data._id ? { ...link, ...formData } : link
            ),
          }));
          break;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
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
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className={styles.btnDanger}
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Delete"
              )}
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
                <label>Footer Title</label>
                <input
                  type="text"
                  value={formData.FooterTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      FooterTitle: e.target.value,
                    }))
                  }
                  placeholder="Portfolio"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Footer Description</label>
                <textarea
                  value={formData.FooterDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      FooterDescription: e.target.value,
                    }))
                  }
                  placeholder="Crafting digital experiences..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.OwnerEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      OwnerEmail: e.target.value,
                    }))
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.OwnerPhone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      OwnerPhone: e.target.value,
                    }))
                  }
                  placeholder="+216 5632212"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Address</label>
                <input
                  type="text"
                  value={formData.OwnerAddress || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      OwnerAddress: e.target.value,
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
                  value={formData.SocialIcon || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      SocialIcon: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select a platform
                  </option>
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
                  className={`${styles.urlInput} ${
                    urlValidation.isValid ? styles.valid : styles.invalid
                  }`}
                  value={formData.SocialLink || ""}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/profile"
                />
                {urlValidation.message && (
                  <div
                    className={`${styles.validationMessage} ${
                      urlValidation.isValid
                        ? styles.validMessage
                        : styles.invalidMessage
                    }`}
                  >
                    {urlValidation.message}
                  </div>
                )}
              </div>

              {formData.SocialIcon && (
                <div className={styles.previewSection}>
                  <label>Preview</label>
                  <div className={styles.socialPreview}>
                    {React.createElement(
                      getIconComponent(formData.SocialIcon),
                      {
                        size: 20,
                      }
                    )}
                    <span>{getPlatformLabel(formData.SocialIcon)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.slidePanelFooter}>
          <button
            className={styles.btnSecondary}
            onClick={closeSlidePanel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.footerSection}>
        <div className={styles.loadingContainer}>
          <Loader2 size={32} className="animate-spin" />
          <p>Loading footer data...</p>
        </div>
      </div>
    );
  }

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

          {/* Footer Title and Description Display - MOVED TO TOP */}
          <div className={styles.footerInfoDisplay}>
            <div className={styles.footerTitleDisplay}>
              <h4>Footer Title</h4>
              <p>{footerData.FooterTitle || "No title set"}</p>
            </div>
            <div className={styles.footerDescriptionDisplay}>
              <h4>Footer Description</h4>
              <p>{footerData.FooterDescription || "No description set"}</p>
            </div>
          </div>

          {/* Separator Line */}
          <div className={styles.separator}></div>

          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={20} />
              <span>{footerData.OwnerEmail || "No email set"}</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={20} />
              <span>{footerData.OwnerPhone || "No phone set"}</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin size={20} />
              <span>{footerData.OwnerAddress || "No address set"}</span>
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
            {footerData.socialLinks.length === 0 ? (
              <p className={styles.emptyState}>No social links added yet.</p>
            ) : (
              footerData.socialLinks.map((link) => {
                const IconComponent = getIconComponent(link.SocialIcon);
                return (
                  <div key={link._id} className={styles.socialLinkItem}>
                    <div className={styles.socialLinkInfo}>
                      <IconComponent size={20} />
                      <div className={styles.socialLinkDetails}>
                        <span className={styles.platform}>
                          {getPlatformLabel(link.SocialIcon)}
                        </span>
                        <span className={styles.url}>{link.SocialLink}</span>
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
                            link._id,
                            getPlatformLabel(link.SocialIcon)
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardFooter;
