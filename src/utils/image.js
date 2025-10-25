import { ENDPOINTS } from './endpoint';

/**
 * Normalize various image URL shapes returned by the API into a fetchable http(s) URL.
 * Accepts string or array. Picks first valid image if array.
 */
export function normalizeImageUrl(input) {
  try {
    let raw = input;
    if (Array.isArray(raw)) {
      raw = raw.find(Boolean) || '';
    }
    let url = String(raw || '').trim();
    if (!url) return '';

    // Replace Windows backslashes with forward slashes
    url = url.replace(/\\+/g, '/');

    // Force-upgrade absolute http URLs to https (temporary compatibility shim)
    if (/^http:\/\//i.test(url)) {
      url = url.replace(/^http:\/\//i, 'https://');
    }

    // If already absolute http(s)
    if (/^https?:\/\//i.test(url)) return url;

    // Protocol-relative
    if (/^\/\//.test(url)) return `https:${url}`;

    // If it looks like a data URI, return as-is
    if (/^data:/i.test(url)) return url;

    // Ensure leading slash for known relative asset paths
    const needsBase = /^(uploads|images|img|assets|public)\//i.test(url) || url.startsWith('/');
    if (needsBase) {
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${ENDPOINTS.live}${path}`;
    }

    // Fallback: attempt to treat as relative
    return `${ENDPOINTS.live}/${url}`;
  } catch (e) {
    return '';
  }
}
