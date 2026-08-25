import { motion } from "framer-motion";
import { format } from "date-fns";
import { UserAvatar } from "@/components/ui/avatar-user";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import type { Message, OnlineUser } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message & { user: OnlineUser };
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (messageId: string) => void;
  replyCount?: number;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true,
  onReply,
  replyCount = 0,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const timestamp = new Date(message.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex gap-3 px-4 py-1",
        isOwn && "flex-row-reverse"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      data-testid={`message-${message.id}`}
    >
      {showAvatar ? (
        <UserAvatar
          displayName={message.user.displayName}
          avatarColor={message.user.avatarColor}
          size="md"
          showStatus
          isOnline
        />
      ) : (
        <div className="w-8" />
      )}
      
      <div className={cn("flex-1 max-w-2xl", isOwn && "flex flex-col items-end")}>
        {showAvatar && (
          <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
            <span className="text-sm font-medium text-foreground">
              {message.user.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(timestamp, "h:mm a")}
            </span>
          </div>
        )}
        
        <div className="relative">
          <GlassPanel
            blur="md"
            opacity={isOwn ? "high" : "medium"}
            className={cn(
              "px-4 py-2.5 transition-all duration-200",
              isOwn 
                ? "bg-primary/20 dark:bg-primary/15 border-primary/20" 
                : "hover-elevate"
            )}
          >
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </GlassPanel>

          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-200",
              isOwn ? "-left-20" : "-right-20",
              showActions ? "opacity-100 visible" : "opacity-0 invisible"
            )}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onReply?.(message.id)}
              data-testid={`button-reply-${message.id}`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              data-testid={`button-more-${message.id}`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {replyCount > 0 && (
          <button 
            className="flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
            data-testid={`button-view-replies-${message.id}`}
          >
            <MessageSquare className="h-3 w-3" />
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
