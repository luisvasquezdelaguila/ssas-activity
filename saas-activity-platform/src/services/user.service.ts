// src/services/user.service.ts

import { apiClient } from '@/lib/api-client';
import { User, CreateUserData, UpdateUserData } from '@/types';

export interface UsersResponse {
  users: User[];
  total: number;
  page?: number;
  limit?: number;
}

export interface UserResponse {
  user: User;
}

export class UserService {
  // Obtener todos los usuarios
  static async getUsers(): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>('/users');
    return response.users;
  }

  // Obtener usuarios por empresa
  static async getUsersByCompany(companyId: string): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>(`/users/company/${companyId}`);
    return response.users;
  }

  // Obtener usuario por ID
  static async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.user;
  }

  // Crear nuevo usuario
  static async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post<UserResponse>('/users', userData);
    return response.user;
  }

  // Actualizar usuario
  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, userData);
    return response.user;
  }

  // Eliminar usuario (marcar como inactivo)
  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  // Buscar usuarios
  static async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.users;
  }

  // Obtener perfil del usuario actual
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserResponse>('/users/me');
    return response.user;
  }

  // Actualizar perfil del usuario actual
  static async updateCurrentUser(userData: Partial<UpdateUserData>): Promise<User> {
    const response = await apiClient.put<UserResponse>('/users/me', userData);
    return response.user;
  }

  // Cambiar contraseña
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/users/me/password', {
      currentPassword,
      newPassword,
    });
  }
}

export default UserService;
