// src/services/auth.service.ts

import { apiClient } from '@/lib/api-client';
import { User } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PhoneLoginData {
  phone: string;
}

export class AuthService {
  // Login por email y contraseña
  static async login(credentials: LoginData): Promise<LoginResponse> {
    const response = await apiClient.login(credentials.email, credentials.password);
    return {
      token: response.token,
      user: response.user,
      expiresIn: '24h', // Default from API
    };
  }

  // Login por teléfono
  static async phoneLogin(data: PhoneLoginData): Promise<LoginResponse> {
    const response = await apiClient.phoneLogin(data.phone);
    return {
      token: response.token,
      user: response.user,
      expiresIn: '24h', // Default from API
    };
  }

  // Logout
  static logout(): void {
    apiClient.logout();
  }

  // Verificar si está autenticado
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.user;
  }

  // Refrescar token (si el API lo soporta)
  static async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    return response;
  }

  // Verificar token válido
  static async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  }
}

export default AuthService;
