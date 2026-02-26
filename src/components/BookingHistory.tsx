import { motion } from "framer-motion";
import { useBookingStore } from "@/stores/bookingStore";
import { format } from "date-fns";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function BookingHistory() {
  const { bookings, cancelBooking } = useBookingStore();
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED");

  const handleCancel = (id: string) => {
    cancelBooking(id);
    toast.success("Booking cancelled");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-6"
    >
      <p className="label-caps mb-4">Upcoming Reservations</p>
      <div className="divide-y divide-border">
        {activeBookings.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center font-serif italic">
            No active reservations
          </p>
        )}
        {activeBookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-3 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 text-center">
                <p className="text-lg font-bold metric leading-none">
                  {format(booking.date, "d")}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                  {format(booking.date, "MMM")}
                </p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <p className="text-sm text-foreground">
                  {format(booking.date, "EEEE")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${
                    booking.status === "CHECKED_IN" ? "text-success" :
                    booking.status === "BOOKED" ? "text-primary" :
                    "text-muted-foreground"
                  }`}>
                    {booking.status.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                    {booking.seatType}
                  </span>
                </div>
              </div>
            </div>
            {booking.status === "BOOKED" && (
              <button
                onClick={() => handleCancel(booking.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
