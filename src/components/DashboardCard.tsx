import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  glowVariant?: "primary" | "danger" | "warning" | "none";
  badge?: string;
}

export const DashboardCard = ({
  title,
  icon,
  children,
  className = "",
  glowVariant = "none",
  badge,
}: DashboardCardProps) => {
  const glowClass =
    glowVariant === "primary"
      ? "glow-primary"
      : glowVariant === "danger"
        ? "glow-danger"
        : glowVariant === "warning"
          ? "glow-warning"
          : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-border bg-card flex flex-col overflow-hidden",
        glowClass,
        className
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="text-muted-foreground flex-shrink-0">{icon}</span>
          )}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border flex-shrink-0">
            {badge}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex-1 p-4">{children}</div>
    </motion.div>
  );
};
