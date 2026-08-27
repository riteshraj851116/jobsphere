import api from './api';
import { isValidObjectId } from '../utils/validation';

export const getJobs = async (params = {}) => {
  const res = await api.get('/jobs', { params });
  return res.data;
};

export const getJobById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid job ID');
  }
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const getMyJobs = async () => {
  const res = await api.get('/jobs/recruiter/my-jobs');
  return res.data;
};

export const createJob = async (data) => {
  const res = await api.post('/jobs', data);
  return res.data;
};

export const updateJob = async (id, data) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid job ID');
  }
  const res = await api.put(`/jobs/${id}`, data);
  return res.data;
};

export const deleteJob = async (id) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid job ID');
  }
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
};
