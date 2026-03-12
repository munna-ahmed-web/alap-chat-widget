export interface AlapaiWidgetConfig {
  clientId: string;
}

export interface AlapaiWidgetAPI {
  init: (config: AlapaiWidgetConfig) => void;
}

declare global {
  interface Window {
    AlapaiWidget: AlapaiWidgetAPI;
  }
}
