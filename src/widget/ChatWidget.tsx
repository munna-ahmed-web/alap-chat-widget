import React, { useState } from 'react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useWebSocket } from '../hooks/useWebSocket';
import type { AlapaiWidgetConfig } from '../global';

interface ChatWidgetProps {
  config: AlapaiWidgetConfig;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, status, isTyping, sendMessage } = useWebSocket(config.clientId);

  return (
    <div className="alapai-widget-container">
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        status={status}
        isTyping={isTyping}
      />
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(prev => !prev)} />
    </div>
  );
};
