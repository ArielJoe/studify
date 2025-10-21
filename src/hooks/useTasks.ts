import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Task } from "@/types/schedule";

export const useTasks = (subjectId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !subjectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", currentUser.uid),
      where("subjectId", "==", subjectId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          userId: d.userId,
          subjectId: d.subjectId,
          title: d.title,
          pomodoroMinutes: d.pomodoroMinutes,
          breakMinutes: d.breakMinutes,
          completed: d.completed,
          completedAt: d.completedAt?.toDate() || null,
          createdAt: d.createdAt?.toDate() || new Date(),
        } as Task;
      });
      setTasks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [subjectId]);

  const createTask = async (
    subjectId: string,
    title: string,
    pomodoroMinutes: number,
    breakMinutes: number
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    await addDoc(collection(db, "tasks"), {
      userId: currentUser.uid,
      subjectId,
      title,
      pomodoroMinutes,
      breakMinutes,
      completed: false,
      createdAt: serverTimestamp(),
    });
  };

  // MASI update LOKAL STATE
   const updateTask = async (
    updates: Task
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updates.id ? { ...task, ...updates } : task
      )
    );
  };

  // MASI delete LOKAL STATE
  const deleteTask = async (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskId)
    )
  }
  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;
    await updateDoc(doc(db, "tasks", taskId), {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });
  };

  return { tasks, loading, createTask, toggleTask, updateTask, deleteTask };
};
