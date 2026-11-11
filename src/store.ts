/** What the host page has asked of the widget through `AlapaiWidget(...)`.
 * Lives outside React so commands work before (and without) a mounted tree. */

export interface WidgetState {
  /** `AlapaiWidget('hide')` — separate from the hidden-paths rule. */
  hidden: boolean;
  open: boolean;
}

let state: WidgetState = { hidden: false, open: false };
const listeners = new Set<() => void>();

export const widgetStore = {
  get: (): WidgetState => state,
  set: (patch: Partial<WidgetState>): void => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
