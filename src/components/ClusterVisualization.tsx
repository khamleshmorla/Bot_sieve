import { motion } from "framer-motion";
import type { ClusterNode } from "@/services/api";

interface ClusterVisualizationProps {
  clusters: ClusterNode[];
}

export const ClusterVisualization = ({ clusters }: ClusterVisualizationProps) => {
  if (!clusters.length) {
    return (
      <div className="w-full h-56 flex items-center justify-center bg-secondary/20 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">No cluster data</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 bg-secondary/20 rounded-lg border border-border/60 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(hsl(222,14%,40%) 1px, transparent 1px), linear-gradient(90deg, hsl(222,14%,40%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Connection lines — only between bot clusters */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {clusters.filter(c => c.botScore > 50).flatMap((c, i) =>
          clusters
            .filter(o => o.id !== c.id && o.botScore > 50 && o.id > c.id)
            .map(o => (
              <motion.line
                key={`${c.id}-${o.id}`}
                x1={`${c.x}%`} y1={`${c.y}%`}
                x2={`${o.x}%`} y2={`${o.y}%`}
                stroke="hsl(4,72%,55%)"
                strokeWidth="1"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
              />
            ))
        )}
      </svg>

      {/* Nodes */}
      {clusters.map((cluster, i) => {
        const isBot = cluster.botScore > 50;
        const rawSize = Math.max(36, Math.min(72, cluster.size / 5));
        return (
          <motion.div
            key={cluster.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${cluster.x}%`, top: `${cluster.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          >
            <motion.div
              animate={isBot ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className={`rounded-full flex items-center justify-center border font-mono text-[10px] font-bold ${isBot
                  ? "bg-destructive/15 border-destructive/30 text-destructive"
                  : "bg-primary/10 border-primary/25 text-primary"
                }`}
              style={{ width: rawSize, height: rawSize }}
            >
              {cluster.size}
            </motion.div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap leading-none">
              {cluster.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
