import { deployment } from '../site.config';

/** Site-root path (`/tools/foo/`) → base-aware path (`/Indie-ai-tools/tools/foo/`). */
export function href(path = '/'): string {
  const base = import.meta.env.BASE_URL ?? '/';
  if (path === '/' || path === '') return base;
  return `${base}${path.replace(/^\/+/, '')}`;
}

/** Absolute URL for the deployed site, including the base path. */
export function absoluteUrl(path = '/'): string {
  const site = import.meta.env.SITE ?? deployment.url;
  return new URL(href(path), site).href;
}

export function hostname(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}
