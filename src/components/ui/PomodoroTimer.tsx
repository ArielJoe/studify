"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NumberFlow from "@number-flow/react";

type TimerMode = "work" | "shortBreak" | "longBreak";

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-7xl font-bold mb-8">
        <NumberFlow
          value={Math.floor(timeLeft / 60)}
          format={{ minimumIntegerDigits: 2 }}
          className="text-sky-400"
        />
        <span className="text-sky-300">:</span>
        <NumberFlow
          value={timeLeft % 60}
          format={{ minimumIntegerDigits: 2 }}
          className="text-sky-400"
        />
      </div>

      <div className="flex gap-4">
        <motion.button
          onClick={toggleTimer}
          whileTap={{ scale: 0.9 }}
          className="flex h-20 w-20 items-center justify-center rounded-full 
                     bg-gradient-to-br from-sky-400 to-cyan-400 text-white 
                     shadow-xl hover:shadow-sky-400/40 hover:scale-105 
                     transition-all duration-300"
        >
          <AnimatePresence initial={false} mode="wait">
            {isRunning ? (
              <motion.div
                key="pause"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Pause className="h-8 w-8" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Play className="h-8 w-8 ml-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <Button
          onClick={resetTimer}
          size="lg"
          className="w-16 h-16 rounded-full text-white bg-gradient-to-br from-sky-400 to-cyan-400 
                     shadow-md hover:shadow-sky-400/50 hover:scale-105 transition-all duration-300"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
