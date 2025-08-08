import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardProjects.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import {
  Plus,
  Edit3,
  Trash2,
  Star,
  Upload,
  Save,
  X,
  ExternalLink,
  Github,
  Image,
} from "lucide-react";

const DashboardProjects = () => {
  // Authentication check
  // useEffect(() => {
  //   if (!verifyJWTToken()) {
  //     window.location.href = "/denied";
  //     return;
  //   }
  // }, []);

  // Projects state
  const [projects, setProjects] = useState([
    {
      projectId: 1,
      title: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution with React frontend and Node.js backend, featuring real-time inventory management and payment processing.",
      imageUrl: "",
      imageFile: null,
      technoligue: ["React", "Node.js", "MongoDB", "Stripe"],
      featured: true,
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
    },
    {
      projectId: 2,
      title: "Task Management App",
      description:
        "A collaborative task management application with real-time updates and team collaboration features.",
      imageUrl: "",
      imageFile: null,
      technoligue: ["React", "Firebase", "Material-UI", "WebSocket"],
      featured: false,
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
    },
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
  const [dragActive, setDragActive] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState("");

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
      setFormData({
        ...data,
        technoligue: data.technoligue ? data.technoligue.join(", ") : "",
      });
    } else {
      setFormData({});
    }

    // Reset image upload method
    setImageUploadMethod("");
  };

  const closeSlidePanel = () => {
    setSlidePanel({
      isOpen: false,
      type: "",
      data: null,
      title: "",
    });
    setFormData({});
    setImageUploadMethod("");
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

    if (type === "project") {
      setProjects((prev) => prev.filter((p) => p.projectId !== id));
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
        imageUrl: e.target.result,
        imageFile: file,
      }));
      setImageUploadMethod("drop");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlInput = (url) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      imageFile: null,
    }));
    setImageUploadMethod("url");
  };

  const clearImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
      imageFile: null,
    }));
    setImageUploadMethod("");
  };

  // CRUD operations
  const handleSave = () => {
    const { type, data } = slidePanel;

    switch (type) {
      case "addProject":
        const newProject = {
          projectId: Date.now(),
          ...formData,
          technoligue: formData.technoligue
            ? formData.technoligue
                .split(",")
                .map((tech) => tech.trim())
                .filter((tech) => tech)
            : [],
          featured: formData.featured || false,
        };
        setProjects((prev) => [...prev, newProject]);
        break;
      case "editProject":
        setProjects((prev) =>
          prev.map((p) =>
            p.projectId === data.projectId
              ? {
                  ...p,
                  ...formData,
                  technoligue: formData.technoligue
                    ? formData.technoligue
                        .split(",")
                        .map((tech) => tech.trim())
                        .filter((tech) => tech)
                    : [],
                }
              : p
          )
        );
        break;
    }

    closeSlidePanel();
  };

  const toggleFeatured = (projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.projectId === projectId ? { ...p, featured: !p.featured } : p
      )
    );
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
          {(type === "addProject" || type === "editProject") && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Project Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter project title"
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
                  placeholder="Project description"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technoligue || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technoligue: e.target.value,
                    }))
                  }
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Live URL</label>
                <input
                  type="url"
                  value={formData.liveUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      liveUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      githubUrl: e.target.value,
                    }))
                  }
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Project Image</label>
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
                  {formData.imageUrl ? (
                    <div className={styles.imagePreview}>
                      <img src={formData.imageUrl} alt="Project preview" />
                      <button
                        className={styles.clearImageBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X size={16} />
                      </button>
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

              <div className={styles.formGroup}>
                <label>Or enter image URL</label>
                <input
                  type="url"
                  value={
                    imageUploadMethod === "url" ? formData.imageUrl || "" : ""
                  }
                  onChange={(e) => handleImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                  />
                  Featured Project
                </label>
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
    <div className={styles.projectsSection}>
      <div className={styles.sectionHeader}>
        <h2>Projects</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => openSlidePanel("addProject", null, "Add New Project")}
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <div key={project.projectId} className={styles.projectCard}>
            <div className={styles.projectImage}>
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.title} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Image size={32} />
                  <span>No Image</span>
                </div>
              )}
              {project.featured && (
                <div className={styles.featuredBadge}>
                  <Star size={12} />
                  Featured
                </div>
              )}
              <div className={styles.projectActions}>
                <button
                  className={`${styles.iconBtn} ${
                    project.featured ? styles.featured : ""
                  }`}
                  onClick={() => toggleFeatured(project.projectId)}
                  title="Toggle Featured"
                >
                  <Star size={16} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() =>
                    openSlidePanel("editProject", project, "Edit Project")
                  }
                  title="Edit Project"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() =>
                    openDeleteConfirmation(
                      "project",
                      project.projectId,
                      project.title
                    )
                  }
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className={styles.projectContent}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.techStack}>
                {project.technoligue.map((tech, index) => (
                  <span key={index} className={styles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
              <div className={styles.projectLinks}>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={14} />
                    Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={14} />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardProjects;
