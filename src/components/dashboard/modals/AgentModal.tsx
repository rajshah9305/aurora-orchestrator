import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Agent } from "@/types/agent";
import { Bot, Cpu, Database, Globe, Sparkles, Loader2 } from "lucide-react";

interface AgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
  onSave: (agent: Omit<Agent, "id" | "status" | "lastActive">) => void;
  mode: "create" | "edit";
}

const roles = [
  { value: "orchestrator", label: "Orchestrator", icon: Sparkles },
  { value: "researcher", label: "Researcher", icon: Globe },
  { value: "analyst", label: "Analyst", icon: Cpu },
  { value: "executor", label: "Executor", icon: Bot },
  { value: "database", label: "Database", icon: Database },
];

export function AgentModal({ open, onOpenChange, agent, onSave, mode }: AgentModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("orchestrator");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agent && mode === "edit") {
      setName(agent.name);
      setRole(agent.role.toLowerCase());
    } else {
      setName("");
      setRole("orchestrator");
    }
  }, [agent, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSave({
      name: name.trim(),
      role: role.charAt(0).toUpperCase() + role.slice(1),
    });
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {mode === "create" ? "Create New Agent" : "Edit Agent"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Agent Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name..."
              className="h-10"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{r.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                mode === "create" ? "Create Agent" : "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
