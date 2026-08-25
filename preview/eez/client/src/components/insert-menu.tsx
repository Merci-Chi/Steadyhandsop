import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, FileText, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsertMenuProps {
  onInsert: (type: "image" | "video" | "file", file: File) => void;
  children: React.ReactNode;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function InsertMenu({ onInsert, children }: InsertMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<"image" | "video" | "file" | null>(null);

  const openMenu = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const menuWidth = 200;
    const menuHeight = 180;

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    if (x + menuWidth > rect.width) x = rect.width - menuWidth - 10;
    if (y + menuHeight > rect.height) y = rect.height - menuHeight - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  }, [openMenu]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openMenu(touch.clientX, touch.clientY);
    }, 500);
  }, [openMenu]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback((type: "image" | "video" | "file") => {
    pendingTypeRef.current = type;
    if (fileInputRef.current) {
      if (type === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (type === "video") {
        fileInputRef.current.accept = "video/*";
      } else {
        fileInputRef.current.accept = "*/*";
      }
      fileInputRef.current.click();
    }
    setIsOpen(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = pendingTypeRef.current;
    if (file && type) {
      onInsert(type, file);
    }
    e.target.value = "";
    pendingTypeRef.current = null;
  }, [onInsert]);

  const menuItems = [
    { type: "image" as const, icon: Image, label: "Photo" },
    { type: "video" as const, icon: Video, label: "Video" },
    { type: "file" as const, icon: FileText, label: "File" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex flex-col min-h-0 overflow-hidden"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        data-testid="input-file-upload"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{ left: position.x, top: position.y }}
              className="absolute z-50 min-w-[180px] rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border border-white/30 dark:border-white/10 overflow-hidden"
            >
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Insert</span>
                  <button
                    onClick={closeMenu}
                    className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    data-testid="button-close-insert-menu"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                {menuItems.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleSelect(item.type)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors",
                      "text-sm font-medium text-foreground"
                    )}
                    data-testid={`button-insert-${item.type}`}
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
