import { motion } from "framer-motion";

interface FakeOrganicMeterProps {
  fakePercent: number;
}

export const FakeOrganicMeter = ({ fakePercent }: FakeOrganicMeterProps) => {
  const organicPercent = 100 - fakePercent;

  const fakeColor =
    fakePercent >= 70 ? "bg-destructive" :
      fakePercent >= 40 ? "bg-warning" : "bg-success";

  return (
    <div className="space-y-4 py-1">
      {/* Labels */}
      <div className="flex justify-between text-xs font-medium">
        <span className="text-success">Organic</span>
        <span className="text-muted-foreground">Real vs Fake</span>
        <span className="text-destructive">Bot / Fake</span>
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-secondary overflow-hidden border border-border/60">
        <motion.div
          className="absolute inset-y-0 left-0 bg-success/70 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${organicPercent}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.div
          className={`absolute inset-y-0 right-0 ${fakeColor}/70 rounded-r-full`}
          initial={{ width: 0 }}
          animate={{ width: `${fakePercent}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>

      {/* Values */}
      <div className="flex justify-between">
        <div className="text-center">
          <p className="text-xl font-bold font-mono text-success">{organicPercent}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Real users</p>
        </div>
        <div className="text-center border-l border-border pl-4 ml-4">
          <p className={`text-xl font-bold font-mono ${fakePercent >= 70 ? "text-destructive" : "text-warning"}`}>
            {fakePercent}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Bot/Fake</p>
        </div>
      </div>
    </div>
  );
};
