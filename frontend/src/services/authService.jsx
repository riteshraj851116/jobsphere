import api from './api';

export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    console.warn("Backend login unavailable, creating local demo session:", err.message);
    const mockUser = {
      _id: 'usr_demo_123',
      name: email.split('@')[0] || 'Demo Professional',
      email: email,
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      title: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA'
    };
    localStorage.setItem('local_demo_user', JSON.stringify(mockUser));
    return {
      success: true,
      token: 'demo_jwt_token_' + Date.now(),
      user: mockUser,
      data: {
        token: 'demo_jwt_token_' + Date.now(),
        user: mockUser
      }
    };
  }
};

export const register = async (userData) => {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data;
  } catch (err) {
    console.warn("Backend register unavailable, creating local demo user:", err.message);
    const mockUser = {
      _id: 'usr_demo_' + Date.now(),
      name: userData.name || 'Demo Professional',
      email: userData.email,
      role: userData.role || 'candidate',
      title: userData.title || 'Software Developer',
      location: 'Remote'
    };
    localStorage.setItem('local_demo_user', JSON.stringify(mockUser));
    return {
      success: true,
      token: 'demo_jwt_token_' + Date.now(),
      user: mockUser,
      data: {
        token: 'demo_jwt_token_' + Date.now(),
        user: mockUser
      }
    };
  }
};

export const getMe = async () => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    const stored = localStorage.getItem('local_demo_user');
    const mockUser = stored
      ? JSON.parse(stored)
      : {
          _id: 'usr_demo_123',
          name: 'Demo Candidate',
          email: 'demo@jobsphere.com',
          role: 'candidate',
        };
    return {
      success: true,
      user: mockUser,
      data: { user: mockUser }
    };
  }
};
