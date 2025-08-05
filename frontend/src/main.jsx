import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import AuthPage from "./components/auth/auth";
import { Frontend_Admin_Url } from "./config/AdminUrl.json";
const adminUrl = "/" + Frontend_Admin_Url;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={adminUrl} element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
