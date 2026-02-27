import { motion } from "framer-motion";
import type { SuspiciousAccount } from "@/services/api";
import { cn } from "@/lib/utils";

interface SuspiciousAccountsProps {
  accounts: SuspiciousAccount[];
}

const RiskBar = ({ value }: { value: number }) => {
  const color = value >= 80 ? "bg-destructive" : value >= 55 ? "bg-warning" : "bg-success";
  return (
    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

export const SuspiciousAccounts = ({ accounts }: SuspiciousAccountsProps) => {
  if (!accounts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <p className="text-xs text-muted-foreground">No accounts analyzed</p>
      </div>
    );
  }
  return (
    <div className="space-y-0 divide-y divide-border/50">
      {accounts.map((acc, i) => {
        const isHigh = acc.botScore >= 80;
        const scoreCls = isHigh ? "text-destructive" : acc.botScore >= 55 ? "text-warning" : "text-success";
        return (
          <motion.div
            key={acc.handle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 py-2.5"
          >
            {/* Score badge */}
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono flex-shrink-0 border",
              isHigh
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-warning/10 border-warning/20 text-warning"
            )}>
              {acc.botScore}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <a
                  href={`https://twitter.com/${acc.handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline truncate"
                >
                  {acc.handle}
                </a>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{acc.accountAge}d old</span>
              </div>
              <RiskBar value={acc.botScore} />
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">{acc.followers} followers</p>
              <p className="text-[10px] text-muted-foreground">{acc.tweets} posts</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
