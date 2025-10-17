import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Subject } from "@/types/schedule";
import { onAuthStateChanged } from "firebase/auth";

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setSubjects([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "subjects"),
        where("userId", "==", currentUser.uid)
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              userId: d.userId,
              title: d.title,
              description: d.description,
              scheduledDate: d.scheduledDate ? d.scheduledDate.toDate() : null,
              createdAt: d.createdAt?.toDate() || new Date(),
            } as Subject;
          });
          setSubjects(data);
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
  }, []);

  const createSubject = async (
    title: string,
    description: string,
    scheduledDate?: Date | null
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    await addDoc(collection(db, "subjects"), {
      userId: currentUser.uid,
      title,
      description,
      scheduledDate: scheduledDate || null,
      createdAt: serverTimestamp(),
    });
  };

  const deleteSubject = async (id: string) => {
    await deleteDoc(doc(db, "subjects", id));
  };

  return { subjects, loading, createSubject, deleteSubject };
};
