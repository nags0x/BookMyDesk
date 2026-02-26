import { motion } from "framer-motion";
import { mockInventory } from "@/lib/mockData";
import { format } from "date-fns";
import {
  Upload,
  CalendarDays,
  Settings,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const chartData = mockInventory.slice(0, 10).map((inv) => ({
  day: format(inv.date, "EEE d"),
  guaranteed: inv.guaranteedBooked,
  buffer: inv.bufferBooked,
  available:
    inv.guaranteedTotal + inv.bufferTotal - inv.guaranteedBooked - inv.bufferBooked,
}));

const adminActions = [
  { icon: Upload, label: "Bulk Import", desc: "Upload CSV with user data" },
  { icon: CalendarDays, label: "Holidays", desc: "Configure non-working days" },
  { icon: Settings, label: "Cycle Config", desc: "Adjust rotation schedule" },
  { icon: Users, label: "Users", desc: "View and manage users" },
];

export default function AdminPage() {
  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-caps mb-1">Management</p>
        <h1 className="text-3xl font-serif italic text-foreground">Admin</h1>
      </motion.div>

      <div className="accent-line" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        {adminActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card p-5 text-left hover:bg-secondary/40 transition-colors group"
          >
            <action.icon
              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mb-4"
              strokeWidth={1.5}
            />
            <p className="text-sm text-foreground mb-0.5">{action.label}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{action.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel p-6"
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="label-caps mb-1">Analytics</p>
            <h3 className="text-xl font-serif italic text-foreground">Seat Utilization</h3>
          </div>
          <div className="flex items-center gap-5 text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-primary" /> Guaranteed
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-warning" /> Buffer
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-border" /> Available
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={1} barSize={18}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(40 6% 14%)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(40 10% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(40 10% 50%)", fontSize: 10, fontFamily: "Space Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(40 10% 7%)",
                border: "1px solid hsl(40 6% 14%)",
                borderRadius: "2px",
                fontSize: "11px",
                fontFamily: "Space Mono",
                color: "hsl(40 20% 92%)",
              }}
            />
            <Bar dataKey="guaranteed" fill="hsl(38 75% 55%)" radius={[1, 1, 0, 0]} />
            <Bar dataKey="buffer" fill="hsl(30 90% 52%)" radius={[1, 1, 0, 0]} />
            <Bar dataKey="available" fill="hsl(40 6% 14%)" radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Activity placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel p-6"
      >
        <p className="label-caps mb-4">Recent Activity</p>
        <p className="text-sm text-muted-foreground text-center py-8 font-serif italic">
          Connect to Lovable Cloud to enable live data
        </p>
      </motion.div>
    </div>
  );
}
