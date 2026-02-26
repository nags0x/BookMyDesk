import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 lg:p-10 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-caps mb-1">Configuration</p>
        <h1 className="text-3xl font-serif italic text-foreground">Settings</h1>
      </motion.div>

      <div className="accent-line" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel p-10 text-center"
      >
        <SettingsIcon className="w-5 h-5 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-foreground font-serif italic text-lg">Coming soon</p>
        <p className="text-[11px] font-mono text-muted-foreground mt-2">
          CYCLE START · SEAT CAPACITY · HOLIDAYS · NOTIFICATIONS
        </p>
      </motion.div>
    </div>
  );
}
