import { useState, useRef, useEffect } from "react";
import { Send, Command, Sparkles, Keyboard } from "lucide-react";
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
    <div className="flex-shrink-0 border-t border-border bg-background px-6 py-4">
      <div
        className={cn(
          "command-bar relative rounded-xl border bg-card transition-all duration-200",
          isFocused ? "border-primary ring-2 ring-primary/10" : "border-input"
        )}
      >
        {/* Input Area */}
        <div className="flex items-end gap-3 p-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter a command or describe a task..."
              disabled={isProcessing}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none",
                "disabled:opacity-50"
              )}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className={cn(
              "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200",
              input.trim() && !isProcessing
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {isProcessing ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Hints Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/30 rounded-b-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>AI-powered orchestration</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Keyboard className="h-3 w-3" />
              <span>Enter to send</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K for commands</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
