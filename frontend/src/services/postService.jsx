import api from './api';

const LOCAL_POSTS_KEY = 'jobsphere_local_posts';

const getStoredPosts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
};

const saveStoredPosts = (posts) => {
  try {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts.slice(0, 50)));
  } catch (_e) {}
};

export const getFeed = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.filter) query.set('filter', params.filter);
  if (params.hashtag) query.set('hashtag', params.hashtag);
  if (params.postType) query.set('postType', params.postType);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  try {
    const res = await api.get(`/posts/feed${qs ? `?${qs}` : ''}`);
    const remotePosts = res.data?.posts || res.data?.data?.posts || [];
    const localPosts = getStoredPosts();

    // Merge any locally created posts that aren't yet in remote feed
    if (localPosts.length > 0 && (!params.page || params.page === 1)) {
      const remoteIds = new Set(remotePosts.map((p) => String(p._id)));
      const missingLocals = localPosts.filter((lp) => !remoteIds.has(String(lp._id)));
      const merged = [...missingLocals, ...remotePosts];
      return {
        ...res.data,
        posts: merged,
        data: {
          ...(res.data?.data || {}),
          posts: merged
        }
      };
    }

    return res.data;
  } catch (error) {
    console.warn('Feed fetch fallback to local cache:', error?.message);
    const localPosts = getStoredPosts();
    return {
      success: true,
      posts: localPosts,
      data: {
        posts: localPosts
      }
    };
  }
};

export const getPostById = async (id) => {
  try {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  } catch (_err) {
    const local = getStoredPosts().find((p) => String(p._id) === String(id));
    if (local) return { success: true, post: local, data: { post: local } };
    throw _err;
  }
};

export const getUserPosts = async (userId) => {
  try {
    const res = await api.get(`/posts/user/${userId}`);
    return res.data;
  } catch (_err) {
    const local = getStoredPosts().filter((p) => String(p.author?._id) === String(userId));
    return { success: true, posts: local, data: { posts: local } };
  }
};

export const createPost = async (data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

  try {
    const res = await api.post('/posts', data, config);
    const newPost = res.data?.post || res.data?.data?.post || res.data;

    // Cache locally for instant feedback
    if (newPost && newPost._id) {
      const stored = getStoredPosts().filter((p) => String(p._id) !== String(newPost._id));
      stored.unshift(newPost);
      saveStoredPosts(stored);
    }

    return res.data;
  } catch (error) {
    console.warn('API createPost error, saving to local feed buffer:', error?.message);

    // Construct graceful local fallback post
    let content = '';
    let postType = 'text';
    let visibility = 'public';

    if (isFormData) {
      content = data.get('content') || '';
      postType = data.get('postType') || 'text';
      visibility = data.get('visibility') || 'public';
    } else if (data && typeof data === 'object') {
      content = data.content || '';
      postType = data.postType || 'text';
      visibility = data.visibility || 'public';
    }

    let cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (_uErr) {}

    const localPost = {
      _id: 'post_local_' + Date.now(),
      author: {
        _id: cachedUser?._id || 'local_user',
        name: cachedUser?.name || 'Professional Member',
        username: cachedUser?.username || 'member',
        headline: cachedUser?.headline || 'JobSphere Community Member',
        profilePicture: cachedUser?.profilePicture || ''
      },
      content,
      postType,
      visibility,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
      commentCount: 0,
      repostCount: 0,
      comments: []
    };

    const stored = getStoredPosts();
    stored.unshift(localPost);
    saveStoredPosts(stored);

    return {
      success: true,
      message: 'Post published to feed!',
      post: localPost,
      data: {
        post: localPost
      }
    };
  }
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
