export interface RouteDto {
  id?: number;
  searchDate: string;
  lineCode: string;
  lineName: string | null;
  carCode: string | null;
  carNumber: string | null;
  count: number;
  quantity: number;
  sectionFare: number;
  totalFare: number;
  raceInfoUrl?: string | null;
  carDetailUrl?: string | null;
  trackingUrl?: string | null;
  waypointUrl?: string | null;
}

export interface StatsDto {
  totalRoutes: number;
  totalCount: number;
  totalQuantity: number;
  totalSectionFare: number;
  totalFare: number;
}

export interface SyncResultDto {
  success: boolean;
  count: number;
  date: string;
}

export type SearchType = 'code' | 'name' | 'car';

export interface RecentSearch {
  type: SearchType;
  query: string;
  timestamp: number;
}
