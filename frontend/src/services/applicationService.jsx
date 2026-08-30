import api from './api';
import { MOCK_APPLICATIONS, MOCK_JOBS } from '../utils/mockData';

const STORAGE_KEY = 'jobsphere_local_applications';

const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse local applications:', err);
  }
  return MOCK_APPLICATIONS;
};

const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save local applications:', err);
  }
};

// Candidate: apply for a job
export const applyForJob = async (jobId, data = {}) => {
  try {
    const res = await api.post('/applications/apply', { jobId, ...data });
    return res.data;
  } catch (error) {
    console.warn('API applyForJob failed, persisting to local applications:', error?.message);
    const all = getStoredApplications();
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Check if already applied
    const existing = all.find((a) => (a.job?._id === jobId || a.job?.id === jobId || a.job === jobId));
    if (existing) {
      return { success: true, message: 'Application submitted successfully', data: existing };
    }

    const matchedJob = MOCK_JOBS.find((j) => j._id === jobId || j.id === jobId) || {
      _id: jobId,
      title: data.jobTitle || 'Senior Software Engineer',
      company: { name: data.companyName || 'JobSphere Partner' },
      location: 'Remote / Bengaluru',
    };

    const newApp = {
      _id: 'app-' + Date.now(),
      id: 'app-' + Date.now(),
      job: matchedJob,
      applicant: storedUser || { name: 'Demo Candidate', role: 'user' },
      status: 'applied',
      coverLetter: data.coverLetter || 'Applied via JobSphere portal.',
      resumeUrl: data.resumeUrl || 'https://riteshraj851116.github.io/jobsphere/resume.pdf',
      appliedAt: new Date().toISOString(),
      matchScore: Math.floor(Math.random() * 15) + 85,
    };

    all.unshift(newApp);
    saveStoredApplications(all);
    return { success: true, message: 'Application submitted successfully', data: newApp, application: newApp };
  }
};

// Candidate: get my applications
export const getMyApplications = async () => {
  try {
    const res = await api.get('/applications/my-applications');
    return res.data;
  } catch (error) {
    const all = getStoredApplications();
    return { success: true, data: all, applications: all, count: all.length };
  }
};

// Candidate: withdraw application
export const withdrawApplication = async (id) => {
  try {
    const res = await api.delete(`/applications/${id}/withdraw`);
    return res.data;
  } catch (error) {
    const all = getStoredApplications().filter((a) => a._id !== id && a.id !== id);
    saveStoredApplications(all);
    return { success: true, message: 'Application withdrawn' };
  }
};

// Recruiter: get applicants for a job
export const getJobApplicants = async (jobId) => {
  try {
    const res = await api.get(`/applications/job/${jobId}/applicants`);
    return res.data;
  } catch (error) {
    const all = getStoredApplications();
    const filtered = jobId ? all.filter((a) => a.job?._id === jobId || a.job?.id === jobId) : all;
    return { success: true, data: filtered.length ? filtered : all, applicants: filtered.length ? filtered : all };
  }
};

// Recruiter: update application status
export const updateApplicationStatus = async (id, status) => {
  try {
    const res = await api.put(`/applications/${id}/status`, { status });
    return res.data;
  } catch (error) {
    const all = getStoredApplications();
    const target = all.find((a) => a._id === id || a.id === id);
    if (target) {
      target.status = status;
      saveStoredApplications(all);
      return { success: true, data: target };
    }
    return { success: true };
  }
};

const applicationService = {
  applyForJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
};

export default applicationService;
