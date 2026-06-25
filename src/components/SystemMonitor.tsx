import { motion } from "framer-motion";
import { Activity, HardDrive, Wifi, Clock } from "lucide-react";
import { useSystemMonitor } from "@/hooks/useSystemMonitor";

export function SystemMonitor() {
  const stats = useSystemMonitor();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed left-4 top-4 z-50"
    >
      <div className="border-glow rounded-lg bg-[rgba(10,5,30,0.9)] backdrop-blur-md p-4 w-[260px] corner-accent">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
            System Monitor
          </span>
        </div>

        {/* CPU */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider">CPU Usage</span>
            <span className="text-[10px] font-mono text-cyan-400">{stats.cpuUsage}%</span>
          </div>
          <div className="h-1.5 bg-[rgba(0,212,255,0.1)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #7c3aed, #00d4ff)",
                boxShadow: "0 0 6px rgba(0, 212, 255, 0.5)",
              }}
              animate={{ width: `${stats.cpuUsage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider">Memory</span>
            <span className="text-[10px] font-mono text-cyan-400">
              {stats.usedMemory} / {stats.totalMemory} MB
            </span>
          </div>
          <div className="h-1.5 bg-[rgba(0,212,255,0.1)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #a855f7, #7c3aed)",
                boxShadow: "0 0 6px rgba(168, 85, 247, 0.5)",
              }}
              animate={{ width: `${stats.memoryUsage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Network & Uptime */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span
              className={`text-[10px] font-mono ${
                stats.networkStatus === "ONLINE" ? "text-green-400" : "text-red-400"
              }`}
            >
              {stats.networkStatus}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-mono text-purple-300">
              {Math.floor(stats.uptime / 60)}m {stats.uptime % 60}s
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-2 pt-2 border-t border-[rgba(0,212,255,0.1)]">
          <span className="text-[9px] font-mono text-[rgba(0,212,255,0.5)]">
            {stats.timestamp}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
