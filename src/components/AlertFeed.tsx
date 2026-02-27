import { motion } from "framer-motion";
import { AlertTriangle, Bot, Copy, Zap, Clock } from "lucide-react";
import type { AttackAlert } from "@/services/api";

const severityConfig: Record<string, { bar: string; badge: string; text: string }> = {
  critical: { bar: "bg-destructive", badge: "bg-destructive/12 text-destructive border-destructive/25", text: "text-destructive" },
  high: { bar: "bg-destructive/60", badge: "bg-destructive/8 text-destructive/80 border-destructive/15", text: "text-destructive/80" },
  medium: { bar: "bg-warning/70", badge: "bg-warning/10 text-warning border-warning/25", text: "text-warning" },
  low: { bar: "bg-muted-foreground/40", badge: "bg-secondary text-muted-foreground border-border", text: "text-muted-foreground" },
};

const typeIcons = {
  bot_cluster: Bot,
  copy_paste: Copy,
  spike: Zap,
  coordinated: AlertTriangle,
};

const typeLabels = {
  bot_cluster: "Bot Cluster",
  copy_paste: "Copy-Paste",
  spike: "Spike",
  coordinated: "Coordinated",
};

const AlertItem = ({ alert, index }: { alert: AttackAlert; index: number }) => {
  const Icon = typeIcons[alert.type];
  const config = severityConfig[alert.severity] ?? severityConfig.low;
  const ts = new Date(alert.timestamp);
  const timeAgo = Math.max(0, Math.floor((Date.now() - ts.getTime()) / 60000));

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex gap-3 py-3 border-b border-border/50 last:border-0"
    >
      {/* Left severity bar */}
      <div className={`w-0.5 rounded-full flex-shrink-0 ${config.bar}`} />

      {/* Icon */}
      <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className={`w-3.5 h-3.5 ${config.text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground font-mono">{alert.hashtag}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${config.badge}`}>
            {typeLabels[alert.type]}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{alert.confidence}%</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{alert.description}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Clock className="w-3 h-3" />
          {timeAgo < 1 ? "just now" : `${timeAgo}m ago`}
        </div>
      </div>
    </motion.div>
  );
};

interface AlertFeedProps {
  alerts: AttackAlert[];
}

export const AlertFeed = ({ alerts }: AlertFeedProps) => {
  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Bot className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No alerts detected</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-transparent">
      {alerts.map((alert, i) => (
        <AlertItem key={alert.id} alert={alert} index={i} />
      ))}
    </div>
  );
};
