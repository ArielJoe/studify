export interface Subject {
  id: string;
  userId: string;
  title: string;
  description: string;
  scheduledDate?: Date | null;
  createdAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}
