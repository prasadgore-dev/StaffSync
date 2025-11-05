import api from './api';
import type { User } from '../types';

const login = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock authentication
  if (email === 'test@example.com' && password === 'password123') {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employee' as const,
    };
    return {
      user: mockUser,
      token: 'mock-jwt-token'
    };
  }
  throw new Error('Invalid credentials');
};

const logout = async () => {
  await api.post('/auth/logout');
};

const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  currentPassword?: string;
}) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const authApi = {
  login,
  logout,
  updateProfile,
};