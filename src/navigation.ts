/** Tells listeners when the page's URL changes without a reload — most
 * customer sites are SPAs, and `history.pushState` fires no event of its own. */

const EVENT = 'alapai:navigate';

declare global {
  interface Window {
    __ALAPAI_NAV_PATCHED__?: boolean;
  }
}

const patchHistory = (): void => {
  // The loader and the app bundle each carry this module; patch once.
  if (window.__ALAPAI_NAV_PATCHED__) return;
  window.__ALAPAI_NAV_PATCHED__ = true;
  (['pushState', 'replaceState'] as const).forEach((method) => {
    const original = history[method];
    history[method] = function patched(this: History, ...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event(EVENT));
      return result;
    } as History[typeof method];
  });
};

/** Run `listener` on every in-page navigation; returns the unsubscribe. */
export const onNavigate = (listener: () => void): (() => void) => {
  patchHistory();
  const events = [EVENT, 'popstate', 'hashchange'];
  events.forEach((name) => window.addEventListener(name, listener));
  return () => events.forEach((name) => window.removeEventListener(name, listener));
};
