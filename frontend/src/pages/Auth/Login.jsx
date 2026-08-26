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

const Login = () => {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const { login } = useAuth();

  const navigate =
    useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const cleanEmail =
      email.trim();

    if (!cleanEmail || !password) {
      setError(
        'Please enter your email and password.'
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const user =
        await login(
          cleanEmail,
          password
        );

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
        'Login failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <AuthBackground />

      <div className="auth-overlay" />

      <section
        className="auth-card"
        aria-labelledby="login-title"
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
            Welcome back
          </div>

          <h1 id="login-title">
            Sign in to
            <span> JobSphere.</span>
          </h1>

          <p>
            Access your profile,
            applications and
            career opportunities.
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
            label="Email address"
            type="email"
            id="login-email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            disabled={isSubmitting}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            id="login-password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting
              ? 'Signing in...'
              : 'Sign In'}
          </Button>

        </form>

        <div className="auth-footer">
          <span>
            Don't have an account?
          </span>

          <Link
            to="/register"
            className="auth-link"
          >
            Create one free
          </Link>
        </div>

        <div className="auth-security">
          <span className="security-dot" />
          Secure JobSphere access
        </div>

      </section>
    </main>
  );
};

export default Login;