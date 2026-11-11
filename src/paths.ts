/** Hidden-path matching — the browser half of `WebsiteWidget.hidden_paths`
 * (the backend stores them normalised: leading slash, no trailing slash). */

const trimSlash = (path: string): string =>
  path.length > 1 ? path.replace(/\/+$/, '') || '/' : path;

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matches = (path: string, pattern: string): boolean => {
  // `/shop/*` reads as "the shop and everything in it", same as plain `/shop`.
  const plain = pattern.endsWith('/*') ? pattern.slice(0, -2) || '/' : pattern;
  if (!plain.includes('*')) {
    // `/` alone means the home page only — as a prefix it would hide the
    // widget on the whole site, which is what switching it off is for.
    if (plain === '/') return path === '/';
    return path === plain || path.startsWith(`${plain}/`);
  }
  const source = plain.split('*').map(escapeRegExp).join('.*');
  return new RegExp(`^${source}(/.*)?$`).test(path);
};

export const isPathHidden = (
  pathname: string,
  patterns: readonly string[],
): boolean => {
  const path = trimSlash(pathname || '/');
  return patterns.some((raw) => {
    const pattern = trimSlash((raw || '').trim());
    return pattern !== '' && matches(path, pattern);
  });
};
