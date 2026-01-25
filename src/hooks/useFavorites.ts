'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'favoriteRoutes';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      if (prev.includes(lineCode)) return prev;
      const next = [...prev, lineCode];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFavorite = useCallback((lineCode: string) => {
    setFavorites((prev) => {
      const next = prev.filter((code) => code !== lineCode);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
