/// <reference types='vite/client' />

const DEFAULT_BASE = 'http://localhost:3001/api';
const rawBase = (import.meta.env.VITE_API_URL ?? DEFAULT_BASE) || DEFAULT_BASE;
const API_BASE = rawBase.replace(/\/$/, '');

function shouldRewrite(path: string): boolean {
  return path.startsWith('/api');
}

function rewritePath(path: string): string {
  const normalizedBase = API_BASE.replace(/\/$/, '');

  if (path.startsWith('/api')) {
    if (normalizedBase.endsWith('/api')) {
      const suffix = path.replace(/^\/api/, '') || '';
      return `${normalizedBase}${suffix}`;
    }
    return `${normalizedBase}${path}`;
  }

  if (path.startsWith('/')) {
    return `${normalizedBase}${path}`;
  }

  return `${normalizedBase}/${path}`;
}
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (!API_BASE) {
      return originalFetch(input as RequestInfo, init);
    }

    if (typeof input === 'string') {
      if (shouldRewrite(input)) {
        return originalFetch(rewritePath(input), init);
      }
      return originalFetch(input, init);
    }

    if (input instanceof URL) {
      const urlString = input.toString();
      const origin = window.location.origin;
      if (shouldRewrite(urlString.replace(origin, ''))) {
        const rewritten = rewritePath(urlString.replace(origin, ''));
        return originalFetch(rewritten, init);
      }
      return originalFetch(input, init);
    }

    if (input instanceof Request) {
      const urlString = input.url;
      const origin = window.location.origin;
      const relativePath = urlString.startsWith(origin)
        ? urlString.substring(origin.length)
        : urlString;

      if (shouldRewrite(relativePath)) {
        const rewrittenUrl = rewritePath(relativePath);
        const rebuiltRequest = new Request(rewrittenUrl, input);
        return originalFetch(rebuiltRequest, init);
      }

      return originalFetch(input, init);
    }

    return originalFetch(input as RequestInfo, init);
  };
}
