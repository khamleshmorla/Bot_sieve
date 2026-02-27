import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { SentimentPoint } from "@/services/api";

interface SentimentChartProps {
  data: SentimentPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-foreground/70">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const SentimentChart = ({ data }: SentimentChartProps) => {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(187,72%,47%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(187,72%,47%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(4,72%,55%)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="hsl(4,72%,55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradFake" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(36,88%,52%)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="hsl(36,88%,52%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,14%,14%)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="hsl(215,12%,35%)"
            tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            stroke="hsl(215,12%,35%)"
            tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", paddingTop: 8 }}
            iconSize={8}
            iconType="circle"
          />
          <Area type="monotone" dataKey="positive" name="Positive" stroke="hsl(187,72%,47%)" fill="url(#gradPos)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="negative" name="Negative" stroke="hsl(4,72%,55%)" fill="url(#gradNeg)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="fake" name="Bot %" stroke="hsl(36,88%,52%)" fill="url(#gradFake)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
