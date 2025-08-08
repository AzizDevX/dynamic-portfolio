import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardHome.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Upload, Save, X } from "lucide-react";

const DashboardHome = () => {
  // Authentication check
  // useEffect(() => {
  //   if (!verifyJWTToken()) {
  //     window.location.href = "/denied";
  //     return;
  //   }
  // }, []);

  // Home section state
  const [homeData, setHomeData] = useState({
    displayName: "John Doe",
    mainRoles: ["Full Stack Developer", "UI/UX Designer", "Tech Consultant"],
    description:
      "Passionate about creating digital solutions that make a difference",
    profileImage: null,
    clientsCounting: 50,
    rating: 4.9,
    stats: [
      { id: 1, statNumber: "50+", statLabel: "Happy Clients" },
      { id: 2, statNumber: "4.9", statLabel: "Rating" },
      { id: 3, statNumber: "100+", statLabel: "Projects" },
      { id: 4, statNumber: "3+", statLabel: "Years Experience" },
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
  const [dragActive, setDragActive] = useState(false);

  // File input refs
  const fileInputRef = useRef(null);

  // Slide panel functions
  const openSlidePanel = (type, data = null, title = "") => {
    setSlidePanel({
      isOpen: true,
      type,
      data,
      title,
    });

    // Initialize form data properly
    if (data) {
      if (type === "editHome") {
        setFormData({
          ...data,
          mainRoles: data.mainRoles ? data.mainRoles.join(", ") : "",
        });
      } else {
        setFormData(data);
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

  const confirmDelete = () => {
    const { type, id } = deleteConfirmation;

    if (type === "stat") {
      setHomeData((prev) => ({
        ...prev,
        stats: prev.stats.filter((s) => s.id !== id),
      }));
    }

    closeDeleteConfirmation();
  };

  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        profileImage: e.target.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // CRUD operations
  const handleSave = () => {
    const { type, data } = slidePanel;

    switch (type) {
      case "editHome":
        setHomeData((prev) => ({
          ...prev,
          ...formData,
          mainRoles: formData.mainRoles
            ? formData.mainRoles
                .split(",")
                .map((role) => role.trim())
                .filter((role) => role)
            : [],
        }));
        break;
      case "addStat":
        const newStat = {
          id: Date.now(),
          ...formData,
        };
        setHomeData((prev) => ({
          ...prev,
          stats: [...prev.stats, newStat],
        }));
        break;
      case "editStat":
        setHomeData((prev) => ({
          ...prev,
          stats: prev.stats.map((s) =>
            s.id === data.id ? { ...s, ...formData } : s
          ),
        }));
        break;
    }

    closeSlidePanel();
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
          {type === "editHome" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="Enter your display name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Main Roles (comma separated)</label>
                <input
                  type="text"
                  value={formData.mainRoles || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mainRoles: e.target.value,
                    }))
                  }
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description about yourself"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Profile Image</label>
                <div
                  className={`${styles.uploadArea} ${
                    dragActive ? styles.dragActive : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.profileImage ? (
                    <div className={styles.imagePreview}>
                      <img src={formData.profileImage} alt="Profile preview" />
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={24} />
                      <p>Click or drag image here</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          )}

          {(type === "addStat" || type === "editStat") && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Stat Number</label>
                <input
                  type="text"
                  value={formData.statNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., 50+, 4.9"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Stat Label</label>
                <input
                  type="text"
                  value={formData.statLabel || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      statLabel: e.target.value,
                    }))
                  }
                  placeholder="e.g., Happy Clients, Rating"
                />
              </div>
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
    <div className={styles.homeSection}>
      <div className={styles.sectionHeader}>
        <h2>Home Section</h2>
        <button
          className={styles.btnPrimary}
          onClick={() =>
            openSlidePanel("editHome", homeData, "Edit Home Section")
          }
        >
          <Edit3 size={16} />
          Edit Home
        </button>
      </div>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Profile Information</h3>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileImage}>
              {homeData.profileImage ? (
                <img src={homeData.profileImage} alt="Profile" />
              ) : (
                <div className={styles.profilePlaceholder}>
                  {homeData.displayName.charAt(0)}
                </div>
              )}
            </div>
            <div className={styles.profileDetails}>
              <h4>{homeData.displayName}</h4>
              <div className={styles.rolesList}>
                {homeData.mainRoles.map((role, index) => (
                  <span key={index} className={styles.roleTag}>
                    {role}
                  </span>
                ))}
              </div>
              <p>{homeData.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Statistics</h3>
            <button
              className={styles.btnSecondary}
              onClick={() =>
                openSlidePanel("addStat", null, "Add New Statistic")
              }
            >
              <Plus size={16} />
              Add Stat
            </button>
          </div>
          <div className={styles.statsList}>
            {homeData.stats.map((stat) => (
              <div key={stat.id} className={styles.statItem}>
                <div className={styles.statInfo}>
                  <div className={styles.statNumber}>{stat.statNumber}</div>
                  <div className={styles.statLabel}>{stat.statLabel}</div>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() =>
                      openSlidePanel("editStat", stat, "Edit Statistic")
                    }
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() =>
                      openDeleteConfirmation("stat", stat.id, stat.statLabel)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardHome;
