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

export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface MigrationJobDto {
  id: number;
  startDate: string;
  endDate: string;
  status: MigrationStatus;
  currentDate: string | null;
  totalDays: number;
  completedDays: number;
  progressPercent: number;
  errorMessage: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export type SearchType = 'code' | 'name' | 'car';

export interface RecentSearch {
  type: SearchType;
  query: string;
  timestamp: number;
}

export interface AdminDto {
  id: number;
  email: string;
  name: string | null;
}

export interface LoginResponseDto {
  success: boolean;
  token: string;
  admin: AdminDto;
}

export interface MeResponseDto {
  success: boolean;
  admin: AdminDto;
}

export interface DayStatsDto {
  totalRoutes: number;
  totalCount: number;
  totalQuantity: number;
  totalFare: number;
}

export interface MonthlyStatsDto {
  days: Record<string, DayStatsDto>;
}
