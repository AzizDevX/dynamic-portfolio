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

  const sortProjectsSmartly = useCallback((projectsList) => {
    return [...projectsList].sort((a, b) => {
      const orderA = a.DisplayOrder ?? 999999;
      const orderB = b.DisplayOrder ?? 999999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.projectId.localeCompare(b.projectId);
    });
  }, []);

  // Get next available position for new project (DisplayOrder)
  const getNextDisplayOrder = useCallback(() => {
    const projectsWithOrder = projects.filter((p) => p.DisplayOrder !== null);

    if (projectsWithOrder.length === 0) {
      return 0;
    }

    const maxOrder = Math.max(...projectsWithOrder.map((p) => p.DisplayOrder));
    return maxOrder + 1;
  }, [projects]);

  const getNextFeaturedDisplayOrder = useCallback(() => {
    const featuredProjects = projects.filter(
      (p) => p.featured === true && p.FeaturedDisplayOrder !== null
    );

    if (featuredProjects.length === 0) {
      return 0;
    }

    const maxOrder = Math.max(
      ...featuredProjects.map((p) => p.FeaturedDisplayOrder)
    );
    return maxOrder + 1;
  }, [projects]);

  const getValidPositionRange = useCallback(
    (currentProjectId = null) => {
      const projectsWithPositions = projects.filter(
        (p) => p.DisplayOrder !== null
      );

      if (projectsWithPositions.length === 0) {
        return { min: 1, max: 1, available: [1] };
      }

      const totalProjects = projectsWithPositions.length;

      const currentProject = projects.find(
        (p) => p.projectId === currentProjectId
      );
      const currentPositionDB = currentProject?.DisplayOrder;
      const currentPositionUser =
        currentPositionDB !== null && currentPositionDB !== undefined
          ? currentPositionDB + 1
          : null;

      const available = [];
      for (let i = 1; i <= totalProjects; i++) {
        if (i !== currentPositionUser) {
          available.push(i);
        }
      }

      return {
        min: 1,
        max: totalProjects,
        available: available,
        currentPosition: currentPositionUser,
      };
    },
    [projects]
  );

  const getValidFeaturedPositionRange = useCallback(
    (currentProjectId = null) => {
      const featuredProjects = projects.filter(
        (p) => p.featured === true && p.FeaturedDisplayOrder !== null
      );

      if (featuredProjects.length === 0) {
        return { min: 1, max: 1, available: [1] };
      }

      const totalFeatured = featuredProjects.length;

      const currentProject = projects.find(
        (p) => p.projectId === currentProjectId
      );
      const currentFeaturedPositionDB = currentProject?.FeaturedDisplayOrder;
      const currentFeaturedPositionUser =
        currentFeaturedPositionDB !== null &&
        currentFeaturedPositionDB !== undefined
          ? currentFeaturedPositionDB + 1
          : null;

      const available = [];
      for (let i = 1; i <= totalFeatured; i++) {
        if (i !== currentFeaturedPositionUser) {
          available.push(i);
        }
      }

      return {
        min: 1,
        max: totalFeatured,
        available: available,
        currentPosition: currentFeaturedPositionUser,
      };
    },
    [projects]
  );

  const validatePosition = useCallback(
    (userPosition, currentProjectId = null) => {
      if (
        userPosition === null ||
        userPosition === undefined ||
        userPosition === ""
      ) {
        return { valid: true, message: "" };
      }

      const posNum = parseInt(userPosition);

      if (isNaN(posNum) || posNum < 1) {
        return { valid: false, message: "Position must be 1 or higher" };
      }

      const { max, available, currentPosition } =
        getValidPositionRange(currentProjectId);

      if (posNum === currentPosition) {
        return { valid: true, message: "" };
      }

      if (posNum > max) {
        return {
          valid: false,
          message: `Position ${posNum} doesn't exist. You have ${max} project${
            max > 1 ? "s" : ""
          }`,
        };
      }

      if (!available.includes(posNum)) {
        return {
          valid: false,
          message: `Position ${posNum} is not available`,
        };
      }

      return { valid: true, message: "" };
    },
    [getValidPositionRange]
  );

  const validateFeaturedPosition = useCallback(
    (userPosition, currentProjectId = null) => {
      if (
        userPosition === null ||
        userPosition === undefined ||
        userPosition === ""
      ) {
        return { valid: true, message: "" };
      }

      const posNum = parseInt(userPosition);

      if (isNaN(posNum) || posNum < 1) {
        return {
          valid: false,
          message: "Featured position must be 1 or higher",
        };
      }

      const { max, available, currentPosition } =
        getValidFeaturedPositionRange(currentProjectId);

      if (posNum === currentPosition) {
        return { valid: true, message: "" };
      }

      if (posNum > max) {
        return {
          valid: false,
          message: `Featured position ${posNum} doesn't exist. You have ${max} featured project${
            max > 1 ? "s" : ""
          }`,
        };
      }

      if (!available.includes(posNum)) {
        return {
          valid: false,
          message: `Featured position ${posNum} is not available`,
        };
      }

      return { valid: true, message: "" };
    },
    [getValidFeaturedPositionRange]
  );

  const forceReorganizeDisplayOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${Backend_Root_Url}/api/show/projects`,
        { withCredentials: true }
      );

      const currentProjects = response.data.map((project) => ({
        projectId: project._id,
        title: project.Title,
        DisplayOrder: project.DisplayOrder ?? null,
      }));

      const projectsWithOrder = currentProjects
        .filter((p) => p.DisplayOrder !== null && p.DisplayOrder !== undefined)
        .sort((a, b) => a.DisplayOrder - b.DisplayOrder);

      if (projectsWithOrder.length === 0) {
        console.log("No projects with DisplayOrder to reorganize");
        return;
      }

      console.log(
        "FORCE reorganizing ALL DisplayOrder sequentially (0,1,2,3...)"
      );

      for (let index = 0; index < projectsWithOrder.length; index++) {
        const project = projectsWithOrder[index];

        if (project.DisplayOrder !== index) {
          console.log(
            `Updating ${project.title}: DisplayOrder ${project.DisplayOrder} -> ${index}`
          );

          await axios.put(
            `${Backend_Root_Url}/api/projects/edit/${project.projectId}?folder=projectsimg`,
            { DisplayOrder: index },
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      console.log("✅ All DisplayOrder reorganized successfully (0,1,2,3...)");
    } catch (err) {
      console.error("❌ Error reorganizing DisplayOrder:", err);
      throw err;
    }
  }, []);

  const forceReorganizeFeaturedDisplayOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        `${Backend_Root_Url}/api/show/projects`,
        { withCredentials: true }
      );

      const currentProjects = response.data.map((project) => ({
        projectId: project._id,
        title: project.Title,
        featured: project.Featured,
        FeaturedDisplayOrder: project.FeaturedDisplayOrder ?? null,
      }));

      const featuredProjects = currentProjects
        .filter(
          (p) =>
            p.featured === true &&
            p.FeaturedDisplayOrder !== null &&
            p.FeaturedDisplayOrder !== undefined
        )
        .sort((a, b) => a.FeaturedDisplayOrder - b.FeaturedDisplayOrder);

      if (featuredProjects.length === 0) {
        console.log("No featured projects to reorganize");
        return;
      }

      console.log(
        "FORCE reorganizing ALL FeaturedDisplayOrder sequentially (0,1,2,3...)"
      );

      for (let index = 0; index < featuredProjects.length; index++) {
        const project = featuredProjects[index];

        if (project.FeaturedDisplayOrder !== index) {
          console.log(
            `Updating ${project.title}: FeaturedDisplayOrder ${project.FeaturedDisplayOrder} -> ${index}`
          );

          await axios.put(
            `${Backend_Root_Url}/api/projects/edit/${project.projectId}?folder=projectsimg`,
            { FeaturedDisplayOrder: index },
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      console.log(
        "✅ All FeaturedDisplayOrder reorganized successfully (0,1,2,3...)"
      );
    } catch (err) {
      console.error("❌ Error reorganizing FeaturedDisplayOrder:", err);
      throw err;
    }
  }, []);

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
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^## (.*$)/gm, "<h3>$1</h3>")
      .replace(/^# (.*$)/gm, "<h2>$1</h2>")
      .replace(/^(?!\*\*)\* (.*$)/gm, "<li>$1</li>")
      .replace(/\n/g, "<br/>");

    formattedText = formattedText.replace(
      /(<li>.*?<\/li>)(<br\/>)*(<li>.*?<\/li>)*/gs,
      (match) => {
        const items = match.match(/<li>.*?<\/li>/g);
        return items ? `<ul>${items.join("")}</ul>` : match;
      }
    );

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
        replacement = before + selectedText + after;
        newCursorPos =
          start + before.length + selectedText.length + after.length;
      } else if (smartMode && !selectedText) {
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

  const handleBold = () => insertFormatting("**", "**", true);
  const handleItalic = () => insertFormatting("*", "*", true);
  const handleHeading = () => insertFormatting("## ", "", true);
  const handleList = () => insertFormatting("* ", "", true);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const value = textarea.value;

      const beforeCursor = value.substring(0, start);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      const listMatch = currentLine.match(/^(\s*\* )(.*)/);
      if (listMatch) {
        e.preventDefault();
        const indent = listMatch[1];
        const content = listMatch[2];

        if (content.trim() === "") {
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

  const insertTemplate = useCallback((template) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const templates = {
      dashboard: `## Project Name
