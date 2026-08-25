import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { OnlineUser, TypingIndicator, CursorPosition, WebSocketMessage } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

interface ConnectedClient {
  ws: WebSocket;
  user: OnlineUser;
  channelId: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws",
    maxPayload: 50 * 1024 * 1024  // 50MB max payload for media
  });
  const clients = new Map<string, ConnectedClient>();
  const typingIndicators = new Map<string, TypingIndicator>();
  const cursors = new Map<string, CursorPosition>();

  function broadcast(message: WebSocketMessage, excludeUserId?: string) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN && id !== excludeUserId) {
        client.ws.send(messageStr);
      }
    });
  }

  function broadcastToChannel(channelId: string, message: WebSocketMessage, excludeUserId?: string) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        client.channelId === channelId &&
        id !== excludeUserId
      ) {
        client.ws.send(messageStr);
      }
    });
  }

  function getOnlineUsers(): OnlineUser[] {
    return Array.from(clients.values()).map((c) => c.user);
  }

  wss.on("connection", (ws) => {
    let currentUserId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join": {
            const { user, channelId } = message;
            currentUserId = user.id;
            
            clients.set(user.id, { ws, user, channelId });

            broadcast({ type: "join", user, channelId }, user.id);

            const channels = await storage.getChannels();
            ws.send(JSON.stringify({ type: "channels", channels }));

            const messages = await storage.getMessages(channelId);
            const messagesWithUsers = messages.map((m) => ({
              ...m,
              user: {
                id: m.userId,
                username: m.userUsername,
                displayName: m.userDisplayName,
                avatarColor: m.userAvatarColor,
                isTyping: false,
                typingContent: "",
              },
            }));
            ws.send(JSON.stringify({ type: "history", messages: messagesWithUsers }));

            const onlineUsers = getOnlineUsers();
            broadcast({ type: "presence_update", users: onlineUsers });

            // Send current typing indicators to the new user
            typingIndicators.forEach((indicator) => {
              if (indicator.channelId === channelId && indicator.userId !== user.id) {
                ws.send(JSON.stringify({ type: "typing", indicator }));
              }
            });

            break;
          }

          case "leave": {
            const { userId } = message;
            clients.delete(userId);
            typingIndicators.delete(userId);
            cursors.delete(userId);
            broadcast({ type: "leave", userId });
            broadcast({ type: "presence_update", users: getOnlineUsers() });
            break;
          }

          case "message": {
            const { content, channelId, userId } = message;
            const client = clients.get(userId);
            
            if (client) {
              const newMessage = await storage.createMessage({
                channelId,
                userId,
                content,
              }, client.user);

              typingIndicators.delete(userId);

              broadcastToChannel(channelId, {
                type: "message",
                message: { ...newMessage, user: client.user },
              });
            }
            break;
          }

          case "typing": {
            const { indicator } = message;
            typingIndicators.set(indicator.userId, indicator);

            const client = clients.get(indicator.userId);
            if (client) {
              client.user.isTyping = true;
              client.user.typingContent = indicator.content;
            }

            broadcastToChannel(
              indicator.channelId,
              { type: "typing", indicator },
              indicator.userId
            );
            break;
          }

          case "typing_stop": {
            const { userId, channelId } = message;
            typingIndicators.delete(userId);

            const client = clients.get(userId);
            if (client) {
              client.user.isTyping = false;
              client.user.typingContent = "";
            }

            broadcastToChannel(
              channelId,
              { type: "typing_stop", userId, channelId },
              userId
            );
            break;
          }

          case "document_update": {
            const { documentId, content, userId } = message;
            await storage.updateDocument(documentId, content);
            
            broadcast(
              { type: "document_update", documentId, content, userId },
              userId
            );
            break;
          }

          case "cursor_update": {
            const { cursor } = message;
            cursors.set(cursor.userId, cursor);
            broadcast({ type: "cursor_update", cursor }, cursor.userId);
            break;
          }

          case "get_history": {
            const { channelId } = message;
            const messages = await storage.getMessages(channelId);
            const messagesWithUsers = messages.map((m) => ({
              ...m,
              user: {
                id: m.userId,
                username: m.userUsername,
                displayName: m.userDisplayName,
                avatarColor: m.userAvatarColor,
                isTyping: false,
                typingContent: "",
              },
            }));
            ws.send(JSON.stringify({ type: "history", messages: messagesWithUsers }));
            break;
          }

          case "get_document": {
            const { documentId } = message;
            const document = await storage.getDocument(documentId);
            if (document) {
              ws.send(JSON.stringify({ type: "document", document }));
            }
            break;
          }

          case "media": {
            const { media } = message;
            if (media && media.channelId) {
              console.log(`Broadcasting media: ${media.type} "${media.fileName}" to channel ${media.channelId}, URL length: ${media.url?.length || 0}`);
              broadcastToChannel(media.channelId, { type: "media", media }, media.userId);
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (currentUserId) {
        clients.delete(currentUserId);
        typingIndicators.delete(currentUserId);
        cursors.delete(currentUserId);
        broadcast({ type: "leave", userId: currentUserId });
        broadcast({ type: "presence_update", users: getOnlineUsers() });
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  app.get("/api/channels", async (req, res) => {
    const channels = await storage.getChannels();
    res.json(channels);
  });

  app.get("/api/channels/:channelId/messages", async (req, res) => {
    const { channelId } = req.params;
    const messages = await storage.getMessages(channelId);
    res.json(messages);
  });

  app.get("/api/documents/:documentId", async (req, res) => {
    const { documentId } = req.params;
    const document = await storage.getDocument(documentId);
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);

  return httpServer;
}
