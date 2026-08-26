import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import ProtectedRoute from "./routes/ProtectedRoute";
import RecruiterRoute from "./routes/RecruiterRoute";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Jobs from "./pages/Jobs/Jobs";
import JobDetails from "./pages/Jobs/JobDetails";

import Companies from "./pages/Companies/Companies";
import CompanyDetails from "./pages/Companies/CompanyDetails";

/* =========================================================
   CANDIDATE PAGES
========================================================= */

import Dashboard from "./pages/Dashboard/Dashboard";
import Applications from "./pages/Candidate/Applications";
import SavedJobs from "./pages/Candidate/SavedJobs";
import CandidateProfile from "./pages/Candidate/CandidateProfile";

/* =========================================================
   MESSAGES
========================================================= */

import Messages from "./pages/Messages/Messages";

/* =========================================================
   RECRUITER PAGES
========================================================= */

import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard";
import CreateJob from "./pages/Recruiter/CreateJob";
import ManageJobs from "./pages/Recruiter/ManageJobs";
import Applicants from "./pages/Recruiter/Applicants";
import CompanyProfile from "./pages/Recruiter/CompanyProfile";

/* =========================================================
   404 PAGE
========================================================= */

function NotFound() {
  return (
    <section className="not-found">
      <div className="not-found__inner">

        <p className="eyebrow">404</p>

        <h1>PAGE NOT FOUND.</h1>

        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="btn btn--primary btn--md"
        >
          RETURN HOME
        </Link>

      </div>
    </section>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <AuthProvider>

      <Router basename="/jobsphere/">

        <div className="page-container">

          {/* =================================================
              NAVBAR
          ================================================= */}

          <Navbar />

          {/* =================================================
              MAIN
          ================================================= */}

          <main className="flex-1">

            <Routes>

              {/* =================================================
                  PUBLIC ROUTES
              ================================================= */}

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/jobs"
                element={<Jobs />}
              />

              <Route
                path="/jobs/:id"
                element={<JobDetails />}
              />

              <Route
                path="/companies"
                element={<Companies />}
              />

              <Route
                path="/companies/:id"
                element={<CompanyDetails />}
              />

              {/* =================================================
                  CANDIDATE / AUTHENTICATED ROUTES
              ================================================= */}

              <Route element={<ProtectedRoute />}>

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/applications"
                  element={<Applications />}
                />

                <Route
                  path="/saved-jobs"
                  element={<SavedJobs />}
                />

                <Route
                  path="/profile"
                  element={<CandidateProfile />}
                />

                <Route
                  path="/messages"
                  element={<Messages />}
                />

              </Route>

              {/* =================================================
                  RECRUITER ROUTES

                  Kept separate from candidate routes.
              ================================================= */}

              <Route element={<RecruiterRoute />}>

                <Route
                  path="/recruiter-dashboard"
                  element={<RecruiterDashboard />}
                />

                <Route
                  path="/create-job"
                  element={<CreateJob />}
                />

                <Route
                  path="/manage-jobs"
                  element={<ManageJobs />}
                />

                <Route
                  path="/applicants"
                  element={<Applicants />}
                />

                <Route
                  path="/company-profile"
                  element={<CompanyProfile />}
                />

              </Route>

              {/* =================================================
                  404
              ================================================= */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>

          </main>

          {/* =================================================
              FOOTER
          ================================================= */}

          <Footer />

        </div>

      </Router>

    </AuthProvider>
  );
}

export default App;
