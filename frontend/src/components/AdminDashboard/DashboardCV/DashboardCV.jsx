import React, { useState, useRef, useEffect } from "react";
import styles from "./DashboardCV.module.css";
import { verifyJWTToken } from "../utils/authUtils";
import { Upload, Download, Eye, FileText, X } from "lucide-react";

const DashboardCV = () => {
  // Authentication check
  // useEffect(() => {
  //   if (!verifyJWTToken()) {
  //     window.location.href = "/denied";
  //     return;
  //   }
  // }, []);

  // CV state
  const [cvData, setCvData] = useState({
    cvFile: null,
    cvPreview: null,
    downloadUrl: "",
  });

  // Form states
  const [dragActive, setDragActive] = useState(false);

  // File input refs
  const fileInputRef = useRef(null);

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

  // CV handlers
  const handleCVUpload = (file) => {
    if (
      file &&
      (file.type === "application/pdf" || file.type.includes("document"))
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvData({
          cvFile: file,
          cvPreview: e.target.result,
          downloadUrl: URL.createObjectURL(file),
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload only PDF or document files");
    }
  };

  const downloadCV = () => {
    if (cvData.downloadUrl) {
      const link = document.createElement("a");
      link.href = cvData.downloadUrl;
      link.download = cvData.cvFile.name;
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

  const removeCV = () => {
    setCvData({
      cvFile: null,
      cvPreview: null,
      downloadUrl: "",
    });
  };

  return (
    <div className={styles.cvSection}>
      <div className={styles.sectionHeader}>
        <h2>CV/Resume</h2>
      </div>

      <div className={styles.cvContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Upload CV/Resume</h3>
          </div>

          {!cvData.cvFile ? (
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
              <div className={styles.uploadPlaceholder}>
                <Upload size={48} />
                <h4>Upload your CV/Resume</h4>
                <p>Click here or drag and drop your PDF or document file</p>
                <small>Supported formats: PDF, DOC, DOCX</small>
              </div>
            </div>
          ) : (
            <div className={styles.cvPreview}>
              <div className={styles.cvInfo}>
                <div className={styles.cvIcon}>
                  <FileText size={32} />
                </div>
                <div className={styles.cvDetails}>
                  <h4>{cvData.cvFile.name}</h4>
                  <p>
                    {(cvData.cvFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {cvData.cvFile.type.includes("pdf") ? "PDF" : "Document"}
                  </p>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={removeCV}
                  title="Remove CV"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.cvActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={previewCV}
                  title="Preview CV"
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={downloadCV}
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
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleCVUpload(e.target.files[0])}
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
              <li>Supported file formats: PDF, DOC, DOCX (PDF recommended)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCV;
