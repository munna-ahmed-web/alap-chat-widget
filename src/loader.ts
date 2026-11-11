/**
 * widget-loader.js — the tiny script customers paste on their site:
 *
 *   <script src=".../chat/widget-loader.js" data-client-id="<public key>" async></script>
 *
 * It asks the backend how this widget should look, and only downloads the
 * React bundle when the widget may actually show on this page.
 */
import { fetchAppearance } from './appearance';
import { onNavigate } from './navigation';
import { isPathHidden } from './paths';
import type { AlapaiWidgetAPI } from './global';

// Not `widget-app.js`: that name still serves the pre-appearance bundle to
// pages holding a cached copy of the old loader.
const BUNDLE_FILE = 'widget-app-v2.js';
const CDN_BASE = 'https://alap-prod.sgp1.cdn.digitaloceanspaces.com/chat/';

const findScriptTag = (): HTMLScriptElement | null => {
  if (document.currentScript instanceof HTMLScriptElement) return document.currentScript;
  return document.querySelector<HTMLScriptElement>('script[data-client-id]');
};

const bundleUrl = (scriptTag: HTMLScriptElement): string => {
  // Next to the loader itself, so a local build loads its own bundle.
  try {
    return new URL(BUNDLE_FILE, scriptTag.src).href;
  } catch {
    return CDN_BASE + BUNDLE_FILE;
  }
};

/** Until the bundle arrives, `AlapaiWidget('hide')` etc. are queued. */
const installStub = (): void => {
  if (window.AlapaiWidget) return;
  const queue: ArrayLike<unknown>[] = [];
  const stub = function queueCall() {
    // eslint-disable-next-line prefer-rest-params -- replayed as-is by the bundle
    queue.push(arguments);
  } as unknown as AlapaiWidgetAPI;
  stub.q = queue;
  window.AlapaiWidget = stub;
};

const whenDomReady = (run: () => void): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
};

const start = async (): Promise<void> => {
  if (window.__ALAPAI_WIDGET_LOADER__) return;
  window.__ALAPAI_WIDGET_LOADER__ = true;

  const scriptTag = findScriptTag();
  const clientId = scriptTag?.getAttribute('data-client-id');
  if (!scriptTag || !clientId) {
    console.warn('Alapai Widget: clientId missing');
    return;
  }
  installStub();
  const src = bundleUrl(scriptTag);

  const appearance = await fetchAppearance(clientId);
  if (!appearance) return; // switched off, or this site is not allowed

  const loadBundle = (): void => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (typeof window.AlapaiWidget?.init === 'function') {
        void window.AlapaiWidget.init({ clientId, appearance });
      }
    };
    script.onerror = () => console.error(`Alapai Widget: failed to load ${BUNDLE_FILE}`);
    document.head.appendChild(script);
  };

  const hiddenHere = (): boolean =>
    isPathHidden(window.location.pathname, appearance.hidden_paths);

  whenDomReady(() => {
    if (!hiddenHere()) {
      loadBundle();
      return;
    }
    // A hidden page costs nothing — unless the visitor then moves, without a
    // reload, to a page where the widget belongs.
    const stop = onNavigate(() => {
      if (hiddenHere()) return;
      stop();
      loadBundle();
    });
  });
};

void start();
