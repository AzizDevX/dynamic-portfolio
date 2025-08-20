import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Frontend_Admin_Url } from "./config/AdminUrl.js";
const adminUrl = "/" + Frontend_Admin_Url;
const adminDashboard_Url = adminUrl + "/dashboard";
import "../src/LazyLoding.css";

// Lazy loading
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="">
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
  </StrictMode>
);
