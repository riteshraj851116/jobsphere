import React, { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    isAuthenticated,
    user,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const name = formData.name.trim();
    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const role =
      formData.role === "recruiter"
        ? "recruiter"
        : "user";

    if (!name || !username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const registeredUser = await register({
        name,
        username,
        email,
        password,
        role,
      });

      const from =
        location.state?.from?.pathname;

      if (from && from !== "/register") {
        navigate(from, {
          replace: true,
        });

        return;
      }

      const userRole = String(
        registeredUser?.role || role
      ).toLowerCase();

      if (userRole === "recruiter") {
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
          "Unable to create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullscreen />;
  }

  if (isAuthenticated) {
    const role = String(
      user?.role || ""
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
              JOIN JOBSPHERE
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Build your professional profile
              and discover new opportunities.
            </p>
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
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                autoComplete="username"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">
                I am joining as
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="user">
                  Job Seeker
                </option>

                <option value="recruiter">
                  Recruiter
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;