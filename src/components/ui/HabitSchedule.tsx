"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Timer } from "lucide-react";
import SubjectCard from "@/components/ui/SubjectCard";
import TaskList from "@/components/ui/TaskList";
import PomodoroProgressBar from "@/components/ui/PomodoroProgressBar";
import CreateSubjectDialog from "@/components/ui/CreateSubjectDialog";
import CreateTaskDialog from "@/components/ui/CreateTaskDialog";
import UpdateTaskDialog from "./UpdateTaskDialog";
import { useSubjects } from "@/hooks/useSubject";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "@/hooks/use-toast";
import type { Subject, Task } from "@/types/schedule";

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  timeRemaining: number;
  totalTime: number;
  currentTaskId?: string;
}

const Page = () => {
  const router = useRouter();
  const {
    subjects,
    loading: subjectsLoading,
    createSubject,
    deleteSubject,
  } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
  } = useTasks(selectedSubject?.id || null);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showUpdateTaskDialog, setUpdateTaskDialog] = useState(false)
  const [taskSelected, setTaskSeleceted] = useState<Task|null> (null)
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
  });

  // Redirect ke login jika belum login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleCreateSubject = async (
    title: string,
    description: string,
    scheduledDate?: Date
  ) => {
    try {
      await createSubject(title, description, scheduledDate || null);
      toast({
        title: "Subject created",
        description: scheduledDate
          ? `${title} scheduled for ${scheduledDate.toLocaleDateString()}`
          : `${title} has been added to your schedule.`,
      });
      setShowSubjectDialog(false);
    } catch (error) {
      console.error("Error creating subject:", error);
      toast({
        title: "Error",
        description: "Failed to create subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      toast({
        title: "Subject deleted",
        description: "The subject and its tasks have been removed.",
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (
    title: string,
    pomodoroMinutes: number,
    breakMinutes: number
  ) => {
    if (!auth.currentUser) {
      toast({ title: "Error", description: "User not logged in" });
      return;
    }
    try {
      await createTask(
        selectedSubject!.id,
        title,
        pomodoroMinutes,
        breakMinutes
      );
      toast({
        title: "Task created",
        description: `${title} with ${pomodoroMinutes}min Pomodoro and ${breakMinutes}min break has been added.`,
      });
      setShowTaskDialog(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = (taskUpdate: Task) => {
      updateTask(taskUpdate)
      setUpdateTaskDialog(false)
  }

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

  const editTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
    setTaskSeleceted(task)
    setUpdateTaskDialog(true)
    }

    
  }


 
  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await toggleTask(taskId, task.completed);
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
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

  if (subjectsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const subjectTasks = tasks.filter((t) => t.subjectId === selectedSubject?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-sky-500">
              Habit Scheduling
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Organize your studies with Habit Scheduling
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
                {subjects.map((subject: Subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={setSelectedSubject}
                    onDelete={handleDeleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedSubject(null)}
                className="gap-2 text-sky-600 hover:bg-sky-50"
              >
                <ArrowLeft className="h-4 w-4 text-sky-600" />
                Back to Subjects
              </Button>
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
              onToggleTask={handleToggleTask}
              onDeleteTask={deleteTask}
              onEditTask={editTask}
            />
          </div>
        )}

        {/* Dialogs */}
        <CreateSubjectDialog
          open={showSubjectDialog}
          onOpenChange={setShowSubjectDialog}
          onSubmit={handleCreateSubject}
        />
        <CreateTaskDialog
          open={showTaskDialog}
          onOpenChange={setShowTaskDialog}
          onSubmit={handleCreateTask}
        />
        {taskSelected && (
  <UpdateTaskDialog
    task={taskSelected}
    open={showUpdateTaskDialog}
    onOpenChange={setUpdateTaskDialog}
    onSubmit={handleUpdateTask}
  />
)}
      </div>
    </div>
  );
};

export default Page;
