import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../widget/MessageList';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

interface UseWebSocketReturn {
  messages: Message[];
  status: ConnectionStatus;
  isTyping: boolean;
  sendMessage: (text: string, images?: string[]) => void;
}

const WS_BASE = 'wss://api.alapai.app/ws/widget/';
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000;

export function useWebSocket(clientId: string): UseWebSocketReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReadyRef = useRef(false);
  const connectRef = useRef<() => void>(() => { /* assigned below */ });

  const sessionKey = `alapai_session_${clientId}`;

  const appendMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  useEffect(() => {
    const connect = () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }

      setStatus('connecting');
      setIsTyping(false);
      isReadyRef.current = false;

      const url = `${WS_BASE}?key=${encodeURIComponent(clientId)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        const savedSessionId = localStorage.getItem(sessionKey) ?? '';
        ws.send(JSON.stringify({ type: 'init', session_id: savedSessionId }));
      };

      ws.onmessage = (event: MessageEvent) => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(event.data as string) as Record<string, unknown>;
        } catch {
          console.warn('[AlapaiWidget] Non-JSON message:', event.data);
          return;
        }

        const type = data['type'] as string;

        if (type === 'init_ok') {
          const sessionId = data['session_id'] as string | undefined;
          if (sessionId) localStorage.setItem(sessionKey, sessionId);
          retryCountRef.current = 0;
          isReadyRef.current = true;
          setStatus('connected');
        } else if (type === 'typing') {
          // Agent is typing — show the animated indicator
          setIsTyping(true);
        } else if (type === 'message') {
          // Incoming agent message — clear typing indicator first
          setIsTyping(false);
          const text = (data['text'] as string) ?? '';
          const images = data['images'] as string[] | undefined;
          appendMessage({
            id: `agent-${Date.now()}`,
            role: 'agent',
            text,
            images,
          });
        } else if (type === 'error') {
          console.error('[AlapaiWidget] Server error:', data['message']);
          setIsTyping(false);
          setStatus('error');
        }
      };

      ws.onerror = () => {
        setStatus('error');
        setIsTyping(false);
      };

      ws.onclose = () => {
        isReadyRef.current = false;
        setIsTyping(false);
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCountRef.current);
          retryCountRef.current += 1;
          setStatus('connecting');
          retryTimerRef.current = setTimeout(() => {
            connectRef.current();
          }, delay);
        } else {
          setStatus('disconnected');
        }
      };
    };

    connectRef.current = connect;
    connect();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [clientId, sessionKey, appendMessage]);

  const sendMessage = useCallback((text: string, images?: string[]) => {
    if (!isReadyRef.current || wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('[AlapaiWidget] Cannot send: not connected.');
      return;
    }

    appendMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      images,
    });

    const payload: Record<string, unknown> = { type: 'message', text };
    if (images && images.length > 0) {
      payload['images'] = images.slice(0, 5);
    }
    wsRef.current!.send(JSON.stringify(payload));
  }, [appendMessage]);

  return { messages, status, isTyping, sendMessage };
}
