import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { PresenceUser } from "@/hooks/usePresence";

interface PresenceIndicatorProps {
  users: PresenceUser[];
  currentUserIdentifier: string;
}

export function PresenceIndicator({ users, currentUserIdentifier }: PresenceIndicatorProps) {
  const otherUsers = users.filter(u => u.userIdentifier !== currentUserIdentifier);
  
  if (otherUsers.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-semibold text-white cursor-default"
                  style={{ backgroundColor: user.userColor }}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{user.userName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {otherUsers.length > 5 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground cursor-default">
                  +{otherUsers.length - 5}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{otherUsers.length - 5} more users online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          {otherUsers.length} online
        </span>
      </div>
    </TooltipProvider>
  );
}
