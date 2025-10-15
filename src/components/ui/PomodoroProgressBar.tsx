import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  timeRemaining: number;
  totalTime: number;
  currentTaskId?: string;
}

interface PomodoroProgressBarProps {
  timerState: TimerState;
  onTimerComplete: () => void;
  onTogglePause: () => void;
  onReset: () => void;
}

const PomodoroProgressBar = ({
  timerState,
  onTimerComplete,
  onTogglePause,
  onReset,
}: PomodoroProgressBarProps) => {
  const [displayTime, setDisplayTime] = useState(timerState.timeRemaining);

  useEffect(() => {
    setDisplayTime(timerState.timeRemaining);
  }, [timerState.timeRemaining]);

  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        if (prev <= 1) {
          onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isActive, timerState.isPaused, onTimerComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress =
    ((timerState.totalTime - displayTime) / timerState.totalTime) * 100;

  if (!timerState.isActive) {
    return null;
  }

  return (
    <Card className="p-8 bg-gradient-card backdrop-blur-sm border-border shadow-strong">
      <div className="flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-sky-600 mb-1">
            {timerState.isBreak ? "Break Time" : "Focus Time"}
          </h3>
          <div className="text-6xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">
            {formatTime(displayTime)}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={onTogglePause}
            size="lg"
            className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
          >
            {timerState.isPaused ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            )}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="text-sky-600 hover:bg-sky-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroProgressBar;
