import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicatorDisplay } from "@/components/typing-indicator";
import { Waves, MessageSquare } from "lucide-react";
import type { Message, OnlineUser, TypingIndicator } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: (Message & { user: OnlineUser })[];
  typingIndicators: TypingIndicator[];
  currentUserId: string;
  className?: string;
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative bg-gradient-to-br from-primary/30 to-primary/10 p-6 rounded-full backdrop-blur-sm border border-white/10">
          <Waves className="h-12 w-12 text-primary" />
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">Welcome to eez</h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Start a conversation! See every character as others type in real-time.
      </p>
    </div>
  );
}

export function MessageList({ 
  messages, 
  typingIndicators, 
  currentUserId,
  className 
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingIndicators.length]);

  const groupedMessages = messages.reduce<(Message & { user: OnlineUser; showAvatar: boolean })[]>(
    (acc, message, index) => {
      const prevMessage = messages[index - 1];
      const showAvatar = 
        !prevMessage || 
        prevMessage.userId !== message.userId ||
        new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000;
      
      return [...acc, { ...message, showAvatar }];
    },
    []
  );

  if (messages.length === 0 && typingIndicators.length === 0) {
    return <EmptyState />;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("flex-1 overflow-y-auto", className)}
    >
      <div className="py-4 space-y-1">
        {groupedMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.userId === currentUserId}
            showAvatar={message.showAvatar}
          />
        ))}
      </div>

      {typingIndicators.length > 0 && (
        <div className="px-4 pb-4">
          <TypingIndicatorDisplay 
            indicators={typingIndicators.filter(t => t.userId !== currentUserId)} 
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
