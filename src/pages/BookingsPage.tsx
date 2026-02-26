import { motion } from "framer-motion";
import { format, addDays, isWeekend, startOfWeek, isSameDay } from "date-fns";
import { useBookingStore } from "@/stores/bookingStore";
import { isUserScheduledDay, currentUser, mockInventory } from "@/lib/mockData";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function BookingsPage() {
  const { bookings, addBooking, cancelBooking } = useBookingStore();
  const [viewWeeks] = useState(2);

  const allDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: viewWeeks * 7 }, (_, i) => addDays(start, i)).filter(
      (d) => !isWeekend(d)
    );
  }, [viewWeeks]);

  const handleBook = (date: Date) => {
    const existing = bookings.find(
      (b) => isSameDay(b.date, date) && b.status !== "CANCELLED"
    );
    if (existing) {
      toast.info("Already booked");
      return;
    }
    addBooking({
      id: `b-${Date.now()}`,
      userId: currentUser.id,
      date,
      seatType: isUserScheduledDay(currentUser.batchId, date) ? "GUARANTEED" : "BUFFER",
      status: "BOOKED",
      requestTime: new Date(),
    });
    toast.success(`Booked for ${format(date, "EEE, MMM d")}`);
  };

  return (
    <div className="p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-caps mb-1">Reservations</p>
        <h1 className="text-3xl font-serif italic text-foreground">Bookings</h1>
      </motion.div>

      <div className="accent-line" />

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel p-5 flex items-start gap-4"
      >
        <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
        <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
          <p><span className="text-foreground">GUARANTEED</span> — Book up to 14 days ahead. Same-day until 09:00.</p>
          <p><span className="text-foreground">BUFFER</span> — Next working day only, 15:00 – 09:00 window.</p>
          <p><span className="text-foreground">CANCEL</span> — Free until previous day 21:00. Check-in by 10:00.</p>
        </div>
      </motion.div>

      {/* Day list */}
      <div className="border border-border divide-y divide-border">
        {allDays.map((date, i) => {
          const isScheduled = isUserScheduledDay(currentUser.batchId, date);
          const booking = bookings.find(
            (b) => isSameDay(b.date, date) && b.status !== "CANCELLED"
          );
          const inv = mockInventory.find((d) => isSameDay(d.date, date));
          const available = inv
            ? inv.guaranteedTotal + inv.bufferTotal - inv.guaranteedBooked - inv.bufferBooked
            : 0;

          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.015 }}
              className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-center gap-5">
                <div className="text-center w-10">
                  <p className="text-lg font-bold metric leading-none">{format(date, "d")}</p>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                    {format(date, "MMM")}
                  </p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <p className="text-sm text-foreground">{format(date, "EEEE")}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-[9px] font-mono uppercase tracking-wider ${isScheduled ? "text-primary" : "text-warning"
                      }`}>
                      {isScheduled ? "GUARANTEED" : "BUFFER"}
                    </span>
                    {inv && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {available} seats
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {booking ? (
                  <div className="flex items-center gap-3">
                    <Badge variant={booking.status === "CHECKED_IN" ? "success" : "info"}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                    {booking.status === "BOOKED" && (
                      <button
                        onClick={() => {
                          cancelBooking(booking.id);
                          toast.success("Cancelled");
                        }}
                        className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleBook(date)}
                    className="text-[10px] font-mono uppercase tracking-wider px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-sm"
                  >
                    Reserve
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
