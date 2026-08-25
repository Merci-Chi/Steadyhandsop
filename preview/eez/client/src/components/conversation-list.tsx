import { motion } from "framer-motion";
import { UserAvatar } from "@/components/ui/avatar-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Waves } from "lucide-react";
import type { OnlineUser } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  id: string;
  user: OnlineUser;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isTyping?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUser: OnlineUser | null;
  onSelect: (id: string) => void;
  onNewMessage?: () => void;
}

export function ConversationList({
  conversations,
  selectedId,
  currentUser,
  onSelect,
  onNewMessage,
}: ConversationListProps) {
  return (
    <div className="w-80 h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onNewMessage}
            data-testid="button-new-message"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 bg-muted/50 border-0"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <motion.button
            key={conversation.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 text-left transition-colors",
              selectedId === conversation.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50"
            )}
            data-testid={`conversation-${conversation.id}`}
          >
            <UserAvatar
              displayName={conversation.user.displayName}
              avatarColor={conversation.user.avatarColor}
              size="lg"
              showStatus
              isOnline
              isTyping={conversation.isTyping}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {conversation.user.displayName}
                </span>
                {conversation.lastMessageTime && (
                  <span className={cn(
                    "text-xs shrink-0",
                    selectedId === conversation.id 
                      ? "text-primary-foreground/70" 
                      : "text-muted-foreground"
                  )}>
                    {format(conversation.lastMessageTime, "h:mm a")}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm truncate",
                selectedId === conversation.id 
                  ? "text-primary-foreground/80" 
                  : "text-muted-foreground"
              )}>
                {conversation.isTyping ? (
                  <span className="italic">typing...</span>
                ) : (
                  conversation.lastMessage || "No messages yet"
                )}
              </p>
            </div>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </motion.button>
        ))}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Edit className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground/70">Start a new message</p>
          </div>
        )}
      </div>

      {currentUser && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <UserAvatar
              displayName={currentUser.displayName}
              avatarColor={currentUser.avatarColor}
              size="md"
              showStatus
              isOnline
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.displayName}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
