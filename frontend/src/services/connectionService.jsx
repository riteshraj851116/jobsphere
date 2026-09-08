import api from './api';
import { isValidObjectId } from '../utils/validation';

export const sendConnectionRequest = async (receiverId) => {
  if (!isValidObjectId(receiverId)) {
    throw new Error('Invalid user ID');
  }
  const res = await api.post('/connections/request', { receiverId });
  return res.data;
};

export const getPendingRequests = async () => {
  const res = await api.get('/connections/requests');
  return res.data;
};

export const getSentRequests = async () => {
  const res = await api.get('/connections/sent-requests');
  return res.data;
};

export const cancelPendingRequest = async (id) => {
  const res = await api.delete(`/connections/request/${id}`);
  return res.data;
};

export const respondToRequest = async (id, action) => {
  // action: 'accept' or 'reject'
  const res = await api.put(`/connections/request/${id}`, { action });
  return res.data;
};

export const getMyConnections = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await api.get(`/connections${query}`);
  return res.data;
};

export const removeConnection = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  const res = await api.delete(`/connections/${userId}`);
  return res.data;
};

export const getMutualConnections = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  const res = await api.get(`/connections/mutual/${userId}`);
  return res.data;
};

export const getConnectionStatus = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  const res = await api.get(`/connections/status/${userId}`);
  return res.data;
};

export const getConnectionSuggestions = async () => {
  const res = await api.get('/connections/suggestions');
  return res.data;
};
