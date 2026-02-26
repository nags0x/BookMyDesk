import { motion } from "framer-motion";
import { mockFairness } from "@/lib/mockData";

export default function FairnessScore() {
  const { score, bufferUsage, lateCancellations, absences } = mockFairness;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6"
    >
      <p className="label-caps mb-4">Fairness Index</p>
      <div className="flex items-center gap-6">
        {/* Radial gauge */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="butt"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold metric">{score}</span>
            <span className="text-[9px] text-muted-foreground font-mono">/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-3">
          {[
            { label: "Buffer used", value: bufferUsage, max: 10 },
            { label: "Late cancels", value: lateCancellations, max: 5 },
            { label: "Absences", value: absences, max: 5 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <span className="text-[11px] metric">{item.value}</span>
              </div>
              <div className="h-px bg-border relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary/60"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
