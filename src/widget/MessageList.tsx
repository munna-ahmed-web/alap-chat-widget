import React, { useEffect, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="alapai-message-list" ref={containerRef}>
      {messages.map((msg) => (
        <div key={msg.id} className={`alapai-message ${msg.role}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
};
