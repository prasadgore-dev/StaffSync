import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginCredentials, RegisterEmployeeDto } from '../types/auth.types';

const authService = new AuthService();

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const body = req.body as RegisterEmployeeDto;
      const result = await authService.register(body);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const body = req.body as LoginCredentials;
      const result = await authService.login(body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message || 'Invalid credentials' });
    }
  },

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body as { email: string };
      const token = await authService.requestPasswordReset(email);
      return res.status(200).json({ message: 'Password reset token generated', token });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Unable to generate reset token' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body as { token: string; newPassword: string };
      await authService.resetPassword(token, newPassword);
      return res.status(200).json({ message: 'Password has been reset' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Unable to reset password' });
    }
  }
};
