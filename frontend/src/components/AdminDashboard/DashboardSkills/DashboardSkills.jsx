import React, { useState, useEffect } from "react";
import styles from "./DashboardSkills.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardSkills = () => {
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

  // Skills state
  const [skillsData, setSkillsData] = useState([
    { id: 1, name: "JavaScript", level: 95, category: "Frontend" },
    { id: 2, name: "React", level: 90, category: "Frontend" },
    { id: 3, name: "Node.js", level: 85, category: "Backend" },
    { id: 4, name: "Python", level: 80, category: "Backend" },
    { id: 5, name: "TypeScript", level: 85, category: "Frontend" },
    { id: 6, name: "MongoDB", level: 75, category: "Database" },
    { id: 7, name: "PostgreSQL", level: 70, category: "Database" },
    { id: 8, name: "AWS", level: 65, category: "Cloud" },
  ]);

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

    if (type === "skill") {
      setSkillsData((prev) => prev.filter((s) => s.id !== id));
    }

    closeDeleteConfirmation();
  };

  // CRUD operations
  const handleSave = () => {
    const { type, data } = slidePanel;

    switch (type) {
      case "addSkill":
        const newSkill = {
          id: Date.now(),
          ...formData,
          level: parseInt(formData.level) || 50,
        };
        setSkillsData((prev) => [...prev, newSkill]);
        break;
      case "editSkill":
        setSkillsData((prev) =>
          prev.map((s) =>
            s.id === data.id
              ? {
                  ...s,
                  ...formData,
                  level: parseInt(formData.level) || s.level,
                }
              : s
          )
        );
        break;
    }

    closeSlidePanel();
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
              <div className={styles.formGroup}>
                <label>Skill Name</label>
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
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="">Select category</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Cloud">Cloud</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Skill Level ({formData.level || 50}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level || 50}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: e.target.value,
                    }))
                  }
                  className={styles.rangeInput}
                />
                <div className={styles.rangeLabels}>
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
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
                          openDeleteConfirmation("skill", skill.id, skill.name)
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

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardSkills;
