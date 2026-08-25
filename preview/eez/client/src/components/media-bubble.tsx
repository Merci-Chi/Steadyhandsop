import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Download, AlertCircle, Play, FileIcon, Music, FileSpreadsheet, FileCode, Presentation } from "lucide-react";
import type { MediaMessage } from "@shared/schema";

interface MediaBubbleProps {
  media: MediaMessage;
  isSent: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  } catch {
    return null;
  }
}

function getFileType(fileName: string, contentType: string): 'pdf' | 'audio' | 'text' | 'spreadsheet' | 'presentation' | 'code' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (contentType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (contentType.startsWith('text/') || ['txt', 'md', 'rtf'].includes(ext)) return 'text';
  if (['xlsx', 'xls', 'csv', 'numbers'].includes(ext)) return 'spreadsheet';
  if (['pptx', 'ppt', 'key'].includes(ext)) return 'presentation';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml'].includes(ext)) return 'code';
  
  return 'other';
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf': return FileText;
    case 'audio': return Music;
    case 'spreadsheet': return FileSpreadsheet;
    case 'presentation': return Presentation;
    case 'code': return FileCode;
    default: return FileIcon;
  }
}

export function MediaBubble({ media, isSent }: MediaBubbleProps) {
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const fileType = useMemo(() => 
    media.type === "file" ? getFileType(media.fileName, media.contentType) : null,
    [media.fileName, media.contentType, media.type]
  );

  const FileIconComponent = useMemo(() => 
    fileType ? getFileIcon(fileType) : FileIcon,
    [fileType]
  );

  useEffect(() => {
    if ((media.type === "video" || media.type === "file") && media.url?.startsWith('data:')) {
      const blob = dataUrlToBlob(media.url);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [media.url, media.type]);

  const displayUrl = useMemo(() => {
    if (media.type === "video" || media.type === "file") {
      return blobUrl || media.url;
    }
    return media.url;
  }, [media.type, media.url, blobUrl]);

  const handleVideoError = () => {
    console.error("Video failed to load:", media.fileName, "URL length:", media.url?.length);
    setVideoError(true);
  };

  const handleImageError = () => {
    console.error("Image failed to load:", media.fileName, "URL length:", media.url?.length);
    setImageError(true);
  };

  const renderFileDownload = () => (
    <a
      href={displayUrl}
      download={media.fileName}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
      data-testid={`media-file-${media.id}`}
    >
      <div className={cn(
        "p-2 rounded-full",
        isSent ? "bg-white/20" : "bg-primary/10"
      )}>
        <FileIconComponent className={cn(
          "h-5 w-5",
          isSent ? "text-primary-foreground" : "text-primary"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{media.fileName}</p>
        <p className={cn(
          "text-xs",
          isSent ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {formatFileSize(media.fileSize)}
        </p>
      </div>
      <Download className={cn(
        "h-4 w-4 flex-shrink-0",
        isSent ? "text-primary-foreground/70" : "text-muted-foreground"
      )} />
    </a>
  );

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
          "max-w-[75%] rounded-3xl backdrop-blur-md shadow-lg overflow-hidden",
          isSent
            ? "bg-primary/70 text-primary-foreground rounded-br-lg"
            : "bg-white/50 dark:bg-white/15 text-foreground rounded-bl-lg border border-white/40 dark:border-white/20"
        )}
      >
        {media.type === "image" && (
          <div className="p-1">
            {imageError ? (
              <div className="flex items-center gap-2 px-4 py-3">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Image failed to load</span>
              </div>
            ) : (
              <img
                src={media.url}
                alt={media.fileName}
                className="max-w-[240px] max-h-[240px] rounded-2xl object-cover"
                onError={handleImageError}
                data-testid={`media-image-${media.id}`}
              />
            )}
          </div>
        )}

        {media.type === "video" && (
          <div className="p-1">
            {videoError ? (
              <a
                href={displayUrl}
                download={media.fileName}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className={cn(
                  "p-2 rounded-full",
                  isSent ? "bg-white/20" : "bg-primary/10"
                )}>
                  <Play className={cn(
                    "h-5 w-5",
                    isSent ? "text-primary-foreground" : "text-primary"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{media.fileName}</p>
                  <p className={cn(
                    "text-xs",
                    isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatFileSize(media.fileSize)} - Click to download
                  </p>
                </div>
                <Download className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                )} />
              </a>
            ) : (
              <video
                src={displayUrl}
                controls
                playsInline
                preload="metadata"
                className="max-w-[240px] max-h-[240px] rounded-2xl"
                onError={handleVideoError}
                data-testid={`media-video-${media.id}`}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        )}

        {media.type === "file" && fileType === "pdf" && (
          <div className="p-2">
            <div 
              className="flex flex-col gap-2 cursor-pointer"
              onClick={() => {
                if (displayUrl) {
                  window.open(displayUrl, '_blank');
                }
              }}
            >
              <div className={cn(
                "w-[200px] h-[120px] rounded-xl flex items-center justify-center",
                isSent ? "bg-white/20" : "bg-red-500/10"
              )}>
                <FileText className={cn(
                  "h-12 w-12",
                  isSent ? "text-primary-foreground" : "text-red-500"
                )} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{media.fileName}</p>
                  <p className={cn(
                    "text-xs",
                    isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {formatFileSize(media.fileSize)} - Tap to view
                  </p>
                </div>
                <a
                  href={displayUrl}
                  download={media.fileName}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "p-2 rounded-full",
                    isSent ? "hover:bg-white/20" : "hover:bg-black/10"
                  )}
                  data-testid={`media-pdf-download-${media.id}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {media.type === "file" && fileType === "audio" && (
          <div className="p-2">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-2 rounded-full",
                isSent ? "bg-white/20" : "bg-primary/10"
              )}>
                <Music className={cn(
                  "h-5 w-5",
                  isSent ? "text-primary-foreground" : "text-primary"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{media.fileName}</p>
                <p className={cn(
                  "text-xs",
                  isSent ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {formatFileSize(media.fileSize)}
                </p>
              </div>
              <a
                href={displayUrl}
                download={media.fileName}
                className={cn(
                  "p-1 rounded-full",
                  isSent ? "hover:bg-white/20" : "hover:bg-black/10"
                )}
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
            <audio
              src={displayUrl}
              controls
              className="w-full max-w-[260px]"
              data-testid={`media-audio-${media.id}`}
            />
          </div>
        )}

        {media.type === "file" && fileType !== "pdf" && fileType !== "audio" && (
          renderFileDownload()
        )}
      </div>
    </motion.div>
  );
}
