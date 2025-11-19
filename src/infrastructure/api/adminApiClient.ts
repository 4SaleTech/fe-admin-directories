import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Support runtime configuration from /api/config endpoint
const getApiBaseUrl = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable directly
    return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  // Client-side: fetch from config endpoint
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    return config.apiBaseUrl;
  } catch (error) {
    console.error('Failed to fetch runtime config:', error);
    // Fallback to build-time env var
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }
};

// Initialize with empty string, will be set during client initialization
let API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class AdminApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token and update baseURL if needed
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Initialize baseURL from runtime config on first request (client-side only)
        if (!this.initialized && typeof window !== 'undefined') {
          try {
            const apiUrl = await getApiBaseUrl();
            if (apiUrl) {
              this.client.defaults.baseURL = apiUrl;
            }
            this.initialized = true;
          } catch (error) {
            console.error('Failed to initialize API base URL:', error);
            this.initialized = true; // Don't retry on every request
          }
        }

        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export a singleton instance
export const adminApiClient = new AdminApiClient();
