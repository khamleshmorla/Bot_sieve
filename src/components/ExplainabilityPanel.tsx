import { motion } from "framer-motion";
import type { ExplainabilityFactor } from "@/services/api";

interface ExplainabilityPanelProps {
  factors: ExplainabilityFactor[];
}

export const ExplainabilityPanel = ({ factors }: ExplainabilityPanelProps) => {
  if (!factors.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs text-muted-foreground">Run an analysis to see results</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Signals that triggered this classification:
      </p>
      {factors.map((factor, i) => {
        const barColor =
          factor.color === "destructive" ? "bg-destructive" :
            factor.color === "warning" ? "bg-warning" : "bg-success";
        const valColor =
          factor.color === "destructive" ? "text-destructive" :
            factor.color === "warning" ? "text-warning" : "text-success";

        return (
          <motion.div
            key={factor.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-foreground/80 leading-tight flex-1">{factor.label}</span>
              <span className={`text-xs font-mono font-semibold flex-shrink-0 ${valColor}`}>
                {factor.value}%
              </span>
            </div>
            {/* Custom progress bar */}
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${barColor} opacity-75`}
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.08 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
