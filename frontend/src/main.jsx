import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import AuthPage from "./components/auth/auth";
import { Frontend_Admin_Url } from "./config/AdminUrl.json";
import Dashboard from "./components/AdminDashboard/main/Dashboard_Restructured";
import DeniedPage from "./components/AccesDenied/DeniedPage";
import Page404 from "./components/404/404page";
const adminUrl = "/" + Frontend_Admin_Url;
const adminDashboard_Url = adminUrl + "/dashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={adminUrl} element={<AuthPage />} />
        <Route path={adminDashboard_Url} element={<Dashboard />} />
        <Route path="/denied" element={<DeniedPage />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
