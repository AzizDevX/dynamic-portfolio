import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import styles from "./auth.module.css";
import axios from "axios";
import { Frontend_Admin_Url, Backend_Root_Url } from "../../config/AdminUrl.js";
import { verifyJWTToken } from "../AdminDashboard/utils/authUtils";
import { useEffect } from "react";

import "../../../src/App.css";

const AdminDashboard = "/" + Frontend_Admin_Url;
const AuthPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const AdminDashboardHref = [{ href: `${AdminDashboard}/dashboard` }];
  //Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyJWTToken();
      if (isValid === true) {
        window.location.href = AdminDashboardHref[0].href;
      }
    };
    checkAuth();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) {
      setErrorMessage("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${Backend_Root_Url}/auth/admin`,
        {
          userName: formData.username,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Login successful");
      window.location.href = AdminDashboardHref[0].href;
    } catch (error) {
      if (error.response) {
        const errorMsg =
          error.response.data?.message || "Authentication failed";
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage("Network error. Please check your connection.");
      } else {
        setErrorMessage(
          error.message || "An error occurred during authentication"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoContainer}>
            <Lock className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Sign in to your admin dashboard</p>
        </div>

        <div className={styles.authForm}>
          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.passwordToggle}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className={styles.submitButton}
            disabled={isLoading || !formData.username || !formData.password}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>
            Secure admin access • Protected by encryption
          </p>
        </div>
      </div>

      <div className={styles.backgroundPattern}>
        <div className={styles.circlePattern}></div>
        <div className={styles.gridPattern}></div>
      </div>
    </div>
  );
};

export default AuthPage;
