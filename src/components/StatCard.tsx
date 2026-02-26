import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: boolean;
  color?: "primary" | "success" | "warning" | "info" | "destructive";
}

export default function StatCard({ label, value, icon: Icon, trend, accent }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`panel p-5 relative overflow-hidden group ${accent ? "border-primary/20" : ""
        }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="label-caps mb-3">{label}</p>
          <p className="text-3xl metric font-bold leading-none">{value}</p>
          {trend && (
            <p className="text-[11px] text-success mt-2 font-mono">{trend}</p>
          )}
        </div>
        <Icon
          className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground/40"}`}
          strokeWidth={1.5}
        />
      </div>
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/30" />
      )}
    </motion.div>
  );
}
