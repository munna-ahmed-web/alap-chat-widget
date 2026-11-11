import React from "react";
import { createRoot } from "react-dom/client";
import { ChatWidget } from "./widget/ChatWidget";
import widgetStyles from "./styles/widget.css?inline";
import { fetchAppearance } from "./appearance";
import { widgetStore } from "./store";
import { applyTheme } from "./theme";
import type {
  AlapaiWidgetAPI,
  AlapaiWidgetCommand,
  AlapaiWidgetConfig,
} from "./global";

const ROOT_ID = "alapai-widget-root";

const initWidget = async (config: AlapaiWidgetConfig): Promise<void> => {
  // Prevent multiple initializations
  if (document.getElementById(ROOT_ID)) {
    console.warn("AlapaiWidget is already initialized.");
    return;
  }

  // Claim the root before the config request, so a second init() made while
  // it is in flight is caught by the check above.
  const container = document.createElement("div");
  container.id = ROOT_ID;
  document.body.appendChild(container);

  const appearance = config.appearance ?? (await fetchAppearance(config.clientId));
  if (!appearance) {
    // This site may not show the widget (switched off / origin not allowed).
    container.remove();
    return;
  }

  applyTheme(container, appearance.primary_color);

  // Attach shadow DOM
  const shadowRoot = container.attachShadow({ mode: "open" });

  // Inject styles into shadow DOM
  const styleElement = document.createElement("style");
  styleElement.textContent = widgetStyles as string;
  shadowRoot.appendChild(styleElement);

  // Create mount point for React
  const mountPoint = document.createElement("div");
  shadowRoot.appendChild(mountPoint);

  // Render React app
  const root = createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <ChatWidget config={config} appearance={appearance} />
    </React.StrictMode>,
  );
};

const methods = {
  init: initWidget,
  hide: () => widgetStore.set({ hidden: true }),
  show: () => widgetStore.set({ hidden: false }),
  open: () => widgetStore.set({ open: true }),
  close: () => widgetStore.set({ open: false }),
};

// Expose to window
if (typeof window !== "undefined") {
  const api = Object.assign(
    (command: AlapaiWidgetCommand, ...args: unknown[]) => {
      const method = methods[command] as ((...a: unknown[]) => unknown) | undefined;
      if (typeof method === "function") method(...args);
      else console.warn(`AlapaiWidget: unknown command "${String(command)}"`);
    },
    methods,
  ) as AlapaiWidgetAPI;

  // Calls a page made through the loader's stub before this bundle arrived.
  const queued = (window.AlapaiWidget as AlapaiWidgetAPI | undefined)?.q ?? [];
  window.AlapaiWidget = api;
  queued.forEach((args) => {
    const [command, ...rest] = Array.from(args);
    api(command as AlapaiWidgetCommand, ...rest);
  });
}
