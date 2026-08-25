import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/ui/avatar-user";
import { GlassPanel } from "@/components/glass-panel";
import type { TypingIndicator as TypingIndicatorType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  indicators: TypingIndicatorType[];
  className?: string;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      <span className="w-1 h-1 bg-current rounded-full animate-typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 bg-current rounded-full animate-typing-dot" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 bg-current rounded-full animate-typing-dot" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function CharacterByCharacter({ content }: { content: string }) {
  if (!content) {
    return <TypingDots />;
  }

  return (
    <span className="relative">
      {content.split("").map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block"
          style={{
            animationDelay: `${index * 20}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-0.5 h-4 bg-primary ml-0.5"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  );
}

export function TypingIndicatorDisplay({ indicators, className }: TypingIndicatorProps) {
  if (indicators.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {indicators.map((indicator) => (
          <motion.div
            key={indicator.userId}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <GlassPanel 
              blur="md" 
              opacity="low" 
              className="flex items-start gap-3 p-3"
            >
              <UserAvatar
                displayName={indicator.displayName}
                avatarColor={indicator.avatarColor}
                size="sm"
                isTyping
                showStatus
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {indicator.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    is typing
                  </span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground/80 font-mono">
                  <CharacterByCharacter content={indicator.content} />
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
