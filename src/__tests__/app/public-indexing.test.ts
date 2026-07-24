import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('unlisted public indexing boundary', () => {
  it('publishes both meta and response-header noindex directives', async () => {
    const [layout, nextConfig] = await Promise.all([
      readFile('src/app/layout.tsx', 'utf8'),
      readFile('next.config.ts', 'utf8'),
    ]);

    expect(layout).toContain("robots: { index: false, follow: false }");
    expect(nextConfig).toContain("X-Robots-Tag");
    expect(nextConfig).toContain("noindex, nofollow");
  });
});
