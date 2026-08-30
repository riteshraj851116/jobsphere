import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    loading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDemoLogin = async (type) => {
    try {
      setSubmitting(true);
      setError("");

      const demoEmail =
        type === "recruiter" ? "recruiter@jobsphere.io" : "ritesh.raj@example.com";
      const demoPass = "demo123";

      setEmail(demoEmail);
      setPassword(demoPass);

      const loggedInUser = await login(demoEmail, demoPass);

      const role = String(loggedInUser?.role || "").toLowerCase();

      if (role === "recruiter") {
        navigate("/recruiter-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to login with demo account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const loggedInUser = await login(
        cleanEmail,
        password
      );

      const from =
        location.state?.from?.pathname;

      if (from && from !== "/login") {
        navigate(from, {
          replace: true,
        });

        return;
      }

      const role = String(
        loggedInUser?.role || ""
      ).toLowerCase();

      if (role === "recruiter") {
        navigate(
          "/recruiter-dashboard",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullscreen />;
  }

  if (isAuthenticated) {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const role = String(
      storedUser?.role || ""
    ).toLowerCase();

    return (
      <Navigate
        to={
          role === "recruiter"
            ? "/recruiter-dashboard"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return (
    <section className="auth-page">
      <div className="auth-container">

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Sign in to JobSphere
            </h1>

            <p>
              Continue building your professional journey.
            </p>
          </div>

          {/* 1-Click Quick Demo Accounts for Resume Reviewers */}
          <div style={{
            background: "rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(15, 23, 42, 0.1)",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "20px"
          }}>
            <div style={{
              fontSize: "0.78rem",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#475569",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span>⚡</span>
              <span>1-Click Instant Demo Login (For Reviewers)</span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("candidate")}
                disabled={submitting}
                style={{
                  background: "#0f172a",
                  color: "#fff",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                👤 Candidate Demo
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("recruiter")}
                disabled={submitting}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                💼 Recruiter Demo
              </button>
            </div>
          </div>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
};

export default Login;