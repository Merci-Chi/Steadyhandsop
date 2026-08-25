import type { WebSocketMessage, OnlineUser, TypingIndicator, CursorPosition, Message, Channel, Document } from "@shared/schema";

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentUser: OnlineUser | null = null;
  private currentChannelId: string | null = null;

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      if (this.currentUser && this.currentChannelId) {
        this.join(this.currentUser, this.currentChannelId);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private send(message: object) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  subscribe(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  join(user: OnlineUser, channelId: string) {
    this.currentUser = user;
    this.currentChannelId = channelId;
    this.send({ type: "join", user, channelId });
  }

  leave() {
    if (this.currentUser) {
      this.send({ type: "leave", userId: this.currentUser.id });
    }
  }

  sendMessage(content: string, channelId: string) {
    if (this.currentUser) {
      this.send({
        type: "message",
        content,
        channelId,
        userId: this.currentUser.id,
      });
    }
  }

  sendTyping(content: string, channelId: string) {
    if (this.currentUser) {
      this.send({
        type: "typing",
        indicator: {
          userId: this.currentUser.id,
          username: this.currentUser.username,
          displayName: this.currentUser.displayName,
          avatarColor: this.currentUser.avatarColor,
          content,
          channelId,
        },
      });
    }
  }

  stopTyping(channelId: string) {
    if (this.currentUser) {
      this.send({
        type: "typing_stop",
        userId: this.currentUser.id,
        channelId,
      });
    }
  }

  updateDocument(documentId: string, content: string) {
    if (this.currentUser) {
      this.send({
        type: "document_update",
        documentId,
        content,
        userId: this.currentUser.id,
      });
    }
  }

  updateCursor(cursor: Omit<CursorPosition, "userId" | "displayName" | "avatarColor">) {
    if (this.currentUser) {
      this.send({
        type: "cursor_update",
        cursor: {
          ...cursor,
          userId: this.currentUser.id,
          displayName: this.currentUser.displayName,
          avatarColor: this.currentUser.avatarColor,
        },
      });
    }
  }

  requestHistory(channelId: string) {
    this.send({ type: "get_history", channelId });
  }

  requestDocument(documentId: string) {
    this.send({ type: "get_document", documentId });
  }

  sendMediaMessage(media: object) {
    this.send({ type: "media", media });
  }

  disconnect() {
    this.leave();
    this.socket?.close();
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
