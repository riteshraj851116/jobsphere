import api from './api';

export const getFeed = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.filter) query.set('filter', params.filter);
  if (params.hashtag) query.set('hashtag', params.hashtag);
  if (params.postType) query.set('postType', params.postType);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  const res = await api.get(`/posts/feed${qs ? `?${qs}` : ''}`);
  return res.data;
};

export const getPostById = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const getUserPosts = async (userId) => {
  const res = await api.get(`/posts/user/${userId}`);
  return res.data;
};

export const createPost = async (data) => {
  // If data is FormData (has image file)
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const res = await api.post('/posts', data, config);
  return res.data;
};

export const updatePost = async (id, data) => {
  const res = await api.put(`/posts/${id}`, data);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

export const likePost = async (id) => {
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
};

export const getPostLikes = async (id) => {
  const res = await api.get(`/posts/${id}/likes`);
  return res.data;
};

export const sharePost = async (id, commentary = '') => {
  const res = await api.post(`/posts/${id}/share`, { commentary });
  return res.data;
};

export const toggleSavePost = async (id) => {
  const res = await api.post(`/posts/${id}/save`);
  return res.data;
};

export const getSavedPosts = async () => {
  const res = await api.get('/posts/saved');
  return res.data;
};

export const addComment = async (id, text) => {
  const res = await api.post(`/posts/${id}/comment`, { text });
  return res.data;
};

export const editComment = async (id, commentId, text) => {
  const res = await api.put(`/posts/${id}/comment/${commentId}`, { text });
  return res.data;
};

export const deleteComment = async (id, commentId) => {
  const res = await api.delete(`/posts/${id}/comment/${commentId}`);
  return res.data;
};

export const likeComment = async (id, commentId) => {
  const res = await api.post(`/posts/${id}/comment/${commentId}/like`);
  return res.data;
};

export const addCommentReply = async (id, commentId, text) => {
  const res = await api.post(`/posts/${id}/comment/${commentId}/reply`, { text });
  return res.data;
};

export const deleteCommentReply = async (id, commentId, replyId) => {
  const res = await api.delete(`/posts/${id}/comment/${commentId}/reply/${replyId}`);
  return res.data;
};

export const likeCommentReply = async (id, commentId, replyId) => {
  const res = await api.post(`/posts/${id}/comment/${commentId}/reply/${replyId}/like`);
  return res.data;
};

export const getTrendingHashtags = async () => {
  const res = await api.get('/posts/tags/trending');
  return res.data;
};

export const getPostsByHashtag = async (tag) => {
  const cleanTag = encodeURIComponent(String(tag).replace('#', ''));
  const res = await api.get(`/posts/tag/${cleanTag}`);
  return res.data;
};
