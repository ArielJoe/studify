"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Timer } from "lucide-react";
import SubjectCard from "@/components/ui/SubjectCard";
import TaskList from "@/components/ui/TaskList";
import PomodoroProgressBar from "@/components/ui/PomodoroProgressBar";
import CreateSubjectDialog from "@/components/ui/CreateSubjectDialog";
import CreateTaskDialog from "@/components/ui/CreateTaskDialog";
import { toast } from "@/hooks/use-toast";

export interface Subject {
  id: string;
  title: string;
  description: string;
  scheduledDate?: Date;
  createdAt: Date;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  timeRemaining: number;
  totalTime: number;
  currentTaskId?: string;
}

const Page = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
  });

  const createSubject = (
    title: string,
    description: string,
    scheduledDate?: Date
  ) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      title,
      description,
      scheduledDate,
      createdAt: new Date(),
    };
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Subject created",
      description: scheduledDate
        ? `${title} scheduled for ${scheduledDate.toLocaleDateString()}`
        : `${title} has been added to your study tracker.`,
    });
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    setTasks(tasks.filter((t) => t.subjectId !== id));
    if (selectedSubject?.id === id) {
      setSelectedSubject(null);
    }
    toast({
      title: "Subject deleted",
      description: "The subject and its tasks have been removed.",
    });
  };

  const createTask = (
    title: string,
    pomodoroMinutes: number,
    breakMinutes: number
  ) => {
    if (!selectedSubject) return;

    const newTask: Task = {
      id: Date.now().toString(),
      subjectId: selectedSubject.id,
      title,
      pomodoroMinutes,
      breakMinutes,
      completed: false,
      createdAt: new Date(),
    };

    setTasks([...tasks, newTask]);
    toast({
      title: "Task created",
      description: `${title} with ${pomodoroMinutes}min Pomodoro and ${breakMinutes}min break has been added.`,
    });
  };

  const startTask = (task: Task) => {
    const totalSeconds = task.pomodoroMinutes * 60;
    setTimerState({
      isActive: true,
      isPaused: false,
      isBreak: false,
      timeRemaining: totalSeconds,
      totalTime: totalSeconds,
      currentTaskId: task.id,
    });

    toast({
      title: "Pomodoro started",
      description: `Focus for ${task.pomodoroMinutes} minutes on: ${task.title}`,
    });
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      )
    );
  };

  const handleTimerComplete = () => {
    if (timerState.isBreak) {
      setTimerState({
        isActive: false,
        isPaused: false,
        isBreak: false,
        timeRemaining: 0,
        totalTime: 0,
      });

      toast({
        title: "Break complete!",
        description: "Ready to start your next task?",
      });
    } else {
      if (timerState.currentTaskId) {
        const completedTask = tasks.find(
          (t) => t.id === timerState.currentTaskId
        );
        toggleTask(timerState.currentTaskId);

        if (completedTask && completedTask.breakMinutes > 0) {
          const breakSeconds = completedTask.breakMinutes * 60;
          setTimerState({
            isActive: true,
            isPaused: false,
            isBreak: true,
            timeRemaining: breakSeconds,
            totalTime: breakSeconds,
          });

          toast({
            title: "Pomodoro complete! 🎉",
            description: `Take a ${completedTask.breakMinutes}-minute break.`,
          });
        } else {
          setTimerState({
            isActive: false,
            isPaused: false,
            isBreak: false,
            timeRemaining: 0,
            totalTime: 0,
          });

          toast({
            title: "Task complete! 🎉",
            description: "Great work! Ready for your next task?",
          });
        }
      }
    }
  };

  const togglePause = () => {
    setTimerState({ ...timerState, isPaused: !timerState.isPaused });
  };

  const resetTimer = () => {
    setTimerState({
      isActive: false,
      isPaused: false,
      isBreak: false,
      timeRemaining: 0,
      totalTime: 0,
    });

    toast({
      title: "Timer reset",
      description: "You can start a new Pomodoro session anytime.",
    });
  };

  const subjectTasks = tasks.filter((t) => t.subjectId === selectedSubject?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-sky-500">
              Study Tracker
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Organize your studies with Study Tracker
          </p>
        </header>

        {/* Timer Section */}
        {timerState.isActive && (
          <PomodoroProgressBar
            timerState={timerState}
            onTimerComplete={handleTimerComplete}
            onTogglePause={togglePause}
            onReset={resetTimer}
          />
        )}

        {/* Main Content */}
        {!selectedSubject ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Subjects</h2>
              {/* changed to sky-400 */}
              <Button
                onClick={() => setShowSubjectDialog(true)}
                className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Subject
              </Button>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-12 border border-border shadow-medium">
                  <Timer className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No subjects yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first subject to start tracking your study
                    sessions
                  </p>
                  {/* changed to sky-400 */}
                  <Button
                    onClick={() => setShowSubjectDialog(true)}
                    size="lg"
                    className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create First Subject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={setSelectedSubject}
                    onDelete={deleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {/* ghost -> tinted sky */}
              <Button
                variant="ghost"
                onClick={() => setSelectedSubject(null)}
                className="gap-2 text-sky-600 hover:bg-sky-50"
              >
                <ArrowLeft className="h-4 w-4 text-sky-600" />
                Back to Subjects
              </Button>
              {/* changed to sky-400 */}
              <Button
                onClick={() => setShowTaskDialog(true)}
                className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm rounded-xl p-6 border border-border shadow-medium">
              <h2 className="text-3xl font-bold mb-2">
                {selectedSubject.title}
              </h2>
              <p className="text-muted-foreground">
                {selectedSubject.description}
              </p>
            </div>

            <TaskList
              tasks={subjectTasks}
              onStartTask={startTask}
              onToggleTask={toggleTask}
            />
          </div>
        )}

        {/* Dialogs */}
        <CreateSubjectDialog
          open={showSubjectDialog}
          onOpenChange={setShowSubjectDialog}
          onSubmit={createSubject}
        />
        <CreateTaskDialog
          open={showTaskDialog}
          onOpenChange={setShowTaskDialog}
          onSubmit={createTask}
        />
      </div>
    </div>
  );
};

export default Page;
