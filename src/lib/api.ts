import type { 
  RouteDto, 
  StatsDto, 
  MigrationJobDto, 
  ApiResponse,
  LoginResponseDto,
  MeResponseDto,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

const TOKEN_KEY = 'admin_token';
const TOKEN_COOKIE = 'admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: Record<string, unknown>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const fetchOptions: RequestInit = { 
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

async function fetchApiWithAuth<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = { 
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  routes: {
    searchByCode: (code: string) => 
      fetchApi<RouteDto[]>(`/api/routes/code/${encodeURIComponent(code)}`),
    
    searchByName: (name: string) => 
      fetchApi<RouteDto[]>(`/api/routes/name/${encodeURIComponent(name)}`),
    
    searchByCar: (carNumber: string) => 
      fetchApi<RouteDto[]>(`/api/routes/car/${encodeURIComponent(carNumber)}`),
    
    getByDate: (date: string) => 
      fetchApi<RouteDto[]>(`/api/routes/date/${date}`),
  },
  
  stats: {
    getByDate: (date: string) => 
      fetchApi<StatsDto>(`/api/stats/${date}`),
  },

  auth: {
    login: (email: string, password: string) =>
      fetchApi<LoginResponseDto>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    me: () => fetchApiWithAuth<MeResponseDto>('/api/auth/me'),
  },
  
  migration: {
    getAll: () =>
      fetchApiWithAuth<ApiResponse<MigrationJobDto[]>>('/api/migration'),
    
    getActive: () =>
      fetchApiWithAuth<ApiResponse<MigrationJobDto | null>>('/api/migration/active'),
    
    getById: (id: number) =>
      fetchApiWithAuth<ApiResponse<MigrationJobDto>>(`/api/migration/${id}`),
    
    start: (startDate: string, endDate: string) =>
      fetchApiWithAuth<ApiResponse<MigrationJobDto>>('/api/migration', {
        method: 'POST',
        body: { startDate, endDate },
      }),
    
    cancel: (id: number) =>
      fetchApiWithAuth<ApiResponse<MigrationJobDto>>(`/api/migration/${id}`, {
        method: 'DELETE',
      }),
  },
  
  health: () => 
    fetchApi<{ status: string; timestamp: string }>('/health'),
};
