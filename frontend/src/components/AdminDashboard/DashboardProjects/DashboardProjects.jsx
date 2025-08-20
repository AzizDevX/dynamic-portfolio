import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import styles from "./DashboardProjects.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

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
  ImageOff,
  Bold,
  Italic,
  List,
  Hash,
  Eye,
  Edit,
} from "lucide-react";

const DashboardProjects = () => {
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

  // Projects state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [featuredLoading, setFeaturedLoading] = useState({});

  // Rich text editor state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const textareaRef = useRef(null);

  // Project status options
  const projectStatusOptions = useMemo(
    () => [
      "completed",
      "in progress",
      "planning",
      "planned",
      "on hold",
      "canceled",
      "prototype",
      "launched",
      "metrics",
      "awarded",
      "passed",
      "achievement",
      "archived",
    ],
    []
  );

  const getStatusClassName = useCallback((status) => {
    if (!status) return styles.statusDefault;

    const statusMap = {
      completed: styles.statusCompleted,
      "in progress": styles.statusInProgress,
      inprogress: styles.statusInProgress,
      planning: styles.statusPlanning,
      planned: styles.statusPlanned,
      "on hold": styles.statusOnHold,
      onhold: styles.statusOnHold,
      canceled: styles.statusCanceled,
      cancelled: styles.statusCanceled,
      prototype: styles.statusPrototype,
      launched: styles.statusLaunched,
      metrics: styles.statusMetrics,
      awarded: styles.statusAwarded,
      passed: styles.statusPassed,
      achievement: styles.statusAchievement,
      archived: styles.statusArchived,
    };

    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");
    return (
      statusMap[status.toLowerCase()] ||
      statusMap[normalizedStatus] ||
      styles.statusDefault
    );
  }, []);

  const formatDescription = useCallback((text, isFullView = false) => {
    if (!text) return "";

    let formattedText = text
      // Convert **text** to bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert *text* to italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert ## Heading to h3
      .replace(/^## (.*$)/gm, "<h3>$1</h3>")
      // Convert # Heading to h2
      .replace(/^# (.*$)/gm, "<h2>$1</h2>")
      // Convert * List items to li (but not ** bold)
      .replace(/^(?!\*\*)\* (.*$)/gm, "<li>$1</li>")
      // Convert line breaks to br tags
      .replace(/\n/g, "<br/>");

    // Wrap consecutive li elements in ul
    formattedText = formattedText.replace(
      /(<li>.*?<\/li>)(<br\/>)*(<li>.*?<\/li>)*/gs,
      (match) => {
        const items = match.match(/<li>.*?<\/li>/g);
        return items ? `<ul>${items.join("")}</ul>` : match;
      }
    );

    // Clean up extra br tags after lists and headings
    formattedText = formattedText
      .replace(/<\/(ul|h[23])><br\/>/g, "</$1>")
      .replace(/<br\/><(h[23]|ul)>/g, "<$1>");

    if (!isFullView) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formattedText;

      let charCount = 0;
      const truncateNode = (node) => {
        if (charCount >= 300) {
          return null;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const remaining = 300 - charCount;
          const text = node.textContent.slice(0, remaining);
          charCount += text.length;
          return document.createTextNode(text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          for (const child of node.childNodes) {
            const truncatedChild = truncateNode(child);
            if (truncatedChild) clone.appendChild(truncatedChild);
            if (charCount >= 100) break;
          }
          return clone;
        }
        return null;
      };

      const truncatedFragment = truncateNode(tempDiv);
      if (truncatedFragment) {
        const container = document.createElement("div");
        container.appendChild(truncatedFragment);
        container.innerHTML += "...";
        return container.innerHTML;
      }
    }

    return formattedText;
  }, []);

  // Rich text formatting functions with smart assistance
  const insertFormatting = useCallback(
    (before, after = "", smartMode = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let replacement;
      let newCursorPos;

      if (smartMode && selectedText) {
        // Smart mode: just wrap selected text
        replacement = before + selectedText + after;
        newCursorPos =
          start + before.length + selectedText.length + after.length;
      } else if (smartMode && !selectedText) {
        // Smart mode: insert placeholder text
        const placeholders = {
          "**": "Bold text",
          "*": "Italic text",
          "## ": "Heading text",
          "* ": "List item",
        };
        const placeholder = placeholders[before] || "text";
        replacement = before + placeholder + after;
        newCursorPos = start + before.length;
      } else {
        // Normal mode
        replacement = before + selectedText + after;
        newCursorPos = selectedText
          ? start + before.length + selectedText.length + after.length
          : start + before.length;
      }

      const newValue =
        textarea.value.substring(0, start) +
        replacement +
        textarea.value.substring(end);

      setFormData((prev) => ({
        ...prev,
        description: newValue,
      }));

      // Set cursor position after formatting
      setTimeout(() => {
        textarea.focus();
        if (smartMode && !selectedText) {
          const placeholderLength =
            replacement.length - before.length - after.length;
          textarea.setSelectionRange(
            start + before.length,
            start + before.length + placeholderLength
          );
        } else {
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    []
  );

  // Smart formatting functions
  const handleBold = () => insertFormatting("**", "**", true);
  const handleItalic = () => insertFormatting("*", "*", true);
  const handleHeading = () => insertFormatting("## ", "", true);
  const handleList = () => insertFormatting("* ", "", true);

  // Auto-format on Enter key for lists
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const value = textarea.value;

      // Find the current line
      const beforeCursor = value.substring(0, start);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check if current line is a list item
      const listMatch = currentLine.match(/^(\s*\* )(.*)/);
      if (listMatch) {
        e.preventDefault();
        const indent = listMatch[1];
        const content = listMatch[2];

        if (content.trim() === "") {
          // Empty list item, remove it and exit list mode
          const newValue =
            value.substring(0, start - currentLine.length) +
            value.substring(start);
          setFormData((prev) => ({
            ...prev,
            description: newValue,
          }));

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start - currentLine.length,
              start - currentLine.length
            );
          }, 0);
        } else {
          // Add new list item
          const newValue =
            value.substring(0, start) + "\n" + indent + value.substring(start);
          setFormData((prev) => ({
            ...prev,
            description: newValue,
          }));

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + 1 + indent.length,
              start + 1 + indent.length
            );
          }, 0);
        }
      }
    }
  }, []);

  // Insert quick templates
  const insertTemplate = useCallback((template) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const templates = {
      dashboard: `## 📊 Project Name
A comprehensive dashboard built for [purpose], featuring:
* 📈 **Feature 1** – Description here
* 📦 **Feature 2** – Description here
* 👥 **Feature 3** – Description here

✨ Includes **modern design** and **responsive layout**.`,

      designer: `## 🎨 BMW Poster Project
A high-end design project that includes:
* 🎯 **Striking Visuals** – Sleek automotive photography and dynamic composition
* ✏️ **Creative Typography** – Bold fonts and brand-aligned style
* 🖌️ **Color & Mood** – Premium color palette reflecting BMW elegance
* 🗂️ **Organized Layers** – Easy to modify and adapt for different formats

Crafted with precision, creativity, and attention to detail for a stunning brand showcase.`,

      mobile: `## 📱 Mobile Application
Cross-platform mobile app featuring:
* 🎨 **Modern UI/UX** – Intuitive user interface
* ⚡ **Performance** – Fast and responsive
* 🔄 **Sync** – Real-time data synchronization

Available for iOS and Android platforms.`,
    };

    const start = textarea.selectionStart;
    const template_text = templates[template] || "";

    const newValue =
      textarea.value.substring(0, start) +
      template_text +
      textarea.value.substring(start);

    setFormData((prev) => ({
      ...prev,
      description: newValue,
    }));

    setTimeout(() => {
      textarea.focus();
      const projectNameStart = start + template_text.indexOf("Project Name");
      const projectNameEnd = projectNameStart + "Project Name".length;
      textarea.setSelectionRange(projectNameStart, projectNameEnd);
    }, 0);
  }, []);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Backend_Root_Url}/api/show/projects`,
        {
          withCredentials: true,
        }
      );

      // Map backend data to frontend structure
      const mappedProjects = response.data.map((project, index) => ({
        projectId: project._id || index + 1, // Use MongoDB _id if available
        title: project.Title,
        shortDescription: project.ShortDescription,
        description: project.Description,
        imageUrl: project.Image
          ? `${Backend_Root_Url}/uploads/projectsimg/${project.Image}`
          : "",
        imageFile: null,
        technoligue: Array.isArray(project.Project_technologies)
          ? project.Project_technologies
          : [],
        projectStatus: project.Porject_Status,
        featured: project.Featured,
        liveUrl: project.ProjectLiveUrl || "",
      }));

      setProjects(mappedProjects);
      setError(null);
      setImageErrors({});
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProjects([]);
        setError(null);
      } else {
        setError("Failed to load projects");
        console.error("Error loading projects:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle image load errors
  const handleImageError = useCallback((projectId) => {
    setImageErrors((prev) => ({
      ...prev,
      [projectId]: true,
    }));
  }, []);

  // Helper function to check if image URL is valid and not empty
  const isValidImageUrl = useCallback((imageUrl) => {
    return (
      imageUrl &&
      imageUrl.trim() !== "" &&
      imageUrl !== "null" &&
      imageUrl !== "undefined"
    );
  }, []);

  // Toggle description expansion
  const toggleDescription = useCallback((projectId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
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
  const [formErrors, setFormErrors] = useState({});

  // File input refs
  const fileInputRef = useRef(null);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.shortDescription?.trim()) {
      errors.shortDescription = "Short Description is required";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.projectStatus) {
      errors.projectStatus = "Project Status is required";
    }

    if (
      formData.liveUrl &&
      !/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        formData.liveUrl
      )
    ) {
      errors.liveUrl = "Please enter a valid URL or IP address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Slide panel functions
  const openSlidePanel = useCallback((type, data = null, title = "") => {
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
        technoligue:
          data.technoligue &&
          Array.isArray(data.technoligue) &&
          data.technoligue.length > 0
            ? data.technoligue.join(", ")
            : "",
      });
    } else {
      setFormData({
        projectStatus: "",
      });
    }

    setFormErrors({});
    setIsPreviewMode(false);
  }, []);

  const closeSlidePanel = useCallback(() => {
    setSlidePanel({
      isOpen: false,
      type: "",
      data: null,
      title: "",
    });
    setFormData({});
    setFormErrors({});
    setIsPreviewMode(false);
  }, []);

  // Delete confirmation functions
  const openDeleteConfirmation = useCallback((type, id, itemName) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      itemName,
    });
  }, []);

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      type: "",
      id: null,
      itemName: "",
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    const { type, id } = deleteConfirmation;

    if (type === "project") {
      try {
        setLoading(true);
        await axios.delete(`${Backend_Root_Url}/api/projects/delete/${id}`, {
          withCredentials: true,
        });
        await loadProjects(); // Reload projects after deletion
        setError(null);
      } catch (err) {
        setError("Failed to delete project");
        console.error("Error deleting project:", err);
      } finally {
        setLoading(false);
      }
    }

    closeDeleteConfirmation();
  }, [deleteConfirmation, loadProjects, closeDeleteConfirmation]);

  // File upload handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = useCallback((file) => {
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
  }, []);

  const clearImage = useCallback(
    async (e) => {
      e.stopPropagation();

      const projectId = formData.projectId;

      if (projectId) {
        try {
          setLoading(true);
          await axios.put(
            `${Backend_Root_Url}/api/projects/image/remove/${projectId}`,
            {},
            { withCredentials: true }
          );
          setFormData((prev) => ({
            ...prev,
            imageUrl: "",
            imageFile: null,
          }));
          await loadProjects();
          setError(null);
        } catch (err) {
          setError("Failed to remove project image. Please try again.");
          console.error("Error removing project image:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          imageUrl: "",
          imageFile: null,
        }));
      }
    },
    [formData.projectId, loadProjects]
  );

  // CRUD operations
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const { type, data } = slidePanel;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Append all project data to FormData
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("ShortDescription", formData.shortDescription);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("ProjectLiveUrl", formData.liveUrl || "");

      // Process technologies - split by comma and trim whitespace
      const technologies = formData.technoligue
        ? formData.technoligue
            .split(",")
            .map((tech) => tech.trim()) // Just trim whitespace
            .filter((tech) => tech) // Remove empty strings
        : [];

      technologies.forEach((tech) =>
        formDataToSend.append("Project_technologies[]", tech)
      );
      formDataToSend.append("Porject_Status", formData.projectStatus);
      formDataToSend.append("Featured", formData.featured || false);

      // Append image file if exists
      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      if (type === "addProject") {
        await axios.post(
          `${Backend_Root_Url}/api/projects/add/project?folder=projectsimg`,
          formDataToSend,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else if (type === "editProject") {
        await axios.put(
          `${Backend_Root_Url}/api/projects/edit/${data.projectId}?folder=projectsimg`,
          formDataToSend,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      await loadProjects(); // Reload projects after save
      closeSlidePanel();
      setError(null);
    } catch (err) {
      setError(`Failed to ${type === "addProject" ? "add" : "edit"} project`);
      console.error(
        `Error ${type === "addProject" ? "adding" : "editing"} project:`,
        err
      );
    } finally {
      setLoading(false);
    }
  }, [validateForm, slidePanel, formData, loadProjects, closeSlidePanel]);

  const toggleFeatured = useCallback(
    async (projectId) => {
      const project = projects.find((p) => p.projectId === projectId);
      if (!project || featuredLoading[projectId]) return;

      try {
        setFeaturedLoading((prev) => ({ ...prev, [projectId]: true }));

        const updateData = {
          Featured: !project.featured,
        };

        await axios.put(
          `${Backend_Root_Url}/api/projects/edit/${projectId}?folder=projectsimg`,
          updateData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Reload projects to get fresh data from backend
        await loadProjects();
        setError(null);
      } catch (err) {
        setError("Failed to update featured status");
        console.error("Error updating featured status:", err);
      } finally {
        // Clear loading state for this specific project
        setFeaturedLoading((prev) => ({ ...prev, [projectId]: false }));
      }
    },
    [projects, loadProjects]
  );

  // Render functions
  const renderDeleteConfirmation = useCallback(() => {
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
  }, [deleteConfirmation, closeDeleteConfirmation, confirmDelete]);

  const renderSlidePanel = useCallback(() => {
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
                <label>Project Title *</label>
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
                  className={formErrors.title ? styles.errorInput : ""}
                />
                {formErrors.title && (
                  <span className={styles.errorText}>{formErrors.title}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Short Description *</label>
                <input
                  type="text"
                  value={formData.shortDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Enter short description"
                  className={
                    formErrors.shortDescription ? styles.errorInput : ""
                  }
                />
                {formErrors.shortDescription && (
                  <span className={styles.errorText}>
                    {formErrors.shortDescription}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <div className={styles.richTextContainer}>
                  <div className={styles.richTextToolbar}>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleBold}
                      title="Bold - Wraps selected text or adds placeholder"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleItalic}
                      title="Italic - Wraps selected text or adds placeholder"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleHeading}
                      title="Heading - Adds heading format"
                    >
                      <Hash size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleList}
                      title="List - Creates list item (Enter for new item)"
                    >
                      <List size={16} />
                    </button>
                    <div className={styles.toolbarDivider}></div>

                    {/* Quick Templates */}
                    <div className={styles.templateDropdown}>
                      <button
                        type="button"
                        className={styles.templateBtn}
                        title="Quick Templates"
                      >
                        📝 Templates
                      </button>
                      <div className={styles.templateMenu}>
                        <button
                          type="button"
                          onClick={() => insertTemplate("dashboard")}
                          className={styles.templateOption}
                        >
                          📊 Dashboard Project
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTemplate("designer")}
                          className={styles.templateOption}
                        >
                          🚀 Designer project
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTemplate("mobile")}
                          className={styles.templateOption}
                        >
                          📱 Mobile App
                        </button>
                      </div>
                    </div>

                    <div className={styles.toolbarDivider}></div>
                    <button
                      type="button"
                      className={`${styles.toolbarBtn} ${
                        isPreviewMode ? styles.active : ""
                      }`}
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      title="Toggle Preview"
                    >
                      {isPreviewMode ? <Edit size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {isPreviewMode ? (
                    <div
                      className={styles.richTextPreview}
                      dangerouslySetInnerHTML={{
                        __html: formatDescription(
                          formData.description || "",
                          true
                        ),
                      }}
                    />
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      onKeyDown={handleKeyDown}
                      placeholder={`Project description with smart formatting:

