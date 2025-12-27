import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload, UploadedFile } from "./FileUpload";

interface CommandBarProps {
  onSubmit: (command: string, files?: UploadedFile[]) => void;
  isProcessing?: boolean;
}

export function CommandBar({ onSubmit, isProcessing = false }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if ((input.trim() || files.length > 0) && !isProcessing) {
      onSubmit(input.trim(), files.length > 0 ? files : undefined);
      setInput("");
      setFiles([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setShowFileUpload(false);
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-border bg-background">
      <div className="px-6 py-4">
        <div
          className={cn(
            "command-bar relative rounded-2xl border-2 bg-card transition-all duration-300",
            isFocused 
              ? "border-primary shadow-lg shadow-primary/10" 
              : "border-input hover:border-input/80"
          )}
        >
          {/* File Upload Section */}
          {showFileUpload && (
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Attachments</span>
                <button
                  onClick={() => { setShowFileUpload(false); setFiles([]); }}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <FileUpload files={files} onFilesChange={handleFilesChange} />
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex items-end gap-3 p-4">
            {/* Left Actions */}
            <div className="flex items-center gap-1 pb-0.5">
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  "active:scale-95",
                  showFileUpload || files.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
                {files.length > 0 && !showFileUpload && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {files.length}
                  </span>
                )}
              </button>
              <button
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  "active:scale-95"
                )}
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter a command or describe what you want to accomplish..."
                disabled={isProcessing}
                rows={1}
                className={cn(
                  "w-full resize-none bg-transparent text-sm text-foreground leading-relaxed",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && files.length === 0) || isProcessing}
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200",
                "active:scale-95",
                (input.trim() || files.length > 0) && !isProcessing
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Footer Hints */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-secondary/30 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium">AI-powered orchestration</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="h-5 px-1.5 rounded bg-secondary border border-border text-[10px] font-mono font-medium flex items-center justify-center">
                  ↵
                </kbd>
                <span>Send</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="h-5 px-1.5 rounded bg-secondary border border-border text-[10px] font-mono font-medium flex items-center justify-center">
                  ⌘K
                </kbd>
                <span>Commands</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-[shimmer_1s_ease-in-out_infinite]" 
               style={{ 
                 animation: 'shimmer 1.5s ease-in-out infinite',
               }} 
          />
        </div>
      )}
    </div>
  );
}
