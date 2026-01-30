import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

describe('useFavorites hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('should load favorites from localStorage on mount', () => {
    const stored = JSON.stringify(['ROUTE001', 'ROUTE002']);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual(['ROUTE001', 'ROUTE002']);
  });

  it('should handle invalid JSON in localStorage', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid json');

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('should check if a route is favorite', () => {
    const stored = JSON.stringify(['ROUTE001']);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite('ROUTE001')).toBe(true);
    expect(result.current.isFavorite('ROUTE002')).toBe(false);
  });

  it('should toggle favorite on', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('ROUTE001');
    });

    expect(result.current.favorites).toContain('ROUTE001');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'favoriteRoutes',
      JSON.stringify(['ROUTE001'])
    );
  });

  it('should toggle favorite off', () => {
    const stored = JSON.stringify(['ROUTE001']);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('ROUTE001');
    });

    expect(result.current.favorites).not.toContain('ROUTE001');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'favoriteRoutes',
      JSON.stringify([])
    );
  });

  it('should add favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('ROUTE001');
    });

    expect(result.current.favorites).toContain('ROUTE001');
  });

  it('should not add duplicate favorite', () => {
    const stored = JSON.stringify(['ROUTE001']);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('ROUTE001');
    });

    expect(result.current.favorites).toEqual(['ROUTE001']);
  });

  it('should remove favorite', () => {
    const stored = JSON.stringify(['ROUTE001', 'ROUTE002']);
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(stored);

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.removeFavorite('ROUTE001');
    });

    expect(result.current.favorites).toEqual(['ROUTE002']);
  });
});
