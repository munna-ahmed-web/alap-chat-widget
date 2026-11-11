import React, { useState } from "react";
import type { LauncherIcon } from "../appearance";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  icon: LauncherIcon;
  iconUrl: string | null;
}

const CLOSE_PATH =
  "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

/** 24px paths — the same ones the dashboard's appearance preview draws
 * (message2order WidgetCard/appearance.ts LAUNCHER_ICON_PATHS). */
const ICON_PATHS: Record<Exclude<LauncherIcon, "image">, string> = {
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z",
  message:
    "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z",
  headset:
    "M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10a9 9 0 0 0-9-9z",
  sparkle:
    "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z",
};

export const ChatButton: React.FC<ChatButtonProps> = ({
  onClick,
  isOpen,
  icon,
  iconUrl,
}) => {
  // A picture that fails to load must not leave an empty button.
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = icon === "image" && !!iconUrl && !imageFailed;
  const path = isOpen
    ? CLOSE_PATH
    : ICON_PATHS[icon === "image" ? "chat" : icon];

  return (
    <button
      className="alapai-chat-button"
      onClick={onClick}
      aria-label="Toggle Chat"
    >
      {showImage && !isOpen ? (
        <img
          className="alapai-chat-button-img"
          src={iconUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <svg viewBox="0 0 24 24">
          <path d={path} />
        </svg>
      )}
    </button>
  );
};
