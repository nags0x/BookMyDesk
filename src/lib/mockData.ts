import { addDays, format, startOfWeek, isWeekend, isSameDay } from "date-fns";

export interface User {
  id: string;
  name: string;
  email: string;
  batchId: string;
  squadNo: number;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
}

export interface Booking {
  id: string;
  userId: string;
  date: Date;
  seatType: "GUARANTEED" | "BUFFER";
  status: "BOOKED" | "CANCELLED" | "LATE_CANCEL" | "CHECKED_IN" | "ABSENT";
  requestTime: Date;
  checkedInAt?: Date;
}

export interface DailySeatInventory {
  date: Date;
  guaranteedTotal: number;
  guaranteedBooked: number;
  bufferTotal: number;
  bufferBooked: number;
}

export interface FairnessScore {
  bufferUsage: number;
  lateCancellations: number;
  absences: number;
  score: number; // 0-100
}

export const currentUser: User = {
  id: "u1",
  name: "Alex Chen",
  email: "alex.chen@company.com",
  batchId: "batch-1",
  squadNo: 1,
  role: "USER",
  status: "ACTIVE",
};

export const batches = [
  { id: "batch-1", name: "Batch Alpha" },
  { id: "batch-2", name: "Batch Beta" },
];

// Cycle config: starting from a Monday
const cycleStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });

export function getBatchDays(batchId: string, weekOffset: number): number[] {
  // 2-week rotation
  const weekInCycle = weekOffset % 2;
  if (batchId === "batch-1") {
    return weekInCycle === 0 ? [1, 2, 3] : [4, 5]; // Mon-Wed or Thu-Fri
  }
  return weekInCycle === 0 ? [4, 5] : [1, 2, 3];
}

export function isUserScheduledDay(batchId: string, date: Date): boolean {
  if (isWeekend(date)) return false;
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const diffWeeks = Math.floor((weekStart.getTime() - cycleStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
  const scheduledDays = getBatchDays(batchId, diffWeeks);
  return scheduledDays.includes(dayOfWeek);
}

export function generateInventory(startDate: Date, days: number): DailySeatInventory[] {
  const inventory: DailySeatInventory[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    if (isWeekend(date)) continue;
    const gBooked = Math.floor(Math.random() * 8) + 2;
    const bBooked = Math.floor(Math.random() * 6);
    inventory.push({
      date,
      guaranteedTotal: 10,
      guaranteedBooked: gBooked,
      bufferTotal: 10 + (10 - gBooked), // unused guaranteed added
      bufferBooked: bBooked,
    });
  }
  return inventory;
}

export const mockBookings: Booking[] = [
  {
    id: "b1",
    userId: "u1",
    date: new Date(),
    seatType: "GUARANTEED",
    status: "CHECKED_IN",
    requestTime: addDays(new Date(), -1),
    checkedInAt: new Date(),
  },
  {
    id: "b2",
    userId: "u1",
    date: addDays(new Date(), 1),
    seatType: "GUARANTEED",
    status: "BOOKED",
    requestTime: new Date(),
  },
  {
    id: "b3",
    userId: "u1",
    date: addDays(new Date(), -3),
    seatType: "BUFFER",
    status: "CHECKED_IN",
    requestTime: addDays(new Date(), -4),
    checkedInAt: addDays(new Date(), -3),
  },
];

export const mockFairness: FairnessScore = {
  bufferUsage: 2,
  lateCancellations: 0,
  absences: 1,
  score: 87,
};

export const mockInventory = generateInventory(addDays(new Date(), -3), 21);

export const holidays = [
  { date: addDays(new Date(), 10), description: "Company Holiday" },
];

// Stats
export const stats = {
  totalSeatsToday: 20,
  bookedToday: 14,
  availableToday: 6,
  checkedInToday: 11,
  yourActiveBookings: 2,
  fairnessScore: 87,
};
