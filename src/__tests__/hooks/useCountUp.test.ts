import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCountUp } from '@/hooks/useCountUp';

describe('useCountUp hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with 0 when startOnMount is true', () => {
    const { result } = renderHook(() => useCountUp(100));
    expect(result.current.count).toBe(0);
    expect(result.current.isAnimating).toBe(true);
  });

  it('should start with end value when startOnMount is false', () => {
    const { result } = renderHook(() => useCountUp(100, { startOnMount: false }));
    expect(result.current.count).toBe(100);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should handle end value of 0', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current.count).toBe(0);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should animate to end value over time', async () => {
    vi.useRealTimers();
    
    const { result } = renderHook(() => useCountUp(100, { duration: 100 }));

    expect(result.current.count).toBe(0);
    expect(result.current.isAnimating).toBe(true);

    await waitFor(() => {
      expect(result.current.count).toBe(100);
    }, { timeout: 500 });

    expect(result.current.isAnimating).toBe(false);
  });

  it('should cleanup animation frame on unmount', () => {
    vi.useRealTimers();
    const cancelSpy = vi.spyOn(global, 'cancelAnimationFrame');

    const { unmount } = renderHook(() => useCountUp(100));
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  it('should respect custom duration', async () => {
    vi.useRealTimers();
    const startTime = Date.now();
    
    const { result } = renderHook(() => useCountUp(50, { duration: 50 }));

    await waitFor(() => {
      expect(result.current.count).toBe(50);
    }, { timeout: 200 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(200);
  });
});
