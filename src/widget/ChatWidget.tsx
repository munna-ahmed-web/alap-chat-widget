import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useWebSocket } from '../hooks/useWebSocket';
import { onNavigate } from '../navigation';
import { isPathHidden } from '../paths';
import { widgetStore } from '../store';
import type { WidgetAppearance } from '../appearance';
import type { AlapaiWidgetConfig } from '../global';

interface ChatWidgetProps {
  config: AlapaiWidgetConfig;
  appearance: WidgetAppearance;
}

interface ChatSessionProps extends ChatWidgetProps {
  hidden: boolean;
  isOpen: boolean;
}

/** The chat itself. Mounting it opens the socket, so it mounts lazily. */
const ChatSession: React.FC<ChatSessionProps> = ({
  config,
  appearance,
  hidden,
  isOpen,
}) => {
  const { messages, status, isTyping, sendMessage } = useWebSocket(config.clientId);

  return (
    <div
      className={`alapai-widget-container pos-${appearance.position}`}
      style={hidden ? { display: 'none' } : undefined}
    >
      <ChatWindow
        isOpen={isOpen}
        onClose={() => widgetStore.set({ open: false })}
        title={appearance.title}
        greeting={appearance.greeting}
        messages={messages}
        onSendMessage={sendMessage}
        status={status}
        isTyping={isTyping}
      />
      <ChatButton
        isOpen={isOpen}
        icon={appearance.icon}
        iconUrl={appearance.icon_url}
        onClick={() => widgetStore.set({ open: !isOpen })}
      />
    </div>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, appearance }) => {
  const { hidden: hiddenByPage, open } = useSyncExternalStore(
    widgetStore.subscribe,
    widgetStore.get,
  );
  const hiddenPaths = appearance.hidden_paths;
  const hiddenByPath = useSyncExternalStore(
    onNavigate,
    useCallback(
      () => isPathHidden(window.location.pathname, hiddenPaths),
      [hiddenPaths],
    ),
  );
  const hidden = hiddenByPage || hiddenByPath;

  // No socket (and no conversation on the backend) for a visitor who only
  // ever sees pages where the widget is hidden. Once shown it stays mounted,
  // so hiding and re-showing keeps the chat.
  const [everShown, setEverShown] = useState(!hidden);
  if (!hidden && !everShown) setEverShown(true);
  if (!everShown) return null;

  return (
    <ChatSession
      config={config}
      appearance={appearance}
      hidden={hidden}
      isOpen={open}
    />
  );
};
