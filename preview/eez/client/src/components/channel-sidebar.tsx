import { motion } from "framer-motion";
import { GlassPanel } from "@/components/glass-panel";
import { UserAvatar } from "@/components/ui/avatar-user";
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  Plus, 
  Settings, 
  LogOut,
  Waves,
  MessageSquare
} from "lucide-react";
import type { Channel, OnlineUser } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChannelSidebarProps {
  channels: Channel[];
  currentChannelId: string | null;
  currentUser: OnlineUser | null;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel?: () => void;
  onLogout: () => void;
}

export function ChannelSidebar({
  channels,
  currentChannelId,
  currentUser,
  onChannelSelect,
  onCreateChannel,
  onLogout,
}: ChannelSidebarProps) {
  return (
    <GlassPanel 
      blur="xl" 
      opacity="high" 
      className="w-64 h-full flex flex-col rounded-none border-0 border-r border-border/30"
    >
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Waves className="h-7 w-7 text-primary" />
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Waves className="h-7 w-7 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">eez</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">See messages as they're typed</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Channels
            </span>
            {onCreateChannel && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={onCreateChannel}
                data-testid="button-create-channel"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1 px-2">
          {channels.map((channel) => (
            <motion.button
              key={channel.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChannelSelect(channel.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors",
                currentChannelId === channel.id
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/80 hover-elevate"
              )}
              data-testid={`channel-${channel.id}`}
            >
              <Hash className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm font-medium">{channel.name}</span>
              {currentChannelId === channel.id && (
                <motion.div
                  layoutId="activeChannel"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}

          {channels.length === 0 && (
            <div className="px-3 py-8 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No channels yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-border/30">
        {currentUser && (
          <div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
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
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                data-testid="button-settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive"
                onClick={onLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
