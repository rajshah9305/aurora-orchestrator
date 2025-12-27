import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExecutionBlock } from "../ExecutionBlock";
import type { ExecutionMessage, Agent } from "@/types/agent";
import { StatusIndicator } from "../StatusIndicator";
import { X, Minimize2, Zap, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FullscreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ExecutionMessage[];
  activeAgent: Agent | null;
}

export function FullscreenModal({ open, onOpenChange, messages, activeAgent }: FullscreenModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 rounded-none border-0 bg-background">
        {/* Header */}
        <div className="flex-shrink-0 h-16 px-6 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Fullscreen Execution View</h2>
              {activeAgent && (
                <div className="flex items-center gap-2">
                  <StatusIndicator status={activeAgent.status} size="sm" showLabel={false} />
                  <span className="text-sm text-muted-foreground">{activeAgent.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-4">
              Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border text-xs font-mono">ESC</kbd> to exit
            </span>
            <Button variant="outline" size="icon" onClick={() => onOpenChange(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-4"
          style={{ height: "calc(100vh - 4rem - 3.5rem)" }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Execution Data</h3>
                <p className="text-muted-foreground">
                  Start an agent to see the execution stream
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute left-12 top-24 bottom-24 w-px bg-border" />
              {messages.map((msg, index) => (
                <ExecutionBlock 
                  key={msg.id} 
                  message={msg} 
                  isLatest={index === messages.length - 1}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {activeAgent?.status === "running" && (
          <div className="flex-shrink-0 h-14 px-6 border-t border-border bg-gradient-to-r from-primary/5 via-background to-primary/5 flex items-center">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Radio className="h-4 w-4 text-primary" />
                <div className="absolute h-4 w-4 rounded-full bg-primary/20 animate-ping" />
              </div>
              <span className="text-sm font-semibold text-foreground">Processing</span>
              <div className="flex items-center gap-1.5 ml-4">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
