// src/lib/api-client.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Gestión de tokens
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', token);
  }

  private clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
  }

  // Método base para realizar peticiones
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token de autenticación si existe
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    // Agregar body si existe
    if (options.body && options.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar errores HTTP
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Sesión expirada');
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        const apiError: ApiError = {
          message: errorData.error || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
        };
        throw apiError;
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error en la petición');
      }
      
      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos de autenticación
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const result = await this.post<{ token: string; user: any }>('/auth/login', {
      username,
      password,
    });

    this.setAuthToken(result.token);
    return result;
  }

  async phoneLogin(phone: string): Promise<{ token: string; user: any }> {
    const result = await this.post<{ token: string; user: any }>('/auth/phone-login', {
      phone,
    });

    this.setAuthToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      // Hacer logout en el servidor para auditoría
      if (this.isAuthenticated()) {
        await this.post('/auth/logout');
        console.log('Logout realizado exitosamente en el servidor');
      }
    } catch (error) {
      // Si falla el logout en el servidor, seguimos limpiando el token local
      console.warn('Error al hacer logout en el servidor:', error);
    } finally {
      // Siempre limpiar el token local
      this.clearAuthToken();
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
export default apiClient;
