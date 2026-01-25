import type { RouteDto, StatsDto, MigrationJobDto, ApiResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

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
  
  migration: {
    getAll: () =>
      fetchApi<ApiResponse<MigrationJobDto[]>>('/api/migration'),
    
    getActive: () =>
      fetchApi<ApiResponse<MigrationJobDto | null>>('/api/migration/active'),
    
    getById: (id: number) =>
      fetchApi<ApiResponse<MigrationJobDto>>(`/api/migration/${id}`),
    
    start: (startDate: string, endDate: string) =>
      fetchApi<ApiResponse<MigrationJobDto>>('/api/migration', {
        method: 'POST',
        body: { startDate, endDate },
      }),
    
    cancel: (id: number) =>
      fetchApi<ApiResponse<MigrationJobDto>>(`/api/migration/${id}`, {
        method: 'DELETE',
      }),
  },
  
  health: () => 
    fetchApi<{ status: string; timestamp: string }>('/health'),
};
