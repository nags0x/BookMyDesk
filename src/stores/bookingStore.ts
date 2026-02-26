import { create } from "zustand";
import { Booking, mockBookings, mockFairness, FairnessScore, stats } from "@/lib/mockData";
import { addDays } from "date-fns";

interface BookingState {
  bookings: Booking[];
  fairness: FairnessScore;
  stats: typeof stats;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: mockBookings,
  fairness: mockFairness,
  stats,
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addBooking: (booking) =>
    set((state) => ({
      bookings: [...state.bookings, booking],
      stats: {
        ...state.stats,
        yourActiveBookings: state.stats.yourActiveBookings + 1,
      },
    })),
  cancelBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b
      ),
      stats: {
        ...state.stats,
        yourActiveBookings: Math.max(0, state.stats.yourActiveBookings - 1),
      },
    })),
}));
