import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Rooms API
export const roomsApi = {
  getAll: (params?: { type?: string; available?: boolean; floor?: number }) =>
    api.get('/rooms', { params }),
  getById: (id: string) => api.get(`/rooms/${id}`),
  getAvailability: (id: string, date?: string) =>
    api.get(`/rooms/${id}/availability`, { params: { date } }),
  create: (data: any) => api.post('/rooms', data),
  update: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
};

// Reservations API
export const reservationsApi = {
  getMy: (params?: { status?: string; upcoming?: boolean }) =>
    api.get('/reservations/my', { params }),
  getAll: (params?: any) => api.get('/reservations', { params }),
  getById: (id: string) => api.get(`/reservations/${id}`),
  getCalendar: (month?: number, year?: number) =>
    api.get('/reservations/calendar', { params: { month, year } }),
  create: (data: { room_id: string; start_time: string; end_time: string; notes?: string }) =>
    api.post('/reservations', data),
  update: (id: string, data: any) => api.put(`/reservations/${id}`, data),
  cancel: (id: string) => api.delete(`/reservations/${id}`),
};

// Donations API
export const donationsApi = {
  getMy: () => api.get('/donations/my'),
  getAll: (params?: { limit?: number }) => api.get('/donations', { params }),
  getLeaderboard: (limit?: number) => api.get('/donations/leaderboard', { params: { limit } }),
  getGoal: () => api.get('/donations/goal'),
  create: (data: { amount: number; message?: string; is_anonymous?: boolean; payment_method?: string }) =>
    api.post('/donations', data),
};

// Notifications API
export const notificationsApi = {
  getMy: (params?: { unread_only?: boolean; limit?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  broadcast: (data: { title: string; message: string; type?: string; target_role?: string }) =>
    api.post('/notifications/broadcast', data),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getSystemStats: () => api.get('/admin/system-stats'),
  getUsers: (params?: { role?: string; is_active?: boolean; search?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id: string) =>
    api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};
