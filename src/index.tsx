import React from "react";
import { createRoot } from "react-dom/client";
import { ChatWidget } from "./widget/ChatWidget";
import widgetStyles from "./styles/widget.css?inline";
import type { AlapaiWidgetConfig } from "./global";

const initWidget = (config: AlapaiWidgetConfig) => {
  // Prevent multiple initializations
  if (document.getElementById("alapai-widget-root")) {
    console.warn("AlapaiWidget is already initialized.");
    return;
  }

  // Create host container
  const container = document.createElement("div");
  container.id = "alapai-widget-root";
  // It's usually better to attach to body
  document.body.appendChild(container);

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
      <ChatWidget config={config} />
    </React.StrictMode>,
  );
};

// Expose to window
if (typeof window !== "undefined") {
  window.AlapaiWidget = {
    init: initWidget,
  };
}
