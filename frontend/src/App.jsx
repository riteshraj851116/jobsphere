import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CareerAssistant from "./components/ai/CareerAssistant.jsx";

import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Jobs from "./pages/Jobs/Jobs.jsx";
import JobDetails from "./pages/Jobs/JobDetails.jsx";
import Companies from "./pages/Companies/Companies.jsx";
import CompanyDetails from "./pages/Companies/CompanyDetails.jsx";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Applications from "./pages/Candidate/Applications.jsx";
import SavedJobs from "./pages/Candidate/SavedJobs.jsx";
import CandidateProfile from "./pages/Candidate/CandidateProfile.jsx";
import Messages from "./pages/Messages/Messages.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";

import RecruiterDashboard from "./pages/Recruiter/RecruiterDashboard.jsx";
import CompanyProfile from "./pages/Recruiter/CompanyProfile.jsx";
import CreateJob from "./pages/Recruiter/CreateJob.jsx";
import ManageJobs from "./pages/Recruiter/ManageJobs.jsx";
import Applicants from "./pages/Recruiter/Applicants.jsx";

import InterviewPractice from "./pages/Interview/InterviewPractice.jsx";
import InterviewSession from "./pages/Interview/InterviewSession.jsx";
import InterviewResult from "./pages/Interview/InterviewResult.jsx";
import InterviewHistory from "./pages/Interview/InterviewHistory.jsx";

import ResumeAnalyzer from "./pages/Resume/ResumeAnalyzer.jsx";
import ResumeAnalysisResult from "./pages/Resume/ResumeAnalysisResult.jsx";
import ResumeAnalysisHistory from "./pages/Resume/ResumeAnalysisHistory.jsx";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      {/* FIX 1: Properly formatted text and added closing div */}
      <h2>404</h2>
      <p>Page not found</p>
    </div>
  );
};

const App = () => {
  return (
    // FIX 2: Added missing opening div and Navbar
    <div className="app-shell">
      <Navbar />
      
      <main className="app-main">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<CandidateProfile />} />
            
            {/* INTERVIEW PRACTICE ROUTES */}
            <Route path="/interview-practice" element={<InterviewPractice />} />
            <Route path="/interview-practice/session/:sessionId" element={<InterviewSession />} />
            <Route path="/interview-practice/result/:sessionId" element={<InterviewResult />} />
            <Route path="/interview-practice/history" element={<InterviewHistory />} />
            
            {/* RESUME ANALYZER ROUTES */}
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/resume-analyzer/result/:analysisId" element={<ResumeAnalysisResult />} />
            <Route path="/resume-analyzer/history" element={<ResumeAnalysisHistory />} />
            
            {/* RECRUITER ROUTES */}
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/recruiter/company" element={<CompanyProfile />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/applicants" element={<Applicants />} />
          </Route>

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CareerAssistant />
      <Footer />
    </div>
  );
};

export default App;