import axios from 'axios';

// ✅ FORCE localhost (not network IP)
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 API Request:', config.method.toUpperCase(), config.url);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.config?.url, error.message);
    
    // Don't redirect on login/signup page
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname === '/login' || 
                        window.location.pathname === '/register';
      
      if (!isAuthPage) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleComplete: (id) => api.patch(`/tasks/${id}/toggle`),
};

export const aiAPI = {
  parseTask: (input) => api.post('/ai/parse', { input }),
  getSuggestions: () => api.get('/ai/suggestions'),
  getDailySummary: () => api.get('/ai/daily-summary'),
  analyzeTask: (taskId) => api.get(`/ai/analyze/${taskId}`),
  getTimeBlock: () => api.get('/ai/time-block'),
};

export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getProductivityTrends: (days) => api.get('/analytics/trends', { params: { days } }),
};

export const teamAPI = {
  createTeam: (data) => api.post('/teams', data),
  getMyTeams: () => api.get('/teams'),
  getUserTeams: () => api.get('/teams'),
  getTeamById: (id) => api.get(`/teams/${id}`),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  
  inviteMember: (teamId, data) => {
    console.log('🔥 API: POST /teams/' + teamId + '/invite');
    console.log('Data:', data);
    return api.post(`/teams/${teamId}/invite`, data);
  },

  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  
  assignTask: (data) => api.post('/teams/assign-task', data),
  assignTaskAI: (teamId, data) => api.post(`/teams/${teamId}/assign-ai`, data),
  getTeamTasks: (teamId) => api.get(`/teams/${teamId}/tasks`),
  getMyAssignedTasks: () => api.get('/teams/my-assigned-tasks'),
  
  getTeamDashboard: (teamId) => api.get(`/teams/${teamId}/dashboard`),
  
  createMeeting: (teamId) => {
    console.log('🎥 Creating meeting for team:', teamId);
    return api.post(`/teams/${teamId}/meetings`);
  },
  getTeamMeetings: (teamId) => api.get(`/teams/${teamId}/meetings`),
  joinMeeting: (teamId, meetingId) => api.post(`/teams/${teamId}/meetings/${meetingId}/join`),
  endMeeting: (teamId, meetingId) => api.delete(`/teams/${teamId}/meetings/${meetingId}`),

  getTeamMessages: (teamId, limit) => api.get(`/teams/${teamId}/messages`, { params: { limit } }),
};

export default api;
