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
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Task } from "@/types/schedule";

export const useTasks = (subjectId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================================
  // 🔥 MODE 1: subjectId === null → GET ALL TASKS
  // =========================================
  useEffect(() => {
    if (subjectId !== null) return; // skip jika sedang filter subject

    const loadAllTasks = async () => {
      const taskSnapshots = await getDocs(collection(db, "tasks"));
      const allTasks = taskSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      setTasks(allTasks);
      setLoading(false);
    };

    loadAllTasks();
  }, [subjectId]);

  // =========================================
  // 🔥 MODE 2: subjectId !== null → REALTIME LISTENER
  // =========================================
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser || !subjectId) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", currentUser.uid),
      where("subjectId", "==", subjectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

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

  const updateTask = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), {
      title: task.title,
      pomodoroMinutes: task.pomodoroMinutes,
      breakMinutes: task.breakMinutes,
    });
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;
    await updateDoc(doc(db, "tasks", taskId), {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return { tasks, loading, createTask, updateTask, toggleTask, deleteTask };
};
