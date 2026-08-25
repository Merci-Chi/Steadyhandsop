import { useState, useRef, useEffect, useCallback } from "react";
import { GlassPanel } from "@/components/glass-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: (content: string) => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypedRef = useRef("");

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (newContent !== lastTypedRef.current) {
      lastTypedRef.current = newContent;
      onTyping(newContent);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
        lastTypedRef.current = "";
      }, 2000);
    }
  }, [onTyping, onStopTyping]);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setContent("");
      lastTypedRef.current = "";
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onStopTyping();
      textareaRef.current?.focus();
    }
  }, [content, disabled, onSend, onStopTyping]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 128)}px`;
    }
  }, [content]);

  return (
    <GlassPanel 
      blur="xl" 
      opacity="high" 
      className="p-3"
    >
      <div className="flex items-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 text-muted-foreground"
          data-testid="button-attach"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-32 resize-none border-0 bg-transparent",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "text-base placeholder:text-muted-foreground/60"
            )}
            rows={1}
            data-testid="input-message"
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 text-muted-foreground"
          data-testid="button-emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant={content.trim() ? "default" : "ghost"}
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className={cn(
            "shrink-0 transition-all duration-200",
            content.trim() && "bg-primary text-primary-foreground"
          )}
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}
