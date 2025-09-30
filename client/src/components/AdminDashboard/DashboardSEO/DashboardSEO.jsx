import React, { useState, useEffect } from "react";
import styles from "./DashboardSEO.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Save, X, Globe, Search, Share2, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

const DashboardSEO = () => {
  // Authentication check
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

  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Page selection state
  const [selectedPage, setSelectedPage] = useState("static");

  // Form data state
  const [formData, setFormData] = useState({
    // Static SEO data
    static: {
      Author: "",
      WebsiteName: "",
      WebLogo: "",
      LangCode: "en",
      Lang: "English",
      CountryCode: "TN",
      City: "Tunisia",
      Geographic: "33.8869;9.5375",
      ICBM: "33.8869, 9.5375",
    },
    // Page-specific SEO data
    pages: {
      home: {
        Page: "home",
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
      },
      projects: {
        Page: "projects",
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
      },
      skills: {
        Page: "skills",
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
      },
      cv: {
        Page: "cv",
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
      },
      contact: {
        Page: "contact",
        Title: "",
        Description: "",
        Keywords: [],
        SocialTitle: "",
        SocialDescription: "",
        PageUrl: "",
        SocialImage: "",
        TwitterTitle: "",
        TwitterDescription: "",
        TwitterImage: "",
      },
    },
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Message state for styled notifications
  const [message, setMessage] = useState({
    type: "",
    text: "",
    visible: false,
  });

  // Page options for selection
  const pageOptions = [
    { value: "static", label: "Static Info", icon: Globe },
    { value: "home", label: "Home Page", icon: Search },
    { value: "projects", label: "Projects Page", icon: Search },
    { value: "skills", label: "Skills Page", icon: Search },
    { value: "cv", label: "Full CV Page", icon: Search },
    { value: "contact", label: "Contact Page", icon: Search },
  ];

  // Show styled message function
  const showMessage = (type, text) => {
    setMessage({ type, text, visible: true });
    setTimeout(() => {
      setMessage({ type: "", text: "", visible: false });
    }, 5000); // Hide after 5 seconds
  };

  // Fetch SEO data from API
  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch static info
        const staticResponse = await axios.get(
          `${Backend_Root_Url}/api/seo/static`,
          {
            withCredentials: true,
          }
        );

        // Fetch page-specific SEO data for all pages
        const pagePromises = Object.keys(formData.pages).map(async (page) => {
          try {
            const response = await axios.get(
              `${Backend_Root_Url}/api/seo/${page}`,
              {
                withCredentials: true,
              }
            );
            return { page, data: response.data };
          } catch (error) {
            console.error(`Error fetching SEO data for ${page}:`, error);
            return { page, data: formData.pages[page] }; // Use default if error
          }
        });

        const pageResults = await Promise.all(pagePromises);

        // Update form data with fetched data
        const updatedFormData = {
          static: {
            Author: staticResponse.data.Author || "",
            WebsiteName: staticResponse.data.WebsiteName || "",
            WebLogo: staticResponse.data.WebLogo || "",
            LangCode: staticResponse.data.LangCode || "en",
            Lang: staticResponse.data.Lang || "English",
            CountryCode: staticResponse.data.CountryCode || "TN",
            City: staticResponse.data.City || "Tunisia",
            Geographic: staticResponse.data.Geographic || "33.8869;9.5375",
            ICBM: staticResponse.data.ICBM || "33.8869, 9.5375",
          },
          pages: {},
        };

        // Process page data
        pageResults.forEach(({ page, data }) => {
          updatedFormData.pages[page] = {
            Page: data.Page || page,
            Title: data.Title || "",
            Description: data.Description || "",
            Keywords: Array.isArray(data.Keywords) ? data.Keywords : [],
            SocialTitle: data.SocialTitle || "",
            SocialDescription: data.SocialDescription || "",
            PageUrl: data.PageUrl || "",
            SocialImage: data.SocialImage || "",
            TwitterTitle: data.TwitterTitle || "",
            TwitterDescription: data.TwitterDescription || "",
            TwitterImage: data.TwitterImage || "",
          };
        });

        setFormData(updatedFormData);
        setSeoData(updatedFormData);
        console.log("SEO data fetched successfully");
      } catch (error) {
        console.error("Error fetching SEO data:", error);
        setError("Failed to fetch SEO data. Please check your connection.");
        // Use default data when API is not available
        setSeoData(formData);
      } finally {
        setLoading(false);
      }
    };

    fetchSeoData();
  }, []);

  // Validation functions
  const validateLanguageCode = (lang) => {
    if (!lang || lang.trim() === "") return true; // Allow empty fields
    return /^[a-z]{2}$/i.test(lang);
  };

  const validateGeoPosition = (position) => {
    if (!position || position.trim() === "") return true; // Allow empty fields
    const regex = /^-?\d+\.?\d*;-?\d+\.?\d*$/;
    return regex.test(position);
  };

  const validateICBM = (icbm) => {
    if (!icbm || icbm.trim() === "") return true; // Allow empty fields
    const regex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return regex.test(icbm);
  };

  const validateUrl = (url) => {
    if (!url || url.trim() === "") return true; // Allow empty fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateKeywords = (keywords) => {
    if (!keywords || keywords.trim() === "") return true; // Allow empty
    // Check if it contains commas (correct format)
    if (typeof keywords === "string") {
      // Split by comma and check that each keyword is valid (no periods)
      const keywordArray = keywords.split(",").map((k) => k.trim());
      // Check if any keyword contains periods (invalid)
      return !keywordArray.some((keyword) => keyword.includes("."));
    }
    return false;
  };

  // Handle input changes with validation
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear validation error when user starts typing
    if (validationErrors[`${section}.${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handlePageInputChange = (page, field, value) => {
    // Special handling for Keywords field
    if (field === "Keywords") {
      // Store the raw string value temporarily for display
      setFormData((prev) => ({
        ...prev,
        pages: {
          ...prev.pages,
          [page]: {
            ...prev.pages[page],
            // Store as string for input display
            KeywordsString: value,
            // Also update the array for API
            [field]: value
              ? value
                  .split(",")
                  .map((k) => k.trim())
                  .filter((k) => k.length > 0)
              : [],
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        pages: {
          ...prev.pages,
          [page]: {
            ...prev.pages[page],
            [field]: value,
          },
        },
      }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[`pages.${page}.${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`pages.${page}.${field}`];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate static data
    if (
      formData.static.LangCode &&
      !validateLanguageCode(formData.static.LangCode)
    ) {
      errors["static.LangCode"] =
        "Language code must be 2 letters (e.g., en, fr, ar)";
    }

    if (
      formData.static.Geographic &&
      !validateGeoPosition(formData.static.Geographic)
    ) {
      errors["static.Geographic"] =
        "Position must be in format: latitude;longitude (e.g., 40.7128;-74.0060)";
    }

    if (formData.static.ICBM && !validateICBM(formData.static.ICBM)) {
      errors["static.ICBM"] =
        "ICBM must be in format: latitude, longitude (e.g., 40.7128, -74.0060)";
    }

    // Validate WebLogo URL
    if (formData.static.WebLogo && !validateUrl(formData.static.WebLogo)) {
      errors["static.WebLogo"] = "Please enter a valid image URL";
    }

    // Validate page-specific data
    Object.keys(formData.pages).forEach((page) => {
      const pageData = formData.pages[page];

      // Title is required
      if (!pageData.Title || pageData.Title.trim() === "") {
        errors[`pages.${page}.Title`] = "Page Title is required";
      }

      // Validate Keywords format
      if (pageData.Keywords && pageData.Keywords.length > 0) {
        const keywordsString = pageData.Keywords.join(", ");
        if (!validateKeywords(keywordsString)) {
          errors[`pages.${page}.Keywords`] =
            "Keywords must be separated by commas, not periods. Example: web design, portfolio, developer";
        }
      }

      if (pageData.PageUrl && !validateUrl(pageData.PageUrl)) {
        errors[`pages.${page}.PageUrl`] = "Please enter a valid URL";
      }

      if (pageData.SocialImage && !validateUrl(pageData.SocialImage)) {
        errors[`pages.${page}.SocialImage`] = "Please enter a valid image URL";
      }

      if (pageData.TwitterImage && !validateUrl(pageData.TwitterImage)) {
        errors[`pages.${page}.TwitterImage`] = "Please enter a valid image URL";
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      showMessage("error", "Please fix the validation errors before saving.");
      return false;
    }

    return true;
  };

  // Save SEO data
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const results = {
      static: { success: false, error: null },
      pages: {},
    };

    // Save static info independently
    try {
      await axios.put(
        `${Backend_Root_Url}/api/edit/static/seo`,
        {
          Author: formData.static.Author,
          WebsiteName: formData.static.WebsiteName,
          WebLogo: formData.static.WebLogo,
          LangCode: formData.static.LangCode,
          Lang: formData.static.Lang,
          CountryCode: formData.static.CountryCode,
          City: formData.static.City,
          Geographic: formData.static.Geographic,
          ICBM: formData.static.ICBM,
        },
        {
          withCredentials: true,
        }
      );

      results.static.success = true;
    } catch (error) {
      console.error("Error saving static info:", error);
      results.static.error =
        error.response?.data?.message || "Failed to save static info";
    }

    // Save each page independently
    for (const page of Object.keys(formData.pages)) {
      try {
        const pageData = formData.pages[page];
        await axios.put(
          `${Backend_Root_Url}/api/edit/seo/${page}`,
          {
            Title: pageData.Title,
            Description: pageData.Description,
            Keywords: pageData.Keywords,
            SocialTitle: pageData.SocialTitle,
            SocialDescription: pageData.SocialDescription,
            PageUrl: pageData.PageUrl,
            SocialImage: pageData.SocialImage,
            TwitterTitle: pageData.TwitterTitle,
            TwitterDescription: pageData.TwitterDescription,
            TwitterImage: pageData.TwitterImage,
          },
          {
            withCredentials: true,
          }
        );

        results.pages[page] = { success: true, error: null };
      } catch (error) {
        console.error(`Error saving ${page} page SEO:`, error);
        results.pages[page] = {
          success: false,
          error:
            error.response?.data?.message || `Failed to save ${page} page SEO`,
        };
      }
    }

    // Generate summary messages
    const successfulOperations = [];
    const failedOperations = [];

    if (results.static.success) {
      successfulOperations.push("Static Info");
    } else if (results.static.error) {
      failedOperations.push(`Static Info: ${results.static.error}`);
    }

    Object.keys(results.pages).forEach((page) => {
      if (results.pages[page].success) {
        successfulOperations.push(
          `${page.charAt(0).toUpperCase() + page.slice(1)} Page`
        );
      } else if (results.pages[page].error) {
        failedOperations.push(
          `${page.charAt(0).toUpperCase() + page.slice(1)} Page: ${
            results.pages[page].error
          }`
        );
      }
    });

    // Show appropriate messages
    if (successfulOperations.length > 0) {
      showMessage("success", `Successfully saved`);
    }

    if (failedOperations.length > 0) {
      showMessage("error", `Failed to save: ${failedOperations.join("; ")}`);
    }

    if (successfulOperations.length === 0 && failedOperations.length === 0) {
      showMessage("warning", "No operations were performed");
    }

    setSaving(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.seoSection}>
        <div className={styles.sectionHeader}>
          <h2>SEO Section</h2>
        </div>
        <div className={styles.loadingState}>
          <p>Loading SEO data...</p>
        </div>
      </div>
    );
  }

  // Render static SEO form
  const renderStaticForm = () => (
    <div className={styles.form}>
      <div className={styles.formSection}>
        <h4>
          <Globe size={18} /> Website Information
        </h4>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Author</label>
            <input
              type="text"
              value={formData.static.Author}
              onChange={(e) =>
                handleInputChange("static", "Author", e.target.value)
              }
              placeholder="Your name or brand"
            />
            <small>
              Your name or brand name. This will be used across all pages.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>Website Name</label>
            <input
              type="text"
              value={formData.static.WebsiteName}
              onChange={(e) =>
                handleInputChange("static", "WebsiteName", e.target.value)
              }
              placeholder="Your Website Name"
            />
            <small>
              Name of your website or brand. This will be used across all pages.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>Website Logo (Tab Icon)</label>
            <input
              type="url"
              value={formData.static.WebLogo}
              onChange={(e) =>
                handleInputChange("static", "WebLogo", e.target.value)
              }
              placeholder="https://yourwebsite.com/logo.png"
              className={validationErrors["static.WebLogo"] ? styles.error : ""}
            />
            {validationErrors["static.WebLogo"] && (
              <span className={styles.errorText}>
                {validationErrors["static.WebLogo"]}
              </span>
            )}
            <small>
              Direct image URL for your website's tab icon/favicon. Must be a
              direct link to an image file (.png, .jpg, .ico recommended).
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>Language Code</label>
            <input
              type="text"
              value={formData.static.LangCode}
              onChange={(e) =>
                handleInputChange("static", "LangCode", e.target.value)
              }
              placeholder="en, fr, ar, etc."
              maxLength={2}
              className={
                validationErrors["static.LangCode"] ? styles.error : ""
              }
            />
            {validationErrors["static.LangCode"] && (
              <span className={styles.errorText}>
                {validationErrors["static.LangCode"]}
              </span>
            )}
            <small>
              2-letter language code (e.g., en for English, fr for French).
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>Language Name</label>
            <input
              type="text"
              value={formData.static.Lang}
              onChange={(e) =>
                handleInputChange("static", "Lang", e.target.value)
              }
              placeholder="English, French, Arabic, etc."
            />
            <small>Full language name for search engines.</small>
          </div>

          <div className={styles.formGroup}>
            <label>Country Code</label>
            <input
              type="text"
              value={formData.static.CountryCode}
              onChange={(e) =>
                handleInputChange("static", "CountryCode", e.target.value)
              }
              placeholder="US, FR, TN, etc."
            />
            <small>2-letter country code.</small>
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              value={formData.static.City}
              onChange={(e) =>
                handleInputChange("static", "City", e.target.value)
              }
              placeholder="New York, Paris, Tunis, etc."
            />
            <small>City or location name.</small>
          </div>

          <div className={styles.formGroup}>
            <label>Geographic Position</label>
            <input
              type="text"
              value={formData.static.Geographic}
              onChange={(e) =>
                handleInputChange("static", "Geographic", e.target.value)
              }
              placeholder="40.7128;-74.0060"
              className={
                validationErrors["static.Geographic"] ? styles.error : ""
              }
            />
            {validationErrors["static.Geographic"] && (
              <span className={styles.errorText}>
                {validationErrors["static.Geographic"]}
              </span>
            )}
            <small>Latitude;Longitude format (use semicolon).</small>
          </div>

          <div className={styles.formGroup}>
            <label>ICBM Coordinates</label>
            <input
              type="text"
              value={formData.static.ICBM}
              onChange={(e) =>
                handleInputChange("static", "ICBM", e.target.value)
              }
              placeholder="40.7128, -74.0060"
              className={validationErrors["static.ICBM"] ? styles.error : ""}
            />
            {validationErrors["static.ICBM"] && (
              <span className={styles.errorText}>
                {validationErrors["static.ICBM"]}
              </span>
            )}
            <small>Latitude, Longitude format (use comma and space).</small>
          </div>
        </div>
      </div>
    </div>
  );

  // Render page-specific SEO form
  const renderPageForm = (page) => {
    const pageData = formData.pages[page];
    const keywordsString =
      pageData.KeywordsString !== undefined
        ? pageData.KeywordsString
        : Array.isArray(pageData.Keywords)
        ? pageData.Keywords.join(", ")
        : "";

    return (
      <div className={styles.form}>
        <div className={styles.formSection}>
          <h4>
            <Search size={18} /> Basic SEO Information
          </h4>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Page Title *</label>
              <input
                type="text"
                value={pageData.Title}
                onChange={(e) =>
                  handlePageInputChange(page, "Title", e.target.value)
                }
                placeholder="Enter page title for search results"
                maxLength={60}
                className={
                  validationErrors[`pages.${page}.Title`] ? styles.error : ""
                }
              />
              {validationErrors[`pages.${page}.Title`] && (
                <span className={styles.errorText}>
                  {validationErrors[`pages.${page}.Title`]}
                </span>
              )}
              <small>
                Recommended: 50-60 characters. This appears in search results.
                *Required field.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label>Keywords</label>
              <input
                type="text"
                value={keywordsString}
                onChange={(e) =>
                  handlePageInputChange(page, "Keywords", e.target.value)
                }
                placeholder="keyword1, keyword2, keyword3"
                className={
                  validationErrors[`pages.${page}.Keywords`] ? styles.error : ""
                }
              />
              {validationErrors[`pages.${page}.Keywords`] && (
                <span className={styles.errorText}>
                  {validationErrors[`pages.${page}.Keywords`]}
                </span>
              )}
              <small>
                Type keywords separated by commas. Example: web design,
                portfolio, developer
              </small>

              <div className={styles.keywordsPreview}>
                <small>Keywords: {pageData.Keywords.length} items</small>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Page Description</label>
              <textarea
                value={pageData.Description}
                onChange={(e) =>
                  handlePageInputChange(page, "Description", e.target.value)
                }
                placeholder="Brief description of this page content"
                maxLength={160}
                rows={3}
              />
              <small>
                Recommended: 150-160 characters. This appears in search results.
              </small>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>
            <Share2 size={18} /> Social Media Sharing (Open Graph)
          </h4>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Social Media Title</label>
              <input
                type="text"
                value={pageData.SocialTitle}
                onChange={(e) =>
                  handlePageInputChange(page, "SocialTitle", e.target.value)
                }
                placeholder="Title when shared on social media"
              />
              <small>
                Title that appears when shared on Facebook, LinkedIn, etc.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label>Social Media Description</label>
              <textarea
                value={pageData.SocialDescription}
                onChange={(e) =>
                  handlePageInputChange(
                    page,
                    "SocialDescription",
                    e.target.value
                  )
                }
                placeholder="Description when shared on social media"
                rows={2}
              />
              <small>
                Description that appears when shared on social media.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label>Page URL</label>
              <input
                type="url"
                value={pageData.PageUrl}
                onChange={(e) =>
                  handlePageInputChange(page, "PageUrl", e.target.value)
                }
                placeholder="https://yourwebsite.com/page-url"
                className={
                  validationErrors[`pages.${page}.PageUrl`] ? styles.error : ""
                }
              />
              {validationErrors[`pages.${page}.PageUrl`] && (
                <span className={styles.errorText}>
                  {validationErrors[`pages.${page}.PageUrl`]}
                </span>
              )}
              <small>Full URL of this page.</small>
            </div>

            <div className={styles.formGroup}>
              <label>Social Media Image URL</label>
              <input
                type="url"
                value={pageData.SocialImage}
                onChange={(e) =>
                  handlePageInputChange(page, "SocialImage", e.target.value)
                }
                placeholder="https://yourwebsite.com/image.jpg"
                className={
                  validationErrors[`pages.${page}.SocialImage`]
                    ? styles.error
                    : ""
                }
              />
              {validationErrors[`pages.${page}.SocialImage`] && (
                <span className={styles.errorText}>
                  {validationErrors[`pages.${page}.SocialImage`]}
                </span>
              )}
              <small>
                Image that appears when shared on social media (1200x630px
                recommended).
              </small>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4>
            <Twitter size={18} /> Twitter Sharing
          </h4>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Twitter Title</label>
              <input
                type="text"
                value={pageData.TwitterTitle}
                onChange={(e) =>
                  handlePageInputChange(page, "TwitterTitle", e.target.value)
                }
                placeholder="Title when shared on Twitter"
              />
              <small>Title that appears when shared on Twitter.</small>
            </div>

            <div className={styles.formGroup}>
              <label>Twitter Description</label>
              <textarea
                value={pageData.TwitterDescription}
                onChange={(e) =>
                  handlePageInputChange(
                    page,
                    "TwitterDescription",
                    e.target.value
                  )
                }
                placeholder="Description when shared on Twitter"
                rows={2}
              />
              <small>Description that appears when shared on Twitter.</small>
            </div>

            <div className={styles.formGroup}>
              <label>Twitter Image URL</label>
              <input
                type="url"
                value={pageData.TwitterImage}
                onChange={(e) =>
                  handlePageInputChange(page, "TwitterImage", e.target.value)
                }
                placeholder="https://yourwebsite.com/image.jpg"
                className={
                  validationErrors[`pages.${page}.TwitterImage`]
                    ? styles.error
                    : ""
                }
              />
              {validationErrors[`pages.${page}.TwitterImage`] && (
                <span className={styles.errorText}>
                  {validationErrors[`pages.${page}.TwitterImage`]}
                </span>
              )}
              <small>
                Image that appears when shared on Twitter (1200x600px
                recommended).
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.seoSection}>
      <div className={styles.sectionHeader}>
        <h2>SEO Section</h2>
        <button
          className={`${styles.btnPrimary} ${styles.desktopSaveBtn}`}
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Styled Message Component */}
      {message.visible && (
        <div className={`${styles.messageAlert} ${styles[message.type]}`}>
          <span>{message.text}</span>
          <button
            className={styles.messageClose}
            onClick={() => setMessage({ type: "", text: "", visible: false })}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className={styles.pageSelector}>
        <h3>Select Page to Edit</h3>
        <div className={styles.pageOptions}>
          {pageOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                className={`${styles.pageOption} ${
                  selectedPage === option.value ? styles.active : ""
                }`}
                onClick={() => setSelectedPage(option.value)}
              >
                <Icon size={18} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.formContainer}>
        {selectedPage === "static"
          ? renderStaticForm()
          : renderPageForm(selectedPage)}
      </div>

      {/* Sticky Save Button for Mobile */}
      <div className={styles.stickySaveButton}>
        <button
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default DashboardSEO;
