import React, { useState } from "react";
import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";
import type { Message } from "./MessageList";
import type { AlapaiWidgetConfig } from "../global";

interface ChatWidgetProps {
  config: AlapaiWidgetConfig;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      text: `Hello! I'm your assistant. Client ID: ${config.clientId}. How can I help you today?`,
    },
  ]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = (text: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: "Thanks for your message! This is a demo response.",
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1000);
  };

  return (
    <div className="alapai-widget-container">
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
      <ChatButton isOpen={isOpen} onClick={toggleChat} />
    </div>
  );
};
