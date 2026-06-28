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

function buildBackendUrl(pathSegments: string[], search: string): URL {
  const baseUrl = new URL(BACKEND_URL);
  const pathname = pathSegments.map(encodeURIComponent).join('/');
  const url = new URL(`/${pathname}`, baseUrl);
  url.search = search;
  return url;
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
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

  const body = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.text();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

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
