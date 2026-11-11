import React, { useEffect, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  images?: string[];
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  /** The owner's opening line — drawn locally, never sent to the server. */
  greeting?: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, greeting }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="alapai-message-list" ref={containerRef}>
      {greeting && (
        <div className="alapai-message agent">
          <span>{greeting}</span>
        </div>
      )}

      {!greeting && messages.length === 0 && !isTyping && (
        <div className="alapai-empty-state">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
          <p>No messages yet. Say hello!</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className={`alapai-message ${msg.role}`}>
          {msg.text && <span>{msg.text}</span>}
          {msg.images && msg.images.length > 0 && (
            <div className="alapai-message-images">
              {msg.images.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`attachment-${i + 1}`} className="alapai-message-img" />
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator — shown while agent is composing a reply */}
      {isTyping && (
        <div className="alapai-message agent alapai-typing-bubble">
          <span className="alapai-typing-dot" />
          <span className="alapai-typing-dot" />
          <span className="alapai-typing-dot" />
        </div>
      )}
    </div>
  );
};
