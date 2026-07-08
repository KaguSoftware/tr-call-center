"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ActivityContextValue = {
  start: () => () => void;
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  const start = useCallback(() => {
    countRef.current += 1;
    setCount(countRef.current);
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      countRef.current = Math.max(0, countRef.current - 1);
      setCount(countRef.current);
    };
  }, []);

  return (
    <ActivityContext.Provider value={{ start }}>
      <div className="fixed top-0 inset-x-0 z-[70] pointer-events-none">
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              key="activity-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-[3px] w-full overflow-hidden bg-accent/15"
            >
              <motion.div
                className="h-full w-1/3 bg-accent rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside <ActivityProvider>");
  return ctx;
}

// Convenience wrapper: runs an async function while the global activity bar
// is shown, regardless of success/failure. Prefer this over calling
// start()/stop() manually at call sites.
export function useTrackedAction() {
  const { start } = useActivity();
  return useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const stop = start();
      try {
        return await fn();
      } finally {
        stop();
      }
    },
    [start],
  );
}
