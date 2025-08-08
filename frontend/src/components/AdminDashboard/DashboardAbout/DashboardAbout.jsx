import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardAbout.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Upload, Save, X, Image } from "lucide-react";

const DashboardAbout = () => {
  // Authentication check
  // useEffect(() => {
  //   if (!verifyJWTToken()) {
  //     window.location.href = "/denied";
  //     return;
  //   }
  // }, []);

  // About section state
  const [aboutData, setAboutData] = useState({
    title: "About Me",
    description:
      "With over 3 years of experience in web development, I specialize in creating modern, responsive web applications using cutting-edge technologies.",
    slides: [
      {
        id: 1,
        title: "Web Development",
        description:
          "Building responsive and performant web applications using modern frameworks",
        image: null,
      },
      {
        id: 2,
        title: "UI/UX Design",
        description:
          "Creating beautiful and intuitive user experiences that delight users",
        image: null,
      },
      {
        id: 3,
        title: "Performance Optimization",
        description:
          "Optimizing applications for speed, accessibility, and search engine visibility",
        image: null,
      },
    ],
    skills: [
      "React",
      "Node.js",
      "JavaScript",
      "TypeScript",
      "Python",
      "MongoDB",
      "PostgreSQL",
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
      if (type === "editAbout") {
        setFormData({
          ...data,
          skills: data.skills ? data.skills.join(", ") : "",
        });
      } else {
        setFormData(data);
      }
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

    if (type === "slide") {
      setAboutData((prev) => ({
        ...prev,
        slides: prev.slides.filter((s) => s.id !== id),
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

    // Validate image requirement for slides
    if ((type === "addSlide" || type === "editSlide") && !formData.imageUrl) {
      alert(
        "Image/logo upload is required for slides. Please upload an image before saving."
      );
      return;
    }

    switch (type) {
      case "editAbout":
        setAboutData((prev) => ({
          ...prev,
          ...formData,
          skills: formData.skills
            ? formData.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill)
            : [],
        }));
        break;
      case "addSlide":
        const newSlide = {
          id: Date.now(),
          ...formData,
          image: formData.imageUrl,
        };
        setAboutData((prev) => ({
          ...prev,
          slides: [...prev.slides, newSlide],
        }));
        break;
      case "editSlide":
        setAboutData((prev) => ({
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === data.id
              ? { ...s, ...formData, image: formData.imageUrl }
              : s
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
          {type === "editAbout" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Section title"
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
                  placeholder="About section description"
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      skills: e.target.value,
                    }))
                  }
                  placeholder="e.g., React, Node.js, JavaScript"
                />
              </div>
            </div>
          )}

          {(type === "addSlide" || type === "editSlide") && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Slide title"
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
                  placeholder="Slide description"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Image/Logo <span className={styles.required}>*Required</span>
                </label>
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
                      <img src={formData.imageUrl} alt="Slide preview" />
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
                      <small>Image is required for slides</small>
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
    <div className={styles.aboutSection}>
      <div className={styles.sectionHeader}>
        <h2>About Section</h2>
        <button
          className={styles.btnPrimary}
          onClick={() =>
            openSlidePanel("editAbout", aboutData, "Edit About Section")
          }
        >
          <Edit3 size={16} />
          Edit About
        </button>
      </div>

      <div className={styles.grid}>
        {/* About Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>About Information</h3>
          </div>
          <div className={styles.aboutInfo}>
            <h4>{aboutData.title}</h4>
            <p>{aboutData.description}</p>
            <div className={styles.skillsList}>
              <h5>Skills:</h5>
              <div className={styles.tagList}>
                {aboutData.skills.map((skill, index) => (
                  <span key={index} className={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slides Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>About Slides</h3>
            <button
              className={styles.btnSecondary}
              onClick={() => openSlidePanel("addSlide", null, "Add New Slide")}
            >
              <Plus size={16} />
              Add Slide
            </button>
          </div>
          <div className={styles.slidesList}>
            {aboutData.slides.map((slide) => (
              <div key={slide.id} className={styles.slideItem}>
                <div className={styles.slideImage}>
                  {slide.image ? (
                    <img src={slide.image} alt={slide.title} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <Image size={20} />
                    </div>
                  )}
                </div>
                <div className={styles.slideContent}>
                  <h4>{slide.title}</h4>
                  <p>{slide.description}</p>
                </div>
                <div className={styles.slideActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() =>
                      openSlidePanel("editSlide", slide, "Edit Slide")
                    }
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() =>
                      openDeleteConfirmation("slide", slide.id, slide.title)
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

export default DashboardAbout;
