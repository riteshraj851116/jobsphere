import api from './api';

export const getFeed = async () => {
  const res = await api.get('/posts/feed');
  return res.data;
};

export const createPost = async (data) => {
  const res = await api.post('/posts', data);
  return res.data;
};

export const likePost = async (id) => {
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
};

export const addComment = async (id, text) => {
  const res = await api.post(`/posts/${id}/comment`, { text });
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};