🎯 Click buttons above for easy formatting!
📝 Use templates for quick start!

Manual formatting:
## Main Heading
**Bold text** or *Italic text*
* List item (press Enter for new item)

Try selecting text and clicking format buttons! ✨`}
                      rows={12}
                      className={`${styles.richTextarea} ${
                        formErrors.description ? styles.errorInput : ""
                      }`}
                    />
                  )}
                </div>
                {formErrors.description && (
                  <span className={styles.errorText}>
                    {formErrors.description}
                  </span>
                )}
                <div className={styles.formattingHelp}>
                  <small>
                    💡 <strong>Smart Tips:</strong> • Select text and click
                    format buttons for instant formatting • Use templates for
                    quick project setup • Press Enter in lists to create new
                    items automatically • Click preview to see how it looks! ✨
                  </small>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Project Status *</label>
                <select
                  value={formData.projectStatus || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectStatus: e.target.value,
                    }))
                  }
                  className={formErrors.projectStatus ? styles.errorInput : ""}
                >
                  <option value="">Select project status</option>
                  {projectStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.projectStatus && (
                  <span className={styles.errorText}>
                    {formErrors.projectStatus}
                  </span>
                )}
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
                  className={formErrors.liveUrl ? styles.errorInput : ""}
                />
                {formErrors.liveUrl && (
                  <span className={styles.errorText}>{formErrors.liveUrl}</span>
                )}
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
                  {isValidImageUrl(formData.imageUrl) ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={formData.imageUrl}
                        alt="Project preview"
                        onError={(e) => {
                          e.target.style.display = "none";
                          setFormData((prev) => ({
                            ...prev,
                            imageUrl: "",
                          }));
                        }}
                      />
                      <button
                        type="button"
                        className={styles.clearImageBtn}
                        onClick={clearImage}
                      >
                        <X size={14} />
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
                <div className={styles.featuredToggle}>
                  <label className={styles.featuredLabel}>
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
                    <span className={styles.featuredSlider}></span>
                    <span className={styles.featuredText}>
                      Featured Project
                    </span>
                  </label>
                </div>
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
            disabled={loading}
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }, [
    slidePanel,
    formData,
    formErrors,
    projectStatusOptions,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileUpload,
    clearImage,
    closeSlidePanel,
    handleSave,
    loading,
    isPreviewMode,
    formatDescription,
    handleBold,
    handleItalic,
    handleHeading,
    handleList,
    insertTemplate,
    handleKeyDown,
  ]);

  if (loading && projects.length === 0) {
    return (
      <div className={styles.projectsSection}>
        <div className={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className={styles.projectsSection}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>Projects</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => openSlidePanel("addProject", null, "Add New Project")}
          disabled={loading}
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      <div className={styles.projectsGrid}>
        {projects.length === 0 ? (
          <div className={styles.emptyMessage}>
            <p>No Projects added yet. Click "Add Project" to get started.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.projectId} className={styles.projectCard}>
              <div className={styles.projectImage}>
                {project.imageUrl && !imageErrors[project.projectId] ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    onError={() => handleImageError(project.projectId)}
                  />
                ) : (
                  <div className={styles.imageNotAvailable}>
                    <ImageOff size={32} />
                    <span>Image Not Available</span>
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
                    } ${
                      featuredLoading[project.projectId] ? styles.loading : ""
                    }`}
                    onClick={() => toggleFeatured(project.projectId)}
                    title="Toggle Featured"
                    disabled={featuredLoading[project.projectId]}
                  >
                    <Star size={16} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() =>
                      openSlidePanel("editProject", project, "Edit Project")
                    }
                    title="Edit Project"
                    disabled={loading}
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
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.projectContent}>
                <h3>{project.title}</h3>
                <p className={styles.shortDescription}>
                  {project.shortDescription}
                </p>
                <div
                  className={`${styles.description} ${
                    expandedDescriptions[project.projectId]
                      ? styles.expanded
                      : ""
                  }`}
                >
                  <div
                    className={styles.descriptionContent}
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(
                        project.description,
                        expandedDescriptions[project.projectId]
                      ),
                    }}
                  />
                  {project.description && project.description.length > 50 && (
                    <button
                      className={styles.toggleDescription}
                      onClick={() => toggleDescription(project.projectId)}
                    >
                      {expandedDescriptions[project.projectId]
                        ? "Show Less"
                        : "Show More"}
                    </button>
                  )}
                </div>
                <div className={styles.projectMeta}>
                  <span
                    className={`${styles.statusBadge} ${getStatusClassName(
                      project.projectStatus
                    )}`}
                  >
                    {project.projectStatus}
                  </span>
                </div>
                {project.technoligue && project.technoligue.length > 0 && (
                  <div className={styles.techStack}>
                    {project.technoligue.map((tech, techIndex) => (
                      <span key={techIndex} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.projectLinks}>
                  {project.liveUrl && (
                    <a
                      href={
                        project.liveUrl.startsWith("http")
                          ? project.liveUrl
                          : `https://${project.liveUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.liveUrlBtn}
                    >
                      <ExternalLink size={16} />
                      Live URL
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {renderSlidePanel()}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default DashboardProjects;
