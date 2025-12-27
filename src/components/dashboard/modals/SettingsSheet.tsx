import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Volume2, Zap, Moon, RotateCcw, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export interface AppSettings {
  autoScroll: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  logRetention: number;
  refreshInterval: number;
  aiModel: string;
  theme: "light" | "dark" | "system";
}

export const defaultSettings: AppSettings = {
  autoScroll: true,
  soundEnabled: false,
  notificationsEnabled: true,
  logRetention: 100,
  refreshInterval: 5,
  aiModel: "gemini-2.5-flash",
  theme: "system",
};

export function SettingsSheet({ open, onOpenChange, settings, onSaveSettings }: SettingsSheetProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onSaveSettings(localSettings);
    setIsSaving(false);
    toast.success("Settings saved successfully");
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
    toast.info("Settings reset to defaults");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Configure your dashboard preferences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Display
            </h3>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll execution</Label>
                <Switch
                  id="auto-scroll"
                  checked={localSettings.autoScroll}
                  onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, autoScroll: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Theme</Label>
                <Select 
                  value={localSettings.theme} 
                  onValueChange={(value: "light" | "dark" | "system") => setLocalSettings(s => ({ ...s, theme: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
                <Switch
                  id="notifications"
                  checked={localSettings.notificationsEnabled}
                  onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, notificationsEnabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sound" className="text-sm">Sound effects</Label>
                </div>
                <Switch
                  id="sound"
                  checked={localSettings.soundEnabled}
                  onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, soundEnabled: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </h3>
            
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Log retention</Label>
                  <span className="text-xs text-muted-foreground">{localSettings.logRetention} entries</span>
                </div>
                <Slider
                  value={[localSettings.logRetention]}
                  onValueChange={([value]) => setLocalSettings(s => ({ ...s, logRetention: value }))}
                  min={50}
                  max={500}
                  step={50}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Refresh interval</Label>
                  <span className="text-xs text-muted-foreground">{localSettings.refreshInterval}s</span>
                </div>
                <Slider
                  value={[localSettings.refreshInterval]}
                  onValueChange={([value]) => setLocalSettings(s => ({ ...s, refreshInterval: value }))}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">AI Model</Label>
                <Select 
                  value={localSettings.aiModel} 
                  onValueChange={(value) => setLocalSettings(s => ({ ...s, aiModel: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
