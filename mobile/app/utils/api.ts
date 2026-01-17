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
  refresh_token: string;
  id: string;
}

type user = {
  id: string;
  email: string;
  name: string;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
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

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
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