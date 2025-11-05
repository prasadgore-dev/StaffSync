import { Employee } from "../entities/employee.entity";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterEmployeeDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department: string;
    position: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<Employee, 'password'>;
}

export interface DecodedToken {
    id: string;
    email: string;
    role: 'admin' | 'employee';
    iat: number;
    exp: number;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordReset {
    token: string;
    newPassword: string;
}