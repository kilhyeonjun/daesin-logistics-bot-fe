import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1';
const API_KEY = process.env.API_KEY || '';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const DATE_SEGMENT = /^\d{8}$/;
const MIGRATION_ID_SEGMENT = /^[1-9]\d{0,9}$/;
const MAX_REQUEST_BODY_BYTES = 64 * 1024;
const MAX_PUBLIC_RESPONSE_BYTES = 2 * 1024 * 1024;
const REWRITTEN_ENTITY_HEADERS = [
  'content-encoding',
  'content-length',
  'content-md5',
  'content-type',
  'etag',
];

async function readStreamLimited(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number
): Promise<string> {
  if (!stream) return '';
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RangeError('Payload too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function isValidDateSegment(segment: string): boolean {
  if (!DATE_SEGMENT.test(segment)) return false;
  const year = Number(segment.slice(0, 4));
  const month = Number(segment.slice(4, 6));
  const day = Number(segment.slice(6, 8));
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isSafeDynamicSegment(segment: string): boolean {
  return segment.length > 0
    && segment.length <= 100
    && segment !== '.'
    && segment !== '..'
    && !/[/%\\?#\0]/.test(segment);
}

function isAllowedRequest(method: string, path: string[]): boolean {
  if (method === 'GET' && path.length === 1 && path[0] === 'health') return true;

  if (method === 'GET' && path.length === 4 && path[0] === 'api' && path[1] === 'routes') {
    if (path[2] === 'date') return isValidDateSegment(path[3]);
    if (path[2] === 'code' || path[2] === 'name' || path[2] === 'car') {
      return isSafeDynamicSegment(path[3]);
    }
  }

  if (method === 'GET' && path[0] === 'api' && path[1] === 'stats') {
    return (path.length === 3 && path[2] === 'monthly')
      || (path.length === 3 && isValidDateSegment(path[2]));
  }

  if (method === 'POST' && path.length === 3 && path[0] === 'api' && path[1] === 'auth' && path[2] === 'login') {
    return true;
  }
  if (method === 'GET' && path.length === 3 && path[0] === 'api' && path[1] === 'auth' && path[2] === 'me') {
    return true;
  }

  if (path[0] !== 'api' || path[1] !== 'migration') return false;
  if (path.length === 2) return method === 'GET' || method === 'POST';
  if (path.length !== 3) return false;
  if (path[2] === 'active') return method === 'GET';
  return MIGRATION_ID_SEGMENT.test(path[2]) && (method === 'GET' || method === 'DELETE');
}

function isPublicRoutePath(path: string[]): boolean {
  return path.length === 4 && path[0] === 'api' && path[1] === 'routes';
}

function exceedsDeclaredLength(headers: Headers, maxBytes: number): boolean {
  const raw = headers.get('content-length');
  if (!raw) return false;
  const length = Number(raw);
  return Number.isFinite(length) && length > maxBytes;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function matchesPublicUrl(
  value: unknown,
  hostname: string,
  pathname: string,
  expectedQuery: Record<string, string>
): value is string | null {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  const query = new URLSearchParams(expectedQuery).toString();
  return value === `http://${hostname}${pathname}?${query}`
    || value === `https://${hostname}${pathname}?${query}`;
}

function isPublicRoute(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const route = value as Record<string, unknown>;
  return typeof route.searchDate === 'string'
    && typeof route.lineCode === 'string'
    && (typeof route.lineName === 'string' || route.lineName === null)
    && isNullableString(route.carCode)
    && isNullableString(route.carNumber)
    && typeof route.count === 'number'
    && typeof route.quantity === 'number'
    && typeof route.sectionFare === 'number'
    && typeof route.totalFare === 'number'
    && matchesPublicUrl(
      route.raceInfoUrl,
      'logistics.ds3211.co.kr',
      '/daesin/jsp/zraceInfo/mobile/raceInfoPopup.jsp',
      { carNumber: route.carCode ?? '' }
    )
    && matchesPublicUrl(
      route.carDetailUrl,
      'logistics.ds3211.co.kr',
      '/daesin/jsp/total/lineGoodsTot_detail.jsp',
      { carcode: route.carCode ?? '' }
    )
    && matchesPublicUrl(
      route.waypointUrl,
      'www.ds3211.co.kr',
      '/mobile/loadPlan/list.jsp',
      { inputDate: route.searchDate, streetCode: route.lineCode }
    );
}

function maskPublicRoute(value: Record<string, unknown>): Record<string, unknown> {
  const route = value;
  return {
    searchDate: route.searchDate,
    lineCode: route.lineCode,
    lineName: route.lineName,
    carCode: route.carCode,
    carNumber: route.carNumber,
    count: route.count,
    quantity: route.quantity,
    sectionFare: route.sectionFare,
    totalFare: route.totalFare,
    raceInfoUrl: route.raceInfoUrl,
    carDetailUrl: route.carDetailUrl,
    trackingUrl: null,
    waypointUrl: route.waypointUrl,
  };
}

function buildBackendUrl(pathSegments: string[], search: string): URL {
  const baseUrl = new URL(BACKEND_URL);
  const pathname = pathSegments.map(encodeURIComponent).join('/');
  const url = new URL(`/${pathname}`, baseUrl);
  url.search = search;
  return url;
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  if (!isAllowedRequest(request.method, path)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const targetUrl = buildBackendUrl(path, request.nextUrl.search);

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  if (contentType) {
    headers.set('content-type', contentType);
  }
  if (authorization) {
    headers.set('authorization', authorization);
  }
  if (API_KEY) {
    headers.set('x-api-key', API_KEY);
  }

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (exceedsDeclaredLength(request.headers, MAX_REQUEST_BODY_BYTES)) {
      return Response.json({ error: 'Payload too large' }, { status: 413 });
    }
    try {
      if (request.body) {
        body = await readStreamLimited(request.body, MAX_REQUEST_BODY_BYTES);
      } else {
        body = await request.text();
        if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BODY_BYTES) {
          return Response.json({ error: 'Payload too large' }, { status: 413 });
        }
      }
    } catch (error) {
      if (error instanceof RangeError) {
        return Response.json({ error: 'Payload too large' }, { status: 413 });
      }
      throw error;
    }
  }

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
    redirect: 'error',
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  if (isPublicRoutePath(path) && upstreamResponse.ok) {
    if (exceedsDeclaredLength(upstreamResponse.headers, MAX_PUBLIC_RESPONSE_BYTES)) {
      return Response.json({ error: 'Invalid upstream response' }, { status: 502 });
    }

    let payload: unknown;
    try {
      const text = await readStreamLimited(upstreamResponse.body, MAX_PUBLIC_RESPONSE_BYTES);
      payload = JSON.parse(text);
    } catch {
      return Response.json({ error: 'Invalid upstream response' }, { status: 502 });
    }
    if (!Array.isArray(payload) || !payload.every(isPublicRoute)) {
      return Response.json({ error: 'Invalid upstream response' }, { status: 502 });
    }

    const maskedPayload = payload.map(maskPublicRoute);
    for (const header of REWRITTEN_ENTITY_HEADERS) {
      responseHeaders.delete(header);
    }
    return Response.json(maskedPayload, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export const dynamic = 'force-dynamic';

export const GET = proxyRequest;
export const POST = proxyRequest;
export const DELETE = proxyRequest;
