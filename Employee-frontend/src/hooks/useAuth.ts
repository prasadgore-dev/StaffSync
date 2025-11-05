import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from '../features/auth/authSlice';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(loginStart());
        const { user } = await authApi.login(email, password);
        dispatch(loginSuccess(user));
      } catch (error) {
        dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    authApi.logout();
    dispatch(logout());
  }, [dispatch]);

  const updateProfile = useCallback(
    async (data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      password?: string;
      currentPassword?: string;
    }) => {
      try {
        dispatch(updateProfileStart());
        const updatedUser = await authApi.updateProfile(data);
        dispatch(updateProfileSuccess(updatedUser));
        return updatedUser;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
        dispatch(updateProfileFailure(errorMessage));
        throw error;
      }
    },
    [dispatch]
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    logout: logoutUser,
    updateProfile,
  };
};