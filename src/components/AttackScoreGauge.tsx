import { motion } from "framer-motion";

interface AttackScoreGaugeProps {
  score: number;
  label: string;
}

export const AttackScoreGauge = ({ score, label }: AttackScoreGaugeProps) => {
  const getColor = () => {
    if (score >= 75) return { text: "text-destructive", ring: "stroke-destructive", bg: "bg-destructive/8 border-destructive/20" };
    if (score >= 45) return { text: "text-warning", ring: "stroke-warning", bg: "bg-warning/8 border-warning/20" };
    return { text: "text-success", ring: "stroke-success", bg: "bg-success/8 border-success/20" };
  };

  const colors = getColor();
  const R = 48;
  const circumference = 2 * Math.PI * R;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const levelLabel = score >= 75 ? "HIGH" : score >= 45 ? "MED" : "LOW";

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Gauge */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          {/* Track */}
          <circle cx="56" cy="56" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
          {/* Fill */}
          <motion.circle
            cx="56" cy="56" r={R}
            fill="none"
            className={colors.ring}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <motion.span
            className={`text-2xl font-bold font-mono leading-none ${colors.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {score}
          </motion.span>
          <span className="text-[9px] text-muted-foreground font-mono">/ 100</span>
        </div>
      </div>

      {/* Label + badge */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border font-mono ${colors.bg} ${colors.text}`}>
          {levelLabel} RISK
        </span>
      </div>
    </div>
  );
};
