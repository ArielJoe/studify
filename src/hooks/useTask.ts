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
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Task } from "@/types/schedule";
// Ensure path is correct
import { updateUserStreak } from "@/lib/streak";

export const useTask = (subjectId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // 1. Base Query
      let q = query(collection(db, "tasks"), where("userId", "==", user.uid));

      // 2. Add filter
      if (subjectId) {
        q = query(q, where("subjectId", "==", subjectId));
      }

      // 3. Real-time Listener
      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const loadedTasks = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              userId: d.userId,
              subjectId: d.subjectId,
              title: d.title,
              pomodoroMinutes: d.pomodoroMinutes,
              breakMinutes: d.breakMinutes,
              completed: d.completed,
              // Handle Timestamp
              completedAt:
                d.completedAt instanceof Timestamp
                  ? d.completedAt.toDate()
                  : null,
              createdAt:
                d.createdAt instanceof Timestamp
                  ? d.createdAt.toDate()
                  : new Date(),
            } as Task;
          });

          // 4. Client-side Sorting
          // Sort to avoid index error
          loadedTasks.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );

          setTasks(loadedTasks);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [subjectId]);

  // CRUD

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
      completedAt: null,
    });
  };

  const updateTask = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      title: task.title,
      pomodoroMinutes: task.pomodoroMinutes,
      breakMinutes: task.breakMinutes,
    });
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newCompleted = !currentCompleted;

    // 1. Update Task
    await updateDoc(doc(db, "tasks", taskId), {
      completed: newCompleted,
      // Save completion time
      completedAt: newCompleted ? serverTimestamp() : null,
    });

    // 2. Streak Integration
    // Update streak on completion
    if (newCompleted) {
      try {
        await updateUserStreak(currentUser.uid);
      } catch (error) {
        console.error("Failed to update streak:", error);
      }
    }
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return { tasks, loading, createTask, updateTask, toggleTask, deleteTask };
};
