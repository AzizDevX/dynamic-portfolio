import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardHome.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Upload, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

const DashboardHome = () => {
  //Authentication check
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      if (isValid === false) {
        navigate("/denied");
      }
    };
    checkAuth();
  }, [navigate]);

  const [MainHomeData, setMainHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`
        );
        setMainHomeData(response.data);
        console.log("Home data fetched successfully:", response.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
        setError("Failed to fetch home data. Please check your connection.");
        // Set fallback data when API is down
        setMainHomeData({
          DisplayName: "Your Name",
          MainRoles: [
            "Full Stack Developer",
            "UI/UX Designer",
            "Tech Consultant",
          ],
          description:
            "Passionate about creating digital solutions that make a difference",
          HomeLogo: "default.png",
          Clients_Counting: 0,
          Rateing: 0,
          Stats: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Safe data extraction with fallbacks
  const statsArray = MainHomeData?.Stats || [];
  const HomeLogoImg = MainHomeData?.HomeLogo
    ? `${Backend_Root_Url}/uploads/logo/${MainHomeData.HomeLogo}`
    : null;

  const GetRoles = MainHomeData?.MainRoles
    ? Array.isArray(MainHomeData.MainRoles)
      ? MainHomeData.MainRoles
      : Object.values(MainHomeData.MainRoles)
    : [];

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
  const [saving, setSaving] = useState(false);

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
          DisplayName: data.DisplayName || "",
          MainRoles: Array.isArray(data.MainRoles)
            ? data.MainRoles.join(", ")
            : data.MainRoles
            ? Object.values(data.MainRoles).join(", ")
            : "",
          description: data.description || "",
          Clients_Counting: data.Clients_Counting || 0,
          Rateing: data.Rateing || 0,
          HomeLogo: data.HomeLogo || "",
        });
      } else if (type === "editStat") {
        setFormData({
          StatsNumber: data.StatsNumber || "",
          StatsLabel: data.StatsLabel || "",
        });
      } else {
        setFormData(data);
      }
    } else {
      if (type === "addStat") {
        setFormData({
          StatsNumber: "",
          StatsLabel: "",
        });
      } else {
        setFormData({});
      }
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
    setSaving(false);
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

    if (type === "stat") {
      try {
        await axios.delete(`${Backend_Root_Url}/api/home/delete/stat/${id}`, {
          withCredentials: true,
        });

        // Update local state
        setMainHomeData((prev) => ({
          ...prev,
          Stats: prev.Stats.filter((s) => s._id !== id),
        }));

        console.log("Stat deleted successfully");
      } catch (error) {
        console.error("Error deleting stat:", error);
        alert("Failed to delete stat. Please try again.");
      }
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
        HomeLogoImg: e.target.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // API operations
  const updateHomeLogo = async (file) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("image", file);

      const response = await axios.put(
        `${Backend_Root_Url}/api/home/update/logo?folder=logo`,
        formDataObj,
        {
          withCredentials: true,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.filename;
    } catch (error) {
      console.error("Error updating logo:", error);
      throw error;
    }
  };

  const updateHomeData = async (data) => {
    try {
      const response = await axios.put(
        `${Backend_Root_Url}/api/home/edit/homedata`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating home data:", error);
      throw error;
    }
  };

  const addStat = async (statData) => {
    try {
      const response = await axios.post(
        `${Backend_Root_Url}/api/home/add/stat`,
        statData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding stat:", error);
      throw error;
    }
  };

  const updateStat = async (id, statData) => {
    try {
      const response = await axios.put(
        `${Backend_Root_Url}/api/home/update/stat/${id}`,
        statData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating stat:", error);
      throw error;
    }
  };

  // CRUD operations
  const handleSave = async () => {
    const { type, data } = slidePanel;
    setSaving(true);

    try {
      switch (type) {
        case "editHome":
          // Handle logo upload if there's a new image
          let logoFilename = formData.HomeLogo;
          if (formData.imageFile) {
            logoFilename = await updateHomeLogo(formData.imageFile);
          }

          // Prepare data for API
          const homeDataToUpdate = {
            DisplayName: formData.DisplayName,
            MainRoles: formData.MainRoles
              ? formData.MainRoles.split(",")
                  .map((role) => role.trim())
                  .filter((role) => role)
              : [],
            description: formData.description,
            Clients_Counting: parseInt(formData.Clients_Counting) || 0,
            Rateing: parseFloat(formData.Rateing) || 0,
          };

          await updateHomeData(homeDataToUpdate);

          // Update local state
          setMainHomeData((prev) => ({
            ...prev,
            ...homeDataToUpdate,
            HomeLogo: logoFilename,
          }));

          console.log("Home data updated successfully");
          break;

        case "addStat":
          // Validate required fields for addStat
          if (!formData.StatsNumber || !formData.StatsLabel) {
            alert("Stat Number and Stat Label are required.");
            setSaving(false);
            return;
          }
          const newStatData = {
            StatsNumber: formData.StatsNumber,
            StatsLabel: formData.StatsLabel,
          };

          await addStat(newStatData);

          // Refresh data from server to get the new stat with ID
          const response = await axios.get(
            `${Backend_Root_Url}/api/home/main/data`
          );
          setMainHomeData(response.data);

          console.log("Stat added successfully");
          break;

        case "editStat":
          // Validate required fields for editStat
          if (!formData.StatsNumber || !formData.StatsLabel) {
            alert("Stat Number and Stat Label are required.");
            setSaving(false);
            return;
          }
          const updatedStatData = {
            StatsNumber: formData.StatsNumber,
            StatsLabel: formData.StatsLabel,
          };

          await updateStat(data._id, updatedStatData);

          // Update local state
          setMainHomeData((prev) => ({
            ...prev,
            Stats: prev.Stats.map((s) =>
              s._id === data._id ? { ...s, ...updatedStatData } : s
            ),
          }));

          console.log("Stat updated successfully");
          break;
      }

      closeSlidePanel();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.homeSection}>
        <div className={styles.sectionHeader}>
          <h2>Home Section</h2>
        </div>
        <div className={styles.loadingState}>
          <p>Loading home data...</p>
        </div>
      </div>
    );
  }

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
                  value={formData.DisplayName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      DisplayName: e.target.value,
                    }))
                  }
                  placeholder="Enter your display name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Main Roles (comma separated)</label>
                <input
                  type="text"
                  value={formData.MainRoles || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      MainRoles: e.target.value,
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
                <label>Clients Count</label>
                <input
                  type="number"
                  value={formData.Clients_Counting || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Clients_Counting: e.target.value,
                    }))
                  }
                  placeholder="Number of clients"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.Rateing || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Rateing: e.target.value,
                    }))
                  }
                  placeholder="Rating (0-5)"
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
                  {formData.HomeLogoImg ? (
                    <div className={styles.imagePreview}>
                      <img src={formData.HomeLogoImg} alt="Profile preview" />
                    </div>
                  ) : HomeLogoImg ? (
                    <div className={styles.imagePreview}>
                      <img src={HomeLogoImg} alt="Current profile" />
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
                  value={formData.StatsNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      StatsNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., 50+, 4.9"
                  required // Added required attribute
                />
              </div>

              <div className={styles.formGroup}>
                <label>Stat Label</label>
                <input
                  type="text"
                  value={formData.StatsLabel || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      StatsLabel: e.target.value,
                    }))
                  }
                  placeholder="e.g., Happy Clients, Rating"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.slidePanelFooter}>
          <button className={styles.btnSecondary} onClick={closeSlidePanel}>
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.homeSection}>
      <div className={styles.sectionHeader}>
        <h2>Home Section</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <button
          className={styles.btnPrimary}
          onClick={() =>
            openSlidePanel("editHome", MainHomeData, "Edit Home Section")
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
              {HomeLogoImg ? (
                <img src={HomeLogoImg} alt="Profile" />
              ) : (
                <div className={styles.profilePlaceholder}>
                  {MainHomeData?.DisplayName?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className={styles.profileDetails}>
              <h4>{MainHomeData?.DisplayName || "Your Name"}</h4>
              <div className={styles.rolesList}>
                {GetRoles.map((role, index) => (
                  <span key={index} className={styles.roleTag}>
                    {role}
                  </span>
                ))}
              </div>
              <p>{MainHomeData?.description || "Description Here"}</p>
              <div className={styles.additionalInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Clients:</span>
                  <span className={styles.infoValue}>
                    {MainHomeData?.Clients_Counting || 0}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Rating:</span>
                  <span className={styles.infoValue}>
                    {MainHomeData?.Rateing || 0}/5
                  </span>
                </div>
              </div>
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
            {statsArray.length > 0 ? (
              statsArray.map((stat) => (
                <div key={stat._id} className={styles.statItem}>
                  <div className={styles.statInfo}>
                    <div className={styles.statNumber}>{stat.StatsNumber}</div>
                    <div className={styles.statLabel}>{stat.StatsLabel}</div>
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
                        openDeleteConfirmation(
                          "stat",
                          stat._id,
                          stat.StatsLabel
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No statistics available. Add some stats to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardHome;
