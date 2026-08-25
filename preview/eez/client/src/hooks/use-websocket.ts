import { useState, useEffect, useCallback, useRef } from "react";
import { wsClient } from "@/lib/websocket";
import type { 
  WebSocketMessage, 
  OnlineUser, 
  TypingIndicator, 
  Message, 
  Channel, 
  Document,
  CursorPosition 
} from "@shared/schema";

export function useWebSocket(user: OnlineUser | null, channelId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<(Message & { user: OnlineUser })[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const hasJoined = useRef(false);

  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((message: WebSocketMessage) => {
      switch (message.type) {
        case "join":
          setOnlineUsers((prev) => {
            if (prev.find((u) => u.id === message.user.id)) {
              return prev;
            }
            return [...prev, message.user];
          });
          break;
        case "leave":
          setOnlineUsers((prev) => prev.filter((u) => u.id !== message.userId));
          setTypingIndicators((prev) => prev.filter((t) => t.userId !== message.userId));
          setCursors((prev) => prev.filter((c) => c.userId !== message.userId));
          break;
        case "message":
          setMessages((prev) => [...prev, message.message]);
          setTypingIndicators((prev) => 
            prev.filter((t) => t.userId !== message.message.userId)
          );
          break;
        case "typing":
          setTypingIndicators((prev) => {
            const existing = prev.findIndex((t) => t.userId === message.indicator.userId);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = message.indicator;
              return updated;
            }
            return [...prev, message.indicator];
          });
          break;
        case "typing_stop":
          setTypingIndicators((prev) => 
            prev.filter((t) => t.userId !== message.userId)
          );
          break;
        case "presence_update":
          setOnlineUsers(message.users);
          break;
        case "history":
          setMessages(message.messages);
          break;
        case "channels":
          setChannels(message.channels);
          break;
        case "document":
          setCurrentDocument(message.document);
          break;
        case "document_update":
          setCurrentDocument((prev) => 
            prev?.id === message.documentId 
              ? { ...prev, content: message.content }
              : prev
          );
          break;
        case "cursor_update":
          setCursors((prev) => {
            const existing = prev.findIndex((c) => c.userId === message.cursor.userId);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = message.cursor;
              return updated;
            }
            return [...prev, message.cursor];
          });
          break;
      }
    });

    const checkConnection = setInterval(() => {
      setIsConnected(wsClient.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  useEffect(() => {
    if (user && channelId && wsClient.isConnected() && !hasJoined.current) {
      wsClient.join(user, channelId);
      hasJoined.current = true;
    }
  }, [user, channelId]);

  const sendMessage = useCallback((content: string) => {
    if (channelId) {
      wsClient.sendMessage(content, channelId);
    }
  }, [channelId]);

  const sendTyping = useCallback((content: string) => {
    if (channelId) {
      wsClient.sendTyping(content, channelId);
    }
  }, [channelId]);

  const stopTyping = useCallback(() => {
    if (channelId) {
      wsClient.stopTyping(channelId);
    }
  }, [channelId]);

  const updateDocument = useCallback((documentId: string, content: string) => {
    wsClient.updateDocument(documentId, content);
  }, []);

  const updateCursor = useCallback((documentId: string, position: number, selection?: { start: number; end: number }) => {
    wsClient.updateCursor({ documentId, position, selection });
  }, []);

  return {
    isConnected,
    messages,
    onlineUsers,
    typingIndicators,
    channels,
    currentDocument,
    cursors,
    sendMessage,
    sendTyping,
    stopTyping,
    updateDocument,
    updateCursor,
  };
}
