import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/ui/avatar-user";
import { GlassPanel } from "@/components/glass-panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { OnlineUser } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface UserPresenceProps {
  users: OnlineUser[];
  currentUserId?: string;
  className?: string;
  compact?: boolean;
}

export function UserPresence({ users, currentUserId, className, compact = false }: UserPresenceProps) {
  const onlineUsers = users.filter((u) => u.id !== currentUserId);
  const typingUsers = onlineUsers.filter((u) => u.isTyping);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex -space-x-2">
          <AnimatePresence mode="popLayout">
            {onlineUsers.slice(0, 5).map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <UserAvatar
                        displayName={user.displayName}
                        avatarColor={user.avatarColor}
                        size="sm"
                        showStatus
                        isOnline
                        isTyping={user.isTyping}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.displayName}</p>
                    {user.isTyping && (
                      <p className="text-xs text-muted-foreground">typing...</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
          {onlineUsers.length > 5 && (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-white/20">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        {typingUsers.length > 0 && (
          <span className="text-xs text-muted-foreground animate-pulse">
            {typingUsers.length === 1
              ? `${typingUsers[0].displayName} is typing...`
              : `${typingUsers.length} people typing...`}
          </span>
        )}
      </div>
    );
  }

  return (
    <GlassPanel blur="lg" opacity="medium" className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Online ({onlineUsers.length + 1})</h3>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
              data-testid={`user-presence-${user.id}`}
            >
              <UserAvatar
                displayName={user.displayName}
                avatarColor={user.avatarColor}
                size="md"
                showStatus
                isOnline
                isTyping={user.isTyping}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                {user.isTyping && (
                  <p className="text-xs text-primary animate-pulse">typing...</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
