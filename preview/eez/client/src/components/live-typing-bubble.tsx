import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveTypingBubbleProps {
  content: string;
  displayName: string;
  isVisible: boolean;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <motion.span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.span
        className="w-2 h-2 bg-muted-foreground/60 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </span>
  );
}

export function LiveTypingBubble({ content, displayName, isVisible }: LiveTypingBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex justify-start"
        >
          <div className="max-w-[70%]">
            <div className="relative px-4 py-3 bg-muted/70 rounded-2xl border border-dashed border-border">
              {content ? (
                <p className="text-[15px] text-foreground/80 whitespace-pre-wrap break-words">
                  {content.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.05 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </p>
              ) : (
                <TypingDots />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 px-1">
              {displayName} is typing...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
