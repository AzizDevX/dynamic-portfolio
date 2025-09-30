import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Backend_Root_Url } from "../../config/AdminUrl.js";
import {
  Download,
  FileText,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import styles from "./cv.module.css";
import "../../../src/App.css";

const CV = () => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noCvFound, setNoCvFound] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const viewerContainerRef = useRef(null);

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoCvFound(false);

        const response = await axios.get(`${Backend_Root_Url}/api/show/cv/`);
        if (response.data && response.data.FindCv) {
          setCvData(response.data.FindCv);
          const pdfPath = `${Backend_Root_Url}/uploads/mycv/${response.data.FindCv.Cv}`;
          setPdfUrl(pdfPath);
        } else {
          setNoCvFound(true);
        }
      } catch (err) {
        console.error("Error fetching CV data:", err);
        if (err.response?.status === 404) setNoCvFound(true);
        else setError("Failed to load CV. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, []);

  const handleDownload = async () => {
    if (!cvData?.Cv) return;
    try {
      const res = await axios.get(
        `${Backend_Root_Url}/uploads/mycv/${cvData.Cv}`,
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cvData.Cv;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed, falling back to direct link", err);
      const link = document.createElement("a");
      link.href = `${Backend_Root_Url}/uploads/mycv/${cvData.Cv}`;
      link.download = cvData.Cv;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank");
  };

  const toggleFullscreen = async () => {
    const el = viewerContainerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.cvPage}>
        <Navbar />
        <div className={styles.cvLoading}>
          <div className={styles.loadingContainer}>
            <div className={styles.cvSpinner}></div>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Loading your CV...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cvPage}>
        <Navbar />
        <div className={styles.cvError}>
          <div className={styles.errorContainer}>
            <h2>Something Went Wrong</h2>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (noCvFound) {
    return (
      <div className={styles.cvPage}>
        <Navbar />
        <div className={styles.cvNotFound}>
          <div className={styles.notFoundContainer}>
            <div className={styles.noCvIcon}>
              <FileText size={92} />
            </div>
            <h2>CV Not Available Yet</h2>
            <p>
              The CV hasn't been uploaded yet. Please check back later or
              contact me directly for my resume.
            </p>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Check Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cvData || !cvData.Cv) {
    return (
      <div className={styles.cvPage}>
        <Navbar />
        <div className={styles.cvNotFound}>
          <div className={styles.notFoundContainer}>
            <FileText size={64} className={styles.noCvIcon} />
            <h2>CV Not Available</h2>
            <p>
              The CV document is currently not available. Please check back
              later.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`${styles.cvPage} ${
        isFullscreen ? styles.fullscreenMode : ""
      }`}
    >
      <Navbar />

      <div className={styles.cvContainer}>
        <div className={styles.expertiseSection}>
          <div className={styles.expertiseHeader}>💼 My Resume</div>
          <h1 className={styles.expertiseTitle}>Professional Resume</h1>
          <p className={styles.expertiseDescription}>
            Professional experience, skills, and key achievements at a glance.
            Download full CV or view online.
          </p>
        </div>

        <div className={styles.contentLayout}>
          <div className={styles.pdfViewerSection}>
            <div className={styles.pdfControlsBar}>
              <div className={styles.controlsGroup}></div>

              <div className={styles.controlsGroup}>
                <button
                  onClick={handleDownload}
                  className={styles.downloadButton}
                  aria-label="Download CV"
                >
                  <Download size={18} />
                  Download CV
                </button>

                <button
                  onClick={handleOpenNewTab}
                  className={styles.controlButton}
                  title="Open in new tab"
                  aria-label="Open in new tab"
                >
                  Open
                </button>

                <button
                  onClick={toggleFullscreen}
                  className={styles.controlButton}
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>

            <div className={styles.pdfDisplayArea} ref={viewerContainerRef}>
              <div className={styles.pdfWrapper}>
                <div className={styles.pdfContainer}>
                  {pdfUrl ? (
                    <iframe
                      ref={iframeRef}
                      src={pdfUrl}
                      title="CV PDF Viewer"
                      className={styles.pdfIframe}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <div className={styles.pdfLoadingOverlay}>
                      <div className={styles.pdfSpinner}></div>
                      <p>Preparing PDF...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isFullscreen && <Footer />}
    </div>
  );
};

export default CV;
