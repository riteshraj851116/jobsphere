import api from './api';

export const getCompanies = async (params = {}) => {
  const res = await api.get('/companies', { params });
  return res.data;
};

export const getCompanyById = async (id) => {
  const res = await api.get(`/companies/${id}`);
  return res.data;
};

export const createCompany = async (data) => {
  const res = await api.post('/companies', data);
  return res.data;
};

export const updateCompany = async (id, data) => {
  const res = await api.put(`/companies/${id}`, data);
  return res.data;
};

export const deleteCompany = async (id) => {
  const res = await api.delete(`/companies/${id}`);
  return res.data;
};
