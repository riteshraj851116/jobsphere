import React, { useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AuthBackground from '../../components/auth/AuthBackground';

import './Auth.css';

const Register = () => {
  const [formData, setFormData] =
    useState({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'user',
    });

  const [error, setError] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { register } =
    useAuth();

  const navigate =
    useNavigate();

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const name =
      formData.name.trim();

    const username =
      formData.username.trim();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    if (
      !name ||
      !username ||
      !email ||
      !password
    ) {
      setError(
        'Please fill in all required fields.'
      );

      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const user =
        await register({
          ...formData,
          name,
          username,
          email,
        });

      if (
        user?.role ===
        'recruiter'
      ) {
        navigate(
          '/recruiter-dashboard'
        );
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <AuthBackground />

      <div className="auth-overlay" />

      <section
        className="auth-card register-card"
        aria-labelledby="register-title"
      >
        <div className="auth-header">

          <Link
            to="/"
            className="auth-logo"
          >
            JOBSPHERE
          </Link>

          <div className="auth-kicker">
            <span />
            Join the network
          </div>

          <h1 id="register-title">
            Create your
            <span> profile.</span>
          </h1>

          <p>
            Build your JobSphere
            profile and discover
            better opportunities.
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
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate
        >

          <Input
            label="Full Name"
            name="name"
            id="reg-name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="name"
          />

          <Input
            label="Username"
            name="username"
            id="reg-username"
            type="text"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="username"
          />

          <Input
            label="Email address"
            name="email"
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="email"
          />

          <Input
            label="Password"
            name="password"
            id="reg-password"
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            autoComplete="new-password"
          />

          <div className="role-selector">

            <div className="role-heading">
              <span className="input-label">
                I am a...
              </span>

              <span className="role-hint">
                Choose your account type
              </span>
            </div>

            <div
              className="role-options"
              role="radiogroup"
              aria-label="Account type"
            >

              <label
                className={`role-option ${
                  formData.role ===
                  'user'
                    ? 'selected'
                    : ''
                }`}
              >

                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={
                    formData.role ===
                    'user'
                  }
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <span className="role-icon">
                  ↗
                </span>

                <span className="role-content">
                  <strong>
                    Job Seeker
                  </strong>

                  <small>
                    Find and apply
                    for jobs
                  </small>
                </span>

                <span className="role-check">
                  ✓
                </span>

              </label>

              <label
                className={`role-option ${
                  formData.role ===
                  'recruiter'
                    ? 'selected'
                    : ''
                }`}
              >

                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={
                    formData.role ===
                    'recruiter'
                  }
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <span className="role-icon">
                  □
                </span>

                <span className="role-content">
                  <strong>
                    Recruiter
                  </strong>

                  <small>
                    Post jobs and
                    hire talent
                  </small>
                </span>

                <span className="role-check">
                  ✓
                </span>

              </label>

            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting
              ? 'Creating account...'
              : 'Create Account'}
          </Button>

        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <Link
            to="/login"
            className="auth-link"
          >
            Sign in
          </Link>
        </div>

        <div className="auth-security">
          <span className="security-dot" />
          Secure JobSphere registration
        </div>

      </section>
    </main>
  );
};

export default Register;