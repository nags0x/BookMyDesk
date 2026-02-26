import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import BookingCalendar from "@/components/BookingCalendar";
import FairnessScore from "@/components/FairnessScore";
import BookingHistory from "@/components/BookingHistory";
import SeatAvailability from "@/components/SeatAvailability";
import { useBookingStore } from "@/stores/bookingStore";
import { Armchair, CalendarCheck, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { stats } = useBookingStore();

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="label-caps mb-1">Overview</p>
          <h1 className="text-3xl font-serif italic text-foreground">Dashboard</h1>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d yyyy").toUpperCase()}
        </p>
      </motion.div>

      <div className="accent-line" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Available" value={stats.availableToday} icon={Armchair} color="success" />
        <StatCard label="Booked" value={stats.bookedToday} icon={CalendarCheck} color="info" />
        <StatCard label="Checked In" value={stats.checkedInToday} icon={Users} color="primary" />
        <StatCard label="Fairness" value={stats.fairnessScore} icon={TrendingUp} trend="Top 15%" color="warning" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BookingCalendar />
          <SeatAvailability />
        </div>
        <div className="space-y-6">
          <FairnessScore />
          <BookingHistory />
        </div>
      </div>
    </div>
  );
}
