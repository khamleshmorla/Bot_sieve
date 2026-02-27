import { motion } from "framer-motion";
import { Shield, Activity, WifiOff } from "lucide-react";

interface DashboardHeaderProps {
  isOnline?: boolean;
  postsPerMin?: number;
}

export const DashboardHeader = ({
  isOnline = true,
  postsPerMin = 1247,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">
              Bot<span className="text-primary">Sieve</span>
            </span>
            <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
              AI Social Media Bot Detector
            </p>
          </div>
        </div>

        {/* Right — status pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live rate */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border text-xs font-mono text-muted-foreground">
            <Activity className="w-3 h-3 text-primary" />
            {postsPerMin.toLocaleString()}/min
          </div>

          {/* Backend status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${isOnline
              ? "bg-success/8 border-success/20 text-success"
              : "bg-destructive/8 border-destructive/20 text-destructive"
            }`}>
            {isOnline ? (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0"
              />
            ) : (
              <WifiOff className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="hidden sm:inline">{isOnline ? "API Online" : "API Offline"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
