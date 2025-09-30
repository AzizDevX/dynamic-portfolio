import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Frontend_Admin_Url, Backend_Root_Url } from "./config/AdminUrl.js";

const adminUrl = "/" + Frontend_Admin_Url;
const adminDashboard_Url = adminUrl + "/dashboard";
// SEO Manager Component - Only runs on main pages
const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Define main pages that should use dynamic SEO
    const mainPages = ["/", "/projects", "/skills", "/cv", "/contact"];

    // Only apply SEO updates on main pages
    if (!mainPages.includes(currentPath)) {
      console.log(`Skipping SEO update for non-main page: ${currentPath}`);
      return;
    }

    const updateSEO = async () => {
      try {
        let seoEndpoint = "home";

        // Map routes to SEO endpoints
        switch (currentPath) {
          case "/":
            seoEndpoint = "home";
            break;
          case "/projects":
            seoEndpoint = "projects";
            break;
          case "/skills":
            seoEndpoint = "skills";
            break;
          case "/cv":
            seoEndpoint = "cv";
            break;
          case "/contact":
            seoEndpoint = "contact";
            break;
          default:
            seoEndpoint = "home";
        }

        // Fetch both static and page-specific SEO data
        const [staticResponse, pageResponse] = await Promise.all([
          fetch(`${Backend_Root_Url}/api/seo/static`),
          fetch(`${Backend_Root_Url}/api/seo/${seoEndpoint}`),
        ]);

        if (!staticResponse.ok || !pageResponse.ok) {
          console.error("Failed to fetch SEO data");
          return;
        }

        const staticData = await staticResponse.json();
        const pageData = await pageResponse.json();

        // Update document title
        document.title = pageData.Title || "Portfolio - Aziz Kammoun";

        // Helper function to update or create meta tags
        const updateMetaTag = (selector, attribute, value) => {
          if (!value) return;

          let meta = document.querySelector(selector);
          if (!meta) {
            meta = document.createElement("meta");
            document.head.appendChild(meta);
          }
          meta.setAttribute(attribute, value);
        };

        const updateLinkTag = (selector, attribute, value) => {
          if (!value) return;

          let link = document.querySelector(selector);
          if (!link) {
            link = document.createElement("link");
            document.head.appendChild(link);
          }
          link.setAttribute(attribute, value);
        };

        // Update basic meta tags
        updateMetaTag(
          'meta[name="description"]',
          "content",
          pageData.Description
        );
        updateMetaTag(
          'meta[name="keywords"]',
          "content",
          pageData.Keywords?.join(", ") || ""
        );
        updateMetaTag('meta[name="author"]', "content", staticData.Author);

        // Update Open Graph meta tags
        updateMetaTag(
          'meta[property="og:title"]',
          "content",
          pageData.SocialTitle || pageData.Title
        );
        updateMetaTag(
          'meta[property="og:description"]',
          "content",
          pageData.SocialDescription || pageData.Description
        );
        updateMetaTag(
          'meta[property="og:url"]',
          "content",
          pageData.PageUrl || window.location.href
        );
        updateMetaTag(
          'meta[property="og:site_name"]',
          "content",
          staticData.WebsiteName
        );
        updateMetaTag('meta[property="og:type"]', "content", "website");
        updateMetaTag(
          'meta[property="og:locale"]',
          "content",
          staticData.LangCode
        );

        if (pageData.SocialImage) {
          updateMetaTag(
            'meta[property="og:image"]',
            "content",
            pageData.SocialImage
          );
          updateMetaTag(
            'meta[property="og:image:alt"]',
            "content",
            pageData.SocialTitle || pageData.Title
          );
        }

        // Update Twitter Card meta tags
        updateMetaTag(
          'meta[name="twitter:card"]',
          "content",
          "summary_large_image"
        );
        updateMetaTag(
          'meta[name="twitter:title"]',
          "content",
          pageData.TwitterTitle || pageData.SocialTitle || pageData.Title
        );
        updateMetaTag(
          'meta[name="twitter:description"]',
          "content",
          pageData.TwitterDescription ||
            pageData.SocialDescription ||
            pageData.Description
        );

        if (pageData.TwitterImage || pageData.SocialImage) {
          updateMetaTag(
            'meta[name="twitter:image"]',
            "content",
            pageData.TwitterImage || pageData.SocialImage
          );
        }

        // Update geographic meta tags
        if (staticData.Geographic) {
          updateMetaTag(
            'meta[name="geo.position"]',
            "content",
            staticData.Geographic
          );
          updateMetaTag('meta[name="ICBM"]', "content", staticData.ICBM);
          updateMetaTag(
            'meta[name="geo.region"]',
            "content",
            staticData.CountryCode
          );
          updateMetaTag(
            'meta[name="geo.placename"]',
            "content",
            staticData.City
          );
        }

        // Update language tags
        updateLinkTag(
          'link[rel="canonical"]',
          "href",
          pageData.PageUrl || window.location.href
        );

        // Update HTML lang attribute
        const htmlElement = document.documentElement;
        if (staticData.LangCode) {
          htmlElement.setAttribute("lang", staticData.LangCode);
        }

        // Add structured data (JSON-LD)
        const existingJsonLd = document.querySelector(
          'script[type="application/ld+json"]'
        );
        if (existingJsonLd) {
          existingJsonLd.remove();
        }

        const structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: staticData.WebsiteName,
          author: {
            "@type": "Person",
            name: staticData.Author,
          },
          url: pageData.PageUrl || window.location.origin,
          description: pageData.Description,
          inLanguage: staticData.LangCode,
        };

        const jsonLdScript = document.createElement("script");
        jsonLdScript.type = "application/ld+json";
        jsonLdScript.textContent = JSON.stringify(structuredData);
        document.head.appendChild(jsonLdScript);
      } catch (error) {
        console.error("Error updating SEO:", error);
      }
    };

    updateSEO();
  }, [location]);

  return null;
};

