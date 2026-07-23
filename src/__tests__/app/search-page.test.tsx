import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SearchPage from '@/app/search/page';

let currentParams = new URLSearchParams('type=name&q=alpha');
const replaceMock = vi.fn();
const useRoutesMock = vi.fn((params: { type: string; query: string }) => {
  void params;
  return { data: [], isLoading: false, error: null, refetch: vi.fn() };
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentParams,
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/hooks', () => ({
  useRoutes: (params: { type: string; query: string }) => useRoutesMock(params),
  useRecentSearches: () => ({ addSearch: vi.fn() }),
}));

vi.mock('@/components/layout', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/data-display', () => ({
  RouteLedger: () => null,
  RouteDetail: () => null,
}));

vi.mock('@/components/input', () => ({
  SearchAutocomplete: ({ value }: { value: string }) => <input aria-label="검색어" value={value} readOnly />,
  SearchTabs: ({ value }: { value: string }) => <div data-testid="search-type">{value}</div>,
  SortSelect: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}));

describe('SearchPage URL synchronization', () => {
  beforeEach(() => {
    currentParams = new URLSearchParams('type=name&q=alpha');
    replaceMock.mockClear();
    useRoutesMock.mockClear();
  });

  it('reconciles UI and API state when history changes the query string', async () => {
    const { rerender } = render(<SearchPage />);

    expect((screen.getByLabelText('검색어') as HTMLInputElement).value).toBe('alpha');
    expect(screen.getByTestId('search-type').textContent).toBe('name');

    currentParams = new URLSearchParams('type=invalid&q=beta');
    rerender(<SearchPage />);

    await waitFor(() => {
      expect((screen.getByLabelText('검색어') as HTMLInputElement).value).toBe('beta');
      expect(screen.getByTestId('search-type').textContent).toBe('code');
      expect(useRoutesMock).toHaveBeenLastCalledWith({ type: 'code', query: 'beta' });
    });
  });
});
