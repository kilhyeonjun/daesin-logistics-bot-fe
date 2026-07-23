'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'favoriteRoutes';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate client-only persisted preferences after SSR
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
      setFavorites([]);
    }
  }, []);

  const isFavorite = useCallback(
    (lineCode: string) => favorites.includes(lineCode),
    [favorites]
  );

  const toggleFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(lineCode)
        ? prev.filter((code) => code !== lineCode)
        : [...prev, lineCode];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
      return next;
    });
  }, []);

  const addFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      if (prev.includes(lineCode)) return prev;
      const next = [...prev, lineCode];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      const next = prev.filter((code) => code !== lineCode);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
      }
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
