"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    work: 1,
    shortBreak: 1,
    longBreak: 1,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);


    const showSystemNotification = (title: string, body: string) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft,]);

  const handleTimerComplete = () => {
    setIsRunning(false);


    if (mode === "work") {
      setSessions((prev) => prev + 1);
      const nextMode = sessions % 4 === 3 ? "longBreak" : "shortBreak";

      showSystemNotification(
        "Waktu istirahat! 🎉",
        `Sesi ke-${sessions + 1} selesai. Ambil jeda sejenak.`
      );

      switchMode(nextMode);
    } else {

      showSystemNotification(
        "Istirahat selesai! 💪",
        "Waktunya kembali fokus bekerja."
      );

      switchMode("work");
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    const duration =
      newMode === "work"
        ? settings.work
        : newMode === "shortBreak"
        ? settings.shortBreak
        : settings.longBreak;
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration =
      mode === "work"
        ? settings.work
        : mode === "shortBreak"
        ? settings.shortBreak
        : settings.longBreak;
    setTimeLeft(duration * 60);
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    setIsRunning(false);
    const duration =
      mode === "work"
        ? newSettings.work
        : mode === "shortBreak"
        ? newSettings.shortBreak
        : newSettings.longBreak;
    setTimeLeft(duration * 60);
    setShowSettings(false);
    toast({
      title: "Pengaturan disimpan! ✓",
      description: "Durasi timer telah diperbarui.",
    });
  };



  const progress = () => {
    const total =
      mode === "work"
        ? settings.work * 60
        : mode === "shortBreak"
        ? settings.shortBreak * 60
        : settings.longBreak * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getModeLabel = () => {
    switch (mode) {
      case "work":
        return "Fokus Kerja";
      case "shortBreak":
        return "Istirahat Singkat";
      case "longBreak":
        return "Istirahat Panjang";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-md space-y-8 relative">
       {/* Mode Selector */}
<div className="flex gap-2 justify-center">
  {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
    <button
      key={m}
      onClick={() => switchMode(m)}
      disabled={isRunning}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md",
        mode === m
          ? "bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sky-300 hover:shadow-lg hover:shadow-sky-400/40 scale-105"
          : "bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 hover:from-sky-200 hover:to-cyan-200"
      )}
    >
      {m === "work"
        ? "Kerja"
        : m === "shortBreak"
        ? "Istirahat"
        : "Istirahat Panjang"}
    </button>
  ))}
</div>

        {/* Settings Button */}
        <div className="absolute top-0 right-0">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <Settings className="scale-150" />
          </Button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-14 right-0 z-50 w-80 p-6 rounded-2xl bg-card border shadow-lg space-y-4"
            >
              <h3 className="font-semibold text-lg">Pengaturan Timer</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="work">Kerja (menit)</Label>
                  <Input
                    id="work"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.work}
                    onChange={(e) =>
                      setSettings({ ...settings, work: parseInt(e.target.value) || 25 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreak">Istirahat Pendek (menit)</Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreak}
                    onChange={(e) =>
                      setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreak">Istirahat Panjang (menit)</Label>
                  <Input
                    id="longBreak"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreak}
                    onChange={(e) =>
                      setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })
                    }
                  />
                </div>
              </div>
             {/* Settings Save Button */}
<Button
  onClick={() => updateSettings(settings)}
  className="w-full bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
>
  Simpan Pengaturan
</Button>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        <div className="relative">
          {/* Mode Label */}
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {getModeLabel()}
            </span>
          </div>
          
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <defs>
              {/* Gradient untuk background */}
              <linearGradient
                id="bgGradient"
                x1="0"
                y1="0"
                x2="200"
                y2="200"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
              </linearGradient>

              {/* Gradient untuk progress */}
              <linearGradient
                id="progressGradient"
                x1="0"
                y1="0"
                x2="200"
                y2="200"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

  {/* Background Circle */}
  <circle
    cx="100"
    cy="100"
    r="90"
    stroke="url(#bgGradient)"
    strokeWidth="10"
    fill="none"
  />


{/* Progress Circle */}
<circle
  cx="100"
  cy="100"
  r="90"
  stroke="url(#progressGradient)"
  strokeWidth="10"
  fill="none"
  strokeLinecap="round"
  strokeDasharray={`${2 * Math.PI * 90}`}
  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress() / 100)}`}
  className={cn(
    "transition-all ease-linear",
    isRunning ? "duration-700" : "duration-0"
  )}
  key={mode + timeLeft} // key tambahan supaya render ulang saat mode ganti
/>

</svg>


          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" >
            <div className="text-7xl font-bold tracking-tight">
              <NumberFlow 
                value={Math.floor(timeLeft / 60)} 
                format={{ minimumIntegerDigits: 2 }}
                className="bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-sky-400"
              />
             <span className="bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-sky-300">:</span>

              <NumberFlow 
                value={timeLeft % 60}
                format={{ minimumIntegerDigits: 2 }}
                className="bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-sky-400"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
            {/* Play / Pause Button */}
<motion.button
  onClick={toggleTimer}
  whileTap={{ scale: 0.9 }}
  className="flex h-24 w-24 items-center justify-center rounded-full 
             bg-gradient-to-br from-sky-400 to-cyan-400 text-white 
             shadow-xl hover:shadow-sky-400/40 hover:scale-105 
             transition-all duration-300"
>
  <AnimatePresence initial={false} mode="wait">
    {isRunning ? (
      <motion.div
        key="pause"
        initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
        transition={{ duration: 0.1 }}
      >
        <Pause className="h-8 w-8" />
      </motion.div>
    ) : (
      <motion.div
        key="play"
        initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
        transition={{ duration: 0.1 }}
      >
        <Play className="h-8 w-8 ml-1" />
      </motion.div>
    )}
  </AnimatePresence>
</motion.button>

       {/* Reset Button */}
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
    </div>
  );
}
