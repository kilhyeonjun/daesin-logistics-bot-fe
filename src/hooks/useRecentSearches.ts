'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SearchType, RecentSearch } from '@/types/api';

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 10;

export interface SearchFrequency {
  type: SearchType;
  query: string;
  count: number;
  lastUsed: number;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [frequencies, setFrequencies] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentSearch[] = JSON.parse(stored);
        setSearches(parsed);
        
        const freqMap = new Map<string, number>();
        parsed.forEach((s) => {
          const key = `${s.type}:${s.query}`;
          freqMap.set(key, (freqMap.get(key) || 0) + 1);
        });
        setFrequencies(freqMap);
      }
    } catch (error) {
      console.error('Failed to load recent searches from localStorage:', error);
      setSearches([]);
      setFrequencies(new Map());
    }
  }, []);

  const addSearch = useCallback((type: SearchType, query: string) => {
    if (!query.trim()) return;

    setSearches((prev) => {
      const filtered = prev.filter(
        (s) => !(s.type === type && s.query.toLowerCase() === query.toLowerCase())
      );

      const newSearch: RecentSearch = {
        type,
        query: query.trim(),
        timestamp: Date.now(),
      };

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent search:', error);
      }
      
      return updated;
    });

    setFrequencies((prev) => {
      const key = `${type}:${query.toLowerCase().trim()}`;
      const newMap = new Map(prev);
      newMap.set(key, (prev.get(key) || 0) + 1);
      return newMap;
    });
  }, []);

  const removeSearch = useCallback((type: SearchType, query: string) => {
    setSearches((prev) => {
      const filtered = prev.filter(
        (s) => !(s.type === type && s.query === query)
      );
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('Failed to remove recent search:', error);
      }
      
      return filtered;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearches([]);
    setFrequencies(new Map());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }, []);

  const getSearchesByType = useCallback((type?: SearchType): RecentSearch[] => {
    if (!type) return searches;
    return searches.filter((s) => s.type === type);
  }, [searches]);

  const getPopularSearches = useCallback((type?: SearchType, limit = 5): SearchFrequency[] => {
    const filtered = type 
      ? searches.filter((s) => s.type === type)
      : searches;
    
    const groupedMap = new Map<string, SearchFrequency>();
    
    filtered.forEach((s) => {
      const key = `${s.type}:${s.query.toLowerCase()}`;
      const existing = groupedMap.get(key);
      
      if (existing) {
        existing.count = (frequencies.get(key) || 1);
        if (s.timestamp > existing.lastUsed) {
          existing.lastUsed = s.timestamp;
        }
      } else {
        groupedMap.set(key, {
          type: s.type,
          query: s.query,
          count: frequencies.get(key) || 1,
          lastUsed: s.timestamp,
        });
      }
    });

    return Array.from(groupedMap.values())
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }, [searches, frequencies]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearAll,
    getSearchesByType,
    getPopularSearches,
  };
}
