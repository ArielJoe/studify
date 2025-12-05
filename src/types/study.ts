export interface Subject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate?: Date | null;
  createdAt: Date;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  timeRemaining: number;
  totalTime: number;
  currentTaskId?: string | null;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId: string;
  startedAt: Date;
  completedAt?: Date | null;
  duration: number;
}
