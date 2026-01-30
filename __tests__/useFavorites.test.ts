import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('should load favorites from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(['LINE1', 'LINE2']));

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual(['LINE1', 'LINE2']);
  });

  it('should add favorite and persist to localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('LINE1');
    });

    expect(result.current.favorites).toContain('LINE1');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'favoriteRoutes',
      JSON.stringify(['LINE1'])
    );
  });

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('LINE1');
      result.current.addFavorite('LINE1');
    });

    expect(result.current.favorites.filter((f) => f === 'LINE1')).toHaveLength(1);
  });

  it('should remove favorite and update localStorage', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(['LINE1', 'LINE2']));

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.removeFavorite('LINE1');
    });

    expect(result.current.favorites).toEqual(['LINE2']);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'favoriteRoutes',
      JSON.stringify(['LINE2'])
    );
  });

  it('should toggle favorite on/off', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('LINE1');
    });
    expect(result.current.isFavorite('LINE1')).toBe(true);

    act(() => {
      result.current.toggleFavorite('LINE1');
    });
    expect(result.current.isFavorite('LINE1')).toBe(false);
  });

  it('should correctly check if item is favorite', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(['LINE1']));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.isFavorite('LINE1')).toBe(true);
    expect(result.current.isFavorite('LINE2')).toBe(false);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json');

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });
});
