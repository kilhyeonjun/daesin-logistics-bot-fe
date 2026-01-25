import type { RouteDto, StatsDto } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
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
  
  health: () => 
    fetchApi<{ status: string; timestamp: string }>('/health'),
};
