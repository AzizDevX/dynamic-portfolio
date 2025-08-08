import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import styles from "./auth.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Frontend_Admin_Url } from "../../config/AdminUrl.json";
const AdminDashboard = "/" + Frontend_Admin_Url;
const AuthPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Your backend API call with axios
      const response = await axios.post(
        "http://localhost:5000/auth/admin",
        {
          userName: formData.username,
          password: formData.password,
        },
        {
          withCredentials: true, // Include credentials for cookie handling
        }
      );

      // Handle successful login
      console.log("Login successful");
      // Redirect or handle success state here
      navigate(`${AdminDashboard}/dashboard`); // Navigate here directly after success
    } catch (error) {
      // axios error handling - check if it's a response error
      if (error.response) {
        // Server responded with error status
        const errorMsg =
          error.response.data?.message || "Authentication failed";
        setErrorMessage(errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        setErrorMessage("Network error. Please check your connection.");
      } else {
        // Something else happened
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
