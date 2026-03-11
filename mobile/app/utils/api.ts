import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  profile_image: string;
  refresh_token: string;
  id: string;
}

type user = {
  id: string;
  email: string;
  name: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: user;
}

export interface MemoryResponse {
  id: string;
  content: ContentType[]
}

export interface CalendarResponse {
  year: number;
  month: number;
  entry_days: number[];
}

export interface StatsResponse {
  total_entries: number;
  streak: number;
}

type ContentType = {
  content_type: string;
  content: string;
  content_url: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata: string;
}

/**
 * Makes an HTTP request to the specified endpoint.
 * 
 * @template T - The expected response type
 * @param endpoint - The API endpoint path to request
 * @param options - Optional fetch RequestInit configuration (headers, method, body, etc.)
 * @returns A promise that resolves with the parsed response data of type T
 * @throws {ApiError} Throws an ApiError if the response is not ok or if a network error occurs
 * 
 * @example
 * const data = await apiService.request<User>('/users/123');
 */

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private onLogout: (() => void) | null = null;

  setLogoutCallback(callback: () => void) {
    this.onLogout = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
    passAuthToken: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const isFormData = options.body instanceof FormData;
    const headers = {
      'Content-Type': 'application/json',
      'credentials': "include",
      ...options.headers,
    } as Record<string, string>;

    if (isFormData) {
      delete headers['Content-Type'];
    }

    if (passAuthToken) {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401 && !isRetry) {
          try {
            const refreshResponse = await this.refreshToken();
            if (refreshResponse && refreshResponse.token) {
              await AsyncStorage.setItem('userToken', refreshResponse.token);
              return this.request<T>(endpoint, options, true);
            }
          } catch (refreshError) {
            this.onLogout?.();
          }
        }

        if (response.status === 401) {
          this.onLogout?.();
        }

        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Request failed', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0);
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    console.log(refreshToken)
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${refreshToken}`
      }
    }, true, false);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false, false);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false, false);
  }

  async createMemory(data: FormData): Promise<MemoryResponse> {
    return this.request<MemoryResponse>('/memory', {
      method: 'POST',
      body: data,
    });
  }

  async getMemoriesByDate(date: string): Promise<MemoryResponse> {
    return this.request<MemoryResponse>(`/memory/${date}`, {
      method: 'GET',
    });
  }

  async getCalendarDates(year: number, month: number): Promise<CalendarResponse> {
    return this.request<CalendarResponse>(`/memory/calendar/${year}/${month}`, {
      method: 'GET',
    });
  }

  async getUserStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/memory/stats', {
      method: 'GET',
    });
  }

  async googleLogin(idToken: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
  }

  async updateProfile(name: string, profileImageUri?: string): Promise<user> {
    const formData = new FormData();
    formData.append('name', name);

    if (profileImageUri) {
      const filename = profileImageUri.split('/').pop() || 'profile.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      formData.append('profile_image', {
        uri: profileImageUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    return this.request<user>('/auth/profile', {
      method: 'PUT',
      body: formData,
    });
  }

  // Add more API methods here as needed
  // async register(data: RegisterRequest): Promise<RegisterResponse> { ... }
  // async logout(): Promise<void> { ... }
}

const apiService = new ApiService(API_BASE_URL);

class ApiError extends Error {
  status: number;
  error: string;

  constructor(error: string, status: number) {
    super(error);
    this.status = status;
    this.error = error;
  }
}

export { ApiError, apiService };