import { useState, useRef, useEffect } from "react";
import { Send, Command, Sparkles, Keyboard, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandBarProps {
  onSubmit: (command: string) => void;
  isProcessing?: boolean;
}

export function CommandBar({ onSubmit, isProcessing = false }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim());
      setInput("");
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
          {/* Main Input Area */}
          <div className="flex items-end gap-3 p-4">
            {/* Left Actions */}
            <div className="flex items-center gap-1 pb-0.5">
              <button
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  "active:scale-95"
                )}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
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
              disabled={!input.trim() || isProcessing}
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200",
                "active:scale-95",
                input.trim() && !isProcessing
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
