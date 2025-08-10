import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardAbout.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Plus, Edit3, Trash2, Upload, Save, X, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.json";

const DashboardAbout = () => {
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

  // About section state
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${Backend_Root_Url}/api/home/main/data`,
          {
            withCredentials: true,
          }
        );

        // Extract About data from the response
        const data = response.data;
        setAboutData({
          title: data.AboutUs?.AboutUsTitle || "About Me",
          description: data.AboutUs?.AboutUsDescription || "Description here",
          skills: data.AboutUs?.AboutSkills || [],
          slides: data.AboutUsSlides?.AboutUsSlides || [],
        });

        console.log("About data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching about data:", error);
        setError("Failed to fetch about data. Please check your connection.");
        // Set fallback data when API is down
        setAboutData({
          title: "About Me",
          description:
            "With over 3 years of experience in web development, I specialize in creating modern, responsive web applications using cutting-edge technologies.",
          skills: [
            "React",
            "Node.js",
            "JavaScript",
            "TypeScript",
            "Python",
            "MongoDB",
            "PostgreSQL",
          ],
          slides: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

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
      if (type === "editAbout") {
        setFormData({
          AboutUsTitle: data.title || "",
          AboutUsDescription: data.description || "",
          AboutSkills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
        });
      } else if (type === "editSlide") {
        setFormData({
          slideTitle: data.slideTitle || "",
          slideDescription: data.slideDescription || "",
          slideImage: data.slideImage || "",
        });
      } else {
        setFormData(data);
      }
    } else {
      if (type === "addSlide") {
        setFormData({
          slideTitle: "",
          slideDescription: "",
          slideImage: "",
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

    if (type === "slide") {
      try {
        await axios.delete(
          `${Backend_Root_Url}/api/aboutslide/delete/slide/${id}`,
          {
            withCredentials: true,
          }
        );

        // Update local state
        setAboutData((prev) => ({
          ...prev,
          slides: prev.slides.filter((s) => s._id !== id),
        }));

        console.log("Slide deleted successfully");
      } catch (error) {
        console.error("Error deleting slide:", error);
        alert("Failed to delete slide. Please try again.");
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
        imageUrl: e.target.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // API operations
  const updateAboutData = async (data) => {
    try {
      const response = await axios.put(
        `${Backend_Root_Url}/api/about/edit/aboutdata`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating about data:", error);
      throw error;
    }
  };

  const addSlide = async (slideData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("slideTitle", slideData.slideTitle);
      formDataObj.append("slideDescription", slideData.slideDescription);
      formDataObj.append("image", slideData.imageFile);

      const response = await axios.post(
        `${Backend_Root_Url}/api/aboutslide/add/slide`,
        formDataObj,
        {
          params: {
            folder: "aboutimg",
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding slide:", error);
      throw error;
    }
  };

  const updateSlide = async (id, slideData) => {
    try {
      const formDataObj = new FormData();
      if (slideData.slideTitle)
        formDataObj.append("slideTitle", slideData.slideTitle);
      if (slideData.slideDescription)
        formDataObj.append("slideDescription", slideData.slideDescription);
      if (slideData.imageFile) formDataObj.append("image", slideData.imageFile);

      const response = await axios.put(
        `${Backend_Root_Url}/api/aboutslide/edit/slide/${id}`,
        formDataObj,
        {
          params: {
            folder: "aboutimg",
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating slide:", error);
      throw error;
    }
  };

  // CRUD operations
  const handleSave = async () => {
    const { type, data } = slidePanel;
    setSaving(true);

    try {
      switch (type) {
        case "editAbout":
          const aboutDataToUpdate = {
            AboutUsTitle: formData.AboutUsTitle,
            AboutUsDescription: formData.AboutUsDescription,
            AboutSkills: formData.AboutSkills
              ? formData.AboutSkills.split(",")
                  .map((skill) => skill.trim())
                  .filter((skill) => skill)
              : [],
          };

          await updateAboutData(aboutDataToUpdate);

          // Update local state
          setAboutData((prev) => ({
            ...prev,
            title: aboutDataToUpdate.AboutUsTitle,
            description: aboutDataToUpdate.AboutUsDescription,
            skills: aboutDataToUpdate.AboutSkills,
          }));

          console.log("About data updated successfully");
          break;

        case "addSlide":
          // Validate required fields for addSlide
          if (
            !formData.slideTitle ||
            !formData.slideDescription ||
            !formData.imageFile
          ) {
            alert("Slide Title, Slide Description, and Image are required.");
            setSaving(false);
            return;
          }

          const newSlideData = {
            slideTitle: formData.slideTitle,
            slideDescription: formData.slideDescription,
            imageFile: formData.imageFile,
          };

          await addSlide(newSlideData);

          // Refresh data from server to get the new slide with ID
          const response = await axios.get(
            `${Backend_Root_Url}/api/home/main/data`,
            {
              withCredentials: true,
            }
          );
          const updatedData = response.data;
          setAboutData((prev) => ({
            ...prev,
            slides: updatedData.AboutUsSlides?.AboutUsSlides || [],
          }));

          console.log("Slide added successfully");
          break;

        case "editSlide":
          const updatedSlideData = {
            slideTitle: formData.slideTitle,
            slideDescription: formData.slideDescription,
          };

          if (formData.imageFile) {
            updatedSlideData.imageFile = formData.imageFile;
          }

          const updateResponse = await updateSlide(data._id, updatedSlideData);

          // If image was uploaded, refresh the entire data from server to ensure we get the latest image
          if (formData.imageFile) {
            const refreshResponse = await axios.get(
              `${Backend_Root_Url}/api/home/main/data`,
              {
                withCredentials: true,
              }
            );
            const refreshedData = refreshResponse.data;
            setAboutData((prev) => ({
              ...prev,
              slides: refreshedData.AboutUsSlides?.AboutUsSlides || [],
            }));
          } else {
            // If no image was uploaded, just update the text fields
            setAboutData((prev) => ({
              ...prev,
              slides: prev.slides.map((s) =>
                s._id === data._id
                  ? {
                      ...s,
                      slideTitle: updatedSlideData.slideTitle || s.slideTitle,
                      slideDescription:
                        updatedSlideData.slideDescription || s.slideDescription,
                    }
                  : s
              ),
            }));
          }

          console.log("Slide updated successfully");
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
      <div className={styles.aboutSection}>
        <div className={styles.sectionHeader}>
          <h2>About Section</h2>
        </div>
        <div className={styles.loadingState}>
          <p>Loading about data...</p>
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
          {type === "editAbout" && (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={formData.AboutUsTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutUsTitle: e.target.value,
                    }))
                  }
                  placeholder="Section title"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.AboutUsDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutUsDescription: e.target.value,
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
                  value={formData.AboutSkills || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      AboutSkills: e.target.value,
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
                <label>
                  Title{" "}
                  {type === "addSlide" && (
                    <span className={styles.required}>*Required</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.slideTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slideTitle: e.target.value,
                    }))
                  }
                  placeholder="Slide title"
                  required={type === "addSlide"}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Description{" "}
                  {type === "addSlide" && (
                    <span className={styles.required}>*Required</span>
                  )}
                </label>
                <textarea
                  value={formData.slideDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slideDescription: e.target.value,
                    }))
                  }
                  placeholder="Slide description"
                  rows={3}
                  required={type === "addSlide"}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Image/Logo{" "}
                  {type === "addSlide" && (
                    <span className={styles.required}>*Required</span>
                  )}
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
                    </div>
                  ) : formData.slideImage && type === "editSlide" ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={`${Backend_Root_Url}/uploads/aboutimg/${formData.slideImage}`}
                        alt="Current slide"
                      />
                    </div>
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={24} />
                      <p>Click or drag image here</p>
                      {type === "addSlide" && (
                        <small>Image is required for slides</small>
                      )}
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
    <div className={styles.aboutSection}>
      <div className={styles.sectionHeader}>
        <h2>About Section</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
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
            <h4>{aboutData?.title || "About Me"}</h4>
            <p>{aboutData?.description || "Description here"}</p>
            <div className={styles.skillsList}>
              <h5>Skills:</h5>
              <div className={styles.tagList}>
                {(aboutData?.skills || []).map((skill, index) => (
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
            {(aboutData?.slides || []).length > 0 ? (
              aboutData.slides.map((slide) => (
                <div key={slide._id} className={styles.slideItem}>
                  <div className={styles.slideImage}>
                    {slide.slideImage ? (
                      <img
                        src={`${Backend_Root_Url}/uploads/aboutimg/${slide.slideImage}`}
                        alt={slide.slideTitle}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <Image size={20} />
                      </div>
                    )}
                  </div>
                  <div className={styles.slideContent}>
                    <h4>{slide.slideTitle}</h4>
                    <p>{slide.slideDescription}</p>
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
                        openDeleteConfirmation(
                          "slide",
                          slide._id,
                          slide.slideTitle
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
                <p>No slides available. Add some slides to get started.</p>
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

export default DashboardAbout;