A comprehensive dashboard built for [purpose], featuring:
* Feature 1 - Description here
* Feature 2 - Description here
* Feature 3 - Description here

Includes **modern design** and **responsive layout**.`,

      designer: `## BMW Poster Project
A high-end design project that includes:
* **Striking Visuals** - Sleek automotive photography and dynamic composition
* **Creative Typography** - Bold fonts and brand-aligned style
* **Color & Mood** - Premium color palette reflecting BMW elegance
* **Organized Layers** - Easy to modify and adapt for different formats

Crafted with precision, creativity, and attention to detail for a stunning brand showcase.`,

      mobile: `## Mobile Application
Cross-platform mobile app featuring:
* **Modern UI/UX** - Intuitive user interface
* **Performance** - Fast and responsive
* **Sync** - Real-time data synchronization

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

      const mappedProjects = response.data.map((project, index) => ({
        projectId: project._id || index + 1,
        title: project.Title,
        shortDescription: project.ShortDescription,
        description: project.Description,
        imageUrl:
          project.Image && project.Image !== "Nothing"
            ? `${Backend_Root_Url}/uploads/projectsimg/${project.Image}`
            : "",
        imageFile: null,
        technoligue: Array.isArray(project.Project_technologies)
          ? project.Project_technologies
          : [],
        projectStatus: project.Porject_Status,
        featured: project.Featured,
        liveUrl: project.ProjectLiveUrl || "",
        DisplayOrder: project.DisplayOrder ?? null,
        FeaturedDisplayOrder: project.FeaturedDisplayOrder ?? null,
      }));

      const sortedProjects = sortProjectsSmartly(mappedProjects);
      setProjects(sortedProjects);
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
  }, [sortProjectsSmartly]);

  const handleImageError = useCallback((projectId) => {
    setImageErrors((prev) => ({
      ...prev,
      [projectId]: true,
    }));
  }, []);

  const isValidImageUrl = useCallback((imageUrl) => {
    return (
      imageUrl &&
      imageUrl.trim() !== "" &&
      imageUrl !== "null" &&
      imageUrl !== "undefined"
    );
  }, []);

  const toggleDescription = useCallback((projectId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  }, []);

  const [slidePanel, setSlidePanel] = useState({
    isOpen: false,
    type: "",
    data: null,
    title: "",
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: "",
    id: null,
    itemName: "",
  });

  const [formData, setFormData] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fileInputRef = useRef(null);

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

    if (
      formData.DisplayOrderUser !== null &&
      formData.DisplayOrderUser !== undefined &&
      formData.DisplayOrderUser !== ""
    ) {
      const validation = validatePosition(
        formData.DisplayOrderUser,
        formData.projectId
      );
      if (!validation.valid) {
        errors.DisplayOrder = validation.message;
      }
    }

    if (formData.featured === true) {
      if (
        formData.FeaturedDisplayOrderUser !== null &&
        formData.FeaturedDisplayOrderUser !== undefined &&
        formData.FeaturedDisplayOrderUser !== ""
      ) {
        const validation = validateFeaturedPosition(
          formData.FeaturedDisplayOrderUser,
          formData.projectId
        );
        if (!validation.valid) {
          errors.FeaturedDisplayOrder = validation.message;
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validatePosition, validateFeaturedPosition]);

  const openSlidePanel = useCallback((type, data = null, title = "") => {
    setSlidePanel({
      isOpen: true,
      type,
      data,
      title,
    });

    if (data) {
      setFormData({
        ...data,
        technoligue:
          data.technoligue &&
          Array.isArray(data.technoligue) &&
          data.technoligue.length > 0
            ? data.technoligue.join(", ")
            : "",
        originalDisplayOrder: data.DisplayOrder,
        originalFeaturedDisplayOrder: data.FeaturedDisplayOrder,
        DisplayOrderUser:
          data.DisplayOrder !== null && data.DisplayOrder !== undefined
            ? data.DisplayOrder + 1
            : null,
        FeaturedDisplayOrderUser:
          data.FeaturedDisplayOrder !== null &&
          data.FeaturedDisplayOrder !== undefined
            ? data.FeaturedDisplayOrder + 1
            : null,
      });
    } else {
      setFormData({
        projectStatus: "",
        featured: false,
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
      const deletedProject = projects.find((p) => p.projectId === id);
      const wasFeatured = deletedProject?.featured;

      try {
        setLoading(true);

        await axios.delete(`${Backend_Root_Url}/api/projects/delete/${id}`, {
          withCredentials: true,
        });

        console.log("Project deleted successfully");

        await forceReorganizeDisplayOrders();

        if (wasFeatured) {
          console.log(
            "Deleted project was featured - reorganizing featured projects"
          );
          await forceReorganizeFeaturedDisplayOrders();
        }

        await loadProjects();
        setError(null);
      } catch (err) {
        setError("Failed to delete project");
        console.error("Error deleting project:", err);
        await loadProjects();
      } finally {
        setLoading(false);
      }
    }

    closeDeleteConfirmation();
  }, [
    deleteConfirmation,
    projects,
    loadProjects,
    closeDeleteConfirmation,
    forceReorganizeDisplayOrders,
    forceReorganizeFeaturedDisplayOrders,
  ]);

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

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const { type, data } = slidePanel;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      formDataToSend.append("Title", formData.title);
      formDataToSend.append("ShortDescription", formData.shortDescription);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("ProjectLiveUrl", formData.liveUrl || "");

      const technologies = formData.technoligue
        ? formData.technoligue
            .split(",")
            .map((tech) => tech.trim())
            .filter((tech) => tech)
        : [];

      technologies.forEach((tech) =>
        formDataToSend.append("Project_technologies[]", tech)
      );
      formDataToSend.append("Porject_Status", formData.projectStatus);
      formDataToSend.append("Featured", formData.featured || false);

      if (type === "addProject") {
        const nextOrder = getNextDisplayOrder();
        formDataToSend.append("DisplayOrder", nextOrder);
      } else if (type === "editProject") {
        if (
          formData.DisplayOrderUser !== null &&
          formData.DisplayOrderUser !== undefined &&
          formData.DisplayOrderUser !== ""
        ) {
          const dbPosition = parseInt(formData.DisplayOrderUser) - 1;
          formDataToSend.append("DisplayOrder", dbPosition);
        } else {
          formDataToSend.append("DisplayOrder", "");
        }
      }

      if (type === "addProject") {
        if (formData.featured === true) {
          const nextFeaturedOrder = getNextFeaturedDisplayOrder();
          formDataToSend.append("FeaturedDisplayOrder", nextFeaturedOrder);
        } else {
          formDataToSend.append("FeaturedDisplayOrder", "");
        }
      } else if (type === "editProject") {
        if (formData.featured === true) {
          if (
            formData.FeaturedDisplayOrderUser !== null &&
            formData.FeaturedDisplayOrderUser !== undefined &&
            formData.FeaturedDisplayOrderUser !== ""
          ) {
            const dbFeaturedPosition =
              parseInt(formData.FeaturedDisplayOrderUser) - 1;
            formDataToSend.append("FeaturedDisplayOrder", dbFeaturedPosition);
          } else {
            const nextFeaturedOrder = getNextFeaturedDisplayOrder();
            formDataToSend.append("FeaturedDisplayOrder", nextFeaturedOrder);
          }
        } else {
          formDataToSend.append("FeaturedDisplayOrder", "");
        }
      }

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
        const currentPositionDB = formData.originalDisplayOrder;
        const newPositionUser = formData.DisplayOrderUser;

        const currentFeaturedPositionDB = formData.originalFeaturedDisplayOrder;
        const newFeaturedPositionUser = formData.FeaturedDisplayOrderUser;
        const wasFeatured = data.featured;
        const isFeaturedNow = formData.featured;

        const needsDisplayOrderSwap =
          newPositionUser !== null &&
          newPositionUser !== undefined &&
          newPositionUser !== "" &&
          currentPositionDB !== null &&
          currentPositionDB !== undefined &&
          currentPositionDB !== parseInt(newPositionUser) - 1;

        const needsFeaturedSwap =
          isFeaturedNow &&
          wasFeatured &&
          newFeaturedPositionUser !== null &&
          newFeaturedPositionUser !== undefined &&
          newFeaturedPositionUser !== "" &&
          currentFeaturedPositionDB !== null &&
          currentFeaturedPositionDB !== undefined &&
          currentFeaturedPositionDB !== parseInt(newFeaturedPositionUser) - 1;

        if (needsDisplayOrderSwap) {
          const newPositionDB = parseInt(newPositionUser) - 1;
          const targetProject = projects.find(
            (p) => p.DisplayOrder === newPositionDB
          );

          if (targetProject && targetProject.projectId !== formData.projectId) {
            try {
              console.log(`DisplayOrder Swap: Step 1 - Move target to temp`);
              await axios.put(
                `${Backend_Root_Url}/api/projects/edit/${targetProject.projectId}?folder=projectsimg`,
                { DisplayOrder: -999 },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
            } catch (tempError) {
              console.error("Error moving to temp position:", tempError);
              throw new Error("Failed to prepare DisplayOrder swap");
            }

            console.log(`DisplayOrder Swap: Step 2 - Update current project`);
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

            try {
              console.log(
                `DisplayOrder Swap: Step 3 - Move target to old position`
              );
              await axios.put(
                `${Backend_Root_Url}/api/projects/edit/${targetProject.projectId}?folder=projectsimg`,
                { DisplayOrder: currentPositionDB },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
            } catch (swapError) {
              console.error("Error completing DisplayOrder swap:", swapError);
              await loadProjects();
              throw new Error(
                "DisplayOrder swap partially completed - please refresh"
              );
            }
          } else {
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
        } else {
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

        if (needsFeaturedSwap) {
          const newFeaturedPositionDB = parseInt(newFeaturedPositionUser) - 1;
          const targetFeaturedProject = projects.find(
            (p) =>
              p.featured === true &&
              p.FeaturedDisplayOrder === newFeaturedPositionDB
          );

          console.log("Featured Swap Debug:", {
            currentProjectId: formData.projectId,
            currentFeaturedPositionDB: currentFeaturedPositionDB,
            newFeaturedPositionDB: newFeaturedPositionDB,
            targetFeaturedProject: targetFeaturedProject
              ? targetFeaturedProject.projectId
              : "None",
          });

          if (
            targetFeaturedProject &&
            targetFeaturedProject.projectId !== formData.projectId
          ) {
            try {
              console.log(`Featured Swap: Step 1 - Move target to temp (-999)`);
              await axios.put(
                `${Backend_Root_Url}/api/projects/edit/${targetFeaturedProject.projectId}?folder=projectsimg`,
                { FeaturedDisplayOrder: -999 },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
            } catch (tempError) {
              console.error(
                "Error moving featured to temp position:",
                tempError
              );
              await loadProjects();
              throw new Error("Failed to prepare FeaturedDisplayOrder swap");
            }

            try {
              console.log(
                `Featured Swap: Step 2 - Move current project to new position (${newFeaturedPositionDB})`
              );
              await axios.put(
                `${Backend_Root_Url}/api/projects/edit/${data.projectId}?folder=projectsimg`,
                { FeaturedDisplayOrder: newFeaturedPositionDB },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
            } catch (updateError) {
              console.error(
                "Error updating current project featured position:",
                updateError
              );
              await loadProjects();
              throw new Error("Failed to update FeaturedDisplayOrder");
            }

            try {
              console.log(
                `Featured Swap: Step 3 - Move target to old position (${currentFeaturedPositionDB})`
              );
              await axios.put(
                `${Backend_Root_Url}/api/projects/edit/${targetFeaturedProject.projectId}?folder=projectsimg`,
                { FeaturedDisplayOrder: currentFeaturedPositionDB },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );
              console.log("Featured swap completed successfully!");
            } catch (swapError) {
              console.error(
                "Error completing FeaturedDisplayOrder swap:",
                swapError
              );
              await loadProjects();
              throw new Error(
                "FeaturedDisplayOrder swap partially completed - please refresh"
              );
            }
          }
        } else if (isFeaturedNow && !wasFeatured) {
          console.log("Newly featured project - no swap needed");
        } else if (!isFeaturedNow && wasFeatured) {
          console.log(
            "Project changed from featured to non-featured - reorganizing all featured projects"
          );
          await forceReorganizeFeaturedDisplayOrders();
        }
      }

      await loadProjects();
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
  }, [
    validateForm,
    slidePanel,
    formData,
    loadProjects,
    closeSlidePanel,
    getNextDisplayOrder,
    getNextFeaturedDisplayOrder,
    forceReorganizeFeaturedDisplayOrders,
    projects,
  ]);

  const toggleFeatured = useCallback(
    async (projectId) => {
      const project = projects.find((p) => p.projectId === projectId);
      if (!project || featuredLoading[projectId]) return;

      try {
        setFeaturedLoading((prev) => ({ ...prev, [projectId]: true }));

        const willBeFeatured = !project.featured;
        let featuredOrder;

        if (willBeFeatured) {
          featuredOrder = getNextFeaturedDisplayOrder();
          console.log(
            `Making project featured with FeaturedDisplayOrder: ${featuredOrder}`
          );
        } else {
          featuredOrder = null;
          console.log(
            "Unfeaturing project - setting FeaturedDisplayOrder to null"
          );
        }

        await axios.put(
          `${Backend_Root_Url}/api/projects/edit/${projectId}?folder=projectsimg`,
          {
            Featured: willBeFeatured,
            FeaturedDisplayOrder: featuredOrder,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Project featured status updated successfully");
        await forceReorganizeFeaturedDisplayOrders();
        await loadProjects();
        setError(null);
      } catch (err) {
        setError("Failed to update featured status");
        console.error("Error updating featured status:", err);
        console.error("Error details:", err.response?.data);
        await loadProjects();
      } finally {
        setFeaturedLoading((prev) => ({ ...prev, [projectId]: false }));
      }
    },
    [
      projects,
      loadProjects,
      featuredLoading,
      getNextFeaturedDisplayOrder,
      forceReorganizeFeaturedDisplayOrders,
    ]
  );

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

  const getPositionSuggestions = useCallback(() => {
    const { available } = getValidPositionRange(formData.projectId);
    return available;
  }, [getValidPositionRange, formData.projectId]);

  const getFeaturedPositionSuggestions = useCallback(() => {
    const { available } = getValidFeaturedPositionRange(formData.projectId);
    return available;
  }, [getValidFeaturedPositionRange, formData.projectId]);

  const renderSlidePanel = useCallback(() => {
    if (!slidePanel.isOpen) return null;

    const { type, title } = slidePanel;
    const positionSuggestions = getPositionSuggestions();
    const featuredPositionSuggestions = getFeaturedPositionSuggestions();

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
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleItalic}
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleHeading}
                      title="Heading"
                    >
                      <Hash size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.toolbarBtn}
                      onClick={handleList}
                      title="List"
                    >
                      <List size={16} />
                    </button>
                    <div className={styles.toolbarDivider}></div>

                    <div className={styles.templateDropdown}>
                      <button
                        type="button"
                        className={styles.templateBtn}
                        title="Quick Templates"
                      >
                        Templates
                      </button>
                      <div className={styles.templateMenu}>
                        <button
                          type="button"
                          onClick={() => insertTemplate("dashboard")}
                          className={styles.templateOption}
                        >
                          Dashboard Project
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTemplate("designer")}
                          className={styles.templateOption}
                        >
                          Designer project
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTemplate("mobile")}
                          className={styles.templateOption}
                        >
                          Mobile App
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
                      placeholder="Project description with smart formatting..."
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

              {type === "editProject" &&
                formData.originalDisplayOrder !== null &&
                formData.originalDisplayOrder !== undefined && (
                  <div className={styles.formGroup}>
                    <label>
                      Display Position (Swap with Another Project) For Main
                      Project Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.DisplayOrderUser ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            DisplayOrderUser: "",
                          }));
                          setFormErrors((prev) => ({
                            ...prev,
                            DisplayOrder: "Position is required",
                          }));
                          return;
                        }

                        const newPosition = parseInt(value);

                        if (isNaN(newPosition) || newPosition < 1) {
                          setFormErrors((prev) => ({
                            ...prev,
                            DisplayOrder:
                              "Position must be a number 1 or higher",
                          }));
                          return;
                        }

                        setFormData((prev) => ({
                          ...prev,
                          DisplayOrderUser: newPosition,
                        }));

                        const validation = validatePosition(
                          newPosition,
                          formData.projectId
                        );
                        if (!validation.valid) {
                          setFormErrors((prev) => ({
                            ...prev,
                            DisplayOrder: validation.message,
                          }));
                        } else {
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.DisplayOrder;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            DisplayOrderUser: prev.originalDisplayOrder + 1,
                          }));
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.DisplayOrder;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Enter position number (1 = first)"
                      className={`${styles.positionInput} ${
                        formErrors.DisplayOrder ? styles.errorInput : ""
                      }`}
                    />
                    {formErrors.DisplayOrder && (
                      <span className={styles.errorText}>
                        {formErrors.DisplayOrder}
                      </span>
                    )}
                    <small className={styles.helpText}>
                      Current position:{" "}
                      {formData.DisplayOrderUser !== null &&
                      formData.DisplayOrderUser !== undefined
                        ? `${formData.DisplayOrderUser}`
                        : "Not positioned (shows at end)"}
                    </small>
                    {positionSuggestions.length > 0 && (
                      <small
                        className={styles.helpText}
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#10b981",
                        }}
                      >
                        Available positions: {positionSuggestions.join(", ")}
                      </small>
                    )}
                    <small
                      className={styles.helpText}
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#fbbf24",
                      }}
                    >
                      Note: Changing position will automatically swap with the
                      project at your target position.
                    </small>
                  </div>
                )}

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

              {/* Featured Display Order - Only show if project is featured AND editing */}
              {type === "editProject" &&
                formData.featured === true &&
                formData.originalFeaturedDisplayOrder !== null &&
                formData.originalFeaturedDisplayOrder !== undefined && (
                  <div className={styles.formGroup}>
                    <label>
                      Featured Display Position (Swap with Another Featured
                      Project)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.FeaturedDisplayOrderUser ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            FeaturedDisplayOrderUser: "",
                          }));
                          setFormErrors((prev) => ({
                            ...prev,
                            FeaturedDisplayOrder:
                              "Featured position is required",
                          }));
                          return;
                        }

                        const newPosition = parseInt(value);

                        if (isNaN(newPosition) || newPosition < 1) {
                          setFormErrors((prev) => ({
                            ...prev,
                            FeaturedDisplayOrder:
                              "Featured position must be a number 1 or higher",
                          }));
                          return;
                        }

                        setFormData((prev) => ({
                          ...prev,
                          FeaturedDisplayOrderUser: newPosition,
                        }));

                        const validation = validateFeaturedPosition(
                          newPosition,
                          formData.projectId
                        );
                        if (!validation.valid) {
                          setFormErrors((prev) => ({
                            ...prev,
                            FeaturedDisplayOrder: validation.message,
                          }));
                        } else {
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.FeaturedDisplayOrder;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            FeaturedDisplayOrderUser:
                              prev.originalFeaturedDisplayOrder + 1,
                          }));
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.FeaturedDisplayOrder;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Enter featured position number (1 = first featured)"
                      className={`${styles.positionInput} ${
                        formErrors.FeaturedDisplayOrder ? styles.errorInput : ""
                      }`}
                    />
                    {formErrors.FeaturedDisplayOrder && (
                      <span className={styles.errorText}>
                        {formErrors.FeaturedDisplayOrder}
                      </span>
                    )}
                    <small className={styles.helpText}>
                      Current featured position:{" "}
                      {formData.FeaturedDisplayOrderUser !== null &&
                      formData.FeaturedDisplayOrderUser !== undefined
                        ? `${formData.FeaturedDisplayOrderUser}`
                        : "Not positioned"}
                    </small>
                    {featuredPositionSuggestions.length > 0 && (
                      <small
                        className={styles.helpText}
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#10b981",
                        }}
                      >
                        Available featured positions:{" "}
                        {featuredPositionSuggestions.join(", ")}
                      </small>
                    )}
                    <small
                      className={styles.helpText}
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#fbbf24",
                      }}
                    >
                      Note: Changing featured position will automatically swap
                      with the featured project at your target position.
                    </small>
                    <small
                      className={styles.helpText}
                      style={{ display: "block", marginTop: "2px" }}
                    >
                      Position 1 = first featured project, 2 = second featured,
                      etc.
                    </small>
                  </div>
                )}

              {type === "addProject" && (
                <div className={styles.infoBox}>
                  <p>
                    This project will be automatically added at the end of your
                    project list.{" "}
                    {formData.featured === true &&
                      "As a featured project, it will also be added at the end of your featured projects list. "}
                    You can change its position later by editing the project.
                  </p>
                </div>
              )}
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
    isValidImageUrl,
    getPositionSuggestions,
    getFeaturedPositionSuggestions,
    validatePosition,
    validateFeaturedPosition,
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
                  {project.DisplayOrder !== null &&
                    project.DisplayOrder !== undefined && (
                      <span className={styles.positionBadge}>
                        Projects Page | Project Position:{" "}
                        {project.DisplayOrder + 1}
                      </span>
                    )}
                  {project.featured &&
                    project.FeaturedDisplayOrder !== null &&
                    project.FeaturedDisplayOrder !== undefined && (
                      <span className={styles.FeaturedpositionBadge}>
                        Home Page | Featured Project Position:{" "}
                        {project.FeaturedDisplayOrder + 1}
                      </span>
                    )}
                </div>
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
