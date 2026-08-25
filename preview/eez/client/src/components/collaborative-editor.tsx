import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/glass-panel";
import { UserAvatar } from "@/components/ui/avatar-user";
import { Button } from "@/components/ui/button";
import { X, FileText, Users } from "lucide-react";
import type { Document, CursorPosition, OnlineUser } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CollaborativeEditorProps {
  document: Document | null;
  cursors: CursorPosition[];
  currentUserId: string;
  onContentChange: (documentId: string, content: string) => void;
  onCursorChange: (documentId: string, position: number, selection?: { start: number; end: number }) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface CursorMarker {
  cursor: CursorPosition;
  position: { left: number; top: number };
}

export function CollaborativeEditor({
  document,
  cursors,
  currentUserId,
  onContentChange,
  onCursorChange,
  onClose,
  isOpen,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(document?.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorMarkers, setCursorMarkers] = useState<CursorMarker[]>([]);

  useEffect(() => {
    if (document) {
      setContent(document.content);
    }
  }, [document?.content]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (document) {
      onContentChange(document.id, newContent);
    }
  }, [document, onContentChange]);

  const handleSelect = useCallback(() => {
    if (textareaRef.current && document) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      onCursorChange(
        document.id,
        selectionStart,
        selectionStart !== selectionEnd
          ? { start: selectionStart, end: selectionEnd }
          : undefined
      );
    }
  }, [document, onCursorChange]);

  const otherCursors = cursors.filter((c) => c.userId !== currentUserId);

  const getLineNumbers = () => {
    const lines = content.split("\n");
    return lines.map((_, i) => i + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-96 h-full border-l border-border/50 flex flex-col"
        >
          <GlassPanel blur="xl" opacity="high" className="h-full flex flex-col rounded-none border-0">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-medium text-sm">
                  {document?.title || "Collaborative Document"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {otherCursors.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {otherCursors.length}
                  </div>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-7 w-7"
                  data-testid="button-close-editor"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
              <div className="flex -space-x-1">
                {otherCursors.slice(0, 4).map((cursor) => (
                  <UserAvatar
                    key={cursor.userId}
                    displayName={cursor.displayName}
                    avatarColor={cursor.avatarColor}
                    size="sm"
                  />
                ))}
              </div>
              {otherCursors.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {otherCursors.length} {otherCursors.length === 1 ? "editor" : "editors"}
                </span>
              )}
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-10 py-4 border-r border-border/30 bg-muted/30 select-none">
                {getLineNumbers().map((num) => (
                  <div 
                    key={num} 
                    className="text-right pr-2 text-xs text-muted-foreground/60 h-6 leading-6 font-mono"
                  >
                    {num}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleChange}
                  onSelect={handleSelect}
                  onKeyUp={handleSelect}
                  onClick={handleSelect}
                  className={cn(
                    "w-full h-full p-4 resize-none bg-transparent",
                    "font-mono text-base leading-6",
                    "focus:outline-none focus:ring-0",
                    "placeholder:text-muted-foreground/40"
                  )}
                  placeholder="Start typing to collaborate..."
                  spellCheck={false}
                  data-testid="editor-textarea"
                />

                {otherCursors.map((cursor) => (
                  <motion.div
                    key={cursor.userId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute pointer-events-none"
                    style={{
                      top: `${Math.floor(cursor.position / 50) * 24 + 16}px`,
                      left: `${(cursor.position % 50) * 8 + 16}px`,
                    }}
                  >
                    <div
                      className="w-0.5 h-5 animate-pulse"
                      style={{ backgroundColor: cursor.avatarColor }}
                    />
                    <div
                      className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-xs text-white whitespace-nowrap"
                      style={{ backgroundColor: cursor.avatarColor }}
                    >
                      {cursor.displayName}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
