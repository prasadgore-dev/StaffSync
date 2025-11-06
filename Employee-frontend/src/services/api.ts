import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Manager API declarations moved to the end of file

export const userApi = {
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    currentPassword?: string;
  }) => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  }
};

export const timecardApi = {
  clockIn: async () => {
    const response = await api.post('/api/timecards/clock-in');
    return response.data;
  },
  clockOut: async () => {
    const response = await api.post('/api/timecards/clock-out');
    return response.data;
  },
  getTimecard: async () => {
    const response = await api.get('/api/timecards/today');
    return response.data;
  },
  getTimecardHistory: async (startDate: string, endDate: string) => {
    const response = await api.get('/api/timecards/history', {
      params: { startDate, endDate },
    });
    return response.data;
  },
  exportTimecardHistory: async (startDate: string, endDate: string) => {
    const response = await api.get('/api/timecards/export', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  }
};

export const leaveApi = {
  submitRequest: async (leaveData: {
    leaveType: 'vacation' | 'sick' | 'personal' | 'other';
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await api.post('/api/leave', {
      ...leaveData,
      type: leaveData.leaveType // Map leaveType to type for backend compatibility
    });
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/api/leave');
    return response.data;
  },
  getRequest: async (requestId: string) => {
    const response = await api.get(`/api/leave/${requestId}`);
    return response.data;
  },
  updateRequest: async (requestId: string, status: 'approved' | 'rejected', managerNotes?: string) => {
    const response = await api.put(`/api/leave/${requestId}`, { status, managerNotes });
    return response.data;
  }
};

export const taskApi = {
  createTask: async (taskData: {
    title: string;
    description: string;
    assignedToId: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  updateTask: async (taskId: string, taskData: {
    title?: string;
    description?: string;
    assignedToId?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'in_progress' | 'completed' | 'blocked';
  }) => {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
  getTasks: async (filters?: {
    status?: string;
    assignedToId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/api/tasks', { params: filters });
    return response.data;
  }
};

export const managerApi = {
  getTeamAttendance: async (filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }) => {
    const response = await api.get('/api/manager/attendance', {
      params: filters,
    });
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/api/manager/departments');
    return response.data;
  },
  getLeaveRequests: async () => {
    const response = await api.get('/api/manager/leave-requests');
    return response.data;
  },
  reviewLeaveRequest: async (
    requestId: string,
    data: { status: 'approved' | 'rejected'; comments: string }
  ) => {
    const response = await api.post(`/api/manager/leave-requests/${requestId}/review`, data);
    return response.data;
  },
  getEmployeeStatuses: async () => {
    const response = await api.get('/api/manager/employee-statuses');
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/api/manager/dashboard-stats');
    return response.data;
  },
  getEmployeeDetails: async (employeeId: string) => {
    const response = await api.get(`/api/manager/employees/${employeeId}`);
    return response.data;
  },
  getEmployeeTimecards: async (employeeId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/api/manager/employees/${employeeId}/timecards`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
  getEmployeeTasks: async (employeeId: string) => {
    const response = await api.get(`/api/manager/employees/${employeeId}/tasks`);
    return response.data;
  },
};

export default api;