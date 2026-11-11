import type { WidgetAppearance } from './appearance';

export interface AlapaiWidgetConfig {
  clientId: string;
  /** Already fetched by the loader; `init` fetches it itself when absent. */
  appearance?: WidgetAppearance;
}

export type AlapaiWidgetCommand = 'init' | 'hide' | 'show' | 'open' | 'close';

/** Callable — `AlapaiWidget('hide')` — and also `AlapaiWidget.hide()`. */
export interface AlapaiWidgetAPI {
  (command: AlapaiWidgetCommand, ...args: unknown[]): void;
  init: (config: AlapaiWidgetConfig) => Promise<void>;
  hide: () => void;
  show: () => void;
  open: () => void;
  close: () => void;
  /** Calls queued by the loader's stub before this bundle arrived. */
  q?: ArrayLike<unknown>[];
}

declare global {
  interface Window {
    AlapaiWidget?: AlapaiWidgetAPI;
    __ALAPAI_WIDGET_LOADER__?: boolean;
  }
}
