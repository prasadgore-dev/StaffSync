import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { LoginCredentials, RegisterEmployeeDto } from '../types/auth.types';

const router = Router();
const authService = new AuthService();

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Login validation rules
const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Registration validation rules
const registerValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('position').notEmpty().withMessage('Position is required'),
];

// Login route
router.post('/login', loginValidation, validateRequest, async (req: Request, res: Response) => {
    try {
        const credentials: LoginCredentials = req.body;
        const result = await authService.login(credentials);
        res.json(result);
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register route
router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response) => {
    try {
        const employeeData: RegisterEmployeeDto = req.body;
        const result = await authService.register(employeeData);
        res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Password reset request validation rules
const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
];

// Reset password validation rules
const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
];

// Request password reset
router.post('/forgot-password', forgotPasswordValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const resetToken = await authService.requestPasswordReset(email);
        res.status(200).json({ 
            message: 'Password reset instructions have been sent to your email',
            // In production, don't send the token in response
            resetToken 
        });
    } catch (error: any) {
        if (error.message === 'No account found with this email') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password with token
router.post('/reset-password', resetPasswordValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
        if (error.message === 'Invalid or expired reset token') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;