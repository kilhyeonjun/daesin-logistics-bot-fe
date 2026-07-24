import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE, GET, POST } from '@/app/api/proxy/[...path]/route';

interface RequestOptions {
  method: 'GET' | 'POST' | 'DELETE';
  path: string[];
  search?: string;
  body?: string;
  authorization?: string;
  contentLength?: string;
}

function request({ method, path, search = '', body = '', authorization, contentLength }: RequestOptions) {
  const headers = new Headers();
  if (authorization) headers.set('authorization', authorization);
  if (body) headers.set('content-type', 'application/json');
  if (contentLength) headers.set('content-length', contentLength);

  return {
    method,
    headers,
    nextUrl: { search },
    text: vi.fn().mockResolvedValue(body),
    context: { params: Promise.resolve({ path }) },
  };
}

describe('public proxy contract', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    fetchMock.mockImplementation((url: URL) => {
      const payload = url.pathname.startsWith('/api/routes/')
        ? [{
            searchDate: '20260723', lineCode: '101102', lineName: '서울', carNumber: null,
            count: 1, quantity: 2, sectionFare: 3, totalFare: 4,
          }]
        : { ok: true };
      return Promise.resolve(new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails closed unless the exact method and path are part of the FE contract', async () => {
    const allowed = [
      request({ method: 'GET', path: ['health'] }),
      request({ method: 'GET', path: ['api', 'routes', 'code', '101102'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', '서울'] }),
      request({ method: 'GET', path: ['api', 'routes', 'car', '12가3456'] }),
      request({ method: 'GET', path: ['api', 'routes', 'date', '20260723'] }),
      request({ method: 'GET', path: ['api', 'stats', 'monthly'], search: '?yearMonth=202607' }),
      request({ method: 'GET', path: ['api', 'stats', '20260723'] }),
      request({ method: 'POST', path: ['api', 'auth', 'login'], body: '{}' }),
      request({ method: 'GET', path: ['api', 'auth', 'me'], authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration'], authorization: 'Bearer token' }),
      request({ method: 'POST', path: ['api', 'migration'], body: '{}', authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration', 'active'], authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration', '42'], authorization: 'Bearer token' }),
      request({ method: 'DELETE', path: ['api', 'migration', '42'], authorization: 'Bearer token' }),
    ];

    for (const item of allowed) {
      const handler = item.method === 'GET' ? GET : item.method === 'POST' ? POST : DELETE;
      const response = await handler(item as never, item.context);
      expect(response.status, `${item.method} /${item.context.params.then(({ path }) => path.join('/'))}`).toBe(200);
    }

    const blocked = [
      request({ method: 'POST', path: ['api', 'sync'], body: '{}' }),
      request({ method: 'POST', path: ['kakao', 'skill'], body: '{}' }),
      request({ method: 'GET', path: ['api', 'sync'] }),
      request({ method: 'GET', path: ['api', 'unknown'] }),
      request({ method: 'GET', path: ['API', 'routes', 'date', '20260723'] }),
      request({ method: 'POST', path: ['api', 'routes', 'date', '20260723'], body: '{}' }),
      request({ method: 'GET', path: ['api', 'routes', 'date', '..'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', '서울/경기'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', '서울\\경기'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', '%2Fapi%2Fsync'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', '%252Fapi%252Fsync'] }),
      request({ method: 'GET', path: ['api', 'routes', 'name', 'a'.repeat(101)] }),
      request({ method: 'GET', path: ['api', 'routes', 'date', '%32%30%32%36%30%37%32%33'] }),
      request({ method: 'GET', path: ['api', 'routes', 'date', '20260723%252F..%252Fsync'] }),
      request({ method: 'GET', path: ['api', 'stats', '20260230'] }),
      request({ method: 'DELETE', path: ['api', 'migration', 'active'], authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration', '42%252F..'], authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration', '0'], authorization: 'Bearer token' }),
      request({ method: 'GET', path: ['api', 'migration', '9'.repeat(101)], authorization: 'Bearer token' }),
    ];

    const callsBeforeBlockedRequests = fetchMock.mock.calls.length;
    for (const item of blocked) {
      const handler = item.method === 'GET' ? GET : item.method === 'POST' ? POST : DELETE;
      const response = await handler(item as never, item.context);
      expect(response.status).toBe(404);
    }
    expect(fetchMock).toHaveBeenCalledTimes(callsBeforeBlockedRequests);
  });

  it('publishes source-provided vehicle details while dropping unknown and credential-bearing fields', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{
      id: 7,
      searchDate: '20260723',
      lineCode: '101102',
      lineName: '서울',
      carCode: '494536',
      carNumber: '12가3456',
      count: 1,
      quantity: 2,
      sectionFare: 3,
      totalFare: 4,
      raceInfoUrl: 'https://public.example/race?carNumber=494536',
      carDetailUrl: 'https://public.example/car?carcode=494536',
      trackingUrl: 'https://track.example/?apiKey=TRACKING-SECRET',
      waypointUrl: 'https://public.example/waypoint?streetCode=101102',
      vehicleAccessToken: 'VEHICLE-SECRET',
      trackingMetadata: { authorization: 'TRACKING-SECRET' },
    }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    const item = request({ method: 'GET', path: ['api', 'routes', 'date', '20260723'] });
    const response = await GET(item as never, item.context);
    const [route] = await response.json();

    expect(route).toMatchObject({
      carCode: '494536',
      carNumber: '12가3456',
      raceInfoUrl: 'https://public.example/race?carNumber=494536',
      carDetailUrl: 'https://public.example/car?carcode=494536',
      trackingUrl: null,
      waypointUrl: 'https://public.example/waypoint?streetCode=101102',
    });
    expect(route).not.toHaveProperty('id');
    expect(route).not.toHaveProperty('vehicleAccessToken');
    expect(route).not.toHaveProperty('trackingMetadata');
    expect(JSON.stringify(route)).not.toContain('SECRET');
  });

  it('rejects redirects and oversized public request bodies', async () => {
    const login = request({
      method: 'POST',
      path: ['api', 'auth', 'login'],
      body: '{}',
      contentLength: String(64 * 1024 + 1),
    });
    const oversized = await POST(login as never, login.context);
    expect(oversized.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();

    const health = request({ method: 'GET', path: ['health'] });
    await GET(health as never, health.context);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'error' });
  });

  it('fails closed on malformed public route payloads and rewrites entity headers', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(['SECRET']), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    const malformed = request({ method: 'GET', path: ['api', 'routes', 'date', '20260723'] });
    const malformedResponse = await GET(malformed as never, malformed.context);
    expect(malformedResponse.status).toBe(502);
    expect(await malformedResponse.text()).not.toContain('SECRET');

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{
      searchDate: '20260723', lineCode: '101102', lineName: '서울', carNumber: '12가3456',
      count: 1, quantity: 2, sectionFare: 3, totalFare: 4,
    }]), {
      status: 200,
      headers: {
        'content-type': 'text/plain',
        'content-encoding': 'gzip',
        etag: 'secret-etag',
        'content-md5': 'secret-md5',
      },
    }));
    const valid = request({ method: 'GET', path: ['api', 'routes', 'date', '20260723'] });
    const response = await GET(valid as never, valid.context);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('content-encoding')).toBeNull();
    expect(response.headers.get('etag')).toBeNull();
    expect(response.headers.get('content-md5')).toBeNull();
    expect(JSON.stringify(await response.json())).toContain('12가3456');
  });
});
