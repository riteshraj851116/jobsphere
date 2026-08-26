import api from './api';

export const sendConnectionRequest = async (receiverId) => {
  const res = await api.post('/connections/request', { receiverId });
  return res.data;
};

export const getPendingRequests = async () => {
  const res = await api.get('/connections/requests');
  return res.data;
};

export const respondToRequest = async (id, action) => {
  // action: 'accept' or 'reject'
  const res = await api.put(`/connections/request/${id}`, { action });
  return res.data;
};

export const getMyConnections = async () => {
  const res = await api.get('/connections');
  return res.data;
};

export const removeConnection = async (userId) => {
  const res = await api.delete(`/connections/${userId}`);
  return res.data;
};
