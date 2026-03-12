import React from "react";
import { MessageList, type Message } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}) => {
  return (
    <div className={`alapai-chat-window ${isOpen ? "open" : ""}`}>
      <div className="alapai-chat-header">
        <span>Chat Support</span>
        <button onClick={onClose} aria-label="Close Chat">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
      <MessageList messages={messages} />
      <MessageInput onSend={onSendMessage} />
    </div>
  );
};
