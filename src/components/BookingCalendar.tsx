import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  addDays,
  format,
  startOfWeek,
  isSameDay,
  isWeekend,
  isBefore,
  startOfDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBookingStore } from "@/stores/bookingStore";
import { isUserScheduledDay, currentUser, mockInventory } from "@/lib/mockData";
import { toast } from "sonner";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function BookingCalendar() {
  const { bookings, selectedDate, setSelectedDate, addBooking } = useBookingStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(
    () => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7),
    [weekOffset]
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const getDateStatus = (date: Date) => {
    if (isWeekend(date)) return "weekend";
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return "past";
    const booking = bookings.find(
      (b) => isSameDay(b.date, date) && b.status !== "CANCELLED"
    );
    if (booking) return booking.status.toLowerCase();
    if (isUserScheduledDay(currentUser.batchId, date)) return "available";
    return "buffer-only";
  };

  const getInventory = (date: Date) =>
    mockInventory.find((inv) => isSameDay(inv.date, date));

  const handleBook = (date: Date) => {
    const status = getDateStatus(date);
    if (status === "weekend" || status === "past") return;
    if (status === "booked" || status === "checked_in") {
      toast.info("You already have a booking for this day");
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
    toast.success(`Seat booked for ${format(date, "EEE, MMM d")}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-caps mb-1">Week Schedule</p>
          <h3 className="text-xl font-serif italic text-foreground">
            {format(weekStart, "MMMM d")} — {format(addDays(weekStart, 6), "MMMM d, yyyy")}
          </h3>
        </div>
        <div className="flex items-center border border-border divide-x divide-border">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-2 hover:bg-secondary transition-colors text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            Now
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-border">
        {/* Day headers */}
        {DAYS.map((d) => (
          <div key={d} className="text-center py-2 border-b border-border bg-secondary/30">
            <span className="text-[9px] font-mono tracking-[0.15em] text-muted-foreground">{d}</span>
          </div>
        ))}
        {/* Day cells */}
        {days.map((date, idx) => {
          const status = getDateStatus(date);
          const inv = getInventory(date);
          const isSelected = isSameDay(date, selectedDate);
          const isWknd = isWeekend(date);

          const cellBg = {
            weekend: "bg-secondary/20",
            past: "bg-secondary/10",
            booked: "bg-primary/8",
            checked_in: "bg-success/8",
            available: "bg-transparent hover:bg-primary/5",
            "buffer-only": "bg-transparent hover:bg-warning/5",
          }[status] || "";

          const canInteract = status === "available" || status === "buffer-only";

          return (
            <motion.button
              key={date.toISOString()}
              whileTap={canInteract ? { scale: 0.96 } : {}}
              onClick={() => {
                setSelectedDate(date);
                if (canInteract) handleBook(date);
              }}
              disabled={isWknd}
              className={`relative flex flex-col items-center justify-center py-4 transition-colors ${cellBg} ${
                idx < 6 ? "border-r border-border" : ""
              } ${isSelected ? "ring-1 ring-inset ring-primary/40" : ""} ${
                canInteract ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {isToday(date) && (
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-primary" />
              )}
              <span className={`text-base metric font-bold leading-none ${
                isWknd ? "text-muted-foreground/30" : 
                status === "booked" ? "text-primary" :
                status === "checked_in" ? "text-success" :
                "text-foreground"
              }`}>
                {format(date, "d")}
              </span>
              {inv && !isWknd && (
                <span className="text-[9px] font-mono text-muted-foreground mt-1.5">
                  {inv.guaranteedTotal + inv.bufferTotal - inv.guaranteedBooked - inv.bufferBooked}
                </span>
              )}
              {status === "booked" && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-px bg-primary" />
              )}
              {status === "checked_in" && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-px bg-success" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 pt-3 border-t border-border">
        {[
          { marker: "bg-primary", label: "Booked" },
          { marker: "bg-success", label: "Checked in" },
          { marker: "bg-border", label: "Available" },
          { marker: "bg-muted-foreground/30", label: "Buffer" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-px ${item.marker}`} />
            <span className="text-[10px] font-mono text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
