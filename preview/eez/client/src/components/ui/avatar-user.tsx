import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  displayName: string;
  avatarColor: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  isOnline?: boolean;
  isTyping?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-xl",
};

const statusSizeClasses = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-4 w-4",
};

export function UserAvatar({
  displayName,
  avatarColor,
  size = "md",
  showStatus = false,
  isOnline = false,
  isTyping = false,
  className,
}: UserAvatarProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative", className)}>
      <Avatar 
        className={cn(
          sizeClasses[size],
          "ring-2 ring-white/20 dark:ring-white/10"
        )}
      >
        <AvatarFallback
          style={{ backgroundColor: avatarColor }}
          className="text-white font-medium"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
            statusSizeClasses[size],
            isTyping
              ? "bg-primary animate-pulse-ring"
              : isOnline
              ? "bg-status-online"
              : "bg-status-offline"
          )}
        />
      )}
    </div>
  );
}
