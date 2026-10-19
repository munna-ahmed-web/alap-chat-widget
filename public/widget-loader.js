(function () {
  /* Prevent loader running twice */
  if (window.__ALAPAI_WIDGET_LOADER__) return;
  window.__ALAPAI_WIDGET_LOADER__ = true;

  /* Find the script tag that loaded this file */
  var scriptTag = document.currentScript;

  /* Fallback for older browsers */
  if (!scriptTag) {
    var scripts = document.getElementsByTagName("script");
    scriptTag = scripts[scripts.length - 1];
  }

  /* Read configuration from attributes */
  var clientId = scriptTag.getAttribute("data-client-id");

  if (!clientId) {
    console.warn("Alapai Widget: clientId missing");
    return;
  }

  /* Configuration object */
  var config = {
    clientId: clientId,
  };

  /* Queue system (commands before widget loads) */
  window.AlapaiWidget =
    window.AlapaiWidget ||
    function () {
      (window.AlapaiWidget.q = window.AlapaiWidget.q || []).push(arguments);
    };

  /* Load main widget bundle */
  function loadWidget() {
    var script = document.createElement("script");

    script.src =
      "https://alap-prod.sgp1.cdn.digitaloceanspaces.com/chat/widget-app.js";
    script.async = true;
    script.type = "text/javascript";

    script.onload = function () {
      if (
        window.AlapaiWidget &&
        typeof window.AlapaiWidget.init === "function"
      ) {
        window.AlapaiWidget.init(config);

        /* Execute queued commands if any */
        var queue = window.AlapaiWidget.q || [];
        queue.forEach(function (args) {
          if (typeof window.AlapaiWidget[args[0]] === "function") {
            window.AlapaiWidget[args[0]].apply(null, args.slice(1));
          }
        });

        window.AlapaiWidget.q = [];
      }
    };

    script.onerror = function () {
      console.error("Alapai Widget: failed to load widget-app.js");
    };

    document.head.appendChild(script);
  }

  /* Load widget after page ready */
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    loadWidget();
  } else {
    document.addEventListener("DOMContentLoaded", loadWidget);
  }
})();
