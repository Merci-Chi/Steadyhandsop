import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: Date;
  isSent: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
  showTail?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export function IMessageBubble({
  content,
  timestamp,
  isSent,
  isDelivered = true,
  isRead = false,
  showTail = true,
  isFirstInGroup = true,
  isLastInGroup = true,
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex",
        isSent ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("max-w-[70%] flex flex-col", isSent ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative px-4 py-2 text-[15px] leading-relaxed",
            isSent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            isFirstInGroup && isLastInGroup && "rounded-2xl",
            isFirstInGroup && !isLastInGroup && (isSent ? "rounded-2xl rounded-br-lg" : "rounded-2xl rounded-bl-lg"),
            !isFirstInGroup && isLastInGroup && (isSent ? "rounded-2xl rounded-tr-lg" : "rounded-2xl rounded-tl-lg"),
            !isFirstInGroup && !isLastInGroup && (isSent ? "rounded-2xl rounded-r-lg" : "rounded-2xl rounded-l-lg")
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        
        {isLastInGroup && (
          <div className={cn(
            "flex items-center gap-1 mt-1 px-1",
            isSent ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-[11px] text-muted-foreground">
              {format(timestamp, "h:mm a")}
            </span>
            {isSent && (
              <span className="text-muted-foreground">
                {isRead ? (
                  <CheckCheck className="h-3 w-3 text-primary" />
                ) : isDelivered ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
