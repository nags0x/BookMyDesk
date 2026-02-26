import { motion } from "framer-motion";
import { mockInventory } from "@/lib/mockData";
import { format, isToday } from "date-fns";

export default function SeatAvailability() {
  const upcoming = mockInventory.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6"
    >
      <p className="label-caps mb-4">Seat Availability</p>
      <div className="space-y-4">
        {upcoming.map((inv) => {
          const total = inv.guaranteedTotal + inv.bufferTotal;
          const booked = inv.guaranteedBooked + inv.bufferBooked;
          const available = total - booked;
          const pct = (booked / total) * 100;

          return (
            <div key={inv.date.toISOString()} className="flex items-center gap-4">
              <div className="w-20 shrink-0">
                <span className={`text-[11px] font-mono ${isToday(inv.date) ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday(inv.date) ? "TODAY" : format(inv.date, "EEE dd").toUpperCase()}
                </span>
              </div>
              <div className="flex-1 h-1 bg-border relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 ${
                    pct > 80 ? "bg-destructive" : pct > 50 ? "bg-warning" : "bg-primary"
                  }`}
                />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground w-12 text-right">
                {available}/{total}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
