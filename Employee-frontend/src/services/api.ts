import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    currentPassword?: string;
  }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export const attendanceApi = {
  clockIn: async () => {
    const response = await api.post('/attendance/clock-in');
    return response.data;
  },
  clockOut: async () => {
    const response = await api.post('/attendance/clock-out');
    return response.data;
  },
  getTimecard: async (startDate: string, endDate: string) => {
    const response = await api.get('/attendance/timecard', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export const leaveApi = {
  submitRequest: async (leaveData: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await api.post('/leave/request', leaveData);
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/leave/requests');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/leave/balance');
    return response.data;
  },
};

export const taskApi = {
  createTask: async (taskData: {
    title: string;
    description?: string;
    estimatedHours?: number;
  }) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  updateTask: async (taskId: string, taskData: {
    title: string;
    description?: string;
    estimatedHours?: number;
  }) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },
  updateTaskStatus: async (taskId: string, status: 'ongoing' | 'completed') => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
  getTasks: async (date: string) => {
    const response = await api.get('/tasks', { params: { date } });
    return response.data;
  },
};

export const managerApi = {
  getTeamAttendance: async (date: string, department?: string) => {
    const response = await api.get('/manager/attendance', {
      params: { date, department },
    });
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },
  getLeaveRequests: async () => {
    const response = await api.get('/manager/leave-requests');
    return response.data;
  },
  reviewLeaveRequest: async (
    requestId: string,
    data: { status: 'approved' | 'rejected'; comments: string }
  ) => {
    const response = await api.post(`/manager/leave-requests/${requestId}/review`, data);
    return response.data;
  },
};

export default api;