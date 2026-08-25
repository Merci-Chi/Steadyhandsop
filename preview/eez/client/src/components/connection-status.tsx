import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isConnected ? "connected" : "disconnected"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
          isConnected
            ? "bg-status-online/20 text-status-online"
            : "bg-destructive/20 text-destructive",
          className
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting...</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
