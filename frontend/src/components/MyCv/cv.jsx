import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Backend_Root_Url } from "../../config/AdminUrl.json";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  AlertCircle,
} from "lucide-react";
import styles from "./cv.module.css";

const CV = () => {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${Backend_Root_Url}/api/cv/data`
        );
        
        if (response.data && response.data.MyCv) {
          setCvData(response.data);
          await loadPdfDocument(response.data.MyCv);
        } else {
          setError("No CV data available");
        }
      } catch (error) {
        console.error("Error fetching CV data:", error);
        setError("Failed to load CV data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, []);

  const loadPdfDocument = async (cvFileName) => {
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const pdfUrl = `${Backend_Root_Url}/uploads/cv/${cvFileName}`;
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setError("Failed to load PDF document");
    }
  };

  const renderPage = async (pageNumber) => {
    if (!pdfDocument) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const canvas = document.getElementById('pdf-canvas');
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ 
        scale: scale,
        rotation: rotation 
      });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, scale, rotation]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const handleDownload = () => {
    if (cvData && cvData.MyCv) {
      const downloadUrl = `${Backend_Root_Url}/uploads/cv/${cvData.MyCv}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cvData.MyCv;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading CV...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.errorContainer}>
          <AlertCircle size={64} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Unable to Load CV</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cvData || !cvData.MyCv) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.noCvContainer}>
          <FileText size={64} className={styles.noCvIcon} />
          <h2 className={styles.noCvTitle}>No CV Available</h2>
          <p className={styles.noCvMessage}>
            The CV document is currently not available. Please check back later or contact the administrator.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Header Section */}
          <section className={styles.headerSection}>
            <div className={styles.headerContent}>
              <span className={styles.greeting}>📄 My Resume</span>
              <h1 className={styles.title}>Curriculum Vitae</h1>
              <p className={styles.subtitle}>
                View and download my complete professional resume
              </p>
            </div>
          </section>

          {/* CV Viewer Section */}
          <section className={styles.cvSection}>
            <div className={styles.cvContainer}>
              {/* Controls Bar */}
              <div className={styles.controlsBar}>
                <div className={styles.pageControls}>
                  <button
                    className={`${styles.controlButton} ${currentPage === 1 ? styles.disabled : ''}`}
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    className={`${styles.controlButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className={styles.viewControls}>
                  <button
                    className={styles.controlButton}
                    onClick={handleZoomOut}
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  
                  <span className={styles.zoomInfo}>
                    {Math.round(scale * 100)}%
                  </span>
                  
                  <button
                    className={styles.controlButton}
                    onClick={handleZoomIn}
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                  
                  <button
                    className={styles.controlButton}
                    onClick={handleRotate}
                    title="Rotate"
                  >
                    <RotateCw size={20} />
                  </button>
                </div>

                <div className={styles.actionControls}>
                  <button
                    className={styles.downloadButton}
                    onClick={handleDownload}
                  >
                    <Download size={20} />
                    Download CV
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className={styles.pdfViewer}>
                <div className={styles.pdfContainer}>
                  <canvas
                    id="pdf-canvas"
                    className={styles.pdfCanvas}
                  ></canvas>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CV;

