import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveBubbleProps {
  content: string;
  isSent: boolean;
  isActive: boolean;
  showCursor?: boolean;
}

export function LiveBubble({ content, isSent, isActive, showCursor = true }: LiveBubbleProps) {
  if (!content && !isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex",
        isSent ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed min-h-[44px] backdrop-blur-md shadow-lg",
          isSent
            ? "bg-primary/70 text-primary-foreground rounded-br-lg"
            : "bg-white/50 dark:bg-white/15 text-foreground rounded-bl-lg border border-white/40 dark:border-white/20",
          isActive && "ring-2 ring-primary/30"
        )}
      >
        {content ? (
          <span className="whitespace-pre-wrap break-words">
            {content}
            {isActive && showCursor && (
              <motion.span
                className="inline-block w-0.5 h-5 bg-current ml-0.5 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </span>
        ) : (
          isActive && showCursor && (
            <motion.span
              className="inline-block w-0.5 h-5 bg-current align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )
        )}
      </div>
    </motion.div>
  );
}

interface MessageBubbleProps {
  content: string;
  isSent: boolean;
}

export function MessageBubble({ content, isSent }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex",
        isSent ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed backdrop-blur-md shadow-lg",
          isSent
            ? "bg-primary/70 text-primary-foreground rounded-br-lg"
            : "bg-white/50 dark:bg-white/15 text-foreground rounded-bl-lg border border-white/40 dark:border-white/20"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </motion.div>
  );
}
