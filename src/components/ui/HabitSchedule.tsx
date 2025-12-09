"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Timer, Calendar, Loader2 } from "lucide-react";
import SubjectCard from "@/components/ui/SubjectCard";
import TaskList from "@/components/ui/TaskList";
import PomodoroProgressBar from "@/components/ui/PomodoroProgressBar";
import CreateSubjectDialog from "@/components/ui/CreateSubjectDialog";
import CreateTaskDialog from "@/components/ui/CreateTaskDialog";
import UpdateTaskDialog from "./UpdateTaskDialog";
import UpdateSubjectDialog from "@/components/ui/UpdateSubjectDialog";
import { useSubjects } from "@/hooks/useSubject";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "@/hooks/use-toast";
import type { Subject, Task } from "@/types/schedule";
import ScheduleCalendar from "./ScheduleCalender";

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
    updateSubject,
  } = useSubjects();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasks(selectedSubject?.id || null);

  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showUpdateTaskDialog, setUpdateTaskDialog] = useState(false);
  const [taskSelected, setTaskSeleceted] = useState<Task | null>(null);

  const [completableTaskId, setCompletableTaskId] = useState<string | null>(
    null
  );
  const [showUpdateSubjectDialog, setShowUpdateSubjectDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isBreak: false,
    timeRemaining: 0,
    totalTime: 0,
  });

  const [calendarDate, setCalendarDate] = useState<Date | undefined>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  // ===== SUBJECT HANDLERS =====
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject.",
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
      if (selectedSubject?.id === id) setSelectedSubject(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete subject.",
        variant: "destructive",
      });
    }
  };

  const openUpdateSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowUpdateSubjectDialog(true);
  };

  const handleUpdateSubject = async (payload: {
    id: string;
    title: string;
    description: string;
    scheduledDate?: Date;
  }) => {
    try {
      await updateSubject(
        payload.id,
        payload.title,
        payload.description,
        payload.scheduledDate ?? null
      );
      toast({
        title: "Subject updated",
        description: `${payload.title} has been updated.`,
      });
      setShowUpdateSubjectDialog(false);

      if (selectedSubject?.id === payload.id) {
        setSelectedSubject((prev) =>
          prev
            ? {
                ...prev,
                title: payload.title,
                description: payload.description,
                scheduledDate: payload.scheduledDate ?? null,
              }
            : prev
        );
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update subject.",
        variant: "destructive",
      });
    }
  };

  // ===== TASK HANDLERS =====
  const handleCreateTask = async (
    title: string,
    pomodoroMinutes: number,
    breakMinutes: number
  ) => {
    if (!selectedSubject) return;
    try {
      await createTask(
        selectedSubject.id,
        title,
        pomodoroMinutes,
        breakMinutes
      );
      toast({ title: "Task created", description: `${title} added.` });
      setShowTaskDialog(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = (taskUpdate: Task) => {
    updateTask(taskUpdate);
    setUpdateTaskDialog(false);
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

  const editTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskSeleceted(task);
      setUpdateTaskDialog(true);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await toggleTask(taskId, task.completed);
    setCompletableTaskId(null);
  };

  // ===== TIMER HANDLER (With setTimeout fix) =====
  const handleTimerComplete = () => {
    setTimeout(() => {
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
          description: "Ready for next task.",
        });
      } else if (timerState.currentTaskId) {
        setCompletableTaskId(timerState.currentTaskId);
        const task = tasks.find((t) => t.id === timerState.currentTaskId);
        if (task && task.breakMinutes > 0) {
          setTimerState({
            isActive: true,
            isPaused: false,
            isBreak: true,
            timeRemaining: task.breakMinutes * 60,
            totalTime: task.breakMinutes * 60,
          });
          toast({
            title: "Pomodoro complete!",
            description: `Time for a ${task.breakMinutes}-minute break.`,
          });
        } else {
          setTimerState({
            isActive: false,
            isPaused: false,
            isBreak: false,
            timeRemaining: 0,
            totalTime: 0,
          });
          toast({ title: "Task complete!", description: "Great work!" });
        }
      }
    }, 0);
  };

  const togglePause = () =>
    setTimerState({ ...timerState, isPaused: !timerState.isPaused });
  const resetTimer = () =>
    setTimerState({
      isActive: false,
      isPaused: false,
      isBreak: false,
      timeRemaining: 0,
      totalTime: 0,
    });

  if (subjectsLoading || tasksLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
      </div>
    );

  const subjectTasks = tasks.filter((t) => t.subjectId === selectedSubject?.id);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header Responsive */}
      <header className="bg-white border-b sticky top-0 z-10 transition-all duration-200 px-4 py-4 md:px-6 md:py-8 mb-6 md:mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Bagian Kiri: Back Button + Icon + Judul */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-sky-500" />
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                Habit Scheduling
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Timer */}
        {timerState.isActive && (
          <PomodoroProgressBar
            timerState={timerState}
            onTimerComplete={handleTimerComplete}
            onTogglePause={togglePause}
            onReset={resetTimer}
          />
        )}

        {!selectedSubject ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Subjects List */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Subjects</h2>
                <Button
                  onClick={() => setShowSubjectDialog(true)}
                  className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" /> New Subject
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
                      <Plus className="mr-2 h-5 w-5" /> Create First Subject
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
                      onEdit={openUpdateSubject}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Calendar */}
            <div className="lg:w-96 w-full flex justify-center h-fit">
              <ScheduleCalendar
                subjects={subjects}
                tasks={tasks}
                selectedDate={calendarDate}
                onDateSelect={setCalendarDate}
                onSelectSubject={setSelectedSubject}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedSubject(null)}
                className="gap-2 text-sky-600 hover:bg-sky-50"
              >
                <ArrowLeft className="h-4 w-4 text-sky-600" /> Back to Subjects
              </Button>
              <Button
                onClick={() => setShowTaskDialog(true)}
                className="bg-sky-400 hover:bg-sky-500 text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" /> New Task
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
              completableTaskId={completableTaskId}
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
        <UpdateSubjectDialog
          open={showUpdateSubjectDialog}
          onOpenChange={setShowUpdateSubjectDialog}
          subject={editingSubject}
          onSubmit={handleUpdateSubject}
        />
      </div>
    </div>
  );
};

export default Page;
