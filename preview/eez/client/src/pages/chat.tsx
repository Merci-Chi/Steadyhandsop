import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { WaterBackground } from "@/components/water-background";
import { LiveBubble, MessageBubble } from "@/components/live-bubble";
import { MediaBubble } from "@/components/media-bubble";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/ui/avatar-user";
import { InsertMenu } from "@/components/insert-menu";
import { useLocalUser } from "@/hooks/use-local-user";
import { wsClient } from "@/lib/websocket";
import { Waves, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnlineUser, TypingIndicator, WebSocketMessage, MediaMessage } from "@shared/schema";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  timestamp: Date;
}

const ROOM_ID = "main-room";

export default function ChatPage() {
  const { user, isLoading, createUser } = useLocalUser();
  const [inChat, setInChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [otherUsers, setOtherUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [mediaMessages, setMediaMessages] = useState<MediaMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasJoined = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, mediaMessages, currentTyping, typingUsers, scrollToBottom]);

  // Connect to WebSocket and handle messages
  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((message: WebSocketMessage) => {
      switch (message.type) {
        case "join":
          setOtherUsers(prev => {
            if (prev.find(u => u.id === message.user.id)) return prev;
            return [...prev, message.user];
          });
          break;

        case "leave":
          setOtherUsers(prev => prev.filter(u => u.id !== message.userId));
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(message.userId);
            return updated;
          });
          break;

        case "presence_update":
          setOtherUsers(message.users.filter(u => u.id !== user?.id));
          break;

        case "message":
          const msg = message.message;
          setMessages(prev => [...prev, {
            id: msg.id,
            content: msg.content,
            senderId: msg.userId,
            senderName: msg.user.displayName,
            senderColor: msg.user.avatarColor,
            timestamp: new Date(msg.timestamp),
          }]);
          // Clear typing indicator for this user
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(msg.userId);
            return updated;
          });
          break;

        case "typing":
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.set(message.indicator.userId, message.indicator);
            return updated;
          });
          break;

        case "typing_stop":
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(message.userId);
            return updated;
          });
          break;

        case "history":
          setMessages(message.messages.map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.userId,
            senderName: m.user.displayName,
            senderColor: m.user.avatarColor,
            timestamp: new Date(m.timestamp),
          })));
          break;

        case "media":
          console.log("Received media:", message.media.type, message.media.fileName, "URL length:", message.media.url?.length);
          setMediaMessages(prev => [...prev, {
            ...message.media,
            timestamp: new Date(message.media.timestamp),
          }]);
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
  }, [user?.id]);

  // Join room when entering chat
  useEffect(() => {
    if (user && inChat && wsClient.isConnected() && !hasJoined.current) {
      const onlineUser: OnlineUser = {
        id: user.id,
        username: user.username || "user",
        displayName: user.displayName,
        avatarColor: user.avatarColor,
        isTyping: false,
        typingContent: "",
      };
      wsClient.join(onlineUser, ROOM_ID);
      hasJoined.current = true;
    }
  }, [user, inChat, isConnected]);

  const compressImage = useCallback(async (file: File, maxWidth = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const extractVideoThumbnail = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        video.currentTime = 0.5;
      };
      
      video.onseeked = () => {
        const maxWidth = 400;
        let { videoWidth: width, videoHeight: height } = video;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(video, 0, 0, width, height);
        URL.revokeObjectURL(video.src);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
      video.load();
    });
  }, []);

  const handleInsert = useCallback(async (type: "image" | "video" | "file", file: File) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const mediaMessage: MediaMessage = {
        id: crypto.randomUUID(),
        userId: user.id,
        username: user.username || "user",
        displayName: user.displayName,
        avatarColor: user.avatarColor,
        channelId: ROOM_ID,
        type,
        url: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        timestamp: new Date(),
      };
      
      console.log("Sending media:", mediaMessage.type, mediaMessage.fileName, "URL length:", mediaMessage.url?.length);
      wsClient.sendMediaMessage(mediaMessage);
      setMediaMessages(prev => [...prev, mediaMessage]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  }, [user, compressImage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && currentTyping.trim()) {
      e.preventDefault();
      
      // Send message via WebSocket
      wsClient.sendMessage(currentTyping.trim(), ROOM_ID);
      wsClient.stopTyping(ROOM_ID);
      setCurrentTyping("");
    }
  }, [currentTyping]);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCurrentTyping(newContent);
    
    // Broadcast typing to other users
    if (newContent) {
      wsClient.sendTyping(newContent, ROOM_ID);
    } else {
      wsClient.stopTyping(ROOM_ID);
    }
  }, []);

  const enterChat = useCallback(() => {
    setInChat(true);
    hasJoined.current = false;
  }, []);

  const exitChat = useCallback(() => {
    wsClient.stopTyping(ROOM_ID);
    wsClient.leave();
    setInChat(false);
    hasJoined.current = false;
    setMessages([]);
    setMediaMessages([]);
    setTypingUsers(new Map());
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <OnboardingModal onComplete={createUser} />;
  }

  // Welcome screen - enter the chat room
  if (!inChat) {
    return (
      <div className="h-screen w-full flex flex-col bg-background relative overflow-hidden">
        <WaterBackground />
        
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">eez</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Real-Time Chat</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={enterChat}
              className="rounded-full px-8 gap-2"
              data-testid="button-enter-chat"
            >
              <span>Enter Chat Room</span>
            </Button>
          </motion.div>
        </div>

        <div className="relative z-10 p-4 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <UserAvatar
              displayName={user.displayName}
              avatarColor={user.avatarColor}
              size="sm"
              showStatus
              isOnline
            />
            <span className="text-sm">{user.displayName}</span>
          </div>
        </div>
      </div>
    );
  }

  // Chat room - everyone sees everyone typing in real-time
  return (
    <div className="h-screen w-full flex flex-col bg-background relative overflow-hidden">
      <WaterBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 p-4 border-b border-white/10 backdrop-blur-sm">
        <Button
          size="icon"
          variant="ghost"
          onClick={exitChat}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">eez Room</h2>
        </div>

        <div className="flex-1 flex items-center justify-center gap-1">
          {otherUsers.slice(0, 5).map(u => (
            <UserAvatar
              key={u.id}
              displayName={u.displayName}
              avatarColor={u.avatarColor}
              size="sm"
              showStatus
              isOnline
              isTyping={typingUsers.has(u.id)}
            />
          ))}
          {otherUsers.length > 5 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{otherUsers.length - 5}
            </span>
          )}
          {otherUsers.length === 0 && (
            <span className="text-xs text-muted-foreground">
              Waiting for others to join...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <ThemeToggle />
        </div>
      </div>

      {/* Messages area */}
      <InsertMenu onInsert={handleInsert}>
        <div 
          className="relative z-10 h-full overflow-y-auto p-4"
          onClick={() => document.getElementById("typing-area")?.focus()}
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            {/* All messages (text + media) sorted by timestamp */}
            {[
              ...messages.map(msg => ({ ...msg, messageType: 'text' as const })),
              ...mediaMessages.map(media => ({ ...media, senderId: media.userId, senderName: media.displayName, messageType: 'media' as const }))
            ]
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .map((item) => (
                <div key={item.id}>
                  {item.senderId !== user.id && (
                    <p className="text-xs text-muted-foreground mb-1 ml-1">
                      {item.senderName}
                    </p>
                  )}
                  {item.messageType === 'text' ? (
                    <MessageBubble
                      content={item.content}
                      isSent={item.senderId === user.id}
                    />
                  ) : (
                    <MediaBubble
                      media={item as MediaMessage}
                      isSent={item.senderId === user.id}
                    />
                  )}
                </div>
              ))}

            {/* Upload indicator */}
            {isUploading && (
              <div className="flex justify-end">
                <div className="px-4 py-3 rounded-3xl bg-primary/50 backdrop-blur-md">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Other users' live typing - shows what they're typing RIGHT NOW */}
            {Array.from(typingUsers.values()).map(indicator => (
              <div key={indicator.userId}>
                <p className="text-xs text-muted-foreground mb-1 ml-1">
                  {indicator.displayName}
                </p>
                <LiveBubble
                  content={indicator.content}
                  isSent={false}
                  isActive={true}
                  showCursor={true}
                />
              </div>
            ))}

            {/* Your own live typing */}
            {currentTyping && (
              <LiveBubble
                content={currentTyping}
                isSent={true}
                isActive={true}
                showCursor={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </InsertMenu>

      {/* Hidden textarea for capturing keyboard input */}
      <textarea
        id="typing-area"
        value={currentTyping}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        className="sr-only"
        autoFocus
        data-testid="input-typing"
      />

      {/* Instruction hint */}
      <div className="relative z-10 p-4 text-center">
        <p className="text-sm text-muted-foreground/70">
          Just start typing... Press Enter to drop.
        </p>
      </div>
    </div>
  );
}
