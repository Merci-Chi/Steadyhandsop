import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IMessageBubble } from "@/components/imessage-bubble";
import { LiveTypingBubble } from "@/components/live-typing-bubble";
import { ChatInput } from "@/components/chat-input";
import { UserAvatar } from "@/components/ui/avatar-user";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Phone, Video, Info, ChevronLeft, Waves } from "lucide-react";
import type { Message, OnlineUser, TypingIndicator } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatThreadProps {
  recipient: OnlineUser | null;
  messages: (Message & { user: OnlineUser })[];
  typingIndicator: TypingIndicator | null;
  currentUserId: string;
  onSend: (content: string) => void;
  onTyping: (content: string) => void;
  onStopTyping: () => void;
  onBack?: () => void;
  isConnected: boolean;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Waves className="h-10 w-10 text-primary" />
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">eez</h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Select a conversation or start a new message to begin chatting
      </p>
    </div>
  );
}

export function ChatThread({
  recipient,
  messages,
  typingIndicator,
  currentUserId,
  onSend,
  onTyping,
  onStopTyping,
  onBack,
  isConnected,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingIndicator]);

  if (!recipient) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <EmptyState />
      </div>
    );
  }

  const groupedMessages = messages.map((message, index) => {
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isSent = message.userId === currentUserId;
    const prevIsSameSender = prevMessage?.userId === message.userId;
    const nextIsSameSender = nextMessage?.userId === message.userId;
    
    const timeDiff = prevMessage 
      ? new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()
      : Infinity;
    const isNewGroup = timeDiff > 60000 || !prevIsSameSender;
    
    const nextTimeDiff = nextMessage
      ? new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()
      : Infinity;
    const isEndOfGroup = nextTimeDiff > 60000 || !nextIsSameSender;

    return {
      ...message,
      isSent,
      isFirstInGroup: isNewGroup,
      isLastInGroup: isEndOfGroup,
    };
  });

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              className="md:hidden"
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <UserAvatar
            displayName={recipient.displayName}
            avatarColor={recipient.avatarColor}
            size="md"
            showStatus
            isOnline
            isTyping={!!typingIndicator}
          />
          <div>
            <h2 className="font-semibold">{recipient.displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {typingIndicator ? "typing..." : "Active now"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" data-testid="button-call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-video">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-info">
            <Info className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {groupedMessages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                message.isFirstInGroup && "mt-4",
                !message.isLastInGroup && "mb-0.5"
              )}
            >
              <IMessageBubble
                content={message.content}
                timestamp={new Date(message.timestamp)}
                isSent={message.isSent}
                isFirstInGroup={message.isFirstInGroup}
                isLastInGroup={message.isLastInGroup}
              />
            </div>
          ))}

          {typingIndicator && (
            <div className="mt-4">
              <LiveTypingBubble
                content={typingIndicator.content}
                displayName={typingIndicator.displayName}
                isVisible={true}
              />
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={!isConnected}
        placeholder={`Message ${recipient.displayName}`}
      />
    </div>
  );
}
