import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from '@/hooks/useRecentSearches';

describe('useRecentSearches hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('should initialize with empty searches', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.searches).toEqual([]);
  });

  it('should load searches from localStorage on mount', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
      { type: 'name', query: '서울', timestamp: 2000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.searches).toHaveLength(2);
  });

  it('should handle invalid JSON in localStorage', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid json');

    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.searches).toEqual([]);
  });

  it('should add a search and save to localStorage', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('code', 'ROUTE001');
    });

    expect(result.current.searches).toHaveLength(1);
    expect(result.current.searches[0].query).toBe('ROUTE001');
    expect(result.current.searches[0].type).toBe('code');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should not add empty search', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('code', '');
      result.current.addSearch('code', '   ');
    });

    expect(result.current.searches).toEqual([]);
  });

  it('should remove duplicate searches and keep most recent', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('code', 'ROUTE001');
    });

    expect(result.current.searches).toHaveLength(1);
    expect(result.current.searches[0].timestamp).toBeGreaterThan(1000);
  });

  it('should limit to 10 recent searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addSearch('code', `ROUTE${i.toString().padStart(3, '0')}`);
      }
    });

    expect(result.current.searches).toHaveLength(10);
  });

  it('should remove a specific search', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
      { type: 'code', query: 'ROUTE002', timestamp: 2000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.removeSearch('code', 'ROUTE001');
    });

    expect(result.current.searches).toHaveLength(1);
    expect(result.current.searches[0].query).toBe('ROUTE002');
  });

  it('should clear all searches', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
      { type: 'code', query: 'ROUTE002', timestamp: 2000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.searches).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith('recentSearches');
  });

  it('should filter searches by type', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
      { type: 'name', query: '서울', timestamp: 2000 },
      { type: 'code', query: 'ROUTE002', timestamp: 3000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.getSearchesByType('code')).toHaveLength(2);
    expect(result.current.getSearchesByType('name')).toHaveLength(1);
  });

  it('should get popular searches sorted by frequency', () => {
    const stored = JSON.stringify([
      { type: 'code', query: 'ROUTE001', timestamp: 1000 },
      { type: 'code', query: 'ROUTE002', timestamp: 2000 },
      { type: 'code', query: 'ROUTE001', timestamp: 3000 },
    ]);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useRecentSearches());

    const popular = result.current.getPopularSearches('code');
    expect(popular[0].query).toBe('ROUTE001');
  });
});
