import React, { useState, useEffect } from "react";
import styles from "./DashboardSkills.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.json";

const DashboardSkills = () => {
  //Authentication check
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      if (isValid === false) {
        navigate("/denied");
      } else {
        fetchSkills();
      }
    };
    checkAuth();
  }, [navigate]);

  // API Functions
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_Root_Url}/api/show/skills`, {
        withCredentials: true,
      });

      // Transform API data to match component structure
      const transformedData = response.data.SkillsData.map((skill) => ({
        id: skill._id,
        name: skill.SkillName,
        level: skill.Skill_Level,
        category: skill.Category,
      }));

      setSkillsData(transformedData);
      setError("");
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      setError("Failed to load skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillData) => {
    try {
      const response = await axios.post(
        `${Backend_Root_Url}/api/skills/add/skill`,
        {
          Category: skillData.category,
          SkillName: skillData.name,
          Skill_Level: parseInt(skillData.level),
        },
        {
          withCredentials: true,
        }
      );

      // Refresh skills after successful add
      await fetchSkills();
      return { success: true };
    } catch (error) {
      console.error("Failed to add skill:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add skill",
      };
    }
  };

  const editSkill = async (skillId, skillData) => {
    try {
      const updateData = {};
      if (skillData.category) updateData.Category = skillData.category;
      if (skillData.name) updateData.SkillName = skillData.name;
      if (skillData.level) updateData.Skill_Level = parseInt(skillData.level);

      const response = await axios.put(
        `${Backend_Root_Url}/api/skills/edit/skill/${skillId}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      // Refresh skills after successful edit
      await fetchSkills();
      return { success: true };
    } catch (error) {
      console.error("Failed to edit skill:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to edit skill",
      };
    }
  };

  const deleteSkill = async (skillId) => {
    try {
      const response = await axios.delete(
        `${Backend_Root_Url}/api/skills/delete/skill/${skillId}`,
        {
          withCredentials: true,
        }
      );

      // Refresh skills after successful delete
      await fetchSkills();
      return { success: true };
    } catch (error) {
      console.error("Failed to delete skill:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete skill",
      };
    }
  };

  // Skills state
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});

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
      setFormData({
        name: "",
        category: "",
        level: 50,
      });
    }

    // Clear validation errors when opening panel
    setValidationErrors({});
  };

  const closeSlidePanel = () => {
    setSlidePanel({
      isOpen: false,
      type: "",
      data: null,
      title: "",
    });
    setFormData({});
    setValidationErrors({});
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

    if (type === "skill") {
      const result = await deleteSkill(id);
      if (!result.success) {
        setError(result.error);
      }
    }

    closeDeleteConfirmation();
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Skill name is required";
    }

    if (!formData.category || formData.category.trim() === "") {
      errors.category = "Category is required";
    }

    if (!formData.level || formData.level < 1 || formData.level > 100) {
      errors.level = "Skill level must be between 1 and 100";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD operations
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const { type, data } = slidePanel;
    let result;

    switch (type) {
      case "addSkill":
        result = await addSkill(formData);
        break;
      case "editSkill":
        result = await editSkill(data.id, formData);
        break;
    }

    if (result && result.success) {
      closeSlidePanel();
    } else if (result && !result.success) {
      setError(result.error);
    }
  };

  // Group skills by category
  const groupedSkills = skillsData.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

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
          {(type === "addSkill" || type === "editSkill") && (
            <div className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <label>Skill Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., JavaScript, React"
                  className={validationErrors.name ? styles.inputError : ""}
                />
                {validationErrors.name && (
                  <span className={styles.errorText}>
                    {validationErrors.name}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g., Frontend, Backend, Database"
                  className={validationErrors.category ? styles.inputError : ""}
                />
                {validationErrors.category && (
                  <span className={styles.errorText}>
                    {validationErrors.category}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Skill Level ({formData.level || 50}%) *</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.level || 50}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  className={`${styles.rangeInput} ${
                    validationErrors.level ? styles.inputError : ""
                  }`}
                />
                <div className={styles.rangeLabels}>
                  <span>Beginner (1%)</span>
                  <span>Expert (100%)</span>
                </div>
                {validationErrors.level && (
                  <span className={styles.errorText}>
                    {validationErrors.level}
                  </span>
                )}
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
    <div className={styles.skillsSection}>
      <div className={styles.sectionHeader}>
        <h2>Skills</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => openSlidePanel("addSkill", null, "Add New Skill")}
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading skills...</div>
      ) : error && skillsData.length === 0 ? (
        <div className={styles.errorMessage}>
          {error}
          <button
            className={styles.btnSecondary}
            onClick={fetchSkills}
            style={{ marginLeft: "1rem" }}
          >
            Retry
          </button>
        </div>
      ) : skillsData.length === 0 ? (
        <div className={styles.emptyMessage}>
          No skills added yet. Click "Add Skill" to get started.
        </div>
      ) : (
        <div className={styles.skillsContainer}>
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.skillsGrid}>
                {skills.map((skill) => (
                  <div key={skill.id} className={styles.skillCard}>
                    <div className={styles.skillHeader}>
                      <div className={styles.skillInfo}>
                        <h4>{skill.name}</h4>
                        <span className={styles.skillCategory}>
                          {skill.category}
                        </span>
                      </div>
                      <div className={styles.skillActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() =>
                            openSlidePanel("editSkill", skill, "Edit Skill")
                          }
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() =>
                            openDeleteConfirmation(
                              "skill",
                              skill.id,
                              skill.name
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.skillLevel}>
                      <div className={styles.skillBar}>
                        <div
                          className={styles.skillProgress}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className={styles.skillPercentage}>
                        {skill.level}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardSkills;
