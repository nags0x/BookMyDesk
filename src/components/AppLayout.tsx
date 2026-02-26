import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { currentUser } from "@/lib/mockData";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/admin", icon: BarChart3, label: "Admin" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative flex flex-col border-r border-border bg-sidebar shrink-0"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <div className="w-7 h-7 border border-primary flex items-center justify-center shrink-0">
            <span className="text-primary font-mono text-xs font-bold">SB</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-serif text-lg text-foreground whitespace-nowrap overflow-hidden italic"
              >
                SeatBook
              </motion.span>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          {!collapsed && (
            <p className="label-caps px-3 mb-3">Navigation</p>
          )}
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors relative ${isActive
                    ? "text-primary"
                    : "text-sidebar-foreground hover:text-foreground"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary"
                      transition={{ duration: 0.15 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3">
            <div className="w-7 h-7 border border-border flex items-center justify-center shrink-0 text-muted-foreground">
              <span className="text-[10px] font-mono font-bold">AC</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-foreground truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">BATCH-α · SQUAD 1</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
