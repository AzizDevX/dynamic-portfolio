import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import AuthPage from "./components/auth/auth";
import { Frontend_Admin_Url } from "./config/AdminUrl.json";
import Dashboard from "./components/AdminDashboard/main/Dashboard_Restructured";
import DeniedPage from "./components/AccesDenied/DeniedPage";
import SkillsPage from "./components/SkillsPage/SkillsPage";
import ProjectsPage from "./components/PorjectsPage/ProjectsPage";
import Page404 from "./components/404/404page";
import CV from "./components/MyCv/cv";
import Contact from "./components/contact/Contact";
const adminUrl = "/" + Frontend_Admin_Url;
const adminDashboard_Url = adminUrl + "/dashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/contact" element={<Contact />} />
        <Route path={adminUrl} element={<AuthPage />} />
        <Route path={adminDashboard_Url} element={<Dashboard />} />
        <Route path="/denied" element={<DeniedPage />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
