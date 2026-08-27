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

export const respondToRequest = async (id, action) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid connection request ID');
  }
  // action: 'accept' or 'reject'
  const res = await api.put(`/connections/request/${id}`, { action });
  return res.data;
};

export const getMyConnections = async () => {
  const res = await api.get('/connections');
  return res.data;
};

export const removeConnection = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  const res = await api.delete(`/connections/${userId}`);
  return res.data;
};
