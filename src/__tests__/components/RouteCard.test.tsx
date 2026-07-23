import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RouteCard } from '@/components/data-display/RouteCard';
import type { RouteDto } from '@/types/api';

const route: RouteDto = {
  searchDate: '20250723',
  lineCode: '1001',
  lineName: '서울-부산',
  carCode: 'CAR-1',
  carNumber: '12가 3456',
  count: 4,
  quantity: 8,
  sectionFare: 50000,
  totalFare: 200000,
};

describe('RouteCard', () => {
  it('keeps the favorite action outside the route detail control', () => {
    const { container } = render(
      <RouteCard
        route={route}
        onRouteClick={vi.fn()}
        onFavoriteToggle={vi.fn()}
        isFavorite
      />
    );

    expect(container.querySelector('button button')).toBeNull();
  });
});
