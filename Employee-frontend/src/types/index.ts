export interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr';
  department: string;
  position: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TimeEntry {
  id: string;
  userId: string;
  type: 'clock-in' | 'clock-out';
  timestamp: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  status: 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  userId: string;
  vacationDays: number;
  sickDays: number;
  personalDays: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}