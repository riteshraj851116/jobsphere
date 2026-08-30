import api from './api';
import { MOCK_JOBS } from '../utils/mockData';

// Local storage key for persistent mock jobs if modified
const STORAGE_JOBS_KEY = 'jobsphere_local_jobs';

const getStoredJobs = () => {
  try {
    const data = localStorage.getItem(STORAGE_JOBS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to parse local jobs:', err);
  }
  return MOCK_JOBS;
};

const saveStoredJobs = (jobs) => {
  try {
    localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save local jobs:', err);
  }
};

export const getJobs = async (params = {}) => {
  try {
    const res = await api.get('/jobs', { params });
    if (res.data && (Array.isArray(res.data.jobs) || Array.isArray(res.data.data) || Array.isArray(res.data))) {
      return res.data;
    }
    return { success: true, jobs: res.data.jobs || res.data };
  } catch (error) {
    console.warn('API getJobs failed or backend offline, using mock dataset:', error?.message);
    let filtered = [...getStoredJobs()];

    if (params.search || params.keyword) {
      const q = String(params.search || params.keyword).toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company?.name || j.companyName || '').toLowerCase().includes(q) ||
          (j.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params.location) {
      const loc = String(params.location).toLowerCase();
      filtered = filtered.filter((j) => (j.location || '').toLowerCase().includes(loc));
    }

    if (params.jobType && params.jobType !== 'all') {
      filtered = filtered.filter((j) => (j.jobType || '').toLowerCase() === params.jobType.toLowerCase());
    }

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((j) => (j.category || '').toLowerCase() === params.category.toLowerCase());
    }

    if (params.experienceLevel && params.experienceLevel !== 'all') {
      filtered = filtered.filter(
        (j) => (j.experienceLevel || '').toLowerCase().includes(params.experienceLevel.toLowerCase())
      );
    }

    return {
      success: true,
      data: filtered,
      jobs: filtered,
      total: filtered.length,
      page: 1,
      pages: 1,
    };
  }
};

export const getJobById = async (id) => {
  try {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  } catch (error) {
    console.warn(`API getJobById (${id}) failed, finding in local dataset`);
    const all = getStoredJobs();
    const found = all.find((j) => j._id === id || j.id === id);
    if (found) {
      return { success: true, data: found, job: found };
    }
    // Return first mock job if specific ID wasn't found
    return { success: true, data: all[0], job: all[0] };
  }
};

export const getMyJobs = async () => {
  try {
    const res = await api.get('/jobs/recruiter/my-jobs');
    return res.data;
  } catch (error) {
    const all = getStoredJobs();
    return { success: true, data: all.slice(0, 4), jobs: all.slice(0, 4) };
  }
};

export const createJob = async (data) => {
  try {
    const res = await api.post('/jobs', data);
    return res.data;
  } catch (error) {
    const all = getStoredJobs();
    const newJob = {
      _id: 'job-custom-' + Date.now(),
      id: 'job-custom-' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'active',
      company: {
        name: data.companyName || 'JobSphere Recruiter',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      },
    };
    all.unshift(newJob);
    saveStoredJobs(all);
    return { success: true, data: newJob, job: newJob };
  }
};

export const updateJob = async (id, data) => {
  try {
    const res = await api.put(`/jobs/${id}`, data);
    return res.data;
  } catch (error) {
    const all = getStoredJobs();
    const index = all.findIndex((j) => j._id === id || j.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...data };
      saveStoredJobs(all);
      return { success: true, data: all[index], job: all[index] };
    }
    return { success: true, data };
  }
};

export const deleteJob = async (id) => {
  try {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  } catch (error) {
    const all = getStoredJobs().filter((j) => j._id !== id && j.id !== id);
    saveStoredJobs(all);
    return { success: true, message: 'Job deleted successfully' };
  }
};

const jobService = {
  getJobs,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
};

export default jobService;
