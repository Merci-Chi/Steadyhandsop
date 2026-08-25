import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, Camera, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: (content: string) => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Message",
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypedRef = useRef("");

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      inputRef.current?.focus();
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

  return (
    <div className="flex items-center gap-2 p-3 bg-background border-t border-border">
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-primary"
        data-testid="button-add"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          data-testid="input-message"
        />
        
        {!content && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground"
              data-testid="button-camera"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground"
              data-testid="button-mic"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {content.trim() && (
        <Button
          size="icon"
          variant="default"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="shrink-0 rounded-full"
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
