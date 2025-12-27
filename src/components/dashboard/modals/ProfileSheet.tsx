import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Key, LogOut, Camera, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

export function ProfileSheet({ open, onOpenChange, profile, onSaveProfile, onLogout }: ProfileSheetProps) {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onSaveProfile(localProfile);
    setIsSaving(false);
    toast.success("Profile updated successfully");
    onOpenChange(false);
  };

  const handleLogout = () => {
    toast.info("Logging out...");
    onLogout();
    onOpenChange(false);
  };

  const initials = localProfile.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </SheetTitle>
          <SheetDescription>
            Manage your account settings
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center py-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={localProfile.avatarUrl} alt={localProfile.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">{localProfile.name}</p>
            <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full bg-primary/10">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">{localProfile.role}</span>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="profile-name"
                value={localProfile.name}
                onChange={(e) => setLocalProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={localProfile.email}
                onChange={(e) => setLocalProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Button variant="outline" className="w-full justify-start text-muted-foreground">
                Change password
              </Button>
            </div>
          </div>

          <Separator />

          {/* Session Info */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">Session Info</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Last login: Today at 9:42 AM</p>
              <p>Session expires: In 7 days</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
