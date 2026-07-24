import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/layout/AppShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/components/layout/Header', () => ({
  Header: () => <header>header</header>,
}));

vi.mock('@/components/layout/BottomNav', () => ({
  BottomNav: () => <nav>bottom navigation</nav>,
}));

describe('public live data boundary', () => {
  it('shows the public-source and excluded-field notice on the shared app shell', () => {
    render(<AppShell title="대신물류"><div>content</div></AppShell>);

    const notice = screen.getByRole('note', { name: '데이터 공개 범위' });
    expect(notice.textContent).toContain('공개 원천 기반 데이터');
    expect(notice.textContent).toContain('기준일·노선·건수·수량·운임·차량정보와 허용된 원천 URL');
    expect(notice.textContent).toContain('내부 ID와 credential URL은 제공하지 않습니다');
    expect(notice.textContent).toContain('링크를 아는 사람은 누구나 조회할 수 있습니다');
  });
});
