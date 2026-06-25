import { useState, useEffect, useCallback } from "react";

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  usedMemory: number;
  uptime: number;
  networkStatus: string;
  timestamp: string;
}

export function useSystemMonitor() {
  const [stats, setStats] = useState<SystemStats>({
    cpuUsage: 0,
    memoryUsage: 0,
    totalMemory: 0,
    usedMemory: 0,
    uptime: 0,
    networkStatus: "ONLINE",
    timestamp: new Date().toLocaleTimeString("id-ID"),
  });

  const updateStats = useCallback(async () => {
    // Memory info
    const memory = (performance as any).memory;
    const usedMemory = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;
    const totalMemory = memory ? memory.totalJSHeapSize / (1024 * 1024) : 0;
    const memoryUsage = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

    // CPU estimation via frame timing
    const start = performance.now();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const frameTime = performance.now() - start;
    const cpuUsage = Math.min(100, Math.max(0, (frameTime / 16.67) * 100 * 0.3));

    // Network status
    const networkStatus = navigator.onLine ? "ONLINE" : "OFFLINE";

    setStats({
      cpuUsage: Math.round(cpuUsage),
      memoryUsage: Math.round(memoryUsage),
      totalMemory: Math.round(totalMemory),
      usedMemory: Math.round(usedMemory),
      uptime: Math.round(performance.now() / 1000),
      networkStatus,
      timestamp: new Date().toLocaleTimeString("id-ID"),
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(updateStats, 2000);
    updateStats();
    return () => clearInterval(interval);
  }, [updateStats]);

  return stats;
}
