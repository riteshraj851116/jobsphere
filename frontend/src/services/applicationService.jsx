import api from './api';
import { isValidObjectId } from '../utils/validation';

// Candidate: apply for a job
export const applyForJob = async (jobId, data = {}) => {
  if (!isValidObjectId(jobId)) {
    throw new Error('Invalid job ID');
  }
  const res = await api.post('/applications/apply', { jobId, ...data });
  return res.data;
};

// Candidate: get my applications
export const getMyApplications = async () => {
  const res = await api.get('/applications/my-applications');
  return res.data;
};

// Candidate: withdraw application
export const withdrawApplication = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid application ID');
  }
  const res = await api.delete(`/applications/${id}/withdraw`);
  return res.data;
};

// Recruiter: get applicants for a job
export const getJobApplicants = async (jobId) => {
  if (!isValidObjectId(jobId)) {
    throw new Error('Invalid job ID');
  }
  const res = await api.get(`/applications/job/${jobId}/applicants`);
  return res.data;
};

// Recruiter: update application status
export const updateApplicationStatus = async (id, status) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid application ID');
  }
  const res = await api.put(`/applications/${id}/status`, { status });
  return res.data;
};
