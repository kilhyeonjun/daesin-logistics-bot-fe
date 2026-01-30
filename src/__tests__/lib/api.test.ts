import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getToken, setToken, clearToken, api } from '@/lib/api';

// Mock document.cookie
let mockCookie = '';
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie,
  set: (value: string) => { mockCookie = value; },
  configurable: true,
});

describe('Token Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookie = '';
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('test-token');
      expect(getToken()).toBe('test-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('admin_token');
    });

    it('should return null when no token exists', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should save token to localStorage', () => {
      setToken('new-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('admin_token', 'new-token');
    });

    it('should set cookie with token', () => {
      setToken('new-token');
      expect(mockCookie).toContain('admin_token=new-token');
      expect(mockCookie).toContain('path=/');
    });
  });

  describe('clearToken', () => {
    it('should remove token from localStorage', () => {
      clearToken();
      expect(localStorage.removeItem).toHaveBeenCalledWith('admin_token');
    });

    it('should clear cookie', () => {
      clearToken();
      expect(mockCookie).toContain('max-age=0');
    });
  });
});

describe('API Client', () => {
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('api.routes', () => {
    it('should search routes by code', async () => {
      const routes = [{ lineCode: 'TEST001' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(routes),
      });

      const result = await api.routes.searchByCode('TEST001');
      expect(result).toEqual(routes);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/routes/code/TEST001'),
        expect.any(Object)
      );
    });

    it('should search routes by name', async () => {
      const routes = [{ lineName: '테스트노선' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(routes),
      });

      const result = await api.routes.searchByName('테스트');
      expect(result).toEqual(routes);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/routes/name/'),
        expect.any(Object)
      );
    });

    it('should search routes by car number', async () => {
      const routes = [{ carNumber: '12가3456' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(routes),
      });

      const result = await api.routes.searchByCar('12가3456');
      expect(result).toEqual(routes);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/routes/car/'),
        expect.any(Object)
      );
    });

    it('should get routes by date', async () => {
      const routes = [{ date: '2024-01-01' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(routes),
      });

      const result = await api.routes.getByDate('2024-01-01');
      expect(result).toEqual(routes);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/routes/date/2024-01-01'),
        expect.any(Object)
      );
    });
  });

  describe('api.stats', () => {
    it('should get stats by date', async () => {
      const stats = { totalRoutes: 100, completedRoutes: 80 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(stats),
      });

      const result = await api.stats.getByDate('2024-01-01');
      expect(result).toEqual(stats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/stats/2024-01-01'),
        expect.any(Object)
      );
    });
  });

  describe('api.auth', () => {
    it('should login with credentials', async () => {
      const loginResponse = { token: 'jwt-token', user: { email: 'test@test.com' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(loginResponse),
      });

      const result = await api.auth.login('test@test.com', 'password');
      expect(result).toEqual(loginResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
        })
      );
    });
  });

  describe('api.health', () => {
    it('should check health status', async () => {
      const health = { status: 'ok', timestamp: '2024-01-01T00:00:00Z' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(health),
      });

      const result = await api.health();
      expect(result).toEqual(health);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      await expect(api.routes.searchByCode('INVALID')).rejects.toThrow('Not found');
    });

    it('should throw generic error when no error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Parse error')),
      });

      await expect(api.routes.searchByCode('TEST')).rejects.toThrow('API Error: 500');
    });
  });
});