// Lazy loading component
const LazyRoute = ({ importFunc }) => {
  const LazyComponent = React.lazy(importFunc);

  return (
    <React.Suspense
      fallback={
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Loading Page...</p>
          </div>
        </div>
      }
    >
      <LazyComponent />
    </React.Suspense>
  );
};

function App() {
  return (
    <BrowserRouter basename="">
      <SEOManager />
      <Routes>
        <Route
          path="/"
          element={
            <LazyRoute
              importFunc={() => import("./components/Home/Home.jsx")}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <LazyRoute
              importFunc={() =>
                import("./components/PorjectsPage/ProjectsPage.jsx")
              }
            />
          }
        />
        <Route
          path="/skills"
          element={
            <LazyRoute
              importFunc={() =>
                import("./components/SkillsPage/SkillsPage.jsx")
              }
            />
          }
        />
        <Route
          path="/cv"
          element={
            <LazyRoute importFunc={() => import("./components/MyCv/cv.jsx")} />
          }
        />
        <Route
          path="/contact"
          element={
            <LazyRoute
              importFunc={() => import("./components/contact/Contact.jsx")}
            />
          }
        />
        <Route
          path={adminUrl}
          element={
            <LazyRoute
              importFunc={() => import("./components/auth/auth.jsx")}
            />
          }
        />
        <Route
          path={adminDashboard_Url}
          element={
            <LazyRoute
              importFunc={() =>
                import(
                  "./components/AdminDashboard/main/Dashboard_Restructured.jsx"
                )
              }
            />
          }
        />
        <Route
          path="/denied"
          element={
            <LazyRoute
              importFunc={() =>
                import("./components/AccesDenied/DeniedPage.jsx")
              }
            />
          }
        />
        <Route
          path="*"
          element={
            <LazyRoute importFunc={() => import("./components/404/404page")} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
