import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardCV.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Upload, Download, Eye, FileText, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.js";

const DashboardCV = () => {
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

  // CV state
  const [cvData, setCvData] = useState({
    cvFile: null,
    cvPreview: null,
    downloadUrl: "",
    cvId: null,
    cvFilename: null,
  });

  // Form states
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // File input refs
  const fileInputRef = useRef(null);

  // Load existing CV on component mount
  useEffect(() => {
    loadExistingCV();
  }, []);

  // Helper function to reset CV state
  const resetCvState = () => {
    setCvData({
      cvFile: null,
      cvPreview: null,
      downloadUrl: "",
      cvId: null,
      cvFilename: null,
    });
  };

  // Load existing CV from backend with improved error handling
  const loadExistingCV = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await axios.get(`${Backend_Root_Url}/api/show/cv/`, {
        withCredentials: true,
      });

      if (response.data.FindCv) {
        const cvData = response.data.FindCv;
        const downloadUrl = `${Backend_Root_Url}/uploads/mycv/${cvData.Cv}`;

        setCvData({
          cvFile: { name: cvData.Cv, size: 0 }, // We don't have size info from API
          cvPreview: null,
          downloadUrl: downloadUrl,
          cvId: cvData._id,
          cvFilename: cvData.Cv,
        });
      } else {
        // No CV found but response was successful
        resetCvState();
      }
    } catch (error) {
      // Handle 404 (no CV found) as normal case, not an error
      if (error.response?.status === 404) {
        resetCvState();
        // Don't show error message for 404 - it's expected when no CV exists
      } else {
        // Only log and show error for actual server errors
        console.error("Error loading CV:", error);
        setError("Failed to load existing CV. Please refresh the page.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
      handleCVUpload(e.dataTransfer.files[0]);
    }
  };

  // CV upload handler with improved API integration
  const handleCVUpload = async (file) => {
    if (
      file &&
      (file.type === "application/pdf" || file.type.includes("document"))
    ) {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("cv", file);

        // Upload CV to backend
        const response = await axios.post(
          `${Backend_Root_Url}/api/cv/add/?folder=mycv`,
          formData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          // Create local preview first for immediate feedback
          const reader = new FileReader();
          reader.onload = (e) => {
            setCvData({
              cvFile: file,
              cvPreview: e.target.result,
              downloadUrl: URL.createObjectURL(file),
              cvId: response.data._id || null,
              cvFilename: file.name,
            });
          };
          reader.readAsDataURL(file);

          setSuccess("CV uploaded successfully!");

          setTimeout(() => {
            loadExistingCV(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Error uploading CV:", error);
        setError(
          error.response?.data?.message ||
            "Failed to upload CV. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please upload only PDF");
    }
  };

  const downloadCV = () => {
    if (cvData.downloadUrl) {
      const link = document.createElement("a");
      link.href = cvData.downloadUrl;
      link.download = cvData.cvFilename || cvData.cvFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewCV = () => {
    if (cvData.downloadUrl) {
      window.open(cvData.downloadUrl, "_blank");
    }
  };

  // Remove CV with improved API integration
  const removeCV = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.delete(
        `${Backend_Root_Url}/api/cv/delete/`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        resetCvState();
        setSuccess("CV removed successfully!");
      }
    } catch (error) {
      console.error("Error removing CV:", error);
      if (error.response?.status === 404) {
        // CV was already deleted or doesn't exist
        resetCvState();
        setSuccess("CV removed successfully!");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to remove CV. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.cvSection}>
      <div className={styles.sectionHeader}>
        <h2>CV/Resume</h2>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className={styles.loadingContainer}>
          <Loader size={24} className={styles.spinner} />
          <span>Processing...</span>
        </div>
      )}

      {/* Success Message */}
      {success && <div className={styles.successMessage}>{success}</div>}

      {/* Error Message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.cvContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Upload CV/Resume</h3>
          </div>

          {!cvData.cvFile ? (
            <div
              className={`${styles.uploadArea} ${
                dragActive ? styles.dragActive : ""
              } ${loading ? styles.disabled : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              <div className={styles.uploadPlaceholder}>
                <Upload size={48} />
                <h4>Upload your CV/Resume</h4>
                <p>Click here or drag and drop your PDF or document file</p>
                <small>Supported formats: PDF</small>
              </div>
            </div>
          ) : (
            <div className={styles.cvPreview}>
              <div className={styles.cvInfo}>
                <div className={styles.cvIcon}>
                  <FileText size={32} />
                </div>
                <div className={styles.cvDetails}>
                  <h4>{cvData.cvFilename || cvData.cvFile.name}</h4>
                  <p>
                    {cvData.cvFile.size > 0
                      ? `${(cvData.cvFile.size / 1024 / 1024).toFixed(2)} MB • `
                      : ""}
                    {(cvData.cvFilename &&
                      cvData.cvFilename.toLowerCase().includes("pdf")) ||
                    (cvData.cvFile.type && cvData.cvFile.type.includes("pdf"))
                      ? "PDF"
                      : "Document"}
                  </p>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={removeCV}
                  disabled={loading}
                  title="Remove CV"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.cvActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={previewCV}
                  disabled={loading}
                  title="Preview CV"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={downloadCV}
                  disabled={loading}
                  title="Download CV"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleCVUpload(e.target.files[0])}
            disabled={loading}
            style={{ display: "none" }}
          />
        </div>

        {/* Instructions Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Instructions</h3>
          </div>
          <div className={styles.instructions}>
            <ul>
              <li>
                Upload your most recent CV or resume in PDF format for best
                compatibility
              </li>
              <li>
                Make sure your document is up-to-date with your latest
                experience and skills
              </li>
              <li>
                The file will be available for download by visitors to your
                portfolio
              </li>
              <li>You can preview the document before making it public</li>
              <li>Supported file formats: PDF</li>
              <li>
                <strong>Note:</strong> You can only have one CV uploaded at a
                time. Uploading a new CV will replace the existing one.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCV;
