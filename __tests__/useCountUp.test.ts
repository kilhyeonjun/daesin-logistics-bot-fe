import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountUp } from '@/hooks/useCountUp';

describe('useCountUp', () => {
  it('should start at 0 when startOnMount is true (default)', () => {
    const { result } = renderHook(() => useCountUp(100));
    expect(result.current.count).toBe(0);
  });

  it('should start at end value when startOnMount is false', () => {
    const { result } = renderHook(() => useCountUp(100, { startOnMount: false }));
    expect(result.current.count).toBe(100);
  });

  it('should set isAnimating to true when animation starts', () => {
    const { result } = renderHook(() => useCountUp(100, { duration: 1000 }));
    expect(result.current.isAnimating).toBe(true);
  });

  it('should handle end value of 0', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current.count).toBe(0);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should not animate when startOnMount is false', () => {
    const { result } = renderHook(() => useCountUp(100, { startOnMount: false }));
    expect(result.current.count).toBe(100);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should accept custom duration option', () => {
    const { result } = renderHook(() => useCountUp(100, { duration: 500 }));
    expect(result.current.count).toBe(0);
    expect(result.current.isAnimating).toBe(true);
  });
});
